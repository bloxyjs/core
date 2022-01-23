import { Client } from "..";
import { BaseUser, User } from "../../structures";

export class UserManager {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Returns a base user object from a user id.
   * @param userId The user's ID
   */
  get(userId: number): BaseUser {
    return new BaseUser(this.client, userId);
  }

  /**
   * Returns a user object from a user id.
   * @param userId The user's ID
   */
  async fetch(userId: number): Promise<User> {
    const data = await this.client.apis.usersAPI.getUserById({ userId });
    return new User(this.client, data);
  }
}
