const { Schema, model } = require('mongoose')

const UserSchema = new Schema(
  {
    type: { type: String, default: 'normal' },
    name: String,
    email: { type: String, default: 'User@domain.com' },
    phone: String,
    username: String,
    payment: Number, //just one payment account
    savings: [Number],
    password: String,
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
