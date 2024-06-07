import React, { useState, useEffect } from 'react';
import { Alert, Fade } from 'react-bootstrap';

const WelcomeAlert = ({ user }: any) => {
    const [show, setShow] = useState(true);
    const [fadeIn, setFadeIn] = useState(true);


    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setShow(false);
        }, 3500);

        const timer = setTimeout(() => {
            setFadeIn(false);
        }, 3000)
        return () => {
            clearTimeout(timer)
            clearTimeout(hideTimer);
        };
    }, []);

    const sendWelcomeMessage = () => {
        return (
            <>
            <Fade in={fadeIn}>
                <div>
                    <Alert variant="success" onClose={() => setShow(false)} style={{ margin: 0 }} dismissible>
                        You are logged in as <b>{user.username}</b>
                    </Alert>
                </div>
            </Fade>
            </>
        )
    }

    return (
        <>
            {show && sendWelcomeMessage()}
        </>
    );
};

export default WelcomeAlert;