(function(global){
'use strict';
var accelerometer = {
    direction: ""
};

var turnListeners = {};

if(window.DeviceOrientationEvent) {
    // always follow direction changes
    window.addEventListener('deviceorientation', processData);
} else {
    console.warn("Detection of acceleration is not supported");
}

accelerometer.whenTurned = function whenTurned(direction, cb){
    if (Array.isArray(turnListeners[direction])){
        turnListeners[direction].push(cb);
    }else{
        turnListeners[direction] = [cb];
    }
}

function processData(event) {
    var left_right = event.gamma;
    var front_back = event.beta;

    var limit = 10;
    accelerometer.direction = "";

    if(left_right > limit && front_back > limit) {
        accelerometer.direction = "upright";
    } else if(left_right > limit && front_back < -limit) {
        accelerometer.direction = "downright";
    } else if(left_right < -limit && front_back < -limit) {
        accelerometer.direction = "downleft";
    } else if(left_right < -limit && front_back > limit) {
        accelerometer.direction = "upleft";
    } else if(front_back > limit) {
        accelerometer.direction = "up";
    } else if(left_right > limit) {
        accelerometer.direction = "right";
    } else if(front_back < -limit) {
        accelerometer.direction = "down";
    } else if(left_right < -limit) {
        accelerometer.direction = "left";
    }

    // Call any callbacks set in whenTurned()
    if (turnListeners[accelerometer.direction]){
        turnListeners[accelerometer.direction].forEach(function(cb){
            cb();
        })
    }
};

global.accelerometer = accelerometer;

})(global);