
//Create margins for US map SVG and get dimensions
let usaMap = d3.select("#usa");
let svgMapWidth = usaMap.attr("width");
let svgMapHeight = usaMap.attr("height");
let svgMapMargin = {
    top: -30,
    right: 20,
    bottom: 30,
    left: 20
};
const mapWidth = svgMapWidth - svgMapMargin.left - svgMapMargin.right;
const mapHeight = svgMapHeight - svgMapMargin.top - svgMapMargin.bottom;
const map = usaMap.append("g")
    .attr("transform", "translate(" + svgMapMargin.left + "," + svgMapMargin.top + ")");


let degree = "F";

//Declare values to be changed through interactivity
var year_value;
var month_value;
var activeState;

let stateTemps = {};
let idToState = {};
let stateToData = {};

//Create an activeSlider object and set its default value to 0 
var activeSlider = {};
activeSlider.value = 0;

const geoData = async () => {

    //Geo variables
    const usa = await d3.json("Data/us.json");
    

    const stateIDs = await d3.tsv("Data/us-state-names.tsv");
  




    // Let's filter the dataset so we have only the lower 48 states
    let filteredStates = ['02', '15', '60', '66', '69', '72', '74', '78'];
    
    // Loop through state geometries and filter by id (padding with leading zeroes because they are stored as ints in the json)
    usa.objects.states.geometries = usa.objects.states.geometries.filter(d => {
        return filteredStates.indexOf(d.id.toString().padStart(2, '0')) === -1;
    });



    var states = topojson.feature(usa, usa.objects.states);
    var statesMesh = topojson.mesh(usa, usa.objects.states);
    var projection = d3.geoAlbersUsa().fitSize([mapWidth, mapHeight], states);
    var path = d3.geoPath().projection(projection);



    //Drawing portion
    map.selectAll("path").data(states.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("ident", d => d.id);




    map.append("path")
        .datum(statesMesh)
        .attr("class", "outline")
        .attr("d", path);


     //Get the entire data set
    let fulldata = await d3.csv("Data/combinedWeather.csv", d3.autoType);

    console.log(fulldata);

    //Create our display buttons

    let display = "AvgValue";
    let minButton = d3.select("button#MinValue");
    let avgButton = d3.select("button#AvgValue");
    let maxButton = d3.select("button#MaxValue");
    let displayValue = d3.select("#displayValue");

    //Temperature buttons
    let f = d3.select("button#F");
    let c = d3.select("button#C");

    let displayButton = d3.select("#" + display);
    displayButton.attr("disabled", "null");
    displayValue.text("Map displays " + displayButton.text().toUpperCase() + " in " + String.fromCharCode(176) + degree + " for the selected time period");

    //Change temperature to display based on button clicked
    minButton.on("click", function () {
        setDisplayButton("MinValue");
    });

    avgButton.on("click", function () {
        setDisplayButton("AvgValue");
    });

    maxButton.on("click", function () {
        setDisplayButton("MaxValue");
    });

    //Change units on map based on pressed temperature button
    f.on("click", function () {
        setUint();
        updateMap(year_value, month_value);
    });
    c.on("click", function () {
        setUint();
        updateMap(year_value, month_value);
    });



    function setDisplayButton(newDisplay) {
        activeState = undefined;
        d3.select("h2#state").text("SELECT STATE FROM MAP");
        displayButton = d3.select("#" + display);
        displayButton.attr("disabled", null);
        display = newDisplay;
        displayButton = d3.select("#" + display);
        displayButton.attr("disabled", "true");
        // displayValue.text("Displaying: "+display);
        displayValue.text("Map displays " + displayButton.text().toUpperCase() + " in " + String.fromCharCode(176) + degree + " for the selected time period");
        updateMap(year_value, month_value);
        updateGraphs(year_value, month_value);
        clearGraphs();
        d3.select("#temp").text("");
    }

    function setUint() {
        if (degree === "F") {
            f.attr("disabled", null);
            c.attr("disabled", "true");
            degree = "C";
        } else {
            f.attr("disabled", "true");
            c.attr("disabled", null);
            degree = "F";
        }
        if (activeState !== undefined) {
            d3.select("h2#temp").text(adjustedTemp((activeData[stateToData[idToState[activeState.attr("ident")]]])[display]) + String.fromCharCode(176) + degree);
        }
        displayValue.text("Map displays " + displayButton.text().toUpperCase() + " in " + String.fromCharCode(176) + degree + " for the selected time period");

    }

    function adjustedTemp(temp) {
        if (degree === "C") {
            calc = (temp - 32) * 5 / 9;
            return Math.round(calc * 10) / 10;

        } else {
            return temp;
        }
    }

    //Create box that would display temperature stats of a state on hover 
    var hoverBox = d3.select("body").append("div")
        .attr("class", "hoverBox")
        .style("opacity", 0);

    //Update the US map to contain the temperature readings of all states relevant to a given month and year
    function updateMap(activeYear, activeMonth) {

        //Filter data to only have that of the specified active year and month
        activeData = fulldata.filter(d => d['YEAR'] === activeYear && d['MONTH'] === activeMonth);
       





        stateIDs.forEach(row => {
            stateTemps[row.name] = 0;
            idToState[row.id] = row.name;
        });
   
        activeData.forEach((row, i) => {
            stateTemps[row.STATE] = adjustedTemp(row[display]);
            stateToData[row.STATE] = i;
        });
        




        const minMax = d3.extent(fulldata, d => adjustedTemp(d.AvgValue));

        const colorScale = d3.scaleQuantize()
            .domain(minMax)
            // .range(["navy", "blue", "lightblue", "lightpink", "red",d3.rgb(98,34,40)]);
            .range([d3.rgb(31, 21, 62), d3.rgb(46, 63, 111), d3.rgb(1, 93, 161), d3.rgb(57, 159, 220), d3.rgb(230, 140, 75), d3.rgb(219, 86, 49), d3.rgb(168, 39, 35), d3.rgb(98, 34, 40)]);


        map.selectAll(".state")
            .style("fill", d => colorScale(stateTemps[idToState[d.id]]));

        //Fill selected state to distinguish this state from the unselected ones
        if (activeState !== undefined) {
            activeState.style("fill", "honeydew");

        }


        d3.selectAll(".state").on("mousemove", mouseOnPlot)
            .on("mouseout", mouseLeavesPlot)
            .on("click", mouseClickPlot);
        d3.selectAll(".outline").on("mouseover", overlay)
            .on("mouseout", mouseLeavesPlot);

        var hoveBoxWidth = parseFloat(hoverBox.style("width"));
        var hoverBoxHeight = parseFloat(hoverBox.style("height"));


        var degreeSymbol = String.fromCharCode(176);


        function mouseClickPlot() {
            activeState = undefined;
            updateMap(year_value, month_value);
            activeState = d3.select(this);
            activeState.style("fill", "honeydew");
            console.log(idToState[activeState.attr("ident")]);
            d3.select("h2#state").text(idToState[activeState.attr("ident")]);
            d3.select("h2#temp").text(adjustedTemp((activeData[stateToData[idToState[activeState.attr("ident")]]])[display]) + degreeSymbol + degree);
            map.selectAll(".state").attr("opacity", 1);
            updateGraphs(year_value, month_value);
        }

        var prevState;

        function mouseOnPlot() {
            hoverBox.style("left", event.pageX - (hoveBoxWidth / 2) + "px")
                .style("top", event.pageY - (hoverBoxHeight + 20) + "px")
                .html("")
                .style("opacity", 1);


            let state = d3.select(this);
            let dataRow = activeData[stateToData[idToState[state.attr("ident")]]];
            hoverBox.append("div").text(idToState[state.attr("ident")]);
            hoverBox.append("div").text("Min Value " + adjustedTemp(dataRow.MinValue) + degreeSymbol + degree);
            hoverBox.append("div").text("Avg Value " + adjustedTemp(dataRow.AvgValue) + degreeSymbol + degree);
            hoverBox.append("div").text("Max Value " + adjustedTemp(dataRow.MaxValue) + degreeSymbol + degree);
            if (prevState === undefined) {
                prevState = state;
            }
            if (prevState !== undefined && (idToState[prevState.attr("ident")]) !== idToState[state.attr("ident")]) {
                prevState.attr("opacity", 1);
                prevState = state;
            } else {

                if (activeState == undefined || (idToState[state.attr("ident")] !== idToState[activeState.attr("ident")])) {
                    state.attr("opacity", .7)
                };
            }

        }

        function mouseLeavesPlot() {
            hoverBox.style("opacity", 0);
            if (prevState !== undefined) prevState.attr("opacity", 1);
        }

        function overlay() {
            hoverBox.style("opacity", 1);
        }



        //  Credit Prof. Rz. Adapted as needed
        const legendBox = d3.select("#usaMapLegend");
        const legendBoxWidth = legendBox.attr("width");
        const legendBoxHeight = legendBox.attr("height");
        const barHeight = 25;
        const stepSize = 5;


        let legendMargin = {
            top: 40,
            right: 10,
            bottom: 20,
            left: 10
        };
        const legendWidth = legendBoxWidth - legendMargin.left - legendMargin.right;
        const legendHeight = legendBoxHeight - legendMargin.top - legendMargin.bottom;


        const pixelScale = d3.scaleLinear()
            .domain([0, legendWidth])
            .range([minMax[0], minMax[1]]); // In this case the "data" are pixels, and we get numbers to use in colorScale
        const barScale = d3.scaleLinear()
            .domain([minMax[0], minMax[1]])
            .range([0, legendWidth]);
        const barAxis = d3.axisBottom(barScale);


        legendBox.html("");


        legendBox.append("g")
            .attr("class", "legendAxis")
            .style("stroke", "white")
            .style("stroke-width", ".5px")
            .attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top + ")")
            .call(barAxis);

        // Draw rects of color down the bar
        let bar = legendBox.append("g").attr("transform", "translate(" + (10) + "," + (10) + ")")
        for (let i = 0; i < legendWidth; i = i + stepSize) {
            bar.append("rect")
                .attr("x", i)
                .attr("y", 0)
                .attr("width", stepSize)
                .attr("height", barHeight)
                .style("fill", colorScale(pixelScale(i))); // pixels => countData => color
        }

    }
    


    //Create array of years 
    var years = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 
        2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];


    //Set default month and year to January 2001
    let default_year = 2001;
    let default_month = 1;

    //Create list of month names
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month = months[default_month - 1];
    var prevMonthID = month;




    //Select divs to put dropdown and slider
    var slidersDiv = d3.select("#sliders").append("div"); 
    var month_text = document.getElementById("month");


    var dropdownDiv = d3.select("#dropdown").append("select").style("cursor", "pointer");



    var year_text = document.getElementById("year");


    //Set initial values of year and month
    year_value = default_year;
    month_value = default_month;
    year_text.innerHTML = year_value;
    month_text.innerHTML = months[month_value - 1];



    //Create options for each year in the dropdown

    years.forEach(function (d, i) {
        dropdownDiv.append("option")
            .text(d)
            .attr("value", d);
    });

    //Update the map and graphs based on selected year
    dropdownDiv.on("input", function () {
        year_value = Number(this.value);
        year_text.innerHTML = year_value;
        updateMap(year_value, month_value);
        updateGraphs(year_value, month_value);

    });



    //Create month slider; updates the maps and graph based on given month
    //If line and bar graphs have been drawn, slider changes the rectangle placement of selected month on line graph
    slidersDiv.append("div").text("Month");
    slidersDiv.append("div")
        .append("input")
        .attr("type", "range")
        .attr("class", "slider")
        .attr("id", "month")
        .style("width", "660px")
        .attr("min", 0)
        .attr("max", 11)
        .style("cursor", "pointer")
        .attr("onload", function () {
            console.log(this);
            this.value = 0;
            activeSlider = this;

        })
        .on("input", function () {
           // console.log(this);
            activeSlider = this;
            // console.log(this.value);

            prevMonthID = month;

            month = months[this.value];
            month_value = Number(this.value) + 1;
            month_text.innerHTML = month;
            updateMap(year_value, month_value);

            updateGraphs(year_value, month_value);     

        });


    //By default, draw US map with selected data of January 2001
    updateMap(default_year, default_month);



    /****** Bar Graph *******/
    var svgType = d3.select("#producerType"); // bar graph
    var svgTypeWidth = svgType.attr("width");
    var svgTypeHeight = svgType.attr("height");
    var margin = {
        top: 20,
        right: 0,
        bottom: 50,
        left: 60
    };
    var typeChartWidth = svgTypeWidth - margin.left - margin.right;
    var typeChartHeight = svgTypeHeight - margin.top - margin.bottom;

    /****** Line Graph *******/
    var svgGen = d3.select("#yearlyGeneration"); // line graph
    var svgGenWidth = svgGen.attr("width");
    var svgGenHeight = svgGen.attr("height");
    var genChartWidth = svgGenWidth - margin.left - margin.right;
    var genChartHeight = svgGenHeight - margin.top - margin.bottom;


    // import data
    let energyData = await d3.csv("Data/CombinedEnergy.csv", d3.autoType);




    var cleanData = energyData.filter(d => d['GENERATION'] !== NaN &&
        d['GENERATION'] > 0 &&
        d['GENERATION'].length !== 0);

    //Clear graphs of all drawn elements and reset the "consumed" textbox 
    function clearGraphs() {

        svgType.selectAll("text").remove();
        svgType.selectAll("g").remove();
        svgType.selectAll(".bar").remove();

        svgGen.selectAll("path.line").remove();
        svgGen.selectAll("text").remove();
        svgGen.selectAll("g").remove();
        svgGen.selectAll(".bar").remove();

        d3.select("#coal").text("Coal: 0 Short Tons");
        d3.select("#gas").text("Natural Gas: 0 Mcf");
        d3.select("#petrol").text("Petroleum: 0 Barrels");

    }

    //Updates the line and bar graphs based on selected year nad month
    function updateGraphs(activeYear, activeMonth) {

        //Reset the graphs
        clearGraphs();

        d3.select("#barHead").text(" Fuel Types for SELECT STATE ABOVE for " + months[(activeMonth-1)]+ " " + activeYear);
        d3.select("#consumed").text(months[(activeMonth-1)]+ " Fuel Usage for SELECT STATE ABOVE");
        d3.select("#lineHead").text("Energy Generation for SELECT STATE FROM MAP for " + activeYear);

        //Do this only if a state has been selected
        if (activeState !== undefined) {

            var activeData = cleanData.filter(d =>
                d['YEAR'] === activeYear &&
                d['STATE'] === idToState[activeState.attr("ident")]);





            /*************/
            /* Bar graph */
            /*************/

            var coal = "Coal: "
            var coalN = "0";
            var coalU = " Million Short Tons";
            var gas = "Natural Gas: "
            var gasN = "0";
            var gasU = " Mcf";
            var petrol = "Petroleum: "
            var petrolN = "0";
            var petrolU = " Barrels";

            var activeDataBar = activeData.filter(d => d['MONTH'] === activeMonth &&
                d['ENERGY_SOURCE'] !== 'Total');
            console.log(activeDataBar);

            var activeDataBarScale = activeData.filter(d => d['ENERGY_SOURCE'] !== 'Total');
            console.log(activeDataBarScale);



            var coalP = d3.precisionPrefix(1e4, 1.3e6);
            var coalF = d3.formatPrefix("." + coalP, 1.3e6);

            var petrolP = d3.precisionPrefix(1e4, 1.3e6);
            var petrolF = d3.format(".03s");

            activeDataBar.forEach(d => {
                if (d.ENERGY_SOURCE === "Coal") {
                    coalN = coalF(d.CONSUMPTION).slice(0,-1);
                } else if (d.ENERGY_SOURCE === "Natural Gas") {
                    gasN = coalF(d.CONSUMPTION).slice(0,-1);
                } else if (d.ENERGY_SOURCE === "Petroleum") {
                    petrolN = petrolF(d.CONSUMPTION);
                }
            });



            d3.select("#lineHead").text("Energy Generation for " + idToState[activeState.attr("ident")] + " for " + activeYear);
            d3.select("#barHead").text(" Fuel Types for " + idToState[activeState.attr("ident")] + " for " + months[(activeMonth-1)]+ " " + activeYear);
            d3.select("#consumed").text(months[(activeMonth-1)]+ " Fuel Usage for " + idToState[activeState.attr("ident")]);
            d3.select("#coal").text(coal + coalN + coalU);
            d3.select("#gas").text(gas + gasN + gasU);
            d3.select("#petrol").text(petrol + petrolN + petrolU);

            //  console.log(d3.select("#coal").text(coalN+coalU)); 
            //  console.log(d3.select("#gas").text(gasN+gasU)); 
            //  console.log(d3.select("#petrol").text(petrolN+petrolU)); 
            //scales
            // y scale

            
            var mwMin = d3.min(activeDataBarScale, d => d['GENERATION']);
            var mwMax = d3.max(activeDataBarScale, d => d['GENERATION']);
            var mwScale = d3.scaleLinear()
                .domain([mwMin, mwMax])
                .range([typeChartHeight, 20]);
            // check the data
       //      console.log(mwMax);
        //     console.log(mwMin); //have negative values


            // y scales -> Energy Generated
            // const genMin = d3.min(activeDataLine, d => d['GENERATION']);
            // const genMax = d3.max(activeDataLine, d => d['GENERATION']);
            // const genScale = d3.scaleLinear().domain([genMin, genMax]).range([genChartHeight, 40]);

        

            //x scale
            var typeScale = d3.scaleBand()
                .rangeRound([margin.left, typeChartWidth + 30])
                .padding(0.4)
                .domain(activeDataBar.map(function (d) {
                    return d['ENERGY_SOURCE'];
                }));



            var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            // axis
            // y axis
            var p = d3.precisionPrefix(1e5, 1.3e6);
            var f = d3.formatPrefix("." + p, 1.3e6);

            var mwAxis = d3.axisLeft(mwScale).tickFormat(d => f(d).slice(0, -1));
            svgType.append("g")
                .attr("class", "left axis")
                .attr("transform", "translate(" + (margin.left) + "," + (margin.top - 10) + ")")
                .call(mwAxis);

            // x axis and get tick x positions
            var typeAxis = d3.axisBottom(typeScale);
            var typeTickArray = [];
            svgType.append("g")
                .attr("class", "bottom axis")
                .attr("transform", "translate(5," + (typeChartHeight + 30) + ")")
                .call(typeAxis).selectAll(".tick").each(function (data) {


                     var tick = d3.select(this);
                     var string = tick.attr("transform");
                     var translate = string.substring(string.indexOf("(")+1, string.indexOf(")")).split(",");
                   

                    typeTickArray.push(Number(translate[0])-10);
                });
                console.log("Tick: " + typeTickArray);

            // labels
            // x label
            svgType.append("text")
                .attr("class", "x axis label")
                .attr("x", svgTypeWidth / 2)
                .attr("y", svgTypeHeight - 8)
                .attr("font-size", "14px")
                .attr("text-anchor", "middle")
                .text("Types of Source");

            // y label
            svgType.append("text")
                .attr("class", "y axis label")
                .attr("x", -svgTypeHeight / 2)
                .attr("y", 20)
                .attr("font-size", "14px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Generation(MWh)");

            //bar



            var consumptionString;

            //Draw bars on top of tick marks
            var bar = svgType.selectAll(".bar")
                .data(activeDataBar)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("fill", "rgb(97, 183, 202)")
                .attr("x", function (d,i) {
                    console.log(d);
                    console.log(typeTickArray[i]);
                    return typeTickArray[i];
                })
                .attr("y", function (d) {
                    return mwScale(d.GENERATION);
                })
                .attr("id", d => d.ENERGY_SOURCE)
                .attr("width", 30)
                .attr("height", function (d) {
                    return typeChartHeight + 30 - mwScale(d.GENERATION)
                });




            /*************/
            /* line graph */
            /*************/


            var activeDataLine = activeData.filter(d => d['ENERGY_SOURCE'] === 'Total');
     

            const yearMin = d3.min(activeDataLine, d => d['YEAR']);
            const yearMax = d3.max(activeDataLine, d => d['YEAR']);
        


            //x scales --> Month
            const monthMin = d3.min(activeDataLine, d => d['MONTH']);
            const monthMax = d3.max(activeDataLine, d => d['MONTH']);
            const monthScale = d3.scaleLinear().domain([monthMin, monthMax]).range([0, genChartWidth - 50]);

    
       

            // y scales -> Energy Generated
            const genMin = d3.min(activeDataLine, d => d['GENERATION']);
            const genMax = d3.max(activeDataLine, d => d['GENERATION']);
            const genScale = d3.scaleLinear().domain([genMin, genMax]).range([genChartHeight, 40]);

        


            //Create an offset to correctly place d3 line over axes
            var xAxisOffsetLine =  130; 
           

            //Create y axis
            var genAxis = d3.axisLeft(genScale).tickFormat(d => f(d).slice(0,-1));
            svgGen.append("g")
                .attr("class", "left axis")
                .attr("transform", "translate(" + (margin.left) + "," + 0 + ")")
                .call(genAxis);

            // Create x axis and get array of x pixel locations of the month ticks
            var monthAxis = d3.axisBottom(monthScale);
            var monthTickArray = [];
            svgGen.append("g")
                .attr("class", "bottom axis")
                .attr("transform", "translate(80," + (genChartHeight + 30) + ")")
                .call(monthAxis).selectAll(".tick").each(function (data) {


                     var tick = d3.select(this);
                     var string = tick.attr("transform");
                     var translate = string.substring(string.indexOf("(")+1, string.indexOf(")")).split(",");
                   

                    monthTickArray.push(Number(translate[0]) + 80);
                });

          //  console.log(monthTickArray);

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
                .attr("x", -svgGenHeight / 2)
                .attr("y", 20)
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Generation(MWh)");


            
            //Create and draw curved line that shows energy generated

            var line = d3.line()
                .x(function (d, i) {
                    return monthScale(i) + xAxisOffsetLine;
                })
                .y(function (d) {
                    return genScale(d.GENERATION);
                })
                .curve(d3.curveCardinal);

            svgGen.append("path")
                .datum(activeDataLine)
                .attr("class", "line")
                .attr('d', line);


            //Draw translucent box region over selected month on line graph
            drawActiveMonth(month, prevMonthID, month_value - 1);

            svgGen.on("mousemove", function (d) {
                //Draw a vertical line cursor that follows mouse movement over the line graph
                if (activeState !== undefined) {

                    let [x, y] = d3.mouse(this);
                    // console.log(x);
                    // console.log(activeState);

                    if (x <= 80) {
                        x = 80;

                    }
                    else if (x>=640){ 
                        x = 640;
                    }
                    else{
                        svgGen.select("#line").remove();        

                        svgGen.append("line")
                            .style("stroke", "red")
                            .attr("id", "line")
                            .attr("x1", x)
                            .attr("x2", x)
                            .attr("y1", 0)
                            .attr("y2", genChartHeight + 30);

                    }
                }
            });


            //Line cursor disappears upon leaving the line graph SVG
            svgGen.on("mouseleave",function(d){
                svgGen.selectAll("#line").remove();
            });

            //Change active month to the month closest to where the user clicked on the line chart. Draw box over selected month
            //Update map and graphs accordingly
            svgGen.on("click",function(d){
                if (activeState!==undefined){
                    let [x, y] = d3.mouse(this);
                    let distanceArr = monthTickArray.map(function (value) {
                        return Math.abs(value - x);
                    });
                    let closestMonth = distanceArr.indexOf(Math.min(...distanceArr));

                    prevMonthID = month;
                    month = months[closestMonth];
                    month_text.innerHTML = month;
                    month_value = closestMonth + 1;

                    activeSlider.value = closestMonth;

                    updateMap(year_value, month_value);
                    updateGraphs(year_value, month_value);
                }
            });


            //Draws a box over the selected month on the line chart. Removes previously drawn boxes
            function drawActiveMonth(month_id, prevMonthID, currMonth){
                 //console.log(prevMonthID);
                 d3.select("#" + prevMonthID).remove();
                 svgGen.append("rect")

                    .attr("class", "bar")
                    .attr("fill", "black")
                    .style("opacity", .4)
                    .attr("x", function () {
                        return monthScale(currMonth) - 20 + xAxisOffsetLine;
                    })
                    .attr("y", function () {
                        return 0;
                    })
                    .attr("id", month_id)
                    .attr("width", 40)
                    .attr("height", function (d) {
                        return genChartHeight + 30
                    });

            }

        }
    }





}



//Call geoData data promise
geoData();