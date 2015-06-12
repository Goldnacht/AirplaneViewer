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
            this.heading = null;
            this.acid = null;
            this.hSpeed = null;
            this.vSpeed = null;
            this.changed = null;
            this.changedTime = null;

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
    var val = parseFloat(value.get);
    if (!isNaN(val)) return val;
    return null;
}

function updateFunction() {
    //console.log("Update data for: " + this.icao);
    //updateLongitude.call(this);

    var ap = this;

    APViewer.serverConnector.callValue(this.icao, "poslon", function(data){ap.longitude = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "poslat", function(data){ap.latitude = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "heading", function(data){ap.heading = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "horizontal", function(data){ap.hSpeed = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "vertical", function(data){ap.vSpeed = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "altitude", function(data){ap.altitude = returnFloat(data);});
    APViewer.serverConnector.callValue(this.icao, "acid", function(data){ap.acid = data.get;});

    //APViewer.mapper.logAirplane.call(this);
    APViewer.mapper.displayAirplane(this);
}