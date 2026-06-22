const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');
const {client} = require("../db.js");

// class contenant les opérations de manipulation de la base de donnée des Users
class User {
    dbNameStr = "main";        // nom  de la base de donnée
    colUserStr = "User";       // nom de la collection de User
    colMessageStr = "Message"  //nom de la collection de Message

    constructor(){
        const db = client.db(this.dbNameStr);
        this.colUser = db.collection(this.colUserStr);
        this.colMessage = db.collection(this.colMessageStr);
    }


    // verfie si un utilisateur ayant avec login comme login existe
    async exists(login) {
        try {
            // stocke dans la variable exists le booléen correspondant à l'éxistance de l'utilisateur login
            const exists = await this.colUser.findOne(
                {
                    login: login
                }
            )
            return exists;
        } catch (e) {
            console.log(e);
        }
    }

    // verfie si un utilisateur ayant avec l'id userId existe
    async existsId(userId) {
        try {
            if (userId.length < 24){
                return false;
            }

            // stocke dans la variable exists le booléen correspondant à l'éxistance de l'utilisateur login
            const exists = await this.colUser.findOne(
                {
                    _id: ObjectId.createFromHexString(userId)
                }
            )
            return exists;
        } catch (e) {
            console.log(e);
        }
    }

    // verifie si le password donné en paramètre correspond au véritable password de l'utilisateur login et renvoie l'objet de l'utilisateur si c'est le cas
    async checkPassword(login, candidatePassword) {
        try {
            // stocke dans la variable chack le booléen correspondant à la correspondance du password
            const user = await this.colUser.findOne(
                {
                    login: login,
                }
            )
            if (user && await bcrypt.compare(candidatePassword, user.password)) {
                return user;
            }
            return null;
        } catch (e) {
            console.log(e);
        }
    }

    // crée un nouvel utilisateur
    async createUser(lastName, firstName, login, password) {
        try {
            let newUser = {
                lastName: lastName,
                firstName: firstName,
                login: login,
                password: await bcrypt.hash(password, 10),
                isAdmin: false,
                isMember: false,
                avatarUrl: ""
            };

            await this.colUser.insertOne(newUser);

            return true;
        } catch (e) {
            console.log(e);
        } 
    }

    // met à jour les informations de l'utilisateur
    async updateUser(userId, firstName, lastName,) {
        try {
            const filter = { _id: ObjectId.createFromHexString(userId) };
            const updateDoc = {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                },
            };
            const result = await this.colUser.updateOne(filter, updateDoc);
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    // met à jour l'avatar de l'utilisateur
    async updateAvatar(userId, avatarUrl) {
        try {
            const filter = { _id: ObjectId.createFromHexString(userId) };
            const updateDoc = {
                $set: {
                    avatarUrl: avatarUrl,
                },
            };
            const result = await this.colUser.updateOne(filter, updateDoc);
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    //on récupère les infos personnelles et les messages d'un user par son login //si cette methode est appelée, on est sûr cet user exists vue que on a déjà vérifié avec exists(login) auparavant
    async getUserMessage(login) {
        try {
            const userInfo = await this.colUser.findOne(
                {
                    login: login,
                }
            )

            //on récupère tous les message pour le user courant, sachant que pour chaque user, le db génère un unique id
            const userMessagesCursor = await this.colMessage.find({  // .find() renvoie un curseur pointant vers les documents de la collections, cursor est comme un iterator/pointer
                authorId: new Object(userInfo._id),
                isComment: false,
            })


            const userMessages = await userMessagesCursor.toArray();  //on transforme le cureur en un array

            return { messages: userMessages }

        } catch (e) {
            console.log(e)
        }
    }

    // renvoie la liste des id des users, member si displayMember est true, non member sinon
    async getUserList(displayMember) {
        try {
            // on récupère un curseur poitant vers les users correspondant
            let userCursor = await this.colUser.find({
                isMember: displayMember
            });

            // on transforme le curseur en array
            let userList = await userCursor.toArray();

            // on récupère uniquement les ids des users
            const userIdList = userList.map((element) => element._id);
            return userIdList;
        } catch (e) {
            console.log(e);
        }
    }

    // supprime l'utilisateur userId
    async deleteUser(userId) {
        try {
            const result = await this.colUser.deleteOne({
                _id: ObjectId.createFromHexString(userId)
            });
            return (result.deletedCount === 1);
        } catch (e) {
            console.log(e);
        }
    }

    // metre un utilisateur member
    async setMember(userId) {
        try {
            const result = await this.colUser.updateOne(
                {
                    _id: ObjectId.createFromHexString(userId)
                },
                {
                    $set: { isMember: true }
                }
            );
            return (result.matchedCount == 1);

        } catch (e) {
            console.log(e);
        } 
    }

    // metre un utilisateur Admin
    async setAdmin(userId) {
        try {
            const result = await this.colUser.updateOne(
                {
                    _id: ObjectId.createFromHexString(userId)
                },
                {
                    $set: { isAdmin: true }
                }
            );
            return (result.matchedCount == 1);
        } catch (e) {
            console.log(e);
        } 
    }

    // recupere un booléen indiquant si l'user userId à aimer le message msgId
    async hasLiked(userId, msgId) {
        try {
            const liked = await this.colUser.findOne({
                _id: ObjectId.createFromHexString(userId),
                likedMsg: ObjectId.createFromHexString(msgId)
            });
            return (liked != null);
        } catch (e) {
            console.log(e);
        }
    }

    // ajoute msgId dans la liste likedMsg si like == true, l'enlève sinon
    async setLike(userId, msgId, liked) {
        try {
            const userObjectId = ObjectId.createFromHexString(userId);
            const msgObjectId = ObjectId.createFromHexString(msgId);
            let result;
            if (liked) {
                result = await this.colUser.updateOne({
                    _id: userObjectId
                },
                    {
                        $push: { likedMsg: msgObjectId }
                    });
            }
            else {
                result = await this.colUser.updateOne({
                    _id: userObjectId
                },
                    {
                        $pull: { likedMsg: msgObjectId }
                    }
                );
            }
            return (result.matchedCount == 1);
        } catch (e) {
            console.log(e);
        }
    }

}

module.exports = User;
