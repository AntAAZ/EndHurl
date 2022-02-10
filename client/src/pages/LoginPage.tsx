import React, { useState, useContext } from 'react'
import axios from 'axios'
import Alert from 'react-bootstrap/Alert'
import { Navigate } from 'react-router'
import { Link } from 'react-router-dom'
import { userDataContext } from '../contexts/UserDataContext'
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { PersonFill, LockFill } from 'react-bootstrap-icons'
export default function LoginPage() {

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>("")
    const [errorAlertOpen, setErrorAlertOpen] = useState(false)
    const [loading, error] = useContext(userDataContext)

    if (loading) return <></>
    if (!error) return <Navigate to='/'/>

    const login = () => {

        axios.post(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/login`, {
            username, password
        }, {
            withCredentials: true
        })
        .then(() => window.location.reload())
        .catch((err) => {
            setErrorAlertOpen(true)
            setErrorAlertMessage(err.response.data.message)
        })
    }
   
    return (
        <div className="loginPage">

            <Row className="justify-content-center">
                <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        Please enter your login details
                    </Alert>
                    <Alert variant='danger' show={errorAlertOpen} onClose={() => setErrorAlertOpen(false)} dismissible>
                        {errorAlertMessage}
                    </Alert>
                </Col>
            </Row>
            <Form className="text-center">
                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        <Form.Label htmlFor="username" visuallyHidden>Username</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <PersonFill size="30px"/>
                            </InputGroup.Text>
                            <Form.Control
                                id="username"
                                type="username"
                                placeholder="type your username"
                                onChange={e => setUsername(e.target.value)} />
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        <Form.Label htmlFor="password" visuallyHidden>Password</Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                <LockFill size="20px"/>
                            </InputGroup.Text>
                            <Form.Control
                                id="password"
                                type="password"
                                placeholder="type your password"
                                onChange={e => setPassword(e.target.value)} />
                        </InputGroup>
                    </Col>
                </Row>
                
                <Row className="justify-content-center">
                    <Col xs='auto'>
                        <Button variant="success" onClick={login}>{'Sign into account'}</Button>
                    </Col>
                    <Col xs='auto'>
                        <Link to="../register">
                            <Button variant="primary">Don't have an acccount?</Button>
                        </Link>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}