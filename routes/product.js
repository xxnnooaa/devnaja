var express = require('express')
var router = express.Router()
const productModel = require('../models/product')
const mongoose = require('mongoose')

//create api for post data
router.post('/product', async function (req, res, next) {
    try {
        const { productName, price, amount } = req.body
        let newProduct = new productModel({
            productName: productName,
            price: price,
            amount: amount
        })
        let product = await newProduct.save()
        return res.status(200).send({
            data: product,
            msg: 'create product success',
            success: true
        })

    } catch (err) {
        return res.status(400).send({
            msg: 'create product fail',
            success: false
        })
    }
})

//get all data
router.get('/product', async function (req, res, next) {
    try {
        let product = await productModel.find() //select * from product*/
        return res.status(200).send({
            data: product,
            msg: 'get product success',
            success: true
        })

    } catch (err) {
        return res.status(400).send({
            msg: 'get product fail',
            success: false
        })
    }
})

//find by id
router.get('/product/:id', async function (req, res, next) {
    try {
        let id = req.params.id
        let product = await productModel.findById(id)
        return res.status(200).send({
            data: product,
            msg: 'get product success',
            success: true
        })

    } catch (err) {
        return res.status(400).send({
            msg: 'get product fail',
            success: false
        })
    }
})

// Update product
router.put("/update/:id", async function (req, res, next) {
    try {
      let id = req.params.id;
      let postdata = req.body.postdata;
      let productName = postdata.productName;
      let price = postdata.price;
      let amount = postdata.amount;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
          message: "id Invalid",
          success: false,
          error: ["id is not a ObjectId"],
        });
      }
  
      await productModel.updateOne(
        { _id: id },
        { $set: { productName: productName, amount: amount, price: price } }
      );
  
      let product = await productModel.findById(id);
      return res.status(200).send({
        data: product,
        msg: "update data success",
        success: true,
      });
    } catch (error) {
      return res.status(400).send({
        data: "update data failed",
        success: false,
      });
    }
  });

//delete
router.delete('/product/:id', async function (req, res, next) {
    try {
        let id = req.params.id
        await productModel.deleteOne({ _id: id })
        let product = await productModel.find() //find คือการดึงข้อมูลทั้งหมดใน db มาแสดง
        //find แบบมีเงื่อนไข
        return res.status(200).send({
            data: product,
            msg: 'delete product success',
            success: true
        })

    } catch (err) {
        console.log(err);
        return res.status(400).send({
            msg: 'delete product fail',
            success: false
        })
    }
})

//search data (filter)
router.get('/productList', async function(req, res, next){
    try {
        let search = req.query.search
        let product = await productModel.find({
            productName: new RegExp(search, 'i')
        }) 
        return res.status(200).send({
            data: product,
            msg: 'search data success',
            success: true
        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({
            msg: 'search data fail',
            status: false
        })
    }
})
module.exports = router

