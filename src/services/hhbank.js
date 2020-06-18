const axios = require('axios')
const moment = require('moment')
const Crypto = require('crypto')

const error_exception = (err) => ({
	success: false,
	message: err || 'Lỗi không xác định!'
})

const signature = (body, time) => {
	const obj = {
		Body: body,
		Time: time
	}
	return Crypto.createHmac('md5', 'InternetBanking')
		.update(JSON.stringify(obj))
		.digest('hex')
}
const instance = axios.create({
	baseURL: 'https://hhbank.herokuapp.com/',
	timeout: 10000,
	headers: {
		'x-partner-code': 'sacombank'
	}
})
const activationChecking = async () => {
	console.log('HHBANK - Quering...')
	return await instance
		.get('/')
		.then(function (response) {
			// handle success
			console.clear()
			console.log('Result:', {
				status: response.status,
				data: response.data
			})
		})
		.catch(function (error) {
			console.clear()
			console.log('Error:', error)
		})
		.finally(function () {
			// always executed
		})
}
const getUserInfo = async (number) => {
	console.log('HHBANK - Quering...')
	const now = moment().unix()
	instance.defaults.headers.common['x-partner-time'] = now.toString()
	instance.defaults.headers.common['x-partner-sig'] = signature({ Number: number }, now)
	return await instance
		.post('/user-account/info', { Number: number })
		.then(function (response) {
			// handle success
			return response.data
		})
		.catch(function (error) {
			console.log('Error:', error)
		})
		.finally(function () {
			// always executed
		})
}

module.exports = { activationChecking, getUserInfo }
