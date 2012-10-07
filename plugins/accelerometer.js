/*global yepnope, $, menu */
yepnope({
    load: ['plugins/javascript.css'],
    complete: setup
});

function setup() {};

var accelerometer = {};
accelerometer.direction = "";
accelerometer._tasks = [];

// set up choices
window.choice_lists['directions'] = ["upright", "downright", "downleft", "up", "down", "right", "left"];

var menus = {
    accelerometer: menu('Motion', [{
        label: 'tilt direction',
        script: 'accelerometer.direction',
        type: 'string'
    }, {
        label: 'when device turned [choice:directions]',
        trigger: true,
        slot: false,
        containers: 1,
        script: '(function() { var id = setInterval( function(){ if(accelerometer.direction.indexOf( {{1}} ) != -1 ){ [[1]] } }, 1000); accelerometer._tasks.push( id ); })();'
    }])
};

if(window.DeviceOrientationEvent) {
    // always follow direction changes
    window.addEventListener('deviceorientation', processData);
} else {
    alert("Detection of acceleration is not supported");
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