import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import {useUser} from '../context/userContext';
import defaultAvatar from "../assets/defaultAvatar.jpg";
import "../css/User.css";


const API_URL = import.meta.env.VITE_API_URL;

function User({userId, setUpdateList}){

    // on récupère les infos sur l'utilisateur connecté
    const { user } = useUser();
    const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

    // states contenant les infos sur l'utilisateur afficher par le composant
    const [lastName, setLastName] = useState();
    const [firstName, setFirstName] = useState();
    const [userMember, setUserMember] = useState();
    const [userAdmin, setUserAdmin] = useState();

    // states contenant les messages d'erreurs
    const [userErrorMsg, setUserErrorMsg] = useState();
    const [deleteErrorMsg, setDeleteErrorMsg] = useState();
    const [statusErrorMessage, setStatusErrorMessage] = useState();

    // state qui une lorsqu'il est modifier actualise le composant
    const [updateUser, setUpdateUser] = useState(true);

    // fonction qui fait la requête vers le serveur pour récuperer les infos sur l'utilisateur
    useEffect(() => {
        if(updateUser){
            api.get("/user/profile/"+userId)
            .then(response => {
                setLastName(response.data.lastName);
                setFirstName(response.data.firstName);
                setUserMember(response.data.isMember);
                setUserAdmin(response.data.isAdmin);

                if (response.data.avatarUrl){  
                    setAvatarUrl(`${API_URL}${response.data.avatarUrl}`);
                }
            }).catch(error => {
                setUserErrorMsg(getErrorMessage(error));
            });
            setUpdateUser(false);
        }
    }, [userId, updateUser]);

    // fonction qui fait une requête vers le serveur pour supprimer l'utilisateur
    const deleteUser = () => {
        if(window.confirm("Êtes-vous sûr ?")){
            api.delete("/user/delete/" + userId  )
            .then(response => {
                    setUpdateList(true);
            }).catch(error => {
                    setDeleteErrorMsg(getErrorMessage(error));
            });
        }
    }

    // fonction qui fait une requête vers le serveur pour metre l'utilsateur Member
    const setMember = () => {
        if (window.confirm("Êtes-vous sûr ?")){
            api.patch("/user/setMember/" + userId , {} )
            .then(response => {
                    setUpdateList(true);
            }).catch(error => {
                    setStatusErrorMessage(getErrorMessage(error));
            });
        }
    }

    // fonction qui fait une requête vers le serveur pour metre l'utilisateur Admin
    const setAdmin = () => {
        if (window.confirm("Êtes-vous sûr ?")){
            api.patch("/user/setAdmin/" + userId , {} )
            .then(response => {
                    setUpdateUser(true);
            }).catch(error => {
                    setStatusErrorMessage(getErrorMessage(error));
            });
        }
    }

    return (
    <div className='User'>
        { userErrorMsg ? <p className='errorMsg'> {userErrorMsg}</p> :
            (<>
            <div className='userInfo'>
                 <img
                    src={avatarUrl}
                    alt="Photo de profil"
                    className="profile-pic"
                    onError={e => {
                        e.target.onerror = null;         // prevent infinite loop
                        e.target.src = defaultAvatar;    // default src
                    }}
                />

                <Link className="UserName" to={"/profile/" + userId}>{firstName + " " + lastName}</Link>
            </div>


            <p className='UserStatus'>{userAdmin ? "Administrateur" : (userMember ? "Membre " : "En attente") }</p>

            {(userMember && user.isAdmin && !userAdmin && <button onClick={() => setAdmin()}>faire devenir Admin</button>)}
            {(!userMember && <button onClick={() => setMember()}>faire devenir membre</button>)}
            {(user.isAdmin && !userAdmin && <button className="deleteUserButton" onClick={() => deleteUser()}>Supprimer l'utilisateur</button>)}
            
            {(deleteErrorMsg && <p className='errorMsg'>{deleteErrorMsg}</p>)}
            {(statusErrorMessage && <p className='errorMsg'>{statusErrorMessage}</p>)}
            </>
        )}
    </div>);

}

export default User;