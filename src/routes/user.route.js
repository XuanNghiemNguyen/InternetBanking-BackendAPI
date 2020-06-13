const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')
const bcrypt = require('bcryptjs')

router.get('/getListAccount', async (req, res) => {
  try {
    const { email } = req.query
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required!'
      })
    }
    const accounts = await Account.find({ owner: email, isEnabled: true })
    return res.json({
      success: true,
      results: accounts
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})

router.post('/changePassword', async (req, res) => {
  try {
    const { userId } = req.tokenPayload
    const { old_password, new_password } = req.body
    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'password_1 and password_2 are required!'
      })
    }
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'user not found!'
      })
    }
    const passwordMatching = await bcrypt.compare(old_password, user.password)
    if (passwordMatching) {
      user.password = await bcrypt.hash(new_password, 10)
      await user.save()
      return res.json({
        success: true,
        message: 'change password successfully!'
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu cũ không đúng!'
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})
// router.get('/info', async (req, res) => {
//   try {
//     const token = req.headers['access-token']
//     if (token) {
//       jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
//         if (err) return createError(401, err)
//         const { userId } = payload
//         let user = await User.findById(userId, {
//           refreshToken: false
//         })
//         if (user) {
//           return res.status(200).json({
//             success: true,
//             user
//           })
//         } else {
//           res.status(403).json({
//             success: false,
//             message: 'user not found!'
//           })
//         }
//       })
//     } else {
//       return createError(401, 'token is not found.')
//     }
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.toString()
//     })
//   }
// })
module.exports = router
