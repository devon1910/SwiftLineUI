import React from 'react'
import { Nav, Navbar } from 'react-bootstrap';

const Navigation = ({onPageChange} ) => {
    return (
        <Navbar bg="light" expand="lg">
          <Navbar.Brand>swiftLine</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link onClick={() => onPageChange("dashboard")}>
                Dashboard
              </Nav.Link>
              <Nav.Link onClick={() => onPageChange("search")}>
                Search Events
              </Nav.Link>
              <Nav.Link onClick={() => onPageChange("myevents")}>
                My Events
              </Nav.Link>
              <Nav.Link onClick={() => onPageChange("myqueue")}>
                My Queue
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      );
}

export default Navigation
