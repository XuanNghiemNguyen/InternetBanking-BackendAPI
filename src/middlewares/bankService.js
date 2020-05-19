const createError = require('http-errors')
const CryptoJS = require('crypto-js')
const md5 = require('md5')
const NodeRSA = require('node-rsa')
const { 
  PARTNER_ENCRYPT_METHOD,
  SECURITY_FORM 
} = require('../utils/security/partner-Encrypt-Method')
const ventureBank = Object.keys(PARTNER_ENCRYPT_METHOD)
const fs = require('fs')
const path = require('path')

const isPartner = (req, res, next) => {
  try {
    const partnerCode = req.headers['partner-code'] || 'default'
    const signature = req.headers['signature'] || 'default'
    const ts = +req.headers['timestamp'] || 0
    const content = req.body || 'default'

    //1. A kiểm tra lời gọi api có phải xuất phát từ B (đã đăng ký liên kết từ trước) hay không?
    const bytes = CryptoJS.AES.decrypt(partnerCode, process.env.SERVICE_CODE)
    const bankName = bytes.toString(CryptoJS.enc.Utf8)
    if (!bankName || !ventureBank.includes(bankName)) {
      throw createError(401, 'Your bank is not supported!')
    }

    //2. A kiểm tra xem lời gọi này là mới hay là thông tin cũ đã quá hạn?
    const ts_now = Date.now()
    if (isNaN(ts) || ts_now < ts || ts_now - ts > 60000) {
      throw createError(402, 'This request has expired!')
    }

    //3. A kiểm tra xem gói tin B gửi qua là gói tin nguyên bản hay gói tin đã bị chỉnh sửa?
    const sig = md5(ts + content + process.env.SERVICE_CODE)
    if (sig !== signature) {
      throw createError(403, 'The requested content is no longer intact!')
    }

    //4. Kiểm tra và giải mã RSA
    const method = PARTNER_ENCRYPT_METHOD[bankName]
    const partnerKey = fs.readFileSync(
      path.resolve(
        __dirname + `/../utils/partner-key/${bankName}-PublicKey.pem`
      ),
      'utf8'
    )
    if (!method || !SECURITY_FORM.includes(method) || !partnerKey) {
      throw createError(405, 'Your bank has not provided any form of security!')
    }
    const { encryptedMessage } = req.body
    const privateKey = fs.readFileSync(
      path.resolve(__dirname + '/../utils/security/privateKey.pem'),
      'utf8'
    )
    const original = new NodeRSA(privateKey).decrypt(encryptedMessage, 'utf8')
    if (!original) {
      throw createError(406, 'encryptedMessage is incorrect!')
    }
    const data = JSON.parse(original)
    req.body = { ...req.body, ...data }
    req.bankName = bankName
    req.ventureInfo = { partnerKey, method }

    next()
  } catch (error) {
    return next(createError(400, error))
  }
}

module.exports = { isPartner }
