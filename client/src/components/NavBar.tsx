import axios from 'axios'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { userDataContext } from '../contexts/UserDataContext'
import { Navbar, Nav, NavDropdown, Image } from 'react-bootstrap'
import { PersonFill } from 'react-bootstrap-icons'

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
            <Navbar.Brand as={Link} to="/">Home</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/games">Games</Nav.Link>
                    <Nav.Link as={Link} to="/maps">Maps</Nav.Link>
                    <Nav.Link as={Link} to="/players">Players</Nav.Link>
                </Nav>
                {error ? 
                    <Nav style={{paddingRight: '20px'}}>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        <Nav.Link as={Link} to="/register">Register</Nav.Link>
                    </Nav>
                    :
                    <>
                    <Nav>
                        <NavDropdown title={user.username} align="end" id="collasible-nav-dropdown">
                            <NavDropdown.Item as={Link} to={`/players/${user.username}`}>Profile</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/customization">Customize</NavDropdown.Item>
                            
                            <NavDropdown.Item as={Link} to="/account">Settings</NavDropdown.Item>
                            <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        {user.avatar ?
                            <Image className="nav-image" src={user.avatar} width="50px" height="50px"/> :
                            <PersonFill width="50px" height="50px" style={{color: 'white'}}/>
                        }
                    </Nav>
                    </>
                }
            </Navbar.Collapse>
        </Navbar>
    )

}