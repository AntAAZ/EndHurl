import React , { useState, useContext } from 'react'
import axios from 'axios'
import { userDataContext } from '../contexts/UserDataContext';
import { Navigate } from 'react-router-dom'

export default function LoginPage()
{
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const ctx = useContext(userDataContext)
    
    const login = () => {
        axios.post('http://localhost:3000/login', {
            username, password
        }, {
            withCredentials: true
        }).then(res => {
            if(res.data.message)
            {
                setErrorMessage(res.data.message)
            }
            else {
                window.location.href = '/'
            }
        })
    }

    return (
        <div>
            {ctx ? 
            (
                <Navigate to = "/"/>
            ) : (
                <>
                <h1>Login</h1>
                <input type='text' placeholder='username' onChange={e => setUsername(e.target.value)}/>
                <input type='text' placeholder='password' onChange={e => setPassword(e.target.value)}/>
                <button onClick={login}>Login</button>
                {{errorMessage} ? <p>{errorMessage}</p> : null}
                </>
            )}
        </div>
    )
}