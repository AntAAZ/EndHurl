
import React, { useState, useContext } from 'react';
import { userDataContext } from '../contexts/UserDataContext'
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap'
import LoginPage from './LoginPage';
import { Link } from 'react-router-dom'

export default function MapsPage() {

    const [loading, error, user] = useContext(userDataContext)
    if (loading) return <></>
    return (
        <div className="mapPage">
            {error ? <LoginPage/> :
                <> 
                    <Row className='justify-content-evenly'>
                        <div className="squareImagesResize" id="createMap" onClick={
                            () => window.location.href = '/maps/create'
                        }></div>
                        <div className="squareImagesResize" id="searchMap"></div>
                    </Row>
                </>
            }
            <div className="mapRulesDisclaimer">
                <h2 className='text-center' style={{paddingTop: '20px'}}>
                    Disclaimer about the usage of the map service
                </h2>
                <hr/>
                <ol>
                    <li>
                        Creating and modifying a map is free, but to publish one (or publish changes done on that map) you will need a 
                        subscription. In the alpha - beta phases of the game, people will not need a subscription.
                    </li>
                    <li>
                        When you create a map, you are contributing to the game, and agree that your map becomes property of the game. 
                        You lose your rights of deleting your maps. That is done in order to avoid easy potential vandalization and 
                        destruction of your work in case your account gets compromised. If you want your map to be deleted you should 
                        contact an admin and state your reasons. If your map is often played by other players it will not be deleted
                        unless you have serious reasons for that - the active community has to also support your decision.
                    </li>
                    <li>
                        If a map is vandalized (with the edit function, not delete) due to a case of a compromised or shared account,
                        we are in no way obliged to help you repair the damage. When you accept the ToS, you agree that when you
                        share your account, you take complete responsibility for any actions done on your account. The same thing
                        applies if your account is compromised, so to avoid that, make sure you choose safer and longer passwords. It 
                        is also recommended to use an unique password for each site to avoid getting phished and then compromised.
                    </li>
                    <li>
                        You agree that if your map contains pornographic or highly inappropriate material, it can be completely 
                        removed at any time by an admin. 
                    </li>
                    <li>
                        You are allowed to ban any player from playing on your map for whatever reasons, except staff members. If a 
                        staff member is trolling in your map games and ruining the experience for everyone else, please contact the 
                        admins or the owner of the game.
                    </li>
                    <li>
                        If you 'clone' another person's map 1:1 (and even put the same map name) with the intent of deceiving other 
                        people into playing against you on unfair terms then your map will be deleted, you will lose any rewards earned 
                        with the help of this method, and your account will be banned. 
                    </li>
                </ol>
            </div>
        </div>
    )
}