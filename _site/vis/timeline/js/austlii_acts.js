var austliiId = _.uniqueId('b_');


d3.select('#other').append('div')
	.html("Show acts with <input id='filter' value='gun or firearm' type='text'> in the title.");


var austlii = d3.select('#other')
		.append('svg');

    // <div id='title'> The Acts of the Australian Federal Governments </div> 
    // <div id='sub-title'> Show acts with <input id='filter' value="gun or firearm" type='text'> in the title. </div>

// TODO we should use queue or a promise here to make sure draw_pms is finished
// var throttled = _.throttle(updatePosition, 100);
// $(window).scroll(throttled);


function draw_austlii(acts_by_year){

	austlii.selectAll('g').remove();

	austlii.attr("width", width + margin.left + margin.right)
		.attr('height', 2000)
		// .append('div')
		.attr('id','austlii');


	// austlii.selectAll('ul').remove();

	// draw all acts, rendering on view change is too slow
	// austlii.selectAll('ul')
	// 		.data(acts_by_year.keys().map(function(y){ return new Date(y,0)}))
	// 		.enter()
	// 		.append('ul')
 //            .attr('class', function(d){ return 'c'+d.getFullYear()+ ' year';} )
 //            .classed('invisible', true)
	// 		.style('font-size', '8px')
	// 		.style('position', 'absolute')
	// 		.style('top', 0)
	// 		.selectAll('li')
	// 		.data(function(d){ return acts_by_year.get(d.getFullYear()); })
	// 		.enter()
	// 		.append('li')
	// 		.append('a')
	// 		.attr('href', function(d){ return 'http://www.austlii.edu.au/au/legis/cth/num_act/'
 //                  + d.url; })
	// 		.text(function(d){ return d.name; });

	austlii.selectAll('g')
			.data(acts_by_year.keys().map(function(y){ return new Date(y,0)}))
			.enter()
			.append('g')
            .attr('class', function(d){ return 'c'+d.getFullYear()+ ' year';} )

}


d3.json('data/austlii/all.json', function(error,data){

	// put acts in nested (by year) map
	var acts_by_year = d3.map();
	for (var i = 0; i < data.values.length; i++) {
		if ( acts_by_year.has(data.values[i][ data.headings['year'] ]) ){
			acts_by_year.get(data.values[i][ data.headings['year'] ]).push({
				name: data.values[i][ data.headings['name'] ],
				url: data.values[i][ data.headings['url'] ]
			})
		}
		else {
			acts_by_year.set(data.values[i][ data.headings['year'] ], 
				[{
				name: data.values[i][ data.headings['name'] ],
				url: data.values[i][ data.headings['url'] ]
				}]
			);
		}
	};

	function brushended(){

		a_time = new Date(2013,1);
		a_year_later = new Date(2014,1);

		// var year_width = ( x(a_year_later)-x(a_time) )+'px';
		var year_width = x(a_year_later)-x(a_time);

		// austlii.selectAll('ul')
		austlii.selectAll('g')
			.classed('invisible', true)

		var from = brush.extent()[0].getFullYear();
		var to = brush.extent()[1].getFullYear();

		var this_year; 

		for(var year=from; year<=to; year++){

			// only rerender visible
			this_year = austlii.select('.c'+year)
				.attr('transform', function(d){ return "translate(" + (margin.left+x(d)) + ",10)"; } )
				.classed('invisible', false);
				// .style('width', year_width)
				// .style('left', function(d){ return x(d)+'px'; });
			
			this_year.selectAll('a').remove();

	        //this_year.exit().remove(); // something fishy

            this_year
            	.selectAll('a')
                .data(acts_by_year.get(year).filter(function(act){
                    var acts_filter_terms = d3.select('#filter')[0][0].value.split(' or ');
                    for (var i = 0; i < acts_filter_terms.length; i++) {
                      if (act.name.indexOf(acts_filter_terms[i].toUpperCase()) > -1) return true;
                    };
                    return false;
                }))
                .enter()
			    .append('svg:a')
	            .attr("xlink:href", function(d){return 'http://www.austlii.edu.au/au/legis/cth/num_act/'
	              + d.url;}) 
	            .append('text')
	            .style('font-size','7px')           
	            .text(function(d){ return d.name; })
	           	// .style("font-size", function(d) { 
	            // 	return year_width*7/this.getComputedTextLength() + "px"; 
	            // })
	           	.attr('y',function(d,i){ return i*7; });




		}
	} 

	draw_austlii(acts_by_year);
	brushended();

	d3.select(window).on('resize.'+austliiId,function(event) {
      draw_austlii(acts_by_year);
      brushended();

  	});

  	d3.select('#filter').on('blur', brushended);

  	brush.on("brush."+austliiId, brushended);


});

