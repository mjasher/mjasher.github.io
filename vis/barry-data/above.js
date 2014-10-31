
var d3 = require('d3');
var fs = require('fs');

// thanks to http://paulbourke.net/miscellaneous/correlate/
function cross_correlation(x,y){
  var i,j;
  var mx,my,sx,sy,sxy,denom,r;

  var n = Math.min(x.length, y.length);
  var maxdelay = n;
  var correlation = [];


  /* Calculate the mean of the two series x[], y[] */
  mx = 0;
  my = 0;   
  for (i=0;i<n;i++) {
    mx += x[i];
    my += y[i];
  }
  mx /= n;
  my /= n;

  /* Calculate the denominator */
  sx = 0;
  sy = 0;
  for (i=0;i<n;i++) {
    sx += (x[i] - mx) * (x[i] - mx);
    sy += (y[i] - my) * (y[i] - my);
  }

  denom = Math.sqrt(sx*sy);


  /* Calculate the correlation series */
  for (delay=-maxdelay;delay<maxdelay;delay++) {
    sxy = 0;
    for (i=0;i<n;i++) {
       j = i + delay;
       if (j < 0 || j >= n)
          continue;
       else
          sxy += (x[i] - mx) * (y[j] - my);
       /* Or should it be (?)
       if (j < 0 || j >= n)
          sxy += (x[i] - mx) * (-my);
       else
          sxy += (x[i] - mx) * (y[j] - my);
       */
    }
    r = sxy / denom;

    correlation[delay+maxdelay] = r;
    
    /* r is the correlation coefficient at "delay" */

  }
  // console.log(correlation);
  return correlation;
}







// TODO make sure we fill in blanks for missing dates

var catchment_files = [
'Fyshwick_out.csv',
'Lower_out.csv',
'Mid_out.csv',
'Riverview_out.csv',
'Tuggeranong_out.csv',
'Tugg_out.csv',
'Yarralumla_out.csv'
]
// var catchment_files = ['Tuggeranong_out.csv']

var correlations = [];

function catchment_correlations(catchment_files, i){
   fs.readFile('ignore_data/'+catchment_files[i]+'.json', 'utf8', function (err, data) {


    data = d3.csv.parse(data);

  // d3.csv('ignore_data/'+catchment_files[i]+'.json', function(error, data) {

    var parseDate = d3.time.format("%d %m %Y").parse;

    for (var j = 0; j < data.length; j++) {
      data[j].date = parseDate(data[j].Date);
    };

    var nested = d3.nest()
          .key(function(d){ return d.Site })
          .entries(data);



    // console.log(nested[0])
    // for each site
    for (var j = 0; j < nested.length; j++) {
      
      // var nodes = Object.keys(nested[i].values);

        // var side = d3.scale.ordinal().rangeBands([0, height]).domain(d3.range(nodes.length));


        var species = Object.keys(nested[j].values[0])
        .filter(function(name){
          return ! name.match(/-1/);
        })
        .map(function(name) {
          return {
            key: name,
            values: nested[j].values.map(function(d) {
              var v = +d[name];
              if (+d[name] == -9999) v = null;
              return {date: d.date, v: v};
            })
          };
        });


        for (var k = 0; k < species.length; k++) {
          for (var l = 0; l < species.length; l++) {
            var temp = d3.max(cross_correlation(
                  species[k].values.map(function(d){ return d.v; }), 
                  species[l].values.map(function(d){ return d.v; }) 
            ));
            if (temp>0.7) {
              correlations.push({cor:temp, species_x :species[k].key, species_y: species[l].key, site: nested[j].key, catchment: catchment_files[i]});
            }
            // species[l].values.map(function(d){ return d.v; }) ));
            // matrix[k][l] = temp ? {x:l,y:k,z:temp} : {x:l,y:k,z:0};
          };
        };


    };

    fs.writeFile('correlation_'+catchment_files[i]+'.json', d3.csv.format(correlations));

  });
}


for (var i = 0; i < catchment_files.length; i++){

  catchment_correlations(catchment_files,i);

}