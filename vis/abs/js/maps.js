(function(){

	var map = new L.Map('map', {
        center: [-35.1663756, 149.2531554],  
            zoom: 8, // start zoom
            minZoom: 5,
            maxZoom: 10,
    });

    var Stamen_TonerBackground = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20
    }).addTo(map);



// ----------------------------------
// leaflet geojson tilelayer
// ----------------------------------

    var chosen_col = "percent_female_earner";

    geoMap = d3.map();

    var colorScale = d3.scale.quantize() //threshold()
                .domain([0, 2000])
                .range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]); // thanks colorbrewer
        

    // return color for feature
    function choroplethColor(feature) {
        // TODO auto domain, legend, choose year (just [3] mightn't work) or timeseries plot, popup
        if (geoMap.get(feature.properties.sa2_main11) != undefined){
            var val = geoMap.get(feature.properties.sa2_main11)[0][chosen_col];
            if (val) return colorScale(val);
        }
        return NaN;
    }

    function updateColor(){
        // set the domain of colorScale
        var rangeChoro = [];
        var tempC;
        var geoKeys = geoMap.keys();
        for (var i = 0; i < geoKeys.length; i++) {
            try{
                tempC = + geoMap.get(geoKeys[i])[0][chosen_col];
                if (!isNaN(tempC)) rangeChoro.push(tempC);
            }
            catch(error) {
                // console.log(error, ' no value for ', i,  geoKeys[i]);
            }
            
        };

        // get rid of top and bottom percentiles
        rangeChoro.sort(function(a, b){return a-b});
        var offset = Math.round(rangeChoro.length/10)
        colorScale.domain([rangeChoro[offset], rangeChoro[rangeChoro.length-1-offset]]);
    }



    var style = function(feature){
        var fillColor = "#00D";
        if (geoMap) fillColor = choroplethColor(feature);
        return {
            "clickable": true,
            "color": "#00D",
            "fillColor": fillColor, //"#00D"
            "weight": 1.0,
            "opacity": 0.3,
            "fillOpacity": 0.6
        }
    }
    var hoverStyle = {
        "fillOpacity": 0.5
    };

    var makePopup = function(feature){
        var popupString = '<div class="popup">';
        if (feature.properties) {
            for (var k in feature.properties) {
                var v = feature.properties[k];
                popupString += k + ': ' + v + '<br />';
            }
            if (geoMap){
                Object.keys(geoMap.get(feature.properties.sa2_main11)[0]).forEach(function(v){
                    popupString += v + ': ' + geoMap.get(feature.properties.sa2_main11)[0][v] + '<br />';
                });
            }
        }
        popupString += '</div>';
        return popupString;
    }
    // to switch just change SA2_MAIN11 to sa2_main11
    // var geojsonURL = 'http://urbananalyzer.appspot.com/sa2/{z}/{x}/{y}.json';
    var geojsonURL = '../../stache/sa2-psql/{z}/{x}/{y}.json';
    var geojsonTileLayer = new L.TileLayer.GeoJSON(geojsonURL, {
            clipTiles: true,
            unique: function (feature) {
                // return feature.properties.SA2_MAIN11; 
                return feature.properties.sa2_main11; 
            }
        }, {
            style: style,
            onEachFeature: function (feature, layer) {
                // TODO make here then update with d3.select('.popup')
                // layer.bindPopup(makePopup(feature));
                if (!(layer instanceof L.Point)) {
                    layer.on('mouseover', function () {
                        layer.setStyle(hoverStyle);
                        if(layer.bindPopup) layer.bindPopup(makePopup(feature));
                        // layer.openPopup();
                    });
                    layer.on('mouseout', function () {
                        layer.setStyle(style(feature));
                        if(layer.unbindPopup) layer.unbindPopup();
                        // layer.closePopup();
                    });
                }
            }
        }
    );
    map.addLayer(geojsonTileLayer);


    d3.csv('data/select_census.csv', function(data){
        geoMap = d3.nest()
        .key(function(d){ return d.region_id; })
        .map(data, d3.map);

        updateColor();
        geojsonTileLayer.geojsonLayer.setStyle(style);

    });



})();