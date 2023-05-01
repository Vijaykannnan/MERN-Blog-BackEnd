require('dotenv').config();
const express = require("express");
const cors = require("cors")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const path = require("path")
const app = express();

//for session
const session = require('express-session');
const cookieParser = require("cookie-parser");
// cookie parser middleware
app.use(cookieParser());
const routes = require("./routes")

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
//session middleware
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true
}));




app.use(bodyParser.urlencoded({ extended: false }))
// app.use(express.urlencoded({ extended: false }))
// app.use(bodyParser.json());



app.use(cors({
//     origin: 'https://mern-blog-site-2fb1.onrender.com',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//serving public file
// app.use(express.static(__dirname));


//



//to create nan new users to DB
// app.get("/", async (req, res) => {
//     res.send("hello")
// })


// for connect na Database
let url = process.env.DATABASE
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("for successfully Db connected");
    }).catch((e) => {
        console.log(e)
    })

//for all routes
app.use("/", routes)


var port = process.env.PORT || 8000
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
})
