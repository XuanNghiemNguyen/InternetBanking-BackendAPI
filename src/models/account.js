const { Schema, model } = require('mongoose')

const AccountSchema = new Schema(
  {
    number: Number,
    pin: Number,
    balance: Number,
    isPayment: {
      type: Boolean,
      default: true
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    owner: String, //username of user
    updatedAt: { type: Number, default: +new Date() },
    createdAt: { type: Number, default: +new Date() }
  },
  {
    versionKey: false // remove field "__v"
  }
)

module.exports = model('Account', AccountSchema)
