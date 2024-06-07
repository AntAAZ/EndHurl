import React, { useState, useContext, useEffect } from 'react';
import { userDataContext } from '../contexts/UserDataContext';
import { Button, Row, Col, Modal, Spinner } from 'react-bootstrap';
import LoginPage from './LoginPage';
import { getAllMaps } from '../api/mapsAPI';
import { useNavigate } from 'react-router-dom';

export default function CreateGamePage({ mapNameParam }: any) 
{

    const [loading, error, user] = useContext(userDataContext)


    useEffect(() => {
        if(error) return
        // if map doesnt exist navigate user back
        // generate random link for the game
        // fill out form fields for game customizations
        // add game to database
        // redirect user to GamePage
    }, [error])

    if (loading) return <></>;

    return (
        <div className="CreateGamePage">

        </div>
    );
}