let usaMap = d3.select("#usa");
let svgMapWidth = usaMap.attr("width");
let svgMapHeight = usaMap.attr("height");
let svgMapMargin = {
    top: 10,
    right: 20,
    bottom: 10,
    left: 0
};
const mapWidth = svgMapWidth - svgMapMargin.left - svgMapMargin.right;
const mapHeight = svgMapHeight - svgMapMargin.top - svgMapMargin.bottom;
const map = usaMap.append("g")
    .attr("transform", "translate(" + svgMapMargin.left + "," + svgMapMargin.top + ")");




const geoData = async () => {

    //Geo variables
    const usa = await d3.json("Data/us.json");
    console.log(usa);

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


    map.append("path")
        .datum(statesMesh)
        .attr("class", "outline")
        .attr("d", path);



    const testdata = await d3.csv("Data/testdata.csv");

    let idToState = {};
    stateIDs.forEach(row => {
        idToState[row.id] = row.name;
    });
    console.log(idToState);
    console.log(testdata);

    
    // testdata.forEach( row => {
    //   let splitRow = row.Boxes.split(", ");
    //   splitRow.forEach( state => {
    //     stateCounts[state] += 1;
    //   });
    // });
    //console.log(stateCounts);


    const minMax = d3.extent(testdata, d => d.Temp);
    console.log(minMax);

    console.log("HERE");

    console.log(d3.values(idToState));
    console.log(testdata);

   // const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

   // const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain(minMax);
    const colorScale = d3.scaleQuantile()
        .domain(d3.values(testdata.Temp))
        .range(["#f6fbfc", "#adc2da", "#8879b3", "#762b80"]);
    // const colorScale = d3.scaleQuantize()
    //                       .domain(minMax)
    //                       .range(["#f6fbfc","#adc2da","#8879b3","#762b80"]);

                          
    // let mapStates = map.selectAll(".state");
    // console.log(mapStates);
    // mapStates.forEach((d) => {
    //     console.log(d3.this);
    // });


    map.selectAll(".state")
        //.style("fill", "blue");
        .style("fill", colorScale(200));


        console.log("Test");
        console.log(colorScale(d => d.Temp));
        console.log( d => colorScale(d.Temp));
        console.log(colorScale(20));
        console.log(colorScale(30));
        console.log(colorScale(40));
        console.log(colorScale(1000));



    // var hoverBox = d3.select("body").append("div")
    // .attr("class", "hoverBox")
    // .attr("opacity", 0)
    // .style("background-color", "blue");

    // d3.selectAll(".state").on("mousemove", mouseOnPlot);
    // d3.selectAll(".state").on("mouseout", mouseLeavesPlot);


    // function mouseOnPlot() {
    //     console.log("move");
    //     hoverBox.style("left", 50)
    //         .style("top", 50)
    //         .html("")
    //         .attr("opacity", 1);

    //     let state = d3.select(this);
    //     hoverBox.append("div").text(idToState[state.attr("ident")]);
    // }

    // function mouseLeavesPlot() {
    //     hoverBox.attr("opacity", 0);
    // }

    // console.log(map.selectAll("path"));


















    // // 3b. Generate the counts we will need
    // let stateCounts = {};
    // let idToState = {};
    // stateIDs.forEach( row => {
    //   stateCounts[row.name] = 0;
    //   idToState[row.id] = row.name;
    // });
    // console.log(stateCounts);




    // // 4. MARCH 11 -- Let's add a mouseover tooltip
    // var roundNumber = d3.format(".5g");
    // var tooltip = d3.select("body").append("div")
    //                   .attr("id", "tooltip")
    //                   .attr("class", "tooltip")
    //                   .style("opacity", 0);
    // var tooltipWidth = parseFloat(tooltip.style("width"));
    // var tooltipHeight = parseFloat(tooltip.style("height"));

    // d3.selectAll(".state").on("mousemove", mouseOnPlot);
    // d3.selectAll(".state").on("mouseout", mouseLeavesPlot);

    // function mouseOnPlot() {
    //   // Move the tooltip
    //   tooltip.style("left", event.pageX - (tooltipWidth/2.0));
    //   tooltip.style("top", event.pageY - tooltipHeight - 24);

    //   // Clear whatever is there
    //   tooltip.html("");

    //   // Give the tooltip a state label
    //   //console.log(idToState);
    //   let state = d3.select(this);
    //   console.log(state);
    //   tooltip.append("div").text(idToState[state.attr("ident")]);

    //   // Give the tooltip a lat/lng
    //   let posOnChart = d3.mouse(usaMap.node());
    //   console.log(posOnChart);
    //   let geoPos = projection.invert(posOnChart);
    //   console.log(geoPos);
    //   tooltip.append("div").text("("+roundNumber(geoPos[1])+","+roundNumber(geoPos[0])+")")

    //   // Show the tooltip!
    //   tooltip.style("opacity",1);
    // }
    // function mouseLeavesPlot() {
    //   tooltip.style("opacity",0);
    // }




















}


geoData();