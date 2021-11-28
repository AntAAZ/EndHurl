import axios from 'axios'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { userDataContext } from '../contexts/UserDataContext'
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap'

export default function NavBar() 
{
    const [loading, error, user] = useContext(userDataContext)

    const logout = () => {
        axios.get(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/logout`, {
            withCredentials: true
        }).then(() => window.location.href = '/')
    }

    if (loading) return <></>

    return (
        <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
            <Navbar.Brand href="/" style={{ paddingLeft: "40px" }}>Home</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/games" style={{ paddingLeft: "40px" }}>Games</Nav.Link>
                    <Nav.Link as={Link} to="/maps">Maps</Nav.Link>
                </Nav>
                {error ?
                    <Nav>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        <Nav.Link as={Link} to="/register" style={{ paddingRight: "40px" }}>Register</Nav.Link>
                    </Nav>
                    :
                    <Nav>
                        <NavDropdown title={user.username} id="collasible-nav-dropdown" style={{ paddingRight: "40px" }}>
                            <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                            <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                }
            </Navbar.Collapse>
        </Navbar>
    )


}