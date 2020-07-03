const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../models/user')
const User_Verify = require('../models/verify')

const isAuthenticated = (req, res, next) => {
  const token = req.headers['access-token']
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        if (err.message === 'jwt expired') {
          return res.status(421).json({
            code: 421,
            success: false,
            message: 'Access-token hết hạn sử dụng!',
          })
        } else {
          return res.status(421).json({
            code: 425,
            success: false,
            message: 'Access-token không hợp lệ!',
          })
        }
      }
      req.tokenPayload = payload
      const { userId } = payload
      const user = await User.findById(userId)
      if (!user || !user.isEnabled) {
        return next(createError(401, 'this account not found or was blocked!'))
      }
      req.tokenPayload.email = user.email
      next()
    })
  } else {
    return next(createError(401, 'token is not found.'))
  }
}

const isTrustlyOTP = async (req, res, next) => {
  const { email, code } = req.body
  if (!email || !code) {
    return next(createError('email, code are required!'))
  }
  let user = await User.findOne({ email })
  if (!user) {
    return next(createError('Không tìm thấy người dùng với email này!'))
  }
  let user_Verify = await User_Verify.findOne({ email, isUsed: false })
  if (!user_Verify || !user_Verify.jwtCode) {
    return next(createError('Bạn chưa lấy mã!'))
  }
  jwt.verify(user_Verify.jwtCode, code.toString(), async (err, payload) => {
    if (err) {
      switch (err.message) {
        case 'jwt expired':
          return next(createError(`Mã OTP hết hạn sử dụng!`))
        case 'invalid signature':
          return next(createError(`Mã OTP không chính xác!`))
      }
    }
    if (!payload || !payload.email || payload.email !== email) {
      return next(createError(`Mã OTP hoặc email không khớp`))
    }
    req.payload = {
      user,
      user_Verify,
    }
    user_Verify.isUsed = true
    await user_Verify.save()
    next()
  })
}

module.exports = {
  isAuthenticated,
  isTrustlyOTP,
}
