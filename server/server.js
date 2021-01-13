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
app.post('/login', function(req, res) {
  var id = req.body.userid;
  var pw = req.body.password;
  console.log(req.body);
  var sql = 'SELECT * FROM user WHERE id=?';
  mysqlDB.query(sql, [id], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});

    if(!results[0]){
      return res.send({code:1, msg:"auth fail: id not exist"});
    }

    var user = results[0];
    if(user.pw === pw) {
      req.session.userID = results[0].id;
      req.session.isLogined = true;
      req.session.save();
      return res.send({code:0, msg:"request success", name:user.name});
    }
    else{
      return res.send({code:2, msg:"auth fail:wrong password"});
    }
  });
}
);

//logout 요청
app.post('/logout', function(req, res){
  req.session.destroy();
  return res.send({code:0, msg:"request success"});
}
);

//회원가입 요청
app.post('/signup', function(req, res){
  var id = req.body.userid;
  var pw = req.body.password;
  var name = req.body.username;
  var email = req.body.email;
  var sql = 'INSERT INTO USER(id, pw, name, email) VALUE(?, ?, ?, ?)';
  mysqlDB.query(sql, [id, pw, name, email], function(err, results){
      if(err){
        return res.send({code:3, msg:"auth fail: id already exists"});
      }
      else return res.send({code:0, msg:"request success"});
  });
});

//그룹 만들기 - 로그인 상태 전제
app.post('/group-create', function(req,res){
  var group_name = req.body.group_name;
  var group_pw = req.body.group_pw;
  var group_id = shortid.generate();  //유니크 키 값 생성
  var member = req.session.userID+',';
  var sql = 'INSERT INTO GROUPLIST(group_id, group_pw, group_name, member) VALUE(?, ?, ?, ?)';
  mysqlDB.query(sql, [group_id, group_pw, group_name, member], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      return res.send({code:0, msg:"request success"});
    }
  });
});

//사용자가 속한 그룹 리스트 출력
app.post('/group-show', function(req, res){
  var userID = `%${req.session.userID},%`;
  var sql = "SELECT * FROM GROUPLIST WHERE MEMBER LIKE ?";
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
  var sql = 'SELECT * FROM GROUPLIST WHERE GROUP_ID=? AND GROUP_PW=?';
  mysqlDB.query(sql, [group_id, group_pw], function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]){
        return res.send({code:22, msg:"group fail: group_pw incorrect"});
      }
      else{
        var member = results[0].member;
        var updateMember = member + req.session.userID + ', ';
        sql = 'UPDATE GROUPLIST SET MEMBER=? WHERE GROUP_ID=?';
        mysqlDB.query(sql, [updateMember, group_id], function(err,results){
          if(err) return res.send({code:11, msg:`${err}`});
          else{
            return res.send({code:0, msg:"request success"});
          } 
        });
      }
    }
  });
});

//그룹 삭제
app.post('/group-delete', function(req, res){
  var group_id = req.body.group_id;
  var userID = req.session.userID;
  var sql = 'SELECT * FROM GROUPLIST WHERE GROUP_ID = ?';
  mysqlDB.query(sql, group_id, function(err, results){
    if(err) return res.send({code:11, msg:`${err}`});
    else{
      if(!results[0]){
        return res.send({code:21, msg:"group fail: group_id not exist"});
      }
      else{
        var member = results[0].member;
        var updateMember = member.replace(`${userID}, `,"");
        console.log(updateMember);
        sql = 'UPDATE GROUPLIST SET MEMBER=? WHERE GROUP_ID=?';
        mysqlDB.query(sql, [updateMember, group_id], function(err,results){
          if(err) return res.send({code:11, msg:`${err}`});
          else{
            return res.send({code:0, msg:"request success"});
          } 
        });
      }
    }
  });
});





app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});