const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Account = require('../models/account')

const paymentAccount = {
  number: 206244699,
  balance: 500000
}
const savingAccounts = [
  {
    number: 216244691,
    balance: 100000
  },
  {
    number: 226244692,
    balance: 200000
  },
  {
    number: 231624469,
    balance: 200000
  },
  {
    number: 246244694,
    balance: 400000
  }
]

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
  },
]

router.post('/insertData', async (req, res) => {
  try {
    await Promise.all([
      userData.forEach(async (user, index) => {
        let newUser = new User({
          ...user,
          payment: paymentAccount.number + index || 0,
          savings: savingAccounts.map((i) => i.number + index) || []
        })
        await newUser.save()
        paymentAccount.number += 1
        let newPayment = new Account({
          ...paymentAccount,
          owner: user.email
        })
        await newPayment.save()
        await Promise.all([
          savingAccounts.forEach(async (item) => {
            item.number += 1
            let newSaving = new Account({
              ...item,
              owner: user.email,
              isPayment: false
            })
            await newSaving.save()
          })
        ])
      })
    ])
    setTimeout(() => {
      console.log('writing...!')
    }, 3000);
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
