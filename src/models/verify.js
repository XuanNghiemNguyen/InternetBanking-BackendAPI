const { Schema, model } = require('mongoose')

const User_Verify = new Schema(
  {
    email: String,
    verifiedCode: String,
    isUsed: { type: Boolean, default: false },
    createdAt: { type: Number, default: +new Date() }
  },
  {
    versionKey: false // remove field "__v"
  }
)

module.exports = model('User_Verify', User_Verify)