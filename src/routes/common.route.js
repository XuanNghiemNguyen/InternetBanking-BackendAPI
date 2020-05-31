const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
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
            return res.status(400).json({
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

// router.post('/register', async (req, res, next) => {
//   try {
//     const { email, password, name } = req.body
//     if (!email || !password || !name) {
//       return res.status(400).json({
//         success: false,
//         message: 'email, password, name are required!'
//       })
//     }
//     if (!emailNumberVerify.test(email)) {
//       return res.status(400).json({
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
//       return res.status(400).json({
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
//           return res.status(400).json({
//             success: false,
//             message: err
//           })
//         }
//         const { userId } = payload
//         const user = await User.findById(userId)
//         if (!user || !user.isEnabled) {
//           return res.status(400).json({
//             success: false,
//             message: 'this account not found or was blocked!'
//           })
//         }
//         if (user.refreshToken !== refreshToken) {
//           return res.status(400).json({
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
