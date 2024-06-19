import { axGet, axPost, defaultErrorHandler } from './axiosMethods'

const getAllGames = async () => 
{
    return axGet(`getAllGames`, {}, defaultErrorHandler)
}

const addGameByProps = async (gameParams: any, errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axPost(`addGameByProps`, {...gameParams}, errHandler)
}

const editGameByProps = async (gameParams: any, errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axPost(`editGameByProps`, {...gameParams}, errHandler)
}
    
const getGameByLink = async (link: string, errHandler?: Function) =>
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axGet(`getGameByLink`, { link }, errHandler )
}
export { getAllGames, addGameByProps, getGameByLink, editGameByProps }