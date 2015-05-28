function searchAirplane(formName){
    var searchString = $(formName).find(".searchInput").val();
    var airplane=searchIcao(searchString);
    if(airplane){
        setFocusOnAirplane(airplane);
    }
}

function searchIcao(icao){
    for(ap in airplanes){
        var airplane=airplanes[ap];
        if (airplane.icao == icao) return airplane;
    }
    return null;
}

function setFocusOnAirplane (airplane){

}