import { z } from "zod";

const SystemRoleLiteral = "system" as const;
const UserRoleLiteral = "user" as const;
const AssistantRoleLiteral = "assistant" as const;
const ToolRoleLiteral = "tool" as const;

const RoleLiterals = [SystemRoleLiteral, UserRoleLiteral, AssistantRoleLiteral, ToolRoleLiteral] as const;
const RoleEnum = z.enum(RoleLiterals);
type RoleEnumType = z.infer<typeof RoleEnum>;

const PartialRoleLiterals = [AssistantRoleLiteral] as const;
const PartialRoleEnum = z.enum(PartialRoleLiterals);
type PartialRoleEnumType = z.infer<typeof PartialRoleEnum>;

export {
  UserRoleLiteral,
  ToolRoleLiteral,
  SystemRoleLiteral,
  AssistantRoleLiteral,
  RoleEnum,
  RoleLiterals,
  PartialRoleEnum,
  PartialRoleLiterals,
  type RoleEnumType,
  type PartialRoleEnumType,
};
