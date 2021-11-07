import { Link }from 'react-router-dom';

export default function NavBar()
{
    return (
        <div className="navContainer">
            <Link to='/logout'>Logout</Link>
            <Link to='/home'>Home</Link>
            <Link to='/profile'>Profile</Link>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
        </div>
    )
}