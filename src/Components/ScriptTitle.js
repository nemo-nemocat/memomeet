import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Paper, Typography, Chip, Button, Grid} from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ChipInput from 'material-ui-chip-input';

const useStyles = makeStyles((theme) => ({
    root: {
        width:"90%",
        height:"10%",
        margin:"1%"
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
        textAlign:"left",
        marginLeft:"4%"
    }
}));

const chipRenderer = ({ chip, className, handleClick, handleDelete }, key) => (
    <Chip
      className={className}
      key={key}
      label={chip}
      onClick={handleClick}
      onDelete={handleDelete}
      size="small"
    />
  );
  
  const defaultValue = ["주제 선정", "영어 동화", "화상 회의"];

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

    return (
        <div className={classes.root}>
            <Grid>
                <Typography variant="h6" align="left" style={{width:"100%"}}>
                    <span style={{fontWeight:"bold", marginLeft:"5%"}}>[졸업프로젝트]</span>
                    <span style={{fontWeight:"bold", marginLeft:"1%"}}>1회차 회의</span>
                </Typography>
            </Grid>
            <Grid className={classes.grid}>
                <Chip className={classes.Chip} id="meet_day" icon={<EventIcon/>} label="2021-01-21" />
                <Chip className={classes.Chip} id="meet_time" icon={<ScheduleIcon/>} label="13:00"/>
                <ChipInput className={classes.TagChip} chipRenderer={chipRenderer} defaultValue={defaultValue} />
            </Grid>
        </div>
    );
}