import axios from 'axios'
import Alert from 'react-bootstrap/Alert'
import { Navigate } from 'react-router';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { userDataContext } from '../contexts/UserDataContext'
import React, { useState, useContext, useRef } from 'react';
import { PersonFill, LockFill } from 'react-bootstrap-icons'
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap'

export default function RegisterPage() {

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
    if (!error) return <Navigate to='/' />

    const register = () => {

        if (password !== confirmPassword) {
            setErrorAlertOpen(true)
            setAlertErrorMessage("Both entered passwords must match!")
            return;
        }

        if (!captchaToken) {
            setErrorAlertOpen(true)
            setAlertErrorMessage("Make sure you have completed the captcha!")
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
                <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        Please fill out the registration form
                    </Alert>
                    <Alert variant='danger' show={errorAlertOpen} onClose={() => setErrorAlertOpen(false)} dismissible>
                        {errorAlertMessage}
                    </Alert>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                    <InputGroup>
                        <InputGroup.Text>
                            <PersonFill size="30px" />
                        </InputGroup.Text>
                        <Form.Control
                            id="username"
                            type="username"
                            placeholder="username (3 - 15 symbols)"
                            onChange={e => setUsername(e.target.value)} />
                    </InputGroup>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                    <InputGroup>
                        <InputGroup.Text style={{ paddingLeft: '5px', paddingRight: '5px' }}>
                            <LockFill size="20px" />
                        </InputGroup.Text>
                        <Form.Control
                            id="password"
                            type={passwordType}
                            placeholder="password ( > 6 symbols )"
                            onChange={e => setPassword(e.target.value)} />
                    </InputGroup>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                    <InputGroup>
                        <InputGroup.Text style={{ paddingLeft: '5px', paddingRight: '5px' }}>
                            <LockFill size="20px" />
                        </InputGroup.Text>
                        <Form.Control
                            id="confirmPassword"
                            type={passwordType}
                            placeholder="confirm your password"
                            onChange={e => setConfirmPassword(e.target.value)} />
                    </InputGroup>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs='auto'>
                    <span className="captcha">
                        <HCaptcha
                            ref={captcha}
                            sitekey={process.env.REACT_APP_HCAPTCHA_KEY || ""}
                            onVerify={token => setCaptchaToken(token)}
                            onExpire={() => setCaptchaToken("")}
                        />
                    </span>
                </Col>
                <Col xs='auto'>
                    <Button variant="success" onClick={register} style={{marginTop: '10px'}}>{'Register account'}</Button>
                </Col>
            </Row>
        </div>
    )

}