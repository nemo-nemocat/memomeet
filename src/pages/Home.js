import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
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

        var raw = JSON.stringify({ "userid": userid, "password": pw });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/login", requestOptions)
            .then(res => res.json())
            .then(data => {console.log(data);})
            .catch(error => console.log('error', error))


    }
};

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          로그인
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
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="로그인 상태 유지"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleClick}>
              <Link href="/Main" variant="body2">
                {"로그인"}
              </Link>
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                {"비밀번호 찾기"}
              </Link>
            </Grid>
            <Grid item xs>
              <Link href="/Signup" variant="body2">
                {"회원가입"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}