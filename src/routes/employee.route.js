const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')
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
module.exports = router;