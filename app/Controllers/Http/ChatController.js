"use strict";

const Conversation = use("App/Models/Conversation");
const User = use("App/Models/User");
const Message = use("App/Models/Message");
const Database = use("Database");

const { get, pick, set } = require("lodash");

class ChatController {
  async getMessageByConversation({ request, response, params }) {
    try {
      const conversationId = params.conversation;
      const data = request.only(["limit", "page", "lastMessageId"]);

      const { limit, page, lastMessageId } = data;
      const messageQuery = Message.query()
        .with("user", builder => {
          builder
            .select(["id", "username"])
            .with("profile", builder =>
              builder.select(["user_id", "avatar_url"])
            );
        })
        .where("conversation_id", conversationId);

      if (lastMessageId) {
        messageQuery.where("id", "<=", lastMessageId);
      }

      const message = await messageQuery
        .orderBy("created_at", "desc")
        .paginate(page, limit);

      response.ok(message.toJSON());
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async getUserConversation({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      const data = request.only(["limit", "page"]);

      const { limit, page } = data;

      const messages = await Message.query()
        .whereIn(
          "conversation_id",
          Database.select("conversation_id")
            .from("user_conversations")
            .where("user_id", user.id)
        )
        .whereIn("id", buider => {
          buider
            .max("id")
            .from("messages")
            .groupBy("conversation_id");
        })
        .with("user", builder => builder.select(["id", "username"]))
        .with("conversation", builder =>
          builder.with("users", builder =>
            builder
              .select(["id", "username"])
              .from("users")
              .whereNot("users.id", user.id)
              .with("profile", builder =>
                builder.select(["user_id", "avatar_url"])
              )
          )
        )
        .orderBy("id", "desc")
        .paginate(page, limit);

      const messagesJSON = messages.toJSON();
      const modifierData = messagesJSON.data.map(message => ({
        ...get(message, "conversation", {}),
        lastMessage: {
          ...pick(
            message,
            Object.keys(message).filter(path => path !== "conversation")
          )
        }
      }));

      set(messagesJSON, "data", modifierData);

      response.ok(messagesJSON);
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async findConversationByTopic({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      const data = request.only(["topic"]);

      const { topic } = data;

      const conversation = await Conversation.query()
        .where({ topic })
        .with("users", builder =>
          builder
            .select(["id", "username"])
            .from("users")
            .whereNot("users.id", user.id)
            .with("profile")
        )
        .with("messages", builder =>
          builder
            .orderBy("created_at", "desc")
            .with("user", builder => builder.select(["id", "username"]))
            .limit(1)
        )
        .fetch();

      const conversationJSON = conversation.toJSON();
      response.ok(conversationJSON);
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }
}

module.exports = ChatController;
