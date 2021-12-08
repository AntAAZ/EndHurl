import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';

import './main.css';
import React from 'react';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import NavBar from './components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserDataContext from './contexts/UserDataContext';

function App() 
{
	return (
		<Router>
			<UserDataContext>
    		<NavBar />
			<Routes>
				<Route path='/' element={<HomePage />}></Route>
				<Route path='/login' element={<LoginPage />}></Route>
				<Route path='/register' element={<RegisterPage />}></Route>
				<Route path='/settings' element={<SettingsPage />}></Route>
			</Routes>
			</UserDataContext>
		</Router>
	);
}

export default App;
