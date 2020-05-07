const { Schema, model } = require('mongoose')

const AccountSchema = new Schema(
  {
    type: { type: String, default: 'normal' },
    phone: String,
    name: String,
    paymentAccount: { //just one payment account
      number: Number,
      balance: Number
    },
    savingAccount: {
      type: Array
    },
    password: String,
    email: { type: String, default: 'Account@domain.com' },
    address: String,
    avatar: String,
    isEnabled: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    updatedAt: { type: Number, default: +new Date() },
    createdAt: { type: Number, default: +new Date() }
  },
  {
    versionKey: false // remove field "__v"
  }
)

module.exports = model('Account', AccountSchema)
