'use strict'
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {type: String},
    email: {type: String},
    token: {type: String}
},{ collection: 'users' });

module.exports = userSchema;