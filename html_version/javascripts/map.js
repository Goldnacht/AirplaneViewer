/**
 * Created by Frederik Eschmann
 */
var APViewer = APViewer || {};

APViewer.map = {
    hoveredAirplane: null,
    selectedAirplane: null,
    hoveredAirport: null,
    selectedAirport: null,
    displayAirplane: displayAirplane,
    displayAirport: displayAirport
};

/* Vector-Layer for airplanes and airports: Icon-Layer
 */
var vectorSource = new ol.source.Vector({});
var vectorLayer = new ol.layer.Vector({ source: vectorSource });

/* Array of layer.Group to switch with the layer-switcher
 */
var layerGroups = [
	/* Openstreet-Map ('Map'), with Icon-Layer
	 */
    new ol.layer.Group({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ]
    }),
	/* MapQuest Sat-Map with Hybrid-Map for streets, with Icon-Layer
	 */
    new ol.layer.Group({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'sat'})
            }),
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'hyb'})
            }),
            vectorLayer
        ]
    })
];

/* Array of images for Layer-Chooser
 * It will show the image with index of the selected map
 */
var layerChooserImage = [APViewer.config.chooser_image_sat,APViewer.config.chooser_image_map];

/* The default view of the map. This will setup how the map will be initialized
 */
var view = new ol.View({
    center: ol.proj.transform(APViewer.config.map_view_center, 'EPSG:4326', 'EPSG:3857'),
    zoom: APViewer.config.map_view_zoom,
    maxZoom: APViewer.config.map_view_max_zoom
});

/* The map will load the ol.Map class in the div#map
 */
var map = new ol.Map({
    target: document.getElementById('map'),
    view: view,
    interactions : ol.interaction.defaults({doubleClickZoom :true})
});

/* The currentMap will save the selected layer.Group. Needed for layer-switcher
 */
var currentMap = 0;

/* Add an click-event to the layer-switcher
 * this will toggle the selected layer between 0 and 1
 */
$('#mapLayerChooser').click(function(event){
    console.log("click");
    currentMap = currentMap == 0 ? 1 : 0;
    map.setLayerGroup(layerGroups[currentMap]);
    $("#mapLayerChooserImage").attr("src",layerChooserImage[currentMap]);
});

/* Adding Authors to the info-box
 */
$('.ol-attribution').prepend('<div class="creators">&copy; Frederik Eschmann, Hatice Yildirim, Christine Vosseler, Waldemar Stenski</div>');

/* Moving search-button to the left-top-controls
 */
$('#searchButton').prependTo('.ol-control.ol-zoom');

/* Add click-event to closePopout
 */
$('#closePopout').click(closePopout);

/* Function for close popout and deselect airplane
 */
function closePopout() {
    setAirplaneFeatureStyle(APViewer.map.selectedAirplane, "");
    APViewer.map.selectedAirplane = null;
    $('#popout').fadeOut();
}

/* add click-handler to the map and select feature if one is on mouse-position
 */
map.on('click', function (e) {
    var feature = map.forEachFeatureAtPixel(e.pixel, function(feature, layer) { return feature; });
    if (feature && feature.get("iconType") == "airplane") {
        var airplane = APViewer.data.getAirplane(feature.getId());
        selectAirplane(airplane);
    } else {
        closePopout();
    }
});

/* Function for seleecting an airplane and display popout with updated data
 */
function selectAirplane(airplane) {
    if (APViewer.map.selectedAirplane != null) {
        if (APViewer.map.selectedAirplane.icao != airplane.icao) { setAirplaneFeatureStyle(APViewer.map.selectedAirplane, ""); }
    }
    APViewer.map.selectedAirplane = airplane;
    updatePopoutData();
    setAirplaneFeatureStyle(APViewer.map.selectedAirplane, "clicked");
    $('#popout').fadeIn();
}

/* add mousemove-handler for map: try to find any feature at mouse-position and hover it
 */
map.on('pointermove', function(event) {
	// getting feature at mouse-position
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
	// change cursor-style to 'pointer'
    map.getTarget().style.cursor = feature != null ? 'pointer' : '';

    function resetHoveredAirplane() {
        if (APViewer.map.hoveredAirplane) {
            if (APViewer.map.hoveredAirplane != APViewer.map.selectedAirplane) {
                setAirplaneFeatureStyle(APViewer.map.hoveredAirplane, "");
            }
            APViewer.map.hoveredAirplane = null;
        }
    }
    function resetHoveredAirport() {
        if (APViewer.map.hoveredAirport) {
            if (APViewer.map.hoveredAirport != APViewer.map.selectedAirport) {
                setAirportFeatureStyle(APViewer.map.hoveredAirport, "");
            }
            APViewer.map.hoveredAirport = null;
        }
    }

    function reset(type) {
        if (type != "airport") resetHoveredAirport();
        if (type != "airplane") resetHoveredAirplane();
    }

    if (feature) {
        var type = feature.get("iconType");
        reset(type);
        if (type == "airplane") {
            var airplane = APViewer.data.getAirplane(feature.getId());
            if (airplane != APViewer.map.hoveredAirplane) resetHoveredAirplane();
            if (!APViewer.map.selectedAirplane || feature.getId() != APViewer.map.selectedAirplane.icao) {
                setAirplaneFeatureStyle(airplane, "hover");
            }
            APViewer.map.hoveredAirplane = airplane;
            $("#tooltipInfo").text(airplane.acid ? airplane.acid : airplane.icao);
            $("#tooltip").show();

        } else if (type == "airport") {
            var airport = APViewer.airport.getAirport(feature.getId());
            if (airport != APViewer.map.hoveredAirport) resetHoveredAirport();

            setAirportFeatureStyle(airport, "hover");

            APViewer.map.hoveredAirport = airport;
            $("#tooltipInfo").text(airport.iata + " | " + airport.name);
            $("#tooltip").show();
        }
    } else {
        reset();
        $("#tooltip").hide();
    }
});

/* Add mousemove-handler to the document for repositioning the tooltip-div
 */
$(document).bind('mousemove',function(e){
    var y = e.pageY + 5;
    var x = e.pageX + 5;
    $("#tooltip").css({ "top": y + "px", "left": x + "px" });
});

/* This function will change the icon for the given airplane depending on the state (selected, hovering, default)
 */
function setAirplaneFeatureStyle(airplane, state) {
    if (!airplane) return;
    var iconStyle = getIcon(state, airplane.heading);
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature) feature.setStyle(iconStyle);
}

/* This function will change the icon for the given airport depending on the state (selected, hovering, default)
 */
function setAirportFeatureStyle(airport, state) {
    if (!airport) return;
    var feature = vectorSource.getFeatureById(airport.iata);
    if (feature) {
        var image = state == "click" ? APViewer.config.airports_image_select :
					(state == "hover" ? APViewer.config.airports_image_hover :
					APViewer.config.airports_image);
        feature.setStyle(new ol.style.Style({image: new ol.style.Icon({src: image})}));
    }
}

/* This function will return ol.style.Style for an airplane
 * with state (selected, hovered, default), zoom and rotation depended icon
 */
function getIcon(state, rotation) {
    var src = "";
	if (rotation) {
		if (state == "clicked") {
			src += APViewer.config.airplane_image_select;
		} else if (state == "hover") {
			src += APViewer.config.airplane_image_hover;
		} else {
			src += APViewer.config.airplane_image;
		}
	} else {
		if (state == "clicked") {
			src += APViewer.config.airplane_image_NH_select;
		} else if (state == "hover") {
			src += APViewer.config.airplane_image_NH_hover;
		} else {
			src += APViewer.config.airplane_image_NH;
		}
	}

    return new ol.style.Style({
        image: new ol.style.Icon(({
            src: src,
            scale: 0.04 * view.getZoom(),
            rotation: rotation ? rotation : 0
        }))
    });
}

/* Update the data of the popout with the newest data of the selected airplane
 */
function updatePopoutData() {
    $('#icao').text(APViewer.map.selectedAirplane.icao);
    $('#acid').text(APViewer.map.selectedAirplane.acid);
    $('#longitude').text(APViewer.map.selectedAirplane.longitude.toFixed(7));
    $('#latitude').text(APViewer.map.selectedAirplane.latitude.toFixed(7));
    $('#horizontal').text(APViewer.map.selectedAirplane.hSpeed);
    $('#vertical').text(APViewer.map.selectedAirplane.vSpeed);
    $('#heading').text(APViewer.map.selectedAirplane.headingDeg ? APViewer.map.selectedAirplane.headingDeg : "?");
    $('#altitude').text(APViewer.map.selectedAirplane.altitude.toFixed(1));
}

/* This function will update or create an feature for the given airplane.
 * It will check for timeout and given position and hide the airplane if necessary.
 * And the function will also check if the position is out-dated and calculate the current position.
 */
function displayAirplane(airplane) {
    // Try to get feature of airplane
    var feature = vectorSource.getFeatureById(airplane.icao);

    // Exit when airplane has no position
    if (!airplane.longitude || !airplane.latitude) return;

    // Check for timeout of airplane, if timeout then remove from map and eventually reset selection
    var now = new Date().getTime();
    if (now - airplane.changed > APViewer.config.airplane_timeout){
        if (feature) vectorSource.removeFeature(feature);
        if (airplane == APViewer.map.selectedAirplane) {
            APViewer.map.selectedAirplane = null;
            closePopout();
        }
        return;
    }

    // if feature doesnt exists create it for airplane and add it to source
    if (!feature) {
        feature = new ol.Feature({name: airplane.icao});
        feature.setId(airplane.icao);
        feature.set("iconType","airplane");
        vectorSource.addFeature(feature);
    }

    // Check if current position should be calculated
    // -- Depends on heading and time difference
    if (airplane.drawn && airplane.heading && (now - airplane.drawn) > 0) {
        var tDiff = (now - airplane.drawn)/1000;
        var position = new APViewer.simulation.Position(airplane.longitude, airplane.latitude, airplane.altitude);
        position = APViewer.simulation.calculatePosition(position, airplane.hSpeed, airplane.vSpeed, tDiff, airplane.heading);
        airplane.longitude = position.longitude;
        airplane.latitude = position.latitude;
        airplane.altitude = position.altitude;
    }

    airplane.drawn = now;

    var state = airplane == APViewer.map.selectedAirplane ? "clicked" : airplane == APViewer.map.hoveredAirplane ? "hover" : "";
    var iconStyle = getIcon(state, airplane.heading);

    if (state == "clicked") {
        updatePopoutData();
    }

    // Filter non valid longitude and latitude values
    if (airplane.latitude >= 90 || airplane.latitude <= -90) return;
    if (airplane.longitude >= 180 || airplane.longitude <= -180) return;

    feature.setGeometry(new ol.geom.Point(ol.proj.transform([airplane.longitude, airplane.latitude], 'EPSG:4326', 'EPSG:3857')));
    feature.setStyle(iconStyle);

}

/* This function will add a feature for the given airport on the icon-layer
 */
function displayAirport(airport) {
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(({
            src: APViewer.config.airports_image
        }))
    });
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([airport.lon, airport.lat], 'EPSG:4326', 'EPSG:3857')),
        name: airport.name
    });
    iconFeature.setId(airport.iata);
    iconFeature.setStyle(iconStyle);
    iconFeature.set("iconType","airport");
    vectorSource.addFeature(iconFeature);
}

/* This function will toogle the div#search between visible and hidden
 */
function toggleSearch() {
    $('#search').css('display') == 'none' ? $('#search').fadeIn() : $('#search').fadeOut();
}

/* click-handler for search button
 */
$('#searchButton').click(toggleSearch);

/* on document ready:
 * - set layer-group on map
 * - creating interval functions for:
 *   - get new airplanes
 *   - update airplanes
 *   - display airplanes
 * - getting airports from source and add them to icon-layer
 */
$(function() {

    map.setLayerGroup(layerGroups[currentMap]);

    var getNewAirplanes = function(){
        APViewer.serverConnector.callAirplanes(function(keys){
            var icao;
            for (icao in keys) {
                var key = keys[icao].split('.')[2];
                APViewer.data.addAirplane(key);
            }
        });
    };

    var updateAirplanes = function() {
        for(var i in APViewer.data.list) {
            var ap = APViewer.data.list[i];
            ap.update.call(ap);
        }
    };

    var displayAirplanes = function() {
        for(var i in APViewer.data.list) {
            var ap = APViewer.data.list[i];
            APViewer.map.displayAirplane(ap);
        }
    };

    getNewAirplanes();
    updateAirplanes();
    setInterval(getNewAirplanes, APViewer.config.timer_getNewAirplanes);
    setInterval(updateAirplanes, APViewer.config.timer_updateAirplanes);
    setInterval(displayAirplanes, APViewer.config.timer_displayAirplanes);

    APViewer.airport.readAirports(APViewer.config.airports_source);
});