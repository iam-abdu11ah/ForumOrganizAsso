const { MongoClient, ObjectId } = require("mongodb");

// class contenant les opérations de manipulation de la base de donnée des messages
class Message {

        // uri de connexion
        uri = process.env.MONGO_URI;

        // nom  de la base de donnée
        dbName = "main";

        // nom de la collection de Message
        colName = "Message";

        // verifie qu'un message existe
        async exists(id) {

                const client = new MongoClient(this.uri);

                try {
                        await client.connect();

                        const db = await client.db(this.dbName);

                        const colMessage = await db.collection(this.colName);

                        const exists = await colMessage.findOne({
                                _id: ObjectId.createFromHexString(id)
                        });

                        return exists;

                } catch (e) {
                        console.error(e);
                } finally {
                        await client.close();
                }

        }

        // verifie si un message est privé
        async isPrivate(id) {
                const client = new MongoClient(this.uri);

                try {
                        await client.connect();

                        const colMessage = await client.db(this.dbName).collection(this.colName);

                        const isPrivate = await colMessage.findOne({
                                _id: ObjectId.createFromHexString(id),
                                isPrivate: true
                        });

                        return isPrivate;
                } catch (e) {
                        console.error(e);
                } finally {
                        await client.close();
                }
        }


        // crée un nouveau message
        async createMessage(content, authorId, authorFirstName, authorLastName, isComment, msgAnswered, isPrivate) {

                const client = new MongoClient(this.uri);

                try {
                        await client.connect();

                        const db = await client.db(this.dbName);

                        const colMessage = await db.collection(this.colName);

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
                        await colMessage.insertOne(newMessage);

                        return true;
                } catch (e) {
                        console.error(e);
                } finally {
                        await client.close();
                }


        }


        //suppression d'un message
        async delete(id) {

                const client = new MongoClient(this.uri);

                try {
                        await client.connect();

                        const db = await client.db(this.dbName);

                        const colMessage = await db.collection(this.colName);

                        const supp = await colMessage.deleteOne({
                                _id: ObjectId.createFromHexString(id)
                        })
                        return supp;

                } catch (e) {
                        console.error(e);
                } finally {
                        await client.close();
                }

        }

// recupère la liste des message correspondant aux critères des paramètres
        async getMsgList(isPrivate, dateBegin, dateEnd, msgSearchContent, authorId, msgAnswered, isComment) {

                const client = new MongoClient(this.uri);

                try {
                        await client.connect();

                        const db = await client.db(this.dbName);

                        const colMessage = await db.collection(this.colName);

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

                        const msgListCursor = await colMessage.find(filter);


                        const msgList = await msgListCursor.toArray();

                        const idMsgList = msgList.map((element) => ({
                                        msgId : element._id,
                                        date : element.date,
                                        likeNumber: element.likeNumber}));

                        return idMsgList;

                } catch (e) {
                        console.error(e);
                } finally {
                        await client.close();
                }


        }


        async updateAuthorName(userId, firstName, lastName) {
                const client = new MongoClient(this.uri);

                try {
                        await client.connect();

                        const db = await client.db(this.dbName);

                        const colMessage = await db.collection(this.colName);

                        const result = await colMessage.updateMany(
                                { authorId: ObjectId.createFromHexString(userId) },
                                { $set: { authorFirstName: firstName, authorLastName: lastName } }
                        );
                        return result;

                } catch (e) {
                        console.error(e);
                } finally {
                        await client.close();
                }
        }


 // recupère le nombre de like d'un message
        async getLikeNumber(msgId){

                const client = new MongoClient(this.uri);

                try{
                        await client.connect();

                        const db = client.db(this.dbName);
                        const colMessage =  db.collection(this.colName);

                        const msg = await colMessage.findOne({
                                _id : ObjectId.createFromHexString(msgId)
                        });

                        if (msg.likeNumber == undefined){
                                const result = await colMessage.updateMany({
                                        likeNumber: undefined
                                },
                                {
                                        $set: {likeNumber: 0}
                                });      
                        }

                        return (msg ? msg.likeNumber  : null );

                }catch(e){
                        console.log(e);
                }finally{
                        await client.close();
                }

        }


        // ajoute ou retire un like à msgId selon la valeur de like
        async setLike(msgId, liked){

                const client = new MongoClient(this.uri);

                try{
                        await client.connect();

                        const db = client.db(this.dbName);
                        const colMessage =  db.collection(this.colName);

                        let val = (liked ? 1 : -1);

                        const result = await colMessage.updateOne({
                                _id : ObjectId.createFromHexString(msgId)
                        }, {
                                $inc: {likeNumber : val}
                        });

                       
                        return result.matchedCount == 1;

                }catch(e){
                        console.log(e);
                }finally{
                        await client.close();
                }

        }
}

module.exports = Message;