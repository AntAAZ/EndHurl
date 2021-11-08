import React from 'react';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

import './main.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
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
					<Route path='/profile' element={<ProfilePage />}></Route>
				</Routes>
			</UserDataContext>
		</Router>
	);
}

export default App;
