const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');
const { connection } = require('../../db.js');
autoIncrement.initialize(connection);




const postSchema = new mongoose.Schema({
    title: String,
    body: String,
    status: String,
    isActive: { type: Boolean, default: true },
    userid: Number

});


postSchema.plugin(autoIncrement.plugin, 'Post');

const Post = mongoose.model('Post', postSchema);


module.exports = {
    Post: Post
}