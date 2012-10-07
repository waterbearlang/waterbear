/*global yepnope */
yepnope(
    {
        load: ['plugins/javascript.css'],
        complete: setup
    }
);


function setup() {};

var loc = {};

var menus = {
    geolocation : menu('Location', [
    {
    label: 'my location',
    script: 'loc',
    type: 'location'
    } , {
    label: 'update location',
    script: 'navigator.geolocation.getCurrentPosition( function(data){ loc.latitude = data.coords.latitude; loc.longitude = data.coords.longitude; }, $.noop);'
    } , {
     label: 'location at [double:latitude] and [double:longitude]',
     type: 'location',
     script: '{latitude: {{1}}, longitude: {{2}} }' 
    } , {
      label: 'distance between [location:first] and [location:second]',
      script: 'loc.distance( {{1}}, {{2}} )',
      type: 'int'
    } 
/*
// for future use
 , {
    label: 'nearby [location]',
    script: '',
    containers: 1,
    trigger: true
    } 
*/
] ) }; 


if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(data) {
        loc.latitude = data.coords.latitude;
        loc.longitude = data.coords.longitude;
    }
    , $.noop);
}

// taken from http://www.movable-type.co.uk/scripts/latlong.html
loc.distance = function( coord1, coord2 ) {

    var lat1 = coord1.latitude;
    var lon1 = coord1.longitude;

    var lat2 = coord2.latitude;
    var lon2 = coord2.longitude;

    var R = 6371; // km
    return Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                  Math.cos(lat1)*Math.cos(lat2) *
                  Math.cos(lon2-lon1)) * R;
}

