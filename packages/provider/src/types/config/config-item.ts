import { z } from "zod";

import { MultiStringConfigItemDef, MultiStringConfigItemTypeLiteral } from "./multi-string-config-item";
import { ObjectSchemaConfigItemDef, ObjectSchemaConfigItemTypeLiteral } from "./object-schema-config-item";
import { PairedSelectConfigItemDef, PairedSelectConfigItemTypeLiteral } from "./paired-select-config-item";
import { RangeConfigItemDef, RangeConfigItemTypeLiteral } from "./range-config-item";
import { SelectBooleanConfigItemDef, SelectBooleanConfigItemTypeLiteral } from "./select-boolean-config-item";
import { SelectStringConfigItemDef, SelectStringConfigItemTypeLiteral } from "./select-string-config-item";
import { StringConfigItemDef, StringConfigItemTypeLiteral } from "./string-config-item";

const ConfigItemLiterals = [
  RangeConfigItemTypeLiteral,
  MultiStringConfigItemTypeLiteral,
  SelectStringConfigItemTypeLiteral,
  ObjectSchemaConfigItemTypeLiteral,
  SelectBooleanConfigItemTypeLiteral,
  PairedSelectConfigItemTypeLiteral,
  StringConfigItemTypeLiteral,
] as const;
const ConfigItemEnum = z.enum(ConfigItemLiterals);
type ConfigItemEnumType = z.infer<typeof ConfigItemEnum>;

const ConfigItemDef = z.discriminatedUnion("type", [
  RangeConfigItemDef,
  MultiStringConfigItemDef,
  SelectStringConfigItemDef,
  SelectBooleanConfigItemDef,
  ObjectSchemaConfigItemDef,
  PairedSelectConfigItemDef,
  StringConfigItemDef,
]);
type ConfigItemDefType = z.infer<typeof ConfigItemDef>;

export { ConfigItemDef, ConfigItemEnum, ConfigItemLiterals, type ConfigItemDefType, type ConfigItemEnumType };
