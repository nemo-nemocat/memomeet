import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navigation() {
  return (
    <div className="Navigation">
        <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
            <Navbar.Brand href="./">Memo-meet</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="./Signin">로그인</Nav.Link>
                    <Nav.Link href="./Signup">회원가입</Nav.Link>
                    <Nav.Link href="./StartMt">회의시작</Nav.Link>
                    <Nav.Link href="./AdminMt">회의관리</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>

    </div>
  );
}

export default Navigation;