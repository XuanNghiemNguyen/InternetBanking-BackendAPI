const { Schema, model } = require('mongoose')

const DebtSchema = new Schema(
  {
    fromAccount: { type: String },
    toAccount: { type: String },
    amount: {type: Number},
    fee: {type: Number},
    msg: String,
    state : {type: Boolean, default: false},
    isEnabled : {type: Boolean, default: true},
    paidAt: { type: Number, default: +new Date() }
  },
  {
    versionKey: false, // remove field "__v"
  }
)

module.exports = model('Debt', DebtSchema)