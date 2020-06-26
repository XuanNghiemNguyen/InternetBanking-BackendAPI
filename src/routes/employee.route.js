const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')
const randtoken = require('rand-token')
const bcrypt = require('bcrypt');
const saltRounds = 10;
router.post('/deposit',async(req,res)=>{
    try{
        const {stk,amount}=req.body
       if(stk.indexOf('@')==-1){
        var account = await Account.findOne({ number: stk, isEnabled: true })
        if(account ==null){
          var error= "Tài khoản không tồn tại"
        }
        const  updateAccount=await Account.findOneAndUpdate({number:stk},{$set:{balance:account.balance+parseFloat(amount)}})
        } else{
          var account = await Account.findOne({ owner: stk, isEnabled: true })
          if(account ==null){
            var error= "Email không tồn tại"
          }
          const  updateAccount=await Account.findOneAndUpdate({number:account.number},{$set:{balance:+account.balance+parseFloat(amount)}})
        } 
    return res.json({
      success: true,
      results: account
      
    })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
        success: false,
        message: error
    })
    }
   
})
router.post('/createUser',async(req,res)=>{
    
    var {email,phone,name,password,pin}=req.body
    var number
    var check=true
    const isAvailable = await User.findOne({email:email})?true : false;
    if(isAvailable == true){
      res.json({success:false,
                message:"Email này đã được sử dụng, vui lòng nhập email khác!"    
      })
    }
    else{
    while(check!==false){
      number= Math.floor(Math.random() * 1000000000) + 1000000000;
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
    bcrypt.hash(password, saltRounds, (err, hashpass) => {
      bcrypt.hash(pin, saltRounds, (err, hashpin) => {
        const user = {
          type:  'normal' ,
          name: name,
          email: email,
          password: hashpass,
          pin:hashpin,
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
      });
    });
   
  res.json({results:"success!"})}
})
module.exports = router;