import LoginPage from './pages/LoginPage';

import './main.css';
import React from 'react';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import MapsPage from './pages/MapsPage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserDataContext from './contexts/UserDataContext';
import CustomizationSettings from './components/CustomizationSettings';
import ChangePass from './components/ChangePass';

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
				<Route path='/maps' element={<MapsPage />}></Route>
				<Route path='/customization' element={<CustomizationSettings />}></Route>
				<Route path='/account' element={<ChangePass />}></Route>
			</Routes>
			<Footer />
			</UserDataContext>
		</Router>
	);
}

export default App;
