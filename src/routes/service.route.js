const express = require('express')
const router = express.Router()
const Account = require('../models/account')
const NodeRSA = require('node-rsa')
const openpgp = require('openpgp')

router.post('/info', async (req, res) => {
  try {
    console.log(req.body)
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

router.post('/transfer', async (req, res) => {
  try {
    console.log(req.body)
    //get content
    const { number, amount, signatureMessage } = req.body
    const { method, partnerKey } = req.body.ventureInfo
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
      if (!signatureMessage) {
        response = {
          success: false,
          message: 'Signature Message is required!'
        }
      } else {
        // verify signatureMessage with data and publicKey
        // const data = {
        //   number,
        //   amount
        // }
        // switch (method) {
        //   case 'PGP':
        //     break
        //   case 'PGP':
        //     break
        //   default:
        //     break
        // }
        //...

        //transfer
        const account = await Account.findOne({ number })
        if (account) {
          account.balance = parseInt(amount) + parseInt(account.balance)
          account.save()
          response = {
            success: true,
            data: {
              number: account.number,
              balance: account.balance
            }
          }
        } else {
          response = {
            success: false,
            message: 'Account not found'
          }
        }
      }
    }

    //return results
    let encryptedMessageResponse = 'This is encrypted Message Response!'
    let signatureResponse = 'This is signature Response!'
    switch (method) {
      case 'PGP':
        openpgp.initWorker({ path: 'openpgp.worker.js' })
        encryptedMessageResponse = (
          await openpgp.encrypt({
            message: openpgp.message.fromText(JSON.stringify(response)),
            publicKeys: (await openpgp.key.readArmored(partnerKey)).keys
          })
        ).data
        // Thêm bước ký tên: signatureResponse
        break
      case 'RSA':
        const resultKey = new NodeRSA(partnerKey)
        encryptedMessageResponse = resultKey.encrypt(response, 'base64')
        // Thêm bước ký tên: signatureResponse
        break

      default:
        break
    }
    return res.json({
      encryptedMessageResponse
      //Thêm chữ ký nếu cần: signatureResponse
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString()
    })
  }
})

module.exports = router
