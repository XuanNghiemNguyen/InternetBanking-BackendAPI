const express = require("express")
const router = express.Router()
const Notification = require("../models/notification")

router.get("/all", async (req, res) => {
  try {
    const { email } = req.tokenPayload
    const notification = await Notification.find({ owner: email }).sort({
      createdAt: -1,
    })
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
    const { id } = req.query
    if (!id) {
      return res.json({
        success: false,
        message: "API này cần id của thông báo!",
      })
    }
    const notification = Notification.findById(id)
    if (notification) {
      notification.isRead = true
      await notification.save()
      return res.json({
        success: true,
        result: notification,
      })
    } else {
      return res.res.status(400).json({
        success: false,
        message: "Không có thông báo này!",
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
