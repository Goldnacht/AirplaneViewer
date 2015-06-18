var APViewer = APViewer || {};

APViewer.mapper = {
    hoveredAirplane: null,
    selectedAirplane: null,
    hoveredAirport: null,
    selectedAirport: null,
    displayAirplane: displayAirplane,
    logAirplane: logAirplane,
    displayAirport: displayAirport
};

var vectorSource = new ol.source.Vector({});
var vectorLayer = new ol.layer.Vector({ source: vectorSource });

var layerGroups = [
    new ol.layer.Group({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ]
    }),
    new ol.layer.Group({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'sat'})
            }),
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'hyb'})
            }),
            vectorLayer
        ]
    })
];

var layerChooserImage = ["layer_sat.png","layer_map.png"];

var view = new ol.View({
    center: ol.proj.transform([9.205604, 48.687524], 'EPSG:4326', 'EPSG:3857'),
    zoom: 8,
    maxZoom: 11
});
//new ol.source.OSM()
var map = new ol.Map({
    target: document.getElementById('map'),
    view: view,
    interactions : ol.interaction.defaults({doubleClickZoom :true})
});

var currentMap = 0;

$('#mapLayerChooser').click(function(event){
    console.log("click");
    currentMap = currentMap == 0 ? 1 : 0;
    map.setLayerGroup(layerGroups[currentMap]);
    $("#mapLayerChooserImage").attr("src","images/"+layerChooserImage[currentMap]);
});

$('.ol-attribution').prepend('<div class="creators">&copy; Frederik Eschmann, Hatice Yildirim, Christine Vosseler, Waldemar Stenski</div>');

$('#searchButton').prependTo('.ol-control.ol-zoom');
//$('#optionsButton').prependTo('.ol-control.ol-attribution');

function closePopout() {
    setAirplaneFeatureStyle(APViewer.mapper.selectedAirplane, "");
    APViewer.mapper.selectedAirplane = null;
    $('#popout').fadeOut();
}

// display popup on click
map.on('click', function (event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
    if (feature && feature.get("iconType") == "airplane") {
        var airplane = APViewer.data.getAirplane(feature.getId());
        //console.log("Feature clicked: " + feature.getId());
        selectAirplane(airplane);
    } else {
        closePopout();
    }
});

function selectAirplane(airplane) {
    if (APViewer.mapper.selectedAirplane != null) {
        if (APViewer.mapper.selectedAirplane.icao != airplane.icao) { setAirplaneFeatureStyle(APViewer.mapper.selectedAirplane, ""); }
    }
    APViewer.mapper.selectedAirplane = airplane;
    updatePopoutData();
    setAirplaneFeatureStyle(APViewer.mapper.selectedAirplane, "clicked");
    $('#popout').fadeIn();
}

// change mouse cursor when over marker
map.on('pointermove', function(event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) { return feature; });
    map.getTarget().style.cursor = feature != null ? 'pointer' : '';

    function resetHoveredAirplane() {
        if (APViewer.mapper.hoveredAirplane) {
            if (APViewer.mapper.hoveredAirplane != APViewer.mapper.selectedAirplane) {
                setAirplaneFeatureStyle(APViewer.mapper.hoveredAirplane, "");
            }
            APViewer.mapper.hoveredAirplane = null;
        }
    }
    function resetHoveredAirport() {
        if (APViewer.mapper.hoveredAirport) {
            if (APViewer.mapper.hoveredAirport != APViewer.mapper.selectedAirport) {
                setAirportFeatureStyle(APViewer.mapper.hoveredAirport, "");
            }
            APViewer.mapper.hoveredAirport = null;
        }
    }

    function reset(type) {
        if (type != "airport") resetHoveredAirport();
        if (type != "airplane") resetHoveredAirplane();
    }

    if (feature) {
        var type = feature.get("iconType");
        reset(type);
        if (type == "airplane") {
            var airplane = APViewer.data.getAirplane(feature.getId());
            if (airplane != APViewer.mapper.hoveredAirplane) resetHoveredAirplane();
            if (!APViewer.mapper.selectedAirplane || feature.getId() != APViewer.mapper.selectedAirplane.icao) {
                setAirplaneFeatureStyle(airplane, "hover");
            }
            APViewer.mapper.hoveredAirplane = airplane;
            $("#tooltipInfo").text(airplane.acid ? airplane.acid : airplane.icao);
            $("#tooltip").show();

        } else if (type == "airport") {
            var airport = APViewer.airport.getAirport(feature.getId());
            if (airport != APViewer.mapper.hoveredAirport) resetHoveredAirport();

            setAirportFeatureStyle(airport, "hover");

            APViewer.mapper.hoveredAirport = airport;
            $("#tooltipInfo").text(airport.iata + " | " + airport.name);
            $("#tooltip").show();
        }
    } else {
        reset();
        $("#tooltip").hide();
    }
});

$(document).bind('mousemove',function(e){
    var y = e.pageY + 5;
    var x = e.pageX + 5;
    $("#tooltip").css({ "top": y + "px", "left": x + "px" });
});

function setAirplaneFeatureStyle(airplane, state) {
    if (!airplane) return;
    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;
    var apIcon = !airplane.heading ? "NHp" : "";
    var iconStyle = getIcon(apIcon, state, rotation);
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature) feature.setStyle(iconStyle);
}

function setAirportFeatureStyle(airport, state) {
    if (!airport) return;
    var feature = vectorSource.getFeatureById(airport.iata);
    if (feature) {
        var stateImg = state ? "_" + state : "";
        var image = "images/Airport"+ stateImg +".png";
        feature.setStyle(new ol.style.Style({image: new ol.style.Icon({src: image})}));
    }
}

function getIcon(size, state, rotation) {
    var src = '/images/Airplane' + size;
    if (state == "clicked") {
        src += "_click.png";
    } else if (state == "hover") {
        src += "_hover.png";
    } else {
        src += ".png";
    }

    return new ol.style.Style({
        image: new ol.style.Icon(({
            src: src,
            scale: 0.04 * view.getZoom(),
            rotation: rotation
        }))
    });
}

function updatePopoutData() {
    $('#icao').text(APViewer.mapper.selectedAirplane.icao);
    $('#acid').text(APViewer.mapper.selectedAirplane.acid);
    $('#longitude').text(APViewer.mapper.selectedAirplane.longitude.toFixed(7));
    $('#latitude').text(APViewer.mapper.selectedAirplane.latitude.toFixed(7));
    $('#horizontal').text(APViewer.mapper.selectedAirplane.hSpeed);
    $('#vertical').text(APViewer.mapper.selectedAirplane.vSpeed);
    $('#heading').text(APViewer.mapper.selectedAirplane.headingDeg ? APViewer.mapper.selectedAirplane.headingDeg : "?");
    $('#altitude').text(APViewer.mapper.selectedAirplane.altitude.toFixed(1));
}

function logAirplane () {
    console.log(this.icao + ": " + this.longitude + " " + this.latitude);
}

function displayAirplane(airplane) {
    // Try to get feature of airplane
    var feature = vectorSource.getFeatureById(airplane.icao);

    // Exit when airplane has no position
    if (!airplane.longitude || !airplane.latitude) return;

    // Check for timeout of airplane, if timeout then remove from map and eventually reset selection
    var now = new Date().getTime();
    if (now - airplane.changed > 240000){
        if (feature) vectorSource.removeFeature(feature);
        if (airplane == APViewer.mapper.selectedAirplane) {
            APViewer.mapper.selectedAirplane = null;
            closePopout();
        }
        return;
    }

    // if feature doesnt exists create it for airplane and add it to source
    if (!feature) {
        feature = new ol.Feature({name: airplane.icao});
        feature.setId(airplane.icao);
        feature.set("iconType","airplane");
        vectorSource.addFeature(feature);
    }



    // Check if current position should be calculated
    // -- Depends on heading and time difference
    if (airplane.drawn && airplane.heading && (now - airplane.drawn) > 0) {
        var tDiff = (now - airplane.drawn)/1000;
        var position = new APViewer.simulation.Position(airplane.longitude, airplane.latitude, airplane.altitude);
        position = APViewer.simulation.calculatePosition(position, airplane.hSpeed, airplane.vSpeed, tDiff, airplane.heading);
        airplane.longitude = position.longitude;
        airplane.latitude = position.latitude;
        airplane.altitude = position.altitude;
    }

    airplane.drawn = now;

    //console.log("pos: "+ position.longitude + " " + position.latitude);

    var rotation = 0;
    if (airplane.heading != null) rotation = airplane.heading;

    var state = airplane == APViewer.mapper.selectedAirplane ? "clicked" : airplane == APViewer.mapper.hoveredAirplane ? "hover" : "";
    var apIcon = !airplane.heading ? "NHp" : "";
    var iconStyle = getIcon(apIcon, state, rotation);

    if (state == "clicked") {
        updatePopoutData();
    }

    //APViewer.mapper.logAirplane.call(airplane);

    // Filter non valid longitude and latitude values
    if (airplane.latitude >= 90 || airplane.latitude <= -90) return;
    if (airplane.longitude >= 180 || airplane.longitude <= -180) return;

    feature.setGeometry(new ol.geom.Point(ol.proj.transform([airplane.longitude, airplane.latitude], 'EPSG:4326', 'EPSG:3857')));
    feature.setStyle(iconStyle);

}

function displayAirport(airport) {
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(({
            src: "images/Airport.png"
        }))
    });
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([airport.lon, airport.lat], 'EPSG:4326', 'EPSG:3857')),
        name: airport.name
    });
    iconFeature.setId(airport.iata);
    iconFeature.setStyle(iconStyle);
    iconFeature.set("iconType","airport");
    vectorSource.addFeature(iconFeature);
}

function removeAirplane(airplane) {
    var feature = vectorSource.getFeatureById(airplane.icao);
    if (feature != null) { vectorSource.removeFeature(feature); }
}

function toggleSearch() {
    $('#search').css('display') == 'none' ? $('#search').fadeIn() : $('#search').fadeOut();
}

function main() {

    map.setLayerGroup(layerGroups[currentMap]);

    var getNewAirplanes = function(){
        APViewer.serverConnector.callAirplanes(function(keys){
            var icao;
            for (icao in keys) {
                var key = keys[icao].split('.')[2];
                APViewer.data.addAirplane(key);
            }
        });
    };

    var updateAirplanes = function() {
        for(var i in APViewer.data.list) {
            var ap = APViewer.data.list[i];
            ap.update.call(ap);
        }
    };

    var displayAirplanes = function() {
        for(var i in APViewer.data.list) {
            var ap = APViewer.data.list[i];
            APViewer.mapper.displayAirplane(ap);
        }
    };

    getNewAirplanes();
    updateAirplanes();
    setInterval(getNewAirplanes, 10000);
    setInterval(updateAirplanes, 5000);
    setInterval(displayAirplanes, 1000);

    APViewer.airport.readAirports("airports.json");
}
main();