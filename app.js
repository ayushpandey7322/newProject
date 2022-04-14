const express = require('express');
const app = express();
require('dotenv').config();
require('./db');


const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({ extended: false }))                                                                                                                             // frontend ke data ko receive in json form and then save
app.use(bodyparser.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent// to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

const  postRoutes  = require('./api/routers/postRoutes');
const userRoutes = require('./api/routers/userRoutes');
const authRoutes = require('./api/routers/authRoutes');
const policyRoutes = require('./api/routers/policyRoutes');
const rolesRoutes = require('./api/routers/rolesRoutes');


app.use('/', userRoutes);
app.use('/', postRoutes);
app.use('/', authRoutes);
app.use('/', policyRoutes);
app.use('/', rolesRoutes);





app.use((req, res, next) => { res.status(404).json({ error:true,message: 'url not exist' }) });

 
module.exports = app;
