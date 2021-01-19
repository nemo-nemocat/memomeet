import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Tab, Tabs, Typography, Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle }from '@material-ui/core';
import Navigation from '../Components/Navigation';
import Group from '../Components/Group';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: 224,
  },
  bar: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.background.paper,
  },
  Avatar: {
    marginLeft: theme.spacing(130),
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
}));

export default function Main() {  
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Navigation />
        <div className={classes.root}>
        <Tabs
            orientation="vertical"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs"
            className={classes.tabs}
            >
                <Tab label="그룹 검색" {...a11yProps(0)} onClick={handleClickOpen} />
                <Tab label="그룹1" {...a11yProps(1)} />
                <Tab label="그룹2" {...a11yProps(2)} />
                <Tab label="그룹 추가" {...a11yProps(3)} onClick={handleClickOpen}/>
            </Tabs>
                <TabPanel value={value} index={0}>
                <div>
                    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title"></DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                    그룹 찾기
                    </DialogContentText>
                    <TextField
                    autoFocus
                    margin="dense"
                    id="group_id"
                    label="그룹 아이디"
                    type="group_id"
                    fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                    검색
                    </Button>
                </DialogActions>
                </Dialog>
                </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <Group />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <Group />
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <div>
                    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title"></DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                    그룹 만들기
                    </DialogContentText>
                    <TextField
                    autoFocus
                    margin="dense"
                    id="group_name"
                    label="그룹 이름"
                    type="group_name"
                    fullWidth
                    />
                    <TextField
                    autoFocus
                    margin="dense"
                    id="group_pw"
                    label="그룹 비밀번호"
                    type="group_pw"
                    fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                    만들기
                    </Button>
                </DialogActions>
                </Dialog>
                </div>
                </TabPanel>
                    </div> 
    </div>
  );
}