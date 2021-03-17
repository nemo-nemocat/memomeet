import React, { useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LinkIcon from '@material-ui/icons/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GroupIcon from '@material-ui/icons/Group';
import LogoutIcon from '@material-ui/icons/LockOpen';
import no_profile from '../Icons/no_profile.png';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
  header: {
    minWidth:1000,
    backgroundColor: "#000000",
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  headerBtn: {
    marginLeft: "5%"
  },
  profile:{
    height:40,
    width: 40,
    borderRadius:100,
    marginRight: 10,
  }
}));

export default function Header(prop) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [members, setGroupMember] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [state, setState] = useState({});
  const [user_profile, setProfile] = useState(sessionStorage.getItem("user_profile"));

  const changeProfile = () => {
    setProfileOpen(true);
  }

  const createClose = () => {
    setProfileOpen(false);
    setState({});
  }

  const onChange =(e)=> {
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend =()=>{
      setState({
        file: file,
        previewURL: reader.result
      })
    }
    reader.readAsDataURL(file);
  }

  const handleClickLogout = () => {
    sessionStorage.setItem("user_id",'');
    sessionStorage.setItem("user_name",'');
    sessionStorage.setItem("user_profile",'');
    sessionStorage.setItem("preTab",-1);
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  const handleClickMember = (event) => {
      setAnchorEl(event.currentTarget);

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
  
      var raw = JSON.stringify({ "group_id": prop.group_id });
  
      var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
      };
  
      fetch("/group-memberlist", requestOptions)
          .then(res => res.json())
          .then(result => {
              console.log(result);
              if (result.code === 0) {
                setGroupMember(result.members);
              }
          })
          .catch(error => console.log('error', error))
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleClickGroupId = () => {
    var t = document.createElement("textarea");
    var user_name = sessionStorage.getItem("user_name");
    
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "group_id": prop.group_id });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("/group-search", requestOptions)
        .then(res => res.json())
        .then(result => {
            console.log(result);
            if (result.code === 0) {
              document.body.appendChild(t);
              t.value = `📝MEMO-MEET📝\n${user_name}님이 [${result.grouplist.group_name}] 그룹 초대 메세지를 보냈습니다. \n🔒그룹ID: ${prop.group_id}\n🔑그룹PW: ${result.grouplist.group_pw}`;
              t.select();
              document.execCommand('copy');
              document.body.removeChild(t);
              alert("그룹 초대 메세지가 복사되었습니다");
            }
        })
        .catch(error => console.log('error', error))
  }

  const changeBtnClick =()=> {
    if(state.file === undefined) alert("사진을 선택해주세요");
    else{
      var formData = new FormData();
      var fileField = document.querySelector('input[type="file"]');

      formData.append('user_id', sessionStorage.getItem("user_id"));
      formData.append('profile', fileField.files[0]);

      fetch("/profile-upload",{
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(result => {
        console.log(result);
        setProfile(result.profile_url);
        setProfileOpen(false);
        sessionStorage.setItem("user_profile",result.profile_url);
        setState({});
      })
      .catch(error => console.error('Error:', error))
    }
  }

  const removeBtnClick =()=> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "user_id": sessionStorage.getItem("user_id")});

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("/profile-remove", requestOptions)
      .then(res => res.json())
      .then(result => {
          console.log(result);
          setProfile(undefined);
          setProfileOpen(false);
          setState({});
          alert("기본 이미지로 변경합니다");
      })
      .catch(error => console.log('error', error))
  }

  return (
    <div className={classes.header}>
      {(prop.group_id !== '-1') ?
      <div style={{display:"flex"}}>
        <Button className={classes.headerBtn} onClick={handleClickGroupId} color="primary" variant="contained">
          <LinkIcon /> &nbsp;INVITE
        </Button>
        <Button className={classes.headerBtn} onClick={handleClickMember} aria-controls="simple-menu" aria-haspopup="true" color="primary" variant="contained">
          <GroupIcon/>&nbsp;MEMBERS
        </Button>
      </div>
        : <div />
      }
      <Menu
          keepMounted
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {members && members.map(member => (
            <MenuItem >{member.user_name}</MenuItem>
          ))}
      </Menu>
      <Button style={{margin:"1%"}}onClick={handleClickLogout} color="primary" variant="contained">
        <LogoutIcon/>&nbsp;LOGOUT
      </Button>
      <span style={{color: "#ffffff", fontWeight: "bold", maxWidth: "100%", marginRight:"1%" }}>{sessionStorage.getItem("user_name")}님</span>
      <img src={(user_profile === undefined || user_profile === ''|| user_profile === 'null') ? no_profile :  user_profile} className={classes.profile} id="user_profile" alt="user_profile" onClick={()=>changeProfile()}/>

      <Dialog open={profileOpen} onClose={createClose} aria-labelledby="change-profile-dialog">
        <DialogTitle id="change-profile-dialog">Change Profile</DialogTitle>
        <DialogContent>
          jpg, png, jpeg 형식의 이미지를 선택해주세요<br/><br/>
          <img src={(state.file !=='' && state.file !== undefined) ?state.previewURL: no_profile} alt="profile_preview" width="100" height="100"/>
          <input type="file" onChange={onChange} name="profile" id="real-input" accept="image/jpg, image/png, image/jpeg" required multiple/>
          <Button color='primary' variant='contained' onClick={()=>changeBtnClick()} style={{marginLeft:"35%", marginRight:"5%"}}>CHANGE</Button>
          <Button color='primary' variant='contained' onClick={()=>removeBtnClick()}>REMOVE</Button>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}