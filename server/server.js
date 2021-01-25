const express = require("express");
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser');
const AppPort = 3002;
const cors = require('cors');
const mysqlDB = require("./mysql-db");  //db 연결
const shortid = require ('shortid'); // unique id 생성
const path = require('path');

app.use(cors());
app.use(bodyParser.json());

/************************************ 화상채팅용 코드 시작 ************************************/

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/meeting', express.static(path.join(__dirname, 'public')));

app.get('/meeting', (req, res) => {
  res.render('room', { roomId: req.query.meet_id, userId: req.query.user_id, userName: req.query.user_name })
})

let rooms = {};
let chatArray=[];   //(name: content) 담을 배열
let contentArray=[];  //content 담을 배열

io.on('connection', socket => {

  let room, id, name, chat

  socket.on('joinRoom', (roomId, userId, userName) => {

    room = roomId
    id = userId
    name = userName

    if (rooms.hasOwnProperty(room)==false) {
      rooms[room] = {}
      rooms[room].num = 0
      rooms[room].members = []
    }

    rooms[room].num++
    rooms[room].members.push(name)

    socket.join(room)
    socket.to(room).broadcast.emit('userConnected', id)
    //console.log(rooms)
  })

  socket.on('message', (message) => {
    chat = `${name}: ${message}`;
    contentArray.push(message);
    chatArray.push(chat);
    io.to(room).emit('creatMessage', message, name)
  })

  socket.on('disconnect', () => {
    socket.to(room).broadcast.emit('userDisconnected', id)
    rooms[room].num--
    rooms[room].members.pop(rooms[room].members.indexOf(name),1)
    if(rooms[room].num == 0){
      delete rooms[room]

      //array DB에 insert
      var contentInput = contentArray.toString();
      var chatInput = chatArray.toString();

      var sql = 'INSERT INTO  MEETSCRIPT VALUE(?, ?, ?)';
      mysqlDB.query(sql, [room, chatInput, contentInput], function(err, results){
        if(err) console.log(err);
        else console.log('success input db');
      });
    }
    //console.log(rooms)
  })
})

/************************************ 화상채팅용 코드 끝 ************************************/

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
      if(!results[0]) return res.send({code:31, msg:"forwardmeet not exists"});
      else return res.send({code:0, msg:"request success", lists:results});
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


server.listen(AppPort, function () {
  console.log(`Example app listening on port ${AppPort}!`);
});