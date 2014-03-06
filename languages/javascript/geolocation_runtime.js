(function(global){
'use strict';
var location = {};

if (navigator.geolocation){
  location.watchPosition = function watchPosition(cb){
    navigator.geolocation.watchPosition(
      function(data) {
        location.currentLocation = data.coords; // sets latitude and longitude
        cb();
      }, 
      function(){
        console.warn('Sorry, no position available');
      }
    );
  };
}else{
  location.watchPosition = function watchPosition(cb){
    console.warn('Sorry, geolocation services not available');
  };
}

if (navigator.geolocation){
  location.whenWithinXOf = function whenWithinXOf(distance, loc, cb){
    navigator.geolocation.watchPosition(
      function(data) {
        location.currentLocation = data.coords; // sets latitude and longitude
        if (location.distance(loc, data.coords) < distance){
          cb();
        }
      }, 
      function(){
        console.warn('Sorry, no position available');
      }
    );
  };
}else{
  location.whenWithinXOf = function whenWithinXOf(distance, loc, cb){
    console.warn('Sorry, geolocation services not available');
  };
}


// taken from http://www.movable-type.co.uk/scripts/latlong.html
location.distance = function distance( coord1, coord2 ) {

    var lat1 = coord1.latitude;
    var lon1 = coord1.longitude;

    var lat2 = coord2.latitude;
    var lon2 = coord2.longitude;

    var R = 6371; // km
    return Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                  Math.cos(lat1)*Math.cos(lat2) *
                  Math.cos(lon2-lon1)) * R;
};

location.currentLocation = {
  latitude: 0,
  longitude: 0
};

global.location = location;

})(global);