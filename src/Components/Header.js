import React, { useState, useEffect, useRef } from 'react';
import './Header.css';

export default function Header(props) {

    const [showMenu, setShowMenu] = useState(false);

    const ref = useRef(null);
    let profileRef = useRef(null);

    const handleClickOutside = (e) => {
        if (showMenu) {
            if (ref.current &&
                !ref.current.contains(e.target) &&
                !profileRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    })

    const showProfileMenu = () => {
        if (!showMenu) setShowMenu(true);
    }

    let profile;

    if (props.userImg) {
        profile = <img
            ref={profileRef}
            className="profile-img"
            onClick={showProfileMenu}
            src={props.userImg}
            alt="profile"></img>
    } else {
        profile = <i
            ref={profileRef}
            className="material-icons profile-img"
            onClick={showProfileMenu}>person</i>
    }

    return (
        <header className="App-header">
            <img src={props.logo} className="App-logo" alt="logo" />
            <h1 className="app-title">DB Todo App</h1>
            {props.loggedIn === "true" && profile}
            <div className={`profile-menu-wrap ${showMenu ? '' : 'hidden'}`}>
                <div className="profile-menu" ref={ref}>
                    <button
                        className="logout-btn"
                        value="Logout"
                        onClick={props.handleLogout}
                    >Logout
                    </button>
                </div>
            </div>
        </header>
    )
}