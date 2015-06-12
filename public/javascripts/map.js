var APViewer = APViewer || {};

APViewer.mapper = {
    hoveredAirplane: null,
    selectedAirplane: null,
    displayAirplane: displayAirplane,
    logAirplane: logAirplane
};

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

function closePopout() {
    setAirplaneFeatureStyle(APViewer.mapper.selectedAirplane, "");
    APViewer.mapper.selectedAirplane = null;
    $('#popout').fadeOut();
}

// display popup on click
map.on('click', function (event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
    if (feature) {
        var airplane = APViewer.data.getAirplane(feature.getId());
        console.log("Feature clicked: " + feature.getId());
        selectAirplane(airplane);
    } else {
        closePopout();
    }
});

function selectAirplane(airplane) {
    if (APViewer.mapper.selectedAirplane != null) {
        if (APViewer.mapper.selectedAirplane.icao != airplane.icao) { setAirplaneFeatureStyle(APViewer.mapper.selectedAirplane, ""); }
    }
    APViewer.mapper.selectedAirplane = airplane;
    updatePopoutData();
    setAirplaneFeatureStyle(APViewer.mapper.selectedAirplane, "clicked");
    $('#popout').fadeIn();
}

// change mouse cursor when over marker
map.on('pointermove', function(event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
    map.getTarget().style.cursor = feature != null ? 'pointer' : '';

    if (APViewer.mapper.hoveredAirplane) {
        if (!feature || APViewer.mapper.hoveredAirplane.icao != feature.getId()) {
            if (APViewer.mapper.hoveredAirplane != APViewer.mapper.selectedAirplane) {
                setAirplaneFeatureStyle(APViewer.mapper.hoveredAirplane, "");
            }
            APViewer.mapper.hoveredAirplane = null;
        }
    }
    if (feature) {
        if (!APViewer.mapper.selectedAirplane || feature.getId() != APViewer.mapper.selectedAirplane.icao) {
            var airplane = APViewer.data.getAirplane(feature.getId());
            setAirplaneFeatureStyle(airplane, "hover");
            APViewer.mapper.hoveredAirplane = airplane;
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
    var apIcon = !airplane.heading ? "NH" : "2";
    var iconStyle = getIcon(apIcon, state, rotation);
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
    $('#icao').text(APViewer.mapper.selectedAirplane.icao);
    $('#acid').text(APViewer.mapper.selectedAirplane.acid);
    $('#longitude').text(APViewer.mapper.selectedAirplane.longitude.toFixed(8));
    $('#latitude').text(APViewer.mapper.selectedAirplane.latitude.toFixed(8));
    $('#horizontal').text(APViewer.mapper.selectedAirplane.hSpeed);
    $('#vertical').text(APViewer.mapper.selectedAirplane.vSpeed);
    $('#heading').text(APViewer.mapper.selectedAirplane.heading);
    $('#altitude').text(APViewer.mapper.selectedAirplane.altitude.toFixed(1));
}

function logAirplane () {
    console.log(this.icao + ": " + this.longitude + " " + this.latitude);
}

function displayAirplane(airplane) {
    // Checking if airplane has position
    if (!airplane.longitude || !airplane.latitude) return;

    // Get Feature if exists for airplane and remove it from map
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature != null) { vectorSource.removeFeature(feature); }

    // Check for timeout of airplane
    var now = new Date().getTime();
    if (now - airplane.changed > 360000) return;

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

    //console.log("pos: "+ position.longitude + " " + position.latitude);

    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;

    var state = airplane == APViewer.mapper.selectedAirplane ? "clicked" : "";
    var apIcon = !airplane.heading ? "NH" : "2";
    var iconStyle = getIcon(apIcon, state, rotation);

    if (state == "clicked") {
        updatePopoutData();
    }

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([airplane.longitude, airplane.latitude], 'EPSG:4326', 'EPSG:3857')),
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
            APViewer.mapper.displayAirplane(ap);
        }
    };

    getNewAirplanes();
    updateAirplanes();
    setInterval(getNewAirplanes, 10000);
    setInterval(updateAirplanes, 5000);
    setInterval(displayAirplanes, 500);
}
main();