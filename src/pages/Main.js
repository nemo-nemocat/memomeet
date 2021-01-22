import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
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
import logo from '../memomeet_logo.png';
import Header from '../Components/Header';
import Finished from '../Components/finished';

const useStyles = makeStyles((theme) => ({
  sideBar: {
    minWidth: 230,
    width: "23%",
    minHeight: window.innerHeight,
    backgroundColor: "#ffc31e",
  },
  clickGroup: {
    backgroundColor: "#ffffff"
  },
  listTitle: {
    paddingTop: "4%",
    marginBottom: "15%",
  },
  exitIcon: {
    width: 20,
    height: 20,
    color: "#ffffff",
    marginLeft: "20%"
  },
  groupBtn: {
    width: "100%",
    height: "10%",
  },
  selectGroupBtn: {
    width: "100%",
    height: "10%",
    backgroundColor: "#000000",
    color: "#ffffff",
  },
  body: {
    minWidth: 850,
    height: window.innerHeight - 60,
    justifyContent:"center"
  },
  logo:{
    marginTop:"10%",
  },
}));

const ListItem = withStyles({
  root: {
    "&$selected": {
      backgroundColor: "#000000",
      color: "white"
    },
    "&$selected:hover": {
      backgroundColor: "#000000",
      color: "white"
    },
    "&:hover": {
      backgroundColor: "#ab861f",
      color: "white"
    }
  },
  selected: {}
})(MuiListItem);

export default function InteractiveList() {
  const classes = useStyles();
  const [groups, setGroups] = useState([]);;
  const [activeTab, setActiveTab] = useState(sessionStorage.getItem("preTab"));
  const [exitOpen, setExitOpen] = useState(false);
  const user_id= sessionStorage.getItem("user_id");
  
  useEffect(() => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "user_id": user_id});

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("/group-show", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        setGroups(result.grouplist);
      })
      .catch(error => console.log('error', error));
  }, [user_id]);

  const clickHandler = (id) => {
    setActiveTab(id);
    sessionStorage.setItem("preTab",id);
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

    var raw = JSON.stringify({ "group_id": activeTab, "user_id": user_id });

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

  return (
    <div style={{ display: "flex" }}>
      <div className={classes.sideBar}>
        <Typography variant="h4" className={classes.listTitle}>
          <span style={{ color: "#000000", fontWeight: "bold", maxWidth: "100%" }}>MEMO-MEET</span>
        </Typography>
        <SearchBtn />
        <div style={{height:"84%"}}>
          <List component="nav" style={{ marginBottom: "5%", height:"80%", overflow:"auto"}}>
            {groups && groups.map(group => (
              <ListItem button key={group.group_id} onClick={() => clickHandler(group.group_id)} className={(activeTab === group.group_id) ? classes.selectGroupBtn : classes.groupBtn}>
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
      <div style={{width: "100%", height:"90%"}}>
        <Header group_id={activeTab}/>
          {(activeTab !== '-1') ?
            <div className={classes.body}>
              <NewMeet group_id={activeTab} /> 
              <div style={{display:"flex", height: "75%", alignItems:"center", justifyContent:"center", width:"94%", margin:"auto"}}>
              <Scheduled group_id={activeTab} /> <Finished group_id={activeTab} />
              </div>
            </div>
            :<div style={{minWidth:1000, paddingTop:"15%"}}> 
              <img src={logo} alt="logo"/>
              <Typography variant="h6">
                그룹을 선택하세요
              </Typography>
              </div>
          }
      </div>
    </div>
  );
}