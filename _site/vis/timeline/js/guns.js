
// http://www.abs.gov.au/AUSSTATS/abs@.nsf/second+level+view?ReadForm&prodno=4510.0&viewtitle=Recorded%20Crime%20-%20Victims,%20Australia~2013~Latest~26/06/2014&&tabname=Past%20Future%20Issues&prodno=4510.0&issue=2013&num=&view=&
// http://www.abs.gov.au/AUSSTATS/abs@.nsf/Lookup/4397.0Main+Features11980%20to%201995?OpenDocument
// http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/3303.02001?OpenDocument
// http://www.gunpolicy.org/firearms/region/australia

d3.select('#other').append('div')
	.html("Firearm homicides per 100,000 population (<a href='http://www.gunpolicy.org/firearms/region/australia'>data source</a>).");


var gunsId = _.uniqueId('b_');
var guns = d3.select('#other')
	.append('svg');


function draw_guns(){

	firearm_homicide_p_100k = [
		{year:"2011", rate: 0.11},
		{year:"2010", rate: 0.16},
		{year:"2009", rate: 0.17},
		{year:"2008", rate: 0.13},
		{year:"2007", rate: 0.13},
		{year:"2006", rate: 0.20},
		{year:"2005", rate: 0.07},
		{year:"2004", rate: 0.07},
		{year:"2003", rate: 0.27},
		{year:"2002", rate: 0.23},
		{year:"2001", rate: 0.24},
		{year:"2000", rate: 0.30},
		{year:"1999", rate: 0.26},
		{year:"1998", rate: 0.30},
		{year:"1997", rate: 0.43},
		{year:"1996", rate: 0.57},
		{year:"1995", rate: 0.37},
		{year:"1994", rate: 0.43},
		{year:"1993", rate: 0.36},
		{year:"1992", rate: 0.55},
		{year:"1991", rate: 0.49},
		{year:"1990", rate: 0.46},
		{year:"1989", rate: 0.48},
		{year:"1988", rate: 0.74}
	]

// TODO draw only if visible

	var parseDate = d3.time.format("%Y").parse;
	 
	firearm_homicide_p_100k.forEach(function(d) {
	    d.year = parseDate(d.year);
	});


	var width = document.getElementById('graph').clientWidth;
	var height = 200; 

	var y = d3.scale.linear()
    	.range([height, 0])
    	.domain(d3.extent(firearm_homicide_p_100k, function(d) { return d.rate; }));;
	
	var yAxis = d3.svg.axis()
    	.scale(y)
    	.orient("left");

    var line = d3.svg.line()
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.rate); });

	guns.selectAll('g').remove();

	guns
		.attr('width', width)
		.attr('height', height)
		.attr('id','guns');


	var innerGuns = guns
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
		.text("Rate (per 100,000 population)");	

	var path = innerGuns.append("path");

	// var title = innerGuns
	// 		.append('text')
	// 		.attr("transform", "translate(50,10)")
	// 		.text("Firearm homicides per 100,000 population");
	

	function brushended(){

		path.datum(firearm_homicide_p_100k)
	      .attr("class", "line")
	      .attr("d", line); 

	}

	brushended();
	brush.on("brush."+gunsId, brushended);


}

var interval = 500; // ms
function callUntil(){
  if (loaded) {
        draw_guns();
    } else {
        setTimeout(callUntil, interval);
    }
}
setTimeout(callUntil, interval);

d3.select(window).on('resize.'+gunsId,function(event) {
	draw_guns();
});

