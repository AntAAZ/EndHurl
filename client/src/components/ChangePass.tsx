import axios from 'axios'
import Alert from 'react-bootstrap/Alert'
import { Navigate } from 'react-router';
import { userDataContext } from '../contexts/UserDataContext'
import React, { useState, useContext } from 'react';
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap'
import { LockFill } from 'react-bootstrap-icons'
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
        .then(() => window.location.href = '/')
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
                <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        Change password settings panel
                    </Alert>
                    <Alert variant='danger' show={errorAlertOpen} onClose={() => setErrorAlertOpen(false)} dismissible>
                        {errorAlertMessage}
                    </Alert>
                </Col>
            </Row>
            <Form className="text-center">
                
                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        <Form.Label htmlFor="oldPassword" visuallyHidden>old pass</Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                <LockFill size="20px"/>
                            </InputGroup.Text>
                            <Form.Control
                                id="oldPassword"
                                type={passwordType}
                                placeholder={`type your old password`}
                                onChange={e => setOldPassword(e.target.value)}/>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        <Form.Label htmlFor="newPassword" visuallyHidden>new pass</Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                <LockFill size="20px"/>
                            </InputGroup.Text>
                            <Form.Control
                                id="newPassword"
                                type={passwordType}
                                placeholder={`type a new password`}
                                onChange={e => setNewPassword(e.target.value)}/>
                            <Button variant="info" onClick={togglePasswordType}>{'Reveal'}</Button>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        <Form.Label htmlFor="confirmNewPassword" visuallyHidden>confirm pass</Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                <LockFill size="20px"/>
                            </InputGroup.Text>
                            <Form.Control
                                id="confirmNewPassword"
                                type={passwordType}
                                placeholder={`confirm your new password`}
                                onChange={e => setConfirmNewPassword(e.target.value)}/>
                            <Button variant="success" onClick={changePass}>{'Submit'}</Button>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}