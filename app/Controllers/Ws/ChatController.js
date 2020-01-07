"use strict";

const Conversation = use("App/Models/Conversation");
const User = use("App/Models/User");
const Message = use("App/Models/Message");
const Database = use("Database");

const moment = require("moment");

const snakeCaseKeys = require("snakecase-keys");
const Ws = use("Ws");

class ChatController {
  constructor(context) {
    const { socket, request } = context;
    console.log("context", socket);
    this.socket = socket;
    this.request = request;
  }

  async onMessage(data) {
    try {
      const topic = this.socket.topic;
      const userData = await this.getUserInfo(data);
      this.socket.broadcast("message", {
        ...userData,
        message: data.message,
        createdAt: moment().valueOf()
      });

      const conversation = await this.getConversation();
      const message = await this.saveMessage(conversation, userData, data);

      this.emitConversationToUsers(conversation, message);
    } catch (error) {
      console.log("error", error);
    }
  }

  async getUserInfo(data) {
    const { userId } = data;
    const user = await User.find(userId);
    const profile = await user.profile().fetch();
    const userJSON = user.toJSON();
    let avatarUrl = null;

    if (profile) {
      const profileJSON = profile.toJSON();
      avatarUrl = profileJSON.avatarUrl;
    }

    const { username } = userJSON;

    return { avatarUrl, username, userId };
  }

  async saveMessage(conversation, user, message) {
    const { userId } = user;
    const conversationId = conversation.id;
    const content = message.message;

    const savedMessage = await Message.create(
      snakeCaseKeys({
        userId,
        conversationId,
        content
      })
    );

    return savedMessage;
  }

  async getConversation() {
    const topic = this.socket.topic;
    const userIds = topic
      .replace("chat:", "")
      .split("-")
      .map(id => parseInt(id, 10));
    let conversation = await Conversation.findBy({ topic });

    if (!conversation) {
      conversation = await Conversation.create({
        topic,
        is_private: true
      });
      // const conversation = Database()
      await conversation.users().attach(userIds);
    }

    return conversation;
  }

  async emitConversationToUsers(conversation, message) {
    const users = await conversation
      .users()
      .select(["id", "username"])
      .with("profile", builder => builder.select(["user_id", "avatar_url"]))
      .fetch();

    const fromUser = await message
      .user()
      .select(["id", "username"])
      .with("profile", builder => builder.select(["user_id", "avatar_url"]))
      .fetch();

    const conversationJSON = conversation.toJSON();
    const messageJSON = message.toJSON();
    const usersJSON = users.toJSON();
    const fromUserJSON = fromUser.toJSON();

    const lastMessage = {
      ...messageJSON,
      user: fromUserJSON
    };

    const updatedConversation = {
      ...conversationJSON,
      lastMessage
    };

    console.log(updatedConversation);

    usersJSON.forEach(user => {
      const conversationTopic = Ws.getChannel("conversation:*").topic(
        `conversation:${user.id}`
      );
      if (conversationTopic) {
        conversationTopic.broadcast("message", {
          ...updatedConversation,
          users: usersJSON.filter(userItem => user.id !== userItem.id)
        });
      }
    });
  }
}

module.exports = ChatController;
