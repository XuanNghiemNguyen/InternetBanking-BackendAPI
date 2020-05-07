const createError = require('http-errors')
const CryptoJS = require('crypto-js')

const ventureBank = [
  'VPBank',
  'Agribank'
]

const isPartner = (req, res, next) => {
  try {
    const partnerCode = req.headers['partner-code']
    const bytes = CryptoJS.AES.decrypt(partnerCode, process.env.SERVICE_CODE)
    const bankName = bytes.toString(CryptoJS.enc.Utf8)
    if (bankName && ventureBank.includes(bankName)) {
      req.bankName = bankName
      next()
    } else {
      return next(createError(403, 'your bank is not supported!'))
    }
  } catch (error) {
    return next(createError(403, error.toString()))
  }
}

module.exports = { isPartner }
