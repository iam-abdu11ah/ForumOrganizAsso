import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client.js";
import "../css/Profile.css";
import { useUser } from "../context/userContext";
import MsgList from "./MsgList";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import editIcon from "../assets/edit_icon.png";
import EditProfile from "./EditProfile.jsx";

function Profile() {

  // l'id du profil affiché vient de l'URL : /profile/:userId
  const { userId } = useParams();

  // states contenant les information du profile 
  const [profileLastName, setProfileLastName] = useState();
  const [profileFirstName, setProfileFirstName] = useState();
  const [editProfile, setEditProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState();

  // modifié pour actualiser la liste des messages (après suppression)
  const [updateList, setUpdateList] = useState(0);


  // state qui contient les potentiel message d'erreur
  const [errorMsg, setErrorMsg] = useState();

  //user contient les infos personnelles de l utilisateur connecté (userContext)
  const {user} = useUser();

  const API_URL = import.meta.env.VITE_API_URL;

  const getUserProfile = () => {
    // requete vers le serveur
    api.get('/user/profile/'+userId)
    .then(res => {
      if (res.status == 200){
        if (res.data){  
          setProfileLastName(res.data.lastName);
          setProfileFirstName(res.data.firstName);
          setAvatarUrl(res.data.avatarUrl ? `${API_URL}${res.data.avatarUrl}` : defaultAvatar);
        }
      }
    })
    .catch(error => {
      // récupération du message d'érreur
      setErrorMsg(getErrorMessage(error));
    });
  }
  
  
  useEffect(() => {
    setEditProfile(false);
    getUserProfile();
  }, [userId, user.firstName, user.lastName, user.avatarUrl]);  // recharge aussi après modification de mon profil

  // booléen definissant si le profile affiché est celui de l'utilisateur connecté
  let isMyProfile = (user.userId === userId);


  const handleBackToProfile = () => {
    setEditProfile(false);
  }

  return (
    <div className="profile">
      {errorMsg ? (<p className="error">{errorMsg}</p>):
        (
        <>
        {isMyProfile && editProfile ? <EditProfile backtToProfile={handleBackToProfile}/> : 
          <div className="profile-header">
            <div className="user-info">
              <img
                src={avatarUrl}
                alt="Photo de profil"
                className="profile-pic"
                  onError={e => {
                    e.target.onerror = null;         // prevent infinite loop
                    e.target.src = defaultAvatar;    // your default src
                  }}
              />
            
                <h2>{profileFirstName} {profileLastName}</h2>
          
            </div>
            <div className="edit-profile-button">
              {isMyProfile && <button className="edit-button" onClick={() => 
                setEditProfile(true)}>
                <img src={editIcon} alt="Modifier" className="edit-icon"/>
                <span className="hideEditTxt">Modifier le profil</span>
              </button>}
            </div>
          </div>
        }
        
        <h3>{isMyProfile?"Mes" : "Ses"} messages</h3>
        <MsgList authorId={userId} setUpdateList={setUpdateList} updateList={updateList} />
        </>)
      }
      


    </div>
  );
}

export default Profile;
