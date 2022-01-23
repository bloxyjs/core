import {
  AccountInformationPromotionChannels,
  AccountInformationRobloxBadges,
  Client,
  EconomyGetSelfCurrency,
  FriendsGetUserFollowers,
  FriendsGetUserFriends,
  FriendsGetUserFriendsOptions,
  ItemType,
  PageSortLimit,
  PageSortOrder,
  PresenceGetUsersPresence,
  PrivateMessagesSendMessage,
  UsersUserNameHistory
} from "../..";
import { contextCall, CursorPage } from "..";

export type BaseUserOwnedBadge = {
  badgeId: number;
  awardedDate: Date;
  awardedDateString: string;
};

export type BaseUserGroupRole = {
  groupId: number;
  roleId: number;
  rank: number;
  roleName: string;
};

/**
 * Represents a Roblox user ID and gives direct access to various user-related APIs.
 */
export class BaseUser {
  readonly client: Client;
  readonly id: number;

  /**
   * @param {Client} client The Bloxy Client
   * @param {number} userId The user ID
   */
  constructor(client: Client, userId: number) {
    this.client = client;
    this.id = userId;
  }

  /**
   * Return the username history of the user.
   * @param limit The number of followers to return
   * @param sortOrder The sort order of the followers
   * @param cursor The cursor to continue at
   */
  getUsernameHistory(
    limit: PageSortLimit = 10,
    sortOrder: PageSortOrder = "Asc",
    cursor?: string
  ): Promise<CursorPage<UsersUserNameHistory["data"][0], { userId: number }>> {
    return this.client.apis.usersAPI
      .getUserNameHistory({
        userId: this.id
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder, cursor },
            { userId: this.id },
            response,
            contextCall(
              this.client.apis.usersAPI,
              this.client.apis.usersAPI.getUserNameHistory
            )
          )
      );
  }

  /**
   * Returns the users current presence.
   */
  getPresence(): Promise<PresenceGetUsersPresence> {
    return this.client.apis.presenceAPI
      .getUsersPresences({
        userIds: [this.id]
      })
      .then((presence) => presence.userPresences[0]);
  }

  /**
   * Returns the user's friends.
   * @param limit The number of friends to return
   * @param cursor The cursor to continue at
   */
  getFriends(
    userSort?: FriendsGetUserFriendsOptions["userSort"]
  ): Promise<FriendsGetUserFriends> {
    return this.client.apis.friendsAPI.getUserFriends({
      userId: this.id,
      userSort
    });
  }

  /**
   * Returns the user's robux amount. The BaseUser must be the currently authenticated user, or else this function throws an error.
   */
  getCurrency(): Promise<EconomyGetSelfCurrency> {
    if (this.client.user?.id !== this.id) {
      throw new Error(
        "This function can only be called with the currently authenticated user"
      );
    }
    return this.client.apis.economyAPI.getSelfCurrency({ userId: this.id });
  }

  /**
   * Returns if the user has Roblox Premium or not.
   */
  hasPremium(): Promise<boolean> {
    return this.client.apis.premiumFeaturesAPI.validateUserMembership({
      userId: this.id
    });
  }

  /**
   * Returns if the user owns the specified item.
   * @param {ItemType} itemType The type of item to check
   * @param {number} itemId The ID of the item to check
   */
  ownsItem(itemType: ItemType, itemId: number): Promise<boolean> {
    return this.client.apis.inventoryAPI
      .getUserItemsByTypeAndTargetId({
        userId: this.id,
        itemType,
        itemTargetId: itemId
      })
      .then((response) => response.data.length > 0);
  }

  /**
   * Returns if the user owns the specific asset.
   * @param assetId The ID of the asset to check
   */
  ownsAsset(assetId: number): Promise<boolean> {
    return this.ownsItem("Asset", assetId);
  }

  /**
   * Returns if the user owns the specific gamepass.
   * @param gamepassId The ID of the gamepass to check
   */
  ownsGamepass(gamepassId: number): Promise<boolean> {
    return this.ownsItem("GamePass", gamepassId);
  }

  /**
   * Returns the date the specified badges got awarded to the user.
   * @param badgeIds The badge IDs to check
   */
  getBadgeAwardedDates(badgeIds: number[]): Promise<BaseUserOwnedBadge[]> {
    return this.client.apis.badgesAPI
      .getUserBadgesAwardedDates({
        userId: this.id,
        badgeIds
      })
      .then((response) =>
        response.data.map((badge) => ({
          badgeId: badge.badgeId,
          awardedDate: new Date(badge.awardedDate),
          awardedDateString: badge.awardedDate
        }))
      );
  }

  /**
   * Returns the role of the groups the user is in.
   */
  getGroupRoles(): Promise<BaseUserGroupRole[]> {
    return this.client.apis.groupsAPI
      .getUserGroups({
        userId: this.id
      })
      .then((response) =>
        response.data.map((groupMembership) => ({
          groupId: groupMembership.group.id,
          roleId: groupMembership.role.id,
          rank: groupMembership.role.rank,
          roleName: groupMembership.role.name
        }))
      );
  }

  /**
   * Returns the roblox badges the user has.
   */
  getRobloxBadges(): Promise<AccountInformationRobloxBadges> {
    return this.client.apis.accountInformationAPI.getRobloxBadges({
      userId: this.id
    });
  }

  /**
   * Returns the user's promotion channels
   */
  getPromotionChannels(): Promise<AccountInformationPromotionChannels> {
    return this.client.apis.accountInformationAPI.getUserPromotionChannels({
      userId: this.id
    });
  }

  /**
   * Returns the user's friend count
   */
  getFriendCount(): Promise<number> {
    return this.client.apis.friendsAPI
      .getUserFriendsCount({
        userId: this.id
      })
      .then((response) => response.count);
  }

  /**
   * Returns the user's follower count
   */
  getFollowerCount(): Promise<number> {
    return this.client.apis.friendsAPI
      .getUserFollowersCount({
        userId: this.id
      })
      .then((response) => response.count);
  }

  /**
   * Returns the user's following count
   */
  getFollowingCount(): Promise<number> {
    return this.client.apis.friendsAPI
      .getUserFollowingCount({
        userId: this.id
      })
      .then((response) => response.count);
  }

  /**
   * Returns the user's followers
   * @param limit The number of followers to return
   * @param sortOrder The sort order of the followers
   * @param cursor The cursor to continue at
   */
  getFollowers(
    limit: PageSortLimit = 10,
    sortOrder: PageSortOrder = "Asc",
    cursor?: string
  ): Promise<
    CursorPage<FriendsGetUserFollowers["data"][0], { userId: number }>
  > {
    return this.client.apis.friendsAPI
      .getUserFollowers({
        userId: this.id,
        limit,
        sortOrder,
        cursor
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder, cursor },
            { userId: this.id },
            response,
            contextCall(
              this.client.apis.friendsAPI,
              this.client.apis.friendsAPI.getUserFollowers
            )
          )
      );
  }

  /**
   * Returns the user's followings
   * @param limit The number of followings to return
   * @param sortOrder The sort order of the followings
   * @param cursor The cursor to continue at
   */
  getFollowings(
    limit: PageSortLimit = 10,
    sortOrder: PageSortOrder = "Asc",
    cursor?: string
  ): Promise<
    CursorPage<FriendsGetUserFollowers["data"][0], { userId: number }>
  > {
    return this.client.apis.friendsAPI
      .getUserFollowing({
        userId: this.id,
        limit,
        sortOrder,
        cursor
      })
      .then(
        (response) =>
          new CursorPage(
            { limit, sortOrder, cursor },
            { userId: this.id },
            response,
            contextCall(
              this.client.apis.friendsAPI,
              this.client.apis.friendsAPI.getUserFollowers
            )
          )
      );
  }

  /**
   * Sends a private message to the user
   * @param recipientId The user ID to send the message to
   * @param subject The subject of the message
   * @param body The body of the message
   */
  sendMessage(
    recipientId: number,
    subject: string,
    body: string
  ): Promise<PrivateMessagesSendMessage> {
    return this.client.apis.privateMessagesAPI.sendMessage({
      userId: this.id,
      recipientId,
      subject,
      body
    });
  }
}
