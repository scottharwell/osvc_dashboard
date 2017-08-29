/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

import express = require("express");
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import debug = require('debug');
import http = require('http');
import socketio = require('socket.io');

import * as Routes from "./routes";
import OSvC = require("./models/analyticsreport");
import { Dashboard as DashboardConfigs, OSvC as OSvCConfigs } from "./config/classes"

export class App {
    //Express instance
    static express = express();

    //Instance of the HTTP server
    static server: http.Server;

    //Port on which the HTTP server is running
    static port: number;

    //Instance of socketio that will bind to the express server
    static socketio: SocketIO.Server;

    public static configure(): void {
        // view engine setup
        App.express.set('views', './views');
        App.express.set('view engine', 'pug');

        // uncomment after placing your favicon in /public
        //express.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        App.express.use(logger('dev'));
        App.express.use(bodyParser.json());
        App.express.use(bodyParser.urlencoded({ extended: false }));
        App.express.use(cookieParser());
        App.express.use(express.static('./public'));

        App.express.use('/', Routes.Base.getAllRoutes());
        App.express.use('/dashboard', Routes.Dashboard.getAllRoutes());

        // catch 404 and forward to error handler
        App.express.use(function (req: any, res: any, next: any) {
            var err = new Error('Not Found');
            //err.status = 404;
            next(err);
        });

        // error handler
        App.express.use(function (err: any, req: any, res: any, next: any) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            //res.render('error');
            res.json(err.message);
        });

        //Set debug to this server
        debug('osvc_dashboard:server');

        /**
         * Get port from environment and store in Express.
         */
        App.port = App.normalizePort(process.env.PORT || '3000');
        App.express.set('port', App.port);
    }

    public static startServer(port: number = App.port) {
        //Setup Express
        if(App.server == null){
            App.server = http.createServer(App.express);
            App.server.listen(port);
            App.server.on('error', App.onHttpError);
            App.server.on('listening', App.onHttpListening);

            //Setup socket.io
            App.socketio = socketio(App.server);
            App.socketio.on('connection', App.onSocketIoListening);

            //Start report loops
            App.requestAllReports();
            App.startReportLoop();
        }
    }

    public static normalizePort(val: any) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    private static onHttpError(error: any) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = typeof App.port === 'string'
            ? 'Pipe ' + App.port
            : 'Port ' + App.port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private static onHttpListening() {
        let addr = App.server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }

    private static onSocketIoListening(socket: SocketIO.Socket){
        console.log("socket from client connected: " + socket.handshake.address);
    }

    private static startReportLoop(){
        setInterval(App.requestAllReports, DashboardConfigs.REFRESH_INTERVAL);
    }

    private static requestAllReports(){
        let reports = DashboardConfigs.reports;
        for (let report of reports){
            App.requestReport(report.reportId);
        }
    }
    
    private static requestReport(id:number){
        OSvC.AnalyticsReport.getReport(id)
            .then(report => {
                App.socketio.emit('report_response', report);
            })
            .catch(error => {
                console.log("Error getting report from OSvC.");
                console.log(error);
            });
    }
}