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

router.get("/getEmployee", async (req, res) => {
    try {
        const { email } = req.tokenPayload
        // console.log(email)
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
module.exports = router