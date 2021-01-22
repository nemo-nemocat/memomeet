import React, { useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LinkIcon from '@material-ui/icons/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GroupIcon from '@material-ui/icons/Group';
import LogoutIcon from '@material-ui/icons/LockOpen';

const useStyles = makeStyles((theme) => ({
  header: {
    minWidth:850,
    backgroundColor: "#000000",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  headerBtn: {
    marginLeft: "5%"
  },
}));

export default function Header(prop) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [members, setGroupMember] = useState([]);

  const handleClickLogout = () => {
    sessionStorage.setItem("user_id",'');
    sessionStorage.setItem("user_name",'');
    sessionStorage.setItem("preTab",-1);
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  const handleClickMember = (event) => {
      setAnchorEl(event.currentTarget);

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
  
      var raw = JSON.stringify({ "group_id": prop.group_id });
  
      var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
      };
  
      fetch("/group-memberlist", requestOptions)
          .then(res => res.json())
          .then(result => {
              console.log(result);
              if (result.code === 0) {
                setGroupMember(result.members);
              }
          })
          .catch(error => console.log('error', error))
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleClickGroupId = () => {
    var t = document.createElement("textarea");
    var user_name = sessionStorage.getItem("user_name");
    
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
              document.body.appendChild(t);
              t.value = `📝MEMO-MEET📝\n${user_name}님이 [${result.grouplist.group_name}] 그룹 초대 메세지를 보냈습니다. \n🔒그룹ID: ${prop.group_id}\n🔑그룹PW: ${result.grouplist.group_pw}`;
              t.select();
              document.execCommand('copy');
              document.body.removeChild(t);
              alert("그룹 초대 메세지가 복사되었습니다");
            }
        })
        .catch(error => console.log('error', error))
  }

  return (
    <div className={classes.header}>
      {(prop.group_id !== '-1') ?
      <div style={{display:"flex"}}>
        <Button className={classes.headerBtn} onClick={handleClickGroupId} color="primary" variant="contained">
          <LinkIcon /> &nbsp;INVITE
        </Button>
        <Button className={classes.headerBtn} onClick={handleClickMember} aria-controls="simple-menu" aria-haspopup="true" color="primary" variant="contained">
          <GroupIcon/>&nbsp;MEMBERS
        </Button>
      </div>
        : <div />
      }
      <Menu
          keepMounted
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {members && members.map(member => (
            <MenuItem >{member.user_name}</MenuItem>
          ))}
      </Menu>
      <Button style={{margin:"1%"}}onClick={handleClickLogout} color="primary" variant="contained">
        <LogoutIcon/>&nbsp;LOGOUT
      </Button>
      <span style={{color: "#ffffff", fontWeight: "bold", maxWidth: "100%" }}>{sessionStorage.getItem("user_name")}님&nbsp;</span>
    </div>
  );
}