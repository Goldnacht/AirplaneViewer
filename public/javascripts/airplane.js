/**
 * Created by frederik on 21.04.15.
 */

var airplanes = [];

function getAirplane(icao) {
    if (airplanes[icao] == null) {
        airplanes[icao] = {
            ICAO: icao,
            Longitude: null,
            Latitude: null,
            getInfo: function() {
                console.log("ICAO: " + this.ICAO + " | Lon: " + this.Longitude + " | Lat: " + this.Latitude);
            },
            update: function () {
                readLatitude(this.ICAO);
                readLongitude(this.ICAO);
                showLog(this.ICAO);
            }
        };
    }
    return airplanes[icao];
}

function showLog(icao) {
    var ap = getAirplane(icao);
    ap.getInfo();
}

function getAirplanes(callback) {
    $.get("http://flugmon-it.hs-esslingen.de/keys/icao.active.*", callback);
}

function readLongitude(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.poslon."+icao, SaveFunction);

    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        ap.Longitude = result;
    }
}

function readLatitude(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.poslat."+icao, SaveFunction);

    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        ap.Latitude = result;
    }
}