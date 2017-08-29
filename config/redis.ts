/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

export class Redis {
    public static readonly store: string = "redisStore";
    public static readonly host: string = 'redis'; // default value
    public static readonly port: number = 6379; // default value
    //public static auth_pass: string = 'XXXXX';
    //public static db: number = 0;
    public static readonly ttl: number = 30;
}