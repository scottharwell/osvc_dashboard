"use strict";
/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Dashboard {
}
/**
 * Number of milliseconds between data refreshes sent to client.
 */
Dashboard.REFRESH_INTERVAL = 5000;
/**
 * The reports that will be displayed on the dashboard and their report options
 */
Dashboard.reports = [
    //Logged In Staff Accounts
    {
        reportId: 13121,
        chartType: 'tabular',
        chartOptions: {
            width: "48%"
        }
    },
    //Backlog
    {
        reportId: 30,
        chartType: 'chart',
        chartOptions: {
            type: 'doughnut',
            width: "48%"
        }
    },
    //Chat Queue Statistics
    {
        reportId: 3026,
        chartType: 'tabular',
        chartOptions: {
            width: "98%"
        }
    }
];
exports.Dashboard = Dashboard;
