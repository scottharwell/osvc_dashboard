/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

export interface IDashboardReport {
    reportId: number;
    chartType: string;
    chartOptions?: any;
}

export class Dashboard {

    /**
     * Number of milliseconds between data refreshes sent to client.
     */
    public static readonly REFRESH_INTERVAL: number = 5000;

    /**
     * The reports that will be displayed on the dashboard and their report options
     */
    public static readonly reports: IDashboardReport[] = [
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
}