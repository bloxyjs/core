import {
  Client,
  GroupsGetGroupRoles,
  GroupsGetMembersWithRole,
  GroupsGetWallPosts,
  PageSortLimit,
  PageSortOrder
} from "../..";
import { BaseGroupMember, GroupMember, CursorPage, contextCall } from "..";

class MemberManager {
  readonly client: Client;
  readonly group: BaseGroup;

  constructor(client: Client, group: BaseGroup) {
    this.client = client;
    this.group = group;
  }

  /**
   * Returns a base group member object from a user id.
   * @param userId The user's ID
   */
  get(userId: number): BaseGroupMember {
    return new BaseGroupMember(this.client, this.group, userId);
  }

  /**
   * Returns a group member object from a user id.
   * @param userId The user's ID
   */
  async fetch(userId: number): Promise<GroupMember> {
    const userData = await this.client.apis.usersAPI.getUserById({ userId });
    const userGroups = await this.client.apis.groupsAPI.getUserGroups({
      userId
    });
    const groupData = userGroups.data.find(
      (group) => group.group.id === this.group.id
    )?.role || {
      id: -1,
      name: "Guest",
      description: "Non-group member",
      memberCount: -1,
      rank: 0
    };
    return new GroupMember(this.client, this.group, {
      ...userData,
      rankId: groupData.id,
      rankName: groupData.name,
      rank: groupData.rank
    });
  }
}

/**
 * Represents a Roblox group ID and gives direct access to various group-related APIs.
 */
export class BaseGroup {
  readonly client: Client;
  readonly id: number;
  readonly members: MemberManager;

  /**
   * @param {Client} client The Bloxy Client
   * @param {number} groupId The group ID
   */
  constructor(client: Client, groupId: number) {
    this.client = client;
    this.id = groupId;
    this.members = new MemberManager(client, this);
  }

  /**
   * Accepts a user's join request
   * @param user The user to accept
   */
  acceptUser(user: number): Promise<unknown> {
    return this.client.apis.groupsAPI.acceptJoinRequest({
      groupId: this.id,
      userId: user
    });
  }

  /**
   * Decliens a user's join request
   * @param user The user to decline
   */
  declineUser(user: number): Promise<unknown> {
    return this.client.apis.groupsAPI.declineJoinRequest({
      groupId: this.id,
      userId: user
    });
  }

  /**
   * Get all group members
   * @param limit The number of members to return
   * @param sortOrder The sort order of the members
   */
  getMembers(
    limit: PageSortLimit = 10,
    sortOrder: PageSortOrder = "Asc"
  ): Promise<
    CursorPage<GroupsGetMembersWithRole["data"][0], { groupId: number }>
  > {
    return this.client.apis.groupsAPI
      .getMembers({
        groupId: this.id,
        limit: limit,
        sortOrder: sortOrder
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder },
            { groupId: this.id },
            response,
            contextCall(
              this.client.apis.groupsAPI,
              this.client.apis.groupsAPI.getMembers
            )
          )
      );
  }

  /**
   * Get all group members in a role
   * @param rankId The role id to get members of
   * @param limit The number of members to return
   * @param sortOrder The sort order of the members
   */
  async getMembersWithRank(
    rankId: number,
    limit: PageSortLimit = 10,
    sortOrder: PageSortOrder = "Asc"
  ): Promise<
    CursorPage<
      GroupsGetMembersWithRole["data"][0],
      { groupId: number; roleId: number }
    >
  > {
    const targetRole = await this.getRoleFromRank(rankId);
    return this.getMembersWithRole(targetRole, limit, sortOrder);
  }

  /**
   * Get all group members in a role
   * @param roleId The role id to get members of
   * @param limit The number of members to return
   * @param sortOrder The sort order of the members
   */
  getMembersWithRole(
    roleId: number,
    limit: PageSortLimit = 10,
    sortOrder: PageSortOrder = "Asc"
  ): Promise<
    CursorPage<
      GroupsGetMembersWithRole["data"][0],
      { groupId: number; roleId: number }
    >
  > {
    return this.client.apis.groupsAPI
      .getMembersWithRole({
        groupId: this.id,
        roleId: roleId,
        limit: limit,
        sortOrder: sortOrder
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder },
            { groupId: this.id, roleId: roleId },
            response,
            contextCall(
              this.client.apis.groupsAPI,
              this.client.apis.groupsAPI.getMembersWithRole
            )
          )
      );
  }

  /**
   * Returns the group's roles
   */
  getRoles(): Promise<GroupsGetGroupRoles["roles"]> {
    return this.client.apis.groupsAPI
      .getGroupRoles({
        groupId: this.id
      })
      .then((response) => response.roles);
  }

  /**
   * Returns the roles id from the rank
   * @param rank The rank to get the id of
   */
  async getRoleFromRank(rank: number): Promise<number> {
    const roles = await this.getRoles();
    const foundRole = roles.find((role) => role.rank === rank);
    if (!foundRole) {
      throw new Error(`Group ${this.id} has no role with rank ${rank}`);
    }
    return foundRole.id;
  }

  /**
   * Returns the group's wall posts
   * @param limit The number of wall posts to return
   * @param sortOrder The sort order of the wall posts
   */
  getWallPosts(
    limit: PageSortLimit = 10,
    sortOrder: PageSortOrder = "Asc"
  ): Promise<CursorPage<GroupsGetWallPosts["data"][0], { groupId: number }>> {
    return this.client.apis.groupsAPI
      .getWallPosts({
        groupId: this.id,
        limit: limit,
        sortOrder: sortOrder
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder },
            { groupId: this.id },
            response,
            contextCall(
              this.client.apis.groupsAPI,
              this.client.apis.groupsAPI.getWallPosts
            )
          )
      );
  }

  /**
   * Kicks the user from the group
   * @param user The user to kick
   */
  kickMember(user: number): Promise<unknown> {
    return this.client.apis.groupsAPI.kickMember({
      groupId: this.id,
      userId: user
    });
  }

  /**
   * Ranks a user in the group to the specified rank
   *
   * This is not to be confused with `setRole`, as this uses the rank (1-255), not the role id.
   * @param user The user to rank
   * @param rank The rank id (1-255)
   */
  async setRank(user: number, rank: number) {
    const targetRole = await this.getRoleFromRank(rank);
    return this.setRole(user, targetRole);
  }

  /**
   * Ranks a user in the group to the specified role
   *
   * This is not to be confused with `setRank`, as this uses the role id, not the rank (1-255).
   * @param user The user to rank
   * @param roleId The role id
   */
  setRole(user: number, roleId: number) {
    return this.client.apis.groupsAPI.updateMember({
      groupId: this.id,
      userId: user,
      roleId: roleId
    });
  }

  /**
   * Shouts a new message in the group
   * @param message The message to shout
   */
  setShout(message: string) {
    return this.client.apis.groupsAPI.updateGroupStatus({
      groupId: this.id,
      message: message
    });
  }
}
