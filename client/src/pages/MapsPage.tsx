import React, { useState, useContext, useEffect } from 'react';
import { userDataContext } from '../contexts/UserDataContext';
import { Button, Row, Col, Modal, Spinner } from 'react-bootstrap';
import LoginPage from './LoginPage';
import { getAllMaps } from '../api/mapsAPI';
import { useNavigate } from 'react-router-dom';

export default function MapsPage() 
{

    const navigate = useNavigate()
    const [maps, setMaps] = useState<any>([]);
    const [loading, error, user] = useContext(userDataContext);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [loadingMapName, setLoadingMapName] = useState('');
    const [loadedImages, setLoadedImages] = useState({});

    const loadExistingMaps = async () => {
        try {
            let res = await getAllMaps();
            setMaps(res.data);
        } catch (err) {
            console.error('Failed to load maps', err);
        }
    };

    useEffect(() => {
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
        navigate(`/games/create/${mapName}`);
    };

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
                </>
            )}
        </div>
    );
}