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

var selectedFeature = null;

// display popup on click
map.on('click', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });
    if (feature) {
        if (selectedFeature != null) {
            if (selectedFeature.getId() != feature.getId()) {
                setAirplaneFeatureStyle(selectedFeature, "");
            }
        }
        selectedFeature = feature;
        console.log("Feature clicked: " + feature.getId());
        var airplane = getAirplane(feature.getId());
        $('#icao').text(airplane.icao);
        $('#longitude').text(airplane.longitude.toFixed(8));
        $('#latitude').text(airplane.latitude.toFixed(8));

        setAirplaneFeatureStyle(selectedFeature, "clicked");

        $('#popout').fadeIn();
    } else {
        setAirplaneFeatureStyle(selectedFeature, "");
        selectedFeature = null;
        $('#popout').fadeOut();
    }
});

var hoveredFeature = null;

// change mouse cursor when over marker
map.on('pointermove', function(e) {
    if (e.dragging) {
        $(element).popover('destroy');
        return;
    }
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';

    var feature = map.forEachFeatureAtPixel(pixel,
        function(feature, layer) {
            return feature;
        });

    if (hoveredFeature) {
        if (hoveredFeature != feature) {
            if (hoveredFeature != selectedFeature) {
                setAirplaneFeatureStyle(hoveredFeature, "");
                hoveredFeature = null;
            }
        }
    }

    if (feature) {
        if (feature != selectedFeature) {
            setAirplaneFeatureStyle(feature, "hover");
            hoveredFeature = feature;
        }
    }

});

function setAirplaneFeatureStyle(feature, state) {
    var airplane = getAirplane(feature.getId());
    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;
    var iconStyle = getIcon("2", state, rotation);
    feature.setStyle(iconStyle);
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

function displayAirplane(airplane) {
    var lon = airplane.longitude;
    var lat = airplane.latitude;
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature != null) { vectorSource.removeFeature(feature); }

    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;

    var iconStyle = getIcon("2", "", rotation);

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