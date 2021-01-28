import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import logo from '../Icons/memomeet_logo.png';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    marginTop: "3%",
    marginBottom: "3%"
  },
  logo:{
    marginTop: "25%",
    marginBottom: "15%",
    height: "30%",
  },
}));

export default function SignIn() {
  const classes = useStyles();
  const isHyomin = window.innerHeight > 700 ? true : false;
  const [userid, setUserid] = useState('');
  const [pw, setPw] = useState('');

  const handleClick = () => {
    if (userid === '' || pw === '') {
        alert("아이디와 비밀번호를 모두 입력하세요");
    }
    else {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "user_id": userid, "user_pw": pw });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/auth-login", requestOptions)
            .then(res => res.json())
            .then(result => {
              console.log(result);
              if(result.code !== 0) alert("아이디 혹은 비밀번호가 틀렸습니다");
              else{
                alert(`${result.user_name}님 환영합니다!`);
                sessionStorage.setItem("user_id", result.user_id);
                sessionStorage.setItem("user_name", result.user_name);
                sessionStorage.setItem("preTab",-1);
                window.location.href='/main';  
              }
            })
            .catch(error => console.log('error', error))
    } 
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  }

  return (
    <Container component="main" style={{width:400, height: window.innerHeight}}>
      <CssBaseline />
      <img src={logo} className={classes.logo} alt="logo"/>
      <div className={classes.paper}>
        <Typography component="h1" variant="h6">
          WELCOME TO MEMOMEET
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="id"
            label="아이디 입력"
            name="id"
            autoComplete="id"
            autoFocus
            value={userid}
            size={isHyomin ? "medium" : "small"}
            onChange={({ target: { value } }) => setUserid(value)}
            onKeyPress={onKeyPress}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="비밀번호 입력"
            type="password"
            id="password"
            autoComplete="current-password"
            value={pw}
            size={isHyomin ? "medium" : "small"}
            onChange={({ target: { value } }) => setPw(value)}
            onKeyPress={onKeyPress}
          />
          <Button
            variant= "contained"
            color= "secondary"
            size="large"
            className={classes.submit}
            onClick={handleClick}
          >
            LOGIN
          </Button>
          <br/>
          <Link href="/Signup" variant="body2" color="secondary">
             {"회원가입"}
          </Link>
        </form>
      </div>
    </Container>
  );
}