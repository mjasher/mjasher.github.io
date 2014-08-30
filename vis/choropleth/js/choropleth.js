

var colorScale = d3.scale.quantize() //threshold()
			.domain([0, 20])
			.range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]); // thanks colorbrewer
	

// return color for feature
function choroplethColor(feature) {
	// TODO auto domain, legend, choose year or timeseries plot, popup
	var val = geoMap.get(feature.properties.SA2_MAIN11)[3].value;
	if (val) return colorScale(val);
	else {
		console.log('broken', val);
		return NaN;
	}
    // try {
    //     //SA2map.get(fCode);
    //     //return codeControl();
    //     return SA2map.get(fCode);
    // } catch (e) {
    //     return NaN;
    // }
}

// Legend view-source:http://leafletjs.com/examples/choropleth-example.html
// function addLegend(map, colors) {
//     // expand domain for quantize
//     var d = (colors.domain()[1] - colors.domain()[0]) / 9

//     var legend = L.control({
//         position: 'bottomright'
//     });
//     legend.onAdd = function (map) {
//         var div = L.DomUtil.create('div', 'info legend'),
//             grades = colors.range(),
//             labels = [];

//         for (var i = 0; i < grades.length; i++) {
//             fromTo = colors.invertExtent(grades[i]);
//             labels.push(
//                 '<i style="background:' + grades[i] + '"></i> ' +
//                 fromTo[0].toFixed(2) + (fromTo[1] ? '&ndash;' + fromTo[1].toFixed(2) : '+'));
//         }

//         div.innerHTML = labels.join('<br />'); // '<h4> Legend </h4>' +
//         return div;
//     }
//     legend.addTo(map);
// }



// find the range of values to create legend
// var rangeChoro = [];
// var tempC;
// for (i in SA2map.keys()) {
//     // add to range only if choroplethColor returns a value for this element
//     tempC = +SA2map.get(SA2map.keys()[i]);
//     if (!isNaN(tempC)) {
//         rangeChoro.push(tempC);
//     }
// }
// addLegend(map, d3Color);

// d3Color(SA2map.get(feature.properties[code]))