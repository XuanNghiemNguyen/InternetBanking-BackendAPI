const { Schema, model } = require('mongoose')

const Notification = new Schema(
  {
    content: { type: String, default: 'Thông báo người dùng' },
    owner: { type: String, default: 'user@domain.com' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Number, default: Date.now() },
  },
  {
    versionKey: false, // remove field "__v"
  }
)

module.exports = model('Notification', Notification)
