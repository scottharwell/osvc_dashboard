"use strict";
/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Redis {
}
Redis.store = "redisStore";
Redis.host = 'redis'; // default value
Redis.port = 6379; // default value
//public static auth_pass: string = 'XXXXX';
//public static db: number = 0;
Redis.ttl = 30;
exports.Redis = Redis;
