require('dotenv').config();
const mongoose = require('mongoose');
const connect = mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', function () {
    console.log('database is connected successfully');
});
mongoose.connection.on('disconnected', function () {
    console.log('database is disconnected successfully');
})
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));                                                                            // ,err=>{console.log('connection failed');}
const connection = mongoose.connection;
module.exports = {connection };