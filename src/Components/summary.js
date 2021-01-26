import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, Chip, Grid} from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"90%",
        height:"20%",
        margin:"1%"
    },
    paper: {
        marginLeft:"5%",
        width:"100%",
        marginTop:"1%",
        height:"100%", 
        paddingTop:"1%",
    },
    Chip: {
        backgroundColor: "#ffc31e",
        marginLeft:"1%",
        height:"10%",
    },
    TagChip: {
        marginLeft:"1%",
    },
    data: {
        overflow:"auto",
        height:"100%",
        '&::-webkit-scrollbar' : {
            display : 'none'
        }
    },
}));

export default function Script(prop) {
    const classes = useStyles();
    const [list, setList] = useState('');

    useEffect(() => {
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
      }, [prop]);
   
    return (
        <div className={classes.root}>
            <Typography variant="h6" align="left">
            <span style={{fontWeight:"bold", marginLeft:"5%"}}>회의명</span>
                <Chip className={classes.Chip} id="meet_day" icon={<EventIcon/>} label="2021-01-21" />
                <Chip className={classes.Chip} id="meet_time" icon={<ScheduleIcon/>} label="13:00"/>
                <Chip className={classes.TagChip} variant="outlined" size="small" label="주제 선정"/>
                <Chip className={classes.TagChip} variant="outlined" size="small" label="영어동화"/>
                <Chip className={classes.TagChip} variant="outlined" size="small" label="화상회의"/>
            </Typography>
            
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Summary</span>   
                </Typography>
                <div style={{backgroundColor:"#eaeaea", width:"90%", height:"65%",borderRadius:10, margin:"auto"}}>
                    <Typography className={classes.data}>
                    
                    </Typography>
                </div>
            </Paper> 
        </div>
    );
}