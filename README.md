Service Cloud Status Dashboard (osvcd)
==============================

This repository is an attempt to build a solution to quickly configure call center dashboards for TV Monitors using Oracle Service Cloud.

The application consists of a server that will poll Service Cloud for data.  It also consists of a client-side component that will connect to the server via a web socket for continuous updates.  The idea is that the dashboard could be displayed on multiple screens based on your needs, such as large monitors for a room or on agents monitors directly.  The web socket will push updates to all clients through the socket.

A redis cache is used to limit API calls to OSvC.  A single call is made to OSvC to collect data for the reports displayed.  Clients are pushed data from the cache unless the redis server is unavailable.  It is strongly advised to use the cache for this tool.

#### Disclaimer

This repo is an example repository that I created to play around with some of the technologies used.  The code in this repository is not affiliated with Oracle Corporation in any way.

# Setup

The recommended approach to using osvcd is with the Docker image.  The docker image allows for immediate configuration and deployment.  Your configuration may vary, but these instructions should get you started on a single docker host.

## Docker 

These instructions assume a recent version of Docker.  They are confirmed working in Docker 1.13.1.

### Configuration

The dashboard is configured by four files in the repository.  Create a config folder on your host machine that we can place these files into.  We will map this folder on the host machine to the docker container in a later step.

1. `configs/osvc.js` Contains connection info to the Service Cloud API.
2. `configs/dashboard.js` Contains configuration for the reports that the dashboard will display.
3. `configs/redis.js` Contains the configuration for interacting with the Redis server.
4. `configs/classes.js` A loader file used to import the previous three files.  This file should always remmain unchanged.

To get started, just update the osvc.js file with your connection information.  Once the container is up and running, then you can edit the dashboard.js file as needed to setup your reports.

```
Object.defineProperty(exports, "__esModule", { value: true });
class OSvC {
}
//OSvC REST Endpoint Configs
OSvC.Host = "yoursite.custhelp.com"; //EDIT THIS LINE
OSvC.Username = "username"; //EDIT THIS LINE
OSvC.Password = "password"; //EDIT THIS LINE
exports.OSvC = OSvC;
```

### Container Setup

1. Create an isolated network that Redis and osvcd in docker. `docker network create osvcd-net`.
2. Pull the Redis docker image. `docker pull redis`
3. Pull the osvcd docker image. `docker pull scottharwell/osvc_dashboard`
4. Start the Redis container first. `docker run --name redis --network=osvcd-net redis`
5. Start the osvcd container.  We will expose port 3000 to the host system so that it has access to our application.  Also, we point the configuration folder of the docker container to the folder on our host so that we can manage the configuration dynamically. `docker run --name osvcd -p 3000:3000 --network=osvcd-net -v /path/to/config/on/host:/usr/src/app/config scottharwell/osvcd`

The application should now be available on your Docker host.  You can access the dashboard from a browser by going to http://domain.of.docker.host:3000 (use localhost if running on your local machine).

To keep the application scalable for large organizations, you might put an nginx or apache reverse proxy in front of this app that serves the app over HTTP or HTTPS ports natively.

### Dashboard Setup

Dashboard configuration is somewhat limited currently.  Tabular reports will display as tables.  Charts can be hit or miss; doughnut and pie charts work but others may not.

The reports array in `configs/dashboard.js` controls what reports display and how they display.

```
Dashboard.reports = [
    {
        reportId: 13121,
        chartType: 'tabular',
        chartOptions: {
            width: "48%"
        }
    },
    {
        reportId: 30,
        chartType: 'chart',
        chartOptions: {
            type: 'doughnut',
            width: "48%"
        }
    },
    {
        reportId: 3026,
        chartType: 'tabular',
        chartOptions: {
            width: "98%"
        }
    }
];
```
The keys `reportId` and `chartType` are always required.

The `reportId` is the OSvC report ID to query for (**note:** only IDs that are supported through the REST API will work).

The `chartType` key will either be `tabular` or `chart`, depending on how you wish to present the data.

If you choose `chart`, then you can set the `chartOptions` key as per the example above to set the type to `doughnut` or `pie`.

Lastly, the width key in `chartOptions` sets the overall width for that report.

The example configuration above will render a dashboard like the example below.

![osvcd example](https://github.com/scottharwell/osvc_dashboard/blob/master/public/img/dashboard_screenshot.png?raw=true)

## From Source

Running the application from source is fairly straight forward.  You need node.js and npm installed on your machine.  Then, follow these steps...

1. Clone the repo from GitHub.
2. Navigate to the cloned repo folder.
3. Run `npm install`, which will install a number of packages, including TypeScript (tsc).
4. Edit the `configs/osvc.ts` file with the proper connection info.
5. Run `tsc` to transpile TypeScript files to JavaScript.
6. Run `npm start` to start the application.

The application assumes that a Redis server is running on your machine.  If not, it will still work, but you will see errors pointing to the missing cache.

Now, use your browser to navigate to the hosting PC on port 3000 to view the dashboard.