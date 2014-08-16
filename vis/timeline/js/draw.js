// TODO 
// we could define svg etc outside draw() then just reset width but 
// it adds a bunch of code and the browser doens't seem to struggle 
// react.js could be noice



function draw(data){
    var laneHeight = 100;

    var graphElement = document.getElementById('graph');
    var contextElement = document.getElementById('context');

    var margin = {top: 50, right: 50, bottom: 25, left: 50},
        margin2 = {top: 25, right: 50, bottom: 25, left: 50},
        width = graphElement.clientWidth - margin.left - margin.right,
        height = graphElement.clientHeight - margin.top - margin.bottom;
        height2 = contextElement.clientHeight - margin2.top - margin2.bottom;

    // clear all
    d3.select("#graph svg").remove();
    d3.select("#context svg").remove();

    var x = d3.time.scale().range([0, width]),
        x2 = d3.time.scale().range([0, width]);
        // y = d3.scale.linear().range([height, 0]),
        // y2 = d3.scale.linear().range([height2, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom");
        // yAxis = d3.svg.axis().scale(y).orient("left");

    function yearDraw(d,i){
      return "translate(" + x(d) + ",0)";
    }

    function brushed() {
      x.domain(brush.empty() ? x2.domain() : brush.extent());
      // focus.select(".area").attr("d", area);
      bar.attr("transform", barDraw);
      barRect.attr("width", barRectDraw);
      foreigners.attr("width", barRectDraw );
      focus.select(".x.axis").call(xAxis);
      austlii.selectAll('.year').attr('transform',yearDraw);
      brush.extent()[0].getFullYear()

    }

    // austlii acts from gft
    // var acts_filter_terms = ['TAX', 'LEVY', 'TARIFF'];
    var acts_by_year = d3.map();
    function brushended(){
        loadAustlii(brush.extent(), acts_by_year, austlii, yearDraw);
    }


    var brush = d3.svg.brush()
        .x(x2)
        .on("brush", brushed)
        .on('brushend', brushended);

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var austlii = svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var contextSvg = d3.select("#context").append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height2 + margin.top + margin.bottom);

    var context = contextSvg.append("g")
        .append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

     x.domain(d3.extent( 
        data.map(function(d) { return d.startDate; }).concat( data.map(function(d) { return d.endDate; }) ) 
      ));
      // y.domain([0, d3.max(data.map(function(d) { return d.price; }))]);
      x2.domain(x.domain());
      // y2.domain(y.domain());

      function barDraw(d, i) { return "translate(" + x(d.startDate) + "," + (height-laneHeight) +")"; }
      function barRectDraw(d) { return x(d.endDate)-x(d.startDate); }

      var bar = focus
            .append('g').attr('class', 'pm-rects')
            .selectAll('g')
            .data(data)
            .enter().append('g')
            .attr("transform", barDraw);

      var barRect = bar.append('rect')
        .attr("width", barRectDraw)
        .attr('height', laneHeight)
        .style('fill', function(d){ return color(d['Party']); })

      bar.append('text')
        .text(function(d){ return d['Name']; })
        .attr("transform", "translate(10,"+laneHeight+")rotate(-90)")

// https://blog.safaribooksonline.com/2014/03/20/create-html-labels-svg-using-d3/
      var foreigners = bar.append("switch")
        // .attr("width", '100%' )
        .attr("height", laneHeight )
        .append("foreignObject")
        .attr("width", barRectDraw )
        .attr("height", laneHeight )
        .attr("requiredFeatures","http://www.w3.org/TR/SVG11/feature#Extensibility")

      var bodies = foreigners
        .append("xhtml:body")
        
      // bodies.append('p')
      //   .html('the quick brown fox jumps over the lazy dogs')
      bodies.append('img')
        .attr('src', function(d){ return 'img/' + d.img });

      focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      context.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('transform', function(d, i) { return "translate(" + x(d.startDate) + ",0)"; })
        .attr("width", function(d) { return x2(d.endDate)-x2(d.startDate); })
        .attr('height', height2)
        .style('fill', function(d){ return color(d['Party']); })

      context.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height2 + ")")
          .call(xAxis2);

      context.append("g")
          .attr("class", "x brush")
          .call(brush)
        .selectAll("rect")
          .attr("y", -25)
          .attr("height", height2 + 50);

    // resize handles
      var arc = d3.svg.arc()
          .outerRadius(height2 / 2)
          .startAngle(0)
          .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

      context.selectAll('.resize').append('path')
          .attr("transform", "translate(0," +  height2 / 2 + ")")
          .attr("d", arc);

      // initialize brush
      var ext = brush.extent();
      if (ext[0] - ext[1] < 10000) {
        contextSvg.select('.brush').call(brush.extent([new Date(2010,1), new Date()]));
        brushed();
        brushended();
      }

      d3.select('#filter').on('blur', brushended);


}