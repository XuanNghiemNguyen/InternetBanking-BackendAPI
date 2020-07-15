const request = require('supertest')
const app = require('../app.js')

describe('GET /', function () {
    it('home route', function (done) {
        request(app).get('/').expect('Sacombank Internet Banking API').end((err,res)=>{
            if (err) return done(err)
            return done()
        })
    })
})