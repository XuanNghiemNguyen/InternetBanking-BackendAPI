const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Account = require("../models/account")
const Transaction = require("../models/transaction")
const Debt = require("../models/debt")
const bcrypt = require("bcrypt")
const { stat } = require("fs")
const saltRounds = 10

router.post("/getAccount", async (req, res) => {
  try {
    if (req.tokenPayload.type !== "employee") {
      return res.status(400).json({
        success: false,
        message: "only employee!",
      })
    }
    const { email_or_number } = req.body
    if (isNaN(email_or_number)) {
      const _user = await User.findOne({ email: email_or_number })
      if (!_user) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy người dùng!",
        })
      }
      const _account = await Account.findOne({ number: _user.payment })
      if (!_account) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy số tài khoản!",
        })
      }
      return res.json({
        success: true,
        results: {
          name: _user.name,
          typeAccount: "Thanh toán",
        },
      })
    } else {
      const _account = await Account.findOne({ number: email_or_number })
      if (!_account) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy số tài khoản!",
        })
      }
      const _user = await User.findOne({ email: _account.owner })
      if (!_user) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy người dùng!",
        })
      }
      return res.json({
        success: true,
        results: {
          name: _user.name,
          typeAccount: _account.isPayment ? "Thanh toán" : "Tiết kiệm",
        },
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})

router.post("/deposit", async (req, res) => {
  try {
    if (req.tokenPayload.type !== "employee") {
      return res.status(400).json({
        success: false,
        message: "only employee!",
      })
    }
    const { email_or_number, amount } = req.body
    const ts_now = Date.now()
    let _account = 0
    if (isNaN(email_or_number)) {
      const _user = await User.findOne({ email: email_or_number })
      if (!_user) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy số tài khoản!",
        })
      }
      _account = await Account.findOne({ number: _user.payment })
    } else {
      _account = await Account.findOne({ number: email_or_number })
    }
    if (!_account) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy số tài khoản!",
      })
    } else {
      _account.balance = parseInt(_account.balance) + parseInt(amount)
      _account.updatedAt = ts_now
      await _account.save()
      return res.json({
        success: true,
        message: "Nạp tiền thành công!",
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})
router.post("/createUser", async (req, res) => {
  try {
    if (req.tokenPayload.type !== "employee") {
      return res.status(400).json({
        success: false,
        message: "only employee!",
      })
    }
    const { email, phone, name, password } = req.body
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
    _user.name = name
    _user.phone = phone
    _user.email = email
    const hash = bcrypt.hashSync(password, saltRounds)
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
router.post("/historySend", async (req, res) => {
  try {
    if (req.tokenPayload.type !== "employee") {
      return res.status(400).json({
        success: false,
        message: "only employee!",
      })
    }
    const { email } = req.body
    const _transactionSender = await Transaction.find({ "sender.email": email })
    if (!_transactionSender) {
      return res.status(400).json({
        success: false,
        message: "Không có giao dịch chuyển khoản!",
      })
    }
    return res.json({
      success: true,
      results: _transactionSender || [],
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})

router.post("/historyReceive", async (req, res) => {
  try {
    if (req.tokenPayload.type !== "employee") {
      return res.status(400).json({
        success: false,
        message: "only employee!",
      })
    }
    const { email } = req.body
    const _transactionReceiver = await Transaction.find({
      "receiver.email": email,
    })
    if (!_transactionReceiver) {
      return res.status(400).json({
        success: false,
        message: "Không có giao dịch nhận tiền!",
      })
    }
    return res.json({
      success: true,
      results: _transactionReceiver || [],
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})

router.post("/historyDept", async (req, res) => {
  try {
    if (req.tokenPayload.type !== "employee") {
      return res.status(400).json({
        success: false,
        message: "only employee!",
      })
    }
    const { email } = req.body
    const _user = await User.findOne({ email })
    if (!_user) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thầy tài khoản người dùng!",
      })
    }
    let history_dept = []
    const listAccounts = [_user.payment, ..._user.savings]
    if (listAccounts && listAccounts.length > 0) {
      for (let i = 0; i < listAccounts.length; i++) {
        const _data = await Debt.find({ fromAccount: listAccounts[i], state: true })
        if (_data && _data.length > 0) {
          for (let j = 0; j < _data.length; j++) {
            history_dept.push(_data[j])
          }
        }
      }
    }
    return res.json({
      success: true,
      results: history_dept || [],
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})
module.exports = router

// const _deptReceiver = await Debt.find({"receiver.email": email})
