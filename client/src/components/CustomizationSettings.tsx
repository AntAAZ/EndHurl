import axios from 'axios'
import Alert from 'react-bootstrap/Alert'
import { Navigate } from 'react-router';
import { userDataContext } from '../contexts/UserDataContext'
import React, { useState, useContext } from 'react';
import { Upload } from 'react-bootstrap-icons'
import { Form, Row, Col, InputGroup, Button, Image } from 'react-bootstrap'

export default function CustomizationSettings() 
{
    const [bio, setBio] = useState<string>("")
    const [loc, setLoc] = useState<string>("")
    const [avatarImage, setAvatarImage] = useState<any>(null);

    const [errorAlertMessage, setAlertErrorMessage] = useState<string>("")
    const [errorAlertOpen, setErrorAlertOpen] = useState(false)
    const [loading, error, user] = useContext(userDataContext)

    if (loading) return <></>
    if (error) return <Navigate to='/login' />

    const setAvatar = (e: any) => {
        if (e.target.files && e.target.files[0]) 
        {
            let img = e.target.files[0];
            let extension = img.name.split('.').pop()

            if(extension === 'png' || extension === 'jpg' || extension === 'jpeg')
            {
                setAvatarImage(img)
            } else {
                setErrorAlertOpen(true);
                setAlertErrorMessage('The extension of the file must be png/jpg/jpeg')
            }
        } 
    }

    const upload = () => {
        if(avatarImage === null)
        {
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
        
        .then(() => window.location.href = '/settings')
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
        
        .then(() => window.location.href = '/settings')
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
        
        .then(() => window.location.href = '/settings')
        .catch((err) => {
            setErrorAlertOpen(true)
            setAlertErrorMessage(err.response.data.message)
        })
    }

    return (
        <div className="registerPage">
            <Row className="justify-content-center">
                <Col xs={12} sm={10} md={7} lg={6} xl={5}>
                    <Alert variant='info' show={!errorAlertOpen}>
                        <Alert.Heading onClick={loading}>Customization settings</Alert.Heading>

                    </Alert>
                    <Alert variant='danger' show={errorAlertOpen} onClose={() => setErrorAlertOpen(false)} dismissible>
                        <Alert.Heading>{errorAlertMessage}</Alert.Heading>
                    </Alert>
                </Col>
            </Row>
            <Form className="text-center">
                <Row className="justify-content-center">
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <Form.Label htmlFor="avatar" style={{color: 'white'}}>
                            Avatar image [will be automatically resized to 50x50 for cards 
                            and 100x100 for publications. please use png/jpg/jpeg format]
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                id="avatar"
                                type="file"
                                onChange={setAvatar}/>
                                <Button variant="success" onClick={upload}><Upload/></Button>
                        </InputGroup>
                    </Col>
                </Row>
                
                <Row className="justify-content-center">
                    <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                        { avatarImage !== null ?     
                            <>
                            <span style={{color: 'white'}}> 50x50 </span>
                            <Image src={URL.createObjectURL(avatarImage)} width="50px" height="50px"/>
                            <span style={{color: 'white'}}> 100x100 </span>
                            <Image src={URL.createObjectURL(avatarImage)} width="100px" height="100px"/>
                            </> :
                            <>
                            { user.avatar && 
                                <>
                                <span style={{color: 'white'}}> 50x50 </span>
                                <Image src={user.avatar} width="50px" height="50px"/>
                                <span style={{color: 'white'}}> 100x100 </span>
                                <Image src={user.avatar} width="100px" height="100px"/>
                                </>
                            }
                            </>
                        }
                    </Col>
                </Row>
            </Form>
            <Form className="text-center">
                <Row className="justify-content-center">
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <InputGroup>
                            <InputGroup.Text>About you</InputGroup.Text>
                            <Form.Control
                                id="bio"
                                as="textarea"
                                type="textbox"
                                placeholder={user.bio ? user.bio : ''}
                                onChange={e => setBio(e.target.value)}/>
                                <Button variant="success" onClick={updateBio}>{'>>'}</Button>
                        </InputGroup>
                    </Col>
                    
                    <Col xs={6} sm={5} md={5} lg={4} xl={3}>
                        <InputGroup>
                            <InputGroup.Text>Location</InputGroup.Text>
                            <Form.Control 
                                id="loc"
                                type="text"
                                placeholder={user.loc ? user.loc : ''}
                                onChange={e => setLoc(e.target.value)}/>
                                <Button variant="success" onClick={updateLoc}>{'>>'}</Button>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}