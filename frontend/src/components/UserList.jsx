import {useEffect, useState} from 'react';
import axios from 'axios'
import User from "./User.jsx";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_URL;

function UserList({setUserProfile, setDisplayProfile, displayMember, setDisplayAccountPage, updateList, setUpdateList}){

    // contient les messages d'erreurs
    const [errorMsg, setErromMsg] = useState();

    // state contenant la liste des id des utilisateurs
    const [userList, setUserList] = useState([]);

    // fonction qui fait une requête vers le serveur backend pour récuperer la liste des id des utilisateurs
    useEffect(() => {
      if (updateList){
          setUserList([]);
          axios.get("/user/getUserList/"+displayMember, {withCredentials:true} ).then((res) => {
              setUserList(res.data.userList);
          }).catch((error) => {   
              setErromMsg(error.response.data.message);
          });
          setUpdateList(false);
      }
    }, [displayMember, updateList]);

    return (
        <div className="UserList">
          {errorMsg ? (
            errorMsg
          ) : (
            userList.map((userId, index) => (
                <User 
                    key={index} 
                    userId={userId}
                    setUserProfile={(userId) => setUserProfile(userId)}
                    setDisplayProfile={(bool) => setDisplayProfile(bool)}
                    setDisplayAccountPage={(bool) => setDisplayAccountPage(bool)}
                    setUpdateList={(bool) => setUpdateList(bool)}
                />
            ))
          )}
        </div>
      );  


}

export default UserList;