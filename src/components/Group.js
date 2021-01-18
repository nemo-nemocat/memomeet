import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {  Grid, Paper, Typography, TextField, Button, Chip } from '@material-ui/core';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        Width: 500,
    },
    papers: {
        padding: theme.spacing(2),
        marginTop: 20,
        Width: 500,
    },
    container: {
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
        marginTop: theme.spacing(2),
    },
    Chip: {
        backgroundColor: "#F8EF7A",
        width: 230,
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(3),
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
                        <form className={classes.container}>
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
                        <form className={classes.container}>
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

            <Paper className={classes.papers}>
                <Typography variant="h6" align="left">
                    예정 회의
                </Typography>
                <Grid>
                    <Chip
                    className={classes.Chip}
                    id="meet_title"
                    icon={<LibraryBooksIcon />}
                    label="졸업프로젝트 3회차"
                    />
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

            <Paper className={classes.papers}>
                <Typography variant="h6" align="left" gutterBottom>
                    지난 회의
                </Typography>
                <Grid>
                    <Chip
                    className={classes.Chip}
                    id="meet_title"
                    icon={<LibraryBooksIcon />}
                    label="졸업프로젝트 1회차"
                    />
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
                <Grid container spacing={0.5}>
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
                </Grid>
                <Grid>
                <Chip
                    className={classes.Chip}
                    id="meet_title"
                    icon={<LibraryBooksIcon />}
                    label="졸업프로젝트 2회차"
                    />
                    <Chip
                    className={classes.Chip}
                    id="meet_day"
                    icon={<EventIcon />}
                    label="2021/01/18"
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
                        분석 보기
                    </Button>
                </Grid>
                <Grid container spacing={0.5}>
                    <Chip className={classes.Tag}
                    variant="outlined" 
                    size="small" 
                    label="기술검증" />
                    <Chip className={classes.Tag}
                    variant="outlined" 
                    size="small" 
                    label="webRTC" />
                    <Chip className={classes.Tag}
                    variant="outlined" 
                    size="small" 
                    label="역할분배" />
                    <Chip className={classes.Tag}
                    variant="outlined" 
                    size="small" 
                    label="프론트엔드" />
                    <Chip className={classes.Tag}
                    variant="outlined" 
                    size="small" 
                    label="백엔드" />
                </Grid>
            </Paper>
        </div>
    );
}