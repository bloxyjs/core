import {
  Client,
  GroupsGetGroupRoles,
  GroupsGetMembersWithRole,
  GroupsGetWallPosts,
  PageSortLimit,
  PageSortOrder
} from "../..";
import { BaseGroupMember, GroupMember, CursorPage, contextCall } from "..";

/**
 * Represents a Roblox group ID and gives direct access to various group-related APIs.
 */
export class BaseGroup {
  readonly client: Client;
  readonly groupId: number;

  /**
   * @param {Client} client The Bloxy Client
   * @param {number} groupId The group ID
   */
  constructor(client: Client, groupId: number) {
    this.client = client;
    this.groupId = groupId;
  }

  /**
   * Accepts a user's join request
   * @param user The user to accept
   */
  acceptUser(user: number): Promise<unknown> {
    return this.client.apis.groupsAPI.acceptJoinRequest({
      groupId: this.groupId,
      userId: user
    });
  }

  /**
   * Decliens a user's join request
   * @param user The user to decline
   */
  declineUser(user: number): Promise<unknown> {
    return this.client.apis.groupsAPI.declineJoinRequest({
      groupId: this.groupId,
      userId: user
    });
  }

  /**
   * Returns a base group member object
   * @param user The user id
   */
  getBaseMember(user: number): BaseGroupMember {
    return new BaseGroupMember(this.client, this, user);
  }

  /**
   * Returns a group member object
   * @param user The user id
   */
  async getMember(user: number): Promise<GroupMember> {
    const data = await this.client.apis.usersAPI.getUserById({ userId: user });
    return new GroupMember(this.client, this, data);
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
        groupId: this.groupId,
        limit: limit,
        sortOrder: sortOrder
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder },
            { groupId: this.groupId },
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
        groupId: this.groupId,
        roleId: roleId,
        limit: limit,
        sortOrder: sortOrder
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder },
            { groupId: this.groupId, roleId: roleId },
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
        groupId: this.groupId
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
      throw new Error(`Group ${this.groupId} has no role with rank ${rank}`);
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
        groupId: this.groupId,
        limit: limit,
        sortOrder: sortOrder
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder },
            { groupId: this.groupId },
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
      groupId: this.groupId,
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
      groupId: this.groupId,
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
      groupId: this.groupId,
      message: message
    });
  }
}
