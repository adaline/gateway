import { GatewayError } from "../errors/errors";

// const getTokens = (messages: MessageType[]): number => {
//   return messages.reduce((acc, message) => {
//     return acc + message.content.map((content) => (content.modality === "text" ? content.value : "")).join(" ").length;
//   }, 0);
// };

const isRateLimited = (error: GatewayError): boolean => {
  return error.status === 429;
};

export { isRateLimited };
