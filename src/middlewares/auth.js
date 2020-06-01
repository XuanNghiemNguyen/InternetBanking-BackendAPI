const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../models/user')

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

module.exports = {
  isAuthenticated
}