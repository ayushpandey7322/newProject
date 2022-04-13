const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');
const { connection } = require('../../db.js');
autoIncrement.initialize(connection);

const rolesSchema = new mongoose.Schema({
    name: String,
    display_name: String,
    policyid: [{ type: Number, ref: 'Policy' }],
    policies: [{ type: String, ref: 'Policy' }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true

});


rolesSchema.plugin(autoIncrement.plugin, 'Role');

const Role = mongoose.model('Role', rolesSchema);


module.exports = {
    Role: Role
}