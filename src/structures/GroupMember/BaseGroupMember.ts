import { Client } from "../..";
import { BaseGroup, BaseUser } from "..";

/**
 * Represents a Roblox group member ID and gives direct access to various group-related APIs.
 */
export class BaseGroupMember extends BaseUser {
  readonly client: Client;
  readonly group: BaseGroup;

  constructor(client: Client, group: BaseGroup, userId: number) {
    super(client, userId);
    this.client = client;
    this.group = group;
  }

  /**
   * Kicks the user from the group
   */
  kick() {
    return this.group.kickMember(this.id);
  }

  /**
   * Ranks the user to the specified rank
   * @param rank The rank id (1-255)
   */
  setRank(rank: number): Promise<unknown> {
    return this.group.setRank(this.id, rank);
  }

  /**
   * Ranks the user to the specified role
   * @param role The role id
   */
  setRole(role: number): Promise<unknown> {
    return this.group.setRole(this.id, role);
  }
}
