const mongoose = require("mongoose")
const user = new mongoose.Schema({
    username: {type: String, unique:true },
    password: {type: String },
    firstname: {type: String},
    lastname: {type: String},
    email: {type: String}
})

//export ออกไปในชื่อ user
module.exports = mongoose.model('user', user)
