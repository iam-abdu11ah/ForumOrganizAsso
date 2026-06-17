import { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import AvatarUploader from "./AvatarUploader";



export default function EditProfile({backtToProfile}) {
    const { user } = useUser();
    const userId = user.userId;

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);

    const defaultAvatar = "/src/assets/defaultAvatar.jpg";
    const API_URL = import.meta.env.VITE_API_URL;

    const avatarFullUrl = user.avatarUrl === "" ? defaultAvatar : `${API_URL}${user.avatarUrl}`;

    // file + preview
    const [avatarFile, setAvatarFile]   = useState(null);
    const [previewUrl, setPreviewUrl]   = useState(avatarFullUrl);

    // load current avatar on mount
    useEffect(() => {
        if (user.avatarUrl) {
            setPreviewUrl(API_URL + user.avatarUrl);
        }
        else {
            setPreviewUrl(defaultAvatar);
        }
    }, [user.avatarUrl]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1) Update name & lastname
        if(firstName != user.firstName || lastName != user.lastName ) { //si le nom ou prénom est changé
            await axios.put(`/user/${userId}`, {firstName, lastName }, { withCredentials: true })
            .then(res => {
                if (res.status == 200) {
                    user.firstName = firstName;
                    user.lastName = lastName;
                    console.log("Nom et prénom mis à jour");
                }
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour du nom et prénom:", error);
            });

            await axios.put(`/message/${userId}`, {firstName, lastName}, {withCredentials: true })
            .then(res => {
                if (res.status == 200) {
                    console.log("Nom et prénom mis à jour dans les messages");
                    backtToProfile();  //une fois que le nom et prénom soient mis à jour , on retourne au profile
                }
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour du nom et prénom dans les messages:", error);
            });

        }else{
            console.log("Pas de changement de nom ou prénom");
        }
        // 2) Update avatar
        if (avatarFile) {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            
            console.log("Avatar file", avatarFile); //ok

            await axios.post(`/user/${userId}/avatar`, formData, { withCredentials: true , headers: { "Content-Type": "multipart/form-data" }})
            .then(res => {
                if (res.status == 200) {
                    console.log("Avatar mis à jour");
                    console.log("res.data.avatarUrl", res.data.avatarUrl); //ok
                    user.avatarUrl = res.data.avatarUrl; // Update user context
                    setPreviewUrl(res.data.avatarUrl); // Update previews
                    backtToProfile();
                }
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour de l'avatar:", error);
            });
        }

    };

    // when file input changes
    const handleFileChange = e => {
        
        const file = e.target.files[0]; // get the first file if multiple files are selected
        if (!file) return;
        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));  // local preview
    };


    return(
        <div className="EditProfile">
            
            <AvatarUploader avatarUrl= {previewUrl} onFileSelect={handleFileChange} />
            
            
            <div className="edit-profile-form">
                <form onSubmit={handleSubmit}>
                    <label>
                        First Name  
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </label>
                    <label>
                        Last Name 
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </label>
                    <div className="buttonGroup">
                        <button className="valider" onClick={handleSubmit}>Valider</button>
                        <button className="deleteButton" onClick={backtToProfile}>Annuler</button>
                    </div>

                </form>
            </div>
        </div>
    )

}