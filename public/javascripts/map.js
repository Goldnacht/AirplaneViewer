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

function displayAirplane(airplane) {
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([airplane.Longitude, airplane.Latitude], 'EPSG:4326', 'EPSG:3857')),
        name: airplane.ICAO
    });
    vectorSource.addFeature(iconFeature);
}

function main() {
    var timeout = 2000;

    var action = function(){
        vectorSource.clear();
        getAirplanes(function(data){
            var ap;
            for (ap in data.keys) {
                var key = data.keys[ap].split('.')[2];
                var ap = getAirplane(key);
                ap.update();
                if (ap.Longitude != null && ap.Latitude != null) {
                    displayAirplane(ap);
                }
            }
        });
    };

    setInterval(action, timeout);
}
main();