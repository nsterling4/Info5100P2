// /****** Bar Graph *******/
// var svgType = d3.select("#producerType"); // bar graph
// var svgTypeWidth = svgType.attr("width");
// var svgTypeHeight = svgType.attr("height");
// var margin = {
//   top: 20,
//   right: 20,
//   bottom: 50,
//   left: 50
// };
// var typeChartWidth = svgTypeWidth - margin.left - margin.right;
// var typeChartHeight = svgTypeHeight - margin.top - margin.bottom;

// /****** Line Graph *******/
// var svgGen = d3.select("#yearlyGeneration"); // line graph
// var svgGenWidth = svgGen.attr("width");
// var svgGenHeight = svgGen.attr("height");
// var genChartWidth = svgGenWidth - margin.left - margin.right;
// var genChartHeight = svgGenHeight - margin.top - margin.bottom;

// var energySource = [];

// // impaort data
// d3.csv("Data/CombinedEnergy.csv").then(function (data) {

//   var fullGraphData = data;
//   // console.log(fullGraphData);

//   // variables
//   year_value = 2017;
//   month_value = 4;
//   activeState = "CA";
//   //console.log(idToState[activeState.attr("ident")]);


//   console.log("Graph check");
//   console.log(year_value);
//   console.log(month_value);
//   console.log(activeState);


//   // filtering data
//   console.log(fullGraphData);

//   function updateGraphs(activeYear, activeMonth) {

//     var activeData = fullGraphData.filter(d => d['GENERATION'] != NaN &&
//       d['GENERATION'] > 0 &&
//       d['GENERATION'].length != 0);
//     // && d['CONSUMPTION'] != NaN
//     // && d['CONSUMPTION'] > 0        
//     // && d['CONSUMPTION'].length != 0);
//     console.log(activeData); //filtered data

//     // var year_month = activeData.filter(function (d) {
//     //     return d.YEAR = activeYear;
//     //   });
//     //   console.log(JSON.stringify(year_month));

//     //   // data of active year
//     //   var byState = year_month.map(function (d) {
//     //     return [d['STATE'], d['YEAR'], d['MONTH'], d['ENERGY_SOURCE'] = energySource, d['GENERATION']];
//     //   });
//     //   var sourceByState = year_month.map(function (d) {
//     //     return d['ENERGY_SOURCE'];
//     //   });
//     //   var generationByState = year_month.map(function (d) {
//     //     return d['GENERATION'];
//     //   });

//     //   // data of active year
//     //   var byState = year_month.map(function (d) {
//     //     return {
//     //       "state": d['STATE'],
//     //       "year": d['YEAR'],
//     //       "month": d['MONTH'],
//     //       "generation": d['GENERATION']
//     //     }
//     //   });
//     //   console.log(byState);



//     /*************/
//     /* Bar graph */
//     /*************/

//     //scales
//     // y scale
//     var mwMin = d3.min(activeData, d => d['GENERATION']);
//     var mwMax = d3.max(activeData, d => d['GENERATION']);
//     var mwScale = d3.scaleLinear()
//       .domain([mwMin, mwMax])
//       .range([typeChartHeight, 20]);
//     // check the data
//     //console.log(mwMax);
//     //console.log(mwMin); //have negative values

//     // x scale
//     var typeScale = d3.scaleBand()
//       .rangeRound([0, typeChartWidth - 50])
//       .padding(0.4)
//       .domain(activeData.map(function (d) {
//         return d['ENERGY_SOURCE'];
//       }));

//     // axis
//     // y axis
//     var mwAxis = d3.axisLeft(mwScale);
//     svgType.append("g")
//       .attr("class", "left axis")
//       .attr("transform", "translate(" + (margin.left + 50) + "," + (margin.top - 10) + ")")
//       .call(mwAxis);

//     // x axis
//     var typeAxis = d3.axisBottom(typeScale);
//     svgType.append("g")
//       .attr("class", "bottom axis")
//       .attr("transform", "translate(100," + (typeChartHeight + 30) + ")")
//       .call(typeAxis);

//     // labels
//     // x label
//     svgType.append("text")
//       .attr("class", "x axis label")
//       .attr("x", svgTypeWidth / 2)
//       .attr("y", svgTypeHeight - 8)
//       .attr("font-size", "18px")
//       .attr("text-anchor", "middle")
//       .text("Types of Source");

//     // y label
//     svgType.append("text")
//       .attr("class", "y axis label")
//       .attr("x", -svgTypeHeight / 2)
//       .attr("y", 20)
//       .attr("font-size", "18px")
//       .attr("text-anchor", "middle")
//       .attr("transform", "rotate(-90)")
//       .text("Generation(MWh)");

//     //bar
//     var bar = svgType.selectAll(".bar")
//       .data(activeData)
//       .enter().append("rect")
//       .attr("class", "bar")
//       .attr("x", function (d) {
//         return typeScale(d.ENERGY_SOURCE);
//       })
//       .attr("y", function (d) {
//         return mwScale(d.GENERATION);
//       });
//     // .attr("transform", function(d) { return "translate(" +  + ",0)"; });


//     /*************/
//     /* line graph */
//     /*************/

//     const yearMin = d3.min(activeData, d => d['YEAR']);
//     const yearMax = d3.max(activeData, d => d['YEAR']);
//     // console.log(yearMin);
//     // console.log(yearMax);


//     //x month, y generation
//     const monthMin = d3.min(activeData, d => d['MONTH']);
//     const monthMax = d3.max(activeData, d => d['MONTH']);
//     const monthScale = d3.scaleLinear().domain([monthMin, monthMax]).range([0, genChartWidth - 50]);

//     //console.log(monthMin);
//     //console.log(monthMax);

//     // y value
//     const genMin = d3.min(activeData, d => d['GENERATION']);
//     const genMax = d3.max(activeData, d => d['GENERATION']);
//     const genScale = d3.scaleLinear().domain([genMin, genMax]).range([genChartHeight, 0]);

//     // console.log(genMin);
//     // console.log(genMax);

//     // y axis
//     var genAxis = d3.axisLeft(genScale);
//     svgGen.append("g")
//       .attr("class", "left axis")
//       .attr("transform", "translate(" + (margin.left + 50) + "," + margin.top + ")")
//       .call(genAxis);

//     // x axis
//     var monthAxis = d3.axisBottom(monthScale);
//     svgGen.append("g")
//       .attr("class", "bottom axis")
//       .attr("transform", "translate(100," + (genChartHeight + 30) + ")")
//       .call(monthAxis);

//     // x label
//     svgGen.append("text")
//       .attr("class", "x axis label")
//       .attr("x", svgGenWidth / 2)
//       .attr("y", svgGenHeight - 8)
//       .attr("font-size", "18px")
//       .attr("text-anchor", "middle")
//       .text("Month");

//     // y label
//     svgGen.append("text")
//       .attr("class", "y axis label")
//       .attr("x", -svgGenHeight / 2)
//       .attr("y", 20)
//       .attr("font-size", "18px")
//       .attr("text-anchor", "middle")
//       .attr("transform", "rotate(-90)")
//       .text("Generation(MWh)");

//     // draw line
//     var line = d3.line()
//       .x(function (d, i) {
//         return monthScale(i);
//       })
//       .y(function (d) {
//         return genScale(d.GENERATION);
//       });

//     svgGen.append("path")
//       .datum(activeData)
//       .attr("class", "line")
//       .attr('d', line);

//   }

// });