const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')
const randtoken = require('rand-token')
var md5 = require('md5');
router.get('/deposit',async(req,res)=>{
    try{
        const {stk,amount}=req.body;
       
        const account = await Account.findOne({ number: stk, isEnabled: true })
       
      const  updateAccount=await Account.findOneAndUpdate({number:stk},{$set:{balance:account.balance+amount}})
    return res.json({
      success: true,
      results: updateAccount
      
    })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
        success: false,
        message: err.toString()
    })
    }
   
})
router.post('/createUser',async(req,res)=>{
    
    var {email,phone,name,password,pin}=req.body;
    password=md5(password);
    pin=md5(pin);
    var number;
    var check=true;
   
    
    while(check!==false){
      number = Math.floor(Math.random() * 10000000000);
      check=await Account.findOne({number:number,isEnabled: true})?true:false;
    }
    
    const account = {
      number: number,
      balance:0,
      isPayment: true,
      isEnabled: true,
      owner: email,
      updatedAt:  +new Date() ,
      createdAt: +new Date() 
    }
    
    const user = {
    type:  'normal' ,
    name: name,
    email: email,
    password: password,
    pin:pin,
    phone: phone,
    payment: number, //just one payment account
    savings: [],
    receivers:  [], 
    refreshToken: 
       randtoken.generate(80)
    ,
    isEnabled: true,
    isVerified: true,
    updatedAt:+new Date(),
    createdAt: +new Date() 
  }
  
    
    User.create(user,function(err,res){
        if (err) throw err;
       })
    Account.create(account,function(err,res){
        if (err) throw err;
       
       })
  res.json({results:"success!"})
})
module.exports = router;