import { z } from "zod";

import { Content, PartialContent } from "./content";
import { PartialRoleEnum, RoleEnum } from "./roles";

const Message = <
  R extends z.ZodEnum<[string, ...string[]]> = typeof RoleEnum,
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  ICM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  RTCM extends z.ZodTypeAny = z.ZodUndefined,
  PCCM extends z.ZodTypeAny = z.ZodUndefined,
  MM extends z.ZodTypeAny = z.ZodUndefined,
>(
  Role: R = RoleEnum as unknown as R,
  TextContentMetadata: TCM = z.undefined() as TCM,
  ImageContentMetadata: ICM = z.undefined() as ICM,
  ToolCallContentMetadata: CCM = z.undefined() as CCM,
  ToolResponseContentMetadata: RCM = z.undefined() as RCM,
  PdfContentMetadata: PCCM = z.undefined() as PCCM,
  ReasoningContentMetadata: z.ZodTypeAny = z.undefined() as RTCM,
  MessageMetadata: MM = z.undefined() as MM
) =>
  z.object({
    role: Role,
    content: z.array(
      Content(
        TextContentMetadata,
        ImageContentMetadata,
        ToolCallContentMetadata,
        ToolResponseContentMetadata,
        ReasoningContentMetadata,
        PdfContentMetadata
      )
    ),
    metadata: MessageMetadata,
  });
type MessageType<
  R extends z.ZodEnum<[string, ...string[]]> = typeof RoleEnum,
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  ICM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  RTCM extends z.ZodTypeAny = z.ZodUndefined,
  PCCM extends z.ZodTypeAny = z.ZodUndefined,
  MM extends z.ZodTypeAny = z.ZodUndefined,
> = z.infer<ReturnType<typeof Message<R, TCM, ICM, CCM, RCM, PCCM, RTCM, MM>>>;

const PartialMessage = <
  R extends z.ZodEnum<[string, ...string[]]> = typeof PartialRoleEnum,
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  MM extends z.ZodTypeAny = z.ZodUndefined,
  RTCM extends z.ZodTypeAny = z.ZodUndefined,
  TPCM extends z.ZodTypeAny = z.ZodUndefined,
>(
  Role: R = PartialRoleEnum as unknown as R,
  TextContentMetadata: TCM = z.undefined() as TCM,
  ToolCallContentMetadata: CCM = z.undefined() as CCM,
  ReasoningContentMetadata: z.ZodTypeAny = z.undefined() as RTCM,
  MessageMetadata: MM = z.undefined() as MM,
  ToolResponseContentMetadata: TPCM = z.undefined() as TPCM
) =>
  z.object({
    role: Role,
    partialContent: PartialContent(TextContentMetadata, ToolCallContentMetadata, ReasoningContentMetadata, ToolResponseContentMetadata),
    metadata: MessageMetadata,
  });
type PartialMessageType<
  R extends z.ZodEnum<[string, ...string[]]> = typeof PartialRoleEnum,
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  MM extends z.ZodTypeAny = z.ZodUndefined,
  TPCM extends z.ZodTypeAny = z.ZodUndefined,
> = z.infer<ReturnType<typeof PartialMessage<R, TCM, CCM, MM, TPCM>>>;

export { Message, PartialMessage, type MessageType, type PartialMessageType };
