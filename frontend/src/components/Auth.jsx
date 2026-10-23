import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from '../api/client.js';
import { useUser } from "../context/userContext.jsx";
import "../css/LoginSignup.css";


// page de connexion (/login) ou d'inscription (/signup) selon mode
// une fois connecté, ces routes redirigent vers le forum
export default function Auth({ mode }){ // "login" or "signup"
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const { login: saveUser } = useUser();

    const validate = () => {
        if (mode === "signup" && firstName == "" )
            return "First name cannot be empty."
        if (mode === "signup" && lastName == "" )
            return "Last name cannot be empty."
        if (!login)
            return "Login cannot be empty.";
        if (!password)
            return "Password cannot be empty.";
        if (mode=="signup" && (password.length < 4))
            return "Password must be at least 4 characters.";
        if (mode ==="signup" && password != confirmPassword)
            return "Passwords do not match."
        return "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errorMsg = validate();
        if (errorMsg) {
            setErrorMsg(errorMsg);
            return;
        }

        const body = (mode === "login") ? 
            {login, password} : {firstName, lastName, login, password};

        const endpoint = (mode === "login") ? "/user/login" : "/user/newUser";
        api.post(endpoint, body)
        .then(res => {
            if (res.status == 200 && mode === "login"){
                // une fois l'utilisateur enregistré, la route redirige vers le forum
                saveUser({
                    userId : res.data.userId,
                    login: res.data.login,
                    firstName : res.data.firstName,
                    lastName : res.data.lastName, 
                    isAdmin : res.data.isAdmin,
                    isMember : res.data.isMember,
                    avatarUrl : res.data.avatarUrl
                })
            } else if (res.status == 200 && mode === "signup"){
                setErrorMsg("");
                setSuccessMsg(res.data.message);
            }
        }).catch (error => {
            setErrorMsg(getErrorMessage(error));
            setSuccessMsg("");
        });
    }

    return (
    <div className="LoginSignup">
        <div className="welcomeZone">
            <p>
                Welcome !<br /> Login or Signup to enter.{" "}
            </p>
        </div>

        <div className="user_form">
            {mode === "login" ?(<h1>Login Page</h1>) : (<h1>Signup Page</h1>)}
            <form onSubmit={handleSubmit}>
                {mode === "signup" && (
                <>
                    <label htmlFor="firstName"  > First name </label>
                    <input 
                        id="firstName" 
                        name="firstName" 
                        placeholder="Enter your first Name" 
                        onChange={(e) => {setFirstName(e.target.value)}}
                    /> 
                    <br/>

                    <label htmlFor="lastName" >Last Name</label>
                    <input 
                        id="lastName" 
                        name="lastName" 
                        placeholder="Enter your last name" 
                        onChange={(e) => {setLastName(e.target.value)}}
                    /> 
                    <br/>
                </>
                )}
                <label htmlFor="login">Login</label>
                <input
                    id="login"
                    name="login"
                    aria-label="Enter your login"
                    placeholder="Enter your login"
                    onChange={(e)=> setLogin(e.target.value)}
                />
                <br />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    aria-label="enter your password"
                    placeholder="Enter your password"
                    onChange={(e)=> setPassword(e.target.value)}
                />
                <br />
                {mode === "signup" && (
                <>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        aria-label="confirm your password"
                        placeholder="Confirm your password"
                        onChange={(e)=> {
                            const val = e.target.value;
                            setConfirmPassword(val); 
                            if (val.length > 0 && !password.startsWith(val)){// confirmPassword is not a prefix of password, then 
                                setErrorMsg("Passwords dont match");
                            }else{setErrorMsg("")}
                        }}
                    />
                    <br />
                </>
                )}
                
                <input type="submit" value={mode === "login" ? "Login" : "Signup"} className="submitButton"/>
            </form>
            {errorMsg == "" ? <><br/></> : <p className='errorMsg'>{errorMsg}</p>}
            {successMsg == "" ? <><br/></> : <p className='successMsg'>{successMsg}</p>}
            
            <p>
                {mode === "login" ? "I don't have an account: " : "I already have an account: "}
                <Link to={mode === "login" ? "/signup" : "/login"} className="switchButton">
                    {mode === "login" ? "Signup" : "Login"}
                </Link>
            </p>
        </div>

    </div>)
}