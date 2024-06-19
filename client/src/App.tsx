import './main.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ChangePass from './components/ChangePass';
import CustomizationSettings from './components/CustomizationSettings';
import HomePage from './pages/HomePage';
import MapsPage from './pages/MapsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateMapPage from './pages/CreateMapPage';
import GamePage from './pages/GamePage';
import UserDataContext from './contexts/UserDataContext';
function App() 
{	
	const CreateMapPageWrapper = (): any => {
		const { mapNameParam } = useParams();
		return <CreateMapPage mapNameParam={mapNameParam} />;
  	};
	const GamePageWrapper = (): any => {
		const { linkParam } = useParams();
		return <GamePage linkParam={linkParam} />;
  	};
	const FallbackWrapper = (): any => {
		return (
		  <div>
			<h1>404 Page not Found</h1>
		  </div>
		)
	}
	return (
		<Router>
			<UserDataContext>
    		<NavBar />
			<Routes>
				<Route path='*' element={<FallbackWrapper />} />
				<Route path='/' element={<HomePage />}></Route>
				<Route path='/login' element={<LoginPage />}></Route>
				<Route path='/register' element={<RegisterPage />}></Route>
				<Route path='/maps' element={<MapsPage />}></Route>
				<Route path='/customization' element={<CustomizationSettings />}></Route>
				<Route path='/account' element={<ChangePass />}></Route>
				<Route path='/maps/create' element={<CreateMapPage />}></Route>
				<Route path='/maps/edit/:mapNameParam' element={<CreateMapPageWrapper />}></Route>
				<Route path='/games/:linkParam' element={<GamePageWrapper />}></Route>
			</Routes>
			<Footer />
			</UserDataContext>
		</Router>
	);
}

export default App;
