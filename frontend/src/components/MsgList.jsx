import { useEffect, useState } from "react";
import axios from 'axios'
import Message from "./Message.jsx";
import '../css/MsgList.css'

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_URL;

function MsgList({isPrivate, dateBegin, dateEnd, msgSearchContent, authorId, msgAnswered, isComment=false, setDisplayProfile, setUserProfile, setUpdateList, updateList}){
        // isComment=false, par défaut on ne veut pas afficher les commenataires commme msg dans le forum

    // liset non trié des ids des messages
    const [rawMsgList, setRawMsgList] = useState([]);

    // liste trié des ids des messages
    const [msgList, setMsgList] = useState([]);

    // state contenant le methode de trie de la liste avec du plus recent au plus ancien par defaut
    const [sortBy, setSortBy] = useState("dateRecentOld");
    
    // state contenant le message d'erreur
    const [errorMsg, setErrorMsg] = useState();

    // useEffect qui va faire un requête vers le serveur pour recuperer une liste contenant les objet : {id du message, date, nombre de like }
    useEffect(() => {
        setMsgList([]);
        const query = {
            isPrivate,
            dateBegin,
            dateEnd,
            msgSearchContent,
            authorId,
            msgAnswered,
            isComment
        };

        // Enlève les champs non définis (optionnel, pour avoir une URL plus propre)
        const filteredQuery = Object.fromEntries(
            Object.entries(query).filter(([_, v]) => v !== undefined && v !== null && v !== "")
        );
    
        const queryString = new URLSearchParams(filteredQuery).toString();

        const url = "/message/getMessageList?" + queryString;

        axios.get(url, {withCredentials:true})
        .then(res => {
            // recupération de la liste non trié
            setRawMsgList(res.data.msgList.reverse());
        }).catch(error => {
            setErrorMsg(error.response.data.message);
        });


    }, [isPrivate, dateBegin, dateEnd, msgSearchContent, authorId, msgAnswered, updateList])

    // useEffect qui trie la liste à chaque changement de rawMsgList ou de sortBy
    useEffect(() => {

        let sortedList = [...rawMsgList];

        switch(sortBy){
            case "dateOldRecent":
                sortedList.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case "likeLessMore":
                sortedList.sort((a, b) => a.likeNumber - b.likeNumber);
                break;
            case "likeMoreLess":
                sortedList.sort((a, b) => b.likeNumber - a.likeNumber);
                break;
            default:    
                sortedList.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }

        setMsgList(sortedList);

    }, [rawMsgList, sortBy]);

    return (
    <div className="msgList">

        <div className="listControl">
            {( !authorId && !isComment &&
            <button 
                className="refresh-button" 
                onClick={() => {setUpdateList(updateList + 1)}}>
                    Actualiser les messages 
            </button> )}

            <div className="sort-container">
                <label htmlFor="SortedBy">Trier les messages par :</label>
                <select id="SortedBy" name="SortedBy" className="sort-select" onChange={(event) => {setSortBy(event.target.value)}}> 
                    <option value="dateRecentOld">date : plus recent au plus ancien</option>
                    <option value="dateOldRecent">date : plus ancien au plus recent</option>
                    <option value="likeMoreLess">like : plus populaire au moins populaire</option>
                    <option value="likeLessMore">like : moins populaire au plus populaire</option>
                </select>
            </div>
            
        </div>

        {errorMsg ? (<p className="errorMsg">{errorMsg}</p>) :
        
        (
            msgList.map((element, index) => {
                return <Message 
                        key={index} 
                        msgId={element.msgId} 
                        setDisplayProfile={(bool) => {setDisplayProfile(bool)}}
                        setUserProfile={(userId) => {setUserProfile(userId)}}
                        setUpdateList={(val) => {setUpdateList(val)}}
                        updateList={updateList}
                        />
            })
        )
    
        }

    </div>);
}

export default MsgList;