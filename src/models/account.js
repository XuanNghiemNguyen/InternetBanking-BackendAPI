const { Schema, model } = require('mongoose')

const AccountSchema = new Schema(
  {
    number: { type: Number, unique : true, required : true, dropDups: true },
    balance: {type: Number, default: 50000},
    isPayment: {
      type: Boolean,
      default: true
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    owner: String, //email of user
    updatedAt: { type: Number, default: Date.now() },
    createdAt: { type: Number, default: Date.now() }
  },
  {
    versionKey: false // remove field "__v"
  }
)

module.exports = model('Account', AccountSchema)
