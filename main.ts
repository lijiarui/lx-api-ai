const apiai = require('apiai')

const app = apiai("c223b2fd6ce64df993e85311f2eaf394")

const request = app.textRequest('帮忙订下今天到广州的机票', {
    sessionId: '1234567899'
})

request.on('response', function(response) {
    console.log(response)
})

request.on('error', function(error) {
    console.log(error)
})

request.end()
