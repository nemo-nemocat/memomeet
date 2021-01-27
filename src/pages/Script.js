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


function getUrlParams() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
    return params;
}

export default function InteractiveList() {
  const classes = useStyles();
  
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
        <Header/>
            <div className={classes.body}>
              <Summary/> 
              <Meetscript/> 
            </div>
      </div>
    </div>
  );
}