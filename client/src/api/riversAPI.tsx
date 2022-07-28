import { River } from '../types/types'
import { axGet, axPost, defaultErrorHandler } from './axiosMethods'

const getNEWaters = async () => 
{
    return axGet(`getNaturalEarthWaters`, {}, defaultErrorHandler)
}

const addWaterToMap = async (parameterWaters: any, mapName: string, errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axPost(`waterBorderUpload`, {...parameterWaters, mapName}, errHandler)
}

const getWatersByMap = async (mapName: string) =>
{
    return axGet(`waterBordersGet`, { mapName }, defaultErrorHandler )
}
export { getNEWaters, addWaterToMap, getWatersByMap }