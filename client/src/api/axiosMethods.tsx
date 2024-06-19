import axios from 'axios'

const axGet = async (route: String, params?: Object, onError?: Function) => {
    return axios.get(
        `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/${route}`, 
        {
            params,
            withCredentials: true
        }).catch((err) => onError?.(err))
}
const axPost = async (route: String, data: Object,  onError?: Function) => {
    return axios.post(
        `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/${route}`, data, 
        {
            withCredentials: true
        }).catch((err) => onError?.(err) )
}
const axPostMultiPart = async (route: String, data: Object,  onError?: Function) => {
    return axios.post(
        `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/${route}`, data, 
        {   headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        }).catch((err) => onError?.(err) )
}
const defaultErrorHandler = (err: any) => console.error(err.response.data.message)
export { axGet, axPost, axPostMultiPart, defaultErrorHandler }
