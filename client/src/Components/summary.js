import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography } from '@material-ui/core';
import Chart from'./Chart';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"85%",
        height:"50%",
        marginTop:"1%",
        marginLeft:"10%",
    },
    paper: {
        marginLeft:"1%",
        width:"100%",
        height:"100%", 
        paddingTop:"1%",
        marginTop:"3%",
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
    const [data, setData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [contribution, setContribution] = useState('');

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
                console.log(result);
                setData(result.data.summary.split(','));
                setUserData(result.contributions);
                setContribution(result.data.contribution_values);
            })
            .catch(error => console.log('error', error))
      }, [prop]);

    return (
        <div className={classes.root}>
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Summary</span>   
                </Typography>
                <div style={{backgroundColor:"#eaeaea", width:"84%", height:"60%",borderRadius:10, margin:"auto", padding:"3%", textAlign: "left" }}>
                    <Typography className={classes.data}>
                        {data && data.map(element =>(
                            <Typography key={Math.random()}>{element}</Typography>
                        ))}
                    </Typography>
                </div>
            </Paper>
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" align="center">
                    <span style={{fontWeight: "bold", textDecoration:"underline overline", textDecorationColor:"#ffc31e"}}>Contribution</span>   
                </Typography>
                <div style={{backgroundColor:"#eaeaea", width:"84%", height:"70%",borderRadius:10, margin:"auto", padding:"3%", display:"table"}}>
                    < Chart userData={userData} contribution={contribution}/>
                </div>
            </Paper>
        </div>
    );
}