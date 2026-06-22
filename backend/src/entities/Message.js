const { MongoClient, ObjectId } = require("mongodb");
const {client} = require("../db.js");

// class contenant les opérations de manipulation de la base de donnée des messages
class Message {

        // uri de connexion
        uri = process.env.MONGO_URI;

        // nom  de la base de donnée
        dbName = "main";

        // nom de la collection de Message
        colName = "Message";

        constructor(){
                const db = client.db(this.dbName);
                this.colMessage = db.collection(this.colName);
        }

        // verifie qu'un message existe
        async exists(id) {
                try {
                        const exists = await this.colMessage.findOne({
                                _id: ObjectId.createFromHexString(id)
                        });
                        return exists;
                } catch (e) {
                        console.error(e);
                } 
        }

        // verifie si un message est privé
        async isPrivate(id) {
                try {
                        const isPrivate = await this.colMessage.findOne({
                                _id: ObjectId.createFromHexString(id),
                                isPrivate: true
                        });
                        return isPrivate;
                } catch (e) {
                        console.error(e);
                }
        }


        // crée un nouveau message
        async createMessage(content, authorId, authorFirstName, 
                        authorLastName, isComment, msgAnswered, isPrivate) {
                try {

                        let msgAnsweredObj = null;

                        // si il s'agit d'un commentaire, creation de l'id du message repondu
                        if (isComment) {
                                msgAnsweredObj = ObjectId.createFromHexString(msgAnswered);
                        }

                        // Objet du nouveau message
                        let newMessage = {
                                content: content,
                                authorId: ObjectId.createFromHexString(authorId),
                                authorFirstName: authorFirstName,
                                authorLastName: authorLastName,
                                isComment: isComment,
                                msgAnswered: msgAnsweredObj,
                                isPrivate: isPrivate,
                                date: new Date(),
                                likeNumber:0
                        }

                        // ajout du nouveau message
                        await this.colMessage.insertOne(newMessage);
                        return true;
                } catch (e) {
                        console.error(e);
                }
        }


        //suppression d'un message
        async delete(id) {
                try {
                        const supp = await this.colMessage.deleteOne({
                                _id: ObjectId.createFromHexString(id)
                        })
                        return supp;

                } catch (e) {
                        console.error(e);
                }
        }

// recupère la liste des message correspondant aux critères des paramètres
        async getMsgList(isPrivate, dateBegin, dateEnd, 
                        msgSearchContent, authorId, msgAnswered, isComment) {
                try {
                        // initialisation du filtre 
                        let filter = { isPrivate: isPrivate };

                        // si les paramètre sont non null alors on les ajoutes au filtre
                        if (dateBegin || dateEnd) {
                                filter.date = {};
                                if (dateBegin) {
                                        filter.date.$gte = new Date(new Date(dateBegin).setHours(0, 0, 0, 0));
                                }
                                if (dateEnd) {
                                        filter.date.$lte = new Date(new Date(dateEnd).setHours(23, 59, 59, 999));
                                }
                        }

                        if (msgSearchContent) {
                                filter.content = { $regex: msgSearchContent, $options: 'i' };
                        }

                        if (msgAnswered) {
                                filter.msgAnswered = ObjectId.createFromHexString(msgAnswered);
                        }else{
                                filter.msgAnswered = null;
                        }

                        if (authorId) {
                                filter = { authorId: ObjectId.createFromHexString(authorId) };
                        }

                        filter.isComment = isComment;

                        const msgListCursor = await this.colMessage.find(filter);


                        const msgList = await msgListCursor.toArray();

                        const idMsgList = msgList.map((element) => ({
                                        msgId : element._id,
                                        date : element.date,
                                        likeNumber: element.likeNumber}));

                        return idMsgList;

                } catch (e) {
                        console.error(e);
                }
        }


        async updateAuthorName(userId, firstName, lastName) {
                try {
                        const result = await this.colMessage.updateMany(
                                { authorId: ObjectId.createFromHexString(userId) },
                                { $set: { authorFirstName: firstName, authorLastName: lastName } }
                        );
                        return result;

                } catch (e) {
                        console.error(e);
                }
        }


 // recupère le nombre de like d'un message
        async getLikeNumber(msgId){
                try{
                        const msg = await this.colMessage.findOne({
                                _id : ObjectId.createFromHexString(msgId)
                        });

                        if (msg.likeNumber == undefined){
                                const result = await this.colMessage.updateMany({
                                        likeNumber: undefined
                                },
                                {
                                        $set: {likeNumber: 0}
                                });      
                        }

                        return (msg ? msg.likeNumber  : null );

                }catch(e){
                        console.log(e);
                }
        }


        // ajoute ou retire un like à msgId selon la valeur de like
        async setLike(msgId, liked){
                try{
                        let val = (liked ? 1 : -1);
                        const result = await this.colMessage.updateOne({
                                _id : ObjectId.createFromHexString(msgId)
                        }, {
                                $inc: {likeNumber : val}
                        });

                       
                        return result.matchedCount == 1;

                }catch(e){
                        console.log(e);
                }
        }
}

module.exports = Message;