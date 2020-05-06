const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const dotenv = require('dotenv')
const cors = require('cors')
require('express-async-errors')

//Init Express App
const app = express()
dotenv.config()
const apiPort = process.env.PORT || '3000'
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Some route
app.get('/', (req, res) => {
  res.send('Internet Banking API')
})

app.use('/static', express.static(path.join(__dirname, 'public')))

//handle error
app.use(function (err, req, res, next) {
  return res.status(err.status).json(err)
})

// NOT FOUND API
app.use((req, res, next) => {
  res.status(404).send('NOT FOUND')
})

//Init apiServer
app.listen(apiPort, () => console.log(`Listening at http://localhost:${apiPort}`))

module.exports = app
