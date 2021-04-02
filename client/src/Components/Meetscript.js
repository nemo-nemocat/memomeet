import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography } from '@material-ui/core';
import Shortid from "shortid";

const useStyles = makeStyles((theme) => ({
    root: {
        width:"85%",
        height:"83%",
        marginTop:"1%",
    },
    paper: {
        width:"100%",
        height:"100%", 
        paddingTop:"1%",
        marginTop:"0.5%"
    },
    scriptContainer: {
        backgroundColor:"#eaeaea", 
        width:"89%", 
        height:"80%",
        padding: "3%",
        borderRadius:10, 
        margin:"auto",
        textAlign: "left",
        overflow:"auto",
        '&::-webkit-scrollbar' : {
            display : 'none'
        },
    },
}));

export default function MeetScript(prop) {
    const classes = useStyles();
    const [list, setList] = useState([]);

    useEffect(() => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "meet_id": prop.meet_id});

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/finishedmeet-chat", requestOptions)
            .then(res => res.json())
            .then(result => {
                setList(result.chat.split(','));
            })
            .catch(error => console.log('error', error))
      }, [prop]);
   
    return (
        <div className={classes.root}>
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Script</span>
                </Typography>
                <div className={classes.scriptContainer}>
                    {list && list.map(data => (
                        <Typography key={Shortid.generate()}>{data}</Typography>
                    ))}
                </div>
            </Paper> 
        </div>
    );
}