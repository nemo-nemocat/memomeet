const express = require("express");
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser');
const AppPort = process.env.PORT || 3002;
const cors = require('cors');
const mysqlDB = require("./mysql-db");  //db 연결
const shortid = require ('shortid'); // unique id 생성
const path = require('path');
//const PythonShell = require('python-shell'); // python script 실행

app.use(cors());
app.use(bodyParser.json());

if (process.env.NODE_ENV == 'production') {
  // 정적 파일 제공
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // 라우트 설정
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

/************************************ 화상채팅용 코드 시작 ************************************/

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../client/meetingroom_views'))
app.use('/meeting', express.static(path.join(__dirname, '../client/meetingroom_public')));

app.get('/meeting', (req, res) => {
  res.render('room', { roomId: req.query.meet_id, userId: req.query.user_id, userName: req.query.user_name })
})

let rooms = {};

io.on('connection', socket => {

  let room, id, name, chat

  socket.on('joinRoom', (roomId, userId, userName) => {

    room = roomId
    id = userId
    name = userName

    if (rooms.hasOwnProperty(room)==false) {
      rooms[room] = {}
      rooms[room].members = []
      rooms[room].num = rooms[room].members.length
      rooms[room].chatArray = [];   //(name: content) 담을 배열
      rooms[room].contentArray = [];  //content 담을 배열
    }

    rooms[room].members.push(name)
    rooms[room].num = rooms[room].members.length

    socket.join(room)
    socket.to(room).broadcast.emit('userConnected', id)
    io.to(room).emit('updateChat', {type: 'system', name: '[SYSTEM]', message: name + '님 입장'}) // room 안의 모두에게
    io.to(room).emit('updateMembers', {num: rooms[room].num, members: rooms[room].members}) // room 안의 모두에게
    console.log(rooms)
  })

  socket.on('message', (data) => {

    data.name = name
    if(data.type == 'mymessage') {
      socket.emit('updateChat', data) // 나에게만
    }
    else{
      chat = `${name}: ${data.message}`;
      rooms[room].contentArray.push(data.message);
      rooms[room].chatArray.push(chat);

      socket.to(room).broadcast.emit('updateChat', data) // room 안의 나를 제외한 모두에게
    }
  })

  socket.on('disconnect', () => {
    rooms[room].members.splice(rooms[room].members.indexOf(name),1)
    rooms[room].num = rooms[room].members.length

    if(rooms[room].num == 0){
      //meetScript DB INPUT
      var contentInput = rooms[room].contentArray.toString();
      var chatInput = rooms[room].chatArray.toString();

      var sql = 'INSERT INTO  MEETSCRIPT VALUE(?, ?, ?)';
      mysqlDB.query(sql, [room, chatInput, contentInput], function(err, results){
        if(err) console.log(err);
        else console.log('success input meetscript');
      });

      //finishedmeet DB INPUT
      var summary = "summary 예시입니당~~~~~~~~"
      sql = 'INSERT INTO FINISHEDMEET VALUE(?, ?)';
      mysqlDB.query(sql, [room, summary], function(err, results){
        if(err) console.log(err);
        else console.log('success input finishedmeet');
      });

      //taglist DB INPUT
      var tag1 = '예시태그1';
      var tag2 = '예시태그2';
      var tag3 = '예시태그3';
      sql = `INSERT INTO TAGLIST VALUES('${room}', ?), ('${room}', ?), ('${room}', ?)`;
      mysqlDB.query(sql, [tag1, tag2, tag3], function(err, results){
        if(err) console.log(err);
        else console.log('success input taglist');
      });

      //scheduled meet 에서 삭제
      sql = 'UPDATE FORWARDMEET SET ISFINISH = 1 WHERE MEET_ID=?';
      mysqlDB.query(sql, room, function(err, results){
        if(err) console.log(err);
        else console.log('success delete scheduled meet');
      });

      delete rooms[room]
    }

    else{
      socket.to(room).broadcast.emit('userDisconnected', id)
      io.to(room).emit('updateChat', {type: 'system', name: '[SYSTEM]', message: name + '님 퇴장'}) // room 안의 모두에게
      io.to(room).emit('updateMembers', {num: rooms[room].num, members: rooms[room].members}) // room 안의 모두에게
    }
    console.log(rooms)
  })
})

/************************************ Python 스크립트 실행 code ************************************/

app.get('/keywordrank', function(req, res){
  var meet_id="test"
  var sql = 'SELECT content FROM MEETSCRIPT WHERE meet_id=?';
  mysqlDB.query(sql, meet_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});

    else{
      var options ={
        mode: "text",
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: results[0].content
      }
  
      PythonShell.PythonShell.run('keywordrank.py', options, function (err, results) {
        if (err) throw err;
        console.log('results: %j', results);
      });
    } 
  });
})


/************************************ Web server code ************************************/

//login 요청
app.post('/auth-login', function(req, res) {
  var id = req.body.user_id;
  var pw = req.body.user_pw;
  var sql = 'SELECT * FROM USERLIST WHERE user_id=?';
  mysqlDB.query(sql, [id], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});

    if(!results[0]){
      return res.send({code:1, msg:"auth fail: id not exist"});
    }

    var user = results[0];
    if(user.user_pw === pw) {
      return res.send({code:0, msg:"request success", user_id:user.user_id, user_name:user.user_name});
    }
    else{
      return res.send({code:2, msg:"auth fail:wrong password"});
    }
  });
}
);

//회원가입 요청
app.post('/auth-signup', function(req, res){
  console.log(req.body.user_id);
  var id = req.body.user_id;
  var pw = req.body.user_pw;
  var name = req.body.user_name;
  var email = req.body.user_email;
  var sql = 'INSERT INTO USERLIST(user_id, user_pw, user_name, user_email) VALUE(?, ?, ?, ?)';
  mysqlDB.query(sql, [id, pw, name, email], function(err, results){
      if(err){
        return res.send({code:3, msg:"auth fail: id already exists"});
      }
      else return res.send({code:0, msg:"request success"});
  });
});

//그룹 만들기
app.post('/group-create', function(req,res){
  var group_name = req.body.group_name;
  var group_pw = req.body.group_pw;
  var group_id = shortid.generate();  //유니크 키 값 생성
  var user_id = req.body.user_id;
  var sql = 'INSERT INTO GROUPLIST(group_id, group_pw, group_name) VALUE(?, ?, ?)';
  mysqlDB.query(sql, [group_id, group_pw, group_name], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      sql = 'INSERT INTO MEMBERLIST(group_id, user_id) VALUE(?, ?)';
      mysqlDB.query(sql, [group_id, user_id], function(err, results){
        if(err) return res.send({code:12, msg:`${err}`});
        else return res.send({code:0, msg:"request success"});
      });
    }
  });
});

//사용자가 속한 그룹 리스트 출력
app.post('/group-show', function(req, res){
  var user_id = req.body.user_id;
  var sql = "SELECT * FROM GROUPLIST WHERE GROUP_ID IN (SELECT GROUP_ID FROM MEMBERLIST WHERE USER_ID=?) ORDER BY GROUP_NAME";
  mysqlDB.query(sql, user_id, function(err, results){
    if(err)  return res.send({code:11, msg:`${err}`});
    else{
      return res.send({code:0, msg:"request success", grouplist: results});
    }
  });
});

//그룹 검색
app.post('/group-search', function(req, res){
  var group_id = req.body.group_id;
  var sql = "SELECT * FROM GROUPLIST WHERE GROUP_ID=?";
  mysqlDB.query(sql, group_id, function(err,results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]){
        return res.send({code:21, msg:"group fail: group_id not exist"});
      }
      else{
        return res.send({code:0, msg:"request success", grouplist: results[0]});
      }
    }
  });
});

//그룹 참가
app.post('/group-enter', function(req, res){
  var group_id = req.body.group_id;
  var group_pw = req.body.group_pw;
  var user_id = req.body.user_id;
  var sql = 'SELECT * FROM GROUPLIST WHERE GROUP_ID=? AND GROUP_PW=?';
  mysqlDB.query(sql, [group_id, group_pw], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]){
        return res.send({code:22, msg:"group fail: group_pw incorrect"});
      }
      else{
        sql = 'SELECT * FROM MEMBERLIST WHERE GROUP_ID=? and USER_ID=?';
        mysqlDB.query(sql, [group_id, user_id], function(err, results2){
          if(err) return res.send({code:11, msg:`${err}`})
          else{
            if(results2[0])
              return res.send({code:23, msg:"group fail: already user in group"});
            else{
              sql = 'INSERT INTO MEMBERLIST(group_id, user_id) VALUE(?, ?)';
              mysqlDB.query(sql, [group_id, user_id], function(err,results3){
              if(err) return res.send({code:11, msg:`${err}`});
              else{
                return res.send({code:0, msg:"request success"});
              } 
            });
          }
        }
        });
      }
    }
  });
});

//그룹 나가기
app.post('/group-out', function(req, res){
  var group_id = req.body.group_id;
  var user_id = req.body.user_id;
  var sql = 'DELETE FROM MEMBERLIST WHERE GROUP_ID=? AND USER_ID=?';
  mysqlDB.query(sql, [group_id, user_id], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      sql = 'SELECT * FROM MEMBERLIST WHERE GROUP_ID=?';
      mysqlDB.query(sql, group_id, function(err, results2){
        if(err) return res.send({code:12, msg:`${err}`});
        else {
          if(!results2[0]){
            sql = 'DELETE FROM GROUPLIST WHERE GROUP_ID=?';
            mysqlDB.query(sql, group_id, function(err, results3){
              if(err) return res.send({code:13, msg:`${err}`});
              else{
                return res.send({code:0, msg:"request success"});
              } 
            });
          }
          else{
            return res.send({code:0, msg:"request success"});
          }
        }
      });
      }
  });
});

//그룹 멤버 출력
app.post('/group-memberlist', function(req, res){
  var group_id = req.body.group_id;
  var sql = 'SELECT user_name FROM USERLIST WHERE USER_ID IN (SELECT USER_ID FROM MEMBERLIST WHERE GROUP_ID=?)';
  mysqlDB.query(sql, group_id, function(err, results){
    if(err) return res.send({code:11, msq:`${err}`});
    else {
      return res.send({code:0, msg:"request success", members: results});
    }
  });
});

//회의 예약 하기
app.post('/forwardmeet-create', function(req,res){
  var group_id = req.body.group_id;
  var meet_id = shortid.generate();  //유니크 키 값 생성
  var meet_title = req.body.meet_title;
  var meet_day = req.body.meet_day;
  var meet_time = req.body.meet_time;
  var sql = 'INSERT INTO FORWARDMEET VALUE(?, ?, ?, ?, ?)';
  mysqlDB.query(sql, [group_id, meet_id, meet_title, meet_day, meet_time], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      return res.send({code:0, msg:"request success"});
      }
  });
});

//예약 회의 목록
app.post('/forwardmeet-list', function(req,res){
  var group_id = req.body.group_id;
  var sql = 'SELECT * FROM FORWARDMEET WHERE GROUP_ID=? ORDER BY MEET_DAY, MEET_TIME';
  mysqlDB.query(sql, group_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]) return res.send({code:34, msg:"forwardmeet not exists"});
      else{
        var visible = [];
        results.map(result=>{
          if(result.isfinish === 0) visible.push(result);
        })
        return res.send({code:0, msg:"request success", lists:visible});
      } 
    }
  });
});

//예약 회의 삭제
app.post('/forwardmeet-delete', function(req,res){
  var meet_id = req.body.meet_id;
  var sql = 'DELETE FROM FORWARDMEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      return res.send({code:0, msg:"request success"});
    }
  })
});

//끝난 회의 목록
app.post('/finishedmeet-list', function(req,res){
  var group_id = req.body.group_id;
  var sql = 'SELECT * FROM FORWARDMEET, FINISHEDMEET WHERE GROUP_ID=? AND FORWARDMEET.MEET_ID = FINISHEDMEET.MEET_ID ORDER BY MEET_DAY, MEET_TIME';
  mysqlDB.query(sql, group_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]) return res.send({code:35, msg:"finishedmeet not exists"});
      else{
        return res.send({code:0, msg:"request success", lists:results});
      }
    }
  })
});

//회의별 태그리스트
app.post('/finishedmeet-taglist', function(req,res){
  var meet_id = req.body.meet_id;
  var sql = 'SELECT tag FROM TAGLIST WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]) return res.send({code:33, msg:"tag not exists"});
      else{
        return res.send({code:0, msg:"request success", lists:results});
      }
    }
  })
});

//끝난 회의 정보 
app.post('/finishedmeet-info', function(req,res){
  var meet_id = req.body.meet_id;
  var sql = 'SELECT * FROM FORWARDMEET, FINISHEDMEET WHERE FINISHEDMEET.MEET_ID=? AND FORWARDMEET.MEET_ID=FINISHEDMEET.MEET_ID';
  mysqlDB.query(sql, [meet_id], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]){
        return res.send({code:31, msg:"meet fail: meet_id not exist"});
      }
      else{
        return res.send({code:0, msg:"request success", data:results[0]}) 
      }
    }
  })
});

//태그 추가
app.post('/finishedmeet-addtag', function(req, res){
  var meet_id = req.body.meet_id;
  var tag = req.body.tag;
  var sql = 'SELECT COUNT(*) AS cnt FROM TAGLIST WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(results[0].cnt>4) return res.send({code:32, msq:"meet fail: tag list is full"});
      else{
        sql = 'INSERT INTO TAGLIST VALUE(?, ?)';
        mysqlDB.query(sql, [meet_id, tag], function(err, results){
          if(err) return res.send({code:11, msg:`${err}`});
          else  return res.send({code:0, msg:"request success"});
        })
      }
    }
  })
});

//태그 삭제
app.post('/finishedmeet-deletetag', function(req,res){
  var meet_id = req.body.meet_id;
  var tag = req.body.tag ;
  var sql = 'DELETE FROM TAGLIST WHERE MEET_ID=? AND TAG=?';
  mysqlDB.query(sql, [meet_id, tag], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      res.send({code:0, msg:"request success"});
    }
  })
});

//회의 chat
app.post('/finishedmeet-chat', function(req,res){
  var meet_id = req.body.meet_id;
  var sql = 'SELECT chat FROM MEETSCRIPT WHERE MEET_ID =?';
  mysqlDB.query(sql, meet_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      res.send({code:0, msg:"request success", chat:results[0].chat});
    }
  })
});


server.listen(AppPort, function () {
  console.log(`Example app listening on port ${AppPort}! as ${process.env.NODE_ENV}`);
});