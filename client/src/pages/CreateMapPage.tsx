import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { userDataContext } from '../contexts/UserDataContext'
import { Button, Modal, Form } from 'react-bootstrap'
import Draggable from 'react-draggable'
import MapsPage from './MapsPage'
import { City, River } from '../types/types'
import { addCityToMap, getCitiesByMap, getNECities } from '../api/citiesAPI'
import { addWaterToMap, getWatersByMap, getNEWaters } from '../api/riversAPI'
import { addCountryToMap, getCountriesByMap, getNECountries } from '../api/countriesAPI'

export default function CreateMapPage() {

  const mapName = useRef("myMap")
  const mapUrl = "../world7w.png"
  const mapOffsetX: any = useRef()
  const mapOffsetY: any = useRef()

  const mapScale: any = useRef(1)
  const mapScaleProperties: any = useRef({
    step: 1.1, min: 0.25, max: 6
  })
  const mapProperties: any = useRef({
    borderLineWidths: 0.5,
    cityStrokeColor: '#abc9b46b',
    capitalCityStrokeColor: '#e8b04f',
    cityRadius: 6,
    capitalCityRadius: 6.5,
    maxDefaultUnitsInCity: 15,
    unitsInCityPerPopulation: 500000
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
  const [mapLoading, setMapLoading] = useState<boolean>(false)
  const [saveBordersModalShow, setSaveBordersModalShow] = useState<boolean>(false)
  const [bordersModalError, setBordersModalError] = useState(null)
  const [isBorderSaveSuccess, setIsBorderSaveSuccess] = useState<boolean>(false)
  const [loadingBorderSave, setLoadingBorderSave] = useState<boolean>(false)
  //
  const selectedRiver = useRef<any>(false)
  const selectedCountry = useRef<any>(false)
  const selectedCity = useRef<any>(false)
  const existingBorders = useRef<any[]>([])
  const existingRiverBorders = useRef<any[]>([])
  const existingCities = useRef<any[]>([])
  const existingBordersPathes = useRef<any[]>([])
  const existingRiversPathes = useRef<any[]>([])
  const existingCitiesPathes = useRef<any[]>([])
  const [loadingExistingBorders, setLoadingExistingBorders] = useState<boolean>(false)
  const [loadingExistingRivers, setLoadingExistingRivers] = useState<boolean>(false)
  const [formName, setFormName] = useState<string>("")
  const [formSelectName, setFormSelectName] = useState<string>("country")
  const [loading, error, user] = useContext(userDataContext)

  const handleFormNameChange = (e: any) => { setFormName(e.target.value) }
  const handleSelectChange = (e: any) => { setFormSelectName(e.target.value) }

  const handleBordersSave = async () => {
    setSaveBordersModalShow(true)
    if (formSelectName === 'country') {
      await addCountryToMap({
        countryName: formName,
        points: [...borders.current, borders.current[0]]
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
      for (let i = 0; i < borders.current.length; i++) {
        existingBorders.current.push({
          point: borders.current[i],
          selection: Date.now().toString(),
          countryName: formName,
          mapName: mapName.current,
        })
      }

      if (borders.current.length) {
        existingBorders.current.push({
          point: borders.current[0],
          selection: Date.now().toString(),
          countryName: formName,
          mapName: mapName.current,
        })
      }
      borders.current = []
      isDrawingBorder.current = false
      drawBorderHelperPos.current = []
      handleBordersModalOnClose()
      return
    }
    await addWaterToMap({
      name: formName,
      points: borders.current
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
    for (let i = 0; i < borders.current.length; i++) {
      existingRiverBorders.current.push({
        point: borders.current[i],
        selection: Date.now().toString(),
        name: formName,
        mapName: mapName.current,
      })
    }
    borders.current = []
    isDrawingBorder.current = false
    drawBorderHelperPos.current = []
    handleBordersModalOnClose()
  }

  const loadNaturalEarthBorders = async () => {
    let res = await getNECountries()
    let countries = res.data
    countries.forEach((country: any) => {
      let neBorderPoints: number[][] = []
      country.coords.map((points: number[][][]) => points[0]).forEach(async (points: number[][]) => {
        points.forEach((point: number[]) => {
          let x = mapRef.current.width * ((point[0] + 180) / 360)
          x += (x / (mapRef.current.width / 2)) * 2.5
          neBorderPoints.push([x, mapRef.current.height * ((point[1] - 90) / (-180))])
        })
        neBorderPoints.pop()
        await addCountryToMap({
          countryName: country.name,
          points: neBorderPoints
        }, mapName.current, (err: any) => setBordersModalError(err.response.data.message))
      })
    })
  }

  const loadNaturalEarthWaters = async () => {

    let res = await getNEWaters()
    let rivers = res.data
    rivers.forEach((river: River) => {
      let neBorderPoints: number[][] = []
      river.coords.forEach(async (points: number[][]) => {
        points.forEach((point: number[]) => {
          let x = mapRef.current.width * ((point[0] + 180) / 360)
          x += (x / (mapRef.current.width / 2)) * 2.5
          neBorderPoints.push([x, mapRef.current.height * ((point[1] - 90) / (-180))])
        })

        await addWaterToMap({
          name: river.name,
          points: neBorderPoints
        }, mapName.current, (err: any) => setBordersModalError(err.response.data.message))
      })
    })
  }
  const loadNaturalEarthCities = async () => {

    let res: any = await getNECities()
    let cities: City[] = res.data

    cities.forEach(async (city: City) => {

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
    existingBorders.current = res.data
    setLoadingExistingBorders(false)
    drawMap(mapOffsetX.current, mapOffsetY.current)
  }
  const loadRiverExistingBorders = async () => {
    setLoadingExistingRivers(true)
    const res = await getWatersByMap(mapName.current)
    existingRiverBorders.current = res.data
    setLoadingExistingRivers(false)
    drawMap(mapOffsetX.current, mapOffsetY.current)
  }
  const loadCountryExistingCities = async () => {
    const res = await getCitiesByMap(mapName.current)
    existingCities.current = res.data
    drawMap(mapOffsetX.current, mapOffsetY.current)
  }

  const loadAllBorders = async () => {
    unmountEventListeners()
    await Promise.all([
      loadCountryExistingBorders(),
      loadRiverExistingBorders(),
      loadCountryExistingCities()
    ]).then(() => addEventListeners())
  }

  useEffect(() => {
    mapRef.current.src = mapUrl
    mapRef.current.addEventListener('load', mapImageLoad)
    loadAllBorders()
    //loadNaturalEarthCities()
    //loadNaturalEarthBorders()
    //loadNaturalEarthWaters()
    requestIdRef.current = requestAnimationFrame(tick);
    return () => {
      unmountEventListeners()
      mapRef.current.removeEventListener('load', mapImageLoad)
      cancelAnimationFrame(requestIdRef.current)
    };
  }, [])

  const addEventListeners = () => {
    window.addEventListener('keyup', keyUp)
    window.addEventListener('mousedown', mouseDown)
    window.addEventListener('mouseup', mouseUp)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('wheel', mouseWheel, { passive: false })
  }

  const unmountEventListeners = () => {
    window.removeEventListener('keyup', keyUp)
    window.removeEventListener('mousedown', mouseDown)
    window.removeEventListener('mouseup', mouseUp)
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('wheel', mouseWheel)
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
    ctx.lineWidth = mapProperties.current.borderLineWidths

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
    addEventListeners()
    setSaveBordersModalShow(false)
  }

  const keyUp = (e: any) => {
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

  const mapImageLoad = () => {

    setMapLoading(true)
    updateMapOffset(mapRef.current.width / 2, 0)
    drawMap(mapRef.current.width / 2, 0)
  }

  const mouseDown = (e: any) => {

    if ((isDrawingBorder.current || !canvasRef.current)) return
    isDragging.current = true
    mousePos.current = getMousePos(e)
  }

  const mouseUp = (e: any) => {

    if (!canvasRef.current) return

    isDragging.current = false

    mousePos.current = getMousePos(e)
    let rect = canvasRef.current.getBoundingClientRect();
    let coordX = (mapOffsetX.current * mapScale.current) % mapRef.current.width
    coordX < 0 && (coordX += mapRef.current.width)
    let trueMousePosition = [
      (mousePos.current[0] - rect.left) * mapScale.current + coordX,
      (mousePos.current[1] - rect.top) * mapScale.current + mapOffsetY.current * mapScale.current
    ]
    let ctx: any = canvasRef.current.getContext('2d')
    let mapWidth: any = mapRef.current.width
    if (!isDrawingBorder.current) {
      for (let k = coordX - mapWidth; k <= coordX + mapWidth; k += mapWidth) {
        ctx.scale(1 / mapScale.current, 1 / mapScale.current)
        ctx.translate(-mapWidth / 2 - k, -mapOffsetY.current * mapScale.current)
        for (let i = 0; i < existingCitiesPathes.current.length; i++) {

          if (ctx.isPointInPath(
            existingCitiesPathes.current[i].path,
            mousePos.current[0] - rect.left, mousePos.current[1] - rect.top
          )) {
            selectedCity.current = existingCitiesPathes.current[i]
            console.log(selectedCity.current)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            drawMap(mapOffsetX.current, mapOffsetY.current)
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

        for (let i = 0; i < existingBordersPathes.current.length; i++) {
          if (ctx.isPointInPath(
            existingBordersPathes.current[i].path,
            mousePos.current[0] - rect.left, mousePos.current[1] - rect.top
          )) {
            selectedCountry.current = existingBordersPathes.current[i]
            console.log(selectedCountry.current)
          }
        }
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

    ctx.lineWidth = mapProperties.current.borderLineWidths

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

      unmountEventListeners()
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

    if ((!isDragging.current || !canvasRef.current)) return
    let newPos = getMousePos(e)
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
    if (isDrawingBorder.current) return
    let scaleProperties = mapScaleProperties.current
    if (e.deltaY > 0) {
      if (mapScale.current * scaleProperties.step > scaleProperties.max || mapOffsetY.current >
        (mapRef.current.height / (mapScale.current * scaleProperties.step) - canvasRef.current.height)) {
        return
      }
      mapScale.current *= scaleProperties.step
      updateMapOffset(mapOffsetX.current / scaleProperties.step,
        mapOffsetY.current / scaleProperties.step)
      drawMap(mapOffsetX.current, mapOffsetY.current)
      return
    }
    if (mapScale.current / scaleProperties.step < scaleProperties.min) return

    mapScale.current /= scaleProperties.step
    updateMapOffset(mapOffsetX.current * scaleProperties.step,
      mapOffsetY.current * scaleProperties.step)
    drawMap(mapOffsetX.current, mapOffsetY.current)
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
    setCoords([coordX, offsetY * mapScale.current])
  }

  const drawMap: any = (offsetX: any, offsetY: any) => {
    if (!canvasRef.current || mapUrl == null) return
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
          let drawBorderPath: Path2D = new Path2D(existingBordersPathes.current[i].path)
          ctx.scale(1 / mapScale.current, 1 / mapScale.current)
          ctx.translate(-mapImage.width / 2 - k, -offsetY * mapScale.current)
          if (selectedCountry.current.countryName === existingBordersPathes.current[i].countryName) {
            ctx.fill(drawBorderPath)
          }
          ctx.stroke(drawBorderPath)
          //existingBordersPathes.current[i].path = drawBorderPath
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
      }

      if (!existingBordersPathes.current.length) {
        if (existingBorders.current.length) {
          drawPath.moveTo(
            ((existingBorders.current[0].point[0] - k)) / mapScale.current,
            (existingBorders.current[0].point[1] / mapScale.current - offsetY)
          )
        }
        for (let i = 1; i < existingBorders.current.length; i++) {
          if (existingBorders.current[i].countryName !== existingBorders.current[i - 1].countryName ||
            existingBorders.current[i].selection !== existingBorders.current[i - 1].selection ||
            (i === existingBorders.current.length - 1)) {
            existingBordersPathes.current.push({
              countryName: existingBorders.current[i - 1].countryName,
              path: drawPath
            })
            drawPath = new Path2D()

            drawPath.moveTo(
              ((existingBorders.current[i].point[0] - k)) / mapScale.current,
              (existingBorders.current[i].point[1] / mapScale.current - offsetY)
            )
            continue
          }
          drawPath.lineTo(
            ((existingBorders.current[i].point[0] - k)) / mapScale.current,
            (existingBorders.current[i].point[1] / mapScale.current - offsetY)
          )
          if (i === existingBorders.current.length - 2) {
            drawPath.lineTo(
              ((existingBorders.current[i + 1].point[0] - k)) / mapScale.current,
              (existingBorders.current[i + 1].point[1] / mapScale.current - offsetY)
            )
          }
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
      }


      if (!existingRiversPathes.current.length) {
        if (existingRiverBorders.current.length) {
          drawPath = new Path2D()
          drawPath.moveTo(
            ((existingRiverBorders.current[0].point[0] - k)) / mapScale.current,
            (existingRiverBorders.current[0].point[1] / mapScale.current - offsetY)
          )
        }
        for (let i = 1; i < existingRiverBorders.current.length; i++) {

          if (i === existingRiverBorders.current.length - 1) {
            drawPath.lineTo(
              ((existingRiverBorders.current[i].point[0] - k)) / mapScale.current,
              (existingRiverBorders.current[i].point[1] / mapScale.current - offsetY))
          }
          if (existingRiverBorders.current[i].name !== existingRiverBorders.current[i - 1].name ||
            existingRiverBorders.current[i].selection !== existingRiverBorders.current[i - 1].selection ||
            (i === existingRiverBorders.current.length - 1)) {
            existingRiversPathes.current.push({
              name: existingRiverBorders.current[i - 1].name,
              path: drawPath
            })

            drawPath = new Path2D()
            drawPath.moveTo(
              ((existingRiverBorders.current[i].point[0] - k)) / mapScale.current,
              (existingRiverBorders.current[i].point[1] / mapScale.current - offsetY)
            )
            continue
          }

          drawPath.lineTo(
            ((existingRiverBorders.current[i].point[0] - k)) / mapScale.current,
            (existingRiverBorders.current[i].point[1] / mapScale.current - offsetY)
          )

        }
      }
      if(existingCitiesPathes.current.length > 0)
      {
        ctx.lineWidth = mapProperties.current.borderLineWidths
        for (let i = 0; i < existingCitiesPathes.current.length; i++) {
          let drawBorderPath: Path2D = new Path2D(existingCitiesPathes.current[i].path)
          ctx.scale(1 / mapScale.current, 1 / mapScale.current)
          ctx.translate(-mapImage.width/2 - k, -offsetY * mapScale.current)
          /*if (selectedCity.current.name === existingCitiesPathes.current[i].name &&
              selectedCity.current.area === existingCitiesPathes.current[i].area) 
          {
            ctx.strokeStyle = drawBorderProperties.current.waterBorderShapeFillColor
          } else {
            ctx.strokeStyle = drawBorderProperties.current.waterBorderShapeStrokeColor
          }*/
          ctx.strokeStyle = mapProperties.current.cityStrokeColor
          if(existingCitiesPathes.current[i].type)
          {
            ctx.strokeStyle = mapProperties.current.capitalCityStrokeColor
          }
          ctx.stroke(drawBorderPath)

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
            ((existingCitiesPathes.current[i].point[0] - k - 1) - unitsReinf.toString().length * 1.5) / mapScale.current,
            ((existingCitiesPathes.current[i].point[1] + 1.5) / mapScale.current - offsetY)
          )
          ctx.stroke()
          ///
        }
      }
      if (!existingCitiesPathes.current.length) {
        for (let i = 0; i < existingCities.current.length; i++) {
          drawPath = new Path2D()
          drawPath.arc(
            ((existingCities.current[i].point[0] - k)) / mapScale.current,
            (existingCities.current[i].point[1] / mapScale.current - offsetY),
            mapProperties.current.capitalCityRadius / mapScale.current, 0, 2 * Math.PI
          )
          drawPath.closePath()
          
          existingCitiesPathes.current.push({
            point: existingCities.current[i].point,
            name: existingCities.current[i].name,
            type: existingCities.current[i].type,
            area: existingCities.current[i].area,
            pop_max: existingCities.current[i].pop_max,
            countryName: existingCities.current[i].countryName,
            path: drawPath
          })
        }
      }
    }

    return
  }

  const tick = useCallback(() => {
    requestIdRef.current = requestAnimationFrame(tick)
  }, []);

  if (loading) return <>Loading user data</>
  if (!mapLoading) return <>Loading map image</>
  if (error) return <MapsPage />

  return (
    <div className="createMapPage">
      <p style={{ color: 'white', position: 'absolute', fontSize: '24px' }}>
        coords({`${coords[0]}, ${coords[1]}`}) --
        mouseCoords({`${mouseCoords[0]}, ${mouseCoords[1]}`}) --
        realClick({`${(mouseCoords[0] + coords[0]) % mapRef.current.width}, 
                    ${mouseCoords[1] + coords[1]}`}) --
        zoom({`${mapScale.current}`})
      </p>
      <canvas ref={canvasRef} style={{ display: 'block' }} id='canvas-id' />
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
              <Modal.Title>Loading borders</Modal.Title>
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
              <Modal.Title>Loading rivers</Modal.Title>
            </Modal.Header>
          </div>
        </Draggable>
      </Modal>
    </div>
  )
}