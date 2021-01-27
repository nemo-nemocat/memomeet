import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Typography, Chip, Grid} from '@material-ui/core';
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

    const handleDelete = () => {
        console.info('Delete tag.');
    };

    return (
        <div>
          {data ? 
          <div className={classes.root}>
            <Grid>
                <Typography variant="h6" align="left" style={{width:"100%", marginTop:"1%"}}>
                    <span style={{fontWeight:"bold", marginLeft:"1%"}}>{data.meet_title}</span>
                </Typography>
            </Grid>
            <Grid className={classes.grid}>
                <Chip className={classes.Chip} id="meet_day" icon={<EventIcon/>} label={data.meet_day} />
                <Chip className={classes.Chip} id="meet_time" icon={<ScheduleIcon/>} label={data.meet_time}/>
                <Chip className={classes.TagChip} size="small" label="주제 선정" onDelete={handleDelete} />
                <Chip className={classes.TagChip} size="small" label="영어 동화" onDelete={handleDelete} />
                <Chip className={classes.TagChip} size="small" label="화상 회의" onDelete={handleDelete} />
                <AddCircleIcon className={classes.Icon} color="primary" fontSize="medium" />
            </Grid>
          </div>
            : <div/>
          }  
            
        </div>
    );
}