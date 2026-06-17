// componant that show the login form

import { useState } from "react";
import axios from 'axios';
import { useUser } from "../context/userContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_URL;

// props : onSwitch : function that switch the login page to the signup page
function Login({ onSwitch, loginFunction, setAdminFunction }) {
  console.log("API_URL", API_URL );
  // states qui stocke les donnée rempli par l'utilisateur dans chaque champ du formulaire
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  // state qui contieny le message d'erreur
  const [errorMsg, setErrorMsg] = useState("");

  //on va utiliser le contexte userContext pour stocker les infos personelles d'u user
  const {user, fetchUserInfo} = useUser();

  const handleLogin = (e) => {
    e.preventDefault();

    // verification que les entrées sont non vide
    if (!login || !password){
      setErrorMsg("Requête invalide : login et password nécessaires")
      return;
    }

    console.log("API_URL", API_URL);
    // requete vers le serveur
    axios.post('/user/login', {login, password}, {withCredentials:true})
    .then(res => {
      if (res.status == 200){
        // si l'utilisateur est admin, alors on met le state isAdmin à true
        if (res.data.isAdmin){
          setAdminFunction();
        }
        // on met le state isConnected à true
        loginFunction();
        
        //on stocke infos persos dans le contexte pour récuperer facilement dans le profile page par exemple.
        fetchUserInfo({
          userId : res.data.userId,
          login: res.data.login,
          firstName : res.data.firstName,
          lastName : res.data.lastName, 
          isAdmin : res.data.isAdmin,
          isMember : res.data.isMember,
          avatarUrl : res.data.avatarUrl
        })
      }
    })
    .catch(error => {
      // récupération du message d'érreur
      setErrorMsg(error.response.data.message);
    });
  };

  return (
    <div className="user_form">
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
        <label htmlFor="login">Login</label>
        <input
          id="login"
          name="login"
          aria-label="Enter your login"
          placeholder="Enter your login"
          onChange={(e) => {setLogin(e.target.value)}}
        />
        <br />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          aria-label="enter your password"
          placeholder="Enter your password"
          onChange={(e) => {setPassword(e.target.value)}}
        />
        <br />
        <input type="submit" value="Login" className="submitButton"/>
        {errorMsg == ""? <></> : <p className="errorMsg">{errorMsg}</p>}
        {" "}
        <br />
        <p>
          I don't have an acount :{" "}
          <button onClick={onSwitch} className="switchButton">
            {" "}
            Create an account{" "}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
