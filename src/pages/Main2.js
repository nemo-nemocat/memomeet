import React,{useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import exit_black from '../exit_black.png';
import exit_white from '../exit_white.png';

const useStyles = makeStyles((theme) => ({
  sideBar: {
    width: 300,
    height: 650,
    backgroundColor: "#ffc31e",
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    paddingTop: 50,
    marginBottom: 30,
  },
  icon:{
    width:20,
    height:20,
    color: "#ffffff",
  },
  iconOver:{
    backgroundColor: "#ffffff",
  },
  groupBtn:{
    width:300,
    height:50,
  },
}));

export default function InteractiveList() {
  const classes = useStyles();
  const [groups, setGroups] = useState([]);

  useEffect(()=>{
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
  },[]);

  const exitClick =()=>{
      console.log("clicked!");
  }

  const groupClick=(e)=>{
    console.log(e.target.id);
  }

  const exitOver =()=>{
    document.getElementById("exit_icon").src=`${exit_white}`;
  }

  return (
    <div className={classes.sideBar}>
          <Typography variant="h5" className={classes.title}>
            <span style={{ color: "#000000", fontWeight: "bold", maxWidth:"100%" }}>Group List</span>
          </Typography>
          <div>
            <List>
              {groups && groups.map(group => (
                <Button key={group.group_id} id={group.group_id} onClick={groupClick} className={classes.groupBtn}>
                   <ListItem key={group.group_id}>
                    <ListItemText
                      primary={group.group_name}
                    />
                    <div onClick={exitClick} >
                      <img src={exit_black} id="exit_icon" onMouseOver={exitOver}  className={classes.icon} alt="exit_icon"/>
                    </div>
                  </ListItem>
                </Button>
              ))}
            </List>
          </div>
    </div>
  );
}