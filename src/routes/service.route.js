const express = require('express')
const router = express.Router()
const Account = require('../models/account')
const NodeRSA = require('node-rsa')
const openpgp = require('openpgp')
const fs = require('fs')
const path = require('path')

const {
  PARTNER_ENCRYPT_METHOD,
  SECURITY_FORM
} = require('../utils/security/partner-Encrypt-Method')

router.post('/info', async (req, res) => {
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
router.post('/transfer', async (req, res) => {
  try {
    //check form of security
    const METHOD = PARTNER_ENCRYPT_METHOD[req.bankName]
    const partnerKey = fs.readFileSync(
      path.resolve(
        __dirname + `/../utils/partner-key/${req.bankName}-PublicKey.pem`
      ),
      'utf8'
    )
    if (!METHOD || !SECURITY_FORM.includes(METHOD) || !partnerKey) {
      return res.json({
        success: false,
        message: 'Your bank has not provided any form of security!'
      })
    }
    let result = {}

    //get content
    const { encryptedMessage } = req.body
    const privateKey = fs.readFileSync(
      path.resolve(__dirname + '/../utils/security/privateKey.pem'),
      'utf8'
    )
    const original = new NodeRSA(privateKey).decrypt(encryptedMessage, 'utf8')
    const data = JSON.parse(original)
    const { number, amount } = data
    if (isNaN(number) || isNaN(amount)) {
      result = {
        success: false,
        message: 'Number or Amount should be a number!'
      }
    }

    //transfer
    const account = await Account.findOne({ number })
    if (account) {
      account.balance = parseInt(amount) + parseInt(account.balance)
      account.save()
      result = {
        success: true,
        data: {
          number: account.number,
          balance: account.balance
        }
      }
    } else {
      result = {
        success: false,
        message: 'Account not found'
      }
    }

    //return results
    let encrypted = 'This is encrypt string!'
    switch (METHOD) {
      case 'PGP':
        openpgp.initWorker({ path: 'openpgp.worker.js' })
        encrypted = (await openpgp.encrypt({
          message: openpgp.message.fromText(JSON.stringify(result)),
          publicKeys: (await openpgp.key.readArmored(partnerKey)).keys
        })).data
        break
      case 'RSA':
        const resultKey = new NodeRSA(partnerKey)
        encrypted = resultKey.encrypt(result, 'base64')
        break

      default:
        break
    }
    return res.json({
      encryptedMessage: encrypted
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString()
    })
  }
})

module.exports = router
