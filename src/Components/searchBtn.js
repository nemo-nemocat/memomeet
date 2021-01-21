import React, { useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    searchBtn: {
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "54%",
        margin: "auto",
        borderRadius: 50
    }
}));

export default function SearchBtn() {
    const classes = useStyles();
    const [searchOpen, setSearchOpen] = useState(false);
    const [result, setResult] = useState(false);
    const [group_id, setGroupId] = useState('');
    const [group_pw, setGroupPw] = useState('');
    const [group_name, setGroupName] = useState('');
    const [group_member, setGroupMember] = useState('');
    const user_id= sessionStorage.getItem("user_id")

    const clickSearchOpen = () => {
        setSearchOpen(true);
    }

    const searchClose = () => {
        setSearchOpen(false);
        setResult(false);
    }

    const groupSearch = () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "group_id": group_id });

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
                    setResult(true);
                    setGroupName(result.grouplist.group_name);
                    fetch("/group-memberlist", requestOptions)
                        .then(res2 => res2.json())
                        .then(result2 => {
                            console.log(result2);
                            var members="";
                            result2.members.map(result=>(
                              members += result.user_name + " "
                            ));
                    
                            setGroupMember(members);
                        })
                }
                else setResult(false);
            })
            .catch(error => console.log('error', error))
    }

    const groupEnter = () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "group_id": group_id, "group_pw": group_pw, "user_id": user_id });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("/group-enter", requestOptions)
            .then(res => res.json())
            .then(result => {
                console.log(result);
                if (result.code === 23) alert('이미 소속된 그룹입니다.');
                else if (result.code === 22) {
                    alert('잘못된 비밀번호 입니다.');
                }
                else if (result.code === 0) {
                    alert(`${group_name} 그룹을 추가했습니다.`);
                    setSearchOpen(false);
                    window.location.reload();
                }
            })
            .catch(error => console.log('error', error))
    }


    return (
        <div>
        <div className={classes.searchBtn} onClick={clickSearchOpen}>
            <SearchIcon style={{ color: "#ffffff", marginTop: 5 }} fontSize="small" />
            <span className="align-middle" style={{ color: "#ffffff", fontWight: "bold", fontSize: 12 }}>GROUP SEARCH</span>
        </div>
         
        <Dialog open={searchOpen} onClose={searchClose} aria-labelledby="search-group-dialog">
            <DialogTitle id="search-group-dialog">Search Group</DialogTitle>
            <DialogContent>
            <TextField autoFocus margin="dense" id="search_group_id" label="Group ID" width="70%" value={group_id} onChange={({ target: { value } }) => setGroupId(value)} />
            <Button onClick={groupSearch} color="secondary" variant="contained" size="small">
                Search
            </Button>
            <hr style={{ color: "#ffa500" }} />
            {!result && <Typography variant="body2"> 검색 결과가 없습니다.</Typography>}
            {result &&
                <ListItem key={group_id} style={{ backgroundColor: "#fdf5e6", borderRadius: 10, flexDirection: "column" }}>
                    <ListItemText primary={group_name} secondary={group_member} style={{ width: 200 }} />
                    <TextField margin="dense" id="search_group_pw" label="Group Password" color="secondary" width="70%" value={group_pw} onChange={({ target: { value } }) => setGroupPw(value)} />
                    <Button onClick={groupEnter} color="secondary" variant="contained" size="small">
                        Enter
                    </Button>
                </ListItem>}
            </DialogContent>
        </Dialog>
        </div>
  );
}