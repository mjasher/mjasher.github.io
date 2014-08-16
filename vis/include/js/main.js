var displayModel = new Backbone.Model();

//-------------------------------------------------------------
// leaflet map
//-------------------------------------------------------------

var map = L.map('map').setView([-35.3075, 149.1244], 13);

//OSM
//baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
//        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
//}).addTo(map);
//
//windowLayer = L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
//    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
//        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
//}).addTo(map);
//

//ESRI
baseLayer = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash;' +
        'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
}).addTo(map);

windowLayer = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash;' +
        'Esri, DeLorme, NAVTEQ'
}).addTo(map);

map.invalidateSize();

$(document).ready(function () {

    map.on('move', repositionMask);
    map.fire('move');

});


function repositionMask() {
    var po = map.getPixelOrigin(),
        pb = map.getPixelBounds(),
        offset = map.getPixelOrigin().subtract(map.getPixelBounds().min);

    var overlay = document.getElementById("sidebar").getBoundingClientRect();

    $(windowLayer._container).css({
        clip: 'rect(' + (overlay.top - offset.y) + 'px,' + (overlay.left + overlay.width - offset.x) + 'px,' + (overlay.top + overlay.height - offset.y) + 'px,' + (overlay.left - offset.x) + 'px)'
    });
}

map.on('moveend', function(){
    displayModel.set('geoBounds', map.getBounds());
});



//-------------------------------------------------------------
// esri geocoder
//-------------------------------------------------------------
// create the geocoding control and add it to the map
var searchControl = new L.esri.Controls.Geosearch().addTo(map);

// create an empty layer group to store the results and add it to the map
var results = new L.LayerGroup().addTo(map);

// listen for the results event and add every result to the map
searchControl.on("results", function (data) {
    results.clearLayers();
    for (var i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng , 
                                  {icon : L.AwesomeMarkers.icon({
                                        icon: 'glyphicon-star',
                                        markerColor: 'blue'
                                    })}
                                 ));
    };
});

searchControl.on("error", function (e) {
    console.log(e);
});


//-------------------------------------------------------------
// add marker on click
//-------------------------------------------------------------

//map.on('click', function (e) {
//    console.log(e);
//
//    var redMarker = L.AwesomeMarkers.icon({
//        icon: 'glyphicon-star',
//        markerColor: 'red'
//    });
//
//    L.marker(e.latlng, {
//        icon: redMarker
//    }).addTo(map);
//});


//-------------------------------------------------------------
// random test events
//-------------------------------------------------------------
var today = new Date();

function randomDate(start, end) {
    var randDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    if (randDate.getHours()<6) randDate.setHours(randDate.getHours() + 6);
    if (randDate.getHours()>20) randDate.setHours(randDate.getHours() - 4);
    return randDate;
}
var testTitles = "On the third day there was a wedding at Cana in Galilee, and the mother of Jesus was there. 2 Jesus also was invited to the wedding with his disciples. 3 When the wine ran out, the mother of Jesus said to him, They have no wine. 4 And Jesus said to her, Woman, what does this have to do with me? My hour has not yet come. 5 His mother said to the servants, Do whatever he tells you.".split(' ');

var testNames = ["Lecia","Shizue","Micaela","Marin","Jamison","Noe","Fae","Lakeisha","Malissa","Flo","Chantal","Donetta","Solomon","Boyce","Yen","Rosaria","Ashli","Marnie","Shelby","Eboni","Ahmad","Jone","Emily","Roscoe","Della","Vita","Alphonse","Samara","Ching","Beverley","Catherin","Arnetta","Oralia","Earline","Estell","Carrie","Tracee","Mara","Deandra","Berniece","Marvin","Estelle","Dorotha","Ronna","Augustine","Lauralee","Linnea","Cicely","Katlyn","Chara"]

var testEventSyn = ["affair", "amusement", "at-home", "ball", "banquet", "barbecue", "bash", "carousal", "carousing",  "celebration", "cocktails", "coffee klatch", "dinner", "diversion", "do", "entertainment", "feast", "festive occasion",  "festivity", "fete", "fun", "function", "gala", "get-together", "luncheon", "movable feast", "prom",  "reception", "riot", "shindig", "social", "soiree", "splurge", "spree", "accident", "act", "action", "advent", "adventure", "affair", "appearance", "business", "calamity", "case", "catastrophe", "celebration", "ceremony",  "chance", "circumstance", "coincidence", "conjuncture", "crisis", "deed", "development", "emergency", "episode", "experience", "exploit", "fact", "function",  "holiday", "incident", "juncture", "marvel", "matter", "milestone", "miracle", "misfortune", "mishap", "mistake", "occasion", "occurrence", "pass",  "phase", "phenomenon", "predicament", "proceeding", "shift", "situation", "story", "thing", "tide", "transaction", "triumph", "turn"]

var testEvents = []

for (var i=0;i<50;i++){
    var testStart = randomDate( today , new Date(new Date(today).setMonth( today.getMonth() + 4 )));
    var testEnd = new Date(new Date(testStart).setHours( testStart.getHours() + 1 ));
    
    testEvents.push({ "id": i,
                     "title": testNames[i]+"'s "+testEventSyn[i],
                     "location": {lat: -35.3075 + (Math.random()-0.5)/10, lng: 149.1244 + (Math.random()-0.5)/10},
                     "start" : testStart.getTime(),
                     "end" : testEnd.getTime(),
                     'color': 'blue'
                    })
}

//-------------------------------------------------------------
// calender
//-------------------------------------------------------------

var options = {
    events_source: [],//testEvents,
//    [
//        {
//            "id": 293,
//            "title": "Event 1",
//            "url": "http://example.com",
//            "class": "event-important",
//            "start": 12039485678000, // Milliseconds
//            "end": 1234576967000 // Milliseconds
//        },
//    ],
    view: 'month',
    //    modal: '#events-modal',
    tmpl_path: 'third/bootstrap-calendar-master/tmpls/',
    tmpl_cache: false,
    //day: '2013-03-12',
    onAfterEventsLoad: function (events) {
        
        
//        console.log("view", {start : parseInt(this.options.position.start.getTime()),
//                                        end : parseInt(this.options.position.end.getTime()) })
//                displayModel.set('dateBounds', {start : parseInt(this.options.position.start.getTime()),
//                                        end : parseInt(this.options.position.end.getTime()) });
        
//        if (!events) {
//            return;
//        }
//        var list = $('#eventlist');
//        list.html('');
//
//        $.each(events, function (key, val) {
//            $(document.createElement('li'))
//                .html('<a href="' + val.url + '">' + val.title + '</a>')
//                .appendTo(list);
//        });
    },
    onBeforeEventsLoad: function(next) {
        displayModel.set('dateBounds', {start : parseInt(this.options.position.start.getTime()),
                                        end : parseInt(this.options.position.end.getTime()) });
        next();
        
    },
    onAfterViewLoad: function (view) {
        $('#calendarTitle').text(this.getTitle());
        $('.btn-group button').removeClass('active');
        $('button[data-calendar-view="' + view + '"]').addClass('active');
 
        $(".cal-day-hour-part").on('click', function () {
            
            if(createModel.get('editing')){
                var hM = this.children[0].children[0].innerHTML.match(/(\d{2}):(\d{2})/);
                var date = new Date();
                date.setTime(calendar.options.position.start);
                date.setHours(hM[1]);
                date.setMinutes(hM[2]);
                
                createModel.set('start', date.getTime());
                date.setHours(parseInt(hM[1]) + 1);
                createModel.set('end', date.getTime());
                sidebar.hide();
                $("#createModal").modal('show');
            }
            
        });
//
//        console.log("calendar scope", this.options.view, this.options.position.start.getDateFormatted(), this.options.position.end.getDateFormatted());

    },
    classes: {
        months: {
            general: 'label'
        }
    }
};


var calendar = $('#calendar').calendar(options);

$('.btn-group button[data-calendar-nav]').each(function () {
    var $this = $(this);
    $this.click(function () {
        calendar.navigate($this.data('calendar-nav'));
    });
});

$('.btn-group button[data-calendar-view]').each(function () {
    var $this = $(this);
    $this.click(function () {
        calendar.view($this.data('calendar-view'));
    });
});



//-------------------------------------------------------------
// leaflet-sidebar
//-------------------------------------------------------------

var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});
map.addControl(sidebar);

sidebar.show();

//-------------------------------------------------------------
// displayModel 
//-------------------------------------------------------------

//r displayModel = Backbone.Model();
var displayLayer = new L.LayerGroup().addTo(map);

var DisplayView = Backbone.View.extend({
    
    initialize: function(){
        this.model.set('geoBounds', map.getBounds());
        this.model.set('dateBounds', {start: parseInt(calendar.options.position.start.getTime()), end: parseInt(calendar.options.position.end.getTime())});
        this.model.on('change', this.render, this);
        this.render();
    },
    

    filterEvents: function(){
        var unfilteredEvents = testEvents;
        
        // time filter
        var start = this.model.get('dateBounds').start;
        var end = this.model.get('dateBounds').end;
        var events = [];
		$.each(unfilteredEvents, function() {

			if((parseInt(this.start) < end || this.start == null) && (parseInt(this.end) >= start || this.end == null)) {
				events.push(this);      
			}
		});
        
        return events;
        
        
//        this.model.get('geoBounds')
    },
    
    render: function(){
        var filteredEvents = this.filterEvents();
        
        calendar.options.events_source = filteredEvents;
        
        //NOT calendar.setOptions(options); because view changes
        setTimeout(function(){
              calendar._init_position();
		      calendar._loadEvents();
		      calendar._render();         
              calendar.options.onAfterViewLoad.call(calendar, calendar.options.view);
        },200); // ugly hack - how do we do this better? callback functions?
        
        //$('button[data-calendar-view="month"]').trigger('click') //hack to force calendar refresh
        
        displayLayer.clearLayers();
        for (var i=0; i<filteredEvents.length; i++){
            //if ( ! typeof(filteredEvents[event]) == 'function' ){
            
                var blueMarker = L.AwesomeMarkers.icon({
                    icon: 'glyphicon-star',
                    markerColor: filteredEvents[i].color
                });
                
                var popupString = '<div class="popup">';
                        popupString += filteredEvents[i].title +'<br>';
                        var date = new Date();
                        date.setTime(filteredEvents[i].start);
                        popupString += date + '<br>';
                    
//                    for (var k in filteredEvents[i]) {
//                        var v = filteredEvents[i][k];
//                        popupString += k + ': ' + v + '<br />';
//                    }
                   // popupString += 'choropleth value: ' + choropleth(feature.properties[code]) + '<br/>';
                    popupString += '</div>';
            
                displayLayer.addLayer(
                    L.marker(filteredEvents[i].location, {
                        icon: blueMarker
                })  .bindPopup(popupString)); 
            
              //  console.log("mapping", filteredEvents[i]);
            
                //todo popup with time and title
            //}
                
                
        }
        
        return this;
        
    }
    
    
});


var displayView = new DisplayView({model:displayModel});
map.on('moveend', function(){
    displayModel.set('geoBounds', map.getBounds());
});



//-------------------------------------------------------------
// create modal
//-------------------------------------------------------------
var createLayer = new L.LayerGroup().addTo(map);

$("#createButton").click(function () {
    sidebar.hide();
    $("#createModal").modal();
});
$("#createModal [data-dismiss]").click(function () {
    sidebar.show();
});

var CreateModel = Backbone.Model.extend();

var CreateView = Backbone.View.extend({  
            initialize: function(){
            	this.model.on('change', this.update, this);  
                this.model.set('color', 'red');
                
            },   
            update: function(){
                this.$('#createLocation').text(this.model.get('location'));
                
                var date = new Date();
                date.setTime(this.model.get('start'));
                date = isNaN(date.getTime()) ? '' : date;
                this.$('#createDate').text(date);
            },

            events: {
                'change #createTitle': function(e){ this.model.set('title', e.target.value); },
                'click #createLocationButton': function(){
                    $("#createModal").modal('hide');
                    
                    var model = this.model;
                    
                    function createCallback(e) {
                        //TODO just set the model and make marker a different view
                        createLayer.clearLayers();
//                        
//                        var redMarker = L.AwesomeMarkers.icon({
//                            icon: 'glyphicon-star',
//                            markerColor: 'red'
//                        });
//                        createLayer.addLayer(
//                            L.marker(e.latlng, {
//                                icon: redMarker
//                        })); 
                        
                        model.set('location', e.latlng); //{lat: e.latlng.lat, lng: e.latlng.lng});
    
                        map.off('click', createCallback);
                        
                        $("#createModal").modal('show');
 
                    }
                    
                    map.on('click', createCallback);

                },
                'click #createDateButton': function(){
                    this.model.set('editing',true);
                    $("#createModal").modal('hide');
                    sidebar.show();

                    
                },
                'click #createSaveButton': function(){
                    

                    //console.log(this.model.attributes, "saved");
                    
                    //TODO remove previously saved events with same ID
                    if (this.model.get('editing')){
                        testEvents.push(
                            { "id": 51,
                             "title": this.model.get('title'),  //TODO check for now title
                             "location": this.model.get('location'), //{lat: this.model.get('location').lat, lng: this.modle.get('location').lat},
                             "start" : this.model.get('start'),
                             "end" : this.model.get('end'),
                             'color': 'red'
                            }
                        );

                       //testEvents.push(this.model.toJSON);
                       displayView.render();
                    }
                    
                    this.model.set('editing',false);
                    $("#createModal").modal('hide');

                    
                    
                }
            },
});

                           
var createModel = new CreateModel({editing:false});

var createView = new CreateView({model: createModel});
createView.setElement('#createModal');  


//-------------------------------------------------------------
// find tour
//-------------------------------------------------------------


//TODO esri marker icon not working
//TODO bootstrap 3 calendar year compresses badly
//TODO the show/hide only needs to happen because the modal is displaying behind the sidebar of z-index 7. it doesn't work for escape key


var tour = new Tour({
    steps: [
        {
            element: ".geocoder-control",
            placement: "right",
          //  title: "Title of my step",
            content: "Search for neighbourhood or city you're interested in. Just make sure you can see this area on the map.",
            onShow: function (t) {
               // L.DomUtil.addClass(searchControl._container,"geocoder-control-expanded");                
//                    setTimeout(function () {
//                            searchControl._input.focus();     
//                    }, 1000); 
                //$('.gecoder-control-input').focus();
                
                $(".popover[class*=tour-]").css('z-index','1');
                if (window.matchMedia("(max-width: 767px)").matches) {
                    sidebar.hide();
                }
            }
  },
        {
            element: "#calendar",
            placement: "top",
            //title: "Title of my step",
            content: "Select the year, month, week, or day you're interested in on the calendar.",
            onShow: function (t) {
                    sidebar.show();
            },
            onShown: function () {
                $(".popover[class*=tour-]").css('z-index','2000');
            }
  }
        ],
    storage: false
});
// Initialize the tour
tour.init();

$("#findButton").click(function () {
 
 

    // Start the tour
//    sidebar.hide();
    tour.start(true);
 
    
});

