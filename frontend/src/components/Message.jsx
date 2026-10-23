import "../css/Message.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from '../api/client.js';
import FormMsg from "./FormMsg";
import MsgList from "./MsgList";
import LikeButton from "./LikeButton";
import { useUser } from "../context/userContext";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import deleteIcon from "../assets/delete_icon.svg";
import addCommentIcon from "../assets/add_comment.svg";
import showCommentIcon from "../assets/show_comment.svg";
import hideCommentIcon from "../assets/hide_comment.svg";


const API_URL = import.meta.env.VITE_API_URL;

function Message({msgId, setUpdateList, updateList}){

    const { user } = useUser();

    // information sur le message
    const [authorId, setAuthorId] = useState();
    const [authorFirstName, setAuthorFirstName] = useState();
    const [authorLastName, setAuthorLastName] = useState();
    const [messageContent, setMessageContent] = useState();
    const [date, setDate] = useState();
    const [isPrivate, setIsPrivate] = useState();
    const [isComment, setIsComment] = useState();
    const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

    // permet l'affichage du formulaire de reponse
    const [writeComment, setWriteComment] = useState(false);
    // permet l'affichage des commentaires
    const [displayComment, setDisplayComment] = useState(false);
    // modifié pour actualiser la liste des commentaires (après ajout ou suppression)
    const [updateComments, setUpdateComments] = useState(0);

    // si il y a une erreur, contient le message d'erreur
    const [errorMsg, setErrorMsg] = useState();

    // recupère les informations du message
    const getMessageInfo = () => {
        // requête vers le serveur
        api.get("/message/getMessage/"+msgId.toString())
        .then(res => {
            setAuthorId(res.data.authorId);
            setAuthorFirstName(res.data.authorFirstName);
            setAuthorLastName(res.data.authorLastName);
            setMessageContent(res.data.messageContent);
            setDate(res.data.date);
            setIsPrivate(res.data.isPrivate);
            setIsComment(res.data.isComment);
            if (res.data.authorProfilePicPath){
                setAvatarUrl(`${API_URL}${res.data.authorProfilePicPath}`);
            }
        }).catch(error => {
            setErrorMsg(getErrorMessage(error));
        })

    }

    const deleteMessage = () => {
        if(window.confirm("Êtes-vous sûr ?")){
            api.delete(`/message/delete/${msgId}`)
              .then(() => {
                    setUpdateList(updateList + 1);
                })
              .catch(() => {
                setErrorMsg("Erreur lors de la suppression.");
              });
          }
    }

    // une seule requête quand le message s'affiche (avant : une requête à chaque rendu)
    useEffect(() => {
        getMessageInfo();
    }, [msgId]);

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
                            }}
                        />
                        <Link className="msgAuthor" to={"/profile/" + authorId}>{authorFirstName + " " + authorLastName}</Link>
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

                {(user.isAdmin || user.userId === authorId) &&
                <button title="Supprimer" className="deleteButton" onClick={() => {deleteMessage()}}>
                    <img className="msgIcons" src={deleteIcon}/
                    ><span className="hideMsgButtonText">Supprimer</span>
                </button>}

                {/* après l'envoi d'un commentaire : on actualise et on affiche les commentaires */}
                {writeComment &&
                <FormMsg
                    isComment={true}
                    msgAnswered={msgId}
                    isPrivate={isPrivate}
                    setUpdateList={(val) => {setUpdateComments(val); setDisplayComment(true);}}
                    updateList={updateComments}
                /> }

                {displayComment &&
                <MsgList
                    isPrivate={isPrivate}
                    msgAnswered={msgId}
                    isComment={true}
                    setUpdateList={setUpdateComments}
                    updateList={updateComments}
                />}
                
            </>}
        </div>
    );
}

export default Message;