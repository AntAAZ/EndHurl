import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { userDataContext } from '../contexts/UserDataContext'
import { Button, Modal, Form } from 'react-bootstrap'
import Draggable from 'react-draggable'
import MapsPage from './MapsPage'
import { addCityToMap, getCitiesByMap, getNECities } from '../api/citiesAPI'
import { addWaterToMap, getWatersByMap, getNEWaters } from '../api/riversAPI'
import { addCountryToMap, getCountriesByMap, getNECountries } from '../api/countriesAPI'
import DraggableModalDialog from '../components/DraggableModalDialog';

export default function CreateMapPage() {

  const mapName = useRef("myMap")
  //const mapUrl = "../world7w.png"
  const mapUrl = "../MapMod2.png"
  const mapOffsetX: any = useRef()
  const mapOffsetY: any = useRef()

  const mapScale: any = useRef(1)

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
  const formProperties: any = useRef({
    countryNameCharsLimit: [3, 50]
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
  const isDragging: any = useRef<boolean>(false)
  const mapRef: any = useRef<HTMLImageElement>(new Image())
  //debugging coordds for rendering, TB removed
  const [coords, setCoords] = useState<number[]>([])
  const [mouseCoords, setMouseCoords] = useState<any>([0, 0])
  //
  const borders: any = useRef<number[]>([])
  const borderErrorRef = useRef<boolean>(false)
  const drawBorderHelperPos: any = useRef<number[]>([])
  const isDrawingBorder: any = useRef<boolean>(false)
  const [isCanvasReady, setIsCanvasReady] = useState<boolean>(false)
  const [mapLoading, setMapLoading] = useState<boolean>()
  const [gameLoaded, setGameLoaded] = useState<boolean>()
  
  const [loadingModalShow, setLoadingModalShow] = useState(false);
  const [loadingModalTitle, setLoadingModalTitle] = useState('');

  const [saveBordersModalShow, setSaveBordersModalShow] = useState<boolean>(false)
  const [saveCityModalShow, setSaveCityModalShow] = useState<boolean>(false)
  const [bordersModalError, setBordersModalError] = useState(null)
  const [cityModalError, setCityModalError] = useState(null)
  const [isBorderSaveSuccess, setIsBorderSaveSuccess] = useState<boolean>(false)
  const [isCitySaveSuccess, setIsCitySaveSuccess] = useState<boolean>(false)

  const [loadingBorderSave, setLoadingBorderSave] = useState<boolean>(false)
  //
  const selectedRiver = useRef<any>(false)
  const selectedCountry = useRef<any>(false)
  const selectedCity = useRef<any>(false)
  const existingBorders = useRef<any[]>([])
  const existingRiverBorders = useRef<any[]>([])
  const existingCities = useRef<any[]>([])
  const existingCountries = useRef<any[]>([])
  const existingBordersPathes = useRef<any[]>([])
  const existingRiversPathes = useRef<any[]>([])
  const existingCitiesPathes = useRef<any[]>([])
  const totalCountryPopulation = useRef<any>([])

  const [loadingExistingBorders, setLoadingExistingBorders] = useState<boolean>(false)
  const [loadingExistingRivers, setLoadingExistingRivers] = useState<boolean>(false)
  const [formName, setFormName] = useState<string>("")
  const [formSelectName, setFormSelectName] = useState<string>("country")
  const [formCity, setFormCity] = useState<any>({
    cityName: '',
    countryName: '',
    point: [0, 0],
    pop_max: 0,
    type: 0
  })
  const formCityRef = useRef<any>()
  const cityErrorRef = useRef<boolean>(false)

  const [loading, error, user] = useContext(userDataContext)

  const handleFormNameChange = (e: any) => { setFormName(e.target.value) }
  const handleSelectChange = (e: any) => { setFormSelectName(e.target.value) }

  const handleVisibilityChange = () => {
    console.log(document.visibilityState)
    if (document.visibilityState === 'visible') {
        if(isCanvasReady && mapLoading){
          drawMap(mapOffsetX, mapOffsetY)
        }
    }
  }
  const handleBordersSave = async () => {
    setSaveBordersModalShow(true)
    if (formSelectName === 'country') {

      await addCountryToMap({
        countryName: formName,
        points: [[...borders.current, borders.current[0]]]
      }, mapName.current, (err: any) => {
        borderErrorRef.current = true
        setBordersModalError(err.response.data.message)
      })

      if (borderErrorRef.current) {
        borderErrorRef.current = !borderErrorRef.current
        return
      }

      setIsBorderSaveSuccess(true)
      setLoadingBorderSave(false)

      isDrawingBorder.current = false
      setSaveBordersModalShow(false)

      borders.current = []
      drawBorderHelperPos.current = []
      drawMap(mapOffsetX.current, mapOffsetY.current)
      return
    }
    await addWaterToMap({
      name: formName,
      points: [borders.current]
    }, mapName.current, (err: any) => {
      borderErrorRef.current = true
      setBordersModalError(err.response.data.message)
    })

    if (borderErrorRef.current) {
      borderErrorRef.current = !borderErrorRef.current
      return
    }

    setIsBorderSaveSuccess(true)
    setLoadingBorderSave(false)

    isDrawingBorder.current = false
    setSaveBordersModalShow(false)
      
    borders.current = []
    drawBorderHelperPos.current = []
    drawMap(mapOffsetX.current, mapOffsetY.current)
  }
  const handleFormCityChange = (e: any) => {
      setFormCity( ({
        ...formCity, 
        [e.target.name]: e.target.value
      }))
  }

  const handleCitySave = async () => {
    setSaveCityModalShow(true)

    let cityObj: any = {
      point: formCityRef.current.point,
      name: formCityRef.current.cityName,
      countryName: formCityRef.current.countryName,
      pop_max: formCityRef.current.pop_max,
      type: formCityRef.current.type
    }

    await addCityToMap(cityObj, mapName.current, (err: any) => {
      cityErrorRef.current = true
      setCityModalError(err.response.data.message)
    })

    if(cityErrorRef.current)
    {
      cityErrorRef.current = !cityErrorRef.current
      return
    }
    setIsCitySaveSuccess(true)
  }

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

    let res = await getNEWaters()
    let rivers = res.data
    console.log(rivers)

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
    
  }
  const loadNaturalEarthCities = async () => {

    let res: any = await getNECities()
    let cities = res.data
    cities.forEach(async (city: any) => {

      city.point = [
        mapRef.current.width * ((city.point[0] + 180) / 360),
        mapRef.current.height * ((city.point[1] - 90) / (-180))
      ]

      city.area == null && (city.area = city.countryName)
      await addCityToMap(city, mapName.current)
    })
  }
  const loadCountryExistingBorders = async () => {
    setLoadingExistingBorders(true)
    const res = await getCountriesByMap(mapName.current)
    existingBorders.current = res.data || []

    existingCountries.current = Array.from(new Set([...existingBorders.current.map((border: any) => {
      return {
        name: border.countryName
      }
    })].map(o => JSON.stringify(o))).values(), p => JSON.parse(p))

    setLoadingExistingBorders(false)
  }
  const loadRiverExistingBorders = async () => {
    setLoadingExistingRivers(true)
    const res = await getWatersByMap(mapName.current)
    existingRiverBorders.current = res.data || []
    setLoadingExistingRivers(false)
  }
  const loadCountryExistingCities = async () => {
    const res = await getCitiesByMap(mapName.current)
    existingCities.current = res.data || []
    for(let i = 0; i < existingCities.current.length; i++)
    {
      let city = existingCities.current[i]
     
      if(!totalCountryPopulation.current[city.countryName])
      {
        totalCountryPopulation.current[city.countryName] = 0
      }
      totalCountryPopulation.current[city.countryName] += city.pop_max
    }
  }

  const loadAllBorders = async () => {
    setGameLoaded(false)
    await Promise.all([
      loadCountryExistingBorders(),
      loadRiverExistingBorders(),
      loadCountryExistingCities()
    ]).then(() => {
      addEventListeners()
      setGameLoaded(true)
    })
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
  useEffect(() => {
    formCityRef.current = formCity
  }, [formCity])

  useEffect(() => {
    if(loading)
    {
      openLoadingModal('Loading user data .....',);
      return
    }
    setLoadingModalShow(false);
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
  }, [loading]);

  useEffect(() => {

    if (!isCanvasReady) {
      openLoadingModal('Loading map canvas ....');
      return
    }
    setLoadingModalShow(false)

    const loadMapAndGame = async () => 
    {
      setMapLoading(true);
      mapRef.current.src = mapUrl;
      mapRef.current.onload = async () => 
      {
        //loadNaturalEarthBorders();
        //loadNaturalEarthCities();
        //loadNaturalEarthWaters();
        
        updateMapOffset(mapRef.current.width / 2, 0);
        await loadAllBorders()
        initPreviousMapPosition();
        setMapLoading(false);
      }
    }

    loadMapAndGame();
  }, [isCanvasReady]);

  useEffect(() => {
    if (!mapLoading && gameLoaded) {
      updateMapOffset(mapOffsetX.current, mapOffsetY.current);
      drawMap(mapOffsetX.current, mapOffsetY.current);
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


  const addEventListeners = () => {
    if(!canvasRef.current) return
    
    canvasRef.current.addEventListener('keyup', keyUp)
    canvasRef.current.addEventListener('mousedown', mouseDown)
    canvasRef.current.addEventListener('mouseup', mouseUp)
    canvasRef.current.addEventListener('mousemove', mouseMove)
    canvasRef.current.addEventListener('wheel', mouseWheel, { passive: false })
    document.addEventListener('visibilitychange', handleVisibilityChange);
    drawMap(mapOffsetX.current, mapOffsetY.current)
  }

  const unmountEventListeners = () => {
    if(!canvasRef.current) return
    canvasRef.current.removeEventListener('keyup', keyUp)
    canvasRef.current.removeEventListener('mousedown', mouseDown)
    canvasRef.current.removeEventListener('mouseup', mouseUp)
    canvasRef.current.removeEventListener('mousemove', mouseMove)
    canvasRef.current.removeEventListener('wheel', mouseWheel)
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  const drawBorderStartPoint = (ctx: any, color: any) => {
    ctx.fillStyle = color
    let drawPath = new Path2D()
    drawPath.arc(drawBorderHelperPos.current[0][0], drawBorderHelperPos.current[0][1],
      (mapScaleProperties.current.max - mapScale.current) / 1.75, 0, 2 * Math.PI)

    ctx.fill(drawPath)
    drawPath.closePath()
  }
  const redrawMapWithCurrentBorders = () => {
    let ctx: any = canvasRef.current.getContext('2d')

    drawMap(mapOffsetX.current, mapOffsetY.current)
    if (!drawBorderHelperPos.current.length) return

    drawBorderStartPoint(ctx, drawBorderProperties.current.startPointColor)

    ctx.strokeStyle = drawBorderProperties.current.borderLineColor
    ctx.lineWidth = mapProperties.current.borderLineWidths/mapScale.current

    let drawPath = new Path2D()
    drawPath.moveTo(drawBorderHelperPos.current[0][0], drawBorderHelperPos.current[0][1])
    for (let i = 1; i < drawBorderHelperPos.current.length; i++) {
      drawPath.lineTo(drawBorderHelperPos.current[i][0], drawBorderHelperPos.current[i][1])
    }
    ctx.stroke(drawPath)
    drawPath.closePath()
  }

  const handleBordersModalOnClose = () => {
    redrawMapWithCurrentBorders()
    setSaveBordersModalShow(false)
  }

  const handleCityModalOnClose = () => {

    setSaveCityModalShow(false)
    selectedCity.current = false
  }

  const keyUp = (e: any) => {
    if(!canvasRef.current) return
    if(selectedCity.current) return
    // to turn the key combinations into a beautiful tool menu instead (TO:DoO)
    if (e.code === 'KeyD') {
      isDrawingBorder.current = !isDrawingBorder.current
      if (!isDrawingBorder.current) {
        drawMap(mapOffsetX.current, mapOffsetY.current)
        return
      }
      borders.current = []
      drawBorderHelperPos.current = []
      return
    }
    if (e.code === 'KeyZ') {
      if ((!isDrawingBorder.current) || !borders.current.length) return

      borders.current.pop()
      drawBorderHelperPos.current.pop()
      redrawMapWithCurrentBorders()
      return
    }
  }

  const mouseDown = (e: any) => {
    if(selectedCity.current) return

    if ((isDrawingBorder.current || !canvasRef.current)) return
    isDragging.current = true
    mousePos.current = getMousePos(e)
  }

  const mouseUp = (e: any) => {

    if(!canvasRef.current) return
    isDragging.current = false

    mousePos.current = getMousePos(e)
    let rect = canvasRef.current.getBoundingClientRect();
    let coordX = (mapOffsetX.current * mapScale.current) % mapRef.current.width
    coordX < 0 && (coordX += mapRef.current.width)
    let trueMousePosition = [
      (mousePos.current[0] - rect.left) * mapScale.current + coordX,
      (mousePos.current[1] - rect.top) * mapScale.current + mapOffsetY.current * mapScale.current
    ]

    if(selectedCity.current){
      setFormCity( ({
        cityName: formCityRef.current.cityName,
        countryName: formCityRef.current.countryName,
        pop_max: formCityRef.current.pop_max,
        type: formCityRef.current.type,
        point: trueMousePosition
      }))
      return
    }

    let ctx: any = canvasRef.current.getContext('2d')
    let mapWidth: any = mapRef.current.width
    if (!isDrawingBorder.current) {
      for (let k = coordX - mapWidth; k <= coordX + mapWidth; k += mapWidth) {
        ctx.scale(1 / mapScale.current, 1 / mapScale.current)
        ctx.translate(-mapWidth / 2 - k, -mapOffsetY.current * mapScale.current)
        for (let i = 0; i < existingCitiesPathes.current.length; i++) {

          if (ctx.isPointInPath(
            existingCitiesPathes.current[i].path[0],
            mousePos.current[0] - rect.left, mousePos.current[1] - rect.top
          )) {
            selectedCity.current = existingCitiesPathes.current[i]
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            setFormCity( ({
              cityName: selectedCity.current.name,
              point: selectedCity.current.point,
              pop_max: selectedCity.current.pop_max,
              type: selectedCity.current.type,
              countryName: selectedCity.current.countryName,
            }))

            setCityModalError(null)
            setIsCitySaveSuccess(false)
            setSaveCityModalShow(true)
            return
          }
        }
        for (let i = 0; i < existingRiversPathes.current.length; i++) {
          if (ctx.isPointInStroke(
            existingRiversPathes.current[i].path,
            mousePos.current[0] - rect.left, mousePos.current[1] - rect.top
          )) {
            selectedRiver.current = existingRiversPathes.current[i]
            console.log(selectedRiver.current)
            drawMap(mapOffsetX.current, mapOffsetY.current)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            return
          }
        }
        let minCountryPopulation = Infinity, selCountryIndex = -1, currentSelectedCountry

        for (let i = 0; i < existingBordersPathes.current.length; i++) {
          if (ctx.isPointInPath(
            existingBordersPathes.current[i].path[0],
            mousePos.current[0] - rect.left, mousePos.current[1] - rect.top
          )) {
            currentSelectedCountry = existingBordersPathes.current[i]
            if(totalCountryPopulation.current[currentSelectedCountry.countryName] < minCountryPopulation)
            {
                minCountryPopulation = totalCountryPopulation.current[currentSelectedCountry.countryName]
                selCountryIndex = i
            }
          }
        }
        currentSelectedCountry && (selectedCountry.current = existingBordersPathes.current[selCountryIndex])
        console.log(existingBordersPathes.current)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }
      drawMap(mapOffsetX.current, mapOffsetY.current)
      return
    }

    if (!borders.current.length) {
      drawBorderHelperPos.current = [[mousePos.current[0] - rect.left, mousePos.current[1] - rect.top]]

      drawBorderStartPoint(ctx, drawBorderProperties.current.startPointColor)
      borders.current.push(trueMousePosition)
      return
    }

    ctx.lineWidth = mapProperties.current.borderLineWidths/mapScale.current

    if (trueMousePosition[0] + mapScale.current * mapScaleProperties.current.max > borders.current[0][0] &&
      trueMousePosition[0] - mapScale.current * mapScaleProperties.current.max < borders.current[0][0] &&
      trueMousePosition[1] + mapScale.current * mapScaleProperties.current.max > borders.current[0][1] &&
      trueMousePosition[1] - mapScale.current * mapScaleProperties.current.max < borders.current[0][1]) {

      ctx.strokeStyle = drawBorderProperties.current.connectingLineColor
      let drawPath = new Path2D()
      drawPath.moveTo(
        drawBorderHelperPos.current[drawBorderHelperPos.current.length - 1][0],
        drawBorderHelperPos.current[drawBorderHelperPos.current.length - 1][1]
      )
      drawPath.lineTo(drawBorderHelperPos.current[0][0], drawBorderHelperPos.current[0][1])
      ctx.stroke(drawPath)
      drawPath.closePath()

      setBordersModalError(null)
      setIsBorderSaveSuccess(false)
      setFormName('')
      setSaveBordersModalShow(true)
      return
    }

    ctx.strokeStyle = drawBorderProperties.current.borderLineColor
    let drawPath = new Path2D()
    drawPath.moveTo(
      drawBorderHelperPos.current[drawBorderHelperPos.current.length - 1][0],
      drawBorderHelperPos.current[drawBorderHelperPos.current.length - 1][1]
    )
    drawPath.lineTo(mousePos.current[0] - rect.left, mousePos.current[1] - rect.top)
    ctx.stroke(drawPath)
    drawPath.closePath()

    borders.current.push(trueMousePosition)
    drawBorderHelperPos.current.push([mousePos.current[0] - rect.left, mousePos.current[1] - rect.top])
  }

  const mouseMove = (e: any) => {

    if ((!isDragging.current)) return
    if(selectedCity.current) return
    let newPos = getMousePos(e)
    localStorage.setItem('mapScale', String(mapScale.current))
    localStorage.setItem('mapOffsetX', String(mapOffsetX.current));
    localStorage.setItem('mapOffsetY', String(mapOffsetY.current));
    updateMapOffset(mapOffsetX.current + (mousePos.current[0] - newPos[0]), mapOffsetY.current)

    let mouseOffsetY = (mousePos.current[1] - newPos[1])
    if (mapOffsetY.current + mouseOffsetY > 0 &&
      mapOffsetY.current + mouseOffsetY < (mapRef.current.height / mapScale.current - canvasRef.current.height)) {
      updateMapOffset(mapOffsetX.current, mapOffsetY.current + mouseOffsetY)
    }
    mousePos.current = newPos
    drawMap(mapOffsetX.current, mapOffsetY.current)

  }

  const mouseWheel = (e: any) => {

    e.preventDefault()
    e.stopPropagation()

    if (isDrawingBorder.current || !canvasRef.current) return
    if(selectedCity.current) return

    localStorage.setItem('mapScale', String(mapScale.current))
    localStorage.setItem('mapOffsetX', String(mapOffsetX.current));
    localStorage.setItem('mapOffsetY', String(mapOffsetY.current));

    let scaleProperties = mapScaleProperties.current;
   
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
  
    const centerY = canvasRef.current.height / 2;
    let offsetY = (mouseY - centerY);
  
    const limitY = 100;
    if (Math.abs(offsetY) > limitY) {
      offsetY = offsetY > 0 ? limitY : -limitY;
      console.log(offsetY);
    }
  
    let newScale = mapScale.current;
    let newOffsetX = mapOffsetX.current;
    let newOffsetY = mapOffsetY.current;
  
    if (e.deltaY > 0) {
      // Zoom in
      if (mapScale.current * scaleProperties.step > scaleProperties.max) {
        return;
      }
      newScale *= scaleProperties.step;
      newOffsetX = mapOffsetX.current / scaleProperties.step;
      newOffsetY = (mapOffsetY.current + offsetY) / scaleProperties.step;
    } else {
      // Zoom out
      if (mapScale.current / scaleProperties.step < scaleProperties.min) return;
      
      newScale /= scaleProperties.step;
      newOffsetX = mapOffsetX.current * scaleProperties.step;
      newOffsetY = (mapOffsetY.current + offsetY) * scaleProperties.step;
    }
  
    // Calculate the new vertical boundaries based on the new scale
    const scaledImageHeight = mapRef.current.height / newScale;
    const topBoundary = 0, bottomBoundary = scaledImageHeight - canvasRef.current.height;
  
    // Adjust newOffsetY to ensure it stays within the vertical boundaries
    newOffsetY = Math.max(topBoundary, Math.min(newOffsetY, bottomBoundary));
  
    // Update map scale and offset
    mapScale.current = newScale;
    updateMapOffset(newOffsetX, newOffsetY);
    drawMap(newOffsetX, newOffsetY);
  }

  const getMousePos = (e: any) => {
    let rect = canvasRef.current.getBoundingClientRect();
    setMouseCoords([
      (e.clientX - rect.left) * mapScale.current,
      (e.clientY - rect.top) * mapScale.current
    ])
    return [e.clientX, e.clientY]
  };

  const updateMapOffset = (offsetX: any, offsetY: any) => {

    mapOffsetX.current = offsetX
    mapOffsetY.current = offsetY
    let coordX = (offsetX * mapScale.current) % mapRef.current.width
    coordX < 0 && (coordX += mapRef.current.width)

    mapOffsetX.current = coordX / mapScale.current
    setCoords([coordX, offsetY * mapScale.current])

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
  const drawMap: any = (offsetX: any, offsetY: any) => {

    if(!canvasRef.current) return
    canvasRef.current.width = window.innerWidth
    canvasRef.current.height = window.innerHeight
    let ctx: any = canvasRef.current.getContext('2d')
    
    let mapImage: any = mapRef.current

    if (offsetX * mapScale.current >= mapImage.width ||
      offsetX * mapScale.current <= -mapImage.width) offsetX %= mapImage.width / mapScale.current
    if (offsetX < 0) offsetX += mapImage.width / mapScale.current

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    let clippedPath: Path2D = new Path2D()
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
    //existingRiversPathes.current = []
    //existingBordersPathes.current = []
    //existingCitiesPathes.current = []
    let drawPath: Path2D = new Path2D()
    let coordX = (offsetX * mapScale.current) % mapImage.width

    for (let k = coordX - mapImage.width; k <= coordX + mapImage.width; k += mapImage.width) {
      if (existingBordersPathes.current.length) {
        ctx.fillStyle = drawBorderProperties.current.borderShapeFillColor
        ctx.lineWidth = mapProperties.current.borderLineWidths
        ctx.strokeStyle = drawBorderProperties.current.borderShapeStrokeColor
        for (let i = 0; i < existingBordersPathes.current.length; i++) {
          let drawBorderPath: Path2D = new Path2D(existingBordersPathes.current[i].path[0])
          ctx.scale(1 / mapScale.current, 1 / mapScale.current)
          ctx.translate(-mapImage.width / 2 - k, -offsetY * mapScale.current)
          //console.log( existingBordersPathes.current[i])
          if (selectedCountry.current &&
            selectedCountry.current.countryName === existingBordersPathes.current[i].countryName) {
            ctx.fillStyle = "#ff00001b"
            ctx.fill(drawBorderPath)
            ctx.fillStyle = drawBorderProperties.current.borderShapeFillColor
          }
          ctx.stroke(drawBorderPath)
          //existingBordersPathes.current[i].path = drawBorderPath
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
      } else {
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

      if (existingRiversPathes.current.length) {

        ctx.lineWidth = mapProperties.current.borderLineWidths
        for (let i = 0; i < existingRiversPathes.current.length; i++) {
          let drawBorderPath: Path2D = new Path2D(existingRiversPathes.current[i].path)
          ctx.scale(1 / mapScale.current, 1 / mapScale.current)
          ctx.translate(-mapImage.width / 2 - k, -offsetY * mapScale.current)
          if (selectedRiver.current.name === existingRiversPathes.current[i].name) {
            ctx.strokeStyle = drawBorderProperties.current.waterBorderShapeFillColor
          } else {
            ctx.strokeStyle = drawBorderProperties.current.waterBorderShapeStrokeColor
          }
          ctx.stroke(drawBorderPath)
          //existingRiversPathes.current[i].path = drawBorderPath
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
      } else {
        
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
      if(existingCitiesPathes.current.length)
      {
        ctx.lineWidth = mapProperties.current.borderLineWidths
        for (let i = 0; i < existingCitiesPathes.current.length; i++) {
          ctx.scale(1 / mapScale.current, 1 / mapScale.current)
          ctx.translate(-mapImage.width/2 - k, -offsetY * mapScale.current)
         

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

          /// to redact
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
          ///
        }
      } else {
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
    }

    return
  }

  const tick = useCallback(() => {
    requestIdRef.current = requestAnimationFrame(tick)
  }, []);

  
  if (error) return <MapsPage />

  return (
    <div className="createMapPage">
      <p className="unselectable" style={{ color: 'white', position: 'absolute', fontSize: '16px' }}>
        coords({`${coords[0]}, ${coords[1]}`}) --
        mouseCoords({`${mouseCoords[0]}, ${mouseCoords[1]}`}) --
        realClick({`${(mouseCoords[0] + coords[0]) % mapRef.current.width}, 
                    ${mouseCoords[1] + coords[1]}`}) --
        zoom({`${mapScale.current}`})
      </p>
      <canvas tabIndex={1} ref={canvasRef} style={{ display: 'block' }} id='canvas-id' />
      
      <Modal show={loadingModalShow} onHide={closeLoadingModal} backdrop="static" keyboard={false}>
        <Modal.Header style={modalProperties.current}>
          <Modal.Title>{loadingModalTitle}</Modal.Title>
          <Button  className={'btn-close btn-close-white'}
              style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}  onClick={closeLoadingModal}>
          </Button>
        </Modal.Header>
      </Modal>
      <Modal
        show={saveBordersModalShow}
        onHide={handleBordersModalOnClose}
        backdrop="static"
        keyboard={false}
      >
        <Draggable>
          {isBorderSaveSuccess || bordersModalError ?
            <div>
              <Modal.Header style={modalProperties.current}>
                <Modal.Title>
                  {bordersModalError ? bordersModalError : 'Successfully saved borders!'}
                </Modal.Title>
                <Button className={'btn-close btn-close-white'}
                  style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                  onClick={handleBordersModalOnClose}
                ></Button>
              </Modal.Header>
            </div>
            :
            <div>
              <Modal.Header style={modalProperties.current}>
                <Modal.Title>Save currently placed borders</Modal.Title>
                <Button className={'btn-close btn-close-white'}
                  style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                  onClick={handleBordersModalOnClose}></Button>
              </Modal.Header>
              <Modal.Body style={modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    Select selection type [country or river]
                  </Form.Label>
                  <Form.Select size='lg' onChange={handleSelectChange} value={formSelectName}
                    style={{ textAlign: 'center' }}>
                    <option value='country'>Country</option>
                    <option value='river'>River</option>
                  </Form.Select>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    Enter a selection name [alphabetic,&nbsp;
                    {formProperties.current.countryNameCharsLimit[0]} -&nbsp;
                    {formProperties.current.countryNameCharsLimit[1]} chars]
                  </Form.Label>
                  <Form.Control type="text" onChange={handleFormNameChange}
                    value={formName} placeholder="" />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer style={modalProperties.current}>
                <Button variant="primary"
                  style={{ marginRight: '15px' }}
                  onClick={handleBordersSave}>
                  Save borders
                </Button>
                <Button variant="secondary" onClick={handleBordersModalOnClose}>Cancel link</Button>
              </Modal.Footer>
            </div>
          }
        </Draggable>
      </Modal>

      <Modal
        show={loadingBorderSave}
        onHide={handleBordersModalOnClose}
        backdrop="static"
        keyboard={false}
      >
        <Draggable>
          <div>
            <Modal.Header style={modalProperties.current}>
              <Modal.Title>Saving borders, please wait..</Modal.Title>
            </Modal.Header>
          </div>
        </Draggable>
      </Modal>

      <Modal
        show={loadingExistingBorders}
        backdrop="static"
        keyboard={false}
      >
        <Draggable>
          <div>
            <Modal.Header style={modalProperties.current}>
              <Modal.Title>Loading borders ...</Modal.Title>
            </Modal.Header>
          </div>
        </Draggable>
      </Modal>
      <Modal
        show={loadingExistingRivers}
        backdrop="static"
        keyboard={false}
      >
        <Draggable>
          <div>
            <Modal.Header style={modalProperties.current}>
              <Modal.Title>Loading rivers ...</Modal.Title>
            </Modal.Header>
          </div>
        </Draggable>
      </Modal>

      {saveCityModalShow && 
      <Modal
        show={saveCityModalShow}
        onHide={handleCityModalOnClose}
        dialogAs={DraggableModalDialog}
        backdrop={false}
        keyboard={false}
        style={{ pointerEvents: 'none' }}
      >
        <div>
          {isCitySaveSuccess || cityModalError ?
            <div style={{ pointerEvents: 'auto' }}>
              <Modal.Header style={modalProperties.current}>
                <Modal.Title>
                  {cityModalError ? cityModalError : 'Successfully saved city!'}
                </Modal.Title>
                <Button className={'btn-close btn-close-white'}
                  style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                  onClick={handleCityModalOnClose}
                ></Button>
              </Modal.Header>
            </div>
            :
            <div style={{ pointerEvents: 'auto' }}>
              <Modal.Header style={modalProperties.current}>
                <Modal.Title>Edit city properties</Modal.Title>
                <Button className={'btn-close btn-close-white'}
                  style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                  onClick={handleCityModalOnClose}></Button>
              </Modal.Header>
              <Modal.Body style={modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The name of the city 
                  </Form.Label>
                  <Form.Control type="text" onChange={handleFormCityChange} name="cityName"
                    value={formCity.cityName} 
                    style={{
                      backgroundColor: (formCity.cityName !== selectedCity.current.name) 
                          ? 'darkseagreen' : 'white'
                    }}/>
                </Form.Group >
              </Modal.Body>
              
              <Modal.Body style={modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The type of the city
                  </Form.Label>
                  <Form.Select size='lg' onChange={handleFormCityChange} name="type"
                  value={formCity.type} 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: ((formCity.type === 'true' || formCity.type) !== selectedCity.current.type) 
                    ? 'darkseagreen' : 'white' 
                  }}>
                      <option value={"false"}>Normal city</option>
                      <option value={"true"}>The country capital</option>
                  </Form.Select>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    City coords [click on map - [{selectedCity.current.point[0].toFixed(4)},{selectedCity.current.point[1].toFixed(4)}]]
                  </Form.Label>
                  <Form.Control type="text" 
                    value={[formCity.point[0].toFixed(4), formCity.point[1].toFixed(4)]} 
                    style={{
                      backgroundColor: (formCity.point != selectedCity.current.point) 
                          ? 'darkseagreen' : 'white' 
                    }} disabled/>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The population of the city
                  </Form.Label>
                  
                  <Form.Control type="number" onChange={handleFormCityChange} name="pop_max"
                    value={formCity.pop_max} 
                    style={{
                      backgroundColor: (formCity.pop_max != selectedCity.current.pop_max) 
                          ? 'darkseagreen' : 'white' 
                    }}/>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The country name of the city
                  </Form.Label>
                  
                  <Form.Select size='lg' onChange={handleFormCityChange} name="countryName"
                    value={formCity.countryName}
                    style={{ 
                      textAlign: 'center',
                      backgroundColor: (formCity.countryName != selectedCity.current.countryName) 
                          ? 'darkseagreen' : 'white' 
                    }}>
                     {existingCountries.current.map((country: any) => {
                        return (
                            <option value={country.name}>{country.name}</option> 
                        )
                     })}
                  </Form.Select>
                </Form.Group >
              </Modal.Body>
              <Modal.Footer style={modalProperties.current}>
                <Button variant="primary"
                  style={{ marginRight: '15px' }}
                  onClick={handleCitySave}>
                  Save city properties
                </Button>
              </Modal.Footer>
            </div>
          }
          </div>
        </Modal>}
    </div>
  )
}