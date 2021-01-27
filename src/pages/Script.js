import React, { useState, useEffect } from 'react';
import { makeStyles} from '@material-ui/core/styles';
import Summary from '../Components/summary';
import Meetscript from '../Components/Meetscript';
import ScriptHeader from '../Components/scriptHeader';
import ScriptTitle from '../Components/ScriptTitle';

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


export default function Script() {
  const classes = useStyles();
  const [groups, setGroups] = useState([]);;
  const [activeTab, setActiveTab] = useState(sessionStorage.getItem("preTab"));
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

  return (
    <div style={{ display: "flex" }}>
      <div style={{width: "100%", height:"90%"}}>
        <ScriptHeader group_id={activeTab}/>
            <div className={classes.body}>
              < ScriptTitle group_id={activeTab} />
              <div style={{display:"flex", height: "85%", width: "100%", justifyContent:"center"}}>
              < Summary group_id={activeTab} /> < Meetscript group_id={activeTab} />
              </div>
            </div>
      </div>
    </div>
  );
}