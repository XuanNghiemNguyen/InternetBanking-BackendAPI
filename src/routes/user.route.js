const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')
const Debt = require('../models/debt')
const bcrypt = require('bcryptjs')
const HHBANK_API = require('../services/hhbank')
const TEAM29_API = require('../services/team29')

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

//HHBANK
router.get('/hhbank/getInfo', async (req, res) => {
	try {
		const { number } = req.query
		if (!number) {
			return res.status(400).json({
				success: false,
				message: 'number is required!'
			})
		}
    const data = await HHBANK_API.getUserInfo(number)
		if (data && data.success) {
			return res.json({
				success: true,
				user: {
					name: data.data
				}
			})
		} else {
      return res.status(400).json({
				success: false,
				message: 'user not found'
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

//TEAM 29
router.get('/team29/getInfo', async (req, res) => {
	try {
		const { number } = req.query
		if (!number) {
			return res.status(400).json({
				success: false,
				message: 'number is required!'
			})
		}
    const data = await TEAM29_API.getUserInfo(number)
		if (data && data.message === 'OK' && data.payload) {
			return res.json({
				success: true,
				user: {
					name: data.payload.userName
				}
			})
		} else {
      return res.status(400).json({
				success: false,
				message: 'user not found'
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
