// Encapsulate workspace-specific state to allow one block to build on the next
// Also provide a runtime environment for the block script

function Local(){
    this.shape = null;
    this.shape_references = {};
    this.array_references = {};
    this.object_references = {};
    this.function_references = {};
    this.regex_references = {};
    this.string_references = {};
    this.last_var = null;
    this.variables = {};
};

Local.prototype.set = function(type, name, value){
    if (this[type] === undefined){
        this[type] = {};
    }
    if (this[type][name] !== undefined){
        console.warn('Overwriting %s named %s', type, name);
    }
    this[type][name] = value;
    this.last_var = value;
    return this;
};

Local.prototype.get = function(type, name){
    if (this[type] === undefined){
        console.error('Cannot remove %s from unknown type %s', name, type);
        return undefined;
    }
    if (this[type][name] === undefined){
        console.error('No %s named %s to remove', type, name);
        return undefined;
    }
    return this[type][name];
};

Local.prototype.delete = function(type, name){
    if (this[type] === undefined){
        console.error('Cannot remove %s from unknown type %s', name, type);
        return undefined;
    }
    if (this[type][name] === undefined){
        console.error('No %s named %s to remove', type, name);
        return undefined;
    }
    var value = this[type][name];
    delete this[type][name];
    return value;
};

function Global(){
    this.timer = new Timer();
    this.subscribeMouseEvents();
    this.subscribeKeyboardEvents();
    this.keys = {};
    var stage = $('.stage');
    // move this to raphael plugin
//    this.paper = Raphael(stage.get(0), stage.outerWidth(), stage.outerHeight());
    this.mouse_x = -1;
    this.mouse_y = -1;
    this.stage_width = stage.outerWidth();
    this.stage_height = stage.outerHeight();
    this.stage_center_x = this.stage_width / 2;
    this.stage_center_y = this.stage_height / 2;
    this.mouse_down = false;
};

Global.prototype.subscribeMouseEvents = function(){
    var self = this;
    $('.stage').mousedown(function(evt){self.mouse_down = true;})
               .mousemove(function(evt){self.mouse_x = evt.offset_x;
                                        self.mouse_y = evt.offset_y;});
    $(document.body).mouseup(function(evt){self.mouse_down = false;});
};

Global.prototype.keyForEvent = function(evt){
    if ($.hotkeys.specialKeys[evt.keyCode]){
        return $.hotkeys.specialKeys[evt.keyCode];
    }else{
        return String.fromCharCode( evt.which ).toLowerCase();
    }
}

Global.prototype.isKeyDown = function(key){
    return this.keys[key];
}

Global.prototype.subscribeKeyboardEvents = function(){
    var self = this;
    $(document.body).keydown(function(evt){
        self.keys[self.keyForEvent(evt)] = true;
    }).keyup(function(evt){
        self.keys[self.keyForEvent(evt)] = false;
    })
};

