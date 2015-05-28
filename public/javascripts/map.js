var vectorSource = new ol.source.Vector({});
var vectorLayer = new ol.layer.Vector({ source: vectorSource });

//new ol.layer.Tile({source: new ol.source.OSM()})

var view = new ol.View({
    center: ol.proj.transform([9.205604, 48.687524], 'EPSG:4326', 'EPSG:3857'),
    zoom: 8
});

var map = new ol.Map({
    layers: [new ol.layer.Tile({source: new ol.source.OSM()}), vectorLayer],
    target: document.getElementById('map'),
    view: view
});

$('.ol-attribution').prepend('<div class="creators">&copy; Frederik Eschmann, Hatice Yildirim, Christine Vosseler, Waldemar Stenski</div>');

$('#searchButton').prependTo('.ol-control.ol-zoom');
$('#optionsButton').prependTo('.ol-control.ol-attribution');

var selectedAirplane = null;
var hoveredAirplane = null;

function closePopout() {
    setAirplaneFeatureStyle(selectedAirplane, "");
    selectedAirplane = null;
    $('#popout').fadeOut();
}

// display popup on click
map.on('click', function (event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
    if (feature) {
        var airplane = getAirplane(feature.getId());
        console.log("Feature clicked: " + feature.getId());
        selectAirplane(airplane);
    } else {
        closePopout();
    }
});

function selectAirplane(airplane) {
    if (selectedAirplane != null) {
        if (selectedAirplane.icao != feature.getId()) { setAirplaneFeatureStyle(selectedAirplane, ""); }
    }
    selectedAirplane = airplane;
    updatePopoutData();
    setAirplaneFeatureStyle(selectedAirplane, "clicked");
    $('#popout').fadeIn();
}

// change mouse cursor when over marker
map.on('pointermove', function(event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
    map.getTarget().style.cursor = feature != null ? 'pointer' : '';

    if (hoveredAirplane) {
        if (!feature || hoveredAirplane.icao != feature.getId()) {
            if (hoveredAirplane != selectedAirplane) {
                setAirplaneFeatureStyle(hoveredAirplane, "");
            }
            hoveredAirplane = null;
        }
    }
    if (feature) {
        if (!selectedAirplane || feature.getId() != selectedAirplane.icao) {
            var airplane = getAirplane(feature.getId());
            setAirplaneFeatureStyle(airplane, "hover");
            hoveredAirplane = airplane;
            $("#tooltipInfo").text(airplane.acid);
            $("#tooltip").show();
        }
    } else {
        $("#tooltip").hide();
    }
});

$(document).bind('mousemove',function(e){
    var y = e.pageY + 5;
    var x = e.pageX + 5;
    $("#tooltip").css({ "top": y + "px", "left": x + "px" });
});

function setAirplaneFeatureStyle(airplane, state) {
    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;
    var iconStyle = getIcon("2", state, rotation);
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature) feature.setStyle(iconStyle);
}

function getIcon(size, state, rotation) {
    var src = '/images/Airplane' + size;
    if (state == "clicked") {
        src += "_click.png";
    } else if (state == "hover") {
        src += "_hover.png";
    } else {
        src += ".png";
    }

    return new ol.style.Style({
        image: new ol.style.Icon(({
            anchor: [16, 16],
            size: [32,32],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 0.85,
            src: src,
            rotation: rotation
        }))
    });
}

function updatePopoutData() {
    $('#icao').text(selectedAirplane.icao);
    $('#acid').text(selectedAirplane.acid);
    $('#longitude').text(selectedAirplane.longitude.toFixed(8));
    $('#latitude').text(selectedAirplane.latitude.toFixed(8));
    $('#horizontal').text(selectedAirplane.horizontal);
    $('#vertical').text(selectedAirplane.vertical);
    $('#heading').text(selectedAirplane.heading);
    $('#altitude').text(selectedAirplane.altitude);
}

function displayAirplane(airplane) {
    var lon = airplane.longitude;
    var lat = airplane.latitude;
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature != null) { vectorSource.removeFeature(feature); }

    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;

    var state = airplane == selectedAirplane ? "clicked" : "";
    var iconStyle = getIcon("2", state, rotation);

    if (state == "clicked") {
        updatePopoutData();
    }

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857')),
        name: airplane.icao
    });
    iconFeature.setId(airplane.icao);
    iconFeature.setStyle(iconStyle);
    vectorSource.addFeature(iconFeature);
}

function removeAirplane(airplane) {
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature != null) { vectorSource.removeFeature(feature); }
}

function toggleSearch() {
    $('#search').css('display') == 'none' ? $('#search').fadeIn() : $('#search').fadeOut();
}

function main() {

    var getNewAirplanes = function(){
        //console.log("getNewAirplanes: triggered");
        getAirplanes(function(data){
            var icao;
            for (icao in data.keys) {
                var key = data.keys[icao].split('.')[2];
                var ap = getAirplane(key);
            }
        });
    };

    var triggerUpdates = function () {
        //console.log("triggerUpdates: triggered");
        var i;
        for(i in airplanes) {
            airplanes[i].update();
        }
    };

    var updateDisplayedAirplanes = function() {
        //console.log("updateDisplayedAirplanes: triggered");
        var i;
        for(i in airplanes) {
            var ap = airplanes[i];
            if (ap.changed == true) {
                if (isNaN(ap.longitude) || isNaN(ap.latitude)) continue;
                displayAirplane(ap);
                ap.changed = false;
            }
            if (ap.changedTime && ap.changedTime < ((new Date).getTime() - 300000)) {
                removeAirplane(ap);
                closePopout();
            }
        }
    };

    getNewAirplanes();
    setInterval(getNewAirplanes, 10000);
    setInterval(triggerUpdates, 2000);
    setInterval(updateDisplayedAirplanes, 1000);
}
main();