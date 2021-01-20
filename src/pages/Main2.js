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
import NewMeet from '../Components/newMeet';
import Scheduled from '../Components/scheduled';
import LinkIcon from '@material-ui/icons/Link';
import logo from '../memomeet_logo.png'

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: "#000000",
    width: 1280,
    height: 60,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  headerBtn: {
    margin: 10
  },
  sideBar: {
    width: 250,
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
    width: 250,
    height: 50,
  },
  selectGroupBtn: {
    width: 250,
    height: 50,
    backgroundColor: "#000000",
    color: "#ffffff"
  },
  body: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    verticalAlign: "middle",
    height: window.innerHeight - 60,
  },
  logo:{
    marginTop:150
  },
}));

export default function InteractiveList() {
  const classes = useStyles();
  const [groups, setGroups] = useState([]);;
  const [activeTab, setActiveTab] = useState(localStorage.getItem("preTab"));
  const [exitOpen, setExitOpen] = useState(false);
  const [group_pw, setGroupPw] = useState('');
  const [group_name, setGroupName] = useState('');

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
    localStorage.setItem("preTab",id);
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
        if (result.code === 0) {
          alert("로그아웃 되었습니다.");
          localStorage.setItem("preTab",-1);
          window.location.href = "/";
        }
      })
      .catch(error => console.log('error', error));
  };

  const handleClickGroupId = () => {
    var t = document.createElement("textarea");
    var user_name = localStorage.getItem("user_name");
    
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "group_id": activeTab });

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
    t.value = `${user_name}님이 [${group_name}] 그룹 초대 메세지를 보냈습니다. \n그룹ID: ${activeTab}\n그룹PW: ${group_pw}`;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert("그룹 초대 메세지가 복사되었습니다");
  }

  const handleClickMeet = () => {
    var meet_id = 'temp';
    var user_id = localStorage.getItem("user_id");
    var user_name = localStorage.getItem("user_name");
    window.open(`http://localhost:3003/meeting?meet_id=${meet_id}&user_id=${user_id}&user_name=${user_name}`, 'Lets MeMoMeet');
  };

  return (
    <div style={{ display: "flex" }}>
      <div className={classes.sideBar}>
        <Typography variant="h4" className={classes.listTitle}>
          <span style={{ color: "#000000", fontWeight: "bold", maxWidth: "100%" }}>MEMO-MEET</span>
        </Typography>
        <SearchBtn />
        <div>
          <List style={{ marginBottom: 20, height:500, overflow:"auto"}}>
            {groups && groups.map(group => (
              <ListItem key={group.group_id} onClick={() => clickHandler(group.group_id)} className={(activeTab === group.group_id) ? classes.selectGroupBtn : classes.groupBtn}>
                <ListItemText
                  primary={group.group_name}
                  color="#000000"
                />
                <div onClick={clickExitOpen} >
                  <img src={(activeTab === group.group_id) ? exit_white : exit_black} id="exit_icon" className={classes.exitIcon} alt="exit_icon" />
                </div>
              </ListItem>
            ))}
          </List>
          <GroupCreateBtn />
        </div>
        {/* 그룹 나가기 dialog */}
        <Dialog
          open={exitOpen}
          onClose={exitClose}
          aria-labelledby="group-exit-dialog"
        >
          <Typography variant="h6" style={{ margin: 20 }}>그룹을 나가겠습니까?</Typography>
          <DialogActions>
            <Button onClick={exitClose} color="secondary" variant="contained">
              NO
          </Button>
            <Button onClick={groupExit} color="secondary" variant="contained">
              YES
          </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <div className={classes.header}>
          {(activeTab !== '-1') ?
            <Button className={classes.headerBtn} onClick={handleClickGroupId} color="primary" variant="contained">
              <LinkIcon /> 그룹초대
        </Button>
            : <div />
          }
          <Button className={classes.headerBtn} onClick={handleClickMeet} color="primary" variant="contained">
            MEETING
    </Button>
          <Button className={classes.headerBtn} onClick={handleClickLogout} color="primary" variant="contained">
            LOGOUT
    </Button>
        </div>
          {(activeTab !== '-1') ?
            <div className={classes.body}>
              <NewMeet group_id={activeTab} />  <Scheduled group_id={activeTab}/>  <Scheduled group_id={activeTab}/>
            </div>
            :<div> 
              <img src={logo} className={classes.logo} alt="logo"/>
              <Typography variant="h6" className={classes.listTitle}>
                그룹을 선택하세요
              </Typography>
              </div>
          }
      </div>
    </div>
  );
}