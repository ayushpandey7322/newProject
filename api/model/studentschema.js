const mongoose = require("mongoose");


const autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost:27017/nodejsapi', { useNewUrlParser: true, useUnifiedTopology: true });
autoIncrement.initialize(connection);

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: Number,
    gender: String,
    isActive: { type: Boolean, default: true },
    token:String
}
);
studentSchema.plugin(autoIncrement.plugin, 'Student');

module.exports = mongoose.model('Student', studentSchema);























const blacklistSchema = new mongoose.Schema( {
    token: String
} );


module.exports = mongoose.model('Blacklist', blacklistSchema);


