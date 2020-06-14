const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')

const randAccount = (email) => ({
  number: Math.floor(Math.random() * 1000000000) + 1000000000,
  balance: Math.floor(Math.random() * 1000) * 10000,
  owner: email
})

const userData = [
  {
    type: 'normal',
    email: 'xuanghjem@gmail.com',
    phone: '+84985002876',
    name: 'Nguyễn Xuân Nghiêm',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  },
  {
    type: 'normal',
    email: 'cuongphung09111998@gmail.com',
    phone: '+84985002876',
    name: 'Phùng Trí Cường',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  },
  {
    type: 'normal',
    email: 'ngotrannguyen@gmail.com',
    phone: '+84985002876',
    name: 'Ngô Trần Nguyễn',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  },
  {
    type: 'normal',
    email: 'user1@gmail.com',
    phone: '+84985002876',
    name: 'Nguyễn Văn A',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  },
  {
    type: 'normal',
    email: 'user2@gmail.com',
    phone: '+84985002876',
    name: 'Nguyễn Văn B',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  },
  {
    type: 'normal',
    email: 'user3@gmail.com',
    phone: '+84985002876',
    name: 'Nguyễn Văn C',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  },
  {
    type: 'normal',
    email: 'user4@gmail.com',
    phone: '+84985002876',
    name: 'Nguyễn Văn D',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  },
  {
    type: 'normal',
    email: 'user5@gmail.com',
    phone: '+84985002876',
    name: 'Nguyễn Văn E',
    password: '$2a$10$Sd8St7kVtmCM4RO397i5c.PdcBjlJnYWixPOkKb2BwmC5lCVi3KZm',
    pin: '$2a$10$0dXGGKrJvA.WgmZanXzOxu8GCobJ6PYUeYhHN6neTEjrV7Oh.e5wm'
  }
]

router.post('/insertData', async (req, res) => {
  try {
    await Promise.all([
      userData.forEach(async (user, index) => {
        const paymentAcc = randAccount(user.email)
        const savingsAcc = Array(5).fill(2).map(k => randAccount(user.email))
        let newUser = new User({
          ...user,
          isVerified: true,
          payment: paymentAcc.number,
          savings: savingsAcc.map(i => i.number)
        })
        await newUser.save()
        const newPayment = new Account(paymentAcc)
        await newPayment.save()
        await Promise.all([
          savingsAcc.forEach(async (item) => {
            let newSaving = new Account({
              ...item,
              isPayment: false
            })
            await newSaving.save()
          })
        ])
      })
    ])
    setTimeout(() => {
      console.log('writing...!')
    }, 3000)
    return res.json({
      success: true,
      message: 'OK'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString()
    })
  }
})

module.exports = router
