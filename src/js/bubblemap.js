function getBubbleMap() {

    var width = 960,
        height = 600;

    //const projection = d3.geoAlbersUsa();

    var path = d3.geo.path().projection(null);

    var svg = d3.select("#counties-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    var radius = d3.scale.sqrt()
        .domain([0, 1e6])
        .range([0, 20]);

    var toolTip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', '#fff')
        .style('opacity', 0)
        .style('font-family', 'Open Sans')
        .style('font-size', '16px')
        .style('fill', 'white')
        .style('z-index', 1000);

//from bm ex
    var arc = d3.svg.arc()
        .outerRadius(radius);

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")")
        .selectAll("g")
        .data([1e6, 3e6, 6e6])
        .enter().append("g");

    legend.append("circle")
        .attr("cy", function (d) {
            return -radius(d);
        })
        .attr("r", radius);

    legend.append("text")
        .attr("y", function (d) {
            return -2 * radius(d);
        })
        .attr("dy", "1.3em")
        .text(d3.format(".1s"));

    d3.json("us.json", function (error, us) {
        if (error) return console.error(error);

        svg.append("path")
          .datum(topojson.mesh(us))
          .attr("d", path);

        svg.append("path")
            .datum(topojson.feature(us, us.objects.nation))
            .attr("class", "land")
            .attr("d", path);

        svg.selectAll('.states')
            // retrieve the features so that id is accessed
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append('path')
            .attr('id', function (d) {
                return d.id;
            })
            .attr("class", "states states-hover")
            .attr('d', path)

            //add Tool Tip
            .on('mouseover', function (d, i) {
                toolTip.transition()
                    .style('opacity', .9)
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY) + 'px')
                var tempColor = this.style.fill; //store current color

                if (d.properties.name != null || d.properties.name != undefined) {
                    toolTip.html(d.properties.name + ", " + d.properties.population)
                } else {
                    toolTip.html("")
                }
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition().delay(400).duration(800)
                    .style('opacity', 1)
                    .style('fill', tempColor)
            })

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                return a !== b;
            }))
            .attr("class", "border border--state")
            .attr("d", path);

        svg.append("g")
            .attr("class", "bubble")
            .selectAll("circle")
            .data(topojson.feature(us, us.objects.counties).features
                .sort(function (a, b) {
                    return b.properties.population - a.properties.population;
                }))
            .enter().append("circle")
            .on('mouseover', function (d, i) {
                d3.select(this).attr('class', 'hover')
            })
            .on('mouseout', function (d, i) {
                d3.select(this).attr('class', '')
            })
            .attr("transform", function (d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function (d) {
                return radius(d.properties.population);
            })
            .attr("fill", function (d) {
                if (d.properties.party == "REP") return 'red'
                else return 'blue'
            });

    });
};

export {getBubbleMap}