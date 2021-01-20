import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LinkIcon from '@material-ui/icons/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles((theme) => ({
  header: {
    minWidth:1000,
    backgroundColor: "#000000",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  headerBtn: {
    margin: "1%"
  },
}));

export default function Header(prop) {
  const classes = useStyles();
  const [group_pw, setGroupPw] = useState('');
  const [group_name, setGroupName] = useState('');

  const handleClickLogout = () => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch("/auth-logout", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        if (result.code === 0) {
          alert("로그아웃 되었습니다.");
          localStorage.setItem("preTab",-1);
          window.location.href = "/";
        }
      })
      .catch(error => console.log('error', error));
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClickMember = (event) => {
      setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleClickGroupId = () => {
    var t = document.createElement("textarea");
    var user_name = localStorage.getItem("user_name");
    
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "group_id": prop.group_id });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("/group-search", requestOptions)
        .then(res => res.json())
        .then(result => {
            console.log(result);
            if (result.code === 0) {
              setGroupName(result.grouplist.group_name);
              setGroupPw(result.grouplist.group_pw);
            }
        })
        .catch(error => console.log('error', error))

    document.body.appendChild(t);
    t.value = `${user_name}님이 [${group_name}] 그룹 초대 메세지를 보냈습니다. \n그룹ID: ${prop.group_id}\n그룹PW: ${group_pw}`;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert("그룹 초대 메세지가 복사되었습니다");
  }

  return (
    <div className={classes.header}>
      {(prop.group_id !== '-1') ?
        <Button className={classes.headerBtn} onClick={handleClickGroupId} color="primary" variant="contained">
          <LinkIcon /> 그룹초대
    </Button>
        : <div />
      }
      <Button className={classes.headerBtn} onClick={handleClickMember} aria-controls="simple-menu" aria-haspopup="true" color="primary" variant="contained">
        그룹 멤버
      </Button>
      <Menu
          keepMounted
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem >ddd</MenuItem>
          <MenuItem>aaa</MenuItem>
      </Menu>
      <Button className={classes.headerBtn} onClick={handleClickLogout} color="primary" variant="contained">
        LOGOUT
      </Button>
    </div>
  );
}