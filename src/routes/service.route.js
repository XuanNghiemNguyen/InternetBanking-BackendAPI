const express = require("express")
const router = express.Router()
const Account = require("../models/account")
const User = require("../models/user")
const Transaction = require("../models/transaction")
const Notification = require("../models/notification")
const { updateNotification } = require("../../socket")

const getDateString = (ts) => {
  const now = ts.toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
  })
  const time = now.split(", ")[1]
  const date = now.split(", ")[0].split("/")
  return `${time} - ngày ${date[1]}, tháng ${date[0]}, năm ${date[2]}`
}

router.post("/info", async (req, res) => {
  try {
    const { number } = req.body
    let response = {}
    const account = await Account.findOne({ number })
    if (account) {
      const user = await User.findOne({ owner: account.email })
      if (user) {
        response = {
          success: true,
          data: {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        }
      } else {
        response = {
          success: false,
          message: "Không tìm thấy người dùng!",
        }
      }
    } else {
      response = {
        success: false,
        message: "Không tìm thấy tài khoản!",
      }
    }
    const { publicKey_Partner } = req.ventureInfo
    const messageResponse = publicKey_Partner.encrypt(response, "base64")
    // return response.success ? res.json({ messageResponse }) : res.status(400).json({ messageResponse })
    return res.json({ messageResponse })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})

router.post("/transfer", async (req, res) => {
  try {
    //1. get content
    const {
      numberReceiver,
      numberSender,
      amount,
      message,
      signature,
    } = req.body
    const { privateKey_Sacombank, publicKey_Partner } = req.ventureInfo
    let response = {
      success: false,
      data: {},
    }
    if (isNaN(numberReceiver) || isNaN(numberSender) || isNaN(amount)) {
      response = {
        success: false,
        message: "Các trường yêu cầu: numberReceiver, numberSender, Amount",
      }
    } else {
      if (!signature) {
        response = {
          success: false,
          message: "Không tìm thấy chữ ký trong yêu cầu!",
        }
      } else {
        //2. verify signature with content and publicKey
        const content = {
          numberReceiver,
          numberSender,
          amount,
          message,
        }
        const isValid = publicKey_Partner.verify(
          content,
          signature,
          "utf8",
          "base64"
        )
        if (isValid) {
          //transfer
          const account = await Account.findOne({ number: numberReceiver })
          if (account) {
            account.balance = parseInt(amount) + parseInt(account.balance)
            account.save()
            let report = new Transaction()
            const ts_now = Date.now()
            report.sender = {
              email: `user@${req.bankName.toLowerCase()}.com`,
              number: numberSender,
              bank_name: req.bankName,
            }
            report.receiver = {
              email: account.owner,
              number: numberReceiver,
              bank_name: "SACOMBANK",
            }
            report.message = message
            report.createdAt = ts_now
            report.amount = amount
            report.partner = req.bankName.toUpperCase()

            await report.save()
            //Gửi thông báo
            let notify = new Notification()
            notify.owner = account.owner
            notify.createdAt = ts_now
            notify.content = `Số tài khoản SAC_${numberReceiver} vừa nhận được ${amount.toLocaleString()} đ từ tài khoản ${
              req.bankName
            }_${numberSender} vào lúc ${getDateString(
              ts_now
            )}, xem thông tin chi tiết tại mục Danh sách nhận tiền`
            await notify.save()
            updateNotification()
            response = {
              success: true,
              message: "Giao dịch thành công!",
              // message: 'Transfer successfully!'
            }
          } else {
            response = {
              success: false,
              message: "Không tìm thấy tài khoản!",
              // message: 'Account not found'
            }
          }
        } else {
          return res.status(403).json({
            success: false,
            message: "Chữ ký không đúng!",
            // message: 'Signature is incorrect!'
          })
        }
        //return results
        const messageResponse = publicKey_Partner.encrypt(response, "base64")
        const signatureResponse = privateKey_Sacombank.sign(response, "base64")
        // return response.success
        //   ? res.json({ messageResponse, signatureResponse })
        //   : res.status(400).json({ messageResponse, signatureResponse })

        return res.json({
          messageResponse,
          signatureResponse,
        })
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})

module.exports = router
