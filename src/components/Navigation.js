import React from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar } from '@material-ui/core';
import 'bootstrap/dist/css/bootstrap.min.css';

const useStyles = makeStyles((theme) => ({
    bar: {
        backgroundColor: "#ffc31e",
        color: "#ffffff",
    },
    Avatar: {
      marginLeft: theme.spacing(105),
    },
  }));

function Navigation() {
    const classes = useStyles();

    return (
        <div className={classes.bar}>
            <Navbar collapseOnSelect expand="lg">
            <Navbar.Brand href="/Main">Memo-meet</Navbar.Brand>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                    <Avatar className={classes.Avatar}>H</Avatar>
                    <Nav.Link>이용자 이름</Nav.Link>
                    <Nav.Link href="/">로그아웃</Nav.Link>
                </Nav>
            </Navbar.Collapse>
            </Navbar>
        </div>
    );
}

export default Navigation;