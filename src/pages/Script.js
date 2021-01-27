import React, { useState, useEffect } from 'react';
import { makeStyles} from '@material-ui/core/styles';
import Summary from '../Components/summary';
import Meetscript from '../Components/Meetscript';
import ScriptHeader from '../Components/ScriptHeader';
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

function getUrlParams() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
    return params;
}

export default function Script() {
  const classes = useStyles();
  const [groups, setGroups] = useState([]);;
  const [activeTab, setActiveTab] = useState(sessionStorage.getItem("preTab"));
  const user_id= sessionStorage.getItem("user_id");
  
  useEffect(() => {
    var meet_id = (getUrlParams().meet_id);
    console.log(meet_id);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "meet_id": meet_id });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("/finishedmeet-info", requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);
      })
      .catch(error => console.log('error', error))

  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div style={{width: "100%", height:"90%"}}>
        <ScriptHeader group_id={activeTab}/>
            <div className={classes.body}>
              < ScriptTitle group_id={activeTab} />
              <div style={{display:"flex", height: "88%", width: "100%", justifyContent:"center"}}>
              < Summary group_id={activeTab} /> < Meetscript group_id={activeTab} />
              </div>
            </div>
      </div>
    </div>
  );
}