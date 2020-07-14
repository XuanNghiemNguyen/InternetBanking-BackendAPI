const WebSocket = require('ws')

const SK_PORT = 8082
let socketServer

if(!socketServer) {
  socketServer = new WebSocket.Server({
    port: SK_PORT
  })
  socketServer.on('connection', function (clientWs) {
    clientWs.on('message', function incoming(message) {
      console.log(`received: ${message}`)
    })
    clientWs.send('fetch_notification')
  })
  console.log(`WebSocket running at port ${SK_PORT}`)
}

const updateNotification = () => {
  for(let c of socketServer.clients) {
    console.log(c)
    if (c.readyState === WebSocket.OPEN) {
      c.send('fetch_notification')
    }
  }
}
module.exports = {
  socketServer,
  updateNotification
}