'use strict'

const Conversation = use("App/Models/Conversation");
const User = use("App/Models/User");
const Message = use("App/Models/Message");
const Database = use("Database");

const moment = require('moment')

const snakeCaseKeys = require("snakecase-keys");

class ChatController {
  constructor (context) {
    const { socket, request } = context;
    console.log('context', socket);
    this.socket = socket
    this.request = request
  }
  
  async onMessage (data) {
    try {
      const topic = this.socket.topic
      const userData = await this.getUserInfo(data)
      this.socket.broadcast('message', {
        ...userData,
        message: data.message,
        createdAt: moment().valueOf(),
      })

      const conversation = await this.getConversation()
      this.saveMessage(conversation, userData, data)
    } catch (error) {
      console.log('error', error)
    }
  }

  async getUserInfo(data) {
    const { userId } = data;
    const user = await User.find(userId)
    const profile = await user.profile().fetch();
    const userJSON = user.toJSON()
    let avatarUrl = null

    if(profile) {
      const profileJSON = profile.toJSON()
      avatarUrl = profileJSON.avatarUrl;
    }

    const { username } = userJSON;

    return { avatarUrl, username, userId }
  }

  async saveMessage(conversation, user, message) {
    const { userId } = user;
    const conversationId = conversation.id;
    const content = message.message

    await Message.create(snakeCaseKeys({
      userId,
      conversationId,
      content
    }))
  }

  async getConversation() {
    const topic = this.socket.topic
    const userIds = topic.replace('chat:', '').split('-').map(id => parseInt(id, 10));
    let conversation = await Conversation.findBy({ topic });

    if(!conversation) {
      conversation = await Conversation.create({
        topic,
        is_private: true
      })
      // const conversation = Database()
      await conversation.users().attach(userIds)
    }

    return conversation
  }
}

module.exports = ChatController
