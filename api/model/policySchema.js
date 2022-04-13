const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');
const { connection } = require('../../db.js');
autoIncrement.initialize(connection);




const policySchema = new mongoose.Schema({
    name: String,
    display_name: String,
    description: String,
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true

});


policySchema.plugin(autoIncrement.plugin, 'Policy');

const Policy = mongoose.model('Policy', policySchema);


module.exports = { Policy: Policy}