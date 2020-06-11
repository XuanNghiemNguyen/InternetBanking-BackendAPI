const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../models/user')
const User_Verify = require('../models/verify')

const isAuthenticated = (req, res, next) => {
  const token = req.headers['access-token']
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) return next(createError(401, err))
      req.tokenPayload = payload
      const { userId } = payload
      const user = await User.findById(userId)
      if (!user || !user.isEnabled) {
        return next(createError(401, 'this account not found or was blocked!'))
      }
      next()
    })
  } else {
    return next(createError(401, 'token is not found.'))
  }
}

const isTrustlyOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body
    if (!email || !code) {
      throw createError('email, code are required!')
    }
    let user = await User.findOne({ email })
    if (!user) {
      throw createError('user not found!')
    }
    let user_Verify = await User_Verify.findOne({ email, isUsed: false })
    if (!user_Verify || !user_Verify.jwtCode) {
      throw createError('There are no code sent!')
    }
    jwt.verify(user_Verify.jwtCode, code.toString(), async (err, payload) => {
      if (err) {
        throw createError(`This OTP is incorrect: ${err}!`)
      }
      if (!payload || !payload.email || payload.email !== email) {
        throw createError(`OTP or Email is incorrect!`)
      }
      req.payload = {
        user,
        user_Verify
      }
      next()
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  isAuthenticated,
  isTrustlyOTP
}
