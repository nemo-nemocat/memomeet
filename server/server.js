const express = require("express");
const request = require("request");
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser');
const AppPort = process.env.PORT || 3002;
const cors = require('cors');
const shortid = require('shortid'); // unique id 생성
const path = require('path');
const mysql = require("mysql");
const multer = require("multer");
const fs = require('fs');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);

app.use(cors());
app.use(bodyParser.json());

/************************************************** SSL **************************************************/

// https를 치지 않아도 자동으로 리다이렉트 시켜서 보안연결되도록
if (process.env.NODE_ENV == 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next();
    }
  });
}

/************************************************** DATABASE **************************************************/

var mysqlDB;

/* 배포 */
if (process.env.NODE_ENV == 'production') {
  var db_config = {
    host: 'us-cdbr-east-03.cleardb.com',
    port: 3306,
    user: 'b5dfcc92d33e0e',
    password: '0c8450fd',
    database: 'heroku_9c78ff95d911e67'
  };

  mysqlDB = mysql.createPool(db_config)
}

/* 개발 */
else {
  var db_config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'memomeet'
  };

  mysqlDB = mysql.createConnection(db_config);

}

/************************************************** FRONTEND **************************************************/

/* 배포 */
if (process.env.NODE_ENV == 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // 일반 페이지는 react 빌드 파일로 라우트
  app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
  app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
  app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
  app.get('/script', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

}

/************************************************** VIDEO CONFERENCE **************************************************/

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../client/meetingroom_views'))
app.use('/meeting', express.static(path.join(__dirname, '../client/meetingroom_public')));

app.get('/meeting', (req, res) => { // 회의실 페이지는 res 렌더링으로 라우트
  res.render('room', { roomId: req.query.meet_id, userId: req.query.user_id, userName: req.query.user_name })
})

let rooms = {};

io.on('connection', socket => {

  let room, id, name

  socket.on('joinRoom', (roomId, userId, userName) => {

    room = roomId
    id = userId
    name = userName

    // room에 처음 들어온 멤버라면 (room이 새로 생성됐다면) 멤버, 인원수, 채팅db 초기화
    if (rooms.hasOwnProperty(room) == false) {
      rooms[room] = {}
      rooms[room].members = []
      rooms[room].num = rooms[room].members.length
      rooms[room].chatArray = [] // (name: content) 담을 배열
      rooms[room].contentArray = [] // content 담을 배열
      rooms[room].contribution = {} // 기여도
    }

    rooms[room].members.push(name)
    rooms[room].num = rooms[room].members.length
    rooms[room].contribution[id] = 0 // 기여도 0으로 초기화

    socket.join(room)
    socket.to(room).broadcast.emit('userConnected', { id: id, name: name }) // room 안의 나를 제외한 모두에게 'userConnected' event emit
    io.to(room).emit('updateChat', { type: 'system', name: '[SYSTEM]', message: name + '님 입장' }) // room 안의 모두에게 입장메시지 전송
    io.to(room).emit('updateMembers', { num: rooms[room].num, members: rooms[room].members }) // room 안의 모두에게 멤버 업데이트
    console.log(name + ' 입장,' + ' 현재 멤버 : ' + rooms[room].members)
  })

  socket.on('message', (data) => {

    data.name = name
    if (data.type == 'mymessage') {
      socket.emit('updateChat', data) // 나에게만 메시지 업데이트
    }
    else {
      chat = `${name}: ${data.message}`;
      rooms[room].contentArray.push(data.message);
      rooms[room].chatArray.push(chat);
      rooms[room].contribution[id] += data.message.length // 내가 말하면 내 기여도 추가

      socket.to(room).broadcast.emit('updateChat', data) // room 안의 나를 제외한 모두에게 메시지 업데이트
    }
  })

  socket.on('disconnect', () => {
    console.log('1. disconnect 이벤트 발생')
    rooms[room].members = rooms[room].members.filter((item) => item!=name)
    console.log('2. 방 멤버 조정')
    rooms[room].num = rooms[room].members.length
    console.log('3. 방 인원수 조정')

    if (rooms[room].num == 0) {
      console.log(name + ' 퇴장,' + ' 분석 및 방 삭제 시작')

      //meetScript DB INPUT
      var contentInput = rooms[room].contentArray.toString();
      var chatInput = rooms[room].chatArray.toString();

      var sql = 'INSERT INTO  MEETSCRIPT VALUE(?, ?, ?)';
      mysqlDB.query(sql, [room, chatInput, contentInput], function (err, results) {
        if (err) console.log(err);
        else console.log('success input meetscript');
      });

      // 기여도 백분율로 환산
      var sum = 0
      for (var member in rooms[room].contribution) {
        if (rooms[room].contribution.hasOwnProperty(member)) {           
          sum += rooms[room].contribution[member]
        }
      }

      for (var member in rooms[room].contribution) {
        rooms[room].contribution[member] = parseInt(rooms[room].contribution[member] / sum * 100)
      }
      
      var ck = Object.keys(rooms[room].contribution).join(' ');
      var cv = Object.values(rooms[room].contribution).join(' ');
    
      console.time('time');

      // request({method: 'POST', url: flask_url, json: {"contents": contentInput}}, function (error, response, body) {

      //   console.log('flask_response:', body); // Print the data received
        
      //   body.tags.forEach(tag=>{
      //     sql = `INSERT INTO TAGLIST VALUE( ?, ?)`;
      //     mysqlDB.query(sql, [room, tag], function (err, results) {
      //     if (err) console.log(err);
      //     else 
      //       console.log('success input taglist');
      //     });
      //   })
      //   sql = 'INSERT INTO FINISHEDMEET VALUE(?, ?, ?, ?, ?)';
      //   mysqlDB.query(sql, [room, body.summary, body.wordcloud, ck, cv], function(err, results){
      //     if(err) console.log(err);
      //     else {
      //       console.log('success input finishedmeet');
      //       console.timeEnd('for');
      //     }
      //   });
        
      // });

      var msg = {'contents': contentInput, 'room': room, 'ck': ck, 'cv': cv}
      pub.publish('analysis_channel', JSON.stringify(msg));

      //scheduled meet 에서 삭제
      sql = 'UPDATE FORWARDMEET SET ISFINISH = 1 WHERE MEET_ID=?';
      mysqlDB.query(sql, room, function (err, results) {
        if (err) console.log(err);
        else console.log('success delete scheduled meet');
      });

      delete rooms[room]
    }

    else {
      socket.to(room).broadcast.emit('userDisconnected', id) // room 안의 나를 제외한 모두에게 'userDisconnected' event emit
      io.to(room).emit('updateChat', { type: 'system', name: '[SYSTEM]', message: name + '님 퇴장' }) // room 안의 모두에게 퇴장메시지 전송
      io.to(room).emit('updateMembers', { num: rooms[room].num, members: rooms[room].members }) // room 안의 모두에게 멤버 업데이트

      console.log(name + ' 퇴장,' + ' 현재 멤버 : ' + rooms[room].members)
    }
  })
})

//*********************************Redis************************************* */

const redis = require('redis');
var pub, sub

if (process.env.NODE_ENV == 'production'){
  pub = redis.createClient(process.env.REDIS_URL);
  sub = redis.createClient(process.env.REDIS_URL);
  sub.subscribe('server');
  sub.on('subscribe',function(){
    console.log("=== Redis 연결 ===");
  }) 
}

else {
  pub = redis.createClient({
    host:'localhost',
    port: 6379,
    db: 0
  })
  
  //python에서 데이터 받을 때
  sub = redis.createClient({
    host:'localhost',
    port: 6379,
    db: 0
  })
  sub.subscribe('server');
  sub.on('subscribe',function(){
    console.log("=== Redis 연결 ===");
  }) 
}

let room, ck, cv;
sub.on('message', function(channel, message){
  var msg = JSON.parse(message);
  switch(msg.type){
    case 'tags':
      console.log("[태그] "+ msg.data);
      tags = msg.data;
      inputDB(room, ck, cv);
      break;
    case 'wordcloud':
      console.log("[WC] "+ msg.data);
      wordcloud = msg.data;
      inputDB(room, ck, cv);
      break;
    case 'summary':
      console.log("[요약] "+ msg.data);
      summary = msg.data;
      inputDB(room, ck, cv);
      break;
    default:
      console.log("room, ck, cv 반환")
      room = msg.room;
      ck = msg.ck;
      cv = msg.cv;
  }
})

var tags = null, wordcloud = null, summary = null;

var inputDB = function(room, ck, cv){
  if(tags == null || wordcloud == null || summary == null) return;
  tags.forEach(tag=>{
    var sql = `INSERT INTO TAGLIST VALUE( ?, ?)`;
    mysqlDB.query(sql, [room, tag], function (err, results) {
      if (err) console.log(err);
      else 
        console.log('success input taglist');
    });
  })
  sql = 'INSERT INTO FINISHEDMEET VALUE(?, ?, ?, ?, ?)';
  mysqlDB.query(sql, [room, summary, wordcloud, ck, cv], function(err, results){
    if(err) console.log(err);
    else {
      console.log('success input finishedmeet');
      console.timeEnd('time');
    }
  });
  tags = null, wordcloud = null, summary = null;
}
app.get('/redis', (req,res)=>{
  console.log("실행중..")
  var contentInput = "그렇다면 여기서 천은미 이대목동병원 호흡기내과 교수 모시고, 아스트라제네카 백신을 맞아도 되는 근거, 보다 자세히 살펴봅니다 교수님 일단, 최근 아스트라제네카 백신을 둘러싸고, 혈전 이야기가 많이 나왔죠 유럽 일부 접종자들 에게서 혈전이 발생했다는 건데요 이 혈전이라는 게 정확히 어떤 겁니까 그러면, 혈전이 백신을 맞았을 때 생기는 증상인 건가요 생활과 굉장히 밀접한 질환인 셈인데요 앞서서도 보셨지만, 오늘 유럽의약품청에서도 아스트라제네카 백신과 혈전 반응에 연관 성이 없다고 강조했네요 현지시간으로 내일, 유럽의약품청에서 최종 결론을 내릴 텐데요 오늘 정은경 청장도 아스트라제네카 백 신 맞아도 된다, 확실하게 말했죠 우리 방역당국에서 이렇게 판단한 이유는 뭡니까 그럼 코로나 백신 말고요 다른 독감 백신 등 에서 혈전이 부작용으로 거론된 사례가 있을까요 어쨌든 이 혈전이 연령이나 생활과 굉장히 밀접한 질병이니까요 특히 다음 주부터 65세 이상 요양병원 입원자를 대상으로 아스트라제네카 백신 접종도 다시 시작되고요 관련해서 주의해야 할 점, 어떤 게 있을까요 또 코로나 백신 접종 후에 경미한 이상 반응을 호소하시는 분들도 많죠 그래서 정부도 ‘백신 휴가제’를 검토하는 상황인 데요 백신 휴가, 교수님께서는 어떻게 보십니까 현재 코로나 상황도 안 여쭤볼 수가 없죠 사흘 만에 다시 4백명 댑니다 두 달 넘게 3, 4백명 대라는 박스권에 갇혀있는 모양샌데요 현재 상황 어떻게 봐야 할까요 그래서 오늘부터, 수도권 특별방역대책도 시작됐죠 정부의 목표는 2주 뒤 하루 확진자를 2백 명 대로 줄이겠다는 건데요 가능할까요 | 그렇다면 여기서 천은미 이대목동병원  호흡기내과 교수 모시고, 아스트라제네카 백신을 맞아도 되는 근거, 보다 자세히 살펴봅니다 교수님 일단, 최근 아스트라제네카 백신을 둘러싸고, 혈전 이야기가 많이 나왔죠 유럽 일부 접종자들에게서 혈전이 발생했다는 건데요 이 혈전이라는 게 정확히 어 떤 겁니까 그러면, 혈전이 백신을 맞았을 때 생기는 증상인 건가요 생활과 굉장히 밀접한 질환인 셈인데요 앞서서도 보셨지만,  오늘 유럽의약품청에서도 아스트라제네카 백신과 혈전 반응에 연관성이 없다고 강조했네요 현지시간으로 내일, 유럽의약품청에서 최종 결론을 내릴 텐데요 오늘 정은경 청장도 아스트라제네카 백신 맞아도 된다, 확실하게 말했죠 우리 방역당국에서 이렇게 판단한 이유는 뭡니까 그럼 코로나 백신 말고요 다른 독감 백신 등에서 혈전이 부작용으로 거론된 사례가 있을까요 어쨌든 이 혈전이 연령이나 생활과 굉장히 밀접한 질병이니까요 특히 다음 주부터 65세 이상 요양병원 입원자를 대상으로 아스트라제네카 백신 접종도 다시 시작되고요 관련해서 주의해야 할 점, 어떤 게 있을까요 또 코로나 백신 접종 후에 경미한 이상 반응을 호소하시는 분들도 많죠 그래서 정부도 ‘백신 휴가제’를 검토하는 상황인데요 백신 휴가, 교수님께서는 어떻게 보십니까 현재 코로나 상황도 안 여쭤볼 수가 없죠 사흘 만에 다시 4백명 댑니다 두 달 넘게 3, 4백명 대라는 박스권에 갇혀있는 모양샌데요 현재 상황 어 떻게 봐야 할까요 그래서 오늘부터, 수도권 특별방역대책도 시작됐죠 정부의 목표는 2주 뒤 하루 확진자를 2백 명 대로 줄이겠다는 건데요 가능할까요"
  var room = "_8PMNN4I1"
  var ck = "유효민"
  var cv = "100"
  var msg = {'contents': contentInput, 'room': room, 'ck': ck, 'cv': cv}
  pub.publish('analysis_channel', JSON.stringify(msg));
})

/************************************ Web server code ************************************/

// 프로필 사진 저장 : 개발 시에는 public폴더, 배포 시에는 build폴더 사용 
img_folder = '../client/public/uploads/'
if (process.env.NODE_ENV == 'production') img_folder = '../client/build/uploads/'

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, img_folder);
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    }
  }),
});

//프로필 변경 및 업로드
app.post('/profile-upload', upload.single('profile'), (req, res) => {
  var id = req.body.user_id;
  var profile_url = "/uploads/" + req.file.filename;
  var sql = 'SELECT profile_url FROM USERLIST WHERE USER_ID=?';
  mysqlDB.query(sql, id, function (err, results) {
    if (err) {
      return res.send({ code: 3, msg: `${err}` });
    }
    else {
      var result = results[0].profile_url;
      //이전 파일 삭제
      if (result != null && result !== '') {
        var filename = result.substring(9, result.length);
        fs.unlink(img_folder + filename, function (err) {
          if (err) console.log('파일 삭제 에러:' + err);
        })
      }
      sql = 'UPDATE USERLIST SET PROFILE_URL=? WHERE USER_ID=?';
      mysqlDB.query(sql, [profile_url, id], function (err, results) {
        if (err) {
          return res.send({ code: 3, msg: `${err}` });
        }
        else return res.send({ code: 0, msg: "request success", profile_url: profile_url });
      });
    }
  });
});

//프로필 삭제 & 기본 이미지로 변경
app.post('/profile-remove', (req, res) => {
  var id = req.body.user_id;
  var sql = 'SELECT profile_url FROM USERLIST WHERE USER_ID=?';
  mysqlDB.query(sql, id, function (err, results) {
    if (err) {
      return res.send({ code: 3, msg: `${err}` });
    }
    else {
      var result = results[0].profile_url;
      //이전 파일 삭제
      if (result != null && result !== '') {
        var filename = result.substring(9, result.length);
        fs.unlink(img_folder + filename, function (err) {
          if (err) console.log('파일 삭제 에러:' + err);
        })
      }
      sql = 'UPDATE USERLIST SET PROFILE_URL=? WHERE USER_ID=?';
      mysqlDB.query(sql, ['', id], function (err, results) {
        if (err) {
          return res.send({ code: 3, msg: `${err}` });
        }
        else return res.send({ code: 0, msg: "request success" });
      });
    }
  });

})

//login 요청
app.post('/auth-login', function (req, res) {
  var id = req.body.user_id;
  var pw = req.body.user_pw;
  var sql = 'SELECT * FROM USERLIST WHERE user_id=?';
  mysqlDB.query(sql, [id], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });

    if (!results[0]) {
      return res.send({ code: 1, msg: "auth fail: id not exist" });
    }

    var user = results[0];
    if (user.user_pw === pw) {
      return res.send({ code: 0, msg: "request success", user_id: user.user_id, user_name: user.user_name, profile_url: user.profile_url });
    }
    else {
      return res.send({ code: 2, msg: "auth fail:wrong password" });
    }
  });
}
);

//회원가입 요청
app.post('/auth-signup', function (req, res) {
  var id = req.body.user_id;
  var pw = req.body.user_pw;
  var name = req.body.user_name;
  var email = req.body.user_email;
  var sql = 'INSERT INTO USERLIST(user_id, user_pw, user_name, user_email) VALUE(?, ?, ?, ?)';
  mysqlDB.query(sql, [id, pw, name, email], function (err, results) {
    if (err) {
      return res.send({ code: 3, msg: `${err}` });
    }
    else return res.send({ code: 0, msg: "request success" });
  });
});

//그룹 만들기
app.post('/group-create', function (req, res) {
  var group_name = req.body.group_name;
  var group_pw = req.body.group_pw;
  var group_id = shortid.generate();  //유니크 키 값 생성
  var user_id = req.body.user_id;
  var sql = 'INSERT INTO GROUPLIST(group_id, group_pw, group_name) VALUE(?, ?, ?)';
  mysqlDB.query(sql, [group_id, group_pw, group_name], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      sql = 'INSERT INTO MEMBERLIST(group_id, user_id) VALUE(?, ?)';
      mysqlDB.query(sql, [group_id, user_id], function (err, results) {
        if (err) return res.send({ code: 12, msg: `${err}` });
        else return res.send({ code: 0, msg: "request success" });
      });
    }
  });
});

//사용자가 속한 그룹 리스트 출력
app.post('/group-show', function (req, res) {
  var user_id = req.body.user_id;
  var sql = "SELECT * FROM GROUPLIST WHERE GROUP_ID IN (SELECT GROUP_ID FROM MEMBERLIST WHERE USER_ID=?) ORDER BY GROUP_NAME";
  mysqlDB.query(sql, user_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      return res.send({ code: 0, msg: "request success", grouplist: results });
    }
  });
});

//그룹 검색
app.post('/group-search', function (req, res) {
  var group_id = req.body.group_id;
  var sql = "SELECT * FROM GROUPLIST WHERE GROUP_ID=?";
  mysqlDB.query(sql, group_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      if (!results[0]) {
        return res.send({ code: 21, msg: "group fail: group_id not exist" });
      }
      else {
        return res.send({ code: 0, msg: "request success", grouplist: results[0] });
      }
    }
  });
});

//그룹 참가
app.post('/group-enter', function (req, res) {
  var group_id = req.body.group_id;
  var group_pw = req.body.group_pw;
  var user_id = req.body.user_id;
  var sql = 'SELECT * FROM GROUPLIST WHERE GROUP_ID=? AND GROUP_PW=?';
  mysqlDB.query(sql, [group_id, group_pw], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      if (!results[0]) {
        return res.send({ code: 22, msg: "group fail: group_pw incorrect" });
      }
      else {
        sql = 'SELECT * FROM MEMBERLIST WHERE GROUP_ID=? and USER_ID=?';
        mysqlDB.query(sql, [group_id, user_id], function (err, results2) {
          if (err) return res.send({ code: 11, msg: `${err}` })
          else {
            if (results2[0])
              return res.send({ code: 23, msg: "group fail: already user in group" });
            else {
              sql = 'INSERT INTO MEMBERLIST(group_id, user_id) VALUE(?, ?)';
              mysqlDB.query(sql, [group_id, user_id], function (err, results3) {
                if (err) return res.send({ code: 11, msg: `${err}` });
                else {
                  return res.send({ code: 0, msg: "request success" });
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
app.post('/group-out', function (req, res) {
  var group_id = req.body.group_id;
  var user_id = req.body.user_id;
  var sql = 'DELETE FROM MEMBERLIST WHERE GROUP_ID=? AND USER_ID=?';
  mysqlDB.query(sql, [group_id, user_id], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      sql = 'SELECT * FROM MEMBERLIST WHERE GROUP_ID=?';
      mysqlDB.query(sql, group_id, function (err, results2) {
        if (err) return res.send({ code: 12, msg: `${err}` });
        else {
          if (!results2[0]) {
            sql = 'DELETE FROM GROUPLIST WHERE GROUP_ID=?';
            mysqlDB.query(sql, group_id, function (err, results3) {
              if (err) return res.send({ code: 13, msg: `${err}` });
              else {
                return res.send({ code: 0, msg: "request success" });
              }
            });
          }
          else {
            return res.send({ code: 0, msg: "request success" });
          }
        }
      });
    }
  });
});

//그룹 멤버 출력
app.post('/group-memberlist', function (req, res) {
  var group_id = req.body.group_id;
  var sql = 'SELECT user_name FROM USERLIST WHERE USER_ID IN (SELECT USER_ID FROM MEMBERLIST WHERE GROUP_ID=?)';
  mysqlDB.query(sql, group_id, function (err, results) {
    if (err) return res.send({ code: 11, msq: `${err}` });
    else {
      return res.send({ code: 0, msg: "request success", members: results });
    }
  });
});

//회의 예약 하기
app.post('/forwardmeet-create', function (req, res) {
  var group_id = req.body.group_id;
  var meet_id = shortid.generate();  //유니크 키 값 생성
  var meet_title = req.body.meet_title;
  var meet_day = req.body.meet_day;
  var meet_time = req.body.meet_time;
  var sql = 'INSERT INTO FORWARDMEET VALUE(?, ?, ?, ?, ?, 0)';
  mysqlDB.query(sql, [group_id, meet_id, meet_title, meet_day, meet_time], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      return res.send({ code: 0, msg: "request success" });
    }
  });
});

//예약 회의 목록
app.post('/forwardmeet-list', function (req, res) {
  var group_id = req.body.group_id;
  var sql = 'SELECT * FROM FORWARDMEET WHERE GROUP_ID=? ORDER BY MEET_DAY AND MEET_TIME';
  mysqlDB.query(sql, group_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      if (!results[0]) return res.send({ code: 34, msg: "forwardmeet not exists" });
      else {
        var visible = [];
        results.map(result => {
          if (result.isfinish === 0) visible.push(result);
        })
        return res.send({ code: 0, msg: "request success", lists: visible });
      }
    }
  });
});

//예약 회의 삭제
app.post('/forwardmeet-delete', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'DELETE FROM FORWARDMEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      return res.send({ code: 0, msg: "request success" });
    }
  })
});

//유효한 회의?
app.post('/forwardmeet-valid', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT isfinish FROM FORWARDMEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      console.log(results[0].isfinish)
      if (results[0].isfinish === 1) {
        return res.send({ code: 36, msg: "meet fail: invalid meet" });
      }
      else
        return res.send({ code: 0, msg: "request success" });
    }
  })
});

//끝난 회의 목록
app.post('/finishedmeet-list', function (req, res) {
  var group_id = req.body.group_id;
  var sql = 'SELECT * FROM FORWARDMEET, FINISHEDMEET WHERE GROUP_ID=? AND FORWARDMEET.MEET_ID = FINISHEDMEET.MEET_ID ORDER BY MEET_DAY DESC, MEET_TIME DESC';
  mysqlDB.query(sql, group_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      if (!results[0]) return res.send({ code: 35, msg: "finishedmeet not exists" });
      else {
        return res.send({ code: 0, msg: "request success", lists: results });
      }
    }
  })
});

//끝난 회의 검색
app.post('/finishedmeet-search', function(req, res){
  var group_id = req.body.group_id;
  var keywords = req.body.keywords.split(" ");
  var query = "";
  keywords.forEach(element=>{
    query += ` AND C.CONTENT LIKE '%${element}%'`;
  });
  var sql = "SELECT * FROM FORWARDMEET AS A, FINISHEDMEET AS B, MEETSCRIPT AS C " 
            + "WHERE GROUP_ID=? AND A.MEET_ID = B.MEET_ID AND A.MEET_ID = C.MEET_ID"
            + query
            + "ORDER BY MEET_DAY DESC, MEET_TIME DESC";
  mysqlDB.query(sql, group_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`, sql:sql});
    else{
      if(!results[0]) return res.send({code:36, msg:"no search result"});
      else{
        return res.send({code:0, msg:"request success", lists:results});
      }
    }
  })
})

//회의별 태그리스트
app.post('/finishedmeet-taglist', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT tag FROM TAGLIST WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      if (!results[0]) return res.send({ code: 33, msg: "tag not exists" });
      else {
        return res.send({ code: 0, msg: "request success", lists: results });
      }
    }
  })
});

//끝난 회의 정보 
app.post('/finishedmeet-info', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT * FROM FORWARDMEET, FINISHEDMEET WHERE FINISHEDMEET.MEET_ID=? AND FORWARDMEET.MEET_ID=FINISHEDMEET.MEET_ID';
  mysqlDB.query(sql, [meet_id], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      if (!results[0]) {
        return res.send({ code: 31, msg: "meet fail: meet_id not exist" });
      }
      else{
        var member_list = results[0].contribution_keys.split(" ");
        var query = "";
        member_list.forEach(element => {
          query += `"${element}",`;
        })
        query = query.substr(0, query.length-1);
        sql = `SELECT user_name, profile_url FROM USERLIST WHERE USER_ID IN (${query}) ORDER BY FIELD(USER_ID, ${query})`
        mysqlDB.query(sql, function(err, results2){
          if(err) return res.send({code:11, msg:`${err}`, sql:sql});
          else  return res.send({code:0, msg:"request success", data:results[0], contributions:results2});
        })
      }
    }
  })
});

//태그 추가
app.post('/finishedmeet-addtag', function (req, res) {
  var meet_id = req.body.meet_id;
  var tag = req.body.tag;
  var sql = 'SELECT COUNT(*) AS cnt FROM TAGLIST WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      if (results[0].cnt > 4) return res.send({ code: 32, msq: "meet fail: tag list is full" });
      else {
        sql = 'INSERT INTO TAGLIST VALUE(?, ?)';
        mysqlDB.query(sql, [meet_id, tag], function (err, results) {
          if (err) return res.send({ code: 11, msg: `${err}` });
          else return res.send({ code: 0, msg: "request success" });
        })
      }
    }
  })
});

//태그 삭제
app.post('/finishedmeet-deletetag', function (req, res) {
  var meet_id = req.body.meet_id;
  var tag = req.body.tag;
  var sql = 'DELETE FROM TAGLIST WHERE MEET_ID=? AND TAG=?';
  mysqlDB.query(sql, [meet_id, tag], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      res.send({ code: 0, msg: "request success" });
    }
  })
});

//회의 chat
app.post('/finishedmeet-chat', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT chat FROM MEETSCRIPT WHERE MEET_ID =?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      res.send({ code: 0, msg: "request success", chat: results[0].chat });
    }
  })
});

//끝난 회의 삭제
app.post('/finishedmeet-delete', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'DELETE FROM FORWARDMEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      res.send({ code: 0, msg: "request success" });
    }
  })
});

//회의 스크립트 다운로드
app.post('/finishedmeet-download', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT chat, summary, wordcloud FROM MEETSCRIPT AS M ,FINISHEDMEET AS F WHERE M.MEET_ID =? AND M.MEET_ID=F.MEET_ID';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });
    else {
      var summary = results[0].summary;
      var chat = results[0].chat.replace(/,/g, '\n')
      var wordcloud = results[0].wordcloud;
      res.send({ code: 0, msg: "request success", summary: summary, chat: chat, wc: wordcloud });
    }
  })
});

server.listen(AppPort, function () {
  console.log(`********** EXPRESS SERVER is running on port ${AppPort} **********`);
});