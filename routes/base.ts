/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

import * as express from "express";
import Configs = require("../config/dashboard")

export class Base {
	protected static Router: express.Router = express.Router();

	public static getAllRoutes(): express.Router {
		Base.get();

		return Base.Router;
	}

	/**
	 * Set route to index page
	 */
	public static get() {
		Base.Router.get('/', function (req, res, next) {
			res.render('index', {
				title: 'OSvC Dashboard',
				reports: Configs.Dashboard.reports
			});
		});
	}
}