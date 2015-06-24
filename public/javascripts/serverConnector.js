/**
 * Created by Frederik Eschmann
 */
var APViewer = APViewer || {};

APViewer.serverConnector = {
    callAirplanes: function(callback) {
        $.get(APViewer.config.keyserver+"/keys/icao.active.*", function(data){callback(data.keys);});
    },
    callValue: function(icao, value, callback) {
        $.get(APViewer.config.keyserver+"/get/icao."+value+"."+icao, function(data){callback(data.get);});
    }
};