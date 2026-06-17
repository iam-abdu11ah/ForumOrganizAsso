import { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css"; 
import { useUser } from "../context/userContext";
import MsgList from "./MsgList";
import editIcon from "../assets/edit_icon.png";
import EditProfile from "./EditProfile.jsx";

function Profile({userId, setDisplayProfile, setUserProfile}) {

  // states contenant les information du profile 
  const [profileLastName, setProfileLastName] = useState();
  const [profileFirstName, setProfileFirstName] = useState();
  const [editProfile, setEditProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState();


  // state qui contient les potentiel message d'erreur
  const [errorMsg, setErrorMsg] = useState();

  //user contient les infos personnelles d'un user remplit par Login.jsx.
  const {user} = useUser();

  const defaultAvatar = "/src/assets/defaultAvatar.jpg";

  const API_URL = import.meta.env.VITE_API_URL;

  const getUserProfile = () => {
    // requete vers le serveur
    axios.get('/user/profile/'+userId, {withCredentials:true})
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
      setErrorMsg(error.response.data.message);
    });
  }
  
  
  useEffect(() => {
    getUserProfile();
  }, [userId]);

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
                    user.avatarUrl = defaultAvatar;
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
        <MsgList 
          authorId={userId}
          setDisplayProfile={setDisplayProfile}
          setUserProfile={setUserProfile}
        />
        </>)
      }
      


    </div>
  );
}

export default Profile;
