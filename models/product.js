const mongoose = require('mongoose')
const product = new mongoose.Schema({
    productName: { type: String },
    price: { type: Number },
    amount: { type : Number }
})
//export
module.exports = mongoose.model('product', product)


//การประกาศตัวแปร
/*let first_name = 'aon'
let firstName = 'aon'*/