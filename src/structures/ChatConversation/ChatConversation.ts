import { BaseChatConversation, BaseUser } from "..";
import { Client } from "../..";

type ChatConversationConstructorData = {
  id: number;
  title: string;
  initiator: {
    type: "User" | string;
    targetId: number;
    name: string | null;
    displayName: string | null;
  };
  hasUnreadMessages: boolean;
  participants: {
    type: "User" | string;
    targetId: number;
    name: string;
    displayName: string;
  }[];
  conversationType: "OneToOneConversation" | string;
  conversationTitle: {
    titleForViewer: string;
    isDefaultTitle: boolean;
  };
  lastUpdated: string;
  conversationUniverse: number | null;
};

export class ChatConversation extends BaseChatConversation {
  readonly title: string;
  readonly initiator: BaseUser;
  readonly hasUnreadMessages: boolean;
  readonly members: BaseUser[];
  readonly type: string;
  readonly conversationTitle: {
    forViewer: string;
    isDefaultTitle: boolean;
  };
  readonly lastUpdated: Date;
  readonly universe: any;

  constructor(client: Client, data: ChatConversationConstructorData) {
    super(client, data.id);

    this.title = data.title;
    this.initiator = new BaseUser(client, data.initiator.targetId);
    this.hasUnreadMessages = data.hasUnreadMessages;
    this.members = data.participants.map(
      (participant) => new BaseUser(client, participant.targetId)
    );
    this.type = data.conversationType;
    this.conversationTitle = {
      forViewer: data.conversationTitle.titleForViewer,
      isDefaultTitle: data.conversationTitle.isDefaultTitle
    };
    this.lastUpdated = new Date(data.lastUpdated);
  }
}
