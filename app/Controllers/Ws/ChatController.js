'use strict'

class ChatController {
  constructor (context) {
    const { socket, request } = context;
    console.log('context', socket);
    this.socket = socket
    this.request = request
  }
  
  onMessage (message) {
    // console.log(this.request)
    console.log(message)
    // this.socket.broadcastToAll('message', message)
  }
}

module.exports = ChatController
