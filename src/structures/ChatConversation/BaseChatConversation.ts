import { Client } from "../..";

export class BaseChatConversation {
  readonly client: Client;
  readonly id: number;

  constructor(client: Client, id: number) {
    this.client = client;
    this.id = id;
  }
}
