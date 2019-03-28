let usaMap = d3.select("#usa");
let svgMapWidth = usaMap.attr("width");
let svgMapHeight = usaMap.attr("height");
let svgMapMargin = {
    top: -40,
    right: 20,
    bottom: 30,
    left: 20
};
const mapWidth = svgMapWidth - svgMapMargin.left - svgMapMargin.right;
const mapHeight = svgMapHeight - svgMapMargin.top - svgMapMargin.bottom;
const map = usaMap.append("g")
    .attr("transform", "translate(" + svgMapMargin.left + "," + svgMapMargin.top + ")");


let degree = "F";

var year_value;
var month_value;
var activeState;

let stateTemps = {};
let idToState = {};
let stateToData = {};


const geoData = async () => {

    //Geo variables
    const usa = await d3.json("Data/us.json");
    // console.log(usa);

    const stateIDs = await d3.tsv("Data/us-state-names.tsv");
    // console.log(stateIDs);




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



    let fulldata = await d3.csv("Data/combinedWeather.csv", d3.autoType);

    console.log(fulldata);

    //   let activeYear = 2015;
    //  let activeMonth = 4;



    let display = "AvgValue";
    let minButton = d3.select("button#MinValue");
    let avgButton = d3.select("button#AvgValue");
    let maxButton = d3.select("button#MaxValue");
    let displayValue = d3.select("#displayValue");

    let f = d3.select("button#F");
    let c = d3.select("button#C");

    let displayButton = d3.select("#" + display);
    displayButton.attr("disabled", "null");
    displayValue.text("Displaying: " + displayButton.text());

    minButton.on("click", function () {
        setDisplayButton("MinValue");
    });

    avgButton.on("click", function () {
        setDisplayButton("AvgValue");
    });

    maxButton.on("click", function () {
        setDisplayButton("MaxValue");
    });

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
        d3.select("h2#state").text("");
        displayButton = d3.select("#" + display);
        displayButton.attr("disabled", null);
        display = newDisplay;
        displayButton = d3.select("#" + display);
        displayButton.attr("disabled", "true");
        // displayValue.text("Displaying: "+display);
        displayValue.text("Displaying: " + displayButton.text());
        updateMap(year_value, month_value);
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
    }

    function adjustedTemp(temp) {
        if (degree === "C") {
            calc = (temp - 32) * 5 / 9;
            return Math.round(calc * 10) / 10;

        } else {
            return temp;
        }
    }


    var hoverBox = d3.select("body").append("div")
        .attr("class", "hoverBox")
        .style("opacity", 0)


    function updateMap(activeYear, activeMonth) {
        activeData = fulldata.filter(d => d['YEAR'] === activeYear && d['MONTH'] === activeMonth);
        // console.log("DATA");
        // console.log(activeData);





        stateIDs.forEach(row => {
            stateTemps[row.name] = 0;
            idToState[row.id] = row.name;
        });
        // console.log(idToState);
        // console.log(activeData);
        // console.log(stateTemps);


        activeData.forEach((row, i) => {
            stateTemps[row.STATE] = adjustedTemp(row[display]);
            stateToData[row.STATE] = i;
        });
        // console.log(stateTemps);
        // console.log(stateToData);




        const minMax = d3.extent(fulldata, d => adjustedTemp(d.AvgValue));
        // console.log("MinMax");
        // console.log(minMax);



        //   let colorScale = d3.scaleLinear()
        //   .domain(minMax)
        //   .range(["blue", "red"])
        //   .clamp(true)
        //   .interpolate(d3.interpolateHcl);

        // const colorScale = d3.scaleOrdinal(d3.schemeCategory10);


        //const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain(minMax);

        // const colorScale = d3.scaleQuantile()
        //     .domain(d3.values(d3.values(stateTemps)))
        //     .range(["navy", "blue", "lightblue", "lightpink", "red","maroon"]);

        const colorScale = d3.scaleQuantize()
            .domain(minMax)
            // .range(["navy", "blue", "lightblue", "lightpink", "red",d3.rgb(98,34,40)]);
            .range([d3.rgb(31, 21, 62), d3.rgb(46, 63, 111), d3.rgb(1, 93, 161), d3.rgb(57, 159, 220), d3.rgb(230, 140, 75), d3.rgb(219, 86, 49), d3.rgb(168, 39, 35), d3.rgb(98, 34, 40)]);


        map.selectAll(".state")
            .style("fill", d => colorScale(stateTemps[idToState[d.id]]));

        //console.log("activeState");    
        // console.log(activeState);   
        if (activeState !== undefined) {
            activeState.style("fill", "honeydew");
            //  console.log(idToState[activeState.attr("ident")]);
        }


        d3.selectAll(".state").on("mousemove", mouseOnPlot)
            .on("mouseout", mouseLeavesPlot)
            .on("click", mouseClickPlot);
        d3.selectAll(".outline").on("mouseover", overlay)
            .on("mouseout", mouseLeavesPlot);

        var hoveBoxWidth = parseFloat(hoverBox.style("width"));
        var hoverBoxHeight = parseFloat(hoverBox.style("height"));

        function mouseClickPlot() {
            activeState = undefined;
            updateMap(year_value, month_value);
            activeState = d3.select(this);
            activeState.style("fill", "honeydew");
            console.log(idToState[activeState.attr("ident")]);
            d3.select("h2#state").text(idToState[activeState.attr("ident")]);
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
            let degreeSymbol = String.fromCharCode(176);
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
        const barHeight = 30;
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

        //     const pixelScale = d3.scaleLinear()
        //     .domain([0, legendWidth])
        //   // .range([adjustedTemp(minMax[0]), adjustedTemp(minMax[1])]); // In this case the "data" are pixels, and we get numbers to use in colorScale
        //   .range(minMax[0],minMax[1]);
        // const barScale = d3.scaleLinear()
        //     //.domain([adjustedTemp(minMax[0]), adjustedTemp(minMax[1])])
        //     .domain(minMax[0],minMax[1])
        //     .range([0, legendWidth]);

        legendBox.html("");

        // console.log(adjustedTemp(barScale));
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
    //https://jeffrz.github.io/info3300-spr2019/notes/19.03.11.notes.htm


    var years = [2013, 2014, 2015, 2016, 2017, 2018];

    let default_year = 2013;
    let default_month = 1;

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var slidersDiv = d3.select("#sliders").append("div"); 

    var month_text = document.getElementById("month");

    var dropdownDiv = d3.select("#dropdown").append("select");

  //  var slidersDiv = d3.select("#sliders").append("input");

    var year_text = document.getElementById("year");

    // var state_text = document.getElementById("state");
    //slidersDiv.attr("type", "range").style("width", "600px");

    year_value = default_year;
    month_value = default_month;

    year_text.innerHTML = year_value;
    month_text.innerHTML = months[month_value - 1];


   
    years.forEach(function (d, i) {
        dropdownDiv.append("option")
            .text(d)
            .attr("value", d);

    });

    dropdownDiv.on("input", function () {
        year_value = Number(this.value);
        year_text.innerHTML = year_value;
        updateMap(year_value, month_value);
        updateGraphs(year_value, month_value);

    });

/*
    months.forEach(function(d, i){
        slidersDiv.append("option")
            .attr("label", d[i])
            .attr("value", d);

    });

*/

    slidersDiv.append("div").text("Month")
        .append("div").append("input")
        .attr("type", "range")
        .attr("class", "slider")
        .attr("id", "month")
        .style("width", "660px")
        .style("margin", "5px 25px 0")
        .attr("min", 0)
        .attr("max", 11)
        .attr("value", 0)
        .on("input", function () {
            month = months[this.value];
            // console.log(this.value);
            month_value = Number(this.value) + 1;
            month_text.innerHTML = month;
            updateMap(year_value, month_value);
            updateGraphs(year_value, month_value);

        });





    updateMap(default_year, default_month);






























    /****** Bar Graph *******/
    var svgType = d3.select("#producerType"); // bar graph
    var svgTypeWidth = svgType.attr("width");
    var svgTypeHeight = svgType.attr("height");
    var margin = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 50
    };
    var typeChartWidth = svgTypeWidth - margin.left - margin.right;
    var typeChartHeight = svgTypeHeight - margin.top - margin.bottom;

    /****** Line Graph *******/
    var svgGen = d3.select("#yearlyGeneration"); // line graph
    var svgGenWidth = svgGen.attr("width");
    var svgGenHeight = svgGen.attr("height");
    var genChartWidth = svgGenWidth - margin.left - margin.right;
    var genChartHeight = svgGenHeight - margin.top - margin.bottom;

    // var energySource = [];

    // import data
    let energyData = await d3.csv("Data/CombinedEnergy.csv", d3.autoType);

    // let fullata = await d3.csv("Data/combinedWeather.csv", d3.autoType);


    var cleanData = energyData.filter(d => d['GENERATION'] !== NaN &&
        d['GENERATION'] > 0 &&
        d['GENERATION'].length !== 0);


    function updateGraphs(activeYear, activeMonth) {

        svgGen.selectAll("path.line").remove();
        svgType.selectAll("text").remove();
        svgType.selectAll("g").remove();
        svgType.selectAll(".bar").remove();

        svgGen.selectAll("text").remove();
        svgGen.selectAll("g").remove();
        if (activeState !== undefined) {

            // console.log("UPDATE");

            // console.log(year_value);
            // console.log(month_value);
            // console.log(activeState);
            // console.log(idToState[activeState.attr("ident")]);


            // stateToData[idToState[state.attr("ident")]]
            // idToState[activeState.attr("ident")]


            var activeData = cleanData.filter(d =>
                d['YEAR'] === activeYear &&
                d['STATE'] === idToState[activeState.attr("ident")]);


            //  console.log(activeData); //filtered data


            /*************/
            /* Bar graph */
            /*************/


            var activeDataBar = activeData.filter(d => d['MONTH'] === activeMonth);
            // console.log(activeDataBar);

            //scales
            // y scale


            var mwMin = d3.min(activeDataBar, d => d['GENERATION']);
            var mwMax = d3.max(activeDataBar, d => d['GENERATION']);
            var mwScale = d3.scaleLinear()
                .domain([mwMin, mwMax])
                .range([typeChartHeight, 20]);
            // check the data
            // console.log(mwMax);
            // console.log(mwMin); //have negative values

            //x scale
            var typeScale = d3.scaleBand()
                .rangeRound([margin.left, typeChartWidth - 50])
                .padding(0.4)
                .domain(activeDataBar.map(function (d) {
                    return d['ENERGY_SOURCE'];
                }));

            console.log(typeScale);
            var colorScale = d3.scaleOrdinal().range(d3.schemeCategory10)
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
                .attr("transform", "translate(100," + (typeChartHeight + 30) + ")")
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
                .attr("x", -svgTypeHeight / 2)
                .attr("y", 20)
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Generation(MWh)");

            //bar

            var xAxisOffsetBar =  125; //Not sure how to calculate given our variables and parameters
            var bar = svgType.selectAll(".bar")
                .data(activeDataBar)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return typeScale(d.ENERGY_SOURCE) + xAxisOffsetBar;
                })
                .attr("y", function (d) {
                    return mwScale(d.GENERATION);
                })
                .attr("fill", function (d) {return colorScale(d.ENERGY_SOURCE);})
                .attr("width", 30)
                .attr("height", function(d) { return typeChartHeight + 30 - mwScale(d.GENERATION) });
            // .attr("transform", function(d) { return "translate(" +  + ",0)"; });


            /*************/
            /* line graph */
            /*************/


            var activeDataLine = activeData.filter(d => d['ENERGY_SOURCE'] === 'Total');
            //console.log(activeDataLine);

            const yearMin = d3.min(activeDataLine, d => d['YEAR']);
            const yearMax = d3.max(activeDataLine, d => d['YEAR']);
            // console.log(yearMin);
            // console.log(yearMax);


            //x month, y generation
            const monthMin = d3.min(activeDataLine, d => d['MONTH']);
            const monthMax = d3.max(activeDataLine, d => d['MONTH']);
            const monthScale = d3.scaleLinear().domain([monthMin, monthMax]).range([0, genChartWidth - 50]);

            //console.log(monthMin);
            //console.log(monthMax);

            // y value
            const genMin = d3.min(activeDataLine, d => d['GENERATION']);
            const genMax = d3.max(activeDataLine, d => d['GENERATION']);
            const genScale = d3.scaleLinear().domain([genMin, genMax]).range([genChartHeight, 0]);

            // console.log(genMin);
            // console.log(genMax);

            // y axis
            var genAxis = d3.axisLeft(genScale);
            svgGen.append("g")
                .attr("class", "left axis")
                .attr("transform", "translate(" + (margin.left + 50) + "," + margin.top + ")")
                .call(genAxis);

            // x axis
            var monthAxis = d3.axisBottom(monthScale);
            svgGen.append("g")
                .attr("class", "bottom axis")
                .attr("transform", "translate(100," + (genChartHeight + 30) + ")")
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
                .attr("x", -svgGenHeight / 2)
                .attr("y", 20)
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Generation(MWh)");

            // draw line
            var xAxisOffsetLine =  162; //Not sure how to calculate given our variables and parameters
            console.log(svgGenWidth);
            var line = d3.line()
                .x(function (d, i) {
                    return monthScale(i) + xAxisOffsetLine;
                })
                .y(function (d) {
                    return genScale(d.GENERATION);
                });

            svgGen.append("path")
                .datum(activeDataLine)
                .attr("class", "line")
                .attr('d', line);

        }
    }



}




geoData();