const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();

// middlewre 
app.use(session({
    secret: "technoweb rocks",
    resave: true,
    saveUninitialized: false,
    cookie: {
    secure: true,       // must be true if frontend is HTTPS
    httpOnly: true,
    sameSite: "none",   // required for cross-site cookies
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