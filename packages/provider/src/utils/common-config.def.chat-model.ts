const TEMPERATURE = {
  type: "range",
  title: "Temperature",
  description:
    "Adjusts the model's creativity level. With a setting of 0, the model strictly picks the most probable next word. \
    For endeavors that benefit from a dash of inventiveness, consider dialing it up to 0.7 or higher, enabling the model to produce text \
    that's unexpectedly fresh.",
} as const;

const MAX_TOKENS = {
  type: "range",
  title: "Max tokens",
  description:
    "Specify the total tokens for generation, where one token approximates four English characters. \
    Setting this to 0 defaults to the model's maximum capacity.",
} as const;

const STOP = (max: number) =>
  ({
    type: "multi",
    title: "Stop sequence",
    description: `Enter up to ${max} sequences that will halt additional text output. \
      The generated text will exclude these sequences.`,
  }) as const;

const TOP_A = {
  type: "range",
  title: "Top A",
  description:
    "Considers only the top tokens that have 'sufficiently high' probabilities relative to the most likely token, \
    functioning like a dynamic Top-P. \
    A lower Top-A value narrows down the token choices based on the highest probability token, \
    while a higher Top-A value refines the filtering without necessarily impacting the creativity of the output.",
} as const;

const TOP_P = {
  type: "range",
  title: "Top P",
  description:
    "Selects a subset of likely tokens for generation, restricting choices to the top-P fraction of possibilities, \
    such as the top 10% when P=0.1. \
    This approach can limit the variety of the output. By default, it's set to 1, indicating no restriction. \
    It's advised to adjust this parameter or temperature to modulate output diversity, but not to modify both simultaneously.",
} as const;

const TOP_K = {
  type: "range",
  title: "Top K",
  description:
    "Select only from the highest K probabilities for each following word, effectively eliminating the less likely 'long tail' options.",
} as const;

const MIN_P = {
  type: "range",
  title: "Min P",
  description:
    "Specifies the minimum probability a token must have to be considered, in relation to the probability of the most likely token. \
    (This value varies based on the confidence level of the top token.) \
    For example, if Min-P is set to 0.1, only tokens with at least 1/10th the probability of the highest-ranked token will be considered.",
} as const;

const FREQUENCY_PENALTY = {
  type: "range",
  title: "Frequency penalty",
  description:
    "Minimize redundancy.\
    By assigning a penalty to frequently used tokens within the text, the likelihood of repeating identical phrases is reduced. \
    The default setting for this penalty is zero.",
} as const;

const PRESENCE_PENALTY = {
  type: "range",
  title: "Presence penalty",
  description:
    "Enhance the introduction of novel subjects by reducing the preference for tokens that have already appeared in the text, \
    thus boosting the chances of exploring fresh topics. \
    The standard setting for this is zero.",
} as const;

const SEED = {
  type: "range",
  title: "Seed",
  description:
    "When seed is fixed to a specific value, the model makes a best effort to provide the same response for repeated requests. \
    Deterministic output isn't guaranteed. \
    Also, changing the model or parameter settings, such as the temperature, \
    can cause variations in the response even when you use the same seed value. \
    By default, a random seed value is used.",
} as const;

const REPETITION_PENALTY = {
  type: "range",
  title: "Repetition penalty",
  description:
    "Reduces the likelihood of repeating tokens from the input. \
    Increasing this value makes the model less prone to repetition, but setting it too high may lead to less coherent output, \
    often resulting in run-on sentences missing smaller words. \
    The token penalty is scaled according to the original token's probability.",
} as const;

const LOG_PROBS = {
  type: "boolean",
  title: "Log probs",
  description:
    "Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned.",
} as const;

const TOP_LOG_PROBS = {
  type: "range",
  title: "Top log probs",
  description:
    "The number of most likely tokens to return at each token position, each with an associated log probability. \
    'logprobs' must be set to true if this parameter is used.",
} as const;

const ECHO = {
  type: "boolean",
  title: "Echo",
  description: "If true, the response will contain the prompt.",
} as const;

const RESPONSE_FORMAT = {
  type: "select",
  title: "Response format",
  description:
    "Choose the response format of your model. For JSON, you must include the string 'JSON' in some form within your system / user prompt.",
} as const;

const RESPONSE_FORMAT_WITH_SCHEMA = {
  type: "select",
  title: "Response format",
  description:
    "Choose the response format of your model. 'json_object' colloquially known as JSON mode, instructs the model to respond with a valid \
  JSON (must include the term 'json' in prompt). 'json_schema' colloquially known as structured outputs, allows you to specify a strict \
  response schema that the model will adhere to.",
} as const;

const RESPONSE_SCHEMA = {
  type: "object",
  title: "Response schema",
  description: "When response format is set to 'json_schema', the model will return a JSON object of the specified schema.",
} as const;

const CHAT_CONFIG = {
  TEMPERATURE,
  MAX_TOKENS,
  STOP,
  TOP_A,
  TOP_P,
  TOP_K,
  MIN_P,
  FREQUENCY_PENALTY,
  PRESENCE_PENALTY,
  REPETITION_PENALTY,
  SEED,
  LOG_PROBS,
  TOP_LOG_PROBS,
  ECHO,
  RESPONSE_FORMAT,
  RESPONSE_FORMAT_WITH_SCHEMA,
  RESPONSE_SCHEMA,
};

export { CHAT_CONFIG };
