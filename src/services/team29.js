const axios = require('axios')
const moment = require('moment')
const Crypto = require('crypto')

const instance = axios.create({
	baseURL: 'https://internet-banking-29-service.herokuapp.com',
	timeout: 10000
})
const getUserInfo = async (number) => {
	console.log('TEAM29 - Quering...')
	const body = {
		partnerCode: 'rsa_partner',
		createdAt: moment.utc().toISOString()
	}
	const hmac = Crypto.createHmac('sha256', 'team29InternetBanking')
		.update(JSON.stringify(body))
		.digest('hex')
	return await instance
		.get(
			`/partner/user/account/${number.toString()}?partnerCode=${
				body.partnerCode
			}&createdAt=${body.createdAt}&secureHash=${hmac}`
		)
		.then((response) => {
			console.log('data:', response.data)
			return response.data
		})
		.catch((err) => {
			console.log('err', err.response.data.message)
			return err.response.data.message
		})
		.finally(function () {
			// always executed
		})
}

module.exports = { getUserInfo }
