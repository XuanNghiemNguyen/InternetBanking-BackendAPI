const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const createError = require('http-errors')

router.get('/info', async (req, res) => {
  try {
    const token = req.headers['access-token']
    if (token) {
      jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
        if (err) return createError(401, err)
        const { userId } = payload
        let user = await User.findById(userId, {
          refreshToken: false
        })
        if (user) {
          return res.status(200).json({
            success: true,
            user
          })
        } else {
          res.status(403).json({
            success: false,
            message: 'user not found!'
          })
        }
      })
    } else {
      return createError(401, 'token is not found.')
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})
module.exports = router
