import { RangeConfigItem, SelectStringConfigItem } from "@adaline/provider";

const encodingFormat = SelectStringConfigItem({
  param: "encoding_format",
  title: "Encoding format",
  description: "Select the encoding format for the word embedding.",
  default: "float",
  choices: ["float", "base64"],
});

const dimensions = (maxDimensions: number) =>
  RangeConfigItem({
    param: "dimensions",
    title: "Dimensions",
    description: "Select the number of dimensions for the word embedding.",
    min: 1,
    max: maxDimensions,
    step: 1,
    default: maxDimensions,
  });

export { encodingFormat, dimensions };
