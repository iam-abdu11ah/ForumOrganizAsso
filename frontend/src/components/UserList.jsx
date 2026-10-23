import {useEffect, useState} from 'react';
import api, { getErrorMessage } from '../api/client.js';
import User from "./User.jsx";

function UserList({displayMember, updateList, setUpdateList}){

    // contient les messages d'erreurs
    const [errorMsg, setErromMsg] = useState();

    // state contenant la liste des id des utilisateurs
    const [userList, setUserList] = useState([]);

    // fonction qui fait une requête vers le serveur backend pour récuperer la liste des id des utilisateurs
    useEffect(() => {
      if (updateList){
          setUserList([]);
          api.get("/user/getUserList/"+displayMember).then((res) => {
              setUserList(res.data.userList);
          }).catch((error) => {
              setErromMsg(getErrorMessage(error));
          });
          setUpdateList(false);
      }
    }, [displayMember, updateList]);

    return (
        <div className="UserList">
          {errorMsg ? (
            errorMsg
          ) : (
            userList.map((userId) => (
                <User
                    key={userId}
                    userId={userId}
                    setUpdateList={setUpdateList}
                />
            ))
          )}
        </div>
      );


}

export default UserList;
