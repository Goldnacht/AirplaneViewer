var vectorSource = new ol.source.Vector({});

var vectorLayer = new ol.layer.Vector({
    source: vectorSource
});

var map = new ol.Map({
    layers: [new ol.layer.Tile({source: new ol.source.OSM()}), vectorLayer],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([9.205604, 48.687524], 'EPSG:4326', 'EPSG:3857'),
        zoom: 8
    })
});

// display popup on click
map.on('click', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });
    if (feature) {
        var airplane = getAirplane(feature.id);
        $('#icao').innerText = airplane.icao;
        $('#longitude').innerText = airplane.longitude;
        $('#latitude').innerText = airplane.latitude;
        $('#popout').fadeIn();
    } else {
        $('#popout').fadeOut();
    }
});

function displayAirplane(airplane) {
    var lon = airplane.longitude;
    var lat = airplane.latitude;
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature != null) { vectorSource.removeFeature(feature); }

    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(({
            anchor: [16, 16],
            size: [32,32],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 0.85,
            src: '/images/AirplaneBig.png',
            rotation: rotation
        }))
    });

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
            if (ap.changedTime < ((new Date).getTime() - 300000)) {
                removeAirplane(ap);
            }
        }
    };

    getNewAirplanes();
    setInterval(getNewAirplanes, 10000);
    setInterval(triggerUpdates, 2000);
    setInterval(updateDisplayedAirplanes, 1000);
}
main();