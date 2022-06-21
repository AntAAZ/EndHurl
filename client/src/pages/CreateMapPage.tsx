
import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { userDataContext } from '../contexts/UserDataContext'
import MapsPage from './MapsPage';

export default function CreateMapPage() {

  const mapUrl = "../world2.png";
  const mapOffsetX: any = useRef()
  const mapOffsetY: any = useRef()

  const mapScale: any = useRef(1)
  const mapScaleProperties: any = useRef({
    step: 1.1, min: 0.5, max: 5
  })

  const canvasRef: any = useRef(null)
  const requestIdRef: any = useRef()
  const mousePos: any = useRef([0, 0])
  const isDragging: any = useRef(false)
  const mapRef: any = useRef(new Image())
  const intervalCanvasRef: any = useRef(null)
  //debugging coordds for rendering, TB removed
  const [coords, setCoords] = useState<any>([])
  const [mouseCoords, setMouseCoords] = useState<any>([0, 0])
  //
  const borders: any = useRef([])
  const isDrawingBorder: any = useRef(false)
  const drawBorderHelperPos: any = useRef([])
  const [mapLoading, setMapLoading] = useState(false)
  const [loading, error, user] = useContext(userDataContext)


  useEffect(() => {
    mapRef.current.src = mapUrl
    addEventListeners()
    requestIdRef.current = requestAnimationFrame(tick);
    return () => {
      unmountEventListeners()
      cancelAnimationFrame(requestIdRef.current)
    };
  }, [])

  const addEventListeners = () => {
    mapRef.current.addEventListener('load', mapImageLoad)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('mousedown', mouseDown)
    window.addEventListener('mouseup', mouseUp)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('wheel', mouseWheel, {passive: false})
  }

  const unmountEventListeners = () => {
    mapRef.current.removeEventListener('load', mapImageLoad)
    window.removeEventListener('keyup', keyUp)
    window.removeEventListener('mousedown', mouseDown)
    window.removeEventListener('mouseup', mouseUp)
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('wheel', mouseWheel)
    if(intervalCanvasRef.current != null) clearInterval(intervalCanvasRef.current)
  }

  const keyUp = (e: any) => {
    if(e.code == 'KeyD')
    {
      isDrawingBorder.current = !isDrawingBorder.current
    }
  }
  
  const mapImageLoad = (e: any) => {
    setMapLoading(true)
    updateMapOffset(mapRef.current.width/2, 0)
    intervalCanvasRef.current = 
      setInterval(() => drawMap(mapRef.current.width/2, 0))
  }

  const mouseDown = (e: any) => {
    if(isDrawingBorder.current || !canvasRef.current) return
    isDragging.current = true
    mousePos.current = getMousePos(e)
  }
  const mouseUp = (e: any) => {
    if(!canvasRef.current) return
    isDragging.current = false
    mousePos.current = getMousePos(e)
    if(isDrawingBorder.current)
    {
      let rect = canvasRef.current.getBoundingClientRect();
      let coordX = (mapOffsetX.current * mapScale.current) % mapRef.current.width
      coordX < 0 && (coordX += mapRef.current.width)
      let ctx: any = canvasRef.current.getContext('2d')
      ctx.lineWidth =  mapScaleProperties.current.max - mapScale.current
      if(borders.current.length == 0)
      {
        ctx.beginPath()
        ctx.moveTo(mousePos.current[0] - rect.left, mousePos.current[1] - rect.top)
        drawBorderHelperPos.current = [mousePos.current[0] - rect.left, mousePos.current[1] - rect.top]
      } else {
        ctx.strokeStyle = 'red'
        ctx.lineTo(mousePos.current[0] - rect.left, mousePos.current[1] - rect.top)
        drawBorderHelperPos.current = [mousePos.current[0] - rect.left, mousePos.current[1] - rect.top]
        ctx.stroke()
      }
      let trueMousePosition = [
        (mousePos.current[0] - rect.left)*mapScale.current + coordX,
        (mousePos.current[1] - rect.top)*mapScale.current + mapOffsetY.current*mapScale.current
      ]
      if(borders.current.length > 0 &&
          trueMousePosition[0] + mapScale.current*mapScaleProperties.current.max > borders.current[0][0] && 
          trueMousePosition[0] - mapScale.current*mapScaleProperties.current.max < borders.current[0][0] &&
          trueMousePosition[1] + mapScale.current*mapScaleProperties.current.max > borders.current[0][1] && 
          trueMousePosition[1] - mapScale.current*mapScaleProperties.current.max < borders.current[0][1] ){
        
        alert('please')
        ///handle prompting here
        return
      }
      borders.current.push(trueMousePosition)
    }
  }

  const mouseMove = (e: any) => {

    if(!isDragging.current || !canvasRef.current) return
    let newPos = getMousePos(e)
    updateMapOffset(mapOffsetX.current + (mousePos.current[0] - newPos[0]), mapOffsetY.current)

    let mouseOffsetY = (mousePos.current[1] - newPos[1])
    if(mapOffsetY.current + mouseOffsetY > 0 && 
      mapOffsetY.current + mouseOffsetY < (mapRef.current.height/mapScale.current - canvasRef.current.height))
    {
      updateMapOffset(mapOffsetX.current, mapOffsetY.current + mouseOffsetY)
    }
    mousePos.current = newPos
    drawMap(mapOffsetX.current, mapOffsetY.current)

  }

  const mouseWheel = (e: any) => {
    e.preventDefault();
    e.stopPropagation()
    if(isDrawingBorder.current) return
    let scaleProperties = mapScaleProperties.current
    if(e.deltaY > 0)
    {
      if(mapScale.current*scaleProperties.step > scaleProperties.max ||  mapOffsetY.current > 
        (mapRef.current.height/(mapScale.current*scaleProperties.step) - canvasRef.current.height))
      {
        return
      }
      mapScale.current *= scaleProperties.step
      updateMapOffset(mapOffsetX.current/scaleProperties.step, 
        mapOffsetY.current/scaleProperties.step)
      drawMap(mapOffsetX.current, mapOffsetY.current)
      return
    }
    if(mapScale.current/scaleProperties.step < scaleProperties.min)
    {
      return
    }
    mapScale.current /= scaleProperties.step
    updateMapOffset(mapOffsetX.current*scaleProperties.step, 
      mapOffsetY.current*scaleProperties.step)
    drawMap(mapOffsetX.current, mapOffsetY.current)
  }

  const getMousePos = (e: any) => {
    let rect = canvasRef.current.getBoundingClientRect();
    setMouseCoords([
      (e.clientX - rect.left)*mapScale.current, 
      (e.clientY - rect.top)*mapScale.current
    ])
    return [e.clientX , e.clientY]
  };

  const updateMapOffset = (offsetX: any, offsetY: any) => {
    mapOffsetX.current = offsetX
    mapOffsetY.current = offsetY
    let coordX = (offsetX * mapScale.current) % mapRef.current.width
    coordX < 0 && (coordX += mapRef.current.width)
    setCoords([coordX, offsetY*mapScale.current])
  }
  const drawMap: any = (offsetX: any, offsetY: any) => {
    if(canvasRef.current == null || mapUrl == null) return
    if(intervalCanvasRef.current != null) {
      clearInterval(intervalCanvasRef.current)
      intervalCanvasRef.current = 0
    }

    canvasRef.current.width = window.innerWidth
    canvasRef.current.height = window.innerHeight
    let mapImage: any = mapRef.current
    
    let ctx: any = canvasRef.current.getContext('2d')
    if(offsetX*mapScale.current >= mapImage.width || 
      offsetX*mapScale.current <= -mapImage.width) offsetX %= mapImage.width/mapScale.current

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    
    ctx.drawImage(mapImage, 
      offsetX*mapScale.current, offsetY*mapScale.current, 
      (canvasRef.current.width-offsetX)*mapScale.current, canvasRef.current.height*mapScale.current, 
      0, 0, (canvasRef.current.width-offsetX), canvasRef.current.height)
    
    ctx.drawImage(mapImage, 
      canvasRef.current.width*mapScale.current, offsetY*mapScale.current, 
      offsetX*mapScale.current, canvasRef.current.height*mapScale.current, 
      (canvasRef.current.width-offsetX), 0, offsetX, canvasRef.current.height)

    if(offsetX > mapImage.width/mapScale.current - canvasRef.current.width)
    {
      ctx.drawImage(mapImage, 
        0, offsetY*mapScale.current, 
        offsetX*mapScale.current - mapImage.width + canvasRef.current.width*mapScale.current, 
        canvasRef.current.height*mapScale.current, 
        mapImage.width/mapScale.current - offsetX, 0, 
        offsetX - mapImage.width/mapScale.current + canvasRef.current.width, canvasRef.current.height)
    }
    else if(offsetX < 0)
    {
      ctx.drawImage(mapImage, 
        mapImage.width+offsetX*mapScale.current, offsetY*mapScale.current, 
        -offsetX*mapScale.current, canvasRef.current.height*mapScale.current, 
        0, 0, -offsetX, canvasRef.current.height)
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
      <p style={{color: 'white', position: 'absolute', fontSize: '24px'}}>
        coords({`${coords[0]}, ${coords[1]}`}) -- 
        mouseCoords({`${mouseCoords[0]}, ${mouseCoords[1]}`}) --
        realClick({`${(mouseCoords[0] + coords[0])%mapRef.current.width}, 
                    ${mouseCoords[1] + coords[1]}`}) --
        zoom({`${mapScale.current}`})
      </p>
      <canvas ref={canvasRef} id='canvas-id'/>
    </div>
  )
}