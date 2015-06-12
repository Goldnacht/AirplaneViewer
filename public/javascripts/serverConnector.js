/**
 * Created by Frederik on 28.05.2015.
 */

var server = "http://flugmon-it.hs-esslingen.de";

var APViewer = APViewer || {};

APViewer.serverConnector = {
    callAirplanes: function(callback) {
        $.get(server+"/keys/icao.active.*", function(data){callback(data.keys);});
    },
    callValue: function(icao, value, callback) {
        $.get(server+"/get/icao."+value+"."+icao, function(data){callback(data.get);});
    }
};
