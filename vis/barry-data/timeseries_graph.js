function Sites(){
  var el = d3.select('#sites');

  this.draw = function(){
    el.selectAll('.site').remove();
    el.selectAll('.site')
      .data(observations.keys().sort(function(a,b){ return observations.get(b).length - observations.get(a).length; })).enter()
      .append('span')
      .attr('class', function(d){
        if (d == site_filter[0]) return 'site active';
        return 'site';
      })
      .html(function(d){ 
        return d; 
      })
      .on('click', function(d){
        set_site_filter([d]);
      });
  }
}


function Species(){
  var el = d3.select('#species');

  this.draw = function(){
    // console.log(observations.get(site_filter[0]));
    var all_species = Object.keys(observations.get(site_filter[0])[0]).sort(function(a,b){
      var a_sum = 0;
      var b_sum = 0;
      for (var i = 0; i < observations.get(site_filter[0]).length; i++) {
        if(observations.get(site_filter[0])[i][a] !== "0" && observations.get(site_filter[0])[i][a] !== "-9999") a_sum += 1;
        if(observations.get(site_filter[0])[i][b] !== "0" && observations.get(site_filter[0])[i][a] !== "-9999") b_sum += 1;
      };
      return b_sum - a_sum;
    });
    // var all_species = Object.keys(observations.values()[0][0]);
    el.selectAll('.site').remove();
    el.selectAll('.site')
      .data(all_species).enter()
      .append('span')
      .attr('class', function(d){
        if (! exclude(d)) return 'site active';
        return 'site';
      })
      // .style('background-color', function(d){
      //   return timeseries_graph.color(d);
      // })
      .html(function(d){ 
        return d; 
      })
      .on('click', function(d){
        toggle_species_filter(d);
      });
  }
}


function Timeseries_graph(){

  // ========================
  // private immutables 
  // ========================

  var el = d3.select('#timeseries');

  var margin = {top: 20, right: 80, bottom: 30, left: 150},
      width = el.node().clientWidth - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var mini_y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var mini_yAxis = d3.svg.axis()
      .scale(mini_y)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.temperature); });

  var brush = d3.svg.brush()
      .y(mini_y)
      .on("brush", brushed);

  var svg,
      graph, 
      city_lines,
      city_labels;

  function brushed() {
    y.domain(brush.empty() ? mini_y.domain() : brush.extent());

    graph.select('.y.axis').remove();
    graph.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    city_lines
        .attr("d", function(d) { return line(d.values); });

    city_labels
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
        .text(function(d) { return d.name; });
  }

  this.color = d3.scale.category20();

  this.init_brush = function(){
    brush.extent( mini_y.domain() );
    svg.select('.brush').call(brush);
    
  }

  // this.set_color = function(){

  // }

  // ========================
  // draw, whenever data changes 
  // ========================
  this.draw_site = function(){

    // console.log(Object.keys(data[0]));
    // var chosen = "Dissolved Oxygen (mg/L)";
    // var exclude = d3.set();
    // exclude_list.forEach(function(d){ exclude.add(d); });

    var color = this.color;
    var nested = observations.get(site_filter[0]);

    var species = this.color.domain()
    .filter(function(name){
      return ! exclude(name);
    })
    .map(function(name) {
      return {
        name: name,
        values: nested.map(function(d) {
          var v = +d[name];
          if (+d[name] == -9999) v = null;
          return {date: d.date, temperature: v};
        })
      };
    });


    x.domain(d3.extent(nested, function(d) { return d.date; }));

    mini_y.domain([
      d3.min(species, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
      d3.max(species, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
    ]);

    el.selectAll('svg').remove();
    svg = el.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    graph = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(mini_yAxis)
        .attr('transform', 'translate(80,'+margin.top+')');

    svg.append("g")
        .attr("class", "y brush")
        .attr('transform', 'translate(0,'+margin.top+')')
        .call(brush)
      .selectAll("rect")
        // .attr("x", -6)
        .attr("width", 100);


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
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    // initialize
    brushed();
  }

}
