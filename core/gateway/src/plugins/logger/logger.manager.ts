import { Logger } from "./logger.interface";

class LoggerManager {
  private static logger: Logger | undefined;

  static setLogger(logger: Logger | undefined): void {
    this.logger = logger;
  }

  static getLogger(): Logger | undefined {
    return this.logger;
  }
}

export { LoggerManager };
