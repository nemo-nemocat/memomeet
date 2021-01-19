import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {  Grid, Paper, Typography, TextField, Button, Chip, Container } from '@material-ui/core';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        Width: 250,
    },
    papers: {
        padding: theme.spacing(2),
        marginTop: 20,
        width: 400,
        height: 600,
    },
    Subpaper: {
        marginTop: theme.spacing(1),
        width: 370,
        height: 80,
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: theme.spacing(2),
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    Button: {
        backgroundcolor: "#ffc31e",
        width: 100,
        marginLeft: theme.spacing(1),

    },
    Title: {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(2),
    },
    Chip: {
        backgroundColor: "#F8EF7A",
        width: 120,
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    Tag: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
  }));

export default function Group() {
    const classes = useStyles();
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const handleDateChange = (date) => {setSelectedDate(date);};

    return(
    <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant="h6" align="left">
                    회의 예약
                </Typography>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Grid container justify="space-around">
                        <form className={classes.form}>
                        <TextField className={classes.textField}
                        id="meet_title"
                        label="회의명"
                        />
                        </form>
                        <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="yyyy/MM/dd"
                        margin="normal"
                        id="meet_day"
                        label="예약 날짜"
                        value={selectedDate}
                        onChange={handleDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        />
                        <form className={classes.form}>
                        <TextField
                        id="meet_time"
                        label="예약 시간"
                        type="time"
                        className={classes.textField}
                        InputLabelProps={{
                        shrink: true,
                        }}
                        inputProps={{
                        step: 300,
                        }}
                        />
                        </form>
                        <Button 
                        className={classes.Button} 
                        height="50"
                        variant="contained"
                        color="primary" >
                            회의 예약
                        </Button>
                    </Grid>
                </MuiPickersUtilsProvider>
            </Paper>

    <Grid container spacing={12}>
        <Grid item xs={6}>
            <Paper className={classes.papers}>
                <Typography variant="h6" align="left">
                    예정 회의
                </Typography>
                <Paper className={classes.Subpaper}>
                    <Grid className={classes.Title} align="left">
                        <Typography variant="h6">
                            project2
                        </Typography>
                    </Grid>
                    <Grid align="left">
                        <Chip
                        className={classes.Chip}
                        id="meet_day"
                        icon={<EventIcon />}
                        label="2021/01/20"
                        />
                        <Chip
                        className={classes.Chip}
                        id="meet_time"
                        icon={<ScheduleIcon />}
                        label="오후 12:30"
                        />
                        <Button 
                        className={classes.Button} 
                        height="30"
                        variant="contained" 
                        color="primary"
                        >
                            회의 시작
                        </Button>
                    </Grid>
                </Paper>
                <Paper className={classes.Subpaper}>
                    <Grid className={classes.Title} align="left">
                        <Typography variant="h6">
                            project3
                        </Typography>
                    </Grid>
                    <Grid align="left">
                        <Chip
                        className={classes.Chip}
                        id="meet_day"
                        icon={<EventIcon />}
                        label="2021/01/20"
                        />
                        <Chip
                        className={classes.Chip}
                        id="meet_time"
                        icon={<ScheduleIcon />}
                        label="오후 12:30"
                        />
                        <Button 
                        className={classes.Button} 
                        height="30"
                        variant="contained" 
                        color="primary"
                        >
                            회의 시작
                        </Button>
                    </Grid>
                </Paper>
            </Paper>
        </Grid>

        <Grid item xs={6}>
            <Paper className={classes.papers}>
                <Typography variant="h6" align="left">
                    지난 회의
                </Typography>
                <Paper className={classes.Subpaper}>
                    <Grid className={classes.Title} align="left">
                        <Typography variant="h6">
                            project1
                        </Typography>
                    </Grid>
                    <Grid align="left">
                        <Chip
                        className={classes.Chip}
                        id="meet_day"
                        icon={<EventIcon />}
                        label="2021/01/16"
                        />
                        <Chip
                        className={classes.Chip}
                        id="meet_time"
                        icon={<ScheduleIcon />}
                        label="오전 11:30"
                        />
                        <Button 
                        className={classes.Button} 
                        height="30"
                        variant="contained"
                        color="primary"
                        >
                            분석 보기
                        </Button>
                    </Grid>
                    <Grid container spacing={0.5} align="left">
                        <Chip className={classes.Tag}
                        variant="outlined" 
                        size="small" 
                        label="프로젝트 주제" />
                        <Chip className={classes.Tag}
                        variant="outlined" 
                        size="small" 
                        label="영어동화" />
                        <Chip className={classes.Tag}
                        variant="outlined" 
                        size="small" 
                        label="화상회의" />
                        <Chip className={classes.Tag}
                        variant="outlined" 
                        size="small" 
                        label="중고거래" />
                        <Chip className={classes.Tag}
                        variant="outlined" 
                        size="small" 
                        label="미술치료" />
                    </Grid>
                </Paper>
                    
            </Paper>
        </Grid>
    </Grid>
            
            
        </div>
    );
}