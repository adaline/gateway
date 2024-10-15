import { z } from "zod";

import { AssistantRoleLiteral, SystemRoleLiteral, ToolRoleLiteral, UserRoleLiteral } from "@adaline/types";

const GoogleChatModelRoles = z.enum([SystemRoleLiteral, UserRoleLiteral, AssistantRoleLiteral, ToolRoleLiteral]);

const GoogleChatAssistantRoleLiteral = "model";
const GoogleChatToolRoleLiteral = "function";

const GoogleChatModelRolesMap = {
  system: UserRoleLiteral,
  user: UserRoleLiteral,
  assistant: GoogleChatAssistantRoleLiteral,
  tool: GoogleChatToolRoleLiteral,
} as const;

export { GoogleChatAssistantRoleLiteral, GoogleChatToolRoleLiteral, GoogleChatModelRoles, GoogleChatModelRolesMap };
