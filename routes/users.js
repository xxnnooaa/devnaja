var express = require('express');
var router = express.Router();
const userModel = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verifyToken = require('../lib/jwt_decode')


//user register 
router.post('/user', async function (req, res, next) {
  try {
    let { username, password, firstname, lastname, email } = req.body
    let hashPassword = await bcrypt.hash(password, 10)

    //create schema
    const newUser = new userModel({
      username,
      password: hashPassword,
      firstname,
      lastname,
      email
    })

    let user = await newUser.save()

    //insert data
    return res.status(200).send({
      data: user,
      msg: 'create account success',
      success: true
    })
  }
  catch (err) {
    return res.status(400).send({
      msg: 'create account fail',
      success: false
    })
  }
});

//get all data
router.get('/user',verifyToken, async function (req, res, next) {
  try {
    let user = await userModel.find() //select * from user*/
    return res.status(200).send({
      data: user,
      msg: 'get data success',
      success: true
    })
  } catch (err) {
    return res.status(400).send({
      msg: 'get data fail',
      success: false
    })
  }
})

//login
router.post('/login', async function (req, res, next) {
  try {
    let { username, password } = req.body
    let user = await userModel.findOne({
      username
    })
    if (!user) {
      return res.status(400).send({
        msg: 'login fail',
        success: false
      })
    }

    //เทียบ password
    let checkPassword = await bcrypt.compare(password, user.password)
    if(!checkPassword){
      return res.status(400).send({
        msg: 'login fail',
        success: false
      })
    }
    //gen token
    //ช่องแรกคือ ข้อมูลที่ใช้ในการเข้ารหัสม 
    let token = await jwt.sign(
      {
      firstname: user.firstname,
      lastname: user.lastname, 
      username: username
      },
    process.env.JWT_KEY)

    return res.status(200).send({
      msg: 'login success',
      success: true,
      token: token
    })
  } 
  catch (err) {
    return res.status(400).send({
      msg: 'get data fail',
      success: false
    })
  }
})

module.exports = router;
