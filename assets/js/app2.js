// @TODO: YOUR CODE HERE! 
// LEVEL 1: DABBLER

// set svg vars
var svgWidth = 850;
var svgHeight = 500;

// var margin = {
//   top: 20,
//   right: 40,
//   bottom: 80,
//   left: 100
// };

var margin = {
    top: 40,
    right: 40,
    bottom: 80,
    left: 90
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// set up svg
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// group charts
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// read in data with error option
d3.csv("assets/data/data.csv").then((data, error) => {
        if (error) throw error;

    // make sure data is displayed as a number
    data.forEach(function(xdata) {
        xdata.poverty = +xdata.poverty;
        xdata.healthcare = +xdata.healthcare;

    });

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.poverty)*0.9,
            d3.max(data, d => d.poverty)*1.1])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)*1.1])
        .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .style("font-size", "16px")
        .call(bottomAxis);
    chartGroup.append("g")
        .style("font-size", "16px")
        .call(leftAxis);

    chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 15)
        .attr("fill", "lavender")
        .attr("opacity", ".9");

    // add State abbrev to circles
    chartGroup.selectAll("text.text-circles")
        .data(data)
        .enter()
        .append("text")
        .classed("text-circles",true)
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("dy",5)
        .attr("text-anchor","middle")
        .attr("font-size","12px")
        .attr("fill", "black");

    // y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("fill", "black")
        .classed("aText", true)
        .text("Lacks Healthcare (%)");

    // x axis
    chartGroup.append("text")
        .attr("y", height + margin.bottom/2 - 10)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .attr("fill", "black")
        .classed("aText", true)
        .text("In Poverty (%)");


});