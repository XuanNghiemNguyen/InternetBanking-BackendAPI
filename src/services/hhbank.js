const axios = require('axios')
const moment = require('moment')
const openpgp = require('openpgp')
const Crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const passphrase = 'sacombank@internetbanking'

const error_exception = (err) => ({
  success: false,
  message: err || 'Lỗi không xác định!',
})

const signature = (body, time) => {
  const obj = {
    Body: body,
    Time: time,
  }
  return Crypto.createHmac('md5', 'InternetBanking')
    .update(JSON.stringify(obj))
    .digest('hex')
}
const instance = axios.create({
  baseURL: 'https://hhbank.herokuapp.com/',
  timeout: 10000,
  headers: {
    'x-partner-code': 'sacombank',
  },
})
const activationChecking = async () => {
  console.log('HHBANK - Quering...')
  return await instance
    .get('/')
    .then(function (response) {
      // handle success
      console.clear()
      console.log('Result:', {
        status: response.status,
        data: response.data,
      })
    })
    .catch(function (error) {
      console.clear()
      console.log('Error:', error)
    })
    .finally(function () {
      // always executed
    })
}
const getUserInfo = async (number) => {
  console.log('HHBANK - Quering...')
  const now = moment().unix()
  instance.defaults.headers.common['x-partner-time'] = now.toString()
  instance.defaults.headers.common['x-partner-sig'] = signature(
    { Number: number },
    now
  )
  return await instance
    .post('/user-account/info', { Number: number })
    .then(function (response) {
      // handle success
      return response.data
    })
    .catch(function (error) {
      console.log('Error:', error)
    })
    .finally(function () {
      // always executed
    })
}

const mrHauphanPublicKey = fs.readFileSync(
  path.resolve(__dirname + '/partnerKeys/hhbank-publicKey.pem'),
  'utf8'
)

const privkey = fs.readFileSync(
  path.resolve(__dirname + '/../utils/security/PGP-KEY/privateKey.pem'),
  'utf8'
)

const transfer = async (number, amount) => {
  try {
    const obj = {
      Number: number,
      Money: amount,
    }

    openpgp.initWorker({ path: 'openpgp.worker.js' })
    const now = moment().unix()
    const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
    await privKeyObj.decrypt(passphrase)
    //noi dung cua request gui di

    const options = {
      message: openpgp.message.fromText(JSON.stringify(obj)), // input as Message object
      publicKeys: (await openpgp.key.readArmored(mrHauphanPublicKey)).keys, // for encryption
      privateKeys: [privKeyObj], // for signing (optional),
    }
    const encrypted = (await openpgp.encrypt(options)).data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----' noi dung cua request gui di da dc ma hoa
    const body = {
      message: encrypted,
    }
    const obj_hash = {
      Body: body,
      Time: now,
    }

    //hash goi tin gom body va time de tao ra partner-signaure
    const hash = Crypto.createHmac('md5', 'InternetBanking')
      .update(JSON.stringify(obj_hash))
      .digest('hex')
    const response = await axios.post(
      'https://hhbank.herokuapp.com/account-number/add',
      {
        message: encrypted, //dong nay tuong ung voi dong NganHangBMessage: req.body.message - dong nay la req.body
      },
      {
        headers: {
          'x-partner-code': 'sacombank', //thay vao sacombank
          'x-partner-time': now, //time gui di
          'x-partner-sig': hash, //chuoi hash md5
        },
      }
    )

    dt = response.data //response trả về là 1 encryptedMessage
    const options_1 = {
      message: await openpgp.message.readArmored(dt), // parse armored message
      publicKeys: (await openpgp.key.readArmored(mrHauphanPublicKey)).keys, // for verification (optional)
      privateKeys: [privKeyObj], // for decryption
    }
    //decrypt goi tin
    return (await openpgp.decrypt(options_1)).data
  } catch (err) {
    console.log(err)
    return {
      success: false,
      message: err.toString(),
    }
  }
}

module.exports = { activationChecking, getUserInfo, transfer }
