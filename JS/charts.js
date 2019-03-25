// graph1
var svgType = d3.select("#producerType"); // bar graph
var svgTypeWidth = svgType.attr("width");
var svgTypeHeight = svgType.attr("height");
var margin = {top: 20, right: 20, bottom: 50, left: 50};
var typeChartWidth = svgTypeWidth - margin.left - margin.right;
var typeChartHeight = svgTypeHeight - margin.top - margin.bottom;

// graph2
var svgGen = d3.select("#yearlyGeneration"); // line graph
var svgGenWidth = svgGen.attr("width");
var svgGenHeight = svgGen.attr("height");
var genChartWidth = svgGenWidth - margin.left - margin.right;
var genChartHeight = svgGenHeight - margin.top - margin.bottom;


var typeData; // producer type data
var genData; // generation data
var energySource =[];

// producer type bar chart
// impaort data
d3.csv("Data/GenerationSimplified.csv").then( function(data) {
  typeData = data;
  // to check
  // console.log(typeData);

  // string -> number
  data.forEach( (d,i) => {
    d['GENERATION'] = Number(d['GENERATION'].replace(/,/g, ""));
  });

  data = data.filter(d => d['GENERATION'] != NaN
              && d['GENERATION'] != 0        
              && d['GENERATION'].length != 0);
// check filtered data
console.log(data);

//scales
  // y scale
  var mwMin = d3.min(data, d => d['GENERATION']);
  var mwMax = d3.max(data, d => d['GENERATION']);
  var mwScale = d3.scaleLinear()
    .domain([mwMin, mwMax])
    .range([typeChartHeight, 20]);
    // check the data
    console.log(mwMax);
    console.log(mwMin);

  // x scale
  var typeScale = d3.scaleOrdinal()
    .range([50, typeChartWidth])
    .domain(data.map(function(d) { return d['ENERGY SOURCE']}));

// axis
  // y axis
  var mwAxis = d3.axisLeft(mwScale);
  svgType.append("g")
    .attr("class", "left axis")
    .attr("transform", "translate(" + (margin.left+ 50 ) + "," + (margin.top -10) + ")")
    .call(mwAxis);

  // x axis
  var typeAxis = d3.axisBottom(typeScale);
  svgType.append("g")
    .attr("class", "bottom axis")
    .attr("transform", "translate(50," + (typeChartHeight+30) + ")")
    .call(typeAxis);
  
// labels
  // x label
  svgType.append("text")
    .attr("class", "x axis label")
    .attr("x", svgTypeWidth/2)
    .attr("y", svgTypeHeight-8)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Types of Source");

  // y label
  svgType.append("text")
    .attr("class", "y axis label")
    .attr("x", - svgTypeHeight/2)
    .attr("y", 20)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Generation(MWh)");


  //bar
  // var bar = svgType.selectAll("g")
  //     .data(data)
  //   .enter().append("rect")
  //     .attr("class", "bar")
  //     .attr("x", function(d) { return d['ENERGY SOURCE']})
  //     .attr("transform", function(d) { return "translate(" + x(d.TYPE_OF_PRODUCER) + ",0)"; });
});

// Yearly Generation line chart
// impaort data
d3.csv("Data/GenerationSimplified.csv").then( function(data) {
  genData = data;
  //to check
  console.log(genData);

  data.forEach( (d,i) => {
    d['YEAR'] = Number(d['YEAR'])
    d['MONTH'] = Number(d['MONTH'])
    d['GENERATION'] = Number(d['GENERATION'].replace(/,/g, ""));
  });

  data = data.filter(d => d['GENERATION'] != NaN
              && d['GENERATION'] != 0        
              && d['GENERATION'].length != 0);

  //x month, y generation
  const monthMin = d3.min(genData, d=>d['MONTH']);
  const monthMax = d3.max(genData, d=>d['MONTH']);
  const monthScale = d3.scaleLinear().domain([monthMin, monthMax]).range([70, genChartWidth]);

  // console.log(monthMin);
  // console.log(monthMax);
  // y value
  const genMin = d3.min(genData, d=>d['GENERATION']);
  const genMax = d3.max(genData, d=>d['GENERATION']);
  const genScale = d3.scaleLinear().domain([genMin, genMax]).range([genChartHeight, 0]);
  
  // console.log(genMin);
  // console.log(genMax);

  // y axis
  var genAxis = d3.axisLeft(genScale);
  svgGen.append("g")
    .attr("class", "left axis")
    .attr("transform","translate("+ (margin.left+ 50 ) +","+ margin.top +")")
    .call(genAxis);

  // x axis
  var monthAxis = d3.axisBottom(monthScale);
  svgGen.append("g")
    .attr("class", "bottom axis")
    .attr("transform", "translate(30," + (genChartHeight + 30) + ")")
    .call(monthAxis);
  
  // x label
  svgGen.append("text")
    .attr("class", "x axis label")
    .attr("x", svgGenWidth/2)
    .attr("y", svgGenHeight-8)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Month");

  // y label
  svgGen.append("text")
    .attr("class", "y axis label")
    .attr("x", - svgGenHeight/2)
    .attr("y", 20)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Generation(MWh)");
  
  
});