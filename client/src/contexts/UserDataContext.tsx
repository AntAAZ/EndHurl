import axios from 'axios';
import React, { createContext, PropsWithChildren, useState, useEffect } from 'react';

export const userDataContext = createContext<any>({})

export default function UserDataContext(props: PropsWithChildren<any>) {
    
    const [user, setUser] = useState<any>()
    useEffect(() => {
        axios.get(`http://localhost:3000/user`, {
            withCredentials: true
        }).then(res => {
            setUser(res.data)
        })
    })
    
    return (
        <userDataContext.Provider value={user}>{props.children}</userDataContext.Provider>
    )
}