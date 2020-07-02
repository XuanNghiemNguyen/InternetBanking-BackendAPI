const axios = require('axios')
const moment = require('moment')
const Crypto = require('crypto')
const fs = require('fs')
const NodeRSA = require('node-rsa')
const path = require('path')
const crypto = require('crypto')

const instance = axios.create({
  baseURL: 'https://internet-banking-29-service.herokuapp.com',
  timeout: 10000,
})

const getUserInfo = async (number) => {
  console.log('TEAM29 (agribank) - Quering...')
  const body = {
    partnerCode: 'rsa_partner',
    createdAt: moment.utc().toISOString(),
  }
  const hmac = Crypto.createHmac('sha256', 'team29InternetBanking')
    .update(JSON.stringify(body))
    .digest('hex')
  return await instance
    .get(
      `/partner/user/account/${number.toString()}?partnerCode=${
        body.partnerCode
      }&createdAt=${body.createdAt}&secureHash=${hmac}`
    )
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.log('err', err.response.data.message)
      return err.response.data.message
    })
    .finally(function () {
      // always executed
    })
}

const RSA_PRIVATE_KEY = fs.readFileSync(
  path.resolve(__dirname + '/../utils/security/RSA-KEY/privateKey.pem'),
  'utf8'
)
const privateKey = new NodeRSA(RSA_PRIVATE_KEY)
const HASH_SECRET = 'team29InternetBanking'

const transfer = async (number, amount) => {
  console.log('TEAM29 (agribank) - Quering...')
  const bodyWithoutSecureHash = {
    amount,
    partnerCode: 'rsa_partner',
    createdAt: moment.utc().toISOString(),
  }
  const stringifyBody = JSON.stringify(bodyWithoutSecureHash)
  const bodyWithoutSignature = {
    ...bodyWithoutSecureHash,
    secureHash: crypto
      .createHmac('sha256', HASH_SECRET)
      .update(stringifyBody)
      .digest('hex'),
  }
  const requestBody = {
    ...bodyWithoutSignature,
    signature: privateKey.sign(bodyWithoutSignature, 'base64'),
  }
  return await instance
    .patch(`/partner/account/${number}`, { ...requestBody })
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.log(err.response.data.message)
      return err.response.data.message
    })
}

module.exports = { getUserInfo, transfer }
