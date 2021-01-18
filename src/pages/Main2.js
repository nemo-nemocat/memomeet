import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import exit_black from '../exit_black.png';
import exit_white from '../exit_white.png';
import SearchBtn from '../Components/searchBtn';
import GroupCreateBtn from '../Components/groupCreateBtn';
import LinkIcon from '@material-ui/icons/Link';

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: "#000000",
    width:window.innerWidth-300,
    height:60,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  headerBtn:{
    margin:10
  },
  sideBar: {
    width: 300,
    height: window.innerHeight,
    backgroundColor: "#ffc31e",
  },
  clickGroup: {
    backgroundColor: "ffffff"
  },
  listTitle: {
    paddingTop: 15,
    marginBottom: 30,
  },
  exitIcon: {
    width: 20,
    height: 20,
    color: "#ffffff",
  },
  groupBtn: {
    width: 300,
    height: 50,
  },
  selectGroupBtn: {
    width: 300,
    height: 50,
    backgroundColor: "#000000",
    color: "#ffffff"
  },
}));

export default function InteractiveList() {
  const classes = useStyles();
  const [groups, setGroups] = useState([]);;
  const [activeTab, setActiveTab] = useState(-1);
  const [exitOpen, setExitOpen] = useState(false);

  useEffect(() => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch("/group-show", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        setGroups(result.grouplist);
      })
      .catch(error => console.log('error', error));
  }, []);

  const clickHandler = (id) => {
    setActiveTab(id);
  }

  const clickExitOpen = () => {
    setExitOpen(true);
  }

  const exitClose = () => {
    setExitOpen(false);
  }

  const groupExit = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "group_id": activeTab });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("/group-out", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        if (result.code === 0) {
          alert("그룹을 탈퇴했습니다.");
          setExitOpen(false);
          window.location.reload();
        }
      })
      .catch(error => console.log('error', error))
  }

  const handleClickLogout = () => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch("/auth-logout", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        if(result.code === 0){
          alert("로그아웃 되었습니다.");
          window.location.href="/";
        }
      })
      .catch(error => console.log('error', error));
  };

  const handleClickGroupId =()=> {
    if(activeTab !== -1) {
      var t = document.createElement("textarea");
      document.body.appendChild(t);
      t.value = activeTab;
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
      alert("그룹 ID가 복사되었습니다");
    }
    else{
      alert("ID를 복사할 그룹을 선택해주세요");
    }
  }

  const handleClickMeet = () => {
    var meet_id = 'temp';
    var user_id = localStorage.getItem("user_id");
    var user_name = localStorage.getItem("user_name");
    window.open(`http://localhost:3003/meeting?meet_id=${meet_id}&user_id=${user_id}&user_name=${user_name}`, 'Lets MeMoMeet');
  };

  return (
    <div style={{display:"flex"}}>
    <div className={classes.sideBar}>
      <Typography variant="h4" className={classes.listTitle}>
        <span style={{ color: "#000000", fontWeight: "bold", maxWidth:"100%" }}>MEMO-MEET</span>
      </Typography>
      <SearchBtn/>
      <div>
        <List style={{marginBottom:20}}>
          {groups && groups.map(group => (
            <ListItem key={group.group_id} onClick={()=> clickHandler(group.group_id)} className={(activeTab===group.group_id)?classes.selectGroupBtn:classes.groupBtn}>
            <ListItemText
              primary={group.group_name}
              color="#000000"
            />
            <div onClick={clickExitOpen} >
              <img src={(activeTab===group.group_id)? exit_white : exit_black} id="exit_icon" className={classes.exitIcon} alt="exit_icon"/>
            </div>
            </ListItem>
          ))}
        </List>
        <GroupCreateBtn/>
      </div>
      {/* 그룹 나가기 dialog */}
      <Dialog
        open={exitOpen}
        onClose={exitClose}
        aria-labelledby="group-exit-dialog"
      >
        <Typography variant="h6" style={{margin:20}}>그룹을 나가겠습니까?</Typography>
        <DialogActions>
          <Button onClick={exitClose} color="secondary" variant= "contained">
            NO
          </Button>
          <Button onClick={groupExit} color="secondary" variant= "contained">
            YES
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    <div className={classes.header}>
    <Button className={classes.headerBtn} onClick={handleClickGroupId} color="primary" variant= "contained">
      <LinkIcon/> 그룹ID
    </Button>
    <Button className={classes.headerBtn} onClick={handleClickMeet} color="primary" variant= "contained">
      MEETING
    </Button>
    <Button className={classes.headerBtn} onClick={handleClickLogout} color="primary" variant= "contained">
      LOGOUT
    </Button>
    </div>
    </div>
  );
}