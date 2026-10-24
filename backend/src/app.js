const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();

// en production le frontend (vercel.app) et le backend (onrender.com) sont sur deux sites différents :
// le cookie de session doit être SameSite=None + Secure, sinon le navigateur ne l'envoie pas
const isProduction = process.env.NODE_ENV === "production";

// Render passe par un proxy HTTPS : nécessaire pour qu'express-session accepte d'envoyer un cookie Secure
app.set("trust proxy", 1);

// middlewre
app.use(session({
    secret: process.env.SESSION_SECRET || "technoweb rocks",
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

const allowedOrigins = [
  "http://localhost:5173",
  "https://organiz-asso.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
    credentials: true
}));

app.use(express.json());

// Router
const userRoute = require("./routes/userRoute.js");
const messageRoute = require("./routes/messageRoute.js");

app.use("/user", userRoute);
app.use("/message", messageRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;