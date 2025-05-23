import { z } from "zod";

import { AssistantRoleLiteral, SystemRoleLiteral, ToolRoleLiteral, UserRoleLiteral } from "@adaline/types";

const OpenAIChatModelRoles = z.enum([SystemRoleLiteral, UserRoleLiteral, AssistantRoleLiteral, ToolRoleLiteral]);

const OpenAIChatModelRolesMap = {
  system: SystemRoleLiteral,
  user: UserRoleLiteral,
  assistant: AssistantRoleLiteral,
  tool: ToolRoleLiteral,
} as const;

export { OpenAIChatModelRoles, OpenAIChatModelRolesMap };
