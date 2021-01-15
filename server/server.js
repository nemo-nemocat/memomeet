const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const port = 3001;
const cors = require('cors');
const mysqlDB = require("./mysql-db");  //db 연결
const session = require('express-session'); //session 생성
const MySQLStore = require('express-mysql-session')(session); //db에 session 관리
const shortid = require ('shortid'); // unique id 생성

app.use(cors());
app.use(bodyParser.json());

//session store - 다시 실행해도 세션 유지
var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'memomeet'
}
var sessionStore = new MySQLStore(options);
app.use(session({
  secret: 'secret-code',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

//login 요청
app.post('/auth-login', function(req, res) {
  var id = req.body.user_id;
  var pw = req.body.user_pw;
  console.log(req.body);
  var sql = 'SELECT * FROM USERLIST WHERE user_id=?';
  mysqlDB.query(sql, [id], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});

    if(!results[0]){
      return res.send({code:1, msg:"auth fail: id not exist"});
    }

    var user = results[0];
    if(user.user_pw === pw) {
      req.session.userID = results[0].user_id;
      req.session.isLogined = true;
      req.session.save();
      return res.send({code:0, msg:"request success", user_id:user.user_id, user_name:user.user_name});
    }
    else{
      return res.send({code:2, msg:"auth fail:wrong password"});
    }
  });
}
);

//logout 요청
app.get('/auth-logout', function(req, res){
  req.session.destroy();
  return res.send({code:0, msg:"request success"});
}
);

//회원가입 요청
app.post('/auth-signup', function(req, res){
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
  var user_id = req.session.userID;
  var sql = 'INSERT INTO GROUPLIST(group_id, group_pw, group_name) VALUE(?, ?, ?)';
  mysqlDB.query(sql, [group_id, group_pw, group_name], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      sql = 'INSERT INTO MEMBERLIST(group_id, user_id)';
      mysqlDB.query(sql, [group_id, user_id], function(err, results){
        if(err) return res.send({code:11, msg:`${err}`});
        else return res.send({code:0, msg:"request success"});
      });
    }
  });
});

//사용자가 속한 그룹 리스트 출력
app.get('/group-show', function(req, res){
  var userID = req.session.userID;
  var sql = "SELECT * FROM GROUPLIST WHERE GROUP_ID IN (SELECT GROUP_ID FROM MEMBERLIST WHERE USER_ID=?)";
  mysqlDB.query(sql, userID, function(err, results){
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
        return res.send({code:0, msg:"request success", grouplist: results});
      }
    }
  });
});

//그룹 참가
app.post('/group-enter', function(req, res){
  var group_id = req.body.group_id;
  var group_pw = req.body.group_pw;
  var user_id = req.session.userID;
  var sql = 'SELECT * FROM GROUPLIST WHERE GROUP_ID=? AND GROUP_PW=?';
  mysqlDB.query(sql, [group_id, group_pw], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]){
        return res.send({code:22, msg:"group fail: group_pw incorrect"});
      }
      else{
        sql = 'INSERT INTO MEMBERLIST(group_id, user_id) VALUE(?, ?)';
        mysqlDB.query(sql, [group_id, user_id], function(err,results){
          if(err) return res.send({code:11, msg:`${err}`});
          else{
            return res.send({code:0, msg:"request success"});
          } 
        });
      }
    }
  });
});

//그룹 나가기
app.post('/group-out', function(req, res){
  var group_id = req.body.group_id;
  var user_id = req.session.userID;
  var sql = 'DELETE FROM MEMBERLIST WHERE GROUP_ID=? AND USER_ID=?';
  mysqlDB.query(sql, [group_id, user_id], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      return res.send({code:0, msg:"request success"});
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
      if(!results[0]) return res.send({code:21, msg:"group fail: group_id not exist"});
      else{
        var members="";
        results.map(result=>(
          members += result.user_name + " "
        ));
      }
      return res.send({code:0, msg:"request success", members: members});
    }
  });
});

//회의 예약 하기
app.post('/forwardmeet-create', function(req,res){
  var group_id = req.body.group_id;
  var meet_title = req.body.meet_title;
  var meet_day = req.body.meet_day;
  var meet_time = req.body.meet_time;
  var sql = 'INSERT INTO FORWARDMEET VALUE(?, ?, ?, ?)';
  mysqlDB.query(sql, [group_id, meet_title, meet_day, meet_time], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      return res.send({code:0, msg:"request success"});
      }
  });
});

//예약 회의 목록
app.get('/forwardmeet-list', function(req,res){
  //var group_id = req.body.group_id;
  var group_id = "test_group";
  var sql = 'SELECT * FROM FORWARDMEET WHERE GROUP_ID=?';
  mysqlDB.query(sql, group_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]) return res.send({code:31, msg:"forwardmeet not exists"});
      else return res.send({code:0, msg:"request success", lists:results});
      }
  });
});


app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});