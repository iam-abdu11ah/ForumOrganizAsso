import "../css/FormMsg.css";
import {useState} from 'react';
import api, { getErrorMessage } from '../api/client.js';

function FormMsg({isComment, msgAnswered, isPrivate, setUpdateList, updateList}){

    // state contenant le message
    const [content, setContent] = useState("");
    
    // state contenant un message d'érreur, si une chose c'est mal passé
    const [errorMsg, setErrorMsg] = useState("");

    // fonction d'envoie du message
    const sendMessage = (event) => {
        event.preventDefault();
        
        // si le message est vide on affiche une erreur
        if (!content){
            setErrorMsg("Erreur : Message vide");
            return;
        }

        // requete vers le serveur
        api.post("/message/newMessage", {content, isComment, msgAnswered, isPrivate})
        .then(res => {
            setContent("");
            setUpdateList(updateList + 1);
        }).catch(error => {
            setErrorMsg(getErrorMessage(error));
        })
    }

    // get the class name of the div
    const className = (isComment ? "commentForm" : "msgForm");

    return (
    <div className={className}>
        <form method="POST">
            <label htmlFor={'textMsg'+msgAnswered}> Écrire un message </label> <br/>
            <textarea 
            id={"textMsg"+msgAnswered} 
            rows="4" 
            cols="60" 
            placeholder="Saisissez votre message" 
            value = {content}
            onChange={(e) => {setContent(e.target.value); setErrorMsg("");}}></textarea> 
            <br/>          
            <button className="sendButton" onClick={(event) => sendMessage(event)}>Envoyer</button>
            <br/>
            {errorMsg != "" ? <p className="errorMsg">{errorMsg}</p> : <></>}
        </form>

    </div>)

}

export default FormMsg;