const { Schema, model } = require('mongoose')

const User_Verify = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    jwtCode: String,
    isUsed: { type: Boolean, default: false },
    updatedAt: { type: Number, default: +new Date() }
  },
  {
    versionKey: false // remove field "__v"
  }
)

module.exports = model('User_Verify', User_Verify)
