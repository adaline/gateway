import { EMBEDDING_CONFIG, RangeConfigItem } from "@adaline/provider";

const dimensions = (maxDimensions: number) =>
  RangeConfigItem({
    param: "outputDimensionality",
    title: EMBEDDING_CONFIG.DIMENSIONS.title,
    description: EMBEDDING_CONFIG.DIMENSIONS.description,
    min: 1,
    max: maxDimensions,
    step: 1,
    default: maxDimensions,
  });

export { dimensions };
