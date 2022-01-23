import * as ClientSocket from "../ClientSocket";
import { BaseUser, BaseChatConversation } from "../../../../structures";

export default function handleChatNotifications(
  socket: ClientSocket.Socket,
  messageType: string,
  message: any
): void {
  switch (messageType) {
    case "participanttyping":
      socket.emit(
        message.IsTyping ? "chatUserTyping" : "chatUserTypingStopped",
        {
          user: new BaseUser(socket.client, message.UserId),
          conversation: new BaseChatConversation(
            socket.client,
            message.ConversationId
          )
        }
      );
      break;
    case "newmessage":
      socket.emit("chatMessage", {
        conversation: new BaseChatConversation(
          socket.client,
          message.ConversationId
        )
      });
      break;
    case "newmessagebyself":
      socket.emit("chatMessageSent", {
        conversation: new BaseChatConversation(
          socket.client,
          message.ConversationId
        )
      });
      break;
    case "newconversation":
      socket.emit("chatConversationAdded", {
        conversation: new BaseChatConversation(
          socket.client,
          message.ConversationId
        )
      });
      break;
    case "conversationremoved":
      socket.emit("chatConversationRemoved", {
        conversation: new BaseChatConversation(
          socket.client,
          message.ConversationId
        )
      });
      break;
    case "participantadded":
      socket.emit("chatMemberAdded", {
        conversation: new BaseChatConversation(
          socket.client,
          message.ConversationId
        )
      });
      break;
    case "participantlefet":
      socket.emit("chatMemberLeft", {
        conversation: new BaseChatConversation(
          socket.client,
          message.ConversationId
        )
      });
      break;
    default:
      break;
  }
}
