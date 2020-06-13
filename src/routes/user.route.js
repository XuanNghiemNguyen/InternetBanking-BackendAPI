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

router.post('/receivers/delete', async (req, res) => {
  try {
    const { userId } = req.tokenPayload
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'user not found!'
      })
    }
    const { number } = req.body
    if (!number) {
      return res.status(400).json({
        success: false,
        message: 'number is required!'
      })
    }
    if (user.receivers && user.receivers.length > 0) {
      const index = user.receivers.findIndex((item) => item.number === number)
      if (index) {
        user.receivers[index].isEnabled = false
        await user.save()
        return res.json({
          success: true,
          message: 'OK!'
        })
      }
    }
    return res.status(400).json({
      success: false,
      message: 'receiver is not existed!'
    })
  } catch (error) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})

router.post('/receivers/update', async (req, res) => {
  try {
    const { userId } = req.tokenPayload
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'user not found!'
      })
    }
    let { number, reminiscent_name, isInterbank } = req.body

    if (!number || typeof isInterbank === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'number and isInterBank are required!'
      })
    }

    if (!isInterbank) {
      const account = await Account.findOne({ number })
      if (!account) {
        return res.status(400).json({
          success: false,
          message: 'Số tài khoản không tồn tại!'
        })
      }
      const receiver = await User.findOne({ email: account.owner })
      if (!receiver) {
        return res.status(400).json({
          success: false,
          message: 'Người dùng không tồn tại!'
        })
      }
      if (!reminiscent_name) {
        reminiscent_name = receiver.name
      }
    }
    if (user.receivers && user.receivers.length > 0) {
      const index = user.receivers.findIndex((item) => item.number === number)
      if (index) {
        user.receivers.splice(index, 1)
      }
    }
    user.receivers = [
      ...user.receivers,
      {
        number,
        reminiscent_name,
        isInterbank,
        isEnabled: true,
        updatedAt: Date.now()
      }
    ]
    await user.save()
    return res.json({
      success: true,
      receivers: user.receivers
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})

router.get('/receivers', async (req, res) => {
  try {
    const { userId } = req.tokenPayload
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'user not found!'
      })
    }
    const { receivers } = user
    if (!receivers) {
      return res.status(400).json({
        success: false,
        message: 'receivers is not existed!'
      })
    }
    return res.json({
      success: true,
      receivers
    })
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
