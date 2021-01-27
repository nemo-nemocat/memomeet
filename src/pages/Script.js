import React, { useState, useEffect } from 'react';
import { makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Header from '../Components/Header';
import Summary from '../Components/summary';
import Meetscript from '../Components/Meetscript';

const useStyles = makeStyles((theme) => ({
  listTitle: {
    paddingTop: "4%",
    marginBottom: "15%",
  },
  body: {
    minWidth: 850,
    height: window.innerHeight - 60,
    justifyContent:"center"
  },
}));


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
      <div style={{width: "100%", height:"90%"}}>
        <Header group_id={activeTab}/>
            <div className={classes.body}>
              < Summary group_id={activeTab} /> 
              < Meetscript group_id={activeTab} /> 
            </div>
      </div>
    </div>
  );
}