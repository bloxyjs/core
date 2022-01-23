import { Client, UsersGetUserById } from "../..";
import { BaseGroup, BaseGroupMember } from "..";

type GroupMemberConstructorData = UsersGetUserById;

export class GroupMember extends BaseGroupMember {
  readonly name: string;
  readonly displayName: string;
  readonly externalAppDisplayName: string;
  readonly isBanned: boolean;
  readonly description: string;
  readonly created: Date;

  /**
   * @param {Client} client The Bloxy Client
   * @param {number} userId The user ID
   */
  constructor(
    client: Client,
    group: BaseGroup,
    data: GroupMemberConstructorData
  ) {
    super(client, group, data.id);
    this.name = data.name;
    this.displayName = data.displayName;
    this.externalAppDisplayName = data.externalAppDisplayName;
    this.isBanned = data.isBanned;
    this.description = data.description;
    this.created = new Date(data.created);
  }
}
