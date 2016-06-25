
var panosUrl;
var panoImagePrefix;
var panoImageSuffix;
var closestPanosData;
var allPanosData;
var mapCenterLatLng;
var panorama;
var map;
var currLatLng;
var panoPolyLines;
var panoColors;
var marker;
var acceptedTreeMarkers;
var acceptedTreeInputs;
var panoImageRegion;
var treeNumber;

var GOOGLE_CAR_CAMERA_HEIGHT = 3;

function initialize() {
    var urlParams = getJsonFromUrl();
    var lat = parseFloat(urlParams.lat);
    var lng = parseFloat(urlParams.lng);
    var assignmentId = urlParams.assignmentId;
    $('#assignment_id').val(assignmentId);
    
    mapCenterLatLng = new google.maps.LatLng(lat, lng);
    currLatLng = mapCenterLatLng;
    
    $("#directions_button").click(function() {
        if ($(this).html() == "<h3>Directions (hide)</h3>") {
            $(this).html("<h3>Directions (show)</h3>");
        } else {
            $(this).html("<h3>Directions (hide)</h3>");
        }
        $("#directions_box").slideToggle();
    });
    
    acceptedTreeMarkers = [];
    acceptedTreeInputs = [];
    initializeMap();
}

function updatePanos() {
    panos.push(map.getStreetView());
}

function initializeMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenterLatLng,
        zoom: 20,
        tilt: 0,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        disableDefaultUI: false, // TODO
        draggable: true,
        scrollwheel: true
    });
    map.getStreetView().setOptions({
        map: map,
        position: currLatLng,
        disableDefaultUI: true,
        visible: true,
        zoom: 1
    });
    map.addListener('click', function(event) {
        currLatLng = event.latLng;
        updatePanos();
        addTree(event.latLng);
    });
    var polylinePath = [{lat: mapCenterLatLng.lat(), lng: mapCenterLatLng.lng()},
                        {lat: mapCenterLatLng.lat() + 0.01, lng: mapCenterLatLng.lng() + 0.01}];
    var polyLine = new google.maps.Polyline({
            path: polylinePath,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: map
    });
}

function addTree(latLng) {
    marker = new google.maps.Marker({
           position: latLng,
           map: map,
           title: 'tree',
           draggable: true,
           icon: 'tree-icon.png'
    });
    acceptedTreeMarkers.push(marker);
    var acceptedTreeMarker = marker;
    acceptedTreeMarker.addListener('click', function(event) {
        var index = acceptedTreeMarkers.indexOf(acceptedTreeMarker);
        acceptedTreeMarkers.splice(index, 1);
        acceptedTreeInputs[index].remove();
        acceptedTreeInputs.splice(index, 1);
        acceptedTreeMarker.setMap(null);
    });
    acceptedTreeMarker.addListener('drag', function(event) {
        currLatLng = event.latLng;
        var index = acceptedTreeMarkers.indexOf(acceptedTreeMarker);
        
    });
    var input = $('<input>').attr({
        type: 'hidden',
        name: 'trees[]',
        id: treeNumber,
        value: latLng.lat() + ',' + latLng.lng()
    });
    input.appendTo('#form');
    acceptedTreeInputs.push(input);
}

function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function addTreeFromStreetview(pixelX, pixelY) {
    var currentPano = map.getStreetView();
    
    var cameraHeight = GOOGLE_CAR_CAMERA_HEIGHT; 
    var cameraPitch = Math.abs(currentPano.getPov().pitch) * Math.PI / 180.0;
    var cameraHeading = currentPano.getPov().heading;
    var cameraLatLng = currentPano.getLocation().latLng;
    
    var distance = cameraHeight * Math.tan(Math.PI / 2 - cameraPitch);
    var treeLatLng = google.maps.geometry.spherical.computeOffset(cameraLatLng,
                                                                  distance,
                                                                  cameraHeading);
    addTree(treeLatLng);
}