import React, { useState, useContext, useEffect, useRef } from 'react';
import { userDataContext } from '../contexts/UserDataContext';
import { Button, Row, Col, Modal, Spinner, Form, Alert } from 'react-bootstrap';
import { PersonFill } from 'react-bootstrap-icons'
import LoginPage from './LoginPage';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import MapLoader from '../components/MapLoader';
import { editGameByProps, getGameByLink } from '../api/gameAPI';
import { addUserGameData, getUserGameData } from '../api/userGameAPI';
import DraggableModalDialog from '../components/DraggableModalDialog';

export default function GamePage({ linkParam }: any) {
    const navigate = useNavigate()
    const socketRef = useRef<any>();
    const mapLoaderRef = useRef<any>()
    const isMountedRef = useRef<any>()
    const gameInfoRef = useRef<any>()
    const [mapLoaded, setMapLoaded] = useState<boolean>(false)
    const [gameStarted, setGameStarted] = useState<boolean>(false)
    const [loading, error, user] = useContext(userDataContext)
    const userRef = useRef(user);

    const isPickingCountryRef = useRef<boolean>(false)
    const [isPickingCountry, setIsPickingCountry] = useState<boolean>(false)
    const playersStatesRef = useRef<any>({})
    const movedMousePosition: any = useRef<any>([0, 0])
    const [mapRefs, setMapRefs] = useState<any>(null);
    const [mapFncs, setMapFncs] = useState<any>(null)

    const [gameSettingsValues, setGameSettingsValues] = useState<any>({
        name: '',
        maxPlayersCount: ''
    });
    const saveGameErrRef = useRef<boolean>(false)
    const [gameSettingsModalMessage, setGameSettingsModalMessage] = useState(null)
    const [modalGameSettings, setModalGameSettings] = useState<boolean>(false)
    const [alerts, setAlerts] = useState<any[]>([])

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const initGameSettingsForm = async () => {
        if (!gameInfoRef.current) return
        setGameSettingsValues({
            maxPlayersCount: gameInfoRef.current.maxPlayersCount,
            name: gameInfoRef.current.name
        });
        setModalGameSettings(true)
    }
    const handleChangeGameSettings = (e: any) => {
        const { name, value } = e.target;
        const newValue = name === 'maxPlayersCount' ? Number(value) : value;
        setGameSettingsValues({
            ...gameSettingsValues,
            [name]: newValue
        });
    };
    const handleSaveGameSettings = async () => {
        await editGameByProps({
            ...gameSettingsValues,
            link: gameInfoRef.current.link
        }, (err: any) => {
            let errorMsg = (err.response) ? err.response.data.message : (`${err.name}: ${err.message}`)
            setGameSettingsModalMessage(errorMsg)
            saveGameErrRef.current = true
        })

        if (saveGameErrRef.current) {
            saveGameErrRef.current = !saveGameErrRef.current
            return
        }
        socketRef.current.emit('changeSettings', {
            name: gameSettingsValues.name,
            maxPlayersCount: gameSettingsValues.maxPlayersCount,
            link: gameInfoRef.current.link
        })
    };
    const handleGameSettingsClose = () => {
        setGameSettingsModalMessage(null)
        setModalGameSettings(false)
        if (!gameInfoRef.current) return
        setGameSettingsValues({
            maxPlayersCount: gameInfoRef.current.maxPlayersCount,
            name: gameInfoRef.current.name
        })
    }

    const startGame = async () => {
        if (gameStarted) return
        await handleSaveGameSettings()
        handleGameSettingsClose()
        setGameStarted(true)
    }
    useEffect(() => {
        if (mapLoaderRef.current) {
            const refs = {
                canvasRef: mapLoaderRef.current.canvasRef,
                gameCanvasRef: mapLoaderRef.current.gameCanvasRef,
                mapRef: mapLoaderRef.current.mapRef,
                mapName: mapLoaderRef.current.mapName,
                isDragging: mapLoaderRef.current.isDragging,
                mousePos: mapLoaderRef.current.mousePos,
                mapOffsetX: mapLoaderRef.current.mapOffsetX,
                mapOffsetY: mapLoaderRef.current.mapOffsetY,
                mapScale: mapLoaderRef.current.mapScale,
                mapProperties: mapLoaderRef.current.mapProperties,
                mapScaleProperties: mapLoaderRef.current.mapScaleProperties,
                drawBorderProperties: mapLoaderRef.current.drawBorderProperties,
                existingBorders: mapLoaderRef.current.existingBorders,
                existingRiverBorders: mapLoaderRef.current.existingRiverBorders,
                existingBordersPathes: mapLoaderRef.current.existingBordersPathes,
                existingRiversPathes: mapLoaderRef.current.existingRiversPathes,
                existingCities: mapLoaderRef.current.existingCities,
                existingCitiesPathes: mapLoaderRef.current.existingCitiesPathes,
                existingCountries: mapLoaderRef.current.existingCountries,
                selectedCity: mapLoaderRef.current.selectedCity,
                selectedCountry: mapLoaderRef.current.selectedCountry,
                selectedRiver: mapLoaderRef.current.selectedRiver,
                totalCountryPopulation: mapLoaderRef.current.totalCountryPopulation,
                hoveredCountry: mapLoaderRef.current.hoveredCountry,
                requestIdRef: mapLoaderRef.current.requestIdRef,
                modalProperties: mapLoaderRef.current.modalProperties,
            };
            const fncs = {
                addEventListeners: mapLoaderRef.current.addEventListeners,
                getMousePos: mapLoaderRef.current.getMousePos,
                updateMapOffset: mapLoaderRef.current.updateMapOffset,
                initPreviousMapPosition: mapLoaderRef.current.initPreviousMapPosition,
                getStarPathFromParams: mapLoaderRef.current.getStarPathFromParams,
                tick: mapLoaderRef.current.tick,
                drawMapImage: mapLoaderRef.current.drawMapImage,
                renderMapObjects: mapLoaderRef.current.renderMapObjects
            }
            setMapFncs(fncs)
            setMapRefs(refs);

        }
    }, [mapLoaderRef]);

    useEffect(() => {
        if (!mapFncs) return

        mapFncs.addEventListeners([
            { name: 'mouseup', fnc: mouseUp },
            { name: 'touchend', fnc: mouseUp },
            { name: 'mousedown', fnc: mouseDown },
            { name: 'touchstart', fnc: mouseDown },
            { name: 'mousemove', fnc: mouseMove },
            { name: 'touchmove', fnc: mouseMove },
            { name: 'wheel', fnc: mouseWheel }
        ])
        setMapLoaded(true)
    }, [mapFncs])
    useEffect(() => {
        if (mapLoaded) updateGameMap()
    }, [mapLoaded])
    const handleBeforeUnload = (e: any) => {
        if (socketRef.current) {
            socketRef.current.emit('leaveGameRoom', { link: gameInfoRef.current.link });
            socketRef.current.removeAllListeners();
            socketRef.current.close();
        }
        return null
    };
    useEffect(() => {
        isMountedRef.current = true
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveGameRoom', { link: gameInfoRef.current.link })
                socketRef.current.removeAllListeners()
                socketRef.current.close()
            }
            isMountedRef.current = false
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [])
    const mouseMove = (e: any) => {
        let newClientPos = []
        if (e.touches) {
            newClientPos = [e.touches[0].clientX, e.touches[0].clientY]
        } else {
            newClientPos = [e.clientX, e.clientY]
        }
        movedMousePosition.current = newClientPos
    }
    const mouseWheel = (e: any) => {
        e.preventDefault()
        let scaleProperties = mapRefs.mapScaleProperties.current;
        const rect = mapRefs.gameCanvasRef.current.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const centerY = mapRefs.gameCanvasRef.current.height / 2;
        let offsetY = (mouseY - centerY);
        const limitY = 100;
        if (Math.abs(offsetY) > limitY) {
            offsetY = offsetY > 0 ? limitY : -limitY;
        }
        let newScale = mapRefs.mapScale.current;
        let newOffsetX = mapRefs.mapOffsetX.current;
        let newOffsetY = mapRefs.mapOffsetY.current;
        if (e.deltaY > 0) {
            // Zoom in
            if (mapRefs.mapScale.current * scaleProperties.step > scaleProperties.max) {
                return;
            }
            newScale *= scaleProperties.step;
            newOffsetX = mapRefs.mapOffsetX.current / scaleProperties.step;
            newOffsetY = (mapRefs.mapOffsetY.current + offsetY) / scaleProperties.step;
        } else {
            // Zoom out
            if (mapRefs.mapScale.current / scaleProperties.step < scaleProperties.min) return;

            newScale /= scaleProperties.step;
            newOffsetX = mapRefs.mapOffsetX.current * scaleProperties.step;
            newOffsetY = (mapRefs.mapOffsetY.current + offsetY) * scaleProperties.step;
        }
        const scaledImageHeight = mapRefs.mapRef.current.height / newScale;
        const topBoundary = 0, bottomBoundary = scaledImageHeight - mapRefs.canvasRef.current.height;
        newOffsetY = Math.max(topBoundary, Math.min(newOffsetY, bottomBoundary));
        mapRefs.mapScale.current = newScale;
        mapFncs.updateMapOffset(newOffsetX, newOffsetY);
    }
    const mouseDown = (e: any) => {
        mapRefs.isDragging.current = true
    }
    const mouseUp = (e: any) => {
        mapRefs.isDragging.current = false
        mapRefs.mousePos.current = mapFncs.getMousePos(e)
        let rect = mapRefs.canvasRef.current.getBoundingClientRect();
        let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) % mapRefs.mapRef.current.width
        coordX < 0 && (coordX += mapRefs.mapRef.current.width)
        let ctx: any = mapRefs.gameCanvasRef.current.getContext('2d')
        let mapWidth: any = mapRefs.mapRef.current.width
        for (let k = coordX - mapWidth; k <= coordX + mapWidth; k += mapWidth) {
            ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current)
            ctx.translate(-mapWidth / 2 - k, -mapRefs.mapOffsetY.current * mapRefs.mapScale.current)
            for (let i = 0; i < mapRefs.existingCitiesPathes.current.length; i++) {
                if (ctx.isPointInPath(
                    mapRefs.existingCitiesPathes.current[i].path[0],
                    mapRefs.mousePos.current[0] - rect.left, mapRefs.mousePos.current[1] - rect.top
                )) {
                    mapRefs.selectedCity.current = mapRefs.existingCitiesPathes.current[i]
                    ctx.setTransform(1, 0, 0, 1, 0, 0)
                    return
                }
            }
            for (let i = 0; i < mapRefs.existingRiversPathes.current.length; i++) {
                if (ctx.isPointInStroke(
                    mapRefs.existingRiversPathes.current[i].path,
                    mapRefs.mousePos.current[0] - rect.left, mapRefs.mousePos.current[1] - rect.top
                )) {
                    mapRefs.selectedRiver.current = mapRefs.existingRiversPathes.current[i]
                    ctx.setTransform(1, 0, 0, 1, 0, 0)
                    return
                }
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0)
        }

        if (mapRefs.hoveredCountry.current) {
            for (let i = 0; i < mapRefs.existingBordersPathes.current.length; i++) {
                if (mapRefs.hoveredCountry.current.path[0] ==
                    mapRefs.existingBordersPathes.current[i].path[0]
                ) {
                    mapRefs.selectedCountry.current = { ...mapRefs.hoveredCountry.current }
                    break
                }
            }
        }
        if (isPickingCountryRef.current &&
            !playersStatesRef.current[userRef.current._id].starterCountry &&
            mapRefs.selectedCountry.current) {
            for (let i = 0; i < mapRefs.existingBordersPathes.current.length; i++) {
                if (mapRefs.selectedCountry.current.path[0] ==
                    mapRefs.existingBordersPathes.current[i].path[0]
                ) {
                    playersStatesRef.current[userRef.current._id].starterCountry =
                        mapRefs.existingBordersPathes.current[i].countryName
                    isPickingCountryRef.current = false
                    setIsPickingCountry(false)
                    socketRef.current.emit('playerPickingCountry', {
                        link: gameInfoRef.current.link,
                        name: playersStatesRef.current[userRef.current._id].starterCountry
                    })
                    break
                }
            }
        }
    }

    const updateGameMap = () => {
        if (!isMountedRef.current) return
        let newPos = movedMousePosition.current
        let mapWidth: any = mapRefs.mapRef.current.width
        let ctx: any = mapRefs.gameCanvasRef.current.getContext('2d')
        const rect = mapRefs.gameCanvasRef.current.getBoundingClientRect();
        let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) % mapRefs.mapRef.current.width
        if (mapRefs.isDragging.current) {
            mapFncs.updateMapOffset(mapRefs.mapOffsetX.current + (mapRefs.mousePos.current[0] - newPos[0]),
                mapRefs.mapOffsetY.current)

            let mouseOffsetY = (mapRefs.mousePos.current[1] - newPos[1])
            if (mapRefs.mapOffsetY.current + mouseOffsetY > 0 &&
                mapRefs.mapOffsetY.current + mouseOffsetY <
                (mapRefs.mapRef.current.height / mapRefs.mapScale.current - mapRefs.canvasRef.current.height)) {
                mapFncs.updateMapOffset(mapRefs.mapOffsetX.current,
                    mapRefs.mapOffsetY.current + mouseOffsetY)
            }
            mapRefs.mousePos.current = newPos
        } else {
            let offSelectedCounter = 0
            for (let k = coordX - mapWidth; k <= coordX + mapWidth; k += mapWidth) {
                let minCountryPopulation = Infinity, currentHoveredCountry, hovCountryIndex = -1
                ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current)
                ctx.translate(-mapWidth / 2 - k, -mapRefs.mapOffsetY.current * mapRefs.mapScale.current)
                for (let i = 0; i < mapRefs.existingBordersPathes.current.length; i++) {
                    if (ctx.isPointInPath(mapRefs.existingBordersPathes.current[i].path[0],
                        newPos[0] - rect.left, newPos[1] - rect.top)) {
                        currentHoveredCountry = mapRefs.existingBordersPathes.current[i]
                        if (mapRefs.totalCountryPopulation.current[currentHoveredCountry.countryName] <
                            minCountryPopulation) {
                            minCountryPopulation = mapRefs.totalCountryPopulation.current[currentHoveredCountry.countryName]
                            hovCountryIndex = i
                        }
                    } else { offSelectedCounter++ }
                }
                if (currentHoveredCountry) {
                    mapRefs.hoveredCountry.current = mapRefs.existingBordersPathes.current[hovCountryIndex]
                }
                else if (offSelectedCounter == mapRefs.existingBordersPathes.current.length) {
                    mapRefs.hoveredCountry.current = false
                }
                ctx.setTransform(1, 0, 0, 1, 0, 0)
            }
        }
        drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
        requestAnimationFrame(updateGameMap)
    }
    const drawPlayerCountries = (offsetX: any, offsetY: any) => {
        let ctx: any = mapRefs.gameCanvasRef.current.getContext('2d')
        let mapImage: any = mapRefs.mapRef.current
        let coordX = (offsetX * mapRefs.mapScale.current) % mapImage.width
        if (offsetX * mapRefs.mapScale.current >= mapImage.width ||
            offsetX * mapRefs.mapScale.current <= -mapImage.width) offsetX %= mapImage.width / mapRefs.mapScale.current
        if (offsetX < 0) offsetX += mapImage.width / mapRefs.mapScale.current

        for (let k = coordX - mapImage.width; k <= coordX + mapImage.width; k += mapImage.width) {
            ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current)
            ctx.translate(-mapImage.width / 2 - k, -offsetY * mapRefs.mapScale.current)
            ctx.fillStyle = mapRefs.drawBorderProperties.current.borderShapeFillColor
            ctx.lineWidth = mapRefs.mapProperties.current.borderLineWidths
            for (let i = 0; i < mapRefs.existingBordersPathes.current.length; i++) {
                let drawBorderPath: Path2D = new Path2D(mapRefs.existingBordersPathes.current[i].path[0])
                Object.keys(playersStatesRef.current).map((key: any) => {
                    let player = playersStatesRef.current[key]
                    if(!player.acquiredCountries) return
                    for(let k = 0; k < player.acquiredCountries.length; k++)
                    {
                        let country = player.acquiredCountries[k]
                        if(country.name == mapRefs.existingBordersPathes.current[i].countryName)
                        {
                            ctx.strokeStyle = mapRefs.drawBorderProperties.current.borderShapeStrokeColor
                            ctx.fillStyle = player.color
                            ctx.fill(drawBorderPath)
                            ctx.stroke(drawBorderPath)
                        }
                    }
                })
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
    }
    const drawMap = (offsetX: any, offsetY: any) => {
        mapFncs.renderMapObjects(offsetX, offsetY)
        drawPlayerCountries(offsetX, offsetY)
        mapFncs.drawMapImage(offsetX, offsetY)
    }

    const loadGame = async () => {
        try {
            let res = await getGameByLink(linkParam)

            gameInfoRef.current = res.data
            if (!gameInfoRef.current.started) {
                initGameSettingsForm()
            }
            if (socketRef.current) {
                socketRef.current.emit('joinGameRoom', { link: linkParam })
            }
        }
        catch (err: any) {
            let errorMsg = err.response ? err.response.data.message : `${err.name}: ${err.message}`
            sessionStorage.setItem('lastRedirectErr', errorMsg)
            navigate('/games/')
        }
    }
    const loadGameUser = async (gameUser: any) => {
        let player: any = {}
        try {
            const res = await getUserGameData({
                username: gameUser.user.username,
                link: linkParam
            })

            const { color, acquiredCities, acquiredCountries, starterCountry, units } = res.data

            player = {
                user: gameUser.user, color, acquiredCities, acquiredCountries, starterCountry, units
            }
        } catch (err: any) 
        {
            player = gameUser
        }
        finally {
            if (player.user.avatar) {
                player.image = new Image(50, 50)
                player.image.src = player.user.avatar
            }
            playersStatesRef.current[player.user._id] = player
        }
    }
    const setAlertBehaviour = (message: any, alertClass: any) => {
        const id = new Date().getTime()
        setAlerts((prevAlerts) => [...prevAlerts, { id, message, alertClass, fadeOut: false }]);

        setTimeout(() => {
            setAlerts((prevAlerts) =>
                prevAlerts.map(alert =>
                    alert.id === id ? { ...alert, fadeOut: true } : alert
                )
            );
        }, 1000);

        setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
        }, 5000);
    }
    useEffect(() => {

        if (loading || error || !mapLoaded) return
        /*
            //if creator leaves game before its started make another user creator - to DO
            //if creator leaves game as the only user before game started then delete game - to DO
        */
        socketRef.current = io(
            `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}`,
            {
                withCredentials: true
            }
        )
        if (!linkParam) return joinAllGamesRoom()

        socketRef.current.emit('checkGameStarted', { link: linkParam })

        socketRef.current.on('updatePlayerStates', (data: any) => {
            const { playerUserStates } = data
            Object.keys(playerUserStates).forEach(key => {
                loadGameUser(playerUserStates[key]);
            });
        })

        socketRef.current.on('playerJoin', (data: any) => {
            const { userJoined } = data
            loadGameUser(userJoined)
        })
        socketRef.current.on('playerLeave', (data: any) => {
            const { userLeft } = data
            delete (playersStatesRef.current[userLeft.user._id])
        })
        socketRef.current.on('settingsChanged', (data: any) => {
            const { name, maxPlayersCount } = data
            setGameSettingsValues({
                name, maxPlayersCount
            })
            gameInfoRef.current = { ...gameInfoRef.current, name, maxPlayersCount }
        })

        socketRef.current.on('gameStarted', () => {
            handleGameSettingsClose()
            isPickingCountryRef.current = true
            setIsPickingCountry(true)
        })

        socketRef.current.on('countryPicked', (data: any) => {
            const { id, countryName, acquiredCities, acquiredCountries, color } = data
            console.log(playersStatesRef.current[id])
            let mUser = playersStatesRef.current[id]
            mUser.color = color
            mUser.starterCountry = countryName
            mUser.acquiredCities = acquiredCities 
            mUser.acquiredCountries = acquiredCountries
        })

        socketRef.current.on('errorMessage', (message: any) => {
            setAlertBehaviour(message, 'danger')
        })
        socketRef.current.on('importantMessage', (message: any) => {
            setAlertBehaviour(message, 'success')
        })
        socketRef.current.on('infoMessage', (message: any) => {
            setAlertBehaviour(message, 'info')
        })

        loadGame()

    }, [loading, error, mapLoaded])

    useEffect(() => {
        if (!gameStarted) return
        socketRef.current.emit('hostStartingGame', { link: gameInfoRef.current.link })
    }, [gameStarted])

    const joinAllGamesRoom = () => socketRef.current.emit('joinAllGamesRoom')

    if (!linkParam) return <></>
    if (error) return <LoginPage />
    return (
        <div className="GamePage">
            <div className="alert-container">
                {alerts.map(alert => (
                    <Alert
                        className={alert.fadeOut ? 'fade-out' : ''}
                        variant={alert.alertClass}
                        key={alert.id}

                        onClose={
                            () => setAlerts((prevAlerts) => prevAlerts.filter(a => a.id !== alert.id))
                        }>
                        <div>{alert.message}</div>
                    </Alert>
                ))}

                {isPickingCountry && <Alert
                    variant={'primary'}
                    key={'countryPicking'}>
                    <div>Select a country</div>
                </Alert>
                }
            </div>
            
            <MapLoader ref={mapLoaderRef} mapNameProp={''}
                linkProp={linkParam} />

            {mapRefs && gameInfoRef.current && <><Modal
                show={modalGameSettings}
                dialogAs={DraggableModalDialog}
                backdrop={false}
                keyboard={false}
                style={{ pointerEvents: 'none' }}
                centered
            >
                <div>
                    {gameSettingsModalMessage ?
                        <div style={{ pointerEvents: 'auto' }}>
                            <Modal.Header style={mapRefs.modalProperties.current}>
                                <Modal.Title>
                                    {gameSettingsModalMessage}
                                </Modal.Title>
                                <Button className={'btn-close btn-close-white'}
                                    style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                                    onClick={() => setGameSettingsModalMessage(null)}
                                    onTouchEnd={() => setGameSettingsModalMessage(null)}
                                    disabled={gameInfoRef.current.nameOfCreator != user.username}>
                                </Button>
                            </Modal.Header>
                        </div>
                        :
                        <div style={{ pointerEvents: 'auto' }}>
                            <Modal.Header style={mapRefs.modalProperties.current}>
                                <Modal.Title>Change game settings</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={mapRefs.modalProperties.current}>
                                <Form.Group >
                                    <Form.Label>
                                        Game name
                                    </Form.Label>
                                    <Form.Control type="text" onChange={handleChangeGameSettings} name="name"
                                        value={gameSettingsValues.name}
                                        style={{
                                            backgroundColor: (gameSettingsValues.name !== gameInfoRef.current.name)
                                                ? 'darkseagreen' : 'white'
                                        }}
                                        disabled={gameInfoRef.current.nameOfCreator != user.username} />
                                </Form.Group >
                            </Modal.Body>

                            <Modal.Body style={mapRefs.modalProperties.current}>
                                <Form.Group >
                                    <Form.Label>
                                        Max players count
                                    </Form.Label>
                                    <Form.Control type="text" onChange={handleChangeGameSettings} name="maxPlayersCount"
                                        value={gameSettingsValues.maxPlayersCount}
                                        style={{
                                            textAlign: 'center',
                                            borderColor: 'black',
                                            backgroundColor: (gameSettingsValues.maxPlayersCount !== gameInfoRef.current.maxPlayersCount)
                                                ? 'darkseagreen' :
                                                ((Object.keys(playersStatesRef.current).length >=
                                                    gameInfoRef.current.maxPlayersCount) ?
                                                    '#833a3ac2' : 'white')
                                        }}
                                        disabled={gameInfoRef.current.nameOfCreator != user.username}
                                    />
                                </Form.Group >
                            </Modal.Body>

                            {Object.keys(playersStatesRef.current).map((key) => (
                                <Modal.Body key={key} style={mapRefs.modalProperties.current}>
                                    <Form.Group >
                                        <Form.Label style={{
                                            backgroundColor: playersStatesRef.current[key].color,
                                            color: 'white'
                                        }}>
                                            &nbsp; ~{playersStatesRef.current[key].user.username}~ &nbsp;
                                        </Form.Label>
                                    </Form.Group >
                                    {playersStatesRef.current[key].user.avatar ?
                                        <img
                                            key={playersStatesRef.current[key].user._id}
                                            src={playersStatesRef.current[key].user.avatar}
                                            alt={`${playersStatesRef.current[key].user.username}'s avatar`}
                                            width="50" height="50" /> :
                                        <PersonFill width="50px" height="50px" style={{ color: 'white' }} />

                                    }
                                </Modal.Body>
                            ))}
                            {gameInfoRef.current.nameOfCreator == user.username ?
                                <Modal.Footer style={mapRefs.modalProperties.current}>
                                    <Button variant="primary"
                                        style={{ marginRight: '15px' }}
                                        onClick={handleSaveGameSettings}
                                        onTouchEnd={handleSaveGameSettings}>
                                        Save settings
                                    </Button>

                                    <Button variant="success"
                                        style={{ marginRight: '15px' }}
                                        onClick={startGame}
                                        onTouchEnd={startGame}>
                                        Start game
                                    </Button>
                                </Modal.Footer>
                                :

                                <Modal.Footer style={mapRefs.modalProperties.current}>
                                    Wait for the host ~{gameInfoRef.current.nameOfCreator}~ to start game
                                </Modal.Footer>
                            }
                        </div>
                    }
                </div>
            </Modal></>}
        </div>
    );
}