import React, { useState, useContext, useRef, useEffect } from 'react';
import { userDataContext } from '../contexts/UserDataContext';
import { Button, Row, Col, Modal, Spinner, Form } from 'react-bootstrap';
import LoginPage from './LoginPage';
import NormalAlert from '../components/NormalAlert';
import { useNavigate } from 'react-router-dom';
import { addGameByProps } from '../api/gameAPI';
import { getAllMaps, getMapByName } from '../api/mapsAPI';
export default function MapsPage() {
    const navigate = useNavigate()
    const [errorMsg, setErrorMsg] = useState(null);
    const [maps, setMaps] = useState<any>([]);
    const [loading, error, user] = useContext(userDataContext);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [loadingMapName, setLoadingMapName] = useState('');
    const [loadedImages, setLoadedImages] = useState({});
    const [makeGameModalShow, setMakeGameModalShow] = useState<boolean>(false)
    const [makeGameModalError, setMakeGameModalError] = useState(null)
    const [formGame, setFormGame] = useState<any>({
        name: '',
        maxPlayersCount: 5,
        mapName: '',
        creatorName: ''
    })
    const modalProperties: any = useRef({
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        borderColor: '#282929'
    })
    const loadExistingMaps = async () => {
        try {
            let res = await getAllMaps();
            setMaps(res.data);
        } catch (err) {
            console.error('Failed to load maps', err);
        }
    };
    useEffect(() => {
        const msg: any = sessionStorage.getItem('lastRedirectErr');
        if (msg) {
            setErrorMsg(msg);
            sessionStorage.removeItem('lastRedirectErr')
        }
        loadExistingMaps();
    }, []);

    useEffect(() => {
        // Check if all images are loaded
        if (maps.length > 0 && Object.keys(loadedImages).length === maps.length) {
            setImagesLoading(false);
        }
    }, [loadedImages, maps.length]);

    const handleImageLoad = (mapName: any) => {
        console.log('Image loaded:', mapName);
        setLoadedImages(prevState => ({ ...prevState, [mapName]: true }));
    };

    const handleImageError = (mapName: any) => {
        console.log('Image load error:', mapName);
        setLoadedImages(prevState => ({ ...prevState, [mapName]: true }));
    };

    const handleImageLoadStart = (mapName: any) => {
        console.log('Image load start:', mapName);
        setLoadingMapName(mapName);
    };

    const handleEditClick = (mapName: any) => {
        navigate(`/maps/edit/${mapName}`);
    };

    const handleMakeGameClick = (mapName: any) => {
        setMakeGameModalError(null)
        setFormGame({
            ...formGame,
            mapName,
            name: `${user.username}/${mapName} game`,
            creatorName: user.username
        })
        setMakeGameModalShow(true)
    };

    const handleFormGameChange = (e: any) => {
        setFormGame(({
            ...formGame,
            [e.target.name]: e.target.value
        }))
    }
    const handleGameSave = async () => {
        let res = await getMapByName(formGame.mapName).catch((err: any) => {
            setMakeGameModalError(err.response.data.message || err)
        })
        if(!res) return
        try {
            let res = await addGameByProps({ ...formGame})
            navigate(`/games/${res.data.link}`)
        }
        catch (err: any) 
        {
            setMakeGameModalError(err.response ? err.response.data.message : `${err.name}: ${err.message}`)
        }
    }
    const handleMakeGameModalOnClose = () => {
        setMakeGameModalShow(false)
    }
    useEffect(() => {
        if (maps.length > 0 && loadingMapName === '') {
            setLoadingMapName(maps[0].name);
        }
    }, [maps]);

    if (loading) return <></>;
    return (
        <div className="mapPage">
            {error ? (
                <LoginPage />
            ) : (
                <>
                    {errorMsg && <NormalAlert alertClassName='danger' 
                        hideTimerMs={5500} fadeInTimerMs={5500} message={errorMsg}/>}

                    <Modal show={imagesLoading && loadingMapName} centered>
                        <Modal.Body className="d-flex justify-content-center align-items-center">
                            <span className="ml-2">loading map image of [{loadingMapName}] &nbsp;</span>
                            <Spinner animation="border" role="status" />
                        </Modal.Body>
                    </Modal>
                    <Row>
                        {maps.map((map: any, index: any) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mapPageMapItem">
                                <h3>{map.name}</h3>
                                <img
                                    src={map.image}
                                    width="90%"
                                    height="auto"
                                    alt={map.name}
                                    onLoad={() => handleImageLoad(map.name)}
                                    onError={() => handleImageError(map.name)}
                                    onLoadStart={() => handleImageLoadStart(map.name)}
                                    style={{ marginBottom: '10px' }}
                                />
                                <Button
                                    variant="success"
                                    onClick={() => handleMakeGameClick(map.name)}
                                >Make game</Button>
                                <Button
                                    variant="primary"
                                    style={{ marginLeft: '15px' }}
                                    onClick={() => handleEditClick(map.name)}
                                >
                                    Edit map
                                </Button>
                            </Col>
                        ))}
                    </Row>
                    <Modal show={makeGameModalShow} onHide={handleMakeGameModalOnClose} backdrop="false" keyboard={false}>
                        {makeGameModalError ?
                            <div>
                                <Modal.Header style={modalProperties.current}>
                                    <Modal.Title>
                                        {makeGameModalError ? makeGameModalError : 'Creating game...'}
                                    </Modal.Title>
                                    <Button className={'btn-close btn-close-white'}
                                        style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                                        onClick={handleMakeGameModalOnClose}
                                    ></Button>
                                </Modal.Header>
                            </div>
                            :
                            <div>
                                <Modal.Header style={modalProperties.current}>
                                    <Modal.Title>Selected map : {formGame.mapName}</Modal.Title>
                                    <Button className={'btn-close btn-close-white'}
                                        style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                                        onClick={handleMakeGameModalOnClose}></Button>
                                </Modal.Header>
                                <Modal.Body style={modalProperties.current}>
                                    <Form.Group >
                                        <Form.Label>
                                            Game name
                                        </Form.Label>
                                        <Form.Control type="text" name="name" onChange={handleFormGameChange}
                                            value={formGame.name} placeholder="" />
                                    </Form.Group >
                                </Modal.Body>
                                <Modal.Body style={modalProperties.current}>
                                    <Form.Group >
                                        <Form.Label>
                                            Max players
                                        </Form.Label>
                                        <Form.Control type="number" name="maxPlayersCount" 
                                            onChange={handleFormGameChange}
                                            value={formGame.maxPlayersCount} placeholder="" />
                                    </Form.Group>
                                </Modal.Body>
                                <Modal.Footer style={modalProperties.current}>
                                    <Button variant="primary"
                                        style={{ marginRight: '15px' }}
                                        onClick={handleGameSave}>
                                        Create game
                                    </Button>
                                    <Button variant="secondary" onClick={handleMakeGameModalOnClose}>Back</Button>
                                </Modal.Footer>
                            </div>
                        }
                    </Modal>
                </>
            )}
        </div>
    );
}