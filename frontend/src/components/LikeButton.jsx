import {useState, useEffect } from 'react';
import axios from 'axios';
import "../css/LikeButton.css";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_URL;

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
        axios.get("/user/hasLiked/" + msgId.toString(), {withCredentials: true})
        .then(response => {
            //if (response.status == 200){
                setLiked(response.data.liked);
            //}
        }).catch(error => {
            setErrorMsg(error.response.data.message);
        });

        // recuperation du nombre de like
        axios.get("/message/getLikeNumber/" + msgId, {withCredentials: true})
        .then( response => {
            if (response.status == 200){
                setLikeNumber(response.data.likeNumber);
            }
        }).catch(error => {
            setErrorMsg(error.response.data.message);
        });

    }, [msgId]);

    // envoie le like vers le serveur
    const handleLikeClick = () => {
        axios.patch("/user/setLike", {liked : !liked, msgId},{withCredentials: true})
        .then( response => {
            setLiked(!liked)
            setLikeNumber(prev => liked ? prev - 1 : prev + 1);
        }).catch(error => {
            setErrorMsg(error.response.data.message);
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