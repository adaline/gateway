import { ParamsType } from "@adaline/provider";
import { MessageType, UserRoleLiteral } from "@adaline/types";

import { BaseChatModel } from "./base-chat-model.google";
import { GoogleChatContentType, GoogleChatSystemInstructionType } from "./types";

class BaseChatModelGemini1 extends BaseChatModel {
  transformMessages(messages: MessageType[]): ParamsType {
    const transformedMessages = super.transformMessages(messages) as {
      contents: GoogleChatContentType[];
      systemInstruction?: GoogleChatSystemInstructionType;
    };

    if (transformedMessages.systemInstruction) {
      const systemUserMessage = {
        role: this.modelSchema.roles[UserRoleLiteral] as GoogleChatContentType["role"],
        parts: transformedMessages.systemInstruction.parts,
      };
      transformedMessages.contents.unshift(systemUserMessage);
      delete transformedMessages.systemInstruction;
    }

    return transformedMessages;
  }
}

export { BaseChatModelGemini1 };
