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
import GetAppIcon from '@material-ui/icons/GetApp';
import LogoutIcon from '@material-ui/icons/LockOpen';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {jsPDF} from 'jspdf';
import MyFont from '../font.js';
import NoWordCloud from '../Icons/noWordcloud.png';
import no_profile from '../Icons/no_profile.png';

const useStyles = makeStyles((theme) => ({
    header: {
        minWidth:850,
        backgroundColor: "#000000",
        width: "100%",
        display: "flex",
    },
    leftBtn: {
        width: "94%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center"
    },
        headerBtn: {
        marginLeft: "5%"
    },
    root: {
        width:"90%",
        height:"12%",
        margin:"auto"
    },
    Chip: {
        fontSize: 14,
        backgroundColor: "#ffc31e",
        marginLeft:"1%",
        height:"10%",
    },
    TagChip: {
        fontSize: 14,
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
        "&:hover": {
            color: "#ffc31e"
          },
    },
    profile:{
        height:40,
        width: 40,
        borderRadius:100,
        marginRight: 10,
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
    const [user_profile] = useState(sessionStorage.getItem("user_profile"));

    useEffect(() => {

        
        if(sessionStorage.getItem("user_id") == null || sessionStorage.getItem("user_id")===""){
            alert("비정상적인 접근입니다. 로그인 후 이용하세요.\n로그인 화면으로 이동합니다.");
            window.location.href = "/";
        }

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
            .catch(error => {
                console.log('error', error)
                alert("오류가 발생하였습니다. 메인 화면으로 이동합니다.");
                window.location.href = "/main";
            })
        
            
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

    const handleClickLogout = () => {
        sessionStorage.setItem("user_id",'');
        sessionStorage.setItem("user_name",'');
        sessionStorage.setItem("preTab",-1);
        alert("로그아웃 되었습니다.");
        window.location.href = "/";
    };

    const handleDownload = (meet_id, meet_title) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "meet_id": meet_id});

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/finishedmeet-download", requestOptions)
            .then(res => res.json())
            .then(result => {
                if(result.code===0){
                    console.log(result);


                    var doc = new jsPDF();
                    var xPos = 15;
                    var yPos = 10;

                    var image = new Image();
                    if(result.wc === 'noWordcloud') doc.addImage(NoWordCloud, 'JPEG', 70, yPos, 70, 70);
                    else{
                        image.src =  result.wc;
                        doc.addImage(image, 'JPEG', 70, yPos, 70, 70);
                    } 

                    yPos += 80;

                    doc.addFileToVFS('malgun.ttf', MyFont);
                    doc.addFont('malgun.ttf', 'malgun', 'normal');
                    doc.setFont('malgun');
                    doc.setFontSize(20);

                    doc.line(15, yPos, 195, yPos);
                    yPos += 10;  
                    doc.text(85,yPos, "SUMMARY");
                    yPos += 10;
                    doc.setFontSize(12);

                    var splitText =  doc.splitTextToSize(result.summary,180)
                    doc.text(xPos, yPos, splitText);
                    var blockHeight = doc.getLineHeight(splitText);
                    yPos += blockHeight;

                    doc.line(15, yPos, 195, yPos);
                    yPos += 10;  
                    doc.setFontSize(20);
                    doc.text(90, yPos, "SCRIPT");
                    yPos += 10;
                    doc.setFontSize(12);
                    splitText =  doc.splitTextToSize(result.chat,180)
                    doc.text(xPos, yPos, splitText);

                    doc.save(`${meet_title}.pdf`);
                }
            })
            .catch(error => console.log('error', error))
    };

    return (
        <div>
        {data ? 
        <div>
        <div className={classes.header}>
            <Button style={{margin:"1%", width:"6%", minWidth:90, padding:0}} color="primary" variant="contained" href="/main" >
                <ArrowBackIcon/>&nbsp;Back
            </Button>
            <div className={classes.leftBtn}>
                <Button color="primary" variant="contained" onClick={()=>handleDownload(data.meet_id, data.meet_title)}>
                    <GetAppIcon/>&nbsp;Download
                </Button>
                <Button style={{margin:"1%"}} onClick={handleClickLogout} color="primary" variant="contained">
                    <LogoutIcon/>&nbsp;LOGOUT
                </Button>
                <span style={{color: "#ffffff", fontWeight: "bold", maxWidth: "100%", marginRight:"1%" }}>{sessionStorage.getItem("user_name")}님</span>
                <img src={(user_profile === undefined || user_profile === ''|| user_profile === 'null') ? no_profile :  user_profile} className={classes.profile} id="user_profile" alt="user_profile"/>
            </div>
        </div>
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
                    <Chip className={classes.TagChip} key={Math.random()} size="small" label={tag.tag}  onDelete={()=>handleDelete(tag.tag)} />
                ))}
                <AddCircleIcon className={classes.Icon} color="secondary" fontSize="default" onClick={clickAddOpen} />
            </Grid>
          </div></div>
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