
import React,{useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import logo from '../memomeet_logo.png';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%', 
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logo:{
    marginTop: 30,
    width: 100,
    height: 130,
  },
}));

function checkId(userId) {
  var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; //특수 문자
  var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

  if (pattern_kor.test(userId) || pattern_spc.test(userId)) {
      return true;
  }
}

function checkPw(pw) {
    var pattern_spc = /[#$%^&*()_+|<>?:{}]/; //특수 문자
    if (pattern_spc.test(pw)) {
        return true;
    }
}

function checkEmail(email) {
  var exptext = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
  if (exptext.test(email) === false) {
      return true;
  }
  return false;
}

export default function SignUp() {
  const classes = useStyles();
  const [user_id, setUserId] = useState("");
  const [user_pw, setUserPw] = useState("");
  const [user_name, setUserName] = useState("");
  const [user_email, setUserEmail] = useState("");

  const handleIdChange = (e) => {
        setUserId(e.target.value);
  }
  const handlePwChange = (e) => {
    setUserPw(e.target.value);
  }
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  }
  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
  }

  const handleSubmit = () => {
    if (user_id === '' || user_pw === '' || user_name === '' || user_email === '') {
        alert("정보를 모두 입력해주세요!!");
    }
    else if (checkId(user_id)) {
        alert("아이디에 특수문자 또는 한글을 제외해주세요!");
    }
    else if (user_pw.length < 8) {
        alert("비밀번호는 8자리 이상으로 설정해주세요!")
    }
    else if (checkPw(user_pw)) {
        alert("비밀번호에 가능한 특수문자는 ~!@ 입니다");
    }
    else if (checkEmail(user_email)) {
        alert("이메일 형식이 올바르지 않습니다!");
    }
    else {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "user_id": user_id, "user_pw": user_pw, "user_name": user_name, "user_email": user_email });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/auth-signup", requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result);
                if(result.code===0){
                alert("회원가입 성공");
                window.location.href = "/";}
                else if(result.code===3){
                    alert("이미 존재하는 아이디입니다.")
                }
            })
            .catch(error => console.log('error', error));

    }
  }


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <a href="/" >
        <img src={logo} className={classes.logo} alt="logo"/>
      </a>
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="name"
                name="name"
                variant="outlined"
                required
                fullWidth
                id="name"
                label="이름"
                value={user_name} 
                onChange={handleNameChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="이메일 주소"
                name="email"
                value={user_email}
                onChange={handleEmailChange}
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="id"
                label="아이디"
                name="id"
                value={user_id}
                onChange={handleIdChange}
                autoComplete="id"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="비밀번호"
                type="password"
                id="password"
                value={user_pw}
                onChange={handlePwChange}
                autoComplete="current-password"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            size="large"
            variant="contained"
            color="secondary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            SIGNUP
          </Button>
        </form>
      </div>
    </Container>
  );
}

