import axios from 'axios'
import React, { useState, useContext, useRef } from 'react';
import Alert from 'react-bootstrap/Alert'
import { userDataContext } from '../contexts/UserDataContext'
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap'
import HCaptcha from '@hcaptcha/react-hcaptcha';
export default function RegisterPage() 
{
    const captcha = useRef<any>()
    const [captchaToken, setCaptchaToken] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [passwordType, setPasswordType] = useState<string>("password")
    const [errorAlertMessage, setAlertErrorMessage] = useState<string>("")
    const [errorAlertOpen, setErrorAlertOpen] = useState(false)
    const [loading, error] = useContext(userDataContext)
    
    if (loading) return <></>
    if (!error) {
        window.location.href = '/'
        return <></>
    }

    const register = () => {
        if (password !== confirmPassword) {
            setErrorAlertOpen(true)
            setAlertErrorMessage("Both passwords must match!")
            return;
        }

        if (!captchaToken) {
            setErrorAlertOpen(true)
            setAlertErrorMessage("You need to complete the captcha!")
            return;
        }

        axios.post(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/register`, {
            username, password
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
                <Col xs={12} sm={10} md={10} lg={8} xl={6}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        <Alert.Heading>Please fill out the registration form</Alert.Heading>

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
                                onChange={e => setUsername(e.target.value)}/>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="password" visuallyHidden>Password</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>password</InputGroup.Text>
                            <Form.Control
                                id="password"
                                type={passwordType}
                                onChange={e => setPassword(e.target.value)}/>
                            <Button variant="info" onClick={togglePasswordType}>{'check'}</Button>
                        </InputGroup>
                        <Form.Label htmlFor="confirmPassword" visuallyHidden>confirmPassword</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>confPass</InputGroup.Text>
                            <Form.Control
                                id="confirmPassword"
                                type={passwordType}
                                onChange={e => setConfirmPassword(e.target.value)}/>
                            <Button variant="success" onClick={register}>{'submit'}</Button>
                        </InputGroup>
                    </Col>
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <div className="captcha">
                            <HCaptcha
                                ref={captcha}
                                sitekey={process.env.REACT_APP_HCAPTCHA_KEY || ""}
                                onVerify={token => setCaptchaToken(token)}
                                onExpire={() => setCaptchaToken("")}
                            />
                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    )

}