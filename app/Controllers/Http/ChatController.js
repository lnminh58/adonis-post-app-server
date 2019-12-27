"use strict";

const Conversation = use("App/Models/Conversation");
const User = use("App/Models/User");
const Message = use("App/Models/Message");
const Database = use("Database");

class ChatController {
  async getMessageByConversation({ request, response, params }) {
    try {
      const conversationId = params.conversation;
      const data = request.only(["limit", "page"]);

      const { limit, page } = data;

      const message = await Message.query()
        .with("user", builder => {
          builder.select(["id", "username"]).with("profile");
        })
        .where("conversation_id", conversationId)
        .orderBy("created_at", "desc")
        .paginate(page, limit);

      response.ok(message.toJSON());
    } catch (error) {
      console.log("error", error);
      const { status } = error;
      response.status(status).send(error);
    }
  }
}

module.exports = ChatController;
