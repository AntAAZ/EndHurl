import React from 'react'
import { useLocation } from "react-router-dom";

export default function Footer() {

    const location = useLocation();
    if (location.pathname === "/maps/create") return null;

    return (
        <footer className="footer text-center text-white" style={{backgroundColor: "#000000"}}>
            <div className="container p-4">

                <section className="">
                    <div className="row">
                        <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                            <h5 className="text-uppercase">The game</h5>

                            <ul className="list-unstyled mb-0">
                                <li>
                                    <a href="#!" className="text-white">Features</a>
                                </li>
                                <li>
                                    <a href="#!" className="text-white">News & patch notes</a>
                                </li>
                                <li>
                                    <a href="#!" className="text-white">Guides for beginners</a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                            <h5 className="text-uppercase">Important</h5>

                            <ul className="list-unstyled mb-0">
                                <li>
                                    <a href="#!" className="text-white">Terms and conditions</a>
                                </li>
                                <li>
                                    <a href="#!" className="text-white">Privacy policy</a>
                                </li>
                                <li>
                                    <a href="#!" className="text-white">Game rules</a>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                            <h5 className="text-uppercase">About us</h5>

                            <ul className="list-unstyled mb-0">
                                <li>
                                    <a href="#!" className="text-white">Staff team</a>
                                </li>
                                <li>
                                    <a href="#!" className="text-white">Contacts</a>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                            <h5 className="text-uppercase">Social media</h5>

                            <ul className="list-unstyled mb-0">
                                <li>
                                    <a href="#!" className="text-white">Discord</a>
                                </li>
                                <li>
                                    <a href="#!" className="text-white">Twitter</a>
                                </li>
                                <li>
                                    <a href="#!" className="text-white">Youtube</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
            <div className="text-center p-3" style={{backgroundColor: "rgba(0, 0, 0, 0.2)"}}>
                <a className="text-white" href="https://mdbootstrap.com/">MDBootstrap.com</a>
            </div>

        </footer>
    )
}