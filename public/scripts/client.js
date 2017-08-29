/**
 * @copyright Scott Harwell 2017
 * @license MIT
 */

var socket = io();
var activeCharts = {};

$(document).ready(function () {
    let $loading = $('#loading');

    socket.on('report_response', function (data) {
        console.log("Report data recieved for " + data.id);
        $loading.hide();
        $('body').css('background', '#fff');

        let $reportDiv = $("#" + data.id);
        let $reportWrapper = $reportDiv.parent();

        let optionsStr = $reportDiv.attr('chart_options');
        var options;
        if (optionsStr != null) {
            options = JSON.parse(optionsStr);
        }
        
        if(options){
            if(options.width){
                $reportWrapper.css('width', options.width);
            }
            
            if(options.height){
                $reportWrapper.css('height', options.height);
            }
        }

        if ('rows' in data && Array.isArray(data.rows) && data.rows.length > 0) {
            $reportWrapper.css('display', 'inline-block');
            let chartType = $reportDiv.attr('chart_type');
            let $wrapperDiv = $reportDiv.parents('.report_wrapper').first();

            $wrapperDiv.children('h2').html(data.name);

            if (chartType == 'tabular') {
                setupTabularChart($reportDiv, data, options);
            } else {
                setupGraphicalChart($reportDiv, chartType, data, options);
            }
        } else {
            console.log("Report has no data to display: " + data.id);
            $reportDiv.parent().hide();
        }
    });
});

/**
 * Method to request report data from the server.
 * We don't really want clients doing this since they are
 * listening for socket.io to push data from the server.
 * But, this can help in debugging.
 */
let getReportData = function () {
    console.log("refreshing reports");
    $(".report").each(function (index) {
        let reportId = $(this).attr("report_id");
        socket.emit("report_request", {
            "id": reportId
        });
    });
}

let setupTabularChart = function ($reportDiv, data, options) {
    var chart = activeCharts[$reportDiv.attr('id')];

    if (chart) {
        $reportDiv.jsGrid({
            data: data.rows
        })
    } else {
        var fieldsArr = [];
        for (let col of data.columnNames) {
            var field = {
                name: col,
                type: "text"
            }
            fieldsArr.push(field);
        }

        activeCharts[$reportDiv.attr('id')] = $reportDiv.jsGrid({
            width: "100%",
            //height: "100%",

            inserting: false,
            editing: false,
            sorting: true,
            paging: true,

            data: data.rows,

            fields: fieldsArr
        });
    }
}

let setupGraphicalChart = function ($reportDiv, chartType, data, options) {
    if (data != null && data.rows != null) {
        var dataArr = [];
        var colArr = [];
        var colors = [];
        for (let prop in data.rows[0]) {
            if (prop[0] != '_') {
                colArr.push(prop);
                dataArr.push(parseInt(data.rows[0][prop]));
                colors.push(dynamicColors());
            }
        }

        colArr.pop();
        dataArr.pop();

        var chart = activeCharts[$reportDiv.attr('id')];

        if (!chart) {
            options.data = {
                datasets: [{
                    data: dataArr,
                    backgroundColor: colors
                }],
                labels: colArr
            };

            if (options.options == null) {
                options.options = new Object();
            }
            options.options.maintainAspectRatio = false;

            let canvas = document.createElement('canvas');
            $reportDiv.html(canvas);

            activeCharts[$reportDiv.attr('id')] = new Chart(canvas, options);
        } else {
            if (chart) {
                chart.data.datasets[0].data = dataArr;
                chart.update();
            }
        }
    }
}

let dynamicColors = function () {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    let a = 1;
    let color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    return color;
}