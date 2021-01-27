import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, Chip, Button, Grid, Icon} from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"90%",
        height:"12%",
        margin:"auto"
    },
    Chip: {
        backgroundColor: "#ffc31e",
        marginLeft:"1%",
        height:"10%",
    },
    TagChip: {
        marginLeft:"1%",
    },
    button: {
        marginTop:"1%",
    },
    grid: {
        display:"flex",
        justifyContent:"flex-start",
        alignItems:"center",
    },
    Icon: {
        marginLeft:"1%",
    }
}));

export default function ScriptTitle(prop) {
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

    const handleDelete = () => {
        console.info('Delete tag.');
    };

    return (
        <div className={classes.root}>
            <Grid>
                <Typography variant="h6" align="left" style={{width:"100%", marginTop:"1%"}}>
                    <span style={{fontWeight:"bold", marginLeft:"1%"}}>1회차 회의</span>
                </Typography>
            </Grid>
            <Grid className={classes.grid}>
                <Chip className={classes.Chip} id="meet_day" icon={<EventIcon/>} label="2021-01-21" />
                <Chip className={classes.Chip} id="meet_time" icon={<ScheduleIcon/>} label="13:00"/>
                <Chip className={classes.TagChip} size="small" label="주제 선정" onDelete={handleDelete} />
                <Chip className={classes.TagChip} size="small" label="영어 동화" onDelete={handleDelete} />
                <Chip className={classes.TagChip} size="small" label="화상 회의" onDelete={handleDelete} />
                <AddCircleIcon className={classes.Icon} color="primary" fontSize="medium" />
            </Grid>
        </div>
    );
}