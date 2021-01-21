import React, { useState} from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

export default function GroupCreateBtn() {
    const [createOpen, setCreateOpen] = useState(false);
    const [group_name, setGroupName] = useState('');
    const [group_pw, setGroupPw] = useState('');
    const [pw_check, setPwCheck] = useState('');

    const clickCreateOpen = () => {
        setCreateOpen(true);
    }

    const createClose = () => {
        setCreateOpen(false);
    }

    const groupCreate = () => {
        if (group_name === '' || group_pw === '' || pw_check==='') {
            alert("빈칸에 정보를 입력하세요");
        }
        else if(group_pw.length <8){
            alert("비밀번호는 8자리 이상으로 설정해주세요");
        }
        else if(group_pw !== pw_check){
            alert("비밀번호가 일치하지 않습니다.");
        }
        else {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({ "group_name": group_name, "group_pw": group_pw });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("/group-create", requestOptions)
                .then(res => res.json())
                .then(result => {
                    console.log(result);
                    if(result.code ===0){
                        alert(`${group_name} 그룹을 생성 하였습니다.`);
                        setCreateOpen(false);
                        window.location.reload();
                    }
                })
                .catch(error => console.log('error', error))
        }
    }

    return (
        <div>
            <Button variant="contained" color="secondary" size="large" onClick={clickCreateOpen}>
                <Typography component="h1" variant="button">
                    NEW GROUP CREATE
                </Typography>
            </Button>
            <Dialog open={createOpen} onClose={createClose} aria-labelledby="create-group-dialog">
                <DialogTitle id="search-group-dialog">Create Group</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" id="name" label="New Group Name" type="string" fullWidth value={group_name} onChange={({ target: { value } }) => setGroupName(value)} />
                    <TextField margin="dense" id="pw" label="New Group Password" type="password" fullWidth value={group_pw} onChange={({ target: { value } }) => setGroupPw(value)} />
                    <TextField margin="dense" id="pw_check" label="Password Check" type="password" fullWidth value={pw_check} onChange={({ target: { value } }) => setPwCheck(value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={createClose} color="secondary" variant="contained">
                        Cancel
            </Button>
                    <Button onClick={groupCreate} color="secondary" variant="contained">
                        Create
            </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}