let usaMap = d3.select("#usa");
let svgMapWidth = usaMap.attr("width");
let svgMapHeight = usaMap.attr("height");
let svgMapMargin = {
    top: 0,
    right: 20,
    bottom: 0,
    left: 0
};
const mapWidth = svgMapWidth - svgMapMargin.left - svgMapMargin.right;
const mapHeight = svgMapHeight - svgMapMargin.top - svgMapMargin.bottom;
const map = usaMap.append("g")
    .attr("transform", "translate(" + svgMapMargin.left + "," + svgMapMargin.top + ")");


let degree = "F";


const geoData = async () => {

    //Geo variables
    const usa = await d3.json("Data/us.json");
    // console.log(usa);

    const stateIDs = await d3.tsv("Data/us-state-names.tsv");
    console.log(stateIDs);




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


    console.log("states");
    console.log(d3.selectAll(".state"));

    let stateDrawings = d3.selectAll(".state");
    stateDrawings._groups[0][1].remove();
    stateDrawings._groups[0][11].remove();


    map.append("path")
        .datum(statesMesh)
        .attr("class", "outline")
        .attr("d", path);



    let fulldata = await d3.csv("Data/combinedWeather.csv", d3.autoType);

    console.log(fulldata);

    //   let activeYear = 2015;
    //  let activeMonth = 4;


    function updateMap(activeYear, activeMonth) {
        activeData = fulldata.filter(d => d['YEAR'] === activeYear && d['MONTH'] === activeMonth);
        console.log("DATA")
        console.log(activeData);

        let stateTemps = {};
        let idToState = {};
        let stateToData = {};
        stateIDs.forEach(row => {
            stateTemps[row.name] = 0;
            idToState[row.id] = row.name;
        });
        // console.log(idToState);
        // console.log(activeData);
        // console.log(stateTemps);


        activeData.forEach((row, i) => {
            stateTemps[row.STATE] = row.AvgValue;
            stateToData[row.STATE] = i;
        });
        //console.log(stateTemps);
        // console.log(stateToData);




        const minMax = d3.extent(fulldata, d => d.AvgValue);
        console.log("MinMax");
        console.log(minMax);



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
            .range([d3.rgb(28,19,66), d3.rgb(46,63,111), d3.rgb(1,93,161), d3.rgb(57,159,220)
                , d3.rgb(219,86,49), d3.rgb(200,45,40), d3.rgb(204,48,71), d3.rgb(98,34,40)]);


        map.selectAll(".state")
            .style("fill", d => colorScale(stateTemps[idToState[d.id]]));


        var hoverBox = d3.select("body").append("div")
            .attr("class", "hoverBox")
            .style("opacity", 0)

        d3.selectAll(".state").on("mousemove", mouseOnPlot);
        d3.selectAll(".state").on("mouseout", mouseLeavesPlot);
        d3.selectAll(".outline").on("mouseover", overlay);
        d3.selectAll(".outline").on("mouseout", mouseLeavesPlot);

        var hoveBoxWidth = parseFloat(hoverBox.style("width"));
        var hoverBoxHeight = parseFloat(hoverBox.style("height"));

        function mouseOnPlot() {
            hoverBox.style("left", event.pageX - (hoveBoxWidth / 2) + "px")
                .style("top", event.pageY - (hoverBoxHeight + 20) + "px")
                .html("")
                .style("opacity", 1);


            let state = d3.select(this);
            let dataRow = activeData[stateToData[idToState[state.attr("ident")]]];
            let degreeSymbol = String.fromCharCode(176);
            hoverBox.append("div").text(idToState[state.attr("ident")] + " " + dataRow.AvgValue + degreeSymbol + degree);
            hoverBox.append("div").text("Min Value " + dataRow.MinValue + degreeSymbol + degree);
            hoverBox.append("div").text("Max Value " + dataRow.MaxValue + degreeSymbol + degree);

        }

        function mouseLeavesPlot() {
            hoverBox.style("opacity", 0);
        }

        function overlay() {
            hoverBox.style("opacity", 1);
        }








        //  Credit Prof. Rz. Adapted as needed
        const legend = d3.select("#usaMapLegend");
        const legendWidth = legend.attr("width");
        const legendHeight = legend.attr("height");
        const barHeight = 30;
        const stepSize = 1;

        const pixelScale = d3.scaleLinear()
            .domain([0, legendWidth])
            .range([minMax[0], minMax[1]]); // In this case the "data" are pixels, and we get numbers to use in colorScale
        const barScale = d3.scaleLinear()
            .domain([minMax[0], minMax[1]])
            .range([0, legendWidth]);
        const barAxis = d3.axisBottom(barScale);

        legend.html("");

        legend.append("g")
            .attr("class", "legendAxis")
            .style("stroke", "white")
            .style("stroke-width", ".5px")
            .attr("transform", "translate(" + (20) + "," + (barHeight + 5) + ")")
            .call(barAxis);

        // Draw rects of color down the bar
        let bar = legend.append("g").attr("transform", "translate(" + (20) + "," + (0) + ")")
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





    //https://jeffrz.github.io/info3300-spr2019/notes/19.03.11.notes.htm
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let month = "January";
    //geoData(2012, 1);
    var slidersDiv = d3.select("#sliders").append("div").style("float", "right"); // Floats are dangerous!

    var month_text = document.getElementById("month");

    month_text.innerHTML = month;
    slidersDiv.append("div").text("Month")
        .append("div").append("input")
        .attr("type", "range").attr("class", "slider")
        .attr("id", "month")
        .style("width", "300px")
        .attr("min", 0)
        .attr("max", 11)
        .attr("value", 0)
        .on("input", function () {
            // Whenever the slider changes, update intercept and chart
            month = months[this.value];
            console.log(this.value);
            month_text.innerHTML = month;
            updateMap(2015, Number(this.value) + 1);

        });







}




geoData();