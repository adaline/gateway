import { isRunningInBrowser } from "../../utils/utils";
import { Logger } from "./logger.interface";

export class ConsoleLogger implements Logger {
  debug(message: string, ...params: any[]): void {
    console.debug(message, ...params);
  }

  info(message: string, ...params: any[]): void {
    console.info(message, ...params);
  }

  warn(message: string, ...params: any[]): void {
    if (isRunningInBrowser()) {
      console.warn(`%WARN: %c${message}`, "color: yellow; font-weight: bold;", "", ...params);
    } else {
      const yellow = "\x1b[33m";
      const reset = "\x1b[0m";
      console.warn(`${yellow}WARN:${reset} ${message}`, ...params);
    }
  }

  error(message: string, ...params: any[]): void {
    if (isRunningInBrowser()) {
      console.error(`%ERROR: %c${message}`, "color: lightcoral; font-weight: bold;", "", ...params);
    } else {
      const red = "\x1b[91m";
      const reset = "\x1b[0m";
      console.error(`${red}ERROR:${reset} ${message}`, ...params);
    }
  }

  critical(message: string, ...params: any[]): void {
    if (isRunningInBrowser()) {
      console.error(`%cCRITICAL: %c${message}`, "color: red; font-weight: bold;", "", ...params);
    } else {
      const redBold = "\x1b[31;1m";
      const reset = "\x1b[0m";
      console.error(`${redBold}CRITICAL:${reset} ${message}`, ...params);
    }
  }
}
