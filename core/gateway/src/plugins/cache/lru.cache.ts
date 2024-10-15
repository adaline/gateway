import { LRUCache as LRU } from "lru-cache";

import { LoggerManager } from "./../logger";
import { type Cache } from "./cache.interface";

class LRUCache<T extends object> implements Cache<T> {
  private cache: LRU<string, T>;

  constructor(maxEntries: number = 1000) {
    this.cache = new LRU<string, T>({
      max: maxEntries,
      allowStale: false,
      updateAgeOnGet: false,
    });
    const logger = LoggerManager.getLogger();
    logger?.debug(`LRUCache initialized with maxEntries: ${maxEntries}`);
  }

  async get(key: string): Promise<T | undefined> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`LRUCache.get invoked, key: ${key}`);
    return new Promise((resolve) => {
      const value = this.cache.get(key);
      logger?.debug("LRUCache.get completed, value: ", value);
      resolve(value);
    });
  }

  async set(key: string, value: T): Promise<void> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`LRUCache.set invoked, key: ${key}, value: `, value);
    return new Promise((resolve) => {
      this.cache.set(key, value);
      logger?.debug("LRUCache.set completed");
      resolve();
    });
  }

  async delete(key: string): Promise<void> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`LRUCache.delete invoked, key: ${key}`);
    return new Promise((resolve) => {
      this.cache.delete(key);
      logger?.debug("LRUCache.delete completed");
      resolve();
    });
  }

  async clear(): Promise<void> {
    const logger = LoggerManager.getLogger();
    logger?.debug("LRUCache.clear invoked");
    return new Promise((resolve) => {
      this.cache.clear();
      logger?.debug("LRUCache.clear completed");
      resolve();
    });
  }
}

export { LRUCache, type Cache };
