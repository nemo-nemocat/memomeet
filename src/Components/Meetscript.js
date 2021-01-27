import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"90%",
        height:"65%",
        margin:"1%",
    },
    paper: {
        marginLeft:"5%",
        width:"100%",
        marginTop:"7%",
        height:"100%", 
        paddingTop:"1%",
        display: "block",
        justifyContent: "center",
        alignItems: "center"
    },
    data: {
        overflow:"auto",
        height:"100%",
        '&::-webkit-scrollbar' : {
            display : 'none'
        }
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
                <div style={{display:"flex", marginBottom:"1%"}}> 
                    <Typography variant="h6" style={{marginLeft:"47%"}} >
                        <span style={{fontWeight: "bold", textAlign:"center", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Script</span>
                    </Typography>
                      </div>
                <div style={{backgroundColor:"#eaeaea", width:"90%", height:"85%",borderRadius:10, margin:"auto", display:"block"}}>
                    <Typography className={classes.data}>
                    
                    </Typography>
                </div>
            </Paper> 
        </div>
    );
}