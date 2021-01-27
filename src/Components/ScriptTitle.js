import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Typography, Chip, Grid} from '@material-ui/core';
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

export default function ScriptTitle(prop) {
    const classes = useStyles();
    const [data, setData] = useState('');
    const [tagList, setTagList] = useState([]);

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

                fetch("/finishedmeet-taglist", requestOptions)
                    .then(res => res.json())
                    .then(result => {
                        var temp = [];
                        result.lists.map(list=>{
                            temp.push(list.tag);
                        })
                        setTagList(temp);
                    })
                    .catch(error => console.log('error', error))
            })
            .catch(error => console.log('error', error))
      }, []);

    return (
        <div>
          {data ? 
          <div className={classes.root}>
            <Grid>
                <Typography variant="h6" align="left" style={{width:"100%"}}>
                    <span style={{fontWeight:"bold", marginLeft:"5%"}}>{data.meet_title}</span>
                </Typography>
            </Grid>
            <Grid className={classes.grid}>
                <Chip className={classes.Chip} id="meet_day" icon={<EventIcon/>} label={data.meet_day} />
                <Chip className={classes.Chip} id="meet_time" icon={<ScheduleIcon/>} label={data.meet_time}/>
                <ChipInput className={classes.TagChip} chipRenderer={chipRenderer} defaultValue={tagList} />
            </Grid>
          </div>
            : <div/>
          }  
            
        </div>
    );
}