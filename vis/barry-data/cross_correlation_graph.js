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


function Cross_correlation_graph(){

  // ========================
  // private immutables 
  // ========================

  var el = d3.select('#timeseries');

  var margin = {top: 150, right: 0, bottom: 0, left: 150},
      width = 600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;


  

  // ========================
  // draw, whenever data changes 
  // ========================
  this.draw_site = function(){

    // nodes = ;
    // matrix = ?
    var matrix = [];
    var nested = observations.get(site_filter[0]);


    var nodes = Object.keys(observations.values()[0][0])
    .filter(function(name){
      return ! exclude(name);
    });

    var side = d3.scale.ordinal().rangeBands([0, height]).domain(d3.range(nodes.length));

    var species = nodes
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


    for (var i = 0; i < nodes.length; i++) {
      matrix[i] = [];
      for (var j = 0; j < nodes.length; j++) {
        var temp = d3.max(cross_correlation(species[i].values.map(function(d){ return d.temperature; }), 
                                         species[j].values.map(function(d){ return d.temperature; }) ));
        matrix[i][j] = temp ? {x:j,y:i,z:temp} : {x:j,y:i,z:0};
      };
    };


    var c = d3.scale.quantize() //threshold()
      .domain([0, 1])
      .range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]); // thanks colorbrewer


   el.selectAll('svg').remove();

   var svg = el.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    function row(row) {
      var cell = d3.select(this).selectAll(".cell")
          .data(function(d) {return d; })
        .enter().append("rect")
          .attr("class", "cell")
          .attr("x", function(d,i) {return side(i); })
          .attr("width", side.rangeBand())
          .attr("height", side.rangeBand())
          .style('fill', function(d){ return c(d.z);  })
          // .style("fill-opacity", function(d) { return z(d.z); })
          // .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
          // .on("mouseover", function(d,i){ console.log(d,i); })
          .on("mouseover", mouseover)
          .on("mouseout", mouseout);
    }

    function mouseover(p) {

      d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
      d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    }

    function mouseout() {
      d3.selectAll("text").classed("active", false);
    }


    var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + side(i) + ")"; })
      .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", side.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i]; });

    var column = svg.selectAll(".column")
        .data(matrix)
      .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + side(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", side.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i]; });

   
  }

}
