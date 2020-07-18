const express = require("express")
const router = express.Router()
const Notification = require("../models/notification")

router.get("/all", async (req, res) => {
  try {
    const { email } = req.tokenPayload
    const notification = await Notification.find({ owner: email })
    if (notification) {
      return res.json({
        success: true,
        result: notification || [],
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Người dùng này chưa có thông báo nào",
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})

router.get("/read", async (req, res) => {
  try {
    const { email } = req.tokenPayload
    await Notification.updateMany({}, { $set: { isRead: true } })
    const notification = await Notification.find({ owner: email })
    if (notification) {
      return res.json({
        success: true,
        result: notification || [],
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Người dùng này chưa có thông báo nào",
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.toString(),
    })
  }
})

module.exports = router
