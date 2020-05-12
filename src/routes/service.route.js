const express = require('express')
const router = express.Router()
const Account = require('../models/account')
const crypto = require('crypto');
const nodersa = require('node-rsa')
const fs = require('fs')
const path = require('path')

const publicKey = fs.readFileSync(
  path.resolve(__dirname + '/../utils/publicKey.pem'),
  'utf8'
)
const privateKey = fs.readFileSync(
  path.resolve(__dirname + '/../utils/privateKey.pem'),
  'utf8'
)

// tạo chữ kí truyền vào post man
const key = new nodersa(publicKey)
const encrypted = key.encrypt(
  {
  "number":"206244691",
  "amount":"15000"
  }, 
  'base64')
console.log(encrypted)// truyền vào postman encryptedString body


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
router.post('/transfer', async (req, res, next) => {
  try {
    console.log(req.bankName)
    const partnerKey = fs.readFileSync(
      path.resolve(__dirname + `/../utils/partner-key/${req.bankName}-PublicKey.pem`),
      'utf8'
    )
    const { encryptedString } = req.body
    const original = new nodersa(privateKey).decrypt(encryptedString, 'utf8')
    const data = JSON.parse(original)
    const {number} = data
    const account = await Account.findOne({ number })
    if (account) {
      const respondKey = new nodersa(partnerKey)
      const encrypted = respondKey.encrypt(
        {
          success: true,
          data: {
            number: account.number,
            balance: account.balance
          }
        }, 
        'base64')
      return res.json({
        encryptedString: encrypted
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
