import React, { useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
import LogoutIcon from '@material-ui/icons/LockOpen';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles((theme) => ({
  header: {
    minWidth:1250,
    backgroundColor: "#000000",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  headerBtn: {
    marginLeft: "5%"
  },
  backBtn: {
    marginRight:"62%"
  }
}));

export default function ScriptHeader(prop) {
  const classes = useStyles();

  const handleClickLogout = () => {
    sessionStorage.setItem("user_id",'');
    sessionStorage.setItem("user_name",'');
    sessionStorage.setItem("preTab",-1);
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  return (
    <div className={classes.header}>
        <Button className={classes.backBtn} color="primary" variant="contained" href="/main" >
            <ArrowBackIcon/>&nbsp;Back
        </Button>
      {(prop.group_id !== '-1') ?
      <div style={{display:"flex"}}>
        <Button className={classes.headerBtn} color="primary" variant="contained">
            <GetAppIcon/>&nbsp;Download
        </Button>
      </div>
        : <div />
      }
      <Button style={{margin:"1%"}} onClick={handleClickLogout} color="primary" variant="contained">
        <LogoutIcon/>&nbsp;LOGOUT
      </Button>
      <span style={{color: "#ffffff", fontWeight: "bold", maxWidth: "100%", marginRight:"1%" }}>{sessionStorage.getItem("user_name")}님</span>
    </div>
  );
}