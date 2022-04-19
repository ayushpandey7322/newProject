const mongoose = require("mongoose");
const { Role } = require('../model/rolesSchema');

const autoIncrement = require('mongoose-auto-increment');
const { connection } = require('../../db.js');
autoIncrement.initialize(connection);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    gender: String,
    isActive: { type: String, default: "true" },
    roleid: { type: Number,default:2, ref: Role },
    role: { type: String, default: "user", ref: Role },
  
}
);

userSchema.plugin(autoIncrement.plugin, 'User');
const User = mongoose.model('User', userSchema);

module.exports = { User: User };

