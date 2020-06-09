const express = require('express')
const router = express.Router()
const User = require('../models/user')
const User_Verify = require('../models/verify')
const { getRandomCode } = require('../common/index')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const moment = require('moment')
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.json({
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
              'This account have been locked, please contact to administrator!'
          })
        } else {
          if (!user.isVerified) {
            return res.status(403).json({
              success: false,
              message: 'This account is not verified!'
            })
          }
          const matched = await bcrypt.compare(password, user.password)
          if (matched) {
            const token = jwt.sign(
              { userId: user._id, type: user.type },
              process.env.JWT_KEY,
              {
                expiresIn: '24h'
              }
            )
            return res.json({
              success: true,
              message: 'Login successfully!',
              token,
              user
            })
          } else {
            return res.json({
              success: false,
              message: 'Password is incorrect!'
            })
          }
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'user is not existed!'
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

router.get('/getOTPChangingPassword', async (req, res) => {
  const now = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  const time = now.split(', ')[1]
  const date = now.split(', ')[0].split('/')
  const dateString = `${time} - ngày ${date[1]}, tháng ${date[0]}, năm ${date[2]}`
  try {
    const { email } = req.query
    if (!email) {
      return res.json({
        success: false,
        message: 'Email is required!'
      })
    }
    const user = await User.findOne({ email })
    if (user) {
      const OTP_CODE = getRandomCode()
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
        subject: '[SACOMBANK INTERNET BANKING] Yêu cầu đổi mật khẩu',
        text: 'You recieved message from ' + req.body.email,
        html: `
            <h3>Xin chào <b> ${user.name}</b>, </h3>
            <p>Ngân hàng chúng tôi vừa nhận được yêu cầu đổi mật khẩu từ bạn vào lúc ${dateString}. Nếu bạn không thực hiện, vui lòng bỏ qua E-mail này!</p>
            <p>Mã OTP của bạn là: <h3>${OTP_CODE}</h3></p>
            <p>Bạn không nên chia sẻ mã này cho bất kì ai, kể cả nhân viên của ngân hàng chúng tôi.</p>
            <h5>Trân trọng cảm ơn!<h5>
            <h5>Hệ thống ngân hàng điện tử SACOMBANK<h5>
          `
      }
      transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.toString()
          })
        } else {
          User_Verify.updateMany(
            { email, isUsed: false },
            { $set: { isUsed: true } }
          )
          const newVerify = new User_Verify()
          newVerify.email = email
          newVerify.verifiedCode = OTP_CODE
          newVerify.save()
          return res.json({
            success: true,
            message: info.response
          })
        }
      })
      setTimeout(() => {
        console.log('sending...!')
      }, 2000)
    } else {
      return res.json({
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

router.post('/verifyCode', async (req, res) => {
  try {
    const { email, code } = req.body
    if (!code || !email) {
      return res.json({
        success: false,
        message: 'code is required!'
      })
    }
    const verify = await User_Verify.findOne({ email, isUsed: false })
    const user = await User.findOne({ email })
    if (verify && user) {
      if (verify.verifiedCode == code) {
        verify.isUsed = true
        await verify.save()
        const token = jwt.sign(
          { userId: user._id, type: user.type },
          process.env.JWT_KEY,
          {
            expiresIn: '5m'
          }
        )
        return res.json({
          success: true,
          token
        })
      } else {
        return res.json({
          success: false,
          message: 'This code is incorrect!'
        })
      }
    } else {
      return res.json({
        success: false,
        message: 'There are no codes sent!'
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.toString()
    })
  }
})

// router.post('/register', async (req, res, next) => {
//   try {
//     const { email, password, name } = req.body
//     if (!email || !password || !name) {
//       return res.json({
//         success: false,
//         message: 'email, password, name are required!'
//       })
//     }
//     if (!emailNumberVerify.test(email)) {
//       return res.json({
//         success: false,
//         message: 'invalid email number!'
//       })
//     }
//     const userExisted = await User.findOne({ email })
//     if (userExisted) {
//       if (!userExisted.isEnabled) {
//         return res.status(403).json({
//           success: false,
//           message:
//             'This account was existed and have been locked, please contact to administrator!'
//         })
//       } else {
//         if (!userExisted.isVerified) {
//           return res.status(403).json({
//             success: false,
//             message: 'This account was existed and have not been verified yet!'
//           })
//         } else {
//           return res.status(403).json({
//             success: false,
//             message:
//               'This email number has already used, please type another number!'
//           })
//         }
//       }
//     } else {
//       const newUser = new User()
//       newUser.email = email
//       newUser.name = name.trim()
//       let decodedPassword = CryptoJS.AES.decrypt(
//         password,
//         PASSWORD_KEY
//       ).toString(CryptoJS.enc.Utf8)
//       newUser.password = await bcrypt.hash(decodedPassword, 10)
//       await newUser.save()

//       return res.json({
//         success: true,
//         message: 'create account successfully!',
//         type: 'normal',
//         profile: newUser
//       })
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.toString()
//     })
//   }
// })

// router.post('/refreshToken', async (req, res) => {
//   try {
//     const { accessToken, refreshToken } = req.body
//     if (!accessToken || !refreshToken) {
//       return res.json({
//         success: false,
//         message: 'accessToken, refreshToken are required!'
//       })
//     }
//     jwt.verify(
//       accessToken,
//       JWT_KEY,
//       {
//         ignoreExpiration: true
//       },
//       async (err, payload) => {
//         if (err) {
//           return res.json({
//             success: false,
//             message: err
//           })
//         }
//         const { userId } = payload
//         const user = await User.findById(userId)
//         if (!user || !user.isEnabled) {
//           return res.json({
//             success: false,
//             message: 'this account not found or was blocked!'
//           })
//         }
//         if (user.refreshToken !== refreshToken) {
//           return res.json({
//             success: false,
//             message: 'refreshToken is incorrect!'
//           })
//         }
//         const newAccessToken = jwt.sign(
//           { userId: user._id, type: user.type },
//           JWT_KEY,
//           {
//             expiresIn: '24h'
//           }
//         )
//         return res.json({
//           success: true,
//           newAccessToken
//         })
//       }
//     )
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.toString()
//     })
//   }
// })

module.exports = router
