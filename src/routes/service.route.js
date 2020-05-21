const express = require('express')
const router = express.Router()
const Account = require('../models/account')
const NodeRSA = require('node-rsa')

router.post('/info', async (req, res) => {
  try {
    const { number } = req.body
    const account = await Account.findOne({ number })
    if (account) {
      return res.json({
        success: true,
        data: {
          name: account.name,
          number: account.number,
          address: account.address
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

router.post('/transfer', async (req, res) => {
  try {
    //1. get content
    const { number, amount, signature } = req.body
    const { privateKey_Sacombank, publicKey_Partner } = req.ventureInfo
    let response = {
      success: false,
      data: {}
    }
    if (isNaN(number) || isNaN(amount)) {
      response = {
        success: false,
        message: 'Number or Amount should be a number!'
      }
    } else {
      if (!signature) {
        response = {
          success: false,
          message: 'Signature is required!'
        }
      } else {
        //2. verify signature with content and publicKey
        const content = {
          number,
          amount
        }
        const isValid = publicKey_Partner.verify(
          content,
          signature,
          'utf8',
          'base64'
        )
        if (isValid) {
          //transfer
          const account = await Account.findOne({ number })
          if (account) {
            account.balance = parseInt(amount) + parseInt(account.balance)
            account.save()
            response = {
              success: true,
              message: 'Transfer successfully!'
            }
          } else {
            response = {
              success: false,
              message: 'Account not found'
            }
          }
        } else {
          return res.status(403).json({
            success: false,
            message: 'Signature is incorrect!'
          })
        }
        //return results
        const messageResponse = publicKey_Partner.encrypt(response, 'base64')
        const signatureResponse = privateKey_Sacombank.sign(response, 'base64')
        return res.json({
          messageResponse,
          signatureResponse
        })
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString()
    })
  }
})

module.exports = router
