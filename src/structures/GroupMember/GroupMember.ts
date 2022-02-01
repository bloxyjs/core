import { Client, GroupsGetUserGroups, UsersGetUserById } from "../..";
import { BaseGroup, BaseGroupMember } from "..";

type RankDataOption = Omit<
  GroupsGetUserGroups["data"][0]["role"],
  "memberCount" | "description" | "id" | "name"
> & { rankId: number; rankName: string };
type RankData = Omit<
  GroupsGetUserGroups["data"][0]["role"],
  "memberCount" | "description"
>;

type GroupMemberConstructorData = UsersGetUserById & RankDataOption;

export class GroupMember extends BaseGroupMember {
  readonly name: string;
  readonly displayName: string;
  readonly externalAppDisplayName: string;
  readonly isBanned: boolean;
  readonly description: string;
  readonly created: Date;
  readonly group: BaseGroup;
  readonly rank: RankData;

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
    this.group = group;
    this.rank = {
      id: data.rankId,
      rank: data.rank,
      name: data.rankName
    };
  }
}
