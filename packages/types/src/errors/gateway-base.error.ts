const safeStringify = (obj: unknown) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return; // Skip circular reference
      }
      seen.add(value);
    }
    return value;
  });
};

const getErrorMessage = (error: unknown | undefined): string => {
  if (error == null) return "unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return safeStringify(error);
};

const GatewayBaseErrorLiteral = "GatewayBaseError" as const;
class GatewayBaseError extends Error {
  readonly name: string = GatewayBaseErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }, name?: string) {
    super(`[${name ?? GatewayBaseErrorLiteral}]: ${info}\nMessage: ${getErrorMessage(cause)}`);
    this.info = info;
    this.cause = cause;
    this.name = name ?? GatewayBaseErrorLiteral;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isGatewayBaseError(error: unknown): error is GatewayBaseError {
    return error instanceof GatewayBaseError;
  }

  toJSON(): object {
    return {
      name: this.name,
      info: this.info,
      cause: this.cause,
      message: this.message,
      stack: this.stack,
    };
  }
}

export { GatewayBaseError };
