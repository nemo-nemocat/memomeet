import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Chip} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    TagChip: {
        fontSize: 14,
        marginRight:"1%",
        marginTop:"1%"
    },
}));

export default function TagList(prop) {
    const classes = useStyles();
    const [list, setList] = useState([]);

    useEffect(() => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "meet_id": prop.data.meet_id});

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/finishedmeet-taglist", requestOptions)
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
        <div>
            {list && list.map(data=>(
                <Chip key={data.tag} className={classes.TagChip} variant="outlined" size="small" label={data.tag}/>
            ))}
        </div>
    );
}