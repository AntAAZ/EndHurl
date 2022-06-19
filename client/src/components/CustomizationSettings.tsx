import axios from 'axios'
import Alert from 'react-bootstrap/Alert'
import { Navigate } from 'react-router';
import { userDataContext } from '../contexts/UserDataContext'
import React, { useState, useContext, useRef } from 'react';
import { Receipt } from 'react-bootstrap-icons'
import { Form, Row, Col, InputGroup, Button, Image } from 'react-bootstrap'

export default function CustomizationSettings() {
    const inputRef = useRef<any>(null);
    const [bio, setBio] = useState<string>("")
    const [loc, setLoc] = useState<string>("")
    const [avatarImage, setAvatarImage] = useState<any>(null);
    const [errorAlertMessage, setAlertErrorMessage] = useState<string>("")
    const [errorAlertOpen, setErrorAlertOpen] = useState(false)
    const [loading, error, user] = useContext(userDataContext)

    const handleFileSelection = () => {
        inputRef.current?.click();
    }

    if (loading) return <></>
    if (error) return <Navigate to='/login' />

    const setAvatar = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            let img = e.target.files[0];
            let extension = img.name.split('.').pop()

            if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
                setAvatarImage(img)
            } else {
                setErrorAlertOpen(true);
                setAlertErrorMessage('The extension of the file must be png/jpg/jpeg')
            }
        }
    }

    const upload = () => {
        if (avatarImage === null) {
            setErrorAlertOpen(true);
            setAlertErrorMessage('Please select a file to upload')
            return
        }
        const formData: FormData = new FormData();
        formData.append('avatar', avatarImage);

        axios.post(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/uploadAvatar`, formData,
        {
            withCredentials: true
        })
        .then(() => window.location.href = '/customization')
        .catch((err) => {
            setErrorAlertOpen(true)
            setAlertErrorMessage(err.response.data.message)
        })
    }

    const updateBio = () => {
        axios.post(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/bio`, {
            username: user.username, bio
        }, {
            withCredentials: true
        })
        .then(() => window.location.href = '/customization')
        .catch((err) => {
            setErrorAlertOpen(true)
            setAlertErrorMessage(err.response.data.message)
        })
    }

    const updateLoc = () => {
        axios.post(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/loc`, {
            username: user.username, loc
        }, {
            withCredentials: true
        })
        .then(() => window.location.href = '/customization')
        .catch((err) => {
            setErrorAlertOpen(true)
            setAlertErrorMessage(err.response.data.message)
        })
    }

    const deleteAvatar = () => {
        axios.post(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/deleteAvatar`, {
            username: user.username, loc
        }, {
            withCredentials: true
        })
        .then(() => window.location.href = '/customization')
        .catch((err) => {
            setErrorAlertOpen(true)
            setAlertErrorMessage(err.response.data.message)
        })
    }

    return (
        <div className="registerPage">
            <Row className="justify-content-center">
                <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        Customization settings panel
                    </Alert>
                    <Alert variant='danger' show={errorAlertOpen} onClose={() => setErrorAlertOpen(false)} dismissible>
                        {errorAlertMessage}
                    </Alert>
                </Col>
            </Row>
            <Form className="text-center">
                {avatarImage === null &&
                    <Row className="justify-content-center">
                        <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                            <InputGroup>
                                <Form.Control
                                    ref={inputRef}
                                    id="avatar"
                                    type="file"
                                    onChange={setAvatar}
                                    hidden />
                            </InputGroup>
                        </Col>
                    </Row>
                }
                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        {avatarImage !== null ?
                            <>
                                <Image src={URL.createObjectURL(avatarImage)} width="50px" height="50px" />
                                <span style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                                    <Button variant="success" onClick={upload}>
                                        save
                                    </Button>
                                </span>
                                <span style={{ paddingRight: '10px' }}>
                                    <Button variant="danger" onClick={() => setAvatarImage(null)}>
                                        cancel
                                    </Button>
                                </span>
                            </> :
                            <>
                                {user.avatar ?
                                    <>
                                        <span style={{ paddingRight: '5px' }}>
                                            <Image src={user.avatar} width="50px" height="50px" />
                                        </span>
                                        <span style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                                            <Button variant="success" onClick={handleFileSelection}>
                                                replace
                                            </Button>
                                        </span>
                                        <span>
                                            <Button variant="danger" onClick={deleteAvatar}>
                                                delete
                                            </Button>
                                        </span>
                                    </>
                                    :
                                    <>
                                        <Button onClick={handleFileSelection} variant="primary">
                                            You don't have an avatar. Click here to upload one
                                        </Button>
                                    </>
                                }
                            </>
                        }
                    </Col>
                </Row>

            </Form>
            <Form className="text-center">
                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        <InputGroup>

                            <InputGroup.Text style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                                location
                            </InputGroup.Text>
                            <Form.Control
                                id="loc"
                                type="text"
                                placeholder={user.loc ? `${user.loc}` : 'share your location'}
                                onChange={e => setLoc(e.target.value)} />
                            <Button variant="success" onClick={updateLoc}>{'save'}</Button>
                        </InputGroup>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col xs={10} sm={9} md={8} lg={6} xl={5} xxl={4}>
                        <InputGroup>
                            <InputGroup.Text style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                                about you
                            </InputGroup.Text>
                            <Form.Control
                                id="bio"
                                as="textarea"
                                type="textbox"
                                rows={3}
                                placeholder={user.bio ? `${user.bio}` : 'type a few things about you'}
                                onChange={e => setBio(e.target.value)} />
                            <Button variant="success" onClick={updateBio}>{'save'}</Button>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}