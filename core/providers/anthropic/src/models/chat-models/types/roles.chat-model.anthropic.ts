import { z } from "zod";

import { AssistantRoleLiteral, SystemRoleLiteral, UserRoleLiteral, ToolRoleLiteral } from "@adaline/types";

const AnthropicChatModelRoles = z.enum([SystemRoleLiteral, UserRoleLiteral, AssistantRoleLiteral, ToolRoleLiteral]);

const AnthropicChatModelRolesMap = {
  system: SystemRoleLiteral,
  user: UserRoleLiteral,
  assistant: AssistantRoleLiteral,
  tool: UserRoleLiteral,
} as const;

export { AnthropicChatModelRoles, AnthropicChatModelRolesMap };
