import { SelectBooleanConfigItem, SelectStringConfigItem } from "@adaline/provider";

const encodingFormat = SelectStringConfigItem({
  param: "encoding_format",
  title: "Encoding format",
  description: "Select the encoding format for the word embedding.",
  default: null, // If not specified (defaults to null): the embeddings are represented as lists of floating-point numbers;
  choices: ["base64"],
});

const inputType = SelectStringConfigItem({
  param: "input_type",
  title: "Input type",
  description: "Select the input type for the word embedding.",
  default: null,
  choices: ["query", "document"],
});

const truncation = SelectBooleanConfigItem({
  param: "truncation",
  title: "Truncation",
  description: "Select the truncation for the word embedding.",
  default: true,
});

export { encodingFormat, inputType, truncation };
