const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Account = require("../models/account")
const Transaction = require("../models/transaction")
const Notification = require("../models/notification")
const Debt = require("../models/debt")
const bcrypt = require("bcryptjs")
const HHBANK_API = require("../services/hhbank")
const TEAM29_API = require("../services/agribank")
const { isTrustlyOTP } = require("../middlewares/auth")
const { updateNotification } = require("../../socket")
const { getRandomCode, getRandomPassword } = require("../common/index")
router.get("/getEmployee", async (req, res) => {
    try {
        const { email } = req.tokenPayload
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required!",
            })
        }
        const accounts = await User.find({ email: email })
        if (accounts && accounts[0].type === 'admin') {
            const ret = await User.find({ type: 'employee' })
            return res.json({
                success: true,
                results: ret,
            })
        }
        else {
            return res.json({
                success: false,
                results: {
                    success: 'false',
                    message: 'Người dùng không có quyền truy cập'
                },
            })
        }

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: err.toString(),
        })
    }
})
router.post("/editEmployee", async (req, res) => {
    try {
        const { data } = req.body
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Employee info is required '
            })
        }
        const emp = await User.findOne({ _id: data._id })
        emp.name = data.name
        emp.email = data.email
        emp.phone = data.phone
        await emp.save()
        return res.json({
            success: true,
            results: {
                success: 'true',
                results: emp
            },
        })
    } catch (error) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: err.toString(),
        })
    }
})
router.post("/lockEmployee", async (req, res) => {
    try {
        const { data } = req.body
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Employee info is required '
            })
        }
        const emp = await User.findOne({ _id: data.id })
        if (emp.isEnabled === true) {
            emp.isEnabled = false;
        }
        else {
            emp.isEnabled = true;
        }


        // emp.name = data.name
        // emp.email = data.email
        // emp.phone = data.phone
        await emp.save()
        return res.json({
            success: true,
            results: {
                success: 'true',
                results: emp
            },
        })
    } catch (error) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: err.toString(),
        })
    }
})

router.post("/addEmployee", async (req, res) => {
    var { email, phone, name, password, pin } = req.body.data
  var number
  var check = true
  const isAvailable = (await User.findOne({ email: email })) ? true : false
  if (isAvailable == true) {
    res.json({
      success: false,
      message: "Email này đã được sử dụng, vui lòng nhập email khác!",
    })
  } else {
    while (check !== false) {
      number = Math.floor(Math.random() * 1000000000) + 1000000000
      check = (await Account.findOne({ number: number, isEnabled: true }))
        ? true
        : false
    }

    const account = {
      number: number,
      balance: 0,
      isPayment: true,
      isEnabled: true,
      owner: email,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }
    bcrypt.hash(password, saltRounds, (err, hashpass) => {
      bcrypt.hash(pin, saltRounds, (err, hashpin) => {
        const user = {
          type: "normal",
          name: name,
          email: email,
          password: hashpass,
          pin: hashpin,
          phone: phone,
          payment: number, //just one payment account
          savings: [],
          receivers: [],
          refreshToken: randtoken.generate(80),
          isEnabled: true,
          isVerified: true,
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }

        User.create(user, function (err, res) {
          if (err) throw err
        })
        Account.create(account, function (err, res) {
          if (err) throw err
        })
      })
    })

    res.json({ results: "success!" })
  }
})
module.exports = router