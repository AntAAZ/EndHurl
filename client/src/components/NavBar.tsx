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
        })
    }

    return (
        <div className="navContainer">
            <Link onClick={logout} to='/'>Logout</Link>
            <Link to='/'>Home</Link>
            <Link to='/profile'>Profile</Link>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
        </div>
    )
}