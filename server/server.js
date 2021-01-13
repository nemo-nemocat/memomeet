const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const port = 3001;
const cors = require('cors');
const mysqlDB = require("./mysql-db");  //db 연결
const session = require('express-session'); //session 생성
const MySQLStore = require('express-mysql-session')(session); //db에 session 관리

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
    if(err)
      console.log(err);

    if(!results[0]){
      return res.send({code:1, msg:"auth fail: id not exist"});
    }

    var user = results[0];
    if(user.pw === pw) {
      req.session.userID = results[0].id;
      req.session.isLogined = true;
      req.session.save();
      return res.send({code:0, msg:"request success", name:results[0].name});
    }
    else{
      return res.send({code:2, msg:"auth fail:wrong password"});
    }
  });
}
);

app.get('/logout', function(req, res){
  res.send('logout page');
});

//logout 요청
app.post('/logout', function(req, res){
  req.session.destroy();
  return res.send({code:0, msg:"request success"});
}
);

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});