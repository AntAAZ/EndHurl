import React, { useContext } from 'react';
import { userDataContext } from '../contexts/UserDataContext';

export default function HomePage()
{
    const ctx = useContext(userDataContext)
    
    return (
        <div>

            {ctx ? (
                    <>
                    <p>This is the homepage, mr {ctx.username}</p>
                    </>
                ) : (
                    <>
                    <p>This is the homepage - not logged in</p>
                    </>
                )
            }
        </div>
    )
}