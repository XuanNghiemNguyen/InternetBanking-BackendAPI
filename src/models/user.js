const { Schema, model } = require("mongoose")
const randtoken = require("rand-token")

const UserSchema = new Schema(
  {
    type: { type: String, default: "normal" },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, dropDups: true },
    password: { type: String, required: true, minlength: 8 },
    pin: { type: String },
    phone: String,
    payment: Number, //just one payment account
    savings: [Number],
    address: String,
    receivers: { type: [], default: [] },
    avatar: String,
    refreshToken: {
      type: String,
      default: randtoken.generate(80),
    },
    isEnabled: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    updatedAt: { type: Number, default: Date.now() },
    createdAt: { type: Number, default: Date.now() },
  },
  {
    versionKey: false, // remove field "__v"
  }
)

module.exports = model("User", UserSchema)
