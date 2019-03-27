// graph1
var svgType = d3.select("#producerType"); // bar graph
var svgTypeWidth = svgType.attr("width");
var svgTypeHeight = svgType.attr("height");
var margin = { top: 20, right: 20, bottom: 50, left: 50 };
var typeChartWidth = svgTypeWidth - margin.left - margin.right;
var typeChartHeight = svgTypeHeight - margin.top - margin.bottom;

// graph2
var svgGen = d3.select("#yearlyGeneration"); // line graph
var svgGenWidth = svgGen.attr("width");
var svgGenHeight = svgGen.attr("height");
var genChartWidth = svgGenWidth - margin.left - margin.right;
var genChartHeight = svgGenHeight - margin.top - margin.bottom;


// var graphData; // producer type data
var energySource = [];

// producer type bar chart
// impaort data
const graphDataOutside = async () => {

  var FullgraphData = await d3.csv("Data/CombinedEnergy.csv", d3.autoType);

 // graphData = data;
  // to check
  console.log(FullgraphData);

  // string -> number
  // graphData.forEach( (d,i) => {
  //   d['YEAR'] = Number(d['YEAR']);
  //   d['MONTH'] = Number(d['MONTH']);
  //   d['GENERATION'] = Number(d['GENERATION'].replace(/,/g, ""))
  //   d['ENERGY_SOURCE'] = (d['ENERGY_SOURCE']);;
  // });

  graphData = FullgraphData.filter(d => d['GENERATION'] != NaN
    && d['GENERATION'] != 0
    && d['GENERATION'].length != 0);
  // check filtered data
  console.log(graphData);

  let activeYear = 2015;
  let activeMonth = 4;
  let activeState = "CA";
  let activeSource;

  // filtering data
  let activeData = graphData.filter(d => d['YEAR'] === activeYear
    && d['MONTH'] === activeMonth
    && d['ENERGY_SOURCE'] === activeSource
    && d['STATE'] === activeState);
  console.log(activeData); // need to figure out why it is empty

  var year_month = activeData.filter(function (d) { return d.YEAR = activeYear; });
  console.log(JSON.stringify(year_month));
  // data of active year
  var byState = year_month.map(function (d) { return [d['STATE'], d['YEAR'], d['MONTH'], d['ENERGY_SOURCE'] = energySource, d['GENERATION']]; });
  var sourceByState = year_month.map(function (d) { return d['ENERGY_SOURCE']; });
  var generationByState = year_month.map(function (d) { return d['GENERATION']; });

  //scales
  // y scale
  var mwMin = d3.min(graphData, d => d['GENERATION']);
  var mwMax = d3.max(graphData, d => d['GENERATION']);
  var mwScale = d3.scaleLinear()
    .domain([mwMin, mwMax])
    .range([typeChartHeight, 20]);
  // check the data
  //console.log(mwMax);
  //console.log(mwMin); //have negative values

  // x scale
  var typeScale = d3.scaleBand()
    .rangeRound([0, typeChartWidth])
    .padding(0.4)
    //probably change typeData to activeData or year_month after figuring out why activeData is empty
    .domain(graphData.map(function (d) { return d['ENERGY_SOURCE']; }));

  // axis
  // y axis
  var mwAxis = d3.axisLeft(mwScale);
  svgType.append("g")
    .attr("class", "left axis")
    .attr("transform", "translate(" + (margin.left + 50) + "," + (margin.top - 10) + ")")
    .call(mwAxis);

  // x axis
  var typeAxis = d3.axisBottom(typeScale);
  svgType.append("g")
    .attr("class", "bottom axis")
    .attr("transform", "translate(50," + (typeChartHeight + 30) + ")")
    .call(typeAxis);

  // labels
  // x label
  svgType.append("text")
    .attr("class", "x axis label")
    .attr("x", svgTypeWidth / 2)
    .attr("y", svgTypeHeight - 8)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Types of Source");

  // y label
  svgType.append("text")
    .attr("class", "y axis label")
    .attr("x", - svgTypeHeight / 2)
    .attr("y", 20)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Generation(MWh)");

  //bar
  var bar = svgType.selectAll(".bar")
    .data(graphData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return typeScale(d.sourceByState); })
    .attr("y", function (d) { return mwScale(d.generationByState); });
  // .attr("transform", function(d) { return "translate(" +  + ",0)"; });

  //graph 2

  console.log(activeData);

  var year_month = activeData.filter(function (d) { return d.YEAR = activeYear; });
  console.log(JSON.stringify(year_month));

  // data of active year
  var byState = year_month.map(function (d) { return { "state": d['STATE'], "year": d['YEAR'], "month": d['MONTH'], "generation": d['GENERATION'] } });
  console.log(byState);

  const yearMin = d3.min(graphData, d => d['YEAR']);
  const yearMax = d3.max(graphData, d => d['YEAR']);
  // console.log(yearMin);
  // console.log(yearMax);


  //x month, y generation
  const monthMin = d3.min(graphData, d => d['MONTH']);
  const monthMax = d3.max(graphData, d => d['MONTH']);
  const monthScale = d3.scaleLinear().domain([monthMin, monthMax]).range([0, genChartWidth]);

  //console.log(monthMin);
  //console.log(monthMax);

  // y value
  const genMin = d3.min(year_month, d => d['GENERATION']);
  const genMax = d3.max(year_month, d => d['GENERATION']);
  const genScale = d3.scaleLinear().domain([genMin, genMax]).range([genChartHeight, 0]);

  console.log(genMin);
  console.log(genMax);

  // y axis
  var genAxis = d3.axisLeft(genScale);
  svgGen.append("g")
    .attr("class", "left axis")
    .attr("transform", "translate(" + (margin.left + 30) + "," + margin.top + ")")
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
    .attr("x", svgGenWidth / 2)
    .attr("y", svgGenHeight - 8)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Month");

  // y label
  svgGen.append("text")
    .attr("class", "y axis label")
    .attr("x", - svgGenHeight / 2)
    .attr("y", 20)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Generation(MWh)");

  // draw line


  var line = d3.line()
    .x(function (d, i) { return monthScale(i); })
    .y(function (d) { return genScale(d.generation); });

  svgGen.append("path")
    .datum(byState)
    .attr("class", "line")
    .attr('d', line);

}

graphDataOutside();