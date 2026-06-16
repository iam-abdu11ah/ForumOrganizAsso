const express = require("express");
const multer = require("multer");
const User = require("../entities/User.js");
const path = require("path");
const fs = require("fs").promises;
const Message = require("../entities/Message.js");


const userRoute = express.Router();

userRoute.post('/login', async (req, res) => {

    const user = new User();

    try {
        const { login, password } = req.body;
        // verification si le login et le password son non vide
        if (!login || !password) {
            res.status(400).json({
                status: 400,
                message: "Requête invalide : login et password nécessaires"
            });
            return;
        }

        // verification si l'utilisateur login existe
        if (! await user.exists(login)) {

            res.status(401).json({
                status: 401,
                message: "Utilisateur inconnu"
            })
            return;
        }

        // verification de la validité du password
        let userObj = await user.checkPassword(login, password);

        if (userObj) {
            req.session.regenerate(function (error) {
                if (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Erreur interne"
                    });
                }
                else {
                    if (!userObj.isMember) {
                        req.session.destroy((err) => { });
                        res.status(401).json({
                            status: 401,
                            message: "Votre compte n'a pas encore été validé"
                        })
                    } else {
                        req.session.userid = userObj._id;
                        req.session.isAdmin = userObj.isAdmin;
                        req.session.isMember = userObj.isMember;
                        req.session.lastName = userObj.lastName;
                        req.session.firstName = userObj.firstName;
                        req.session.save((err) => {
                            if (err) {
                                res.status(500).json({
                                    status: 500,
                                    message: "Erreur session"
                                });
                                return;
                            }
                            res.status(200).json({
                                status: 200,
                                message: "Login et mot de passe acceptés",
                                userId: userObj._id,
                                login: userObj.login,
                                firstName: userObj.firstName,
                                lastName: userObj.lastName,
                                isAdmin: userObj.isAdmin,
                                isMember: userObj.isMember,
                                avatarUrl: userObj.avatarUrl
                            });
                        });
                    }
                }
            });
            return;
        }

        req.session.destroy((err) => { });
        res.status(403).json({
            status: 403,
            message: "login et/ou mot de passe invalide(s)"
        });
        return;

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
        console.error(e);
    }
});

userRoute.post("/newUser", async (req, res) => {

    const user = new User();

    try {
        const { lastName, firstName, login, password, repeatPassword } = req.body;

        // verification que les champs sont non vide
        if (!lastName || !firstName || !login || !password || !repeatPassword) {
            res.status(400).json({
                status: 400,
                message: "Erreur : tous les champs sont obligatoire"
            });
            return;
        }

        // verification password et repeatPassword
        if (password !== repeatPassword) {
            res.status(400).json({
                status: 400,
                message: "Erreur : les mots de passes de correspondent pas"
            });
            return;
        }

        // verification que le login n'est pas déjà pris
        if (await user.exists(login)) {
            res.status(409).json({
                status: 409,
                message: "Erreur : le login est déjà pris"
            });
            return;
        }

        // on fait l'ajout à la base de données et on verifie que cela à fonctionné 
        if (await user.createUser(lastName, firstName, login, password)) {
            res.status(200).json({
                status: 200,
                message: "votre compte à bien été crée, en attente de validation"
            });
            return;
        }

        res.status(500).json({
            status: 500,
            message: "erreur interne",
            details: (e || "Erreur inconnue").toString()
        });

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
        console.error(e);
    }
});

userRoute.get("/profile/:userId", async (req, res) => {

    const user = new User();

    try {
        //on récupère le userId 
        const userId = req.params.userId;

        // verifiaction que l'utilisateur qui accéde au profile est member 
        if (!req.session.isMember) {
            res.status(401).json({
                status: 401,
                message: "Erreur : Permission non accordée"
            });
            return;
        }

        // userObj contient toutes les info d'user
        let userObj = await user.existsId(userId);

        // verification si l'utilisateur login existe
        if (!userObj) {
            res.status(404).json({
                status: 404,
                message: "Erreur : Utilisateur inconnu"
            })
            return;
        }

        //on répond au profile avec les donées
        res.status(200).json({
            status: 200,
            message: "Profile envoyé",
            lastName: userObj.lastName,
            firstName: userObj.firstName,
            isMember: userObj.isMember,
            isAdmin: userObj.isAdmin,
            avatarUrl: userObj.avatarUrl,
        })

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
        console.error(e);
    }
});

// requête pour acceder à une liste des id des user member si displayMember est true et des non member sinon 
userRoute.get('/getUserList/:displayMember', async (req, res) => {

    const user = new User();

    try {

        // recupération du booléen displayMember
        let displayMember = req.params.displayMember;

        displayMember = displayMember === "true";

        // verification que l'utilisateur est member
        if (!req.session.isMember) {
            res.status(401).json({
                status: 401,
                message: "Permission non accordée"
            });
            return;
        }

        // verification si display member true, que l'utilisateur qui consulte les liste est Admin
        if (!displayMember && (!req.session.isAdmin)) {
            res.status(401).json({
                status: 401,
                message: "Permission non accordée"
            });
            return;
        }

        // récuperation de la liste des users
        let userList = await user.getUserList(displayMember);

        // verification que userList est bien reçu
        if (userList) {
            res.status(200).json({
                status: 200,
                message: "Liste des utilisateur envoyé !",
                userList: userList
            });
            return;
        }

        res.status(500).json({
            status: 500,
            message: "erreur interne"
        });
        return;

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
        console.error(e);
    }

});

userRoute.delete("/delete/:userId", async (req, res) => {

    const user = new User();

    try {
        let userId = req.params.userId;

        // verification que l'utilisateur qui souhaite faire la suppression est admin
        if (!req.session.isAdmin) {
            res.status(401).json({
                status: 401,
                message: "Permission non accordée"
            });
            return;
        }

        // verification que l'utilisateur exists
        if (! await user.existsId(userId)) {
            res.status(404).json({
                status: 404,
                message: "Erreur utilisateur inconnu"
            });
            return;
        }

        // suppression de l'utilisateur
        if (await user.deleteUser(userId)) {
            res.status(200).json({
                status: 200,
                message: "Utilisateur supprimé"
            });
            return;
        }

        res.status(500).json({
            status: 500,
            message: "Erreur interne",
        });
        return;

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
    }

});

userRoute.patch("/setMember/:userId", async (req, res) => {

    const user = new User();

    try {

        let userId = req.params.userId;

        // verification que l'utilisateur est admin
        if (!req.session.isAdmin) {
            res.status(401).json({
                status: 401,
                message: "Permission non accordée"
            });
            return;
        }

        // verification que l'utilisateur exists
        if (! await user.existsId(userId)) {
            res.status(404).json({
                status: 404,
                message: "Erreur utilisateur inconnu"
            });
            return;
        }

        // mise de l'utilisateur au status de membre
        if (await user.setMember(userId)) {
            res.status(200).json({
                status: 200,
                message: "Utilisateur mit au status de membre"
            });
            return;
        }

        res.status(500).json({
            status: 500,
            message: "Erreur interne",
        });
        return;

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
    }

});

userRoute.patch("/setAdmin/:userId", async (req, res) => {

    const user = new User();

    try {

        let userId = req.params.userId;

        // verification que l'utilisateur est admin
        if (!req.session.isAdmin) {
            res.status(401).json({
                status: 401,
                message: "Permission non accordée"
            });
            return;
        }

        // verification que l'utilisateur exists
        if (! await user.existsId(userId)) {
            res.status(404).json({
                status: 404,
                message: "Erreur utilisateur inconnu"
            });
            return;
        }

        // mise de l'utilisateur au status d'administrateur
        if (await user.setAdmin(userId)) {
            res.status(200).json({
                status: 200,
                message: "Utilisateur mit au status d'administrateur"
            });
            return;
        }

        res.status(500).json({
            status: 500,
            message: "Erreur interne",
        });
        return;

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
    }

});

userRoute.post("/logout", async (req, res) => {

    try {

        req.session.destroy(err => {
            if (err) {
                res.status(500).json({
                    status: 500,
                    message: "Erreur lors de la déconnexion"
                });
                return;
            }

            res.clearCookie('connect.sid');
            res.status(200).json({
                status: 200,
                message: 'Déconnexion réussie'
            });
            return;
        })

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
    }

});

//requete pour modifier le profile d'un user
userRoute.put('/:userId', async (req, res) => {

    const user = new User();

    try {
        //on récupère le userId 
        const userId = req.params.userId;


        // verification que l'utilisateur qui accéde au profile est member 
        if (!req.session.isMember) {
            res.status(401).json({
                status: 401,
                message: "Erreur : Permission non accordée"
            });
            return;
        }

        // userObj contient toutes les info d'user
        let userObj = await user.existsId(userId);

        // verification si l'utilisateur login existe
        if (!userObj) {
            res.status(404).json({
                status: 404,
                message: "Erreur : Utilisateur inconnu"
            })
            return;
        }

        // on modifie le nom et prénom de l'utilisateur
        const { firstName, lastName } = req.body;


        if (firstName != null && lastName != null) {
            await user.updateUser(userId, firstName, lastName);
            res.status(200).json({
                status: 200,
                message: "Nom et prénom mis à jour !"
            });
            return;
        }

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
        console.error(e);
    }
});


//requete pour modifier la photo d'un user
//Configure multer to write files to disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // ensure this folder exists: /uploads/avatars
        cb(null, path.join(__dirname, "../uploads/avatars")); //cb is a callback function
    },
    filename: (req, file, cb) => {
        // on renomme le fichier: userId-timestamp.ext
        const ext = path.extname(file.originalname);
        cb(null, `${req.params.userId}-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });


// POST /user/:userId/avatar
userRoute.post("/:userId/avatar", upload.single("avatar"), async (req, res) => {
    const user = new User();

    try {
        //on récupère le userId 
        const userId = req.params.userId;


        // verification que l'utilisateur qui accéde au profile est member 
        if (!req.session.isMember) {
            res.status(401).json({
                status: 401,
                message: "Erreur : Permission non accordée"
            });
            return;
        }


        // userObj contient toutes les info d'user
        let userObj = await user.existsId(userId);


        // verification si l'utilisateur login existe
        if (!userObj) {
            res.status(404).json({
                status: 404,
                message: "Erreur : Utilisateur inconnu"
            })
            return;
        }

        // File must be present
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier envoyé" });
        }

        // on supprime l'ancien avatar
        if (userObj.avatarUrl) {
            // avatarUrl est comme "/uploads/avatars/12345-6789.png"
            const oldFilename = path.basename(userObj.avatarUrl);
            const oldFilePath = path.join(__dirname, "../uploads/avatars", oldFilename);

            // Attempt to delete; ignore errors if file missing
            try {
                await fs.access(oldFilePath);
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.warn("unlink skipped — file does not exist or no permission:", err.code);
            }
        }

        // Build the public URL to the uploaded file
        const newUrl = `/uploads/avatars/${req.file.filename}`;

        // Save only the URL in MongoDB
        let updateAvatar = user.updateAvatar(userId, newUrl);
        if (!updateAvatar) {
            return res.status(500).json({ message: "Erreur lors de la mise à jour de l'avatar" });
        }

        // Return the new URL to the client
        res.status(200).json({
            status: 200,
            message: "Avatar mis à jour !",
            avatarUrl: newUrl
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Erreur interne" });
    }
}
);
// renvoie un boolean contenant le valeur de verité de si l'utilisateur à aimer le message msgId
userRoute.get("/hasLiked/:msgId", async (req, res) => {

    const user = new User();
    const message = new Message();

    try {

        let msgId = req.params.msgId;

        // verification que l'utilisateur est member 
        if (!req.session.isMember) {
            res.status(403).json({
                status: 403,
                message: "Erreur : permission non accordée"
            });
            return;
        }

        // verification que le message existe
        if (! await message.exists(msgId)) {
            res.status(404).json({
                status: 404,
                message: "Erreur : message inconnu"
            });
            return;
        }

        // si le message est dans le forum privé, verification que l'utilisateur est Admin
        if (await message.isPrivate(msgId) && !req.session.isAdmin) {
            res.status(401).json({
                status: 401,
                message: "Erreur : accès non autorisé"
            });
            return;
        }

        const liked = await user.hasLiked(req.session.userid, msgId);

        res.status(200).json({
            status: 200,
            message: "booléen récuperer",
            liked: liked
        });
        return;

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Erreur interne",
            details: (e || "Erreur inconnue").toString()
        })
    }

});

// si like == true alors ajoute un l'id du message dans la liste likeMsg et incremente le nombre de like du message, sinon on retire le l'id du messag de la liste et decremente le nombre de like
userRoute.patch("/setLike", async (req, res) => {

    const user = new User();
    const message = new Message();

    try {

        const { liked, msgId } = req.body;

        // verification que l'utilisateur est member 
        if (!req.session.isMember) {
            res.status(403).json({
                status: 403,
                message: "Erreur : permission non accordée"
            });
            return;
        }

        // verification que le message existe
        if (! await message.exists(msgId)) {
            res.status(404).json({
                status: 404,
                message: "Erreur : message inconnu"
            });
            return;
        }

        // si le message est dans le forum privé, verification que l'utilisateur est Admin
        if (await message.isPrivate(msgId) && !req.session.isAdmin) {
            res.status(401).json({
                status: 401,
                message: "Erreur : accès non autorisé"
            });
            return;
        }

        const hasLiked = await user.hasLiked(req.session.userid, msgId);

        // verification que le contenue n'est pas deja aimer ou non aimer
        if ((liked && hasLiked) || (!liked && !hasLiked)) {
            res.status(200).json({
                status: 200,
                message: "like déja effectué",
            });
            return;
        }

        const isSetUser = await user.setLike(req.session.userid, msgId, liked);
        const isSetMessage = await message.setLike(msgId, liked);



        if (isSetUser && isSetMessage) {
            res.status(200).json({
                status: 200,
                message: "like effectué",
            });
            return;
        }

        res.status(500).json({
            status: 500,
            message: "erreur interne"
        });
        return;

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Erreur interne",
            details: (e || "Erreur inconnue").toString()
        });
    }

});


module.exports = userRoute;