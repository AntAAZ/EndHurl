import axios from 'axios'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { userDataContext } from '../contexts/UserDataContext'

export default function NavBar()
{
    const ctx = useContext(userDataContext)

    const logout = () => {
        axios.get(`http://localhost:3000/logout`, {
            withCredentials: true
        }).then(res => {
            if(res.data === "success")
            {
                window.location.href = '/'
            }
        })
    }

    return (
        <div className="navContainer">
            <Link to='/'>Home</Link>
            {ctx ? (
                <>
                <Link onClick={logout} to='/'>Logout</Link>
                <Link to='/profile'>Profile</Link>
                </>
            ) : (
                <>
                <Link to='/login'>Login</Link>
                <Link to='/register'>Register</Link>
                </>
            )}
        </div>
    )
}