import {useState, useEffect } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import "../css/LikeButton.css";


function LikeButton({msgId}){

    // state contenant le boolean definissant si l'utilisateur à aimer le message
    const [liked, setLiked] = useState(false);

    // state contenant le nombre de j'aime du message
    const [likeNumber, setLikeNumber] = useState(0);

    // state contenant le message d'erreur
    const [errorMsg, setErrorMsg] = useState();

    // recupère le nombre de like
    useEffect(() => {

        // fonction qui verifie si le message est déja aimer par l'utilisateur
        api.get("/user/hasLiked/" + msgId.toString())
        .then(response => {
            //if (response.status == 200){
                setLiked(response.data.liked);
            //}
        }).catch(error => {
            setErrorMsg(getErrorMessage(error));
        });

        // recuperation du nombre de like
        api.get("/message/getLikeNumber/" + msgId)
        .then( response => {
            if (response.status == 200){
                setLikeNumber(response.data.likeNumber);
            }
        }).catch(error => {
            setErrorMsg(getErrorMessage(error));
        });

    }, [msgId]);

    // envoie le like vers le serveur
    const handleLikeClick = () => {
        api.patch("/user/setLike", {liked : !liked, msgId})
        .then( response => {
            setLiked(!liked)
            setLikeNumber(prev => liked ? prev - 1 : prev + 1);
        }).catch(error => {
            setErrorMsg(getErrorMessage(error));
        });
    }

    return (
        <div className='likeSection'>
            <p className='likeNumber'>{likeNumber}</p>
            <button  title="J'aime"
                className='likeButton'
                onClick={() => {handleLikeClick()}}>
                {liked ? "❤️" : "🤍"}
            </button>
            {(errorMsg && <p className='errorMsg'>{errorMsg}</p>)}
        </div>
    )
}

export default LikeButton;