const createError = require('http-errors')
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
    const bankName = req.headers['x-partner-code'] || 'default'
    const signature = req.headers['x-partner-sign'] || 'default'
    const ts = +req.headers['x-timestamp'] || 0
    const content = req.body || 'default'

    //1. A kiểm tra lời gọi api có phải xuất phát từ B (đã đăng ký liên kết từ trước) hay không?
    if (!bankName || !ventureBank.includes(bankName)) {
      throw createError(401, 'Your bank is not supported!')
    }

    //2. A kiểm tra xem lời gọi này là mới hay là thông tin cũ đã quá hạn?
    const ts_now = Date.now()
    console.log(typeof (process.env.TIMEOUT*1000))
    if (isNaN(ts) || ts_now < ts || ts_now - ts > process.env.TIMEOUT * 1000) {
      throw createError(402, 'This request has expired!')
    }

    //3. A kiểm tra xem gói tin B gửi qua là gói tin nguyên bản hay gói tin đã bị chỉnh sửa?
    const sig = md5(ts.toString() + JSON.stringify(content) + process.env.SERVICE_CODE)
    if (sig !== signature) {
      throw createError(403, 'The requested content is no longer intact!')
    }

    //4. Kiểm tra và giải mã RSA
    const method = PARTNER_ENCRYPT_METHOD[bankName.toLowerCase()]
    const partnerKey = fs.readFileSync(
      path.resolve(
        __dirname + `/../utils/partner-key/${bankName.toLowerCase()}-PublicKey.pem`
      ),
      'utf8'
    )
    if (!method || !SECURITY_FORM.includes(method) || !partnerKey) {
      throw createError(405, 'Your bank has not provided any form of security!')
    }
    const { message } = content
    const privateKey = fs.readFileSync(
      path.resolve(__dirname + '/../utils/security/RSA-KEY/privateKey.pem'),
      'utf8'
    )
    const publicKey_Partner = new NodeRSA(partnerKey)
    const privateKey_Sacombank = new NodeRSA(privateKey)
    try {
      const original = privateKey_Sacombank.decrypt(message, 'utf8')
      const data = JSON.parse(original)
      req.body = { ...req.body, ...data }
    } catch (error) {
      throw createError(406, 'Message is incorrect!')
    }
    req.bankName = bankName.toLowerCase()
    req.ventureInfo = { publicKey_Partner, privateKey_Sacombank }

    next()
  } catch (error) {
    return next(createError(400, error))
  }
}

module.exports = { isPartner }
