import { Client } from "..";
import { BaseGroup, Group } from "../../structures";

export class GroupManager {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Returns a base group object from a group id.
   * @param groupId The group's ID
   */
  get(groupId: number): BaseGroup {
    return new BaseGroup(this.client, groupId);
  }

  /**
   * Returns a group object from a group id.
   * @param groupId The group's ID
   */
  async fetch(groupId: number): Promise<Group> {
    const data = await this.client.apis.groupsAPI.getGroup({ groupId });
    return new Group(this.client, data);
  }
}
