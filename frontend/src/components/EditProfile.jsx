import { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import api, { getErrorMessage } from "../api/client.js";
import AvatarUploader from "./AvatarUploader";
import defaultAvatar from "../assets/defaultAvatar.jpg";



export default function EditProfile({backtToProfile}) {
    const { user, updateUser } = useUser();
    const userId = user.userId;

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);

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


    // message d'erreur affiché sous le formulaire
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const nameChanged = firstName != user.firstName || lastName != user.lastName;

        // rien n'a changé : on revient simplement au profil
        if (!nameChanged && !avatarFile) {
            backtToProfile();
            return;
        }

        if (!firstName || !lastName) {
            setErrorMsg("Le nom et le prénom sont obligatoires");
            return;
        }

        try {
            // 1) Update name & lastname (dans le profil puis dans ses messages)
            if (nameChanged) {
                await api.put(`/user/${userId}`, {firstName, lastName });
                await api.put(`/message/${userId}`, {firstName, lastName});
                updateUser({ firstName, lastName });  // le profil se recharge et revient en mode affichage
            }

            // 2) Update avatar
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);

                const res = await api.post(`/user/${userId}/avatar`, formData, { headers: { "Content-Type": "multipart/form-data" }});
                updateUser({ avatarUrl: res.data.avatarUrl }); // Update user context
            }
        } catch (error) {
            setErrorMsg(getErrorMessage(error));
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
                        <button type="submit" className="valider">Valider</button>
                        {/* type="button" : sinon le bouton soumet le formulaire et enregistre les changements */}
                        <button type="button" className="deleteButton" onClick={backtToProfile}>Annuler</button>
                    </div>
                    {errorMsg && <p className="errorMsg">{errorMsg}</p>}

                </form>
            </div>
        </div>
    )

}