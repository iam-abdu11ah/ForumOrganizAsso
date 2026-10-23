import {useState} from 'react';
import { useUser } from '../context/userContext';
import { getErrorMessage } from '../api/client.js';
import logoutIcon from '../assets/logout.svg';

function LogoutButton(){

    const { logout } = useUser();

    // state contenant les messages d'erreur
    const [errorMsg, setErrorMsg] = useState();

    // deconnexion : une fois l'utilisateur effacé, RequireAuth redirige vers /login
    const handleLogout = () => {
        logout().catch(error => {
            setErrorMsg(getErrorMessage(error));
        });
    };

    return (<>
        <button title='Se déconnecter' onClick={handleLogout} ><img className='icon' src={logoutIcon} /><span className="visually-hidden">Logout</span></button>
        {errorMsg && <p>{errorMsg}</p>}
    </>)

}

export default LogoutButton;
