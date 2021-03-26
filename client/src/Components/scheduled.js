import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, Chip, Grid} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';
import StartMeetingIcon from '../Icons/enter.png';
import DeleteForever from '@material-ui/icons/DeleteForever';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"45%",
        height:"90%",
        margin:"1%"
    },
    list:{
        height:"94%",
        overflow: "auto",
        '&::-webkit-scrollbar' : {
            display : 'none'
        }
    },
    Chip: {
        backgroundColor: "#ffc31e",
        marginTop:"1%",
        marginRight:"3%",
        height:"10%"
    },
    data:{
        backgroundColor:"#ffffff",
        width:"95%",
        margin:"auto",
        borderRadius:10,
        padding:0,
        marginBottom:"3%"
    },
    startBtn:{
        backgroundColor:"#000000", 
        maxWidth:70,
        width:"25%",  
        borderTopRightRadius:10, 
        borderBottomRightRadius:10,
        textAlign: "center",
        "&:hover": {
          backgroundColor: "#8c8c8c",
        },
    },
    Icon: {
        width:"50%",
        height: "40%",
        marginTop: "15%",
        marginRight: "10%"
    },
    ScheduledName: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        verticalAlign: "middle",
    },
    deleteBtn:{
        marginTop:"-2%",
        "&:hover": {
            color: "#ffa0a0",
        },
    }
}));

export default function Scheduled(prop) {
    const classes = useStyles();
    const [list, setList] = useState('');

    const getList =(prop)=>{
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "group_id": prop.group_id});

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/forwardmeet-list", requestOptions)
            .then(res => res.json())
            .then(result => {
                if(result.code === 0) {
                    setList(result.lists);
                }
                else{
                    setList('');
                }
            })
            .catch(error => console.log('error', error))
    }

    useEffect(() => {
        getList(prop);
      }, [prop]);

    const handleEnterMeet = (meet_id) => {
        var user_id = sessionStorage.getItem("user_id");
        var user_name = sessionStorage.getItem("user_name");

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var raw = JSON.stringify({ "meet_id": meet_id });
    
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
    
        fetch("/forwardmeet-valid", requestOptions)
            .then(res => res.json())
            .then(result => {
                console.log(result);
                if (result.code === 0) {         
                    alert("회의에 입장합니다");
                    window.open(`/meeting?meet_id=${meet_id}&user_id=${user_id}&user_name=${user_name}`, 'Lets MeMoMeet');
                }
                else if(result.code === 36){
                    alert("이미 종료된 회의입니다.");
                    window.location.reload();
                }
            })
            .catch(error => console.log('error', error))

    }

    const handleDeleteIcon =(meet_id) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var raw = JSON.stringify({ "meet_id": meet_id });
    
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
    
        fetch("/forwardmeet-delete", requestOptions)
            .then(res => res.json())
            .then(result => {
                console.log(result);
                if (result.code === 0) {    
                    alert("예약 회의를 삭제합니다");
                    getList();
                }
            })
            .catch(error => console.log('error', error))
    }
   

    return (
        <div className={classes.root}>
            <Paper elevation={3} style={{height:"100%", paddingTop:"1%"}}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Scheduled</span>   
                </Typography>
                <div style={{backgroundColor:"#eaeaea", width:"90%", height:"85%",borderRadius:10, margin:"auto"}}>
                <List className={classes.list}>
                    {list && list.map(data => (
                        <ListItem key={data.meet_id} className={classes.data}>
                            <div style={{display:'block',width:"81%", margin:"2%"}}>
                                <div className={classes.ScheduledName}>
                                <DeleteForever onClick={()=> handleDeleteIcon(data.meet_id)} className={classes.deleteBtn} color="error"/>
                                <span style={{fontWeight:"bold"}}>{data.meet_title}</span>
                                </div>
                                <Grid>
                                    <Chip className={classes.Chip} id="meet_day" icon={<EventIcon/>} label={data.meet_day}/>
                                    <Chip className={classes.Chip} id="meet_time" icon={<ScheduleIcon/>} label={data.meet_time}/>
                                </Grid>
                            </div>
                            <div className={classes.startBtn} onClick={() => handleEnterMeet(data.meet_id)}>
                                <img src={StartMeetingIcon} className={classes.Icon} alt='StartMeetingIcon' />
                                <Typography variant="button" align="center">
                                    <span style={{color:"#FFFFFF"}}>Start</span>
                                </Typography>
                            </div>
                        </ListItem>
                    ))}
                </List>
                </div>
            </Paper> 
        </div>
    );
}