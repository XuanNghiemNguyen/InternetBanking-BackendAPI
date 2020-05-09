const createError = require('http-errors')
const CryptoJS = require('crypto-js')
const md5 = require('md5');
const ventureBank = [
  'VPBank',
  'Agribank'
]

const isPartner = (req, res, next) => {
  try {
    const partnerCode = req.headers['partner-code']
    const signature = req.headers['signature'];
    const ts = req.headers['timestamp'];
    const secretKey = process.env.SERVICE_CODE;
    const bytes = CryptoJS.AES.decrypt(partnerCode, process.env.SERVICE_CODE)
    const bankName = bytes.toString(CryptoJS.enc.Utf8)
    if (bankName && ventureBank.includes(bankName)) {
      req.bankName = bankName;
      // kiểm tra thông tin còn nguyên vẹn hay k
      var data = req.body;
      const sig = md5(ts + data.number + secretKey)
      if (ts === "" || signature === "") return next(createError(403, 'missing information. Please fill again!'));

      if (sig === signature) {
        next();
      }
      else {
        return next(createError(403, 'your info is not TRUE'))
      }

    } else {
      return next(createError(403, 'your bank is not supported!'))
    }

  } catch (error) {
    return next(createError(403, error.toString()))
  }


}


module.exports = { isPartner }
