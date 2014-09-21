
d3.select('#other').append('div').attr('id', 'autoselecter')
  .html(
    "Modeller's database (<a href='http://www.abs.gov.au/ausstats/abs@.nsf/mf/1364.0.15.003'>data source</a>)."
    + "<div id='chosen'>Plot </div>"
    + "<input id='filter' type='text' placeholder='click to choose, type to filter'>"
    + "<div id='filtered'></div>"
    );



var mdbId = _.uniqueId('b_');
// var mdb = d3.select('#other')
//   .append('svg');

function draw_mdb(){




  d3.json('data/modeller_db/modeller_db_tables.json', function(tables){
    var timeseries_graph = new Timeseries_graph();

    var filterInput = $('#other').find('input');

    // what to do when an option is picked
    var chosen =  function(choice){
      $('#chosen').html("Plot " + tables[choice].name );

      d3.text('data/modeller_db/'+tables[choice].file, function(rawText){

            // clean the table up
            var rows = rawText.split('\n');
            var header = rows.splice(1,9);
            var cells = rows[0].split(',');
            cells[0] = 'date';
            rows[0] = cells.join(',').replace(/Value ; /g, '');
            var table = d3.csv.parse(rows.join('\n'));

            timeseries_graph.draw_table(table);

      });

    }

    // return rendered and filterd data to be set as inner html of resultsDiv 
    var filterRender = function(){
      var re = new RegExp(filterInput.val(), 'i');

        var markup = '';
      for (var i = 0; i < tables.length; i++) {
        if (re.test(tables[i].name)){
          markup += '<div class="result" data-i="'+ i +'">'+ tables[i].name + '</div>';
        }
      };
      return markup;
    }


    make_autocomplete(filterInput, $('#filtered'), filterRender, chosen);
    chosen(3);



    // d3.select('#other').append('div')
    // .attr('id', 'mdb-tables')
    // .selectAll('.table-name')
    // .data(tables).enter()
    // .append('div')
    // .attr('class', 'table-name')
    // .html(function(d,i){ return d.name; })
    // .on('click', function(d){
    //     d3.text('data/modeller_db/'+d.file, function(rawText){

    //       // clean the table up
    //       var rows = rawText.split('\n');
    //       var header = rows.splice(1,9);
    //       var cells = rows[0].split(',');
    //       cells[0] = 'date';
    //       rows[0] = cells.join(',').replace(/Value ; /g, '');
    //       var table = d3.csv.parse(rows.join('\n'));

    //       timeseries_graph.draw_table(table);

    //     });
    // });

  });

}

var interval = 500; // ms
function callUntil(){
  if (loaded) {
        draw_mdb();
    } else {
        setTimeout(callUntil, interval);
    }
}
setTimeout(callUntil, interval);

d3.select(window).on('resize.'+mdbId,function(event) {
  draw_mdb();
});

