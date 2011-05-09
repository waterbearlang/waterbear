// Encapsulate workspace-specific state to allow one block to build on the next
// Also provide a runtime environment for the block script

var DEGREE = Math.PI / 180;

function Local(){
    this.shape = null;
    this.shape_references = {};
};

function Global(){
    this.timer = new Timer();
    this.subscribe_mouse_events();
    var stage = $('.stage');
    this.paper = Raphael(stage.get(0), stage.outerWidth(), stage.outerHeight());
    this.mouse_x = -1;
    this.mouse_y = -1;
    this.stage_width = stage.outerWidth();
    this.stage_height = stage.outerHeight();
    this.stage_center_x = this.stage_width / 2;
    this.stage_center_y = this.stage_height / 2;
    this.mouse_down = false;
};

Global.prototype.subscribe_mouse_events = function(){
    var self = this;
    $('.stage').mousedown(function(evt){self.mouse_down = true;})
               .mousemove(function(evt){self.mouse_x = evt.offset_x;
                                        self.mouse_y = evt.offset_y;});
    $(document.body).mouseup(function(evt){self.mouse_down = false;});
};

// Timer utility

function Timer(){
    this.time = 0;
    this.start_time = Date.now();
    this.update_time();
}

Timer.prototype.update_time = function(){
    var self = this;
    this.time = Math.round(Date.now() - this.start_time);
    setTimeout(function(){self.update_time()}, 1000);
};

Timer.prototype.reset = function(){
    this.start_time = Date.now();
    this.time = 0;
};

Timer.prototype.value = function(){
    return this.time;
};

// Utility methods
function rad2deg(rad){
    return rad / DEGREE;
}

function deg2rad(deg){
    return deg * DEGREE;
}

function range(start, end, step){
    var rg = [];
    if (end === undefined){
        end = start;
        start = 0;
    }
    if (step === undefined){
        step = 1;
    }
    var i,val;
    len = end - start;
    for (i = 0; i < len; i++){
        val = i * step + start;
        if (val > (end-1)) break;
        rg.push(val);
    }
    return rg;
}


function randint(start, stop){
    // return an integer between start and stop, inclusive
    if (stop === undefined){
        stop = start;
        start = 0;
    }
    var factor = stop - start + 1;
    return Math.floor(Math.random() * factor) + start;
}

function angle(shape){
    // return the angle of rotation
    var tform = shape.rotate();
    if (tform === 0) return tform;
    return parseInt(tform.split(/\s+/)[0], 10);
}
