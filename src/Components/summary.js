import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth:250,
        width:"30%",
        height:"90%",
        marginTop:"1%"
    },
    paper: {
        marginLeft:"1%",
        width:"100%",
        height:"100%", 
        paddingTop:"1%",
        marginTop:"1%",
    },
    data: {
        overflow:"auto",
        height:"100%",
        '&::-webkit-scrollbar' : {
            display : 'none'
        },
    },
}));

export default function Script(prop) {
    const classes = useStyles();
    const [data, setData] = useState('');

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

        fetch("/finishedmeet-info", requestOptions)
            .then(res => res.json())
            .then(result => {
                setData(result.data);
            })
            .catch(error => console.log('error', error))
      }, [prop]);

    return (
        <div className={classes.root}>
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Summary</span>   
                </Typography>
                <div style={{backgroundColor:"#eaeaea", width:"84%", height:"87%",borderRadius:10, margin:"auto", padding:"3%"}}>
                    <Typography className={classes.data}>
                        {data.summary}
                    </Typography>
                </div>
            </Paper>
        </div>
    );
}