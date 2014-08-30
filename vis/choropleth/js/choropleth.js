

var colorScale = d3.scale.quantize() //threshold()
			.domain([0, 20])
			.range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]); // thanks colorbrewer
	



// return color for feature
function choroplethColor(feature) {
	// TODO auto domain, legend, choose year (just [3] mightn't work) or timeseries plot, popup
	var val = geoMap.get(feature.properties.SA2_MAIN11)[3].value;
	if (val) return colorScale(val);
	else {
		console.log('broken', val);
		return NaN;
	}
}

// TODO filter out non SA2s

function updateColor(){
	// set the domain of colorScale
	var rangeChoro = [];
	var tempC;
	var geoKeys = geoMap.keys();
	for (var i = 0; i < geoKeys.length; i++) {
		try{
			tempC = + geoMap.get(geoKeys[i])[3].value;
			if (!isNaN(tempC)) rangeChoro.push(tempC);
		}
		catch(error) {
			console.log(error, ' no value for ', i,  geoKeys[i]);
		}
		
	};
	var range = d3.extent(rangeChoro);
	var r = (range[1]-range[0])/10;
	colorScale.domain([range[0]+r, range[1]-r]);
}

function updateLegend(){
	// d3.select('#legend svg').remove();
	// var legend = d3.select('#legend').append('svg');
	var grades = colorScale.range();
	var labels = [];
	for (var i = 0; i < grades.length; i++) {
            fromTo = colorScale.invertExtent(grades[i]);
            labels.push(
                '<div style="background-color:' + grades[i] + '; display: inline-block; vertical-align: middle; width:20px; height: 20px;"></div> ' +
                fromTo[0].toFixed(2) + (fromTo[1] ? '&ndash;' + fromTo[1].toFixed(2) : '+'));
    }
    document.getElementById('legend').innerHTML = labels.join('<br />');
}

