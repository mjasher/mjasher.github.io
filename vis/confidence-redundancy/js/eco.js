
// consumer confidence data
//==================================
// thanks for the tip: http://stackoverflow.com/questions/16231266/embedding-csv-in-html-for-use-with-d3-
var raw = d3.select("#csvdata").text();
var parsed = d3.csv.parse(raw, function(d){
  var row = [];
  var keys = Object.keys(d);
  for(var j=0;j<keys.length;j++){
      // ignore year, average, and entries without data
    if( keys[j] != 'Year' && keys[j] != 'Average' && !( /^\s*$/.test(d[keys[j]]))){
      
        row.push({date: keys[j]+d['Year'], 
                  value: d[keys[j]].replace(/[*^]/g,'') });
    }
  }
  return row;
  
});;
  // flatten table
var data = [];
data = data.concat.apply(data, parsed);

// redundancy data
//==================================
var r_data = redundancy.table.rows.map(function(d){ return {date: d.c[0].v,
                                                    value: d.c[1].v }; });


// pre-plot
//==================================
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%b%Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// plot
//==================================
//d3.tsv("data.tsv", function(error, data) {
  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.value = +d.value; //.replace('[1234567890.]','')
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));
  var new_d = x.domain();
  new_d[0] = new Date(2003,0);
  x.domain(new_d);

  // y.domain(d3.extent(data, function(d) { return d.value; }));
  y.domain([
    d3.min([data,r_data], function(c) { return d3.min(c, function(v) { return v.value; }); }),
    d3.max([data,r_data], function(c) { return d3.max(c, function(v) { return v.value; }); })
  ]);



  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Index");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  svg.append("path")
      .datum(r_data)
      .attr("class", "line")
      .style('stroke','darkred')
      .attr("d", line);

//});

// legend
//========================================
     var legend = svg.selectAll(".legend")
          .data([{label:'Consumer confidence', color:'steelblue'}, {label:'Google trends: "redundancy"', color: 'darkred'}])
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function(d){return d.color;});

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style('font-size', '12px')
          .style("text-anchor", "end")
          .text(function(d) { return d.label; });


var format = d3.time.format("%Y/%m/%d");
console.log('year','consumer');
for (var i=0;i<data.length;i++) console.log(format(data[i].date),',',data[i].value);
console.log('year','redundancy');
for (var i=0;i<r_data.length;i++) console.log(format(r_data[i].date),',',r_data[i].value);