import { z } from "zod";

const GoogleChatContentPartText = z.object({
  text: z.string().min(1),
});
type GoogleChatContentPartTextType = z.infer<typeof GoogleChatContentPartText>;

const GoogleChatContentPartInlineData = z.object({
  inline_data: z.object({
    mime_type: z.string().min(1),
    data: z.string().base64(),
  }),
});
type GoogleChatContentPartInlineDataType = z.infer<typeof GoogleChatContentPartInlineData>;

const GoogleChatContentPartFunctionCall = z.object({
  function_call: z.object({
    name: z.string().min(1),
    args: z.record(z.string().min(1)),
  }),
});
type GoogleChatContentPartFunctionCallType = z.infer<typeof GoogleChatContentPartFunctionCall>;

const GoogleChatContentPartFunctionResponse = z.object({
  function_response: z.object({
    name: z.string().min(1),
    response: z.record(z.string().min(1)),
  }),
});
type GoogleChatContentPartFunctionResponseType = z.infer<typeof GoogleChatContentPartFunctionResponse>;

const GoogleChatContent = z.object({
  role: z.enum(["user", "model", "function"]),
  parts: z.array(
    z.union([
      GoogleChatContentPartText,
      GoogleChatContentPartInlineData,
      GoogleChatContentPartFunctionCall,
      GoogleChatContentPartFunctionResponse,
    ])
  ),
});
type GoogleChatContentType = z.infer<typeof GoogleChatContent>;

const GoogleChatSystemInstruction = z.object({
  parts: z.array(GoogleChatContentPartText),
});
type GoogleChatSystemInstructionType = z.infer<typeof GoogleChatSystemInstruction>;

const GoogleChatTool = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: z.any(),
});
type GoogleChatToolType = z.infer<typeof GoogleChatTool>;

const GoogleChatToolConfig = z.object({
  function_calling_config: z.object({
    mode: z.enum(["ANY", "AUTO", "NONE"]),
    allowed_function_names: z.array(z.string()).optional(),
  }),
});
type GoogleChatToolConfigType = z.infer<typeof GoogleChatToolConfig>;

const GoogleChatGenerationConfig = z.object({
  stopSequences: z.array(z.string()).optional(),
  maxOutputTokens: z.number().optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  topK: z.number().optional(),
  presencePenalty: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  seed: z.number().optional(),
});
type GoogleChatGenerationConfigType = z.infer<typeof GoogleChatGenerationConfig>;

const GoogleChatSafetySettings = z.object({
  category: z.enum([
    "HARM_CATEGORY_HARASSMENT",
    "HARM_CATEGORY_HATE_SPEECH",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "HARM_CATEGORY_DANGEROUS_CONTENT",
    "HARM_CATEGORY_CIVIC_INTEGRITY",
  ]),
  threshold: z.enum([
    "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
    "BLOCK_LOW_AND_ABOVE",
    "BLOCK_MEDIUM_AND_ABOVE",
    "BLOCK_ONLY_HIGH",
    "BLOCK_NONE",
    "OFF",
  ]),
});
type GoogleChatSafetySettingsType = z.infer<typeof GoogleChatSafetySettings>;

const GoogleChatRequest = z.object({
  model: z.string().min(1).optional(),
  contents: z.array(GoogleChatContent),
  systemInstruction: GoogleChatSystemInstruction.optional(),
  system_instruction: GoogleChatSystemInstruction.optional(),
  generationConfig: GoogleChatGenerationConfig.optional(),
  generation_config: GoogleChatGenerationConfig.optional(),
  safetySettings: z.array(GoogleChatSafetySettings).optional(),
  safety_settings: z.array(GoogleChatSafetySettings).optional(),
  tools: z
    .object({
      function_declarations: z.array(GoogleChatTool),
    })
    .optional(),
  toolConfig: GoogleChatToolConfig.optional(),
  tool_config: GoogleChatToolConfig.optional(),
});
type GoogleChatRequestType = z.infer<typeof GoogleChatRequest>;

export {
  GoogleChatContent,
  GoogleChatContentPartFunctionCall,
  GoogleChatContentPartFunctionResponse,
  GoogleChatContentPartInlineData,
  GoogleChatContentPartText,
  GoogleChatGenerationConfig,
  GoogleChatRequest,
  GoogleChatSystemInstruction,
  GoogleChatTool,
  GoogleChatToolConfig,
  GoogleChatSafetySettings,
  type GoogleChatContentPartTextType,
  type GoogleChatContentPartFunctionCallType,
  type GoogleChatContentPartFunctionResponseType,
  type GoogleChatContentPartInlineDataType,
  type GoogleChatToolType,
  type GoogleChatToolConfigType,
  type GoogleChatGenerationConfigType,
  type GoogleChatRequestType,
  type GoogleChatContentType,
  type GoogleChatSystemInstructionType,
  type GoogleChatSafetySettingsType,
};
