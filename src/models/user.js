const { Schema, model } = require('mongoose')

const Account = new Schema({
  number: Number,
  balance: Number
})

const UserSchema = new Schema(
  {
    type: { type: String, default: 'normal' },
    phone: String,
    name: String,
    payment: {
      //just one payment account
      type: Account,
      default: null
    },
    saving: {
      type: [Account],
      default: []
    },
    password: String,
    email: { type: String, default: 'User@domain.com' },
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

module.exports = model('User', UserSchema)
