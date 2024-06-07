import React, { useState, useContext, useEffect } from 'react';
import { userDataContext } from '../contexts/UserDataContext';
import { Button, Row, Col, Modal, Spinner } from 'react-bootstrap';
import LoginPage from './LoginPage';
import io from 'socket.io-client';
import { getMapByName } from '../api/mapsAPI';
import { useNavigate } from 'react-router-dom';

export default function GamePage({ linkParam }: any) 
{
    const [socket, setSocket] = useState(null);
    const [loading, error, user] = useContext(userDataContext)
    useEffect(() => {

        if(error) return
        /*
            //check if game exists with this link
            //retrieve game data from database
            //check if current user is creator of the game to add more options
            //when game is started by creator, fire navigating events
            //if creator leaves game before its started make another user creator
            //if creator leaves game as the only user then delete game
        */
        const newSocket: any = io(
            `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}`
        )
        setSocket(newSocket)

        return () => {
            newSocket.close()
        }
    }, [error])


    if(error) return <LoginPage/>
    return (
        <div className="GamePage">
           
        </div>
    );
}