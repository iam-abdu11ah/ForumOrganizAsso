const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');

// class contenant les opérations de manipulation de la base de donnée des Users
class User {

    // uri de connexion
    uri = process.env.MONGO_URI;

    // nom  de la base de donnée
    dbName = "main";

    // nom de la collection de User
    colUser = "User";

    //nom de la collection de Message
    colMessage = "Message"


    // verfie si un utilisateur ayant avec login comme login existe
    async exists(login) {
        const client = new MongoClient(this.uri);
        try {
            await client.connect();
            const colUser = await client.db(this.dbName).collection(this.colUser);
            // stocke dans la variable exists le booléen correspondant à l'éxistance de l'utilisateur login
            const exists = await colUser.findOne(
                {
                    login: login
                }
            )

            return exists;
        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }

    // verfie si un utilisateur ayant avec l'id userId existe
    async existsId(userId) {

        const client = new MongoClient(this.uri);

        try {

            await client.connect();

            const colUser = await client.db(this.dbName).collection(this.colUser);

            if (userId.length < 24){
                return false;
            }

            // stocke dans la variable exists le booléen correspondant à l'éxistance de l'utilisateur login
            const exists = await colUser.findOne(
                {
                    _id: ObjectId.createFromHexString(userId)
                }
            )

            return exists;

        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }

    // verifie si le password donné en paramètre correspond au véritable password de l'utilisateur login et renvoie l'objet de l'utilisateur si c'est le cas
    async checkPassword(login, candidatePassword) {

        const client = new MongoClient(this.uri);

        try {

            await client.connect();

            const colUser = await client.db(this.dbName).collection(this.colUser);

            // stocke dans la variable chack le booléen correspondant à la correspondance du password
            const user = await colUser.findOne(
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
        } finally {
            await client.close();
        }
    }

    // crée un nouvel utilisateur
    async createUser(lastName, firstName, login, password) {
        const client = new MongoClient(this.uri);
        try {
            await client.connect();
            const colUser = client.db(this.dbName).collection(this.colUser);
            let newUser = {
                lastName: lastName,
                firstName: firstName,
                login: login,
                password: await bcrypt.hash(password, 10),
                isAdmin: false,
                isMember: false,
                avatarUrl: ""
            };

            await colUser.insertOne(newUser);

            return true;
        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }

    }

    // met à jour les informations de l'utilisateur
    async updateUser(userId, firstName, lastName,) {
        const client = new MongoClient(this.uri);
        try {
            await client.connect();
            const colUser = client.db(this.dbName).collection(this.colUser);
            const filter = { _id: ObjectId.createFromHexString(userId) };
            const updateDoc = {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                },
            };
            const result = await colUser.updateOne(filter, updateDoc);
            return result;
        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }

    // met à jour l'avatar de l'utilisateur
    async updateAvatar(userId, avatarUrl) {
        const client = new MongoClient(this.uri);
        try {
            await client.connect();
            const colUser = client.db(this.dbName).collection(this.colUser);
            const filter = { _id: ObjectId.createFromHexString(userId) };
            const updateDoc = {
                $set: {
                    avatarUrl: avatarUrl,
                },
            };
            const result = await colUser.updateOne(filter, updateDoc);
            return result;
        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }

    //on récupère les infos personnelles et les messages d'un user par son login //si cette methode est appelée, on est sûr cet user exists vue que on a déjà vérifié avec exists(login) auparavant
    async getUserMessage(userId) {
        const client = new MongoClient(this.uri);
        try {
            await client.connect();
            const colUser = client.db(this.dbName).collection(this.colUser);
            const colMessage = client.db(this.dbName).collection(this.colMessage);

            const userInfo = await colUser.findOne(
                {
                    login: userId,
                }
            )

            //on récupère tous les message pour le user courant, sachant que pour chaque user, le db génère un unique id
            const userMessagesCursor = await colMessage.find({  // .find() renvoie un curseur pointant vers les documents de la collections, cursor est comme un iterator/pointer
                authorId: new Object(userInfo._id),
                isComment: false,
            })


            const userMessages = await userMessagesCursor.toArray();  //on transforme le cureur en un array

            return { messages: userMessages }

        } catch (e) {
            console.log(e)
        } finally {
            await client.close();
        }
    }

    // renvoie la liste des id des users, member si displayMember est true, non member sinon
    async getUserList(displayMember) {

        const client = new MongoClient(this.uri);

        try {
            await client.connect();

            const colUser = client.db(this.dbName).collection(this.colUser);

            // on récupère un curseur poitant vers les users correspondant
            let userCursor = await colUser.find({
                isMember: displayMember
            });

            // on transforme le curseur en array
            let userList = await userCursor.toArray();

            // on récupère uniquement les ids des users
            const userIdList = userList.map((element) => element._id);

            return userIdList;

        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }

    }

    // supprime l'utilisateur userId
    async deleteUser(userId) {

        const client = new MongoClient(this.uri);

        try {

            await client.connect();

            const db = client.db(this.dbName);
            const colUser = db.collection(this.colUser);

            const result = await colUser.deleteOne({
                _id: ObjectId.createFromHexString(userId)
            });

            return (result.deletedCount === 1);

        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }

    }

    // metre un utilisateur member
    async setMember(userId) {

        const client = new MongoClient(this.uri);

        try {

            await client.connect();

            const db = client.db(this.dbName);
            const colUser = db.collection(this.colUser);

            const result = await colUser.updateOne(
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
        } finally {
            await client.close();
        }

    }

    // metre un utilisateur Admin
    async setAdmin(userId) {

        const client = new MongoClient(this.uri);

        try {

            await client.connect();

            const db = client.db(this.dbName);
            const colUser = db.collection(this.colUser);

            const result = await colUser.updateOne(
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
        } finally {
            await client.close();
        }

    }

    // recupere un booléen indiquant si l'user userId à aimer le message msgId
    async hasLiked(userId, msgId) {

        const client = new MongoClient(this.uri);

        try {

            await client.connect();

            const db = client.db(this.dbName);
            const colUser = db.collection(this.colUser);

            const liked = await colUser.findOne({
                _id: ObjectId.createFromHexString(userId),
                likedMsg: ObjectId.createFromHexString(msgId)
            });

            return (liked != null);

        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }

    }

    // ajoute msgId dans la liste likedMsg si like == true, l'enlève sinon
    async setLike(userId, msgId, liked) {

        const client = new MongoClient(this.uri);

        try {

            await client.connect();

            const db = client.db(this.dbName);
            const colUser = db.collection(this.colUser);

            const userObjectId = ObjectId.createFromHexString(userId);
            const msgObjectId = ObjectId.createFromHexString(msgId);

            let result;

            if (liked) {
                result = await colUser.updateOne({
                    _id: userObjectId
                },
                    {
                        $push: { likedMsg: msgObjectId }
                    });
            }
            else {
                result = await colUser.updateOne({
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
        } finally {
            await client.close();
        }

    }

}

module.exports = User;
