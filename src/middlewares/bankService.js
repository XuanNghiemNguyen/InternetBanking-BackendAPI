const createError = require('http-errors')
const CryptoJS = require('crypto-js')
const md5 = require('md5')
const ventureBank = ['VPBank', 'Agribank']

const isPartner = (req, res, next) => {
  try {
    const partnerCode = req.headers['partner-code']
    const signature = req.headers['signature']
    const ts = req.headers['timestamp']
    const content = req.body
    if (!partnerCode || !ts || !signature || !content) {
      throw createError(403, 'missing information. Try again!')
    }
    const ts_now = Date.now()
    if (ts_now > ts && ts_now - ts > 60000) {
      throw createError(
        403,
        'this requirement is not accepted! Data is out of date!'
      )
    }
    const bytes = CryptoJS.AES.decrypt(partnerCode, process.env.SERVICE_CODE)
    const bankName = bytes.toString(CryptoJS.enc.Utf8)
    const sig = md5(ts + content + process.env.SERVICE_CODE)

    if (bankName && ventureBank.includes(bankName) && sig === signature) {
      req.bankName = bankName
      next()
    } else {
      throw createError(403, 'your bank is not supported!')
    }
  } catch (error) {
    return next(createError(403, error.toString()))
  }
}

module.exports = { isPartner }
