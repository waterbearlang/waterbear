(function(global){

var accelerometer = {};
accelerometer.direction = "";
accelerometer._tasks = [];

if(window.DeviceOrientationEvent) {
    // always follow direction changes
    window.addEventListener('deviceorientation', processData);
} else {
    console.warn("Detection of acceleration is not supported");
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
};

$('body').bind("waterbear_close", function() {
    $.each( accelerometer._tasks, function(i, j){
        clearInterval( j );
    } );
});

global.accelerometer = accelerometer;

})(global);