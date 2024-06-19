import { axGet, axPost, defaultErrorHandler } from './axiosMethods'

const addUserGameData = async (gameParams: any, errHandler?: Function) => 
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axPost(`addUserGameData`, {...gameParams}, errHandler)
}

const getUserGameData = async (params: any, errHandler?: Function) =>
{
    !errHandler && (errHandler = defaultErrorHandler )
    return axGet(`getUserGameData`, { ...params }, errHandler )
}
export { getUserGameData, addUserGameData }
