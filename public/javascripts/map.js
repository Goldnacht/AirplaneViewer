var vectorSource = new ol.source.Vector({});
var iconStyle = new ol.style.Style({
    image: new ol.style.Icon(({
        anchor: [0.5, 46],
        size: [32,32],
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        opacity: 0.85,
        src: '/images/AirplaneBig.png'
    }))
});
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: iconStyle
});
var map = new ol.Map({
    layers: [new ol.layer.Tile({source: new ol.source.OSM()}), vectorLayer],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([9.205604, 48.687524], 'EPSG:4326', 'EPSG:3857'),
        zoom: 7
    })
});

var airplanes = [];

function updateAirplane(data) {
    displayAirplane(data);
    /*var updated = false;
    var ap = null;
    for (ap in airplanes) {
        if (ap.icao == data.icao) {
            ap.latitude = data.latitude;
            ap.longitude = data.longitude;

            updated = true;
        }
    }
    if (!updated) {
        airplanes.push({
            icao: data.icao,
            latitude: data.latitude,
            longitude: data.longitude
        });
    }*/
}

//{\"icao\": \"3C70A9\", \"timestamp\": \"1428977046.2168989\", \"id\": \"BCS6378\", \"latitude\": 1.1145172119140625, \"longitude\": 0.10944431110963983, \"altitude\": 37025, \"heading\": , \"horspeed\": 496, \"verspeed\": 0}"]}

function displayAirplane(data) {
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([data.latitude, data.longitude], 'EPSG:4326', 'EPSG:3857')),
        name: data.icao,
        polulation: 4000,
        rainfall: 500
    });
    vectorSource.addFeature(iconFeature);
}

function subscribe() {
    $.get("http://flugmon-it.hs-esslingen.de/subscribe/ads.aircraft", function (data, status) {
        alert(status);
        if (data.subscribe[0] == "message") {
            addAirplane(data.subscribe[2]);
        }
        /*var ap;
         for (ap in data) {
         addAirplane(data.airplanes[ap]);
         }*/
    });
}

function main() {



    /*$.get("/flightdata.json",function(data, state) {
        var ap;
        for(ap in data.airplanes) {
            updateAirplane(data.airplanes[ap]);
        }
    },"json");*/

    var timeout = 200;
    /*var action = function() {
        //alert("begin of update sequence");
        vectorSource.forEachFeature(function(feature){
                var coordinate = feature.getGeometry().getCoordinates();
                //move coordinates some distance
                ol.coordinate.add(coordinate, 10, 10);
                //use setGeometry to move it
                feature.setGeometry(new ol.coordinate);

            }
        );
    };*/
    var counter = 0;
    var action = function() {
        vectorSource.clear();
        $.get("/flightdata.json",function(data, state) {
            var ap;
            for(ap in data.airplanes) {
                var apdata = data.airplanes[ap];
                updateAirplane({
                    icao: apdata.icao,
                    latitude: apdata.latitude - counter*0.0012,
                    longitude: apdata.longitude + counter*0.001
                })
            }
            counter++;
        },"json");
    };
    setInterval(action, timeout);

    /*var airplane;
    for(airplane in airplanes) {
        displayAirplane(airplane);
    }*/
}
main();