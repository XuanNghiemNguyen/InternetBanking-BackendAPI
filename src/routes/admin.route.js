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
const saltRounds = 10
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
    try {
        if (req.tokenPayload.type !== "admin") {
            return res.status(400).json({
                success: false,
                message: "only admin!",
            })
        }
        const { email, phone, name, password, pin } = req.body.data
        const ts_now = Date.now()
        const isAvailable = await User.findOne({ email })
        if (isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Email này đã được sử dụng, vui lòng nhập email khác!",
            })
        }
        let number = 0
        let check = true
        while (check) {
            number = Math.floor(Math.random() * 1000000000) + 1000000000
            check = (await Account.findOne({ number })) ? true : false
        }
        let account = new Account()
        account.number = number
        account.updatedAt = ts_now
        account.createdAt = ts_now
        account.owner = email
        await account.save()

        let _user = new User()
        _user.type = 'employee'
        _user.name = name
        _user.phone = phone
        _user.email = email
        const hash = bcrypt.hashSync(password, saltRounds)
        _user.pin = pin
        _user.password = hash
        _user.payment = number
        _user.updatedAt = ts_now
        _user.createdAt = ts_now
        await _user.save()

        return res.json({
            success: true,
            message: "Tạo tài khoản thành công!",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.toString(),
        })
    }
})

router.post("/changePasswordEmployee", async (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({
          success: false,
          message: "Employee info is required ",
        });
      }
      const newPassword = data.newPassword;
      const hash = bcrypt.hashSync(newPassword, saltRounds);
      const emp = await User.findOne({ _id: data.id });
      emp.password = hash;
      await emp.save();
      return res.json({
        success: true,
        results: {
          success: "true",
          results: emp,
        },
      });
    } catch (error) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err.toString(),
      });
    }
  });
module.exports = router