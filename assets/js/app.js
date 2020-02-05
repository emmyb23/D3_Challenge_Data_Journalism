// @TODO: YOUR CODE HERE!
// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 120,
  left: 150
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select scatter, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params, must store chart data first
var Data = null;
var chooseXAxis = "poverty";  
var chooseYAxis = "obesity";  
var xAxisLabels = ["poverty", "age", "income"];  
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)", 
                    "age": "Age (Median)", 
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)", 
                    "smokes": "Smokes (%)", 
                    "healthcare": "Lacks Healthcare (%)" };
var axisPadding = 30;

// function used for xy-scale var upon click on axis label text
function scale(Data, chooseAxis, xy) {
    var axisRange = (xy === "x") ? [0, chartWidth]:[chartHeight, 0]
    
    var linearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chooseAxis]) * 0.8,
        d3.max(Data, d => d[chooseAxis]) * 1.2
      ])
      .range(axisRange);
  
    return linearScale;
}

// update label upon clicking?
function renderAxis(newScale, Axis, xy) {
    var posAxis = (xy === "x") ? d3.axisBottom(newScale):d3.axisLeft(newScale)
  
    // Return transitions
    Axis.transition()
      .duration(1000)
      .call(posAxis);
  
    return Axis;
}

// update circles grouping
function renderCircles(elemEnter, newScale, chosenAxis, xy) {

   
    elemEnter.selectAll("circle")
        .transition()
        .duration(1000)
        .attr(`c${xy}`, d => newScale(d[chooseAxis]));

    elemEnter.selectAll("text")
        .transition()
        .duration(1000)
        .attr(`d${xy}`, d => newScale(d[chooseAxis]));
  
    return elemEnter;
}

function updateChart() {
   
    var value = d3.select(this).attr("value");
    var xy = xAxisLabels.includes(value) ? "x":"y";
    var elemEnter = d3.selectAll("#elemEnter");
    var axis = (xy==="x") ? d3.select("#xAxis"):d3.select("#yAxis");
    chooseAxis = (xy === "x") ? chooseXAxis:chooseYAxis;

    if (value !== chooseAxis) {
        if(xy === "x") {
            chooseXAxis = value;
        }
        else {
            chooseYAxis = value;
        };

        chooseAxis = (xy === "x") ? chooseXAxis:chooseYAxis;
        linearScale = scale(Data, chooseAxis, xy);
        axis = renderAxis(linearScale, axis, xy);
        elemEnter = renderCircles(elemEnter, linearScale, chooseAxis, xy);
        axisLabels = (xy === "x") ? xAxisLabels:yAxisLabels
        axisLabels.forEach(label => {
            if(label === value) {
                d3.select(`[value=${label}]`).classed("active", true);
                d3.select(`[value=${label}]`).classed("inactive", false);
                d3.select(`[value=${xy+label}]`).classed("invisible", true);
            }
            else {
                d3.select(`[value=${label}]`).classed("active", false);
                d3.select(`[value=${label}]`).classed("inactive", true);
                // Rect switch axis
                d3.select(`[value=${xy+label}]`).classed("invisible", false);
            }
        });
    };
}

function updateLabelsRect(xy, xPos, labelsRect) {
    var squareSize = 10;
    var chooseAxis = (xy === "x") ? chooseXAxis : chooseYAxis;
    var enterlabelsRect = null;
    enterlabelsRect = labelsRect.enter()
        .append("rect")
        .merge(labelsRect)
        .attr("x", xPos)
        .attr("y", (d,i) => (i+1)*axisPadding-squareSize)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chooseAxis) ? true:false)
        .attr("value", d => xy+d)
        .on("click", updateLabel);;
    return enterlabelsRect;
}

function updateLabelsText(xy, xPos, labelsText) {
    var chooseAxis = (xy === "x") ? chooseXAxis : chooseYAxis;
    var enterlabelsText = null; labelsText.enter()
                                    .append("text");
    enterlabelsText = labelsText.enter()
        .append("text")
        .merge(labelsText)
        .attr("x", xPos)
        .attr("y", (d,i) => (i+1)*axisPadding)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === chooseAxis) ? true:false)
        .classed("inactive", d => (d === chooseAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);
}

// update label before moving circle?
function updateLabel() {
    var moveLabel = d3.select(this).attr("value");
    var oldAxis = moveLabel.slice(0,1);
    var selectedLabel = moveLabel.slice(1);

    // move label
    if (oldAxis === "x") {
        xAxisLabels = xAxisLabels.filter(e => e !== selectedLabel);
        yAxisLabels.push(selectedLabel);
    } 
    else {
        yAxisLabels = yAxisLabels.filter(e => e !== selectedLabel);
        xAxisLabels.push(selectedLabel);
    }

    // Update labels
    var xLabels = d3.select("#xLabels");
    var xLabelsRect = xLabels.selectAll("rect")
        .data(xAxisLabels);

    xEnterLabelsRect = updateLabelsRect("x", -120, xLabelsRect);
 
    xLabelsRect.exit().remove();
    var xLabelsText = xLabels.selectAll("text")
        .data(xAxisLabels);
    updateLabelsText("x", 0, xLabelsText);
    xLabelsText.exit().remove();
    var yLabels = d3.select("#yLabels");
    var yLabelsRect = yLabels.selectAll("rect")
        .data(yAxisLabels);
    yEnterLabelsRect = updateLabelsRect("y", -45, yLabelsRect);

    yLabelsRect.exit().remove();
    var yLabelsText = yLabels.selectAll("text")
        .data(yAxisLabels);
    updateLabelsText("y", margin.top, yLabelsText);
    yLabelsText.exit().remove();
}

function init() {
    var r = 15;
    // Create initial xLinearScale, yLinearScale
    var xLinearScale = scale(Data, chooseXAxis, "x");
    var yLinearScale = scale(Data, chooseYAxis, "y");
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    var xAxis = chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .attr("id", "xAxis")
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("axis", true)
      .attr("id", "yAxis")
      .call(leftAxis);
      
    var elem = chartGroup.selectAll("g circle")
        .data(Data);
 
    var elemEnter = elem.enter()
        .append("g")
        .attr("id", "elemEnter");
    
    elemEnter.append("circle")
        .attr('cx', d => xLinearScale(d[chooseXAxis]))
        .attr('cy', d => yLinearScale(d[chooseYAxis]))
        .attr('r', r)
        .classed("stateCircle", true);
    
    // add the state text
    elemEnter.append("text")
        .attr("dx", d => xLinearScale(d[chooseXAxis]))
        .attr("dy", d => yLinearScale(d[chooseYAxis]))
        .classed("stateText", true)
        .attr("font-size", parseInt(r*0.8))
        .text(d => d.abbr);
  
    var xLabels = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
        .classed("atext", true)
        .attr("id", "xLabels");
    // Create rectangle for changing the data sets on the graph
    var xLabelsRect = xLabels.selectAll("rect")
        .data(xAxisLabels)
    var enterXLabelsRect = xLabelsRect.enter()
        .append("rect")
        .attr("x", -120)
        .attr("y", (d,i) => (i+1)*axisPadding-12)
        .attr("width", 12)
        .attr("height", 12)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chooseXAxis) ? true:false)
        .attr("value", d => "x"+d)
        .on("click", updateLabel);
   
    var yLabels = chartGroup.append("g")
        .attr("transform", `rotate(-90 ${(margin.left/2)} ${(chartHeight/2)+60})`)
        .classed("atext", true)
        .attr("id", "yLabels");
    var yLabelsRect = yLabels.selectAll("rect")
        .data(yAxisLabels);
    var enterYLabelsRect = yLabelsRect.enter()
        .append("rect")
        .attr("x", -45)
        .attr("y", (d,i) => (i+1)*axisPadding-12)
        .attr("width", 12)
        .attr("height", 12)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chooseYAxis) ? true:false)
        .attr("value", d => "y"+d)
        .on("click", updateLabel);

    yLabels.selectAll("text")
        .data(yAxisLabels)
        .enter()
        .append("text")
        .attr("x", margin.top)
        .attr("y", (d,i) => (i+1)*axisPadding)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === chooseYAxis) ? true:false)
        .classed("inactive", d => (d === chooseYAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);
};

// Load csv data
d3.csv("assets/data/data.csv").then((data, error) => {
    // add an error otion for loading
    if (error) throw error;
  
    // Parse data values to a number
    data.forEach(d => {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.healthcare = +d.healthcare;
      d.smokes = +d.smokes;
    });

    // Load data into Data variable
    Data = data;
    // Initialize the chart
    init();
});
