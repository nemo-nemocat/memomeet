import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"60%",
        height:"90%",
        marginTop:"1%"
    },
    paper: {
        marginLeft:"2%",
        width:"100%",
        height:"99%", 
        paddingTop:"1%",
        marginTop:"0.5%"
    },
    data: {
        overflow:"auto",
        height:"auto",
        '&::-webkit-scrollbar' : {
            display : 'none'
        },
    },
}));

export default function MeetScript(prop) {
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
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Script</span>
                </Typography>
                <div style={{backgroundColor:"#eaeaea", width:"89%", height:"82%",padding: "3%",borderRadius:10, margin:"auto"}}>
                    <Typography className={classes.data}>
                    
                    </Typography>
                </div>
            </Paper> 
        </div>
    );
}