const express = require('express')
const router = express.Router()
const User = require('../models/user')
const User_Verify = require('../models/verify')
const { getRandomCode } = require('../common/index')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const { isTrustlyOTP } = require('../middlewares/auth')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required!'
      })
    }
    User.findOne({ email }).then(async (user) => {
      if (user) {
        if (!user.isEnabled) {
          return res.status(403).json({
            success: false,
            message:
              'Tài khoản này đã bị khóa!'
          })
        } else {
          if (!user.isVerified) {
            return res.status(403).json({
              success: false,
              message: 'Tài khoản này chưa được xác thực!'
            })
          }
          const matched = await bcrypt.compare(password, user.password)
          if (matched) {
            const token = jwt.sign(
              { userId: user._id, type: user.type },
              process.env.JWT_KEY,
              {
                expiresIn: 60 * 60
              }
            )
            return res.json({
              success: true,
              message: 'Đăng nhập thành công!',
              token,
              user
            })
          } else {
            return res.status(403).json({
              success: false,
              message: 'Mật khẩu không chính xác!'
            })
          }
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Email này chưa đăng kí tài khoản!'
        })
      }
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err
    })
  }
})

router.post('/getOTP', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(403).json({
        success: false,
        message: 'Email is required!'
      })
    }
    const user = await User.findOne({ email })
    if (user) {
      const OTP_CODE = getRandomCode()
      const now = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh'
      })
      const time = now.split(', ')[1]
      const date = now.split(', ')[0].split('/')
      const dateString = `${time} - ngày ${date[1]}, tháng ${date[0]}, năm ${date[2]}`
      const transporter = nodemailer.createTransport({
        // config mail server
        service: 'Gmail',
        auth: {
          user: process.env.USER_NAME,
          pass: process.env.PASSWORD
        }
      })
      const mainOptions = {
        // thiết lập đối tượng, nội dung gửi mail
        from: 'Hệ thống ngân hàng điện tử SACOMBANK',
        to: email,
        subject: '[SACOMBANK INTERNET BANKING] Yêu cầu xác thực OTP',
        text: 'You recieved message from ' + req.body.email,
        html: `
            <h3>Xin chào <b> ${user.name}</b>, </h3>
            <p>Ngân hàng chúng tôi vừa nhận được yêu cung cấp mã OTP từ bạn vào lúc ${dateString}. Nếu bạn không thực hiện, vui lòng bỏ qua E-mail này!</p>
            <p>Mã OTP của bạn là: <h3>${OTP_CODE}</h3></p>
            <p>Bạn không nên chia sẻ mã này cho bất kì ai, kể cả nhân viên của ngân hàng chúng tôi.</p>
            <h5>Trân trọng cảm ơn!<h5>
            <h5>Hệ thống ngân hàng điện tử SACOMBANK<h5>
          `
      }
      transporter.sendMail(mainOptions, async (err, info) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.toString()
          })
        } else {
          const jwtCode = jwt.sign({ email }, OTP_CODE.toString(), {
            expiresIn: 600
          })
          let user_Verify = await User_Verify.findOne({ email })
          if (user_Verify) {
            user_Verify.jwtCode = jwtCode
            user_Verify.isUsed = false
            user_Verify.updatedAt = Date.now()
          } else {
            user_Verify = new User_Verify()
            user_Verify.email = email
            user_Verify.jwtCode = jwtCode
            user_Verify.updatedAt = Date.now()
          }
          await user_Verify.save()
          return res.json({
            success: true,
            message: info.response
          })
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'user not found!'
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})
router.post('/verifyOTP', isTrustlyOTP, async (req, res) => {
  try {
    const { user_Verify } = req.payload
    user_Verify.isUsed = true
    await user_Verify.save()
    return res.json({
      success: true,
      message: 'Verify OTP successfully!'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})
router.post('/forgotPassword', isTrustlyOTP, async (req, res) => {
  try {
    const { new_password } = req.body
    const { user, user_Verify } = req.payload
    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: 'new_password is required!'
      })
    }
    user.password = await bcrypt.hash(new_password, 10)
    await user.save()
    user_Verify.isUsed = true
    await user_Verify.save()
    return res.json({
      success: true,
      message: 'Change password successfully!'
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})

router.post('/refreshToken', async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body
    if (!accessToken || !refreshToken) {
      return res.json({
        success: false,
        message: 'accessToken, refreshToken are required!'
      })
    }
    jwt.verify(
      accessToken,
      process.env.JWT_KEY,
      {
        ignoreExpiration: true
      },
      async (err, payload) => {
        if (err) {
          return res.json({
            success: false,
            message: err
          })
        }
        const { userId } = payload
        const user = await User.findById(userId)
        if (!user || !user.isEnabled) {
          return res.json({
            success: false,
            message: 'this account not found or was blocked!'
          })
        }
        if (user.refreshToken !== refreshToken) {
          return res.json({
            success: false,
            message: 'refreshToken is incorrect!'
          })
        }
        const newAccessToken = jwt.sign(
          { userId: user._id, type: user.type },
          process.env.JWT_KEY,
          {
            expiresIn: 60 * 60
          }
        )
        return res.json({
          success: true,
          newAccessToken
        })
      }
    )
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.toString()
    })
  }
})

module.exports = router
