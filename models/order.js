const mongoose = require('mongoose')
const Schema = mongoose.Schema
const order = new Schema({
    userName: { type: String},
    discount: { type : Number},
    cart: [{
        id: String,
        productName: String,
        price: Number,
        quantity: Number
    }],
    totalPrice : { type : Number },
    totalDiscount : { type : Number },
    total : { type : Number }
})

module.exports = mongoose.model('order', order)