import { River } from '../types/types'
import { axGet, axPost, axPostMultiPart, defaultErrorHandler } from './axiosMethods'

const getMapByName = async (name: string) => 
{
    return axGet(`getMapByName`, { name: name }, defaultErrorHandler)
}

const getAllMaps = async (errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axGet(`getAllMaps`, errHandler)
}
const addMapByName = async (params: any,  errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axPostMultiPart(`addMapByName`, params , errHandler)
}
export { getMapByName, getAllMaps, addMapByName }