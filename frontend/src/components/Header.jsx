import SearchMsg from "./SearchMsg";
import LogoutButton from "./LogoutButton";
import {useUser} from "../context/userContext";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../css/Header.css";
import "../css/SearchMsg.css";
import logoOrganizasso from "../assets/logoOrganizasso.png";
import profileIcon from "../assets/profile_icon.svg";
import publicForumIcon from "../assets/public_forum_icon.svg";
import privateForumIcon from "../assets/private_forum_icon.svg";
import mulitUsersIcon from "../assets/mutiple_users_icon.svg";
import searchIcon from "../assets/search_icon.svg";

// NavLink ajoute la classe "active" quand son URL est la page courante
const navClass = ({ isActive }) => "navButton" + (isActive ? " active" : "");

function Header(){

    const { user } = useUser();

    // affiche la barre de recherche sur petit écran
    const [toggleSearch, setToggleSearch] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // ferme la recherche et enlève les filtres de l'URL (on reste sur la même page) : tous les messages réapparaissent
    const closeSearch = () => {
        setToggleSearch(false);
        navigate(location.pathname);
    };

    return (
    <div className={"header" + (toggleSearch ? " searching" : "")}>

        <div className="logoZone">
            <img className="logo" src={logoOrganizasso} alt="logo" />
        </div>

        <div className="defaultSearch">
            <SearchMsg />
        </div>

        {!toggleSearch &&
            <div className="toggleLogoZone">
                <img className="logo" src={logoOrganizasso} alt="logo" />
            </div>
        }
        {/* petit écran : la recherche remplace toute la ligne du header, ✕ pour la fermer */}
        <div className="toggleSearch">
            {toggleSearch && <>
                <button className="closeSearchButton" title="Fermer la recherche" onClick={closeSearch}>X</button>
                <SearchMsg />
            </>}
        </div>

        <div className="toolbarZone">
            <button className={"searchButton" + (toggleSearch ? " active" : "")}
                onClick={() => setToggleSearch(!toggleSearch)}>
                <img className="icon" src={searchIcon} alt="search icon" />
            </button>

            <NavLink to="/" end title="Forum public" className={navClass}>
                <img className="icon" src={publicForumIcon}/> <span className="visually-hidden">Forum public</span>
            </NavLink>

            {user.isAdmin &&
            <NavLink to="/private" title="Forum privé" className={navClass}>
                <img className="icon" src={privateForumIcon}/> <span className="visually-hidden">Forum privé</span>
            </NavLink>}

            <NavLink to="/users" title="Liste utilisateurs" className={navClass}>
                <img className="icon" src={mulitUsersIcon}/> <span className="visually-hidden">Liste utilisateurs</span>
            </NavLink>

            <NavLink to={"/profile/" + user.userId} title="Mon profil" className={navClass}>
                <img className="icon" src={profileIcon}/><span className="visually-hidden">Mon profil</span>
            </NavLink>

            <LogoutButton />
        </div>

    </div>)
}

export default Header;
