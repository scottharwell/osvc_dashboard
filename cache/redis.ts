/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

import RedisModule = require("redis");
import { Redis as RedisConfigs } from "../config/classes";

export class Redis{
    /**
     * Create a cache client using our redis configs file
     */
    public static getClient():RedisModule.RedisClient{
        let cacheClient = RedisModule.createClient({
            host: RedisConfigs.host,
            port: RedisConfigs.port,
            //ttl: RedisConfigs.ttl,
            retry_strategy: Redis.retryStrategy
        } as RedisModule.ClientOpts);

        cacheClient.on('error', error => {
            console.log("Redis get client error.");
        });

        return cacheClient;
    }

    private static retryStrategy(options:RedisModule.RetryStrategyOptions): any{
        if (options.error && options.error.name === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            console.log("Redis connection refused");
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            console.log("Redis retry time exhaused");
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            console.log("Redis too many connection attempts");
            return new Error('Too many connection attempts');
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
}