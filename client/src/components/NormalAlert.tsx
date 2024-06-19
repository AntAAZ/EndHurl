import React, { useState, useEffect } from 'react';
import { Alert, Fade } from 'react-bootstrap';

const NormalAlert = ({ alertClassName, message, hideTimerMs, fadeInTimerMs}: any) => {
    const [show, setShow] = useState(true);
    const [fadeIn, setFadeIn] = useState(true);

    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setShow(false);
        }, hideTimerMs)

        const timer = setTimeout(() => {
            setFadeIn(false);
        }, fadeInTimerMs)
        return () => {
            clearTimeout(timer)
            clearTimeout(hideTimer);
        };
    }, []);

    const sendMessage = () => {
        return (
            <>
            <Fade in={fadeIn}>
                <div>
                    <Alert key={alertClassName} variant={alertClassName} onClose={() => setShow(false)} 
                        style={{ margin: 0 }} dismissible>
                        {message}
                    </Alert>
                </div>
            </Fade>
            </>
        )
    }
    return (
        <>
            {show && sendMessage()}
        </>
    );
};

export default NormalAlert;