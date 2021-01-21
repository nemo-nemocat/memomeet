import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import logo from '../memomeet_logo.png';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 2, 2),
  },
  logo:{
    marginTop: "20%",
    width: "40%",
    height: "30%",
    marginBottom: "10%"
  },
}));

export default function SignIn() {
  const classes = useStyles();
  
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

  return (
    <Container component="main" maxWidth="xs" style={{height: window.innerHeight}}>
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
            onChange={({ target: { value } }) => setUserid(value)}
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
            onChange={({ target: { value } }) => setPw(value)}
          />
          <Button
            variant= "contained"
            color= "secondary"
            size="large"
            className={classes.submit}
            onClick={handleClick}
          >
            <Typography component="h1" variant="button">
              LOGIN
            </Typography>
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