(function(){
var states = [
    {"name": "Australian Capital Territory", "short": "ACT", "colors": ["#eea400", "#00005b"]},
    {"name": "New South Wales", "short": "NSW", "colors": ["#6699cc"]},
    {"name": "Northern Territory", "short": "NT", "colors": ["#e65a00", "black", "white"]},
    {"name": "Queensland", "short": "Qld", "colors": ["#990033", "#550000"]},
    {"name": "South Australia", "short": "SA", "colors": ["#A3131A"]},
    {"name": "Tasmania", "short": "Tas.", "colors": ["#005a30"]},
    {"name": "Victoria","short": "Vic.", "colors": ["#010141"]},
    {"name": "Western Australia", "short": "WA", "colors": ["#fad613", "black"]}
]

var el = document.getElementById('graph');

var m = [20, 20, 30, 20],
    w = el.clientWidth - m[1] - m[3],
    h = el.clientHeight - m[0] - m[2];

var x,
    y,
    duration = 1500,
    delay = 100;

var color = d3.scale.ordinal();

var svg = d3.select("#graph").append("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

var symbols;

// A line generator, for the dark stroke.
var line = d3.svg.line()
    // .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

// A line generator, for the dark stroke.
var axis = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(h);

// A area generator, for the dark stroke.
var area = d3.svg.area()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y1(function(d) { return y(d.price); });

d3.csv("data/population.csv", function(data) {
  var parse = d3.time.format("%Y").parse;
  symbols = states.map(function(s){
    var values = data.map(function(d) { return {date : parse(d.date), price: +d['Persons:'+s.short]}; });
    return {
      colors: s.colors,
      key : s.short,
      values : values,
      maxPrice : d3.max(values, function(d) { return d.price; }),
      sumPrice : d3.sum(values, function(d) { return d.price; })
    };
  });

  // Sort by maximum price, descending.
  symbols.sort(function(a, b) { return b.maxPrice - a.maxPrice; });

  color.range(symbols.map(function(d){ return d.colors[0]; }));

  var g = svg.selectAll("g")
      .data(symbols)
    .enter().append("g")
      .attr("class", "symbol");

  setTimeout(lines, duration);
});

function lines() {
  x = d3.time.scale().range([0, w - 60]);
  y = d3.scale.linear().range([h, 0])
      .domain([0,d3.max(symbols, function(d) { return d.maxPrice })]);

  // Compute the minimum and maximum date across symbols.
  x.domain([
    d3.min(symbols, function(d) { return d.values[0].date; }),
    d3.max(symbols, function(d) { return d.values[d.values.length - 1].date; })
  ]);

  var g = svg.selectAll(".symbol");
      // .attr("transform", function(d, i) { return "translate(0," + (0) + ")"; });

  g.each(function(d) {
    var e = d3.select(this);

    e.append("path")
        .attr("class", "line");

    e.append("circle")
        .attr("r", 5)
        .style("fill", function(d) { return color(d.key); })
        .style("stroke", "#000")
        .style("stroke-width", "2px");

    e.append("text")
        .attr("x", 12)
        .attr("dy", ".31em")
        .text(d.key);
  });

  function draw(k) {
    g.each(function(d) {
      var e = d3.select(this);
      // y.domain([0, d.maxPrice]);

      e.select("path")
          .attr("d", function(d) { return line(d.values.slice(0, k + 1)); });

      e.selectAll("circle, text")
          .data(function(d) { return [d.values[k], d.values[k]]; })
          .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.price) + ")"; });
    });
  }

  var k = 1, n = symbols[0].values.length;
  d3.timer(function() {
    draw(k);
    if ((k += 2) >= n - 1) {
      draw(n - 1);
      setTimeout(overlappingArea, 500);
      return true;
    }
  });
}

function overlappingArea(){

  area.y0(h);

  var g = svg.selectAll(".symbol");

  g.each(function(d){

    d3.select(this).append("path")
        .datum(d.values)
        .attr("class", "area")
        .attr("d", area)
        .style("fill-opacity", 0)
        .style("fill", color(d.key))
        .transition().duration(duration)
        .style("fill-opacity", 1);

  });

  g.select(".line")
    .transition().duration(duration)
    .style("stroke-opacity", 0)
    
  g.select("circle")
    .transition().duration(duration)
    .style("fill-opacity", 0)
    .style("stroke-opacity", 0);

  setTimeout(stackedArea, duration+delay);

}


function stackedArea() {
  var stack = d3.layout.stack()
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.price; })
      .out(function(d, y0, y) { d.price0 = y0; })
      .order("reverse");

  stack(symbols);

  // area.y0(function(d){ return d.price0; });

  y.domain([0, d3.max(symbols[0].values.map(function(d) { return d.price0 + d.price; }))]);

  area
      .y0(function(d) { return y(d.price0); })
      .y1(function(d) { return y(d.price0 + d.price); });

  svg.selectAll(".area")
    .transition().duration(duration)
    .attr('d', area);
  
  var g = svg.selectAll(".symbol");

  g.each(function(d){
    
    d3.select(this).selectAll('text')
    .transition().duration(duration)
    .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.price0+d.price/2) + ")"; });

  });

    
  // TODO smooth using http://bl.ocks.org/mbostock/1649463
  // TODO leaflet ignore scroll?
  // scrollTo(0,document.getElementById('graph').clientHeight); // h has changed ?

  function scrollTween(offset) {
    return function() {
      var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
      return function(t) { scrollTo(0, i(t)); };
    };
  }

  d3.transition()
  .delay(2000)
  .duration(1500)
  .tween("scroll", scrollTween(document.body.getBoundingClientRect().height - window.innerHeight));
  
}
})();