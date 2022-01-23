import { BaseUser } from "../structures";

export interface ChatMessage {
  readonly id: number;
  readonly sender: BaseUser;
  readonly sentAt: Date;
  readonly type: string;
  readonly decorators: string[];
  readonly content: string;
}

export interface ChatMessageSent {
  readonly content: string;
  readonly filtered: boolean;
  readonly id: number;
  readonly sentAt: Date;
  readonly type: string;
  readonly result: string;
  readonly status: string;
}
