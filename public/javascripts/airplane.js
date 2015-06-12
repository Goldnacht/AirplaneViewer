/**
 * Created by frederik on 21.04.15
 */
var APViewer = APViewer || {
        Airplane: function (icao) {
            /* Class Attributes */
            this.icao = icao;

            this.longitude = null;
            this.latitude = null;
            this.altitude = null;

            this.realLongitude = null;
            this.realLatitude = null;
            this.realAltitude = null;

            this.setLongitude = setLongitude;
            this.setLatitude = setLatitude;
            this.setAltitude = setAltitude;
            this.setHeading = setHeading;

            this.heading = null;
            this.acid = null;
            this.hSpeed = null;
            this.vSpeed = null;
            this.changed = null;

            this.drawn = null;

            this.update = updateFunction;
        }
    };

APViewer.data = {
    list: [],

    getAirplane: function(icao) {
        if (this.list[icao])
            return this.list[icao];
        return null;
    },

    addAirplane: function (icao) {
        if (!this.list[icao])
            this.list[icao] = new APViewer.Airplane(icao);
        return this.list[icao];
    }

};

function returnFloat(value) {
    var val = parseFloat(value);
    if (!isNaN(val)) return val;
    return null;
}

function setLongitude(longitute) {
    if (this.realLongitude != longitute && longitute) {
        this.changed = new Date().getTime();
        this.longitude = longitute;
        this.realLongitude = longitute;
    }
}

function setLatitude(latitude) {
    if (this.realLatitude != latitude && latitude) {
        this.changed = new Date().getTime();
        this.realLatitude = latitude;
        this.latitude = latitude;
    }
}

function setAltitude(altitude) {
    if (this.realAltitude != altitude && altitude) {
        this.changed = new Date().getTime();
        this.realAltitude = altitude;
        this.altitude = altitude;
    }
}

function setHeading(heading) {
    var heading = (2 * Math.PI) / 360 * heading;
    if (this.heading != heading && heading) {
        this.heading = heading;
    }
}

function updateFunction() {
    var ap = this;

    APViewer.serverConnector.callValue(this.icao, "poslon", function(data){ap.setLongitude(returnFloat(data));});
    APViewer.serverConnector.callValue(this.icao, "poslat", function(data){ap.setLatitude(returnFloat(data));});
    APViewer.serverConnector.callValue(this.icao, "altitude", function(data){ap.setAltitude(returnFloat(data));});
    APViewer.serverConnector.callValue(this.icao, "heading", function(data){ap.setHeading(returnFloat(data))});
    APViewer.serverConnector.callValue(this.icao, "horizontal", function(data){ap.hSpeed = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "vertical", function(data){ap.vSpeed = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "acid", function(data){ap.acid = data;});

}