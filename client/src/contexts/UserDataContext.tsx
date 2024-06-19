import axios from 'axios';
import React, { createContext, PropsWithChildren, useState, useEffect } from 'react';

export const userDataContext = createContext<any>({})

export default function UserDataContext(props: PropsWithChildren<any>) {
    
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/user`, {
            withCredentials: true
        })
        .then(res => setUser(res.data))
        .catch(err => setError(err.response.data.message))
        .finally(() => setLoading(false))
    }, [])

    return (
        <userDataContext.Provider value={[loading, error, user]}>{props.children}</userDataContext.Provider>
    )
}
