import {use, useState} from 'react'
import axios from 'axios'


const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_URL;

// componant that show the signup form
// props : onSwitch : function that switch the signup page to the login page
function Signup({ onSwitch }){

    // states qui stocke les donnée rempli par l'utilisateur dans chaque champ du formulaire
    const [lastName, setLastName] = useState();
    const [firstName, setFirstName] = useState();
    const [login, setLogin] = useState();
    const [password, setPassword] = useState();
    const [repeatPassword, setRepeatPassword] = useState();

    // state qui contient le message d'erreur
    const [errorMsg, setErrorMsg] = useState(); 

    // state qui contient le message de succée
    const [successMsg, setSuccessMsg] = useState();

    const handleSignup = (e) => {
        e.preventDefault();

        // verification que les entrées sont non vide
        if (!lastName || !firstName || !login || !password || !repeatPassword){
            setErrorMsg("Erreur : tous les champs sont obligatoire");
        }

        // verification que les deux mots de passes correspondent
        if (password != repeatPassword){
            setErrorMsg("Erreur : les mots de passes de correspondent pas");
            return;
        }

        // requete vers le serveur 
        axios.post("/user/newUser", {lastName, firstName, login, password, repeatPassword}, {withCredentials: true})
        .then(res => {
            setErrorMsg("");
            setSuccessMsg(res.data.message);
        }).catch (error => {
            setErrorMsg(error.response.data.message);
            setSuccessMsg("");
        });
    }

    return (
    <div className="user_form">
        <h1>Signup Page</h1>
        <form onSubmit={handleSignup}>

            <label htmlFor="lastName" >Last Name</label>
            <input 
                id="lastName" 
                name="lastName" 
                placeholder="Enter your last name" 
                onChange={(e) => {setLastName(e.target.value)}}
            /> 
            
            <br/>

            <label htmlFor="firstName"  > First name </label>
            <input 
                id="firstName" 
                name="firstName" 
                placeholder="Enter your first Name" 
                onChange={(e) => {setFirstName(e.target.value)}}
            /> 
            <br/>

            <label htmlFor="login" >Login</label>
            <input 
                id="login" 
                name="login" 
                placeholder="Enter a login" 
                onChange={(e) => {setLogin(e.target.value)}}
            />
            <br/>

            <label htmlFor="password" >Password</label>
            <input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Enter a password"
                onChange={(e) => {setPassword(e.target.value)}}
            />
            <br/>

            <label htmlFor="passwordRepeat">Repeat password</label>
            <input 
                id="passwordRepeat" 
                name="passwordRepeat" 
                type="password" 
                placeholder="Enter the same password"
                onChange={(e) => {setRepeatPassword(e.target.value)}}
            />
            <br/>
            
            <input type="submit" value="Signup" className="submitButton"/>
            {errorMsg == "" ? <></> : <p className='errorMsg'>{errorMsg}</p>}
            {successMsg == "" ? <></> : <p className='successMsg'>{successMsg}</p>}
            <br/>
            <p>I already have an account : <button onClick={onSwitch} className="switchButton"> Login </button> </p>

        </form>
    </div>);
}

export default Signup;