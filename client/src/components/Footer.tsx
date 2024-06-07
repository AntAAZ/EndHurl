import React from 'react'
import { useLocation } from "react-router-dom";

export default function Footer() {

    const location = useLocation();
    const editSubstring = '/maps/edit'
    if (location.pathname === "/maps/create" || 
        location.pathname.substring(0, editSubstring.length) == '/maps/edit') return null;

    return (
        <footer className="footer text-center text-white" style={{backgroundColor: "#000000"}}>
    
            <div className="text-center p-3" style={{backgroundColor: "rgba(0, 0, 0, 0.2)"}}>
                <a className="text-white">© 2024 Antonii Zlatarov </a>
            </div>

        </footer>
    )
}