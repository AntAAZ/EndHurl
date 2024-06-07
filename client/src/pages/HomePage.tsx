
import React, { useState, useContext } from 'react';
import { userDataContext } from '../contexts/UserDataContext'
import LoginPage from './LoginPage';
import WelcomeAlert from '../components/WelcomeAlert';

export default function HomePage() {

    const [loading, error, user] = useContext(userDataContext)
    if (loading) return <></>
    return (
        <>
            {error ? <LoginPage/> : 
                <WelcomeAlert user={user} />
            }
            <div className='mainSection'>
                Main page content regardless of logged in or not. 
                <h2>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
                    distinctio earum repellat quaerat voluptatibus placeat nam,
                    commodi optio pariatur est quia magnam eum harum corrupti dicta,
                    aliquam sequi voluptate quas. Lorem ipsum dolor sit amet consectetur 
                    adipisicing elit. Sunt distinctio earum repellat quaerat voluptatibus 
                    placeat nam, commodi optio pariatur est quia magnam eum harum corrupti 
                    dicta, aliquam sequi voluptate quas.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
                    distinctio earum repellat quaerat voluptatibus placeat nam,
                    commodi optio pariatur est quia magnam eum harum corrupti dicta,
                    aliquam sequi voluptate quas. Lorem ipsum dolor sit amet consectetur 
                    adipisicing elit. Sunt distinctio earum repellat quaerat voluptatibus 
                    placeat nam, commodi optio pariatur est quia magnam eum harum corrupti 
                    dicta, aliquam sequi voluptate quas.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
                    distinctio earum repellat quaerat voluptatibus placeat nam,
                    commodi optio pariatur est quia magnam eum harum corrupti dicta,
                    aliquam sequi voluptate quas. Lorem ipsum dolor sit amet consectetur 
                    adipisicing elit. Sunt distinctio earum repellat quaerat voluptatibus 
                    placeat nam, commodi optio pariatur est quia magnam eum harum corrupti 
                    dicta, aliquam sequi voluptate quas.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
                    distinctio earum repellat quaerat voluptatibus placeat nam,
                    commodi optio pariatur est quia magnam eum harum corrupti dicta,
                    aliquam sequi voluptate quas. Lorem ipsum dolor sit amet consectetur 
                    adipisicing elit. Sunt distinctio earum repellat quaerat voluptatibus 
                    placeat nam, commodi optio pariatur est quia magnam eum harum corrupti 
                    dicta, aliquam sequi voluptate quas.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
                    distinctio earum repellat quaerat voluptatibus placeat nam,
                    commodi optio pariatur est quia magnam eum harum corrupti dicta,
                    aliquam sequi voluptate quas. Lorem ipsum dolor sit amet consectetur 
                    adipisicing elit. Sunt distinctio earum repellat quaerat voluptatibus 
                    placeat nam, commodi optio pariatur est quia magnam eum harum corrupti 
                    dicta, aliquam sequi voluptate quas.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
                    distinctio earum repellat quaerat voluptatibus placeat nam,
                    commodi optio pariatur est quia magnam eum harum corrupti dicta,
                    aliquam sequi voluptate quas. Lorem ipsum dolor sit amet consectetur 
                    adipisicing elit. Sunt distinctio earum repellat quaerat voluptatibus 
                    placeat nam, commodi optio pariatur est quia magnam eum harum corrupti 
                    dicta, aliquam sequi voluptate quas.
                </h2>
            </div>
        </>
    )
}