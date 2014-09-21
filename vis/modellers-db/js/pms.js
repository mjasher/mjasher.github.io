/*
Adding other data (same x axis)
-----------------
We need to reusse brushed and brushend events - use namespaces eg. on('brush.foo', bar)
It'd be nice to reuse x() function - make sure html offset (margins) are the same
TODO: window. on resize
Clip path doesn't work anyway
*/
var loaded = false; // TODO better done with promises, $get etc. see graph/js/views.js
var x;
var brush = d3.svg.brush();

        // .on("brush."+pmsId, brushed)
        // .on("brushend."+pmsId, brushended);
var pmsId = _.uniqueId('b_');

var graphElement = document.getElementById('graph');
var contextElement = document.getElementById('context');

var margin = {top: 0, right: 25, bottom: 0, left: 25},
    margin2 = {top: 0, right: 25, bottom: 0, left: 25},
    width = graphElement.clientWidth - margin.left - margin.right;


// TODO "data/opps.aec.csv"
d3.csv("data/pms.aec.csv", pmsAecType, function(error, data) {
  drawPms(data);
  loaded = true;
  d3.select(window).on('resize.'+pmsId,function(event) {
      drawPms(data);
  });
  // window.onresize = function(event) {
  //     drawPms(data);
  // };
});



function pmsAecType(d) {
  var parseDate = d3.time.format('%d.%m.%Y').parse;
  var dates = d['Period in office'].split(' – ').map( function(date){
    if (date == 'present') return new Date();
    return parseDate(date);
  });
  d.startDate = dates[0];
  d.endDate = dates[1];
  return d;
}

function drawPms(data){
    // var laneHeight = 100;


        // height = graphElement.clientHeight - margin.top - margin.bottom;
        // height2 = contextElement.clientHeight - margin2.top - margin2.bottom;

    // clear all
    d3.select("#graph svg").remove();
    d3.select("#context svg").remove();

    var parties = {
      LP: 'Liberal Party of Australia',
      LIB: 'The Liberal Party',
      CP: 'Country Party',
      ALP: 'Australian Labor Party',
      FT: 'Free Trade',
      UAP: 'United Australia Party',
      NL: 'National Labor',
      NAT: 'Nationalist',
      PROT: 'Protectionist'
    };

    var color =  d3.scale.ordinal() //d3.scale.category10()
        .range([ "#1f77b4", "#7DB3D8", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#FCFF87" ])
        .domain(Object.keys(parties))

    x = d3.time.scale().range([0, width]);
    var x2 = d3.time.scale().range([0, width]);
        // y = d3.scale.linear().range([height, 0]),
        // y2 = d3.scale.linear().range([height2, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom");
        // yAxis = d3.svg.axis().scale(y).orient("left");

    // function yearDraw(d,i){
    //   return "translate(" + x(d) + ",0)";
    // }

    function brushed() {
      x.domain(brush.empty() ? x2.domain() : brush.extent());
      bar.attr("transform", barDraw);
      barRect.attr("width", barRectDraw);
      focus.select(".x.axis").call(xAxis);
      // austlii.selectAll('.year').attr('transform',yearDraw);
      // brush.extent()[0].getFullYear();

    }

 
    function brushended(){
        // loadAustlii(brush.extent(), acts_by_year, austlii, yearDraw);
        bar.each(drawImages);

    }

    // var brush = d3.svg.brush()
      brush.x(x2)
        .on("brush."+pmsId, brushed)
        .on("brushend."+pmsId, brushended);

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr('height', 200)
        // .attr("height", height + margin.top + margin.bottom);

    // svg.append("defs").append("clipPath")
    //     .attr("id", "clip")
    //   .append("rect")
    //     .attr("width", width)
        // .attr("height", height);


    // var austlii = svg.append('g')
    //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var contextSvg = d3.select("#context").append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr('height',70)
        // .attr("height", height2 + margin.top + margin.bottom);

    var context = contextSvg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

     x.domain(d3.extent( 
        data.map(function(d) { return d.startDate; }).concat( data.map(function(d) { return d.endDate; }) ) 
      ));
      // y.domain([0, d3.max(data.map(function(d) { return d.price; }))]);
      x2.domain(x.domain());
      // y2.domain(y.domain());

      function barDraw(d, i) { return "translate(" + x(d.startDate) + ",80)"; }
      // function barDraw(d, i) { return "translate(" + x(d.startDate) + "," + (height-laneHeight) +")"; }
      function barRectDraw(d) { return x(d.endDate)-x(d.startDate); }

      var bar = focus
            .append('g').attr('class', 'pm-rects')
            .selectAll('g')
            .data(data)
            .enter().append('g')
            .attr("transform", barDraw);

      var barRect = bar.append('rect')
        .attr("width", barRectDraw)
        .attr('height', 100)
        .style('fill', function(d){ return color(d['Party']); })

      bar.append('text')
        .text(function(d){ return d['Name']; })
        .attr("transform", "translate(10,90)rotate(-90)")

      function drawImages(d,i){
        var theBar = d3.select(this);
        // if on screen and bar rect is wide enough to fit image
        theBar.selectAll('image').remove();
        if (x(d.endDate) > 0 && theBar.select('rect').attr('width') > 15 + 100*110/121){
          theBar.append('svg:image')
            .attr('x',15)
            .attr('y',0)
            .attr('width',100*110/121)
            .attr('height',100)
            .attr('xlink:href', function(d){ return 'img/' + d.img; });
        }
      }

      focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 180 + ")")
        .call(xAxis);

      context.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('transform', function(d, i) { return "translate(" + x(d.startDate) + ",10)"; })
        .attr("width", function(d) { return x2(d.endDate)-x2(d.startDate); })
        .attr('height', 30)
        .style('fill', function(d){ return color(d['Party']); })

      context.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0,40)")
          .call(xAxis2);

      context.append("g")
          .attr("class", "x brush")
          .call(brush)
        .selectAll("rect")
          // .attr("y", -25)
          .attr("height", 50);
          // .attr("height", height2 + 50);

    // resize handles
      var arc = d3.svg.arc()
          .outerRadius(25)
          .startAngle(0)
          .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

      context.selectAll('.resize').append('path')
          .attr("transform", "translate(0,25)")
          .attr("d", arc);

      // initialize brush
      var ext = brush.extent();
      if (ext[0] - ext[1] < 10000) {
        // contextSvg.select('.brush').call(brush.extent([new Date(1996,3), new Date(2000,1)]));
        contextSvg.select('.brush').call(brush.extent([new Date(1959,8), new Date(2014,5)]));
        // brush.brushed();
        brushed();
        brushended();
      }

      // d3.select('#filter').on('change', brushended);

      var legend_data = color.domain().slice(0,-1).map(function(p,i){
        return {color: color.range()[i], label: parties[p]};
      });

      var legends = focus.append("g")
        .attr("class", "legend")
        .selectAll('g')
        .data(legend_data)
        .enter().append('g')
        .attr('transform', function(d,i){ return "translate(" + (width-30-i*50) +",20)" });

      legends.append('rect')
        .attr('width',30)
        .attr('height',30)
        .attr('fill', function(d){ return d.color; })
        
       legends.append('text')
        .text(function(d){ return d.label; })
        .attr('transform', "translate(-20,60)rotate(-45)")


}




