/**
 * Created by Frederik on 28.05.2015.
 */

var Position = function(lon, lat, alt) {
    this.longitude = lon;
    this.longitude = lat;
    this.altitude = alt;
}

/*
 * pStart:  Startposition des Flugzeugs in Longitude, Latitude, Height
 * vHor:    Geschwindigkeit Horrizontal
 * vVert:   Geschwindigkeit Vertikal
 * t:       Zeitintervall in Sekunden
 * dir:     Flugrichtung in Radiant zu Nord
 */
function calculatePosition(pos, vHor, vVert, timeDiff, dir) {
    var t = timeDiff;
    var alpha = dir;
    var r_z0 = pos.altitude;
    var r_x0 = pos.longitude;
    var r_y0 = pos.latitude;
    var kt_ms = 0.51444;

    var v_z = vVert;
    var v_x = Math.sin(alpha) * vHor * kt_ms;
    var v_y = Math.con(alpha) * vHor * kt_ms;

    var u_x = 360/(40000000 * Math.cos(r_y0));
    var u_y = 360/40000000;

    var r_z = v_z * (t/60) + r_z0;
    var r_x = t * v_x * u_x + r_x0;
    var r_y = t * v_y * u_y + r_y0;

    var nPos = new Position(r_x, r_y, r_z);
    return nPos;
}
