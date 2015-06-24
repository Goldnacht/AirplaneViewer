/**
 * Created by Frederik Eschmann
 */
var APViewer = APViewer || {};

APViewer.simulation = {
    Position: function(lon, lat, alt) {
        this.longitude = lon;
        this.latitude = lat;
        this.altitude = alt;
    },

    /*
     * position:		Startposition des Flugzeugs in Longitude, Latitude, Height
     * v_horizontal:	Geschwindigkeit Horrizontal
     * v_vertical:		Geschwindigkeit Vertikal
     * time_difference:	Zeitintervall in Sekunden
     * direction:		Flugrichtung in Radiant zu Nord
     */
    calculatePosition: function (position, v_horizontal, v_vertical, time_difference, direction) {

        // Zur Berechnung vereinfachte Variablen
        var t = time_difference;
        var alpha = direction;
        var r_z0 = position.altitude;
        var r_x0 = position.longitude;
        var r_y0 = position.latitude;

        // Umrechnungsfaktor von Knoten in m/s
        var kt_ms = 0.51444;

        // Berechnung der Vektorialen Geschwindigkeit
        var v_z = v_vertical;
        var v_x = Math.sin(alpha) * v_horizontal * kt_ms;
        var v_y = Math.cos(alpha) * v_horizontal * kt_ms;

        // Umrechnungsfaktor Meter in Breiten-/Längengrad
        var u_x = 360/(40000000 * Math.cos(2 * Math.PI / 360 *r_y0));
        var u_y = 360/40000000;

        // Berechnung der neuen Position über Wegstrecke * Umrechnungsfaktor + Alte Position
        var r_z = v_z * (t/60) + r_z0;
        var r_x = t * v_x * u_x + r_x0;
        var r_y = t * v_y * u_y + r_y0;

        var positionNew = new APViewer.simulation.Position(r_x, r_y, r_z);
        return positionNew;
    }
};