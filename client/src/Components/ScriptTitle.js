import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Typography, Chip, Grid, TextField, Button} from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

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

function checkName(name) {
    var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; //특수 문자
    if (pattern_spc.test(name)) {
        return true;
    }
}

export default function ScriptTitle(prop) {
    const classes = useStyles();
    const [data, setData] = useState('');
    const [tagList, setTagList] = useState([]);
    const [addOpen, setAddOpen] = useState(false);
    const [tagName, setTagName] = useState('');

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
        
            
        fetch("/finishedmeet-taglist", requestOptions)
        .then(res => res.json())
        .then(result => {
            setTagList(result.lists);
        })
        .catch(error => console.log('error', error))
        
      }, [prop]);

    const handleDelete = (tag) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "meet_id": prop.meet_id, "tag": tag});

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/finishedmeet-deletetag", requestOptions)
            .then(res => res.json())
            .then(result => {
                console.log(result)
            })
            .catch(error => console.log('error', error))

        window.location.reload();
        
    };

    const clickAddOpen = () => {
        setAddOpen(true);
    }

    const addClose = () => {
        setAddOpen(false);
    }

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            clickTagBtn();
        }
      }

    const clickTagBtn = () => {
        if(tagName === ''){
            alert("정보를 입력해주세요.");
        }
        else if(checkName(tagName)){
            alert("특수문자는 사용하실 수 없습니다.");
        }
        else{
            
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({ "meet_id": prop.meet_id, "tag": tagName});

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("/finishedmeet-addtag", requestOptions)
                .then(res => res.json())
                .then(result => {
                    if(result.code === 0){
                    console.log(result)
                    window.location.reload();
                    }
                    else if(result.code === 32){
                        alert("태그는 최대 5개 등록할 수 있습니다.");
                    }
                })
                .catch(error => console.log('error', error))
        }
    }

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
                {tagList && tagList.map(tag => (
                    <Chip className={classes.TagChip} key={tag.tag} size="small" label={tag.tag}  onDelete={()=>handleDelete(tag.tag)} />
                ))}
                <AddCircleIcon className={classes.Icon} color="primary" fontSize="default" onClick={clickAddOpen} />
            </Grid>
          </div>
            : <div/>
          }  

            <Dialog open={addOpen} onClose={addClose} aria-labelledby="add-tag-dialog">
                <DialogTitle id="add-tag-dialog">Add Tag</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" id="tagName" label="Tag Name" autoFocus type="string" fullWidth value={tagName} onChange={({ target: { value } }) => setTagName(value)} onKeyPress={onKeyPress} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={addClose} color="secondary" variant="contained">
                        Cancel
                </Button>
                    <Button onClick={clickTagBtn} color="secondary" variant="contained">
                        Add
                </Button>
                </DialogActions>
            </Dialog>
            
        </div>
    );
}