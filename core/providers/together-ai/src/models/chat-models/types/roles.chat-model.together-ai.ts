import { z } from "zod";

import { AssistantRoleLiteral, SystemRoleLiteral, ToolRoleLiteral, UserRoleLiteral } from "@adaline/types";

const TogetherAIChatModelRoles = z.enum([SystemRoleLiteral, UserRoleLiteral, AssistantRoleLiteral, ToolRoleLiteral]);

const TogetherAIChatModelRolesMap = {
  system: SystemRoleLiteral,
  user: UserRoleLiteral,
  assistant: AssistantRoleLiteral,
  tool: ToolRoleLiteral,
} as const;

export { TogetherAIChatModelRoles, TogetherAIChatModelRolesMap };
