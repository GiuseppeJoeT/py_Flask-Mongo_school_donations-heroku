/**
 * Created by trantonroad on 24/03/16.
 */

/* A queue() function utilizes the queue library for asynchronous loading.
*  It is helpful when you are trying to get data from multiple API s for a single analysis.
*  The queue() function processes that data hosted at the API and inserts in into the apiData variable.
* */
queue()
    .defer(d3.json, "/donorsUS/projects")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {
    // clean projectsJson data

/* Then we do some transformations on our data using d3 functions. We pass the data inside the
* projectsJson variable into our dataSet variable. We then parse the date data type to suit our
* charting needs and set the data type of total_donations as a number using the + operator. */
    var donorsUSProjects = projectsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
    donorsUSProjects.forEach(function (d) {
        d["date_posted"] = dateFormat.parse(d["date_posted"]);
        d["date_posted"].setDate(1);
        /* We also change the data type from string to datetime objects and we set all projects
        to day 1. All projects from the same month will have the same datetime value.  */

        d["total_donations"] = +d["total_donations"];
        // Adding total_donations from each entry
    });

    // create a CrossFilter instance
    var ndx = crossfilter(donorsUSProjects);

    // Define dimensions
    var dateDim = ndx.dimension(function (d) { /* ?? */
        return d["date_posted"];
    });

    var resourceTypeDim = ndx.dimension(function (d) {
        return d["resource_type"];
    });

    var povertyLevelDim = ndx.dimension(function (d) {
        return d["poverty_level"];
    });

    var stateDim = ndx.dimension(function (d) {
        return d["school_state"];
    });

    var totalDonationsDim = ndx.dimension(function (d) {
        return d["total_donations"];
    });

    var fundingStatus = ndx.dimension(function (d) {
        return d["funding_status"];
    });

    // Calculate metrics

/*  Next we calculate metrics and groups for grouping and counting our data */
    var numProjectsByDate = dateDim.group(); //
    var numProjectByResourceType = resourceTypeDim.group();
    var numProjectByPovertyLevel = povertyLevelDim.group();
    var numProjectByFundingStatus = fundingStatus.group();
    var totalDonationsByState = stateDim.group().reduceSum(function (d) {
        // reduceSum() is the result shows only the total donations of the selected state
        return d["total_donations"];
    });

    var stateGroup = stateDim.group();

    var all = ndx.groupAll();
    var totalDonations = ndx.groupAll().reduceSum(function (d) {
        return d["total_donations"]
    });


    // var max_state = totalDonationsByState.top(1)[0].value;

    // Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];

    // Charts

/* Now we define the chart types objects using DC.js library.
 * We also bind the charts to the div ID's in index.html */
    var timeChart = dc.barChart("#time-chart"); // Number of donations
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");  // Total Donations in USD
    var fundingStatusChart = dc.pieChart("#funding-chart");

    selectField = dc.selectMenu("#menu-select")
        .dimension(stateDim)
        .group(stateGroup);

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })

        .group(all);

    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"));

    timeChart
        .width(800)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);


    resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectByResourceType)
        .xAxis().ticks(4);

    povertyLevelChart
        .width(300)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectByPovertyLevel)
        .xAxis().ticks(4);

    fundingStatusChart
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectByFundingStatus);



    dc.renderAll();

}





















