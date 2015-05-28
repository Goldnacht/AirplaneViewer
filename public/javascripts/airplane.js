/**
 * Created by frederik on 21.04.15
 */

var airplanes = [];

function getAirplane(icao) {
    if (airplanes[icao] == null) {
        airplanes[icao] = {
            icao: icao,
            longitude: null,
            latitude: null,
            altitude: null,
            heading: null,
            acid: null,
            horizontal: null,
            stat: null,
            vertical: null,
            changed: false,
            changedTime: null,
            update: function () {
                readLatitude(this.icao);
                readLongitude(this.icao);
                readHeading(this.icao);
                readHorizontal(this.icao);
                readVertical(this.icao);
                readAltitude(this.icao);
                readAcid(this.icao);
            }
        };
    }
    return airplanes[icao];
}

function logChange(icao, Key, Value, Time) {
    console.log(icao+": " + Key + " => " + Value + " ("+Time+")");
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
        var nVal = parseFloat(result);
        if (!isNaN(nVal) && nVal != ap.longitude) {
            var time = (new Date).getTime();
            ap.longitude = nVal;
            logChange(icao, "lon", nVal, time);
            ap.changed = true;
            ap.changedTime = time;
        }
    }
}

function readLatitude(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.poslat."+icao, SaveFunction);
    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        var nVal = parseFloat(result);
        if (!isNaN(nVal) && nVal != ap.latitude) {
            var time = (new Date).getTime();
            ap.latitude = nVal;
            logChange(icao, "lat", nVal, time);
            ap.changed = true;
            ap.changedTime = time;
        }
    }
}

function readHeading(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.heading."+icao, SaveFunction);
    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        var nVal = parseFloat(result);
        if (!isNaN(nVal) && nVal != ap.heading) {
            var time = (new Date).getTime();
            ap.heading = nVal;
            logChange(icao, "head", nVal, time);
            ap.changed = true;
            ap.changedTime = time;
        }
    }
}

function readHorizontal(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.horizontal."+icao, SaveFunction);
    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        var nVal = parseFloat(result);
        if (!isNaN(nVal) && nVal != ap.horizontal) {
            var time = (new Date).getTime();
            ap.horizontal = nVal;
            logChange(icao, "hor",nVal,time);
            ap.changed = true;
            ap.changedTime = time;
        }
    }
}

function readVertical(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.vertical."+icao, SaveFunction);
    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        var nVal = parseFloat(result);
        if (!isNaN(nVal) && nVal != ap.vertical) {
            var time = (new Date).getTime();
            ap.vertical = nVal;
            logChange(icao, "ver",nVal,time);
            ap.changed = true;
            ap.changedTime = time;
        }
    }
}

function readAltitude(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.altitude."+icao, SaveFunction);
    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        var nVal = parseFloat(result);
        if (!isNaN(nVal) && nVal != ap.altitude) {
            var time = (new Date).getTime();
            ap.altitude = nVal;
            logChange(icao, "alt",nVal,time);
            ap.changed = true;
            ap.changedTime = time;
        }
    }
}

function readAcid(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.acid."+icao, SaveFunction);
    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        if (result && result != ap.acid) {
            var time = (new Date).getTime();
            ap.acid = result;
            logChange(icao, "acid",result,time);
            ap.changed = true;
            ap.changedTime = time;
        }
    }
}

function readStat(icao) {
    var result = "";
    $.get("http://flugmon-it.hs-esslingen.de/get/icao.stat."+icao, SaveFunction);
    function SaveFunction(data) {
        result = data.get;
        var ap = getAirplane(icao);
        ap.stat = result;
    }
}