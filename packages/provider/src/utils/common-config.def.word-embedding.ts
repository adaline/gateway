const DIMENSIONS = {
  type: "range",
  title: "Dimensions",
  description: "Select the number of dimensions for the word embedding.",
} as const;

const ENCODING_FORMAT = {
  type: "select",
  title: "Encoding format",
  description: "Select the encoding format for the word embedding.",
} as const;

const EMBEDDING_CONFIG = {
  DIMENSIONS,
  ENCODING_FORMAT,
};

export { EMBEDDING_CONFIG };
