
var fusiontable_api_key = "AIzaSyDpfNMH_IkouFwgI8y0_6tTQ0437Ncx8cQ";
var fusiontable_id = {acts:"15-Ew4SFnqlzSa6uCxk1T430Q8iREB1-ihaQ4QkFk"};

// we need make these optimisations:
//  1. only load needed data from the server
//  2. only render content when both visible and changed


// colum names
// d3.json('https://www.googleapis.com/fusiontables/v1/tables/'+fusiontable_id.acts+'/columns?key='+fusiontable_api_key,function(data){
//   console.log('fusion table', data.items);
// });

// once loaded, replot visible years
function plotAustlii(from, to, acts_by_year, austlii, yearDraw){
    for(var year=from; year<=to; year++){

          austlii.selectAll('.c'+year).remove();

          austlii.append('g')
                .attr('class','c'+year+ ' year')
                .datum(new Date(year,0))
                .attr("transform", yearDraw)
                .selectAll('circle')
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
                .attr('y',function(d,i){ return i*7; })
                .text(function(d){ return d.name; })
      }
}

// load all the years we don't yet have locally into acts_by_year, then plot
function loadAustlii(ext, acts_by_year, austlii, yearDraw){
  var from = Number(ext[0].getFullYear());
  var to = Number(ext[1].getFullYear());

  var years=[];
  for(var year=from; year<=to; year++){
    if(! acts_by_year.has(year)) years.push(year);
  }

  // https://developers.google.com/fusiontables/docs/v1/sql-reference
  if (years.length>0){
      d3.csv(
        "https://www.googleapis.com/fusiontables/v1/query?"
              +"sql=SELECT * FROM " + fusiontable_id.acts
              +" WHERE year IN (" + years.join() + ")"
              // +" AND name CONTAINS 'TAX'"
              +"&alt=csv&key=" + fusiontable_api_key,
        function(data){

            nested = d3.nest()
              .key(function(d) { return d.year; })
              .entries(data);

            for (var i = 0; i < nested.length; i++) {
              acts_by_year.set( nested[i].key, nested[i].values );
            };
            plotAustlii(from,to, acts_by_year, austlii,yearDraw);
        }
      );
  }
  else plotAustlii(from,to, acts_by_year, austlii,yearDraw);
}