
// http://www.abs.gov.au/AUSSTATS/abs@.nsf/second+level+view?ReadForm&prodno=4510.0&viewtitle=Recorded%20Crime%20-%20Victims,%20Australia~2013~Latest~26/06/2014&&tabname=Past%20Future%20Issues&prodno=4510.0&issue=2013&num=&view=&
// http://www.abs.gov.au/AUSSTATS/abs@.nsf/Lookup/4397.0Main+Features11980%20to%201995?OpenDocument
// http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/3303.02001?OpenDocument
// http://www.gunpolicy.org/firearms/region/australia

d3.select('#other').append('div')
	.html("relative number of acts");


var keywordId = _.uniqueId('b_');
var keyword = d3.select('#other')
	.append('svg');

var super_acts_percent;

function draw_super_acts(){


// TODO draw only if visible

	var parseDate = d3.time.format("%Y").parse;
	var super_data = super_acts_percent ? super_acts_percent : [];

	super_data.forEach(function(d) {
	    d.year = parseDate(""+d.year+"");
	});


	var width = document.getElementById('graph').clientWidth;
	var height = 200; 

	var y = d3.scale.linear()
    	.range([height, 0])
    	.domain(d3.extent(super_data, function(d) { return d.rate; }));;
	
	var yAxis = d3.svg.axis()
    	.scale(y)
    	.orient("left");

    var line = d3.svg.line()
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.rate); });

	keyword.selectAll('g').remove();

	keyword
		.attr('width', width)
		.attr('height', height)
		.attr('id','guns');


	var innerGuns = keyword
				.append('g')
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	innerGuns		
		.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Percentage of acts");	

	var path = innerGuns.append("path");

	// var title = innerGuns
	// 		.append('text')
	// 		.attr("transform", "translate(50,10)")
	// 		.text("Firearm homicides per 100,000 population");
	

	function brushended(){

		path.datum(super_data)
	      .attr("class", "line")
	      .attr("d", line); 

	}

	brushended();
	brush.on("brush."+keywordId, brushended);


}

var interval = 500; // ms
function callUntil(){
  if (loaded) {
        draw_super_acts();
    } else {
        setTimeout(callUntil, interval);
    }
}
setTimeout(callUntil, interval);

d3.select(window).on('resize.'+keywordId,function(event) {
	draw_super_acts();
});

