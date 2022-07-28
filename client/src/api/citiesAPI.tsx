import { City } from '../types/types'
import { axGet, axPost, defaultErrorHandler } from './axiosMethods'

const getNECities = async () => 
{
    return axGet(`getNaturalEarthCities`, {}, defaultErrorHandler)
}

const addCityToMap = async (parameterCity: City, mapName: string) => 
{
    return axPost(`cityUpload`, {...parameterCity, mapName}, defaultErrorHandler)
}

const getCitiesByMap = async (mapName: string) =>
{
    return axGet(`citiesGet`, { mapName }, defaultErrorHandler )
}
export { getNECities, addCityToMap, getCitiesByMap }