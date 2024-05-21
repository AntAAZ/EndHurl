import { City } from '../types/types'
import { axGet, axPost, defaultErrorHandler } from './axiosMethods'

const getNECities = async () => 
{
    return axGet(`getNaturalEarthCities`, {}, defaultErrorHandler)
}

const addCityToMap = async (parameterCity: any, mapName: string, errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axPost(`cityUpload`, {...parameterCity, mapName}, errHandler)
}

const getCitiesByMap = async (mapName: string) =>
{
    return axGet(`citiesGet`, { mapName }, defaultErrorHandler )
}
export { getNECities, addCityToMap, getCitiesByMap }