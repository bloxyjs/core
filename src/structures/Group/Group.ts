import { Client, GroupsGetGroup } from "../..";
import { BaseGroup, BaseUser } from "..";

type GroupConstructorData = GroupsGetGroup;

export class Group extends BaseGroup {
  readonly name: string;
  readonly description: string;
  readonly owner: BaseUser;
  readonly shout: string;
  readonly memberCount: number;
  readonly isPublic: boolean;
  readonly isLocked: boolean;

  /**
   * @param {Client} client The Bloxy Client
   * @param {number} groupId The group ID
   */
  constructor(client: Client, data: GroupConstructorData) {
    super(client, data.id);
    this.name = data.name;
    this.description = data.description;
    this.owner = new BaseUser(client, data.owner.userId);
    this.shout = data.shout.body;
    this.memberCount = data.memberCount;
    this.isPublic = data.publicEntryAllowed;
    this.isLocked = data.isLocked;
  }
}
