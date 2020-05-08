const express = require('express')
const router = express.Router()
const Account = require('../models/account')
// const nodersa = require('node-rsa')
// const fs = require('fs')
// const path = require('path')

router.post('/info', async (req, res, next) => {
  try {
    const { number } = req.body
    const account = await Account.findOne({ number })
    if (account) {
      return res.json({
        success: true,
        data: {
          number: account.number,
          balance: account.balance      
        }
      })
    }
    return res.json({
      success: false,
      message: 'account not found!'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString()
    })
  }
})

module.exports = router

// const input = 'Nguyen Xuan Nghiem - 1612427'
// const publicKey = fs.readFileSync(
//   path.resolve(__dirname + '/../utils/publicKey.pem'),
//   'utf8'
// )
// const key = new nodersa(publicKey)
// const encrypted = key.encrypt(input, 'base64')
// const privateKey = fs.readFileSync(
//   path.resolve(__dirname + '/../utils/privateKey.pem'),
//   'utf8'
// )
// const original = new nodersa(privateKey).decrypt(encrypted, 'utf8')

