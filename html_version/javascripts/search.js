/**
 * Created by Frederik Eschmann
 */
$("#searchAirplane").submit(searchAirplane);

function searchAirplane(e){
    e.preventDefault();
    var searchString = $("#searchAirplane").find(".searchInput").val();
    searchString = searchString.toUpperCase().trim();
    var airplane = searchIcao(searchString);
    if (!airplane) airplane = searchAcid(searchString);
    if(airplane){
        setFocusOnAirplane(airplane);
        selectAirplane(airplane);
        toggleSearch();
        $(formName).find(".searchInput").val("");
    } else {
        alert("Could not find an airplane for this data");
    }
}

function searchIcao(icao){
    for(ap in APViewer.data.list){
        var airplane = APViewer.data.list[ap];
        if (airplane.icao == icao) return airplane;
    }
    return null;
}

function searchAcid(acid) {
    for(ap in APViewer.data.list){
        var airplane = APViewer.data.list[ap];
        if (airplane.acid == acid) return airplane;
    }
    return null;
}

function setFocusOnAirplane (airplane){
    var target = ol.proj.transform([airplane.longitude, airplane.latitude], 'EPSG:4326', 'EPSG:3857');
    /*var pan = ol.animation.pan({
        duration: 2000,
        source: (view.getCenter())
    });
    map.beforeRender(pan);*/
    view.setCenter(target);
    view.setZoom(12);
}