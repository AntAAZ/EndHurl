import { Country } from '../types/types'
import { axGet, axPost, defaultErrorHandler } from './axiosMethods'

const getNECountries = async () => 
{
    return axGet(`getNaturalEarthBorders`, {}, defaultErrorHandler)
}

const addCountryToMap = async (parameterCountries: any, mapName: string, errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axPost(`borderUpload`, {...parameterCountries, mapName}, errHandler)
}

const getCountriesByMap = async (mapName: string) =>
{
    return axGet(`bordersGet`, { mapName }, defaultErrorHandler )
}
export { getNECountries, addCountryToMap , getCountriesByMap }
