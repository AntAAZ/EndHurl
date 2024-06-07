import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { userDataContext } from '../contexts/UserDataContext'
import { Button, Modal, Form } from 'react-bootstrap'
import Draggable from 'react-draggable'
import { addCityToMap, getCitiesByMap, getNECities } from '../api/citiesAPI'
import { addWaterToMap, getWatersByMap, getNEWaters } from '../api/riversAPI'
import { addCountryToMap, getCountriesByMap, getNECountries } from '../api/countriesAPI'
import DraggableModalDialog from '../components/DraggableModalDialog';
import MapLoader from '../components/MapLoader'; 

export default function CreateMapPage({ mapNameParam }: any) {
  
  const formProperties: any = useRef({
    countryNameCharsLimit: [3, 50]
  })

  const [coords, setCoords] = useState<number[]>([])
  const mouseCoords = useRef<any>([0, 0])
  const movedMousePosition: any = useRef<any>([0, 0])

  const borders: any = useRef<number[]>([])
  const borderErrorRef = useRef<boolean>(false)
  const drawBorderHelperPos: any = useRef<number[]>([])
  const isDrawingBorder: any = useRef<boolean>(false)
  const [saveBordersModalShow, setSaveBordersModalShow] = useState<boolean>(false)
  const [saveCityModalShow, setSaveCityModalShow] = useState<boolean>(false)
  const [bordersModalError, setBordersModalError] = useState(null)
  const [cityModalError, setCityModalError] = useState(null)
  const [isBorderSaveSuccess, setIsBorderSaveSuccess] = useState<boolean>(false)
  const [isCitySaveSuccess, setIsCitySaveSuccess] = useState<boolean>(false)

  const [loadingBorderSave, setLoadingBorderSave] = useState<boolean>(false)
  
  const [formCity, setFormCity] = useState<any>({
    cityName: '',
    countryName: '',
    point: [0, 0],
    pop_max: 0,
    type: 0
  })
  const [formBorders, setFormBorders] = useState<any>({
    selType: 'country',
    selName: ''
  })
  const isMountedRef = useRef<any>()
  const formCityRef = useRef<any>()
  const cityErrorRef = useRef<boolean>(false)
  const mapLoaderRef = useRef<any>()
  const [mapRefs, setMapRefs] = useState<any>(null);
  const [mapFncs, setMapFncs] = useState<any>(null)

  useEffect(() => {
    if (mapLoaderRef.current) 
    {
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
    if(!mapFncs) return

    mapFncs.addEventListeners([
      {name: 'keyup', fnc: keyUp}, 
      {name: 'mouseup', fnc: mouseUp},
      {name: 'touchend', fnc: mouseUp},
      {name: 'mousedown', fnc: mouseDown},
      {name: 'touchstart', fnc: mouseDown},
      {name: 'mousemove', fnc: mouseMove},
      {name: 'touchmove', fnc: mouseMove},
      {name: 'wheel', fnc: mouseWheel}
    ])
    updateMap()
  }, [mapFncs])

  const handleFormBorders = (e: any) => { 
    
    setFormBorders( ({
      ...formBorders, 
      [e.target.name]: e.target.value
    }))
  }
  const handleBordersSave = async () => 
  {
    setSaveBordersModalShow(true)
    console.log(formBorders)
    if (formBorders.selType == 'country') {
      await addCountryToMap({
        countryName: formBorders.selName,
        points: [[...borders.current, borders.current[0]]]
      }, mapRefs.mapName.current, (err: any) => {
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
      drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
      return
    }
    await addWaterToMap({
      name: formBorders.selName,
      points: [borders.current]
    }, mapRefs.mapName.current, (err: any) => {
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
    drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
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

    await addCityToMap(cityObj, mapRefs.mapName.current, (err: any) => {
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

  useEffect(() => {
    formCityRef.current = formCity
  }, [formCity])

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const drawBorderStartPoint = (ctx: any) => 
  {
    ctx.fillStyle = mapRefs.drawBorderProperties.current.startPointColor
    
    let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) 
      % mapRefs.mapRef.current.width
    for (let k = coordX - mapRefs.mapRef.current.width; k <= coordX + mapRefs.mapRef.current.width; k += mapRefs.mapRef.current.width) {
  
      let drawPath = new Path2D()
      drawPath.arc((drawBorderHelperPos.current[0][0] - k) / mapRefs.mapScale.current, 
      drawBorderHelperPos.current[0][1] / mapRefs.mapScale.current - mapRefs.mapOffsetY.current,
        (mapRefs.mapScaleProperties.current.max - mapRefs.mapScale.current) / 1.75, 0, 2 * Math.PI)

      ctx.fill(drawPath)
      drawPath.closePath()
    }
  }
  const redrawMapWithCurrentBorders = () => 
  {
    if (!drawBorderHelperPos.current.length) return
    let ctx: any = mapRefs.canvasRef.current.getContext('2d')
    ctx.strokeStyle = mapRefs.drawBorderProperties.current.borderLineColor
    ctx.lineWidth = mapRefs.mapProperties.current.borderLineWidths/mapRefs.mapScale.current
    
    let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) % mapRefs.mapRef.current.width
  
    for (let k = coordX - mapRefs.mapRef.current.width; k <= coordX + mapRefs.mapRef.current.width; k += mapRefs.mapRef.current.width) 
    {
      let drawPath = new Path2D()

      drawPath.moveTo((drawBorderHelperPos.current[0][0] - k) / mapRefs.mapScale.current, 
      drawBorderHelperPos.current[0][1] / mapRefs.mapScale.current - mapRefs.mapOffsetY.current)
      for (let i = 1; i < drawBorderHelperPos.current.length; i++) {
        drawPath.lineTo((drawBorderHelperPos.current[i][0] - k) / mapRefs.mapScale.current, 
        drawBorderHelperPos.current[i][1] / mapRefs.mapScale.current - mapRefs.mapOffsetY.current)
      }
      ctx.stroke(drawPath)
      drawPath.closePath()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    drawBorderStartPoint(ctx)
  }

  const handleBordersModalOnClose = () => {
    drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
    setSaveBordersModalShow(false)
  }

  const handleCityModalOnClose = () => {

    let selectedCity = mapLoaderRef.current.selectedCity
    setSaveCityModalShow(false)
    selectedCity.current = false
  }
  const getMousePos = (e: any) =>
  {
    let rect = mapRefs.canvasRef.current.getBoundingClientRect();
    let mousePos = mapFncs.getMousePos(e)
    mouseCoords.current = ([
      (mousePos[0] - rect.left) * mapRefs.mapScale.current,
      (mousePos[1] - rect.top) * mapRefs.mapScale.current
    ])
    return mousePos
  }
  const updateMapOffset = (offsetX: any, offsetY: any) =>
  {
    mapFncs.updateMapOffset(offsetX, offsetY)
    let coordX = (offsetX * mapRefs.mapScale.current) % mapRefs.mapRef.current.width
    coordX < 0 && (coordX += mapRefs.mapRef.current.width)

    setCoords([coordX, offsetY * mapRefs.mapScale.current])
  }

  const keyUp = (e: any) => {

    if(!mapRefs.gameCanvasRef.current) return
    if(mapRefs.selectedCity.current) return

    if (e.code === 'KeyD') {
      isDrawingBorder.current = !isDrawingBorder.current
      if (!isDrawingBorder.current) {
        //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
        return
      }
      borders.current = []
      drawBorderHelperPos.current = []
      //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
      return
    }
    if (e.code === 'KeyZ') {
      if ((!isDrawingBorder.current) || !borders.current.length) return

      borders.current.pop()
      drawBorderHelperPos.current.pop()
      //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
      return
    }
  }

  const mouseDown = (e: any) => {
    mapRefs.isDragging.current = true
  }

  const mouseUp = (e: any) => {
    console.log("createMapPage mouseup")
    mapRefs.isDragging.current = false
    mapRefs.mousePos.current = getMousePos(e)
    
    let rect = mapRefs.canvasRef.current.getBoundingClientRect();
    let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) % mapRefs.mapRef.current.width
    coordX < 0 && (coordX += mapRefs.mapRef.current.width)
    let trueMousePosition = [
      (mapRefs.mousePos.current[0] - rect.left) * mapRefs.mapScale.current + coordX,
      (mapRefs.mousePos.current[1] - rect.top) * mapRefs.mapScale.current + mapRefs.mapOffsetY.current * mapRefs.mapScale.current
    ]
    
    let ctx: any = mapRefs.gameCanvasRef.current.getContext('2d')
    let mapWidth: any = mapRefs.mapRef.current.width
    if(!isDrawingBorder.current) {

      if(mapRefs.selectedCity.current){
        setFormCity( ({
          cityName: formCityRef.current.cityName,
          countryName: formCityRef.current.countryName,
          pop_max: formCityRef.current.pop_max,
          type: formCityRef.current.type,
          point: [
            trueMousePosition[0] % mapRefs.mapRef.current.width,
            trueMousePosition[1]
          ]
        }))
      }
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
            setFormCity( ({
              cityName: mapRefs.selectedCity.current.name,
              point: mapRefs.selectedCity.current.point,
              pop_max: mapRefs.selectedCity.current.pop_max,
              type: mapRefs.selectedCity.current.type,
              countryName: mapRefs.selectedCity.current.countryName,
            }))

            setCityModalError(null)
            setIsCitySaveSuccess(false)
            setSaveCityModalShow(true)
            return
          }
        }
        for (let i = 0; i < mapRefs.existingRiversPathes.current.length; i++) {
          if (ctx.isPointInStroke(
            mapRefs.existingRiversPathes.current[i].path,
            mapRefs.mousePos.current[0] - rect.left, mapRefs.mousePos.current[1] - rect.top
          )) {
            mapRefs.selectedRiver.current = mapRefs.existingRiversPathes.current[i]
            //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            return
          }
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }
      
      if(mapRefs.hoveredCountry.current)
      {
        console.log(mapRefs.hoveredCountry.current)
        for (let i = 0; i < mapRefs.existingBordersPathes.current.length; i++) {
          if(mapRefs.hoveredCountry.current.path[0] ==
               mapRefs.existingBordersPathes.current[i].path[0]
          ) {
            mapRefs.selectedCountry.current = { ...mapRefs.hoveredCountry.current }
            console.log(mapRefs.selectedCountry.current)
            break
          }
        }
      }
      //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)

      return
    }

    if (!borders.current.length) {
      drawBorderHelperPos.current.push(trueMousePosition)
      borders.current.push(trueMousePosition)
      //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
      return
    }

    ctx.lineWidth = mapRefs.mapProperties.current.borderLineWidths/mapRefs.mapScale.current

    if (trueMousePosition[0] + mapRefs.mapScale.current * mapRefs.mapScaleProperties.current.max > 
      borders.current[0][0] &&
      trueMousePosition[0] - mapRefs.mapScale.current * mapRefs.mapScaleProperties.current.max < 
      borders.current[0][0] &&
      trueMousePosition[1] + mapRefs.mapScale.current * mapRefs.mapScaleProperties.current.max > 
      borders.current[0][1] &&
      trueMousePosition[1] - mapRefs.mapScale.current * mapRefs.mapScaleProperties.current.max < 
      borders.current[0][1]) {

      
      //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
      setBordersModalError(null)
      setIsBorderSaveSuccess(false)
      setFormBorders({
        selType: 'country',
        selName: ''
      })
      setSaveBordersModalShow(true)
      return
    }
    borders.current.push(trueMousePosition)
    drawBorderHelperPos.current.push(trueMousePosition)
    //drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
  }

  const mouseMove = (e: any) => {
    let newClientPos = []
    if(e.touches)
    {
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
      console.log(offsetY);
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
    updateMapOffset(newOffsetX, newOffsetY);
    requestAnimationFrame(() => mapFncs.renderMapObjects(mapRefs.mapOffsetX.current,mapRefs.mapOffsetY.current));
    requestAnimationFrame(() => mapFncs.drawMapImage(mapRefs.mapOffsetX.current,mapRefs.mapOffsetY.current));

  }
  const updateMap = () => {
    if(!isMountedRef.current) return

    let newPos = movedMousePosition.current
    let mapWidth: any = mapRefs.mapRef.current.width
    let ctx: any = mapRefs.gameCanvasRef.current.getContext('2d')
    const rect = mapRefs.gameCanvasRef.current.getBoundingClientRect();
    let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) % mapRefs.mapRef.current.width
   
    if(mapRefs.isDragging.current)
    {
      updateMapOffset(mapRefs.mapOffsetX.current + (mapRefs.mousePos.current[0] - newPos[0]), 
        mapRefs.mapOffsetY.current)

      let mouseOffsetY = (mapRefs.mousePos.current[1] - newPos[1])
      if (mapRefs.mapOffsetY.current + mouseOffsetY > 0 &&
        mapRefs.mapOffsetY.current + mouseOffsetY < 
        (mapRefs.mapRef.current.height / mapRefs.mapScale.current - mapRefs.canvasRef.current.height)) {
        updateMapOffset(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current + mouseOffsetY)
      }
      mapRefs.mousePos.current = newPos
    } else {
      let offSelectedCounter = 0
      for (let k = coordX - mapWidth; k <= coordX + mapWidth; k += mapWidth) 
      {
        let minCountryPopulation = Infinity, currentHoveredCountry, hovCountryIndex = -1
        ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current)
        ctx.translate(-mapWidth / 2 - k, -mapRefs.mapOffsetY.current * mapRefs.mapScale.current)
        for(let i = 0; i < mapRefs.existingBordersPathes.current.length; i++)
        {
          if(ctx.isPointInPath(mapRefs.existingBordersPathes.current[i].path[0],
              newPos[0] - rect.left, newPos[1] - rect.top ))
          {
            currentHoveredCountry = mapRefs.existingBordersPathes.current[i]
            if(mapRefs.totalCountryPopulation.current[currentHoveredCountry.countryName] < minCountryPopulation)
            {
                minCountryPopulation = mapRefs.totalCountryPopulation.current[currentHoveredCountry.countryName]
                hovCountryIndex = i
            }
          } else {
            offSelectedCounter++
          }
        }
        
        if(currentHoveredCountry)
        {
          mapRefs.hoveredCountry.current = mapRefs.existingBordersPathes.current[hovCountryIndex]
        } 
        else if (offSelectedCounter == mapRefs.existingBordersPathes.current.length) 
        {
          mapRefs.hoveredCountry.current = false
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }
    }
    drawMap(mapRefs.mapOffsetX.current, mapRefs.mapOffsetY.current)
    requestAnimationFrame(updateMap)
  }
  const drawMap = (offsetX: any, offsetY: any) => 
  {
    mapFncs.renderMapObjects(offsetX, offsetY)
    mapFncs.drawMapImage(offsetX, offsetY)
    redrawMapWithCurrentBorders()
    //mapFncs.drawMapImage(offsetX, offsetY)
    /*
    let mapWidth: any = mapRefs.mapRef.current.width
    let ctx: any = mapRefs.canvasRef.current.getContext('2d')
    let rect = mapRefs.canvasRef.current.getBoundingClientRect();
    let coordX = (mapRefs.mapOffsetX.current * mapRefs.mapScale.current) % mapRefs.mapRef.current.width

    for (let k = coordX - mapWidth; k <= coordX + mapWidth; k += mapWidth) {
      let minCountryPopulation = Infinity, currentHoveredCountry, hovCountryIndex = -1
      ctx.scale(1 / mapRefs.mapScale.current, 1 / mapRefs.mapScale.current)
      ctx.translate(-mapWidth / 2 - k, -mapRefs.mapOffsetY.current * mapRefs.mapScale.current)
      for(let i = 0; i < mapRefs.existingBordersPathes.current.length; i++)
      {
        if (ctx.isPointInPath(
          mapRefs.existingBordersPathes.current[i].path[0],
          (mapRefs.mousePos.current[0] - rect.left), mapRefs.mousePos.current[1] - rect.top
        )) {
        currentHoveredCountry = mapRefs.existingBordersPathes.current[i]
          if(mapRefs.totalCountryPopulation.current[currentHoveredCountry.countryName] < minCountryPopulation)
          {
              minCountryPopulation = mapRefs.totalCountryPopulation.current[currentHoveredCountry.countryName]
              hovCountryIndex = i
          }
        }
      } 
      currentHoveredCountry && (mapRefs.hoveredCountry.current = mapRefs.existingBordersPathes.current[hovCountryIndex])
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }*/
  }
  return (
    <div className="createMapPage">
      {(mapRefs && coords.length > 0) && <>
      <p className="unselectable" 
        style={{ 
          color: 'white', 
          position: 'absolute', 
          fontSize: '16px',
          pointerEvents: 'none',
        }}>
        coords({`${coords[0]}, ${coords[1]}`}) --
        mouseCoords({`${mouseCoords.current[0]}, ${mouseCoords.current[1]}`}) --
        realClick({`${(mouseCoords.current[0] + coords[0]) % mapRefs.mapRef.current.width}, 
                    ${mouseCoords.current[1] + coords[1]}`}) --
        zoom({`${mapRefs.mapScale.current}`})
      </p></>}
      
      <MapLoader ref={mapLoaderRef} mapNameProp={mapNameParam}/>
      {mapRefs && <>
      <Modal
        show={saveBordersModalShow}
        onHide={handleBordersModalOnClose}
        dialogAs={DraggableModalDialog}
        backdrop="false"
        keyboard={false}
        
      >
          {isBorderSaveSuccess || bordersModalError ?
            <div>
              <Modal.Header style={mapRefs.modalProperties.current}>
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
              <Modal.Header style={mapRefs.modalProperties.current}>
                <Modal.Title>Save currently placed borders</Modal.Title>
                <Button className={'btn-close btn-close-white'}
                  style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                  onClick={handleBordersModalOnClose}></Button>
              </Modal.Header>
              <Modal.Body style={mapRefs.modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    Select selection type [country or river]
                  </Form.Label>
                  <Form.Select size='lg' name = "selType" onChange={handleFormBorders} value={formBorders.selType}
                    style={{ textAlign: 'center' }}>
                    <option value='country'>Country</option>
                    <option value='river'>River</option>
                  
                  </Form.Select>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={mapRefs.modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    Enter a selection name [alphabetic,&nbsp;
                    {formProperties.current.countryNameCharsLimit[0]} -&nbsp;
                    {formProperties.current.countryNameCharsLimit[1]} chars]
                  </Form.Label>
                  <Form.Control type="text" name = "selName" onChange={handleFormBorders}
                    value={formBorders.selName} placeholder="" />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer style={mapRefs.modalProperties.current}>
                <Button variant="primary"
                  style={{ marginRight: '15px' }}
                  onClick={handleBordersSave}>
                  Save borders
                </Button>
                <Button variant="secondary" onClick={handleBordersModalOnClose}>Cancel link</Button>
              </Modal.Footer>
            </div>
          }
      </Modal>

      <Modal
        show={loadingBorderSave}
        onHide={handleBordersModalOnClose}
        backdrop="static"
        keyboard={false}
      >
        <Draggable>
          <div>
            <Modal.Header style={mapRefs.modalProperties.current}>
              <Modal.Title>Saving borders, please wait..</Modal.Title>
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
              <Modal.Header style={mapRefs.modalProperties.current}>
                <Modal.Title>
                  {cityModalError ? cityModalError : 'Successfully saved city!'}
                </Modal.Title>
                <Button className={'btn-close btn-close-white'}
                  style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                  onClick={handleCityModalOnClose}
                  onTouchEnd={handleCityModalOnClose}
                ></Button>
              </Modal.Header>
            </div>
            :
            <div style={{ pointerEvents: 'auto' }}>
              <Modal.Header style={mapRefs.modalProperties.current}>
                <Modal.Title>Edit city properties</Modal.Title>
                <Button className={'btn-close btn-close-white'}
                  style={{ marginLeft: '15px', marginTop: '10px', padding: 0 }}
                  onClick={handleCityModalOnClose}
                  onTouchEnd={handleCityModalOnClose}>
                </Button>
              </Modal.Header>
              <Modal.Body style={mapRefs.modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The name of the city 
                  </Form.Label>
                  <Form.Control type="text" onChange={handleFormCityChange} name="cityName"
                    value={formCity.cityName} 
                    style={{
                      backgroundColor: (formCity.cityName !== mapRefs.selectedCity.current.name) 
                          ? 'darkseagreen' : 'white'
                    }}/>
                </Form.Group >
              </Modal.Body>
              
              <Modal.Body style={mapRefs.modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The type of the city
                  </Form.Label>
                  <Form.Select size='lg' onChange={handleFormCityChange} name="type"
                  value={formCity.type} 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: ((formCity.type === 'true' || formCity.type) !== mapRefs.selectedCity.current.type) 
                    ? 'darkseagreen' : 'white' 
                  }}>
                      <option value={"false"}>Normal city</option>
                      <option value={"true"}>The country capital</option>
                  </Form.Select>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={mapRefs.modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    City coords [click on map - [{mapRefs.selectedCity.current.point[0].toFixed(4)},
                    {mapRefs.selectedCity.current.point[1].toFixed(4)}]]
                  </Form.Label>
                  <Form.Control type="text" 
                    value={[formCity.point[0].toFixed(4), formCity.point[1].toFixed(4)]} 
                    style={{
                      backgroundColor: (formCity.point != mapRefs.selectedCity.current.point) 
                          ? 'darkseagreen' : 'white' 
                    }} disabled/>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={mapRefs.modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The population of the city
                  </Form.Label>
                  
                  <Form.Control type="number" onChange={handleFormCityChange} name="pop_max"
                    value={formCity.pop_max} 
                    style={{
                      backgroundColor: (formCity.pop_max != mapRefs.selectedCity.current.pop_max) 
                          ? 'darkseagreen' : 'white' 
                    }}/>
                </Form.Group >
              </Modal.Body>
              <Modal.Body style={mapRefs.modalProperties.current}>
                <Form.Group >
                  <Form.Label>
                    The country name of the city
                  </Form.Label>
                  
                  <Form.Select size='lg' onChange={handleFormCityChange} name="countryName"
                    value={formCity.countryName}
                    style={{ 
                      textAlign: 'center',
                      backgroundColor: (formCity.countryName != mapRefs.selectedCity.current.countryName) 
                          ? 'darkseagreen' : 'white' 
                    }}>
                     {mapRefs.existingCountries.current.map((country: any) => {
                        return (
                            <option value={country.name}>{country.name}</option> 
                        )
                     })}
                  </Form.Select>
                </Form.Group >
              </Modal.Body>
              <Modal.Footer style={mapRefs.modalProperties.current}>
                <Button variant="primary"
                  style={{ marginRight: '15px' }}
                  onClick={handleCitySave}
                  onTouchEnd={handleCitySave}>
                  Save city properties
                </Button>
              </Modal.Footer>
            </div>
          }
          </div>
        </Modal>
      }</>}
    </div>
  )
}