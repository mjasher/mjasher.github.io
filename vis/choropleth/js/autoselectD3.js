// change everytime
// =====================
var driveTableNames = [
        {
            long: "National Regional Profile, Population, ASGS, 2007-2011",
            short: "1NZqM7xmjpXLlyBoryjnrOuiKw56FxuJ3tc_zGAVD"
        },
        {
            long: "National Regional Profile, Industry, ASGS, 2007-2011",
            short: "1DhCZ70s6Zb2sVwy3U7cAj01pkZ_PO8F1wS44iaeW"
        },
        {
            long: "National Regional Profile, Environment, ASGS, 2007-2011",
            short: "1WZX7wwo6WfBpJ8k47B_GVz7gIngsEvsbNrp6qtR6"
        },
        {
            long: "National Regional Profile, Economy, ASGS, 2007-2011",
            short: "1gB66u4yU-Jc7Q9m8oYtkr5VPf_f5gE0os4fTrMRa"
        }
];

var resultsDiv = d3.select('#filtered');
var filterInput = d3.select('#filter');
var chosenDiv = d3.select('#chosen');

// what to do when an option is picked
var chosen =  function(choice){
	chosenDiv.html("chosen: " + driveTableNames[choice].long );
}

// return rendered and filterd data to be set as inner html of resultsDiv 
var filterRender = function(){
	var re = new RegExp(filterInput.val(), 'i');

    var markup = '';
	for (var i = 0; i < driveTableNames.length; i++) {
		if (re.test(driveTableNames[i].long)){
			markup += '<div class="result" data-i="'+ i +'">'+ driveTableNames[i].long + '</div>';
		}
	};
	return markup;
}

// change sometimes
// =====================

function make_autocomplete(filterInput, resultsDiv, filterRender, chosen){
	function renderResults(results){
		// render list
		resultsDiv.html(filterRender());
		resultsDiv.selectAll(':first').classed('active', true);

		// mouse navigation listeners
		resultsDiv.children().off('mouseenter');
		resultsDiv.children().on('mouseenter',
		    function(){
		      resultsDiv.selectAll('.active').classed('active', false);
		      $(this).addClass('active');
		    }
	  	);
	}

	var chosen_i = 0;
	filterInput.on('blur', function(){
		chosen(chosen_i);
		resultsDiv.off('click');
		resultsDiv.hide();
	});

	filterInput.off('focus');
	filterInput.on('focus', function(e){
		resultsDiv.show();
		this.setSelectionRange(0, this.value.length);
		renderResults();
	  	var current;
	  	filterInput.off('keyup');
	 	filterInput.on('keyup', function(e){
	        switch(e.keyCode){
	          case 38: // up
	            current = resultsDiv.find('.active');
	            if (!current.is(':first-child')) current.removeClass('active').prev().addClass('active');   
	            break;
	          case 40: // down
	            current = resultsDiv.find('.active');
	            if (!current.is(':last-child')) current.removeClass('active').next().addClass('active');   
	            break;
	          case 13: // enter
	          	chosen_i = resultsDiv.find('.active').attr('data-i');
	          	filterInput.trigger('blur');
	            break;
	          // case 9: // tab
	          //   break;
	          case 27: // escape
	          	filterInput.trigger('blur'); 		
	            break;
	          default:
	            renderResults( );
	        }
	  	});

	  	resultsDiv.off('mousedown'); // fires before blur, click fires after
	  	resultsDiv.on('mousedown', function(){
	  		chosen_i = resultsDiv.find('.active').attr('data-i');
	        filterInput.trigger('blur');
	  	});

	});

}

make_autocomplete(filterInput, resultsDiv, filterRender, chosen);