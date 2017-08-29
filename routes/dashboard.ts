/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

import * as Express from "express";
import Models = require("../models/analyticsreport");
import Configs = require("../config/dashboard");

export class Dashboard {
	protected static Router: Express.Router = Express.Router();

    /**
     * Get all of the routes published by this class.
     */
	public static getAllRoutes(): Express.Router {
		Dashboard.get();
		Dashboard.getId();

		return Dashboard.Router;
	}

    /**
     * This route's GET operation to retrieve all nodes.
     */
	public static get() {
		Dashboard.Router.get('/', function (req, res, next) {
			res.json(Configs.Dashboard.reports);
		});
	}

	public static getId() {
		Dashboard.Router.get('/:id', function (req, res, next) {
			if (req.params.id > 0) {
				Models.AnalyticsReport.getReport(req.params.id)
					.then(report => {
						console.log("Report in getId route found");
						res.json(report);
					})
					.catch(err => {
						console.log("Error in getId route");
						next(err);
					});
			}
			else {
				var err = new Error('Not Found');
				//err.status = 404;
				next(err);
			}
		});
	}
}