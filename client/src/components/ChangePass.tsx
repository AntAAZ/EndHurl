import axios from 'axios'
import Alert from 'react-bootstrap/Alert'
import { Navigate } from 'react-router';
import { userDataContext } from '../contexts/UserDataContext'
import React, { useState, useContext } from 'react';
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap'

export default function ChangePass() 
{
    const [oldPassword, setOldPassword] = useState<string>("")
    const [newPassword, setNewPassword] = useState<string>("")
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("")
    const [passwordType, setPasswordType] = useState<string>("password")

    const [errorAlertMessage, setAlertErrorMessage] = useState<string>("")
    const [errorAlertOpen, setErrorAlertOpen] = useState(false)
    const [loading, error, user] = useContext(userDataContext)
    
    if (loading) return <></>
    if (error) return <Navigate to='/login'/>

    const changePass = () => 
    {
        if (oldPassword === newPassword) 
        {
            setErrorAlertOpen(true)
            setAlertErrorMessage("The new password must be different")
            return;
        }
        if(newPassword !== confirmNewPassword)
        {
            setAlertErrorMessage("Please confirm your new password")
            return;
        }

        axios.post(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/update`, {
            username: user.username, 
            oldPassword,
            newPassword
        }, {
            withCredentials: true
        })
        .then(() => window.location.href = '/settings')
        .catch((err) => {
            setErrorAlertOpen(true)
            setAlertErrorMessage(err.response.data.message)
         })
    }

    const togglePasswordType = () => {
        passwordType === "password" ? setPasswordType("text") : setPasswordType("password")
    }

    return (
        <div className="registerPage">

            <Row className="justify-content-center">
                <Col xs={12} sm={10} md={7} lg={6} xl={5}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        <Alert.Heading>Change password settings</Alert.Heading>

                    </Alert>
                    <Alert variant='danger' show={errorAlertOpen} onClose={() => setErrorAlertOpen(false)} dismissible>
                        <Alert.Heading>{errorAlertMessage}</Alert.Heading>
                    </Alert>
                </Col>
            </Row>
            <Form className="text-center">
                <Row className="justify-content-center">
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="username" visuallyHidden>username</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>username</InputGroup.Text>
                            <Form.Control
                                id="username"
                                type="username"
                                value={`${user.username}`} disabled/>
                        </InputGroup>
                    </Col>
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="oldPassword" visuallyHidden>old pass</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>old pass</InputGroup.Text>
                            <Form.Control
                                id="oldPassword"
                                type={passwordType}
                                aria-describedby='hi'
                                onChange={e => setOldPassword(e.target.value)}/>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="newPassword" visuallyHidden>new pass</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>new pass</InputGroup.Text>
                            <Form.Control
                                id="newPassword"
                                type={passwordType}
                                onChange={e => setNewPassword(e.target.value)}/>
                            <Button variant="info" onClick={togglePasswordType}>{'👁'}</Button>
                        </InputGroup>
                    </Col>
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="confirmNewPassword" visuallyHidden>confirm pass</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>confirm pass</InputGroup.Text>
                            <Form.Control
                                id="confirmNewPassword"
                                type={passwordType}
                                onChange={e => setConfirmNewPassword(e.target.value)}/>
                            <Button variant="success" onClick={changePass}>{'>>'}</Button>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}