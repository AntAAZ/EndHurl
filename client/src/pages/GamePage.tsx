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
    const [playersReadyModal, setPlayersReadyModal] = useState<any>({})
    const [battlePhaseStarted, setBattlePhaseStarted] = useState<boolean>(false)
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
    const [moveUnitsModalShow, setMoveUnitsModalShow] = useState<boolean>(false)
    const [moveUnitsView, setMoveUnitsView] = useState<any>({})
    const [selectedUnits, setSelectedUnits] = useState(0)
    const movingUnitsRef = useRef<boolean>(false)
    const moveUnitsViewRef = useRef<any>({})
    const selectedUnitsRef = useRef(0)
    const movingUnitsCurrentPos = useRef<any>()
    const neutralCitiesRef = useRef<any>({})
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
            link: gameInfoRef.current.link,
            starting: true
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
    const handlePlayersReadyStart = () => {
        setPlayersReadyModal({
            show: false
        })
        //setBattlePhaseStarted(true)
        socketRef.current.emit('beginBattlePhase', { link: linkParam })

    }

    const handleUnitSelectSliderChange = (e: any) => {
        setSelectedUnits(e.target.value)
        selectedUnitsRef.current = e.target.value
    }

    const handleUnitSelectMove = () => {
        setMoveUnitsModalShow(false)
        movingUnitsRef.current = true
        ///
    }

    const checkArcsIntersecting = (center1: any, center2: any, radius: any, radius2 = radius) => {
        const [x1, y1] = center1;
        const [x2, y2] = center2;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return distance <= radius + radius2;
    }
    useEffect(() => {

        if (!battlePhaseStarted) return

        const timer = setTimeout(() => {
            setBattlePhaseStarted(false)
        }, 5000);

        return () => clearTimeout(timer)
    }, [battlePhaseStarted])
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
            { name: 'keyup', fnc: keyUp },
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
    const keyUp = (e: any) => {

        if (e.code == 'Space' && socketRef.current) {
            socketRef.current.emit('joinGameRoom', {
                link: linkParam,
                manualJoin: true
            })
        }
    }
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
        let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) % mapRefs.mapRef.current.width;
        coordX < 0 && (coordX += mapRefs.mapRef.current.width);
        let ctx = mapRefs.gameCanvasRef.current.getContext('2d');
        let mapWidth = mapRefs.mapRef.current.width;

        let citySelected = false;

        for (let k = coordX - mapWidth; k <= coordX + mapWidth; k += mapWidth) {
            ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current);
            ctx.translate(-mapWidth / 2 - k, -mapRefs.mapOffsetY.current * mapRefs.mapScale.current);

            if (!movingUnitsRef.current && gameInfoRef.current.battlePhase) {
                for (let i = 0; i < playersStatesRef.current[userRef.current._id].units.length; i++) {
                    const unitStackOutsideCity = playersStatesRef.current[userRef.current._id].units[i];
                    if (unitStackOutsideCity.city == null) {
                        let unitPoint = unitStackOutsideCity.point;
                        let mousePoint = [mapRefs.mousePos.current[0] - rect.left, mapRefs.mousePos.current[1] - rect.top];
                        const adjustedX = (mousePoint[0] * mapRefs.mapScale.current + k) % mapRefs.mapRef.current.width;
                        const adjustedY = (mousePoint[1] + mapRefs.mapOffsetY.current) * mapRefs.mapScale.current;
                        mousePoint = [adjustedX, adjustedY];

                        if (checkArcsIntersecting(unitPoint, mousePoint, mapRefs.mapProperties.current.cityRadius * 0.75, 0)) {
                            setSelectedUnits(0);
                            selectedUnitsRef.current = 0;
                            let unitStackView = {
                                point: unitPoint,
                                numberOfUnits: unitStackOutsideCity.numberOfUnits,
                                range: unitStackOutsideCity.range
                            };
                            setMoveUnitsView(unitStackView);
                            moveUnitsViewRef.current = unitStackView;
                            setMoveUnitsModalShow(true);
                            return;
                        }
                    }
                }
            }
            if (movingUnitsRef.current && gameInfoRef.current.battlePhase) {
                for (const userId of Object.keys(playersStatesRef.current)) {
                    for (const unitStackOutsideCity of playersStatesRef.current[userId].units) {
                        if (unitStackOutsideCity.city == null) {
                            let unitPoint = unitStackOutsideCity.point;
                            let mousePoint = [mapRefs.mousePos.current[0] - rect.left, mapRefs.mousePos.current[1] - rect.top];
                            const adjustedX = (mousePoint[0] * mapRefs.mapScale.current + k) % mapRefs.mapRef.current.width;
                            const adjustedY = (mousePoint[1] + mapRefs.mapOffsetY.current) * mapRefs.mapScale.current;
                            mousePoint = [adjustedX, adjustedY];

                            if (checkArcsIntersecting(unitPoint, mousePoint, mapRefs.mapProperties.current.cityRadius * 0.75, mapRefs.mapProperties.current.cityRadius * 0.75)) {
                                movingUnitsRef.current = false;
                                if (!moveUnitsViewRef.current.name) {
                                    console.log("STACK TO STACK");
                                    socketRef.current.emit('moveUnitsBetween', {
                                        sourcePoint: moveUnitsViewRef.current.point,
                                        destinationPoint: unitPoint,
                                        numberOfUnits: selectedUnitsRef.current,
                                        link: linkParam
                                    });
                                } else {
                                    console.log("CITY TO STACK");
                                    socketRef.current.emit('moveUnitsBetween', {
                                        sourceCityName: moveUnitsViewRef.current.name,
                                        destinationPoint: unitPoint,
                                        numberOfUnits: selectedUnitsRef.current,
                                        link: linkParam
                                    });
                                }
                                return
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < mapRefs.existingCitiesPathes.current.length; i++) {
                let check: any
                let mousePoint = [mapRefs.mousePos.current[0] - rect.left, mapRefs.mousePos.current[1] - rect.top]
                if (movingUnitsRef.current && movingUnitsCurrentPos.current) {

                    const adjustedX = (movingUnitsCurrentPos.current[0] * mapRefs.mapScale.current + movingUnitsCurrentPos.current[2]) % mapRefs.mapRef.current.width;
                    const adjustedY = (movingUnitsCurrentPos.current[1] + mapRefs.mapOffsetY.current) * mapRefs.mapScale.current;
                    mousePoint = [adjustedX, adjustedY]
                    if (moveUnitsViewRef.current.name) {
                        check = checkArcsIntersecting(
                            mapRefs.existingCitiesPathes.current[i].point,
                            mousePoint, mapRefs.mapProperties.current.cityRadius)
                    } else {

                        check = checkArcsIntersecting(
                            mapRefs.existingCitiesPathes.current[i].point,
                            mousePoint, mapRefs.mapProperties.current.cityRadius,
                            mapRefs.mapProperties.current.cityRadius * 0.75)
                    }
                } else {
                    check = ctx.isPointInPath(
                        mapRefs.existingCitiesPathes.current[i].path[0],
                        mousePoint[0], mousePoint[1]
                    )
                }
                if (check) {
                    mapRefs.selectedCity.current = mapRefs.existingCitiesPathes.current[i];
                    ctx.setTransform(1, 0, 0, 1, 0, 0);

                    let targetingOwnCity = false;
                    let currentUnitStacks = playersStatesRef.current[userRef.current._id].units;
                    if (currentUnitStacks) {
                        for (let unitStack of currentUnitStacks) {
                            if (!unitStack.city) continue
                            if (unitStack.city.name == mapRefs.selectedCity.current.name) {
                                citySelected = true;
                                targetingOwnCity = true;
                                if (movingUnitsRef.current) {
                                    movingUnitsRef.current = false;

                                    if (moveUnitsViewRef.current.name) {
                                        socketRef.current.emit('moveUnitsBetween', {
                                            sourceCityName: moveUnitsViewRef.current.name,
                                            destinationCityName: unitStack.city.name,
                                            numberOfUnits: selectedUnitsRef.current,
                                            link: linkParam
                                        });
                                        console.log('city to city')
                                    } else {
                                        socketRef.current.emit('moveUnitsBetween', {
                                            sourcePoint: moveUnitsViewRef.current.point,
                                            destinationCityName: unitStack.city.name,
                                            numberOfUnits: selectedUnitsRef.current,
                                            link: linkParam
                                        });
                                        console.log('stack to city')
                                    }
                                    break;
                                }
                                setSelectedUnits(0);
                                selectedUnitsRef.current = 0
                                let unitStackView = {
                                    name: unitStack.city.name,
                                    point: unitStack.city.point,
                                    numberOfUnits: unitStack.numberOfUnits,
                                    range: unitStack.range
                                };
                                setMoveUnitsView(unitStackView);
                                moveUnitsViewRef.current = unitStackView;
                                setMoveUnitsModalShow(true);
                                break;
                            }
                        }

                        if (!targetingOwnCity) {
                            citySelected = true;
                            if (movingUnitsRef.current) {
                                movingUnitsRef.current = false;

                                if (moveUnitsViewRef.current.name) {
                                    socketRef.current.emit('moveUnitsBetween', {
                                        sourceCityName: moveUnitsViewRef.current.name,
                                        destinationCityName: mapRefs.selectedCity.current.name,
                                        numberOfUnits: selectedUnitsRef.current,
                                        link: linkParam
                                    });
                                    console.log('city to city')
                                } else {
                                    socketRef.current.emit('moveUnitsBetween', {
                                        sourcePoint: moveUnitsViewRef.current.point,
                                        destinationCityName: mapRefs.selectedCity.current.name,
                                        numberOfUnits: selectedUnitsRef.current,
                                        link: linkParam
                                    });
                                    console.log('stack to city')
                                }
                            }
                        }
                    }
                    return;
                }
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        // If no city was selected, handle the random point case
        if (!citySelected && movingUnitsRef.current && movingUnitsCurrentPos.current) {

            const adjustedX = (movingUnitsCurrentPos.current[0] * mapRefs.mapScale.current + movingUnitsCurrentPos.current[2]) % mapRefs.mapRef.current.width;
            const adjustedY = (movingUnitsCurrentPos.current[1] + mapRefs.mapOffsetY.current) * mapRefs.mapScale.current;

            let locPoint = [adjustedX, adjustedY]

            movingUnitsRef.current = false;
            if (moveUnitsViewRef.current.name) {
                socketRef.current.emit('moveUnitsBetween', {
                    sourceCityName: moveUnitsViewRef.current.name,
                    destinationPoint: locPoint,
                    numberOfUnits: selectedUnitsRef.current,
                    link: linkParam
                })
                console.log('city to stack')
            } else {
                socketRef.current.emit('moveUnitsBetween', {
                    sourcePoint: moveUnitsViewRef.current.point,
                    destinationPoint: locPoint,
                    numberOfUnits: selectedUnitsRef.current,
                    link: linkParam
                })
                console.log('stack to stack')
            }

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
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    const updateGameMap = () => {
        if (!isMountedRef.current)
        if(!userRef.current) {
            requestAnimationFrame(updateGameMap)
            return
        }
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
    const brightenColor = (rgba: any, factor = 0.1, alpha?: any) => {
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d+)?\)/);
        if (!match) {
            throw new Error("Invalid RGBA string");
        }

        let [r, g, b, a] = match.slice(1).map((num: any, index: any) => (index < 3 ? parseInt(num) : parseFloat(num)));

        a = a !== undefined ? a : 1;

        const brighten = (color: any) => Math.min(Math.floor(color + (255 - color) * factor), 255);

        r = brighten(r);
        g = brighten(g);
        b = brighten(b);

        if (alpha) a = alpha
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    const drawPlayerCountries = (offsetX: any, offsetY: any) => {

        let ctx: any = mapRefs.gameCanvasRef.current.getContext('2d')
        const rect = mapRefs.gameCanvasRef.current.getBoundingClientRect();
        let mapImage: any = mapRefs.mapRef.current
        let clippedPath: Path2D = new Path2D()
        let coordX = (offsetX * mapRefs.mapScale.current) % mapImage.width
        if (offsetX * mapRefs.mapScale.current >= mapImage.width ||
            offsetX * mapRefs.mapScale.current <= -mapImage.width) offsetX %= mapImage.width / mapRefs.mapScale.current
        if (offsetX < 0) offsetX += mapImage.width / mapRefs.mapScale.current

        ctx.clearRect(0, 0, mapRefs.gameCanvasRef.current.width, mapRefs.gameCanvasRef.current.height)
        clippedPath.rect(0, 0, mapRefs.gameCanvasRef.current.width, mapRefs.gameCanvasRef.current.height)
        ctx.clip(clippedPath)
        clippedPath.closePath()

        for (let k = coordX - mapImage.width; k <= coordX + mapImage.width; k += mapImage.width) {
            ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current);
            ctx.translate(-mapImage.width / 2 - k, -offsetY * mapRefs.mapScale.current);


            ctx.fillStyle = mapRefs.drawBorderProperties.current.borderShapeFillColor;
            ctx.lineWidth = mapRefs.mapProperties.current.borderLineWidths;

            for (let i = 0; i < mapRefs.existingBordersPathes.current.length; i++) {
                let drawBorderPath = new Path2D(mapRefs.existingBordersPathes.current[i].path[0]);

                ctx.strokeStyle = mapRefs.drawBorderProperties.current.borderShapeStrokeColor;
                ctx.stroke(drawBorderPath);

                if (mapRefs.hoveredCountry.current && mapRefs.hoveredCountry.current.countryName === mapRefs.existingBordersPathes.current[i].countryName) {
                    ctx.fillStyle = "#57575757";
                    ctx.fill(drawBorderPath);
                    ctx.fillStyle = mapRefs.drawBorderProperties.current.borderShapeFillColor;
                }

                Object.keys(playersStatesRef.current).forEach((key) => {
                    let player = playersStatesRef.current[key];
                    if (player.acquiredCountries) {
                        player.acquiredCountries.forEach((country: any) => {
                            if (country.name === mapRefs.existingBordersPathes.current[i].countryName) {
                                ctx.fillStyle = player.color;
                                ctx.fill(drawBorderPath);
                            }
                        });
                    }
                });
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            for (let i = 0; i < mapRefs.existingCitiesPathes.current.length; i++) {
                ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current);
                ctx.translate(-mapImage.width / 2 - k, -offsetY * mapRefs.mapScale.current);

                let cityBorderPath = new Path2D(mapRefs.existingCitiesPathes.current[i].path[0]);

                if (mapRefs.existingCitiesPathes.current[i].type) {
                    let starBorderPath = new Path2D(mapRefs.existingCitiesPathes.current[i].path[1]);
                    ctx.fillStyle = mapRefs.mapProperties.current.capitalCityStrokeColor;
                    ctx.fill(starBorderPath);
                }
                ctx.fillStyle = mapRefs.mapProperties.current.cityStrokeColor;
                ctx.fill(cityBorderPath);

                Object.keys(playersStatesRef.current).forEach((key) => {
                    let player = playersStatesRef.current[key];
                    if (player.acquiredCities) {
                        player.acquiredCities.forEach((city: any) => {
                            if (city.name === mapRefs.existingCitiesPathes.current[i].name) {
                                if (city.type) {
                                    let starBorderPath = new Path2D(mapRefs.existingCitiesPathes.current[i].path[1]);
                                    ctx.fillStyle = brightenColor(player.color, 0, 1);
                                    ctx.fill(starBorderPath);
                                }
                                ctx.fillStyle = brightenColor(player.color, -0.05, 0.75);
                                ctx.fill(cityBorderPath);
                            }
                        });
                    }
                });


                ctx.setTransform(1, 0, 0, 1, 0, 0);
                if (neutralCitiesRef.current) {
                    let currCity = neutralCitiesRef.current[mapRefs.existingCitiesPathes.current[i].name]
                    if (currCity) {
                        ctx.beginPath()

                        ctx.strokeStyle = `rgba(255, 255, 255, 0.75)`;
                        ctx.font = `${mapRefs.mapProperties.current.cityRadius / mapRefs.mapScale.current}px Verdana`;
                        ctx.strokeText(currCity.numberOfUnits,
                            ((mapRefs.existingCitiesPathes.current[i].point[0] - k) - currCity.numberOfUnits.toString().length * mapRefs.mapProperties.current.cityRadius / 3) / mapRefs.mapScale.current,
                            ((mapRefs.existingCitiesPathes.current[i].point[1] + mapRefs.mapProperties.current.cityRadius / 3) / mapRefs.mapScale.current - offsetY)
                        );
                        ctx.stroke();
                        ctx.closePath()
                    }
                }
            }
            Object.keys(playersStatesRef.current).forEach((userId: any) => {
                let unitStacksUser = playersStatesRef.current[userId].units
                if (unitStacksUser) {
                    for (let unitStackUser of unitStacksUser) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
                        let unitsDisplay = Number(unitStackUser.numberOfUnits)
                        if (!unitStackUser.city) {
                            ctx.font = `${mapRefs.mapProperties.current.cityRadius * 0.75 / mapRefs.mapScale.current}px Verdana`;
                            if (movingUnitsRef.current && moveUnitsViewRef.current &&
                                moveUnitsViewRef.current.point === unitStackUser.point
                            ) {
                                unitsDisplay -= selectedUnitsRef.current
                            }
                            if (unitsDisplay > 0) {
                                ctx.fillStyle = brightenColor(playersStatesRef.current[userId].color, -0.05, 0.75);
                                ctx.arc((unitStackUser.point[0] - k) / mapRefs.mapScale.current,
                                    unitStackUser.point[1] / mapRefs.mapScale.current - offsetY,
                                    mapRefs.mapProperties.current.cityRadius * 0.75 / mapRefs.mapScale.current,
                                    0, Math.PI * 2
                                );
                                ctx.fill();
                                ctx.strokeText(unitsDisplay, /// / 3 * 4/3    (3/4 = 0.75)
                                    ((unitStackUser.point[0] - k) - unitsDisplay.toString().length * mapRefs.mapProperties.current.cityRadius / 4) / mapRefs.mapScale.current,
                                    ((unitStackUser.point[1] + mapRefs.mapProperties.current.cityRadius / 4) / mapRefs.mapScale.current - offsetY)
                                );
                                ctx.stroke();
                            }

                        } else {
                            ctx.font = `${mapRefs.mapProperties.current.cityRadius / mapRefs.mapScale.current}px Verdana`;
                            if (movingUnitsRef.current && moveUnitsViewRef.current &&
                                moveUnitsViewRef.current.name && moveUnitsViewRef.current.name == unitStackUser.city.name
                            ) {
                                unitsDisplay -= selectedUnitsRef.current
                            }
                            ctx.strokeText(unitsDisplay,
                                ((unitStackUser.city.point[0] - k) - unitsDisplay.toString().length * mapRefs.mapProperties.current.cityRadius / 3) / mapRefs.mapScale.current,
                                ((unitStackUser.city.point[1] + mapRefs.mapProperties.current.cityRadius / 3) / mapRefs.mapScale.current - offsetY)
                            );
                            ctx.stroke();
                        }
                        ctx.closePath()
                    }
                }
            })
            if (movingUnitsRef.current) {
                ctx.beginPath();
                ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
                ctx.strokeStyle = brightenColor('rgba(0, 255, 0, 0.25)', 0.2);
                ctx.arc((moveUnitsViewRef.current.point[0] - k) / mapRefs.mapScale.current,
                    moveUnitsViewRef.current.point[1] / mapRefs.mapScale.current - offsetY,
                    moveUnitsViewRef.current.range / mapRefs.mapScale.current,
                    0, Math.PI * 2
                );
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                const arcXOriginal = ((((movedMousePosition.current[0] - rect.left) * mapRefs.mapScale.current + coordX) %
                    mapRefs.mapRef.current.width) - k) / mapRefs.mapScale.current;

                const arcYOriginal = ((movedMousePosition.current[1] - rect.top + offsetY) * mapRefs.mapScale.current) / mapRefs.mapScale.current - offsetY;

                let arcX = arcXOriginal, arcY = arcYOriginal;

                let point = moveUnitsViewRef.current.point

                if (point) {
                    const translatedX = (point[0] - k) / mapRefs.mapScale.current;
                    const translatedY = point[1] / mapRefs.mapScale.current - offsetY;

                    const dx = arcXOriginal - translatedX;
                    const dy = arcYOriginal - translatedY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > moveUnitsViewRef.current.range / mapRefs.mapScale.current) {
                        const angle = Math.atan2(dy, dx);
                        arcX = translatedX + (moveUnitsViewRef.current.range / mapRefs.mapScale.current) * Math.cos(angle);
                        arcY = translatedY + (moveUnitsViewRef.current.range / mapRefs.mapScale.current) * Math.sin(angle);
                    }
                    movingUnitsCurrentPos.current = [arcX, arcY, k]
                    const adjustedX = (movingUnitsCurrentPos.current[0] * mapRefs.mapScale.current + movingUnitsCurrentPos.current[2]) % mapRefs.mapRef.current.width;
                    const adjustedY = (movingUnitsCurrentPos.current[1] + mapRefs.mapOffsetY.current) * mapRefs.mapScale.current;
                    let radius = moveUnitsViewRef.current.name ? mapRefs.mapProperties.current.cityRadius
                        : mapRefs.mapProperties.current.cityRadius * 0.75

                    for (let i = 0; i < mapRefs.existingCitiesPathes.current.length; i++) {

                        if (checkArcsIntersecting(mapRefs.existingCitiesPathes.current[i].point,
                            [adjustedX, adjustedY], mapRefs.mapProperties.current.cityRadius, radius)) {
                            ctx.beginPath();
                            ctx.fillStyle = brightenColor(playersStatesRef.current[userRef.current._id].color, 0.2, 0.25);
                            ctx.arc(
                                (mapRefs.existingCitiesPathes.current[i].point[0] - k) / mapRefs.mapScale.current,
                                mapRefs.existingCitiesPathes.current[i].point[1] / mapRefs.mapScale.current - offsetY,
                                radius / mapRefs.mapScale.current,
                                0, Math.PI * 2
                            )
                            ctx.fill();
                            ctx.closePath()
                        }
                    }
                    Object.keys(playersStatesRef.current).map((userId: any) => {
                        playersStatesRef.current[userId].units.filter((unitStack: any) => unitStack.city == null)
                            .forEach((unitStackOutsideCity: any) => {
                                let unitPoint = unitStackOutsideCity.point
                                let mousePoint = [mapRefs.mousePos.current[0] - rect.left, mapRefs.mousePos.current[1] - rect.top]
                                mousePoint = [adjustedX, adjustedY]

                                if (checkArcsIntersecting(unitPoint, mousePoint,
                                    mapRefs.mapProperties.current.cityRadius * 0.75,
                                    mapRefs.mapProperties.current.cityRadius * 0.75)) {
                                    ctx.beginPath();
                                    ctx.fillStyle = brightenColor(playersStatesRef.current[userRef.current._id].color, 0.2, 0.25);
                                    ctx.arc(
                                        (unitPoint[0] - k) / mapRefs.mapScale.current,
                                        unitPoint[1] / mapRefs.mapScale.current - offsetY,
                                        mapRefs.mapProperties.current.cityRadius * 0.75 / mapRefs.mapScale.current,
                                        0, Math.PI * 2
                                    )
                                    ctx.fill();
                                    ctx.closePath()
                                }

                            })
                    })
                    ctx.beginPath()
                    ctx.fillStyle = brightenColor(playersStatesRef.current[userRef.current._id].color, -0.05, 0.75);
                    ctx.arc(
                        arcX,
                        arcY,
                        mapRefs.mapProperties.current.cityRadius * 0.75 / mapRefs.mapScale.current,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
                    ctx.font = `${mapRefs.mapProperties.current.cityRadius * 0.75 / mapRefs.mapScale.current}px Verdana`;
                    ctx.strokeText(
                        selectedUnitsRef.current,
                        arcX - selectedUnitsRef.current.toString().length * mapRefs.mapProperties.current.cityRadius / 4 / mapRefs.mapScale.current,
                        arcY + mapRefs.mapProperties.current.cityRadius / 4 / mapRefs.mapScale.current
                    );
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.setLineDash([5, 5]);
                    ctx.moveTo(arcX, arcY);
                    ctx.lineTo(translatedX, translatedY);
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.75)`;
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.closePath();
                }
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
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
    const updateGameUser = async (gameUser: any) => {
        let player: any = gameUser
        if (player.user.username == userRef.current.username && !player.spectator && gameInfoRef.current.started &&
            !gameInfoRef.current.battlePhase
        ) {
            isPickingCountryRef.current = true
            setIsPickingCountry(true)
        }
        if (player.user.avatar && !player.image) {
            player.image = new Image(50, 50)
            player.image.src = player.user.avatar
        }
        playersStatesRef.current[player.user._id] = player

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

        socketRef.current.on('updatePlayerStates', (data: any) => {
            const { playerUserState, playerUserStates, neutralCityUnitStates } = data
            if (neutralCityUnitStates) {
                neutralCitiesRef.current = neutralCityUnitStates
            }
            if (playerUserState) {
                updateGameUser(playerUserState)
            } else {
                playersStatesRef.current = playerUserStates
            }
        })

        socketRef.current.on('neutralCityUnitStatesUpdate', (data: any) => {
            const { neutralCityUnitStates } = data
            neutralCitiesRef.current = neutralCityUnitStates
        })

        socketRef.current.on('playerJoin', (data: any) => {
            setPlayersReadyModal({
                show: false
            })
            const { userJoined } = data
            updateGameUser(userJoined)
        })
        socketRef.current.on('playerLeave', (data: any) => {

            if (gameInfoRef.current.battlePhase) return

            const { userLeft } = data
            delete (playersStatesRef.current[userLeft.user._id])
        })
        socketRef.current.on('settingsChanged', (data: any) => {
            const { name, maxPlayersCount } = data
            setGameSettingsValues({ name, maxPlayersCount })
            gameInfoRef.current = { ...gameInfoRef.current, name, maxPlayersCount }
        })

        socketRef.current.on('gameStarted', () => {
            handleGameSettingsClose()
            isPickingCountryRef.current = true
            setIsPickingCountry(true)
        })

        socketRef.current.on('startBattlePhase', () => {
            setPlayersReadyModal({
                show: false
            })
            setBattlePhaseStarted(true)
            gameInfoRef.current.battlePhase = true
        })

        socketRef.current.on('countryPicked', (data: any) => {
            const { id, countryName, acquiredCities, acquiredCountries, color, units } = data
            let mUser = playersStatesRef.current[id]
            mUser.color = color
            mUser.starterCountry = countryName
            mUser.acquiredCities = acquiredCities
            mUser.acquiredCountries = acquiredCountries
            mUser.units = units
        })

        socketRef.current.on('allPlayersPickedCountry', (data: any) => {
            const { creatorName } = data
            if (creatorName == user.username) {
                setPlayersReadyModal({
                    show: true,
                    message: 'All players have picked countries'
                })
            } else {
                setPlayersReadyModal({
                    show: true,
                    message: `Waiting for host ~${creatorName}~ to start battle phase`
                })
            }
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
                    <div>Choose a starter country to play</div>
                </Alert>
                }

                {battlePhaseStarted && <Alert
                    variant={'success'}
                    key={'countryPicking'}>
                    <div>The battle phase has begun!</div>
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

            {mapRefs && gameInfoRef.current && <><Modal
                show={playersReadyModal.show}
                dialogAs={DraggableModalDialog}
                backdrop={false}
                keyboard={false}
                style={{ pointerEvents: 'none' }}
                centered
            >
                <div>
                    <Modal.Header style={mapRefs.modalProperties.current}>
                        <Modal.Title>
                            {playersReadyModal.message}
                        </Modal.Title>
                    </Modal.Header>
                    {gameInfoRef.current.nameOfCreator == user.username &&

                        <Modal.Body style={mapRefs.modalProperties.current}>
                            <Form.Group>

                                <Button variant={'success'}
                                    onClick={handlePlayersReadyStart}
                                    onTouchEnd={handlePlayersReadyStart}>
                                    Begin battle phase
                                </Button>
                            </Form.Group>
                        </Modal.Body>
                    }
                </div>
            </Modal></>}

            {mapRefs && gameInfoRef.current && <><Modal
                show={moveUnitsModalShow}
                dialogAs={DraggableModalDialog}
                backdrop={false}
                keyboard={false}
                style={{ pointerEvents: 'none' }}
                centered
            >
                <div>
                    <Modal.Header style={mapRefs.modalProperties.current}>
                        <Modal.Title>
                            {moveUnitsView.name ? `Select units from city: ${moveUnitsView.name}` : 'Select units'}
                        </Modal.Title>

                        <Button className={'btn-close btn-close-white'}
                            style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                            onClick={() => setMoveUnitsModalShow(false)}
                            onTouchEnd={() => setMoveUnitsModalShow(false)}>
                        </Button>
                    </Modal.Header>
                    {moveUnitsView.numberOfUnits &&
                        <>
                            <Modal.Body style={mapRefs.modalProperties.current}>
                                <Form.Group>
                                    <Form.Label>
                                        {`Select with slider (${selectedUnits}-${moveUnitsView.numberOfUnits})`}
                                    </Form.Label>
                                    <Form.Range
                                        min={0}
                                        max={moveUnitsView.numberOfUnits}
                                        value={selectedUnits}
                                        onChange={handleUnitSelectSliderChange}
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Body style={mapRefs.modalProperties.current}>
                                <Button variant={'success'}
                                    onClick={handleUnitSelectMove}
                                    onTouchEnd={handleUnitSelectMove}
                                    disabled={selectedUnitsRef.current == 0}>
                                    {`Move units`}
                                </Button>
                            </Modal.Body></>
                    }
                </div>
            </Modal></>}
        </div>
    );
}