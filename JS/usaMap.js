



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


       //let stateCounts = {};
        let idToState = {};
        stateIDs.forEach( row => {
         // stateCounts[row.name] = 0;
          idToState[row.id] = row.name;
        });


    //Drawing portion
    map.selectAll("path").data(states.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path);


    map.append("path")
        .datum(statesMesh)
        .attr("class", "outline")
        .attr("d", path);











   // var hoverBox = usaMap.append("div")
       // .attr("class", "hoverBox")
       // .attr("opacity", 1)
        //.style("background-color", "blue");
   // hoverBox.append("div").text("kkkkkkkkk");    

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