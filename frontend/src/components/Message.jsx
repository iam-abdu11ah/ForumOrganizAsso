import "../css/Message.css";
import { useContext, useState } from "react";
import axios from 'axios';
import FormMsg from "./FormMsg";
import MsgList from "./MsgList";
import LikeButton from "./LikeButton";
import { useUser } from "../context/userContext";
import deleteIcon from "../assets/delete_icon.svg";
import addCommentIcon from "../assets/add_comment.svg";
import showCommentIcon from "../assets/show_comment.svg";
import hideCommentIcon from "../assets/hide_comment.svg";


const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_URL;

function Message({msgId, setDisplayProfile, setUserProfile, setUpdateList, updateList}){

    const user = useUser();

    // information sur le message
    const [authorId, setAuthorId] = useState();
    const [authorFirstName, setAuthorFirstName] = useState();
    const [authorLastName, setAuthorLastName] = useState();
    const [messageContent, setMessageContent] = useState();
    const [date, setDate] = useState();
    const [isPrivate, setIsPrivate] = useState();
    const [isComment, setIsComment] = useState();
    const [avatarUrl, setAvatarUrl] = useState("/src/assets/defaultAvatar.jpg");
    const defaultAvatar = "/src/assets/defaultAvatar.jpg";

    // permet l'affichage du formulaire de reponse
    const [writeComment, setWriteComment] = useState(false);
    // permet l'affichage des commentaires
    const [displayComment, setDisplayComment] = useState(false);

    // si il y a une erreur, contient le message d'erreur
    const [errorMsg, setErrorMsg] = useState();
    const BACKEND = API_URL;

    // recupère les informations du message
    const getMessageInfo = () => {
        // requête vers le serveur
        axios.get("/message/getMessage/"+msgId.toString(), {withCredentials: true})
        .then(res => {
            setAuthorId(res.data.authorId);
            setAuthorFirstName(res.data.authorFirstName);
            setAuthorLastName(res.data.authorLastName);
            setMessageContent(res.data.messageContent);
            setDate(res.data.date);
            setIsPrivate(res.data.isPrivate);
            setIsComment(res.data.isComment);
            if (res.data.authorProfilePicPath){
                setAvatarUrl(`${BACKEND}${res.data.authorProfilePicPath}`);
            }
        }).catch(error => {
            console.log("pp trouvé");
            setErrorMsg(error.response.data.message);
        })

    }

    const deleteMessage = () => {
        if(window.confirm("Êtes-vous sûr ?")){
            axios.delete(`/message/delete/${msgId}`, {withCredentials:true})
              .then(() => {
                    setUpdateList(updateList + 1);
                })
              .catch(() => {
                setErrorMsg("Erreur lors de la suppression.");
              });
          }
    }

    getMessageInfo();

    return (
        <div className="Message">
            {errorMsg ? <p>{errorMsg}</p> : 
            <>
                <div className="msgInfo">
                    <div className="msgAuthorInfo">
                        <img
                            src={avatarUrl}
                            alt="Photo de profil"
                            className="profile-pic"
                            onError={e => {
                                e.target.onerror = null;         // prevent infinite loop
                                e.target.src = defaultAvatar;    // default src
                                user.avatarUrl = defaultAvatar;
                            }}    
                        />
                        <p className="msgAuthor" 
                            onClick={() => {
                                            setDisplayProfile(true);
                                            setUserProfile(authorId);
                                        }
                                    }
                        >{authorFirstName + " " + authorLastName}</p>
                    </div>
                    <p className="msgDate">{new Date(date).toLocaleString()}</p>
                </div>
                <p className="msgContent">{messageContent}</p>

                <LikeButton msgId={msgId}/>

                <button title={writeComment ? "Annuler ajout de commentaire" : "Ajouter un commentaire"} className="commentButton" onClick={() => {setWriteComment(!writeComment)} } >
                    <img className = "msgIcons" src = {writeComment ? addCommentIcon : addCommentIcon} />
                    <span className="hideMsgButtonText">{writeComment ? "Annuler ajout de commentaire" : "Ajouter un commentaire"}</span>
                </button>

                <button title={displayComment ? "Masquer les commentaires" : "Afficher les commentaire"} className="commentButton" onClick={() => {setDisplayComment(!displayComment)} } >
                    <img className = "msgIcons" src = {displayComment ? hideCommentIcon : showCommentIcon} />
                    <span className="hideMsgButtonText">{displayComment ? "Masquer les commentaires" : "Afficher les commentaire"}</span>
                </button>

                {(user.user.isAdmin || user.user.userId === authorId) && 
                <button title="Supprimer" className="deleteButton" onClick={() => {deleteMessage()}}>
                    <img className="msgIcons" src={deleteIcon}/
                    ><span className="hideMsgButtonText">Supprimer</span>
                </button>}

                {writeComment && <FormMsg isComment={true} msgAnswered={msgId} isPrivate={isPrivate}/> }

                {displayComment && 
                <MsgList
                    isPrivate={isPrivate}
                    setDisplayProfile={(bool) => {setDisplayProfile(bool)}}
                    setUserProfile={(userId) => {setUserProfile(userId)}}
                    msgAnswered={msgId}
                    isComment={true}
                />}
                
            </>}
        </div>
    );
}

export default Message;