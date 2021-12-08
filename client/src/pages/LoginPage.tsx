import React, { useState, useContext } from 'react'
import axios from 'axios'
import Alert from 'react-bootstrap/Alert'
import { Navigate } from 'react-router'
import { userDataContext } from '../contexts/UserDataContext'
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap'

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
        .then(() => window.location.href = '/')
        .catch((err) => {
            setErrorAlertOpen(true)
            setErrorAlertMessage(err.response.data.message)
        })
    }
   
    return (
        <div className="loginPage">

            <Row className="justify-content-center">
                <Col xs={12} sm={10} md={10} lg={8} xl={6}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        <Alert.Heading>Please enter your login details</Alert.Heading>
                    </Alert>
                    <Alert variant='danger' show={errorAlertOpen} onClose={() => setErrorAlertOpen(false)} dismissible>
                        <Alert.Heading>{errorAlertMessage}</Alert.Heading>
                    </Alert>
                </Col>
            </Row>
            <Form className="text-center">
                <Row className="justify-content-center">
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="username" visuallyHidden>Username</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>username</InputGroup.Text>
                            <Form.Control
                                id="username"
                                type="username"
                                onChange={e => setUsername(e.target.value)} />
                        </InputGroup>
                    </Col>

                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="password" visuallyHidden>Password</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>password</InputGroup.Text>
                            <Form.Control
                                id="password"
                                type="password"
                                onChange={e => setPassword(e.target.value)} />
                            <Button variant="success" onClick={login}>{'>>'}</Button>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}