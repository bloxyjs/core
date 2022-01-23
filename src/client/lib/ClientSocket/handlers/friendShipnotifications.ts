import * as ClientSocket from "../ClientSocket";
import { BaseUser } from "../../../../structures";

export default function handleFriendshipNotifications(
  socket: ClientSocket.Socket,
  messageType: string,
  message: any
): void {
  switch (messageType) {
    case "friendshipdestroyed":
      socket.emit("friendLost", {
        user: new BaseUser(
          socket.client,
          [message.UserId1, message.UserId2].filter(
            (id) => id !== socket.client.user!.id
          )[0]!
        )
      });
      break;
    case "friendshiprequested":
      socket.emit("friendRequest", {
        user: new BaseUser(socket.client, message.UserId1)
      });
      break;
    case "friendshipcreated":
      socket.emit("friendAdded", {
        user: new BaseUser(socket.client, message.UserId1)
      });
      break;
    default:
      break;
  }
}
