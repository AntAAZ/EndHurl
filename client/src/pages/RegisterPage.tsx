import React , { useState, useContext } from 'react'
import axios from 'axios'
import { userDataContext } from '../contexts/UserDataContext';
import { Navigate } from 'react-router-dom';

export default function RegisterPage()
{
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const ctx = useContext(userDataContext)

    const register = () => {
        axios.post('http://localhost:3000/register', {
            username, password
        }, {
            withCredentials: true
        }).then(res => {
            if(res.data === "success")
            {
                window.location.href = '/'
            } else {
                setErrorMessage(res.data.message)
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
                <h1>Register</h1>
                <input type='text' placeholder='username' onChange={e => setUsername(e.target.value)}/>
                <input type='text' placeholder='password' onChange={e => setPassword(e.target.value)}/>

                <button onClick={register}>Register</button>
                {{errorMessage} ? <p>{errorMessage}</p> : null} 
                </>
            )}
        </div>
    )
       
}