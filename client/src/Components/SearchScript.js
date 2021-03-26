import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: "1%",
    paddingTop: "2%"
  },
  search: {
    position: 'relative',
    borderRadius: 5,
    backgroundColor: "#ffc31e",
    '&:hover': {
      backgroundColor: "#e2aa0f",
    },
    marginRight: "1%",
    marginLeft: "3%",
    width: '94%',
  },
  searchIcon: {
    marginLeft:"5%",
    height: '100%',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: "75%"
  },
  inputInput: {
    paddingTop: "3%",
    paddingBottom: "3%",
    paddingLeft: "3%",
    width: '100%',
  },
}));

export default function Searchbar() {
  const classes = useStyles();

  return (
    <div className={classes.grow}>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search Script..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
    </div>
  );
}