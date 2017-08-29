/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

import Promise = require("promise");
import Request = require("request");
import Redis = require("redis");
import CacheManager = require("../cache/redis");
import { Redis as RedisConfigs, OSvC as OSvCConfigs } from "../config/classes";

/**
 * Model for an OSvC Analtyics Report
 */
export class AnalyticsReport {
    private _id: number;
    private _lookupName?: string;
    private _createdTime?: Date;
    private _updatedTime?: Date;
    private _name: string;
    private _columnNames: string[];
    private _rows: AnalyticsReportRow[];
    private _count: number;
    private _links?: any;

    private static redisClient:Redis.RedisClient;

    public get id(): number {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get columnNames(): string[] {
        return this._columnNames;
    }

    public set columnNames(value: string[]) {
        this._columnNames = value;
    }

    public get rows(): AnalyticsReportRow[] {
        return this._rows;
    }

    public set rows(value: AnalyticsReportRow[]) {
        this._rows = value;
    }

    public get count(): number {
        return this._count;
    }

    public set count(value: number) {
        this._count = value;
    }

    constructor(id: number) {
        this._id = id;
    }

    public clearData() {
        this._columnNames = [];
        this._rows = [];
        this._count = 0;
    }

    public static getReport(id: number): Promise<AnalyticsReport> {
        return new Promise<AnalyticsReport>((resolve, reject) => {
            if(AnalyticsReport.redisClient == null || (AnalyticsReport.redisClient != null && !AnalyticsReport.redisClient.connected)){
                AnalyticsReport.redisClient = CacheManager.Redis.getClient();
            }
            
            
            //Will attempt to pull value from cache.
            //If cache is down, redis will timeout and the else block of this
            //get call will run so that OSvC can serve the data with each call
            //if the cache is down.
            let keyName = "analytics_report_" + id;
            AnalyticsReport.redisClient.get(keyName, function (error, value) {
                    if (value != null) {
                        //console.log("Report found in cache");
                        let resp = JSON.parse(String(value), AnalyticsReport.reviver);
                        if (resp instanceof AnalyticsReport) {
                            resp.id = id; //id not stored in cache since it's not returned from the API
                            resolve(resp);

                            return;
                        }
                        else{
                            reject("Cache returned a value, but not an instance of Analytics Report");
                        }
                    }

                    //console.log("Report NOT found in cache: " + id);

                    //Remove the key in cache if the value is undefined
                    AnalyticsReport.deleteCacheKey(AnalyticsReport.redisClient, keyName);

                    AnalyticsReport.performAnalyticsRequest(id, AnalyticsReport.redisClient)
                        .then(report => {
                            resolve(report);
                        })
                        .catch(err => {
                            reject(err);
                        });
            });
        });
    }

    private static deleteCacheKey(cache: Redis.RedisClient, key: string) {
        cache.del(key);
    }

    private static getAnalyticsUrl(): string {
        return "https://" + OSvCConfigs.Host + "/services/rest/connect/latest/analyticsreportresults";
    }

    private static performAnalyticsRequest(id: number, cacheClient?: Redis.RedisClient): Promise<AnalyticsReport> {
        return new Promise((resolve, reject) => {
            let url = AnalyticsReport.getAnalyticsUrl();
            let options = {
                url: url,
                body: "{\"id\": " + id + "}",
                auth: {
                    user: OSvCConfigs.Username,
                    password: OSvCConfigs.Password
                }
            }

            Request.post(options, function (error: any, response: Request.RequestResponse, body: any) {
                if (error || body.status != null) {
                    reject(body);
                    return;
                }

                let resp = JSON.parse(response.body, AnalyticsReport.reviver);
                resp.id = id; //id is not sent back in the response from OSvC

                if (resp instanceof AnalyticsReport) {
                    if (cacheClient != null && cacheClient.connected) {
                        cacheClient.set(("analytics_report_" + id), response.body, "EX", RedisConfigs.ttl, function (error, result) {
                            console.log(RedisConfigs.ttl + " seconds cache set for report " + id);
                        });
                    }

                    resolve(resp);
                }
                else {
                    reject("Report not returned from OSvC");
                }
            });
        });
    }

    public toJSON(): Object {
        let obj = Object.assign({}, this, {
            id: this._id,
            name: this._name,
            columnNames: this._columnNames,
            rows: this._rows,
            count: this._count
        });

        delete obj._columnNames;
        delete obj._count;
        delete obj._createdTime;
        delete obj._id;
        delete obj._links;
        delete obj._lookupName;
        delete obj._name;
        delete obj._rows;
        delete obj._updatedTime;

        return obj;
    }

    public static fromJSON(json: any): AnalyticsReport {        
        let report = Object.create(AnalyticsReport.prototype);
        
        let rows: AnalyticsReportRow[] = [];

        if('rows' in json){
            for (let row of json.rows) {
                let newRow = new AnalyticsReportRow();
                var formattedCells:any = {};

                for(let i = 0; i < json.columnNames.length; i++){
                    formattedCells[json.columnNames[i]] = row[i];
                }

                newRow.cells = formattedCells;

                rows.push(newRow);
            }
        }

        return Object.assign(report, json, {
            _rows: rows
        });
    }

    public static reviver(key: string, value: any): any {
        return key === "" ? AnalyticsReport.fromJSON(value) : value;
    }
}

class AnalyticsReportRow {
    private _cells: object[];

    public get cells(): object[] {
        return this._cells;
    }

    public set cells(value: object[]) {
        this._cells = value;
    }

    public toJSON(): Object {
        let obj = Object.assign({}, this._cells, {
            
        });

        return obj;
    }

    public static fromJSON(json: any): AnalyticsReportRow {
        let row = Object.create(AnalyticsReportRow.prototype);

        return Object.assign(row, json, {
            //middleware for any field processing
        });
    }

    public static reviver(key: string, value: any): any {
        return key === "" ? AnalyticsReportRow.fromJSON(value) : value;
    }
}