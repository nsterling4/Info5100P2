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

    // if (d => d.attr("ident")=== 2){
    //         d.remove();
    // }    

    // let statess = d3.selectAll(".state");
    // statess.forEach(d=> {
    //     if (d.attr("ident")=== 2){
    //         d.remove();
    //     }
    // });


    map.append("path")
        .datum(statesMesh)
        .attr("class", "outline")
        .attr("d", path);



    let testdata = await d3.csv("Data/combinedWeather.csv", d3.autoType);

    console.log(testdata);

    let activeYear=2018;
    let activeMonth=4;

   // data = data.filter(d => d['Year'] === activeYear && d['Month'] === activeMonth);
    testdata = testdata.filter(d => d['YEAR'] === activeYear && d['MONTH'] === activeMonth);
    console.log(testdata);

    let stateTemps = {};
    let idToState = {};
    stateIDs.forEach(row => {
        stateTemps[row.name] = 0;
        idToState[row.id] = row.name;
    });
    console.log(idToState);
    console.log(testdata);
    console.log(stateTemps);

    
    testdata.forEach( row => {
        stateTemps[row.STATE] = row.AvgValue;
    });
    console.log(stateTemps);


    const minMax = d3.extent(testdata, d => d.AvgValue);
    console.log(minMax);

   // console.log("HERE");

  //  console.log(d3.values(idToState));
  //  console.log(testdata);


//   let colorScale = d3.scaleLinear()
//   .domain(minMax)
//   .range(["blue", "red"])
//   .clamp(true)
//   .interpolate(d3.interpolateHcl);


    
//   map.selectAll(".state")
//   .style("fill", d => colorScale(testdata.get(d.id)));
   // const colorScale = d3.scaleOrdinal(d3.schemeCategory10);


    //const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain(minMax);
    // const colorScale = d3.scaleQuantile()
    //     .domain(d3.values(d3.values(stateTemps)))
    //     .range(["blue", "lightblue","red"]);
    const colorScale = d3.scaleQuantize()
                          .domain(minMax)
                          .range(["blue","lightblue","lightpink", "red"]);

                  
    map.selectAll(".state")
    .style("fill", d => colorScale( stateTemps[ idToState[d.id] ] ));

    // let mapStates = map.selectAll(".state");
    // console.log(mapStates);
    // mapStates.forEach((d) => {
    //     console.log(d3.this);
    // });


    // map.selectAll(".state")
    //     //.style("fill", "blue");
    //     .style("fill", colorScale(200));


        // console.log("Test");
        // console.log(colorScale(d => d.Temp));
        // console.log( d => colorScale(d.Temp));
        // console.log(colorScale(20));
        // console.log(colorScale(30));
        // console.log(colorScale(40));
        // console.log(colorScale(1000));



    var hoverBox = d3.select("body").append("div")
    .attr("class", "hoverBox")
    .style("opacity", 0)
    //.style("background-color", "blue");

    d3.selectAll(".state").on("mousemove", mouseOnPlot);
    d3.selectAll(".state").on("mouseout", mouseLeavesPlot);


    function mouseOnPlot() {
       // console.log("move");
        hoverBox.style("left", event.pageX)
            .style("top", event.pageY)
            .html("")
            .style("opacity", 1);

        let state = d3.select(this);
        hoverBox.append("div").text(idToState[state.attr("ident")]);
        console.log("test");
        console.log(testdata[0]);
        //hoverBox.append("div").text( testdata.idToState[state.attr("ident")] );
    }

    function mouseLeavesPlot() {
        hoverBox.style("opacity", 0);
       // console.log("Out");
    }

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