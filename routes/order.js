var express = require('express')
var router = express.Router()
const orderModel = require('../models/order')
const productModel = require('../models/product')
const verifyToken = require("../lib/jwt_decode");
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


//create api for post data
router.post('/addcart', async function (req, res, next) {
    try {
        let { userName, discount, cart } = req.body
   
        //ลบจำนวนสินค้าในคลังและตรวจสอบจำนวนสินค้า
       for (let i = 0; i < cart.length; i++) {
            let productItem = await productModel.findById(cart[i].id)
            let remaining = productItem.amount - cart[i].quantity
            if (remaining < 0) {
                return res.status(400).send({
                    msg: 'not enough product',
                    success: false
                })
            }
            else {
                await productModel.updateOne(
                    { _id: productItem.id },
                    { $set: { amount: remaining } }
                )
            }
        }
             let newOrder = new orderModel({
            userName: userName,
            discount: discount,
            cart: cart
        })

        let order = await newOrder.save()
        return res.status(200).send({
            data: order,
            msg: 'product add to cart success',
            success: true
        })

    } catch (err) {
       
        return res.status(400).send({
            msg: 'product add to cart fail',
            success: false
        })
    }
})

//add cart by id
router.post('/addcartById',verifyToken , async function (req, res, next) {
    try {
        let token = req.headers.authorization;
        let { userName, discount, cart } = req.body
        let newOrder = new orderModel({
            token: token,
            userName: userName,
            discount: discount,
            cart: cart
        })

        //ลบจำนวนสินค้าในคลังและตรวจสอบจำนวนสินค้า
        for (let i = 0; i < cart.length; i++) {
            let productItem = await productModel.findById(cart[i].id)
            let remaining = productItem.amount - cart[i].amount
            if (remaining < 0) {
                return res.status(400).send({
                    msg: 'not enough product',
                    success: false
                })
            }
            else {
                await productModel.updateOne(
                    { _id: cart[i].id },
                    { $set: { amount: remaining } }
                )
            }
        }
        let order = await newOrder.save()
        return res.status(200).send({
            data: order,
            msg: 'product add to cart success',
            success: true
        })

    } catch (err) {
       
        return res.status(400).send({
            msg: 'product add to cart fail',
            success: false
        })
    }
})

//show all order
router.get('/showorder', async function (req, res, next) {
    try {
        let order = await orderModel.find() //select * from product
        let price = 0;
        let sum = 0;
        for (let i = 0; i < order.length; i++) {
            let neworder = order[i].cart
            for (let i = 0; i < neworder.length; i++) {
                sum = neworder[i].quantity * neworder[i].price
                price = price + sum
            }
            order[i].totalPrice = price;
            order[i].totalDiscount = (price * order[i].discount) / 100;
            order[i].total = price - order[i].totalDiscount;
            price = 0;
        }

        return res.status(200).send({
            data: order,
            msg: 'show order success',
            success: true
        })

    } catch (err) {
        return res.status(400).send({
            msg: 'show fail',
            success: false
        })
    }
})

//show one order
router.get('/showoneorder/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let order = await orderModel.findById(id) //select * from product
        let sum = 0;
        let price = 0;
        let cart = order.cart

        for (let i = 0; i < cart.length; i++) {
            sum = cart[i].quantity * cart[i].price;
            price = price + sum;
            console.log(price);
        }
        order.totalPrice = price;
        order.totalDiscount = (price * order.discount) / 100;
        order.total = price - order.totalDiscount;

        return res.status(200).send({
            data: order,
            msg: 'show order success',
            success: true
        })

    } catch (err) {
        return res.status(400).send({
            msg: 'show order fail',
            success: false
        })
    }
})

//search order
router.get('/ordertList', async function (req, res, next) {
    try {
        let search = req.query.search
        let order = await orderModel.find({
            $or: [
                { userName: new RegExp(search, 'i') },
                { "cart.productName": new RegExp(search, 'i')},
            ],
        });
        let price = 0;
        let sum = 0;
        for (let i = 0; i < order.length; i++) {
            let neworder = order[i].cart;
            for (let i = 0; i < neworder.length; i++) {
                sum = neworder[i].amount * neworder[i].price;
                price = price + sum;
            }
            order[i].totalPrice = price;
            order[i].totalDiscount = (price * order[i].discount) / 100;
            order[i].total = price - order[i].totalDiscount;
            price = 0;
        }
        if(order == ''){
            order = "not found"
        }

        return res.status(200).send({
            data: order,
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

//delete order
router.delete('/deleteorder/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let order = await orderModel.findById(id); 
        let cart = order.cart;

        for(let i=0; i<cart.length; i++){
            let productAmount = await productModel.findById(cart[i].id);
            let remaining = productAmount.amount + cart[i].quantity;
            await productModel.updateOne(
                { _id: cart[i].id },
                { $set: { amount: remaining } }
            );
        }
        await orderModel.deleteOne({ _id: id });

        return res.status(200).send({
            data: id,
            msg: 'delete order success',
            success: true
        })

    } catch (err) {
        console.log(err)
        return res.status(400).send({
            msg: 'delete order fail',
            success: false
        })
    }
})

router.put("/updateOrder", async function (req, res, next) {
    try {
           let order_id = req.body.order_id;
           let { discount, userName, cart } = req.body;

           let orderCheck = await orderModel.find({
            $and: [
            { "_id": order_id},
            { "cart.id": cart[0].id},
            ],
           });
    let old_Order = await orderModel.findById(order_id);
    let old_Cart = old_Order.cart;
    let setOld = '';
    let remain = '';
    let remaining = '';
    let remaining2 = '';
    let setPro = '';
    let product = '';

 if (orderCheck != '') {

      for (let i = 0; i < old_Cart.length; i++) {
        if (cart[0].id == old_Cart[i].id) {
          product = await productModel.findById(cart[0].id);
          remaining = product.amount - 1;
          if (remaining < 0) {
            return res.status(400).send({
              data: "product not enough",
              success: false,
            });
          }
          else {
            await productModel.updateOne(
              { _id: cart[0].id },
              { $set: { amount: remaining } }
            );
          }
          remain = old_Cart[i].quantity + 1;
          old_Cart[i].quantity = remain;
          setOld = 10;
        }
      }

      if (setOld == 10) {
        var order = await orderModel.updateOne(
          { _id: order_id },
          { $set: { discount: discount, userName: userName, cart: old_Cart } },
        );

        
        let newOrder = await orderModel.findById(order_id);
        return res.status(200).send({
          data: newOrder,
          msg: "Add product success",
          successs: true,
        });
  
      }

    } else {

      product = await productModel.findById(cart[0].id);
      cart[0].productName = product.productName;
      cart[0].price = product.price;
      remaining2 = product.amount - 1;

      if (remaining2 < 0) {
        return res.status(400).send({
          data: "product not enough",
          success: false,
        });
      }
      else {
        await productModel.updateOne(
          { _id: product._id },
          { $set: { amount: remaining2 } }
        );
      }

      old_Cart.push(cart[0]);

      const order2 = await orderModel.updateOne(
        { _id: order_id },
        { $set: { discount: discount, userName: userName, cart: old_Cart } },
      );

      return res.status(200).send({
        data: order2,
        msg: "Add Product success",
        successs: true,
      });
    }


    // if(order == '') {
    //   order = orders
    // }

  } 
catch (error) {
    return res.status(400).send({
      data: "get order failed",
      success: false,
    });
  }
});

module.exports = router
