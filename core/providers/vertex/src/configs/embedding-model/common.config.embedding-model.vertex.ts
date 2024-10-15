import { EMBEDDING_CONFIG, RangeConfigItem, SelectBooleanConfigItem } from "@adaline/provider";

const dimensions = (maxDimensions: number) =>
  RangeConfigItem({
    param: "output_dimensionality",
    title: EMBEDDING_CONFIG.DIMENSIONS.title,
    description: EMBEDDING_CONFIG.DIMENSIONS.description,
    min: 1,
    max: maxDimensions,
    step: 1,
    default: maxDimensions,
  });

const autoTruncate = SelectBooleanConfigItem({
  param: "auto_truncate",
  title: "Auto truncate",
  description:
    "When set to true, input text will be truncated. \
    When set to false, an error is returned if the input text is longer than the maximum length supported by the model.",
  default: true,
});

export { dimensions, autoTruncate };
