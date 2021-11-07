import React from 'react';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage';
import './main.css';
function App() 
{
	return (
		<Router>
			<NavBar/>
			<Routes>
				<Route path='/' element = {<HomePage/>}></Route>
				<Route path='/login' element = {<LoginPage/>}></Route>
				<Route path='/profile' element = {<ProfilePage/>}></Route>
			</Routes>
		</Router>
	);
}

export default App;
