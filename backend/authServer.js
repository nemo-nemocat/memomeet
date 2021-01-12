const express = require("express");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const mysqlDB = require("./mysql-db");

const app = express();
mysqlDB.connect();

//session store
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

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
 
app.get('/', function (req, res) {
    res.send('<a href="/login">login</a>');
});
app.get('/login', function(req, res){
    res.render('login');
});
app.get('/signin', function(req, res){
    res.render('signin');
});

//login 요청
app.post('/login', function(req, res) {
    var id = req.body.userid;
    var pw = req.body.password;
    var sql = 'SELECT * FROM user WHERE id=?';
    mysqlDB.query(sql, [id], function(err, results){
      if(err)
        console.log(err);
 
      if(!results[0]){
        return res.send({code:1, msg:"auth fail: 'id not exist' or 'wrong password'"});
      }

      var user = results[0];
      if(user.pw === pw) {
        console.log(results[0].name);
        req.session.userID = results[0].id;
        req.session.isLogined = true;
        req.session.save();
        return res.send({code:0, msg:"request success", name:results[0].name});
      }
      else{
        return res.send({code:1, msg:"auth fail: 'id not exist' or 'wrong password'"});
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
app.post('/signin', function(req, res){
    var id = req.body.userid;
    var pw = req.body.password;
    var name = req.body.username;
    var email = req.body.email;
    var sql = 'INSERT INTO USER(id, pw, name, email) VALUE(?, ?, ?, ?)';
    mysqlDB.query(sql, [id, pw, name, email], function(err, results){
        if(err){
          return res.send({code:3, msg:"auth fail: 'id already exists'"});
        }
        else return res.send({code:0, msg:"request success"});
    });
});
 
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});