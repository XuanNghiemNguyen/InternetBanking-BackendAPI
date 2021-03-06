const { Schema, model } = require('mongoose')

const Transaction = new Schema(
	{
		sender: {}, // {email, number,}
		receiver: {},
		amount: { type: Number },
		message: { type: String, default: '' },
		success: { type: Boolean, default: true },
		isSenderPaidFee: { type: Boolean, default: true },
		partner: { type: String, default: "SACOMBANK" },
		createdAt: { type: Number, default: Date.now() }
	},
	{
		versionKey: false // remove field "__v"
	}
)

module.exports = model('Transaction', Transaction)