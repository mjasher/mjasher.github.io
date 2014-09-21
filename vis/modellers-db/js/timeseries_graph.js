
function Timeseries_graph(){

  // ========================
  // private immutables 
  // ========================

  var el = d3.select('#other');

  // var margin = {top: 20, right: 80, bottom: 30, left: 150},
      // width = el.node().clientWidth - margin.left - margin.right,
      // height = 500 - margin.top - margin.bottom;
  var height = 500;

  var parseDate = d3.time.format('%Y-%m-%d').parse;

  // var x = d3.time.scale()
  //     .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  // var xAxis = d3.svg.axis()
  //     .scale(x)
  //     .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.val); });

  var svg,
      graph, 
      city_lines,
      city_labels;

  this.brushed = function() {
    // x.domain(brush.empty() ? mini_y.domain() : brush.extent());

    // graph.select('.y.axis').remove();
    // graph.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis);

    city_lines
        .attr("d", function(d) { return line(d.values); });

    city_labels
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.val) + ")"; })
        .text(function(d) { return d.name; });
  }

  this.color = d3.scale.category10();


  // ========================
  // draw, whenever data changes 
  // ========================
  this.draw_table = function(table){


    this.color.domain(Object.keys(table[0]).filter(function(d){ return d !== 'date'; }));
    var color = this.color;

    var dateFormat = d3.date

    species = this.color.domain()
      .map(function(name) {
        return {
          name: name,
          values: table.map(function(d) {
            return {date: parseDate(d.date), val: +d[name]};
          })
        };
      });


    // x.domain(d3.extent(table, function(d) { return d.date; }));

    y.domain([
      d3.min(species, function(c) { return d3.min(c.values, function(v) { return v.val; }); }),
      d3.max(species, function(c) { return d3.max(c.values, function(v) { return v.val; }); })
    ]);


    el.selectAll('svg').remove();
    svg = el.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + 75 + 25);

    graph = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + 75 + ")");

    // graph.append("g")
    //   .attr("class", "x axis")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .attr('transform', 'translate(80,'+75+')');

    // svg.append("g")
    //     .attr("class", "y brush")
    //     .attr('transform', 'translate(0,'+margin.top+')')
    //     .call(brush)
    //   .selectAll("rect")
    //     // .attr("x", -6)
    //     .attr("width", 100);


    var city = graph.selectAll(".city")
        .data(species)
      .enter().append("g")
        .attr("class", "city");

    city_lines = city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });

    city_labels = city.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { 
          return "translate(" + x(d.value.date) + "," + y(d.value.val) + ")"; 
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .attr('text-anchor','end')
        .text(function(d) { return d.name; });

    // initialize
    this.brushed();
    brush.on("brush."+mdbId, this.brushed);
  }

}
