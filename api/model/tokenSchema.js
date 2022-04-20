const { User } = require('../model/userSchema');
const { Policy } = require('../model/policySchema');
const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');
const { connection } = require('../../db.js');
autoIncrement.initialize(connection);

const tokenSchema = new mongoose.Schema({
    token: String,
    status:String,
    userid: { type: Number, ref: User },
    policyid: [{ type: Number, ref: Policy }],
    policies: [{ type: String, ref: Policy }],
    
}, { timestamps:true} 
);


tokenSchema.plugin(autoIncrement.plugin, 'Token');
const Token = mongoose.model('Token', tokenSchema);
module.exports = { Token: Token };

