import React, { useRef, useState, useEffect, useContext, 
    forwardRef, useImperativeHandle, useCallback } from 'react';

import MapsPage from '../pages/MapsPage'
import { Button, Modal, Form } from 'react-bootstrap'
import { userDataContext } from '../contexts/UserDataContext'
import { addCityToMap, getCitiesByMap, getNECities } from '../api/citiesAPI'
import { addWaterToMap, getWatersByMap, getNEWaters } from '../api/riversAPI'
import { addCountryToMap, getCountriesByMap, getNECountries } from '../api/countriesAPI'
import { addMapByName, getMapByName } from '../api/mapsAPI'
import DraggableModalDialog from './DraggableModalDialog';

const MapLoader = forwardRef((props: { mapNameProp: string }, ref) => 
{
  const { mapNameProp } = props

  const [loadingExistingBorders, setLoadingExistingBorders] = useState<boolean>(false);
  const [loadingExistingRivers, setLoadingExistingRivers] = useState<boolean>(false);
  const [bordersModalError, setBordersModalError] = useState(null);
  const [isCanvasReady, setIsCanvasReady] = useState<boolean>(false)
  const [mapLoading, setMapLoading] = useState<boolean>()
  const [gameLoaded, setGameLoaded] = useState<boolean>(false);
  const [isFetchingMapDone, setIsFetchingMapDone] = useState<boolean>(false)
  const [mapModalError, setMapModalError] = useState<any>(null)
  const [mapSaveSuccess, setMapSaveSuccess] = useState<boolean>(false)
  const [saveMapModalShow, setSaveMapModalShow] = useState<boolean>(false)

  const mapRef: any = useRef<HTMLImageElement>(new Image())
  const mapName: any = useRef(null);
  const mapUrl: any = useRef<any>(null)
  const mapOffsetX: any = useRef()
  const mapOffsetY: any = useRef()
  const mapScale: any = useRef(1)

  const [formMap, setFormMap] = useState<any>({
    name: '',
    image: ''
  })

  const mapScaleProperties: any = useRef({
    step: 1.1, min: 0.25, max: 6
  })
  const mapProperties: any = useRef({
    borderLineWidths: 1,
    cityRadius: 8,
    capitalCityRadius: 8,
    maxDefaultUnitsInCity: 10,
    unitsInCityPerPopulation: 1000000,
    cityStrokeColor: '#585858',
    capitalCityStrokeColor: '#5c5c5c'
  })
  
  const drawBorderProperties: any = useRef({
    startPointColor: 'yellow',
    borderLineColor: 'red',
    connectingLineColor: 'yellow',
    borderShapeStrokeColor: 'gray',
    waterBorderShapeStrokeColor: '#5a8190',
    waterBorderShapeFillColor: 'cyan',
    borderShapeFillColor: 'rgba(251, 192, 147, 0.3)'

  })
  const modalProperties: any = useRef({
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    borderColor: '#282929'
  })
  const canvasRef: any = useRef(null)
  const requestIdRef: any = useRef()
  const mousePos: any = useRef([0, 0])
  const existingBorders = useRef<any[]>([]);
  const existingCountries = useRef<any[]>([]);
  const existingRiverBorders = useRef<any[]>([]);
  const existingBordersPathes = useRef<any[]>([])
  const existingRiversPathes = useRef<any[]>([])
  const existingCitiesPathes = useRef<any[]>([])
  const existingCities = useRef<any[]>([]);
  const totalCountryPopulation = useRef<any>({});
  const isDragging: any = useRef<boolean>(false)
  const gameCanvasRef: any = useRef(document.createElement('canvas'))
  const mapModalErrorRef = useRef<boolean>(false)

  const selectedRiver = useRef<any>(false)
  const selectedCountry = useRef<any>(false)
  const selectedCity = useRef<any>(false)
  const hoveredCountry = useRef<any>(false)

  const [loadingModalShow, setLoadingModalShow] = useState(false);
  const [loadingModalTitle, setLoadingModalTitle] = useState('');

  const [loading, error, user] = useContext(userDataContext)
  
  useImperativeHandle(ref, () => ({
    handleVisibilityChange,
    openLoadingModal,
    closeLoadingModal,
    initPreviousMapPosition,
    loadNaturalEarthBorders,
    loadNaturalEarthWaters,
    loadNaturalEarthCities,
    loadCountryExistingBorders,
    loadRiverExistingBorders,
    loadCountryExistingCities,
    loadAllBorders,
    addEventListeners,
    unmountEventListeners,
    keyUp,
    mouseDown,
    mouseUp,
    mouseMove,
    mouseWheel,
    getMousePos,
    updateMapOffset,
    getStarPathFromParams,
    renderMapObjects,
    generateMapObjects,
    drawMapImage,
    tick,
    mapRef,
    mapOffsetX,
    mapOffsetY,
    mapName,
    mapScale,
    mapScaleProperties,
    mapProperties,
    drawBorderProperties,
    modalProperties,
    canvasRef,
    gameCanvasRef,
    requestIdRef,
    mousePos,
    existingBorders,
    existingRiverBorders,
    existingCountries,
    existingCities,
    existingBordersPathes,
    existingRiversPathes,
    existingCitiesPathes,
    totalCountryPopulation,
    isDragging,
    selectedRiver,
    selectedCountry,
    selectedCity,
    hoveredCountry,
    loadingExistingBorders,
    loadingExistingRivers,
    bordersModalError,
    gameLoaded
  }));

  const handleFormMapChange = (e: any) => {
    const { name, type, value, files } = e.target;
    if (type === 'file') 
    {
      setFormMap(({
        ...formMap,
        image: files[0]
      }));
      
      return
    } 
    setFormMap(({
      ...formMap,
      [name]: value
    }));
  }
  const handleVisibilityChange = () => {
    console.log(document.visibilityState)
    if (document.visibilityState === 'visible') {
        if(isCanvasReady && mapLoading){
          drawMapImage(mapOffsetX, mapOffsetY)
        }
    }
  }
  const openLoadingModal = (title: string) => 
  {
    setLoadingModalTitle(title);
    setLoadingModalShow(true);
  }

  const closeLoadingModal = () => 
  {
    setLoadingModalShow(false);
  }
  const initPreviousMapPosition = () => {

    let mapScaleString: any = localStorage.getItem('mapScale')
    let mapOffsetXString: any = localStorage.getItem('mapOffsetX')
    let mapOffsetYString: any = localStorage.getItem('mapOffsetY')
    mapScale.current = mapScaleString ? parseFloat(mapScaleString) : mapScale.current
    mapOffsetX.current = mapOffsetXString ? parseFloat(mapOffsetXString) : mapOffsetX.current
    mapOffsetY.current = mapOffsetYString ? parseFloat(mapOffsetYString) : mapOffsetY.current
    
  }

  const fetchMapData = async () => {

    let res = await getMapByName(mapNameProp)
    // catch error if map doesnt exist in the future
    let mapObject: any = res.data
    mapUrl.current = mapObject.image
    mapName.current = mapObject.name
    setIsFetchingMapDone(true)
  }

  const closeMapModal = () => {
    const path = window.location.pathname;
    const previousDirectory = path.substring(0, path.lastIndexOf('/'));
    window.location.href = previousDirectory || '/';
  }

  const uploadMapImage = async () => {
    let formData = new FormData()
    formData.append('name', formMap.name)
    formData.append('image', formMap.image)

    await addMapByName(formData, (err: any) => {
      mapModalErrorRef.current = true
      setMapModalError(err.response.data.message)
    })

    if(mapModalErrorRef.current)
    {
      mapModalErrorRef.current = !mapModalErrorRef.current
      return
    }
    setSaveMapModalShow(false)
    let currentMap = await getMapByName(formMap.name)
    mapName.current = formMap.name
    mapUrl.current = currentMap.data.image
    setMapSaveSuccess(true)
  }
  useEffect(() => {
    if(loading)
    {
      openLoadingModal('Loading user data .....',);
      return
    }
    setLoadingModalShow(false);
    
    if(mapNameProp && !isFetchingMapDone)
    {
      fetchMapData()
      return
    }

    if(!mapUrl.current)
    {
      setMapModalError(null)
      setSaveMapModalShow(true)
      return
    }

    if (!canvasRef.current) return;

    setIsCanvasReady(true);
    document.body.style.overflow = 'hidden'; 

    return () => {
      unmountEventListeners();
      document.body.style.overflow = ''; 
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [loading, isFetchingMapDone, mapSaveSuccess]);

  useEffect(() => {

    if (!isCanvasReady) {
      openLoadingModal('Loading map canvas ....');
      return
    }
    setLoadingModalShow(false)

    const loadMapAndGame = async () => 
    {
      setMapLoading(true);
      mapRef.current.src = mapUrl.current;
      mapRef.current.onload = async () => 
      {
        //loadNaturalEarthBorders();
        //loadNaturalEarthCities();
        //loadNaturalEarthWaters();
        updateMapOffset(mapRef.current.width / 2, 0);
        drawMapImage(mapRef.current.width / 2, 0)
        await loadAllBorders()
        
        generateMapObjects(mapOffsetX.current, mapOffsetY.current);
        initPreviousMapPosition();
        setMapLoading(false);
      }
    }

    loadMapAndGame();
  }, [isCanvasReady]);

  useEffect(() => {
    if (!mapLoading && gameLoaded) {
      updateMapOffset(mapOffsetX.current, mapOffsetY.current);
      renderMapObjects(mapOffsetX.current, mapOffsetY.current)
      drawMapImage(mapOffsetX.current, mapOffsetY.current);
      requestIdRef.current = requestAnimationFrame(tick);
    }
  }, [mapLoading, gameLoaded])

  useEffect(() => {
    if (mapLoading) {
      openLoadingModal('Loading map image ....');
    } else {
      setLoadingModalShow(false);
    }
  }, [mapLoading]);


  const loadNaturalEarthBorders = async () => {
    let res = await getNECountries();
    let countries = res.data;
    let pointsForCountry : number[][][][] = [];

    countries.forEach(async (country: any) => {
        pointsForCountry[country.name] = [];
      })
  
      countries.forEach(async (country: any) => {
        for (const points of country.coords.map((points: number[][][]) => points[0])) {
            let neBorderPoints: number[][] = [];
            for (const point of points) {
                neBorderPoints.push([
                    mapRef.current.width * ((point[0] + 180) / 360), 
                    mapRef.current.height * ((point[1] - 90) / -180)
                ]);
            }
            pointsForCountry[country.name].push(neBorderPoints)
        };       
      })
  
      for(var countryName in pointsForCountry){
        await addCountryToMap({
          countryName,
          points: pointsForCountry[countryName],
        },  mapName.current, (err: any) => setBordersModalError(err.response.data.message));
      }
  };

  const loadNaturalEarthWaters = async () => {
    let res = await getNEWaters();
    let rivers = res.data;
    let pointsForRiver : number[][][][]= [];
    
    rivers.forEach(async (river: any) => {
      pointsForRiver[river.name] = [];
    })


    rivers.forEach(async (river: any) => {
      for (const points of river.coords.map((points: number[][][]) => points)) {
        console.log(points)
        let neBorderPoints: number[][] = []
        for (const point of points) {
          neBorderPoints.push([
            mapRef.current.width * ((point[0] + 180) / 360), 
            mapRef.current.height * ((point[1] - 90) / (-180))
          ])
        }
        pointsForRiver[river.name].push(neBorderPoints)
      }
    })
    for(var riverName in pointsForRiver){
      await addWaterToMap({
        name: riverName,
        points: pointsForRiver[riverName],
      },  mapName.current, (err: any) => setBordersModalError(err.response.data.message));
    }
  };

  const loadNaturalEarthCities = async () => {
    let res = await getNECities();
    let cities = res.data;
    for (let city of cities) {
      city.point = [
        mapRef.current.width * ((city.point[0] + 180) / 360),
        mapRef.current.height * ((city.point[1] - 90) / -180)
      ];

      city.area == null && (city.area = city.countryName);
      await addCityToMap(city, mapName.current);
    }
  };

  const loadCountryExistingBorders = async () => {
    setLoadingExistingBorders(true);
    const res = await getCountriesByMap(mapName.current);
    if(!res || !res.data) return
    existingBorders.current = res.data;

    existingCountries.current = Array.from(new Set([...existingBorders.current.map(border => {

      if (!totalCountryPopulation.current[border.countryName]) {
        totalCountryPopulation.current[border.countryName] = 0;
      }
      return { name: border.countryName };
    })].map(o => JSON.stringify(o))).values(), p => JSON.parse(p));

    setLoadingExistingBorders(false);
  };

  const loadRiverExistingBorders = async () => {
    setLoadingExistingRivers(true);
    const res = await getWatersByMap(mapName.current);
    if(!res || !res.data) return
    existingRiverBorders.current = res.data;
    setLoadingExistingRivers(false);
  };

  const loadCountryExistingCities = async () => {
    const res = await getCitiesByMap(mapName.current);
    if(!res || !res.data) return
    
    existingCities.current = res.data;
    for (let i = 0; i < existingCities.current.length; i++) {
      let city = existingCities.current[i];
      totalCountryPopulation.current[city.countryName] += city.pop_max;
    }
  };

  const loadAllBorders = async () => {
    setGameLoaded(false);
    await Promise.all([
      loadCountryExistingBorders(),
      loadRiverExistingBorders(),
      loadCountryExistingCities()
    ]).then(() => {
      addEventListeners();
      setGameLoaded(true);
    });
  };
  
  const addEventListeners = (eventListeners? : any[]) => {
    if(!canvasRef.current) return

    if(eventListeners)
    {
        eventListeners.forEach((e: any) => {
            if(e.name === 'wheel')
            {
              gameCanvasRef.current.addEventListener(e.name, e.fnc, { passive: false }) 
            }
            else if(e.name === 'keyup')
            {
              document.addEventListener(e.name, e.fnc)
            } else {
              gameCanvasRef.current.addEventListener(e.name, e.fnc)
            }
        })
    }
    document.addEventListener('keyup', keyUp)
    gameCanvasRef.current.addEventListener('mousedown', mouseDown)
    gameCanvasRef.current.addEventListener('touchstart', mouseDown)
    gameCanvasRef.current.addEventListener('mouseup', mouseUp)
    gameCanvasRef.current.addEventListener('touchend', mouseUp)
    gameCanvasRef.current.addEventListener('mousemove', mouseMove)
    gameCanvasRef.current.addEventListener('touchmove', mouseMove)
    gameCanvasRef.current.addEventListener('wheel', mouseWheel, { passive: false })
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  const unmountEventListeners = () => {
    if(!gameCanvasRef.current) return
    
    gameCanvasRef.current.removeEventListener('keyup', keyUp)
    gameCanvasRef.current.removeEventListener('mousedown', mouseDown)
    gameCanvasRef.current.removeEventListener('mouseup', mouseUp)
    gameCanvasRef.current.removeEventListener('mousemove', mouseMove)
    gameCanvasRef.current.removeEventListener('wheel', mouseWheel)
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  const keyUp = (e: any) => {}

  const mouseDown = (e: any) => {
    isDragging.current = true
    mousePos.current = getMousePos(e)
  }

  const mouseUp = (e: any) => {
    isDragging.current = false
    mousePos.current = getMousePos(e)
  }
  
  const mouseMove = (e: any) => {

    //mousePos.current = getMousePos(e)
    if ((!isDragging.current)) return
    localStorage.setItem('mapScale', String(mapScale.current))
    localStorage.setItem('mapOffsetX', String(mapOffsetX.current));
    localStorage.setItem('mapOffsetY', String(mapOffsetY.current));
  }
  const mouseWheel = (e: any) => {

    e.preventDefault()
    e.stopPropagation()

    if (!canvasRef.current) return

    localStorage.setItem('mapScale', String(mapScale.current))
    localStorage.setItem('mapOffsetX', String(mapOffsetX.current));
    localStorage.setItem('mapOffsetY', String(mapOffsetY.current));
  }
  const getMousePos = (e: any) => {
    if (e.touches && e.touches.length > 0) {
      return [e.touches[0].clientX, e.touches[0].clientY];
    } if (e.changedTouches && e.changedTouches.length > 0) {
      return [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    }
    return [e.clientX, e.clientY]
  };

  const updateMapOffset = (offsetX: any, offsetY: any) => {

    mapOffsetX.current = offsetX
    mapOffsetY.current = offsetY
    let coordX = (offsetX * mapScale.current) % mapRef.current.width
    coordX < 0 && (coordX += mapRef.current.width)

    mapOffsetX.current = coordX / mapScale.current
  }

  const getStarPathFromParams = (cx: any,cy: any, spikes: any, outerRadius: any,innerRadius: any) => 
    {
      let rot = Math.PI/2*3;
      let x = cx, y = cy;
      let step = Math.PI/spikes;
      
      let starPath: Path2D = new Path2D()
      starPath.moveTo(cx,cy-outerRadius)
      for(let i = 0; i < spikes; i++)
      {
        x = cx + Math.cos(rot)*outerRadius;
        y = cy + Math.sin(rot)*outerRadius;
        starPath.lineTo(x,y)
        rot += step
  
        x = cx + Math.cos(rot)*innerRadius;
        y = cy + Math.sin(rot)*innerRadius;
        starPath.lineTo(x,y)
        rot += step
      }
      starPath.lineTo(cx, cy - outerRadius);
      return starPath
    }
  const drawMapImage = (offsetX: any, offsetY: any) => {
    
    if(!canvasRef.current || !gameCanvasRef.current) return
    canvasRef.current.width = window.innerWidth
    canvasRef.current.height = window.innerHeight

    let ctx: any = canvasRef.current.getContext('2d')
    
    let mapImage: any = mapRef.current
    let clippedPath: Path2D = new Path2D()
  
    if (offsetX * mapScale.current >= mapImage.width ||
        offsetX * mapScale.current <= -mapImage.width) offsetX %= mapImage.width / mapScale.current
    if (offsetX < 0) offsetX += mapImage.width / mapScale.current

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    clippedPath.rect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.clip(clippedPath)
    clippedPath.closePath()

    ctx.drawImage(mapImage,
      offsetX * mapScale.current, offsetY * mapScale.current,
      canvasRef.current.width * mapScale.current, canvasRef.current.height * mapScale.current,
      0, 0, canvasRef.current.width, canvasRef.current.height)

    if (offsetX > mapImage.width / mapScale.current - canvasRef.current.width) {
      ctx.drawImage(mapImage,
        0, offsetY * mapScale.current,
        offsetX * mapScale.current - mapImage.width + canvasRef.current.width * mapScale.current,
        canvasRef.current.height * mapScale.current,
        mapImage.width / mapScale.current - offsetX - 0.5, 0,
        offsetX - mapImage.width / mapScale.current + canvasRef.current.width, canvasRef.current.height)
    }
    else if (offsetX < 0) {
      ctx.drawImage(mapImage,
        mapImage.width + offsetX * mapScale.current, offsetY * mapScale.current,
        -offsetX * mapScale.current, canvasRef.current.height * mapScale.current,
        0, 0, -offsetX, canvasRef.current.height)
    }
  }
  const renderMapObjects = (offsetX: any, offsetY: any) => 
  {
    if(!gameCanvasRef.current) return
    gameCanvasRef.current.width = window.innerWidth
    gameCanvasRef.current.height = window.innerHeight
    let ctx: any = gameCanvasRef.current.getContext('2d')
    let mapImage: any = mapRef.current
    let clippedPath: Path2D = new Path2D()
   
    if (offsetX * mapScale.current >= mapImage.width ||
        offsetX * mapScale.current <= -mapImage.width) offsetX %= mapImage.width / mapScale.current
      if (offsetX < 0) offsetX += mapImage.width / mapScale.current

    ctx.clearRect(0, 0, gameCanvasRef.current.width, gameCanvasRef.current.height)

    clippedPath.rect(0, 0, gameCanvasRef.current.width, gameCanvasRef.current.height)
    ctx.clip(clippedPath)
    clippedPath.closePath()

    let coordX = (offsetX * mapScale.current) % mapImage.width
    
    for (let k = coordX - mapImage.width; k <= coordX + mapImage.width; k += mapImage.width) 
    {
        ctx.scale(1 / mapScale.current, 1 / mapScale.current)
        ctx.translate(-mapImage.width / 2 - k, -offsetY * mapScale.current)

        ctx.fillStyle = drawBorderProperties.current.borderShapeFillColor
        ctx.lineWidth = mapProperties.current.borderLineWidths
        
        for (let i = 0; i < existingBordersPathes.current.length; i++)
        {
            let drawBorderPath: Path2D = new Path2D(existingBordersPathes.current[i].path[0])
            ctx.strokeStyle = drawBorderProperties.current.borderShapeStrokeColor
            if (selectedCountry.current && 
                selectedCountry.current.countryName == existingBordersPathes.current[i].countryName)
            {
                ctx.fillStyle = "#ff00001b"
                ctx.fill(drawBorderPath)
                ctx.fillStyle = drawBorderProperties.current.borderShapeFillColor
            }
            if(hoveredCountry.current && 
                hoveredCountry.current.countryName == existingBordersPathes.current[i].countryName)
            {
                ctx.fillStyle = "#57575757"
                ctx.fill(drawBorderPath)
                ctx.fillStyle = drawBorderProperties.current.borderShapeFillColor
                
            }
            ctx.stroke(drawBorderPath)
        }
        ctx.strokeStyle = drawBorderProperties.current.waterBorderShapeStrokeColor
        for (let i = 0; i < existingRiversPathes.current.length; i++)
        {
            let drawBorderPath: Path2D = new Path2D(existingRiversPathes.current[i].path)
            ctx.strokeStyle = drawBorderProperties.current.waterBorderShapeStrokeColor
            if (selectedRiver.current && 
                selectedRiver.current.name === existingRiversPathes.current[i].name)
            {
                ctx.strokeStyle = drawBorderProperties.current.waterBorderShapeFillColor
            }
            ctx.stroke(drawBorderPath)
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        for(let i = 0; i < existingCitiesPathes.current.length; i++)
        {
            ctx.scale(1 / mapScale.current, 1 / mapScale.current)
            ctx.translate(-mapImage.width / 2 - k, -offsetY * mapScale.current)
            if(existingCitiesPathes.current[i].type)
            {
                let starBorderPath: Path2D = new Path2D(existingCitiesPathes.current[i].path[1])
                ctx.fillStyle = mapProperties.current.capitalCityStrokeColor
                ctx.fill(starBorderPath)
            }
            let cityBorderPath: Path2D = new Path2D(existingCitiesPathes.current[i].path[0])
            ctx.strokeStyle = mapProperties.current.cityStrokeColor
            ctx.stroke(cityBorderPath)
            ctx.fillStyle = mapProperties.current.cityStrokeColor
            ctx.fill(cityBorderPath);
            ctx.setTransform(1, 0, 0, 1, 0, 0)

            let unitsReinf = Math.ceil(
                existingCitiesPathes.current[i].pop_max / mapProperties.current.unitsInCityPerPopulation
              )
            if (unitsReinf > mapProperties.current.maxDefaultUnitsInCity) {
                unitsReinf = mapProperties.current.maxDefaultUnitsInCity
            }
            ctx.strokeStyle = 'white'
            ctx.font = `${mapProperties.current.cityRadius / mapScale.current}px Verdana`
            ctx.strokeText(unitsReinf,
                ((existingCitiesPathes.current[i].point[0] - k) - 
                  unitsReinf.toString().length * mapProperties.current.cityRadius/3) / mapScale.current,
                ((existingCitiesPathes.current[i].point[1] + 
                  mapProperties.current.cityRadius/3) / mapScale.current - offsetY)
            )
            ctx.stroke()
        }
    }
  }
  const generateMapObjects = (offsetX: any, offsetY: any) => {

      if(!gameCanvasRef.current) return
      gameCanvasRef.current.width = window.innerWidth
      gameCanvasRef.current.height = window.innerHeight
      
      let ctx: any = gameCanvasRef.current.getContext('2d')
      let mapImage: any = mapRef.current
      if (offsetX * mapScale.current >= mapImage.width ||
        offsetX * mapScale.current <= -mapImage.width) offsetX %= mapImage.width / mapScale.current
      if (offsetX < 0) offsetX += mapImage.width / mapScale.current

      let drawPath: Path2D = new Path2D()
      let coordX = (offsetX * mapScale.current) % mapImage.width
  
      for (let k = coordX - mapImage.width; k <= coordX + mapImage.width; k += mapImage.width) {
        ctx.scale(1 / mapScale.current, 1 / mapScale.current)
        ctx.translate(-mapImage.width / 2 - k, -offsetY * mapScale.current)
        if (!existingBordersPathes.current.length) 
        {
          for (let ctryIndex = 0; ctryIndex < existingBorders.current.length; ctryIndex++) {
            drawPath = new Path2D()
            if (existingBorders.current[ctryIndex].point.length) {
              drawPath.moveTo(
                ((existingBorders.current[ctryIndex].point[0][0] - k)) / mapScale.current,
                (existingBorders.current[ctryIndex].point[0][1] / mapScale.current - offsetY)
              )
            }
            for (let i = 1; i < existingBorders.current[ctryIndex].point.length; i++) {
            
              drawPath.lineTo(
                ((existingBorders.current[ctryIndex].point[i][0] - k)) / mapScale.current,
                (existingBorders.current[ctryIndex].point[i][1] / mapScale.current - offsetY)
              )
            }
            existingBordersPathes.current.push({
              countryName: existingBorders.current[ctryIndex].countryName,
              path: [drawPath]
            })
          }
        }
  
        if (!existingRiversPathes.current.length) 
        {
          
          for (let rivIndex = 0; rivIndex < existingRiverBorders.current.length; rivIndex++) {
            drawPath = new Path2D()
            if (existingRiverBorders.current[rivIndex].point.length) {
              drawPath.moveTo(
                ((existingRiverBorders.current[rivIndex].point[0][0] - k)) / mapScale.current,
                (existingRiverBorders.current[rivIndex].point[0][1] / mapScale.current - offsetY)
              )
            }
            for (let i = 1; i < existingRiverBorders.current[rivIndex].point.length; i++) {
              drawPath.lineTo(
                ((existingRiverBorders.current[rivIndex].point[i][0] - k)) / mapScale.current,
                (existingRiverBorders.current[rivIndex].point[i][1] / mapScale.current - offsetY))
            }
            
            existingRiversPathes.current.push({
              name: existingRiverBorders.current[rivIndex].name,
              path: drawPath
            })
          }
        }
        if(!existingCitiesPathes.current.length)
        {
          for (let i = 0; i < existingCities.current.length; i++) {
            let cityCenterPoint = [
              ((existingCities.current[i].point[0] - k)) / mapScale.current,
              (existingCities.current[i].point[1] / mapScale.current - offsetY)
            ]
            let cityPath = new Path2D()
            let starPath = new Path2D()
            if(existingCities.current[i].type)
            {
              starPath.addPath(getStarPathFromParams(
                cityCenterPoint[0],
                cityCenterPoint[1],
                5, mapProperties.current.capitalCityRadius*2 / mapScale.current, 
                mapProperties.current.capitalCityRadius / mapScale.current
              ))
              cityPath.arc(
                cityCenterPoint[0], cityCenterPoint[1],
                mapProperties.current.capitalCityRadius / mapScale.current, 0, 2 * Math.PI
              )
              starPath.closePath()
            } else {
              cityPath.arc(
                cityCenterPoint[0], cityCenterPoint[1],
                mapProperties.current.cityRadius / mapScale.current, 0, 2 * Math.PI
              )
            }

            cityPath.closePath()
            
            existingCitiesPathes.current.push({...existingCities.current[i], path: [cityPath, starPath]})
          }
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }
  
      return
  }
  const tick = useCallback(() => {
    requestIdRef.current = requestAnimationFrame(tick)
  }, []);

  if (error) return <MapsPage />

  return (
    <div>
      <canvas ref={gameCanvasRef} id='canvas' style={{position: 'absolute'}} />
      <canvas tabIndex={1} ref={canvasRef} id='canvas-id' style={{display: 'block'}} />
      

      {(!mapSaveSuccess && mapModalError) && <>
        <Modal show={!mapSaveSuccess} backdrop="static" keyboard={false}>
          <Modal.Header style={modalProperties.current}>
            <Modal.Title>Error: {mapModalError}</Modal.Title>
          </Modal.Header>
          
          <Modal.Body style={modalProperties.current}>
            <Button onClick={() => setMapModalError(null)}>
              Back to map form
            </Button>
          </Modal.Body>
        </Modal>
      </>}
      <Modal show={saveMapModalShow && !mapModalError}  backdrop="static" 
        keyboard={false}>
        <Modal.Header style={modalProperties.current}>
          <Modal.Title>Add map background image</Modal.Title>
          <Button  className={'btn-close btn-close-white'}
              style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}  onClick={closeMapModal}>
          </Button>
        </Modal.Header>

          <Modal.Body style={modalProperties.current}>
              <Form.Group >
                <Form.Label>
                  Name of the map
                </Form.Label>
                  
                <Form.Control type="text" onChange={handleFormMapChange} name="name" value={formMap.name}/>
            </Form.Group >
          </Modal.Body>
          <Modal.Body style={modalProperties.current}>
            <Form.Group >
                <Form.Label>
                  Upload background image
                </Form.Label>
                <Form.Control type="file" onChange={handleFormMapChange} name="image" id = "image"/>
            </Form.Group >
          </Modal.Body>
          
          <Modal.Footer style={modalProperties.current}>
              <Button variant="success"
                style={{ marginRight: '15px' }}
                onClick={uploadMapImage}>
                Save map properties
              </Button>
          </Modal.Footer>
      </Modal>

      <Modal show={loadingModalShow} onHide={closeLoadingModal} backdrop="static" keyboard={false}>
        <Modal.Header style={modalProperties.current}>
          <Modal.Title>{loadingModalTitle}</Modal.Title>
          <Button  className={'btn-close btn-close-white'}
              style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}  onClick={closeLoadingModal}>
          </Button>
        </Modal.Header>
      </Modal>
      <Modal
        show={loadingExistingBorders}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header style={modalProperties.current}>
            <Modal.Title>Loading borders ...</Modal.Title>
        </Modal.Header>
      </Modal>
      <Modal
        show={loadingExistingRivers}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header style={modalProperties.current}>
            <Modal.Title>Loading rivers ...</Modal.Title>
        </Modal.Header>
      </Modal>
    </div>
  );
});

export default MapLoader;