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
    this.mouse_down = false;
};

Global.prototype.subscribe_mouse_events = function(){
    var self = this;
    $('.stage').mousedown(function(evt){self.mouse_down = true;})
               .mousemove(function(evt){self.mouse_x = evt.offset_x;
                                        self.mouse_y = evt.offset_y;});
    $(document.body).mouseup(function(evt){self.mouse_down = false;});
};


function Timer(){
    this.time = 0;
    this.start_time = Date.now();
    this.update_time();
}

Timer.prototype.update_time = function(){
    this.time = Math.round(Date.now() - this.start_time);
    setTimeout(this.update_time, 1000);
};

Timer.prototype.reset = function(){
    this.start_time = Date.now();
    this.time = 0;
};

Timer.prototype.value = function(){
    return this.time;
};