import { SelectBooleanConfigItem, SelectStringConfigItem } from "@adaline/provider";

const encodingFormat = SelectStringConfigItem({
  param: "encoding_format",
  title: "Encoding format",
  description: "Select the encoding format for the word embedding.",
  default: "", // If not specified (defaults to null): the embeddings are represented as lists of floating-point numbers;
  choices: ["base64", ""],
});

const inputType = SelectStringConfigItem({
  param: "input_type",
  title: "Input type",
  description: "Select the input type for the word embedding.",
  default: "",
  choices: ["query", "document", ""],
});

const truncation = SelectBooleanConfigItem({
  param: "truncation",
  title: "Truncation",
  description: "Select the truncation for the word embedding.",
  default: true,
});

// Only supported by the flexible-dimension Voyage models (voyage-3.5,
// voyage-3.5-lite, voyage-3-large, voyage-code-3). The empty string is the
// "unset" sentinel: when left empty the param is omitted and the model's
// native default dimension is used. The string value is coerced to a number
// before it is sent to the Voyage API (see `transformConfig`).
const outputDimension = SelectStringConfigItem({
  param: "output_dimension",
  title: "Output dimension",
  description: "Number of dimensions for the returned embeddings. Leave empty to use the model's default.",
  default: "",
  choices: ["", "256", "512", "1024", "2048"],
});

// Only supported by the flexible-dimension Voyage models. Empty = omit (the
// API defaults to "float"). Quantized types (int8/uint8/binary/ubinary) are
// only valid on these models.
const outputDtype = SelectStringConfigItem({
  param: "output_dtype",
  title: "Output data type",
  description: "Data type of the returned embeddings. Leave empty to use the model's default (float).",
  default: "",
  choices: ["", "float", "int8", "uint8", "binary", "ubinary"],
});

export { encodingFormat, inputType, outputDimension, outputDtype, truncation };
