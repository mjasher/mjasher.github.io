// we should look at for the cross over point (actually a front)

// plot assets at end against each variable for rent and buy
// plot the crossover point on two variable plots
var houseModel = new Backbone.Model();

houseParameters = {
    borrow_rate : {v: 0.04, min: 0, max: 0.1, tickFormat : '%', label: "Real interest rate for a mortgage"}, // real rate (exclude inflation)
    savings_rate : {v: 0.03, min: 0, max: 0.1, tickFormat : '%',label: "Real interest rate for savings"}, // real rate (exclude inflation)
    house_price_rate : {v: 0.02, min: 0, max: 0.1, tickFormat : '%',label: "Real house price increase rate"}, // real rate (exclude inflation)
    house_price : {v: 350000, min: 0, max: 2000000, tickFormat : '$,',label: "Purchase price of house"},
    rent_price : {v: 350, min: 0, max: 2000,tickFormat : '$,', label: "Weekly rent"},
    years : {v: 15, min: 1, max: 50, tickFormat : '', label: "Mortgage term in years"}, 
    rates : {v: 3000, min: 0, max: 10000, tickFormat : '$,', label: "Rates per year"}, // include land tax
    upkeep : {v: 1000, min: 0, max: 20000, tickFormat : '$,', label: "Upkeep per year"}, // fixing stuff
    moving : {v: 200, min: 0, max: 1000, tickFormat : '$,', label: "Annual cost of moving"}, // annual moving cost for renting
}

for (i in houseParameters){
  houseModel.set(i,houseParameters[i].v);
}

function yearly_repayment(h){
    if (h.borrow_rate === 0) return h.house_price/h.years; // TODOD fix
    return h.house_price*h.borrow_rate/(1-(1/Math.pow(1+h.borrow_rate,h.years)));
}

function end_buying(h){
    return h.house_price*Math.pow(1+h.house_price_rate,h.years);
}

function end_renting(h){
    var buying_cost = yearly_repayment(h) + h.upkeep + h.rates;
    var renting_cost = h.rent_price*52 + h.moving;
    
    var rent_savings = 0;
    for (var i=0;i<h.years;i++){
      rent_savings += (buying_cost - renting_cost) * Math.exp(h.savings_rate * (h.years-i-1));
    }

    return rent_savings;
}

var ExplainView = Backbone.View.extend({
    initialize: function(){
        this.model.on('change', this.render, this);
        this.render();
    },
    
    template: _.template($("#explain_template").html()),  

    render: function() {  
        //console.log(this.model.attributes);
        this.$el.html(this.template($.extend(this.model.attributes, 
        {
          buying_cost : yearly_repayment(this.model.attributes) + this.model.get('upkeep') + this.model.get('rates'),
          renting_cost : this.model.get('rent_price')*52

        })));
        return this;
   }

});

new ExplainView({ model: houseModel, el: $("#explain") });


VariableView = Backbone.View.extend({
    initialize: function(){
        this.model.on('change', this.render, this);
        // d3.select(window).on('resize', this.render);
        $(window).on("resize", _.bind(this.render, this)); 
        this.render();

    },
    render: function(){

      /*
      Thanks to http://jsfiddle.net/cuckovic/vKe67/
      implementation heavily influenced by http://bl.ocks.org/1166403 
      */
      var margin = {top: 30, right: 30, bottom: 30, left: 120},
          width,
          height;

      d3.selectAll(this.$el.toArray()).select('svg').remove();
      width = parseInt(d3.select('#graph0').style('width'), 10);
      height = parseInt(d3.select('#graph0').style('height'), 10);
      width = width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;

      var moveLine = this.moveLine;
      var model = this.model;
      var attribute = this.options.v;
      //var attr = this.options.v;

      var svg = d3.selectAll(this.$el.toArray()).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var house = this.model.toJSON();
      var initV = house[this.options.v];
      var details = houseParameters[this.options.v];

      var data = [];
      for (var i=details.min; i<details.max; i+=(details.max-details.min)/100){
          house[this.options.v] = i;
          data.push({v:i, buy: end_buying(house), rent: end_renting(house)});
      }

      var x = d3.scale.linear().domain([details.min, details.max]).range([0, width]);
      var y = d3.scale.linear().domain(d3.extent(data.map(function(d){ return d.rent; })
                                                  .concat(data.map(function(d) {return d.buy; }))
                                                  )).range([height, 0]);

      var xAxis = d3.svg.axis().scale(x)
          //.tickSize(-height).tickSubdivide(true)
          .ticks(6, details.tickFormat);
      var yAxisLeft = d3.svg.axis().scale(y)
        .ticks(4, '$,')
        .orient("left");

      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

      svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(-25,0)")
      .call(yAxisLeft);


      svg.append('text')        
        .attr("x", 0 )             // (width / 2)
        .attr("y", 0 - (margin.top / 2))
        .text(details.label)
        .style('font-weight','bold');
      
      var rentLine = svg.append("path")
              .datum(data).attr('class','line')
              .style('stroke','steelblue')
              .attr("d", d3.svg.line()
                    .x(function (d) {
                        return x(d.v);
                    })
                    .y(function (d) {
                        return y(d.rent);
                    }));
      var buyLine = svg.append("path")
              .datum(data).attr('class','line')
              .style('stroke','darkred')
              .attr("d", d3.svg.line()
                  .x(function (d) {
                      return x(d.v);
                  })
                  .y(function (d) {
                      return y(d.buy);
                  }));

      var verticalLine = svg.append('line')
        .attr({
            'x1': 0,
            'y1': 0,
            'x2': 0,
            'y2': height
        })
            .attr("stroke", "black")


      var buyCircle = svg.append("circle")
            .attr("opacity", 0)
            .attr({
              r: 10,
              fill: 'darkred',
            });
      var rentCircle = svg.append("circle")
            .attr("opacity", 0)
            .attr({
              r: 10,
              fill: 'steelblue',
            });

      var labelText = svg.append('text');
      var format = d3.format(details.tickFormat);


      var xPos;
      var drag = d3.behavior.drag()
          .on("drag", dragged)
          .on("dragend", dragended);

      function dragged(d) {
        xPos = moveLine(d3.event.x, x,y,data, width, verticalLine, rentCircle, buyCircle,labelText,format);    
      }

      function dragended(d) {
        model.set(attribute, x.invert(xPos));
      }

      // initial
      moveLine(x(initV), x,y,data, width, verticalLine, rentCircle, buyCircle,labelText,format);
      rentCircle.call(drag);
      buyCircle.call(drag);
    },

    moveLine : function(xPos, x,y,data, width, verticalLine, rentCircle, buyCircle,labelText, format){
    // moveLine : function(xPos, xf,y,data, width, rentLine, buyLine, verticalLine, rentCircle, buyCircle){

        // snap 
      var xVal = x.invert(xPos);
      xPos = x(Math.round(xVal*100)/100);
      
      // don't drag off graph
      if (xPos > width) return width;
      if (xPos < 0) return 0;


      verticalLine.attr("transform", function () {
          return "translate(" + xPos + ",0)";
      });
      
      // var pathLength = rentLine.node().getTotalLength();
      // var x = xPos;
      // var beginning = x,
      //     end = pathLength,
      //     target,
      //     pos, buyPos;
      // // find the y coordinate
      // while (true) {
      //     target = Math.floor((beginning + end) / 2);
      //     pos = rentLine.node().getPointAtLength(target);
      //     buyPos = buyLine.node().getPointAtLength(target);
      //     if ((target === end || target === beginning) && pos.x !== x) {
      //         break;
      //     }
      //     if (pos.x > x) end = target;
      //     else if (pos.x < x) beginning = target;
      //     else break; //position found
      // }

      var bisect = d3.bisector(function(d) { return d.v; }).right;
      var item = data[bisect(data, x.invert(xPos))];
      var buyY = item ? y(item.buy) : y(data[data.length - 1].buy);
      var rentY = item ? y(item.rent) : y(data[data.length - 1].rent);


      labelText.attr("cx", xPos)
        .text(format(xVal.toFixed(2)));

  //        .attr("transform", function(d){return "translate("+xPos+","+rentY+")"});

      buyCircle.attr("opacity", 1)
          .attr("cx", xPos)
          .attr("cy", buyY);
      rentCircle.attr("opacity", 1)
          .attr("cx", xPos)
          .attr("cy", rentY);


      return xPos;
          
    } 

});

var keys = Object.keys(houseParameters);
for (i in keys){
   // if ( keys[i] !== 'years') continue;
  new VariableView({ model: houseModel,
    el: "#graph"+i,
    v: keys[i],
  });
}
