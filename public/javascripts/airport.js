/**
 * Created by Frederik on 16.06.2015.
 */

var APViewer = APViewer || {};

APViewer.airport = {
    Airport: function(iata, name, lon, lat) {
        this.iata = iata;
        this.name = name;
        this.lon = lon;
        this.lat = lat;
    },
    list: [],
    readAirports: function(file) {
        var t = this;
        $.getJSON(file, function(data){
            for(var i in data.airports) {
                var ap = data.airports[i];
                t.addAirport(ap);
                APViewer.mapper.displayAirport(ap);
            }
        });
    },
    addAirport: function(airport) {
        if (!this.list[airport.iata]) this.list[airport.iata] = airport;
    },
    getAirport: function(iata) {
        return this.list[iata];
    }
};