const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Transaction = require("../models/transaction")
const bcrypt = require("bcryptjs")
const saltRounds = 10
router.get("/getEmployee", async (req, res) => {
  try {
    const { type } = req.tokenPayload
    if (!type || type !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only admin!",
      })
    }
    const ret = await User.find({ type: "employee" })
    return res.json({
      success: true,
      results: ret,
    })
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
    const { type } = req.tokenPayload
    if (!type || type !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only admin!",
      })
    }
    const { data } = req.body
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Employee info is required ",
      })
    }
    let emp = await User.findOne({email: data.email }) // employee co email ton tai
    console.log(emp, data)
    if (emp && emp._id.toString() !== data._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng!",
      })
    } else {
      emp = await User.findById(data._id) // employee can sua
    }
    emp.name = data.name
    emp.email = data.email
    emp.phone = data.phone
    await emp.save()
    return res.json({
      success: true,
      results: {
        success: "true",
        results: emp,
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString(),
    })
  }
})
router.post("/lockEmployee", async (req, res) => {
  try {
    const { type } = req.tokenPayload
    if (!type || type !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only admin!",
      })
    }
    const { data } = req.body
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Employee info is required ",
      })
    }
    const emp = await User.findOne({ _id: data.id })
    if (emp) {
      emp.isEnabled = !emp.isEnabled
      await emp.save()
      return res.json({
        success: true,
        results: {
          success: "true",
          results: emp,
        },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy người dùng ",
      })
    }
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
    const { type } = req.tokenPayload
    if (!type || type !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only admin!",
      })
    }
    const { email, phone, name, password } = req.body.data
    const ts_now = Date.now()
    const isAvailable = await User.findOne({ email })
    if (isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng, vui lòng nhập email khác!",
      })
    }
    let _user = new User()
    _user.type = "employee"
    _user.name = name
    _user.phone = phone
    _user.email = email
    const hash = bcrypt.hashSync(password, saltRounds)
    _user.password = hash
    _user.payment = -1
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
    const { type } = req.tokenPayload
    if (!type || type !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only admin!",
      })
    }
    const { data } = req.body
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Employee info is required ",
      })
    }
    const newPassword = data.newPassword
    const hash = bcrypt.hashSync(newPassword, saltRounds)
    const emp = await User.findOne({ _id: data.id })
    emp.password = hash
    await emp.save()
    return res.json({
      success: true,
      results: {
        success: "true",
        results: emp,
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
router.post("/getReportTransaction", async (req, res) => {
  try {
    const { type } = req.tokenPayload
    if (!type || type !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only admin!",
      })
    }
    const { timeStart, timeEnd, bankName } = req.body
    if (!bankName || !timeStart || !timeEnd) {
      return res.status(400).json({
        success: false,
        message: "bankName, timeStart, timeEnd are required!",
      })
    }
    let transactions = []
    if (bankName === "ALL") {
      transactions = await Transaction.find({
        partner: { $ne: "SACOMBANK" },
        createdAt: {
          $gte: timeStart,
          $lt: timeEnd,
        },
      })
    } else {
      transactions = await Transaction.find({
        partner: bankName,
        createdAt: {
          $gte: timeStart,
          $lt: timeEnd,
        },
      })
    }
    return res.json({
      success: true,
      results: transactions,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: err.toString(),
    })
  }
})
module.exports = router
