const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')
const Debt = require('../models/debt')
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
// router.get('/getAllAccount', async (req, res) => {
//   try {
//     const accounts = await Account.find({  isEnabled: true })
//     return res.json({
//       success: true,
//       results: accounts
//     })
//   } catch (err) {
//     console.log(err)
//     return res.status(500).json({
//       success: false,
//       message: err.toString()
//     })
//   }
// })
// router.get('/getOtherUser', async (req, res) => {
//   try {
//     const { email } = req.query
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email is required!'
//       })
//     }
//     const accountsArray = await User.find({ isEnabled: true })
//     const accounts = accountsArray.filter(function (item) {
//       return (item.email !== email)
//     })
//     return res.json({
//       success: true,
//       results: accounts
//     })
//   } catch (err) {
//     console.log(err)
//     return res.status(500).json({
//       success: false,
//       message: err.toString()
//     })
//   }
// })
router.get('/getUserByEmail', async (req, res) => {
  try {
    const { email } = req.query
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required!'
      })
    }
    const user = await User.find({ email: email, isEnabled: true })
    console.log(user)
    return res.json({
      success: true,
      results: user
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})
router.post('/forgotPassword', async (req, res) => {
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
    const { receivers } = req.body

    if (!receivers) {
      return res.status(400).json({
        success: false,
        message: 'receivers is required!'
      })
    }
    user.receivers = receivers
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

router.post('/sendDebt', async (req, res) => {
  try {
    const { info } = req.body

    if (!info) {
      return res.status(400).json({
        success: false,
        message: 'info is required!'
      })
    }
    const debt = await Debt.insertMany(info)
    return res.json({
      success: true,
      debt: debt
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

router.get('/getOtherInfo', async (req, res) => {
  try {
    const { number } = req.query
    const account = await Account.findOne({ number })
    if (!account) {
      return res.status(400).json({
        success: false,
        message: 'account not found!'
      })
    }
    const user = await User.findOne({ email: account.owner })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'user not found!'
      })
    }
    return res.json({
      success: true,
      user: {
        number,
        name: user.name,
        bank_name: 'sacombank'
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})

module.exports = router
