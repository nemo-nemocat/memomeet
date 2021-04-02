import React from 'react';
import { makeStyles} from '@material-ui/core/styles';
import Summary from '../Components/summary';
import Meetscript from '../Components/Meetscript';
import ScriptTitle from '../Components/ScriptTitle';

const useStyles = makeStyles((theme) => ({
  listTitle: {
    paddingTop: "4%",
    marginBottom: "15%",
  },
  body: {
    minWidth: 850,
    height: window.innerHeight,
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
  const meet_id = getUrlParams().meet_id;

  return (
    <div style={{ display: "flex" }}>
      <div style={{width: "100%", height:"90%"}}>
            <div className={classes.body}>
              < ScriptTitle meet_id={meet_id} />
              <div style={{ display: "flex", height: "88%", width: "95%", justifyContent:"center"}}>
                <div style={{ height: "88%", width: "98%", justifyContent:"center"}}>
                  < Summary meet_id={meet_id} />  
                </div>
                < Meetscript meet_id={meet_id} />
              </div>
              
            </div>
      </div>
    </div>
  );
}