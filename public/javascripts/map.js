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
        zoom: 6
    })
});

function Airplane(icao) {
    this.icao = icao;
}

var airplanes = [];

function addAirplane(data) {
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

}
main();