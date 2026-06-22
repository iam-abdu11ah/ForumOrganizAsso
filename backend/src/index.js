require("dotenv").config();
const app = require("./app.js");
const {connectDB} = require("./db.js");
const PORT = process.env.PORT || 8000;

// Démarrer le serveur après la connexion à la base de données
connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log("Serveur en écoute sur le port "+PORT+"...");
    });
});