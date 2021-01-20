import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, Button, Chip, Grid} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"45%",
        marginRight:"3%",
        height:500,
    },
    Chip: {
        backgroundColor: "#ffc31e",
        marginTop:"1%",
        marginRight:"3%"
    },
    data:{
        backgroundColor:"#ffffff",
        width:"95%",
        margin:"auto",
        borderRadius:10,
        padding:0,
        marginBottom:"2%"
    },
}));

export default function Scheduled(prop) {
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
            <Paper elevation={3} style={{height:"100%"}}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}> Scheduled</span>   
                </Typography>
                <div style={{backgroundColor:"#eaeaea", width:"90%", height:"85%",borderRadius:10, marginLeft:"5%", marginTop:10}}>
                <List style={{height:"100%", overflow:"auto"}}>
                    {list && list.map(data => (
                        <ListItem key={data.meet_id} className={classes.data}>
                            <div style={{display:'block', width:"80%", margin:"2%"}}>
                                <span style={{fontWeight:"bold"}}>{data.meet_title}</span>
                                <Grid>
                                    <Chip className={classes.Chip} id="meet_day" icon={<EventIcon/>} label={data.meet_day}/>
                                    <Chip className={classes.Chip} id="meet_time" icon={<ScheduleIcon/>} label={data.meet_time}/>
                                </Grid>
                            </div>
                            <div style={{backgroundColor:"#000000", width:80, height:70, borderTopRightRadius:10, borderBottomRightRadius:10}}></div>
                        </ListItem>
                    ))}
                </List>
                </div>
            </Paper> 
        </div>
    );
}