(function(window){
    'use strict';
// Timer utility
//window.console.log('Loaded runtime, defining utilities');
function Timer(){
    this.time = 0;
    this.start_time = Date.now();
    this.listeners = [];
    this.update_time();
}

Timer.prototype.update_time = function(){
    var self = this;
    this.time = Math.round(Date.now() - this.start_time);
    this.listeners.forEach(function(listener){
        listener();
    })
    setTimeout(function(){self.update_time()}, 1000);
};

Timer.prototype.reset = function(){
    this.start_time = Date.now();
    this.time = 0;
};

Timer.prototype.value = function(){
    return this.time;
};

Timer.prototype.registerListener = function(fn){
    this.listeners.push(fn);
}


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
        console.error('Cannot get %s from unknown type %s', name, type);
        return undefined;
    }
    if (this[type][name] === undefined){
        console.error('No %s named %s to get', type, name);
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

function getStage() {
    var stage = document.querySelector('.stage')
    if(stage) {
        return stage;
    }
    // create stub for testing
    stage = {};
    stage.clientWidth = 1200;
    stage.clientHeight = 1000;
    stage.addEventListener = function(type, listener, useCapture) {/*Do nothing*/};
    stage.setAttribute = function(attributename, attributevalue) {/*Do nothing*/};
    stage.appendChild = function(child) {/*Do nothing*/};

    return stage;
}

function Global(){
    this.timer = new Timer();
    this.keys = {};
    this.stage = getStage();
    this.mouse_x = -1;
    this.mouse_y = -1;
    this.stage_width = this.stage.clientWidth;
    this.stage_height = this.stage.clientHeight;
    this.stage_center_x = this.stage_width / 2;
    this.stage_center_y = this.stage_height / 2;
    this.mouse_down = false;
    this.subscribeMouseEvents();
    this.subscribeKeyboardEvents();
    var g = this;
    this.timer.registerListener(function(){
        if (g.stage_width !== g.stage.clientWidth || g.stage_height !== g.stage.clientHeight){
            g.stage_width = g.stage.clientWidth;
            g.stage_height = g.stage.clientHeight;
            g.stage_center_x = g.stage_width / 2;
            g.stage_center_y = g.stage_height / 2;
            local.canvas.setAttribute("width", runtime.stage_width);
            local.canvas.setAttribute("height", runtime.stage_width);
        }
    })
};

Global.prototype.subscribeMouseEvents = function(){
    var self = this;
    this.stage.addEventListener('mousedown', function(evt){
        self.mouse_down = true;
    }, false);
    this.stage.addEventListener('mousemove', function(evt){
        // console.log(evt);
        self.mouse_x = evt.clientX;
        self.mouse_y = evt.clientY;
    }, false);
    this.stage.setAttribute('style', 'overflow: hidden');
    document.body.addEventListener('mouseup', function(evt){
        self.mouse_down = false;
    }, false);
};

Global.prototype.specialKeys = {
    // taken from jQuery Hotkeys Plugin
    8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
    20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
    37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
    96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
    104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
    112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
    120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
};

Global.prototype.shiftNums = {
    // taken from jQuery Hotkeys Plugin
    "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
    "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
    ".": ">",  "/": "?",  "\\": "|"
}


Global.prototype.keyForEvent = function(evt){
    if (this.specialKeys[evt.keyCode]){
        return this.specialKeys[evt.keyCode];
    }else{
        return String.fromCharCode( evt.which ).toLowerCase();
    }
}

Global.prototype.isKeyDown = function(key){
    return this.keys[key];
}

Global.prototype.subscribeKeyboardEvents = function(){
    var self = this;
    document.body.addEventListener('keydown', function(evt){
        self.keys[self.keyForEvent(evt)] = true;
    });
    document.body.addEventListener('keyup', function(evt){
        self.keys[self.keyForEvent(evt)] = false;
    });
};


// Utility methods

var DEGREE = Math.PI / 180;


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
    var i,val, len;
    len = end - start;
    for (i = 0; i < len; i++){
        val = i * step + start;
        if (val > (end-1)) break;
        rg.push(val);
    }
    return rg;
}




function angle(shape){
    // return the angle of rotation
    var tform = shape.rotate();
    if (tform === 0) return tform;
    return parseInt(tform.split(/\s+/)[0], 10);
}


/**
 * Enhanced Javascript logging and exception handler.
 *
 * It is utterly annoying when DOM event handler exceptions fail
 * silently with Firebug. This package fixes this common problem.
 *
 * @copyright Copyright 2008 Twinapex Research
 *
 * @author Mikko Ohtamaa
 *
 * @license 3-clause BSD
 *
 * http://www.twinapex.com
 *
 * http://blog.redinnovation.com/2008/08/19/catching-silent-javascript-exceptions-with-a-function-decorator/
 *
 */

// Declare namespace
var twinapex = {}

twinapex.debug = {}

/**
 * Print exception stack trace in human readable format into the console
 *
 * @param {Exception} exc
 */
twinapex.debug.printException = function(exc) {

    function prints(msg) {
        console.log(msg);
    }

    prints(exc);

    if (!exc.stack) {
        prints('no stacktrace available');
        return;
    };
    var lines = exc.stack.toString().split('\n');
    var toprint = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('ecmaunit.js') > -1) {
            // remove useless bit of traceback
            break;
        };
        if (line.charAt(0) == '(') {
            line = 'function' + line;
        };
        var chunks = line.split('@');
        toprint.push(chunks);
    };
    toprint.reverse();

    for (var i = 0; i < toprint.length; i++) {
        prints('  ' + toprint[i][1]);
        prints('    ' + toprint[i][0]);
    };
    prints();
}


/**
 * Decorate function so that exceptions falling through are printed always.
 *
 * Returns a decorated function which will be used instead of the normal function.
 * The decorated function has preplaced try ... catch block which will not let
 * through any exceptions silently or without logging. Even though there is an
 * exception it is normally throw upwards in the stack after logging.
 *
 *  <pre>
 *
 *  // myFunction can be bind to many events and exceptions are logged always
 *  myfunction = function()
 *     // crash here
 *     var i = foobar; // missing variable foobar
 *  });
 *  </pre>
 *
 *  Then there are alternative usage examples:
 *
 *  <pre>
 *
 *  // Decorate function
 *  myfunction = twinapex.debug.manageExceptions(myfunction);
 *
 *  // Bind with exception manager
 *  $document.clicker(twinapex.debug.manageExceptions(myfunction));
 *
 *  // Run loader code with exception manager
 *  jq(document).ready(function() {
 *      console.log("Help pop up page wide init");
 *      twinapex.debug.manageExceptions(initHelpPopUpHandlers(document));
 *  });
 *  </pre>
 *
 *
 * @param func: Javascript function reference
 */
twinapex.debug.manageExceptions = function(func) {

    var original = func;

    decorated = function() {
        try {
            original.apply(this, arguments);
        } catch(exception) {
            twinapex.debug.printException(exception);
            throw exception;
        }
    }
    return decorated;
}

// Don't use windows load handler for init()
// since debug code might be called from other load handlers
// Browser specific logging output initialization
// - fake Firebug console.log for other browsers
if(typeof(console) == "undefined") {
    // Install dummy functions, so that logging does not break the code if Firebug is not present
    window.console = {};
    window.console.log = function(msg) {};
    window.console.info = function(msg) {};
    window.console.warn = function(msg) {};

    // TODO: Add IE Javascript console output

    // TODO: Add Opera console output

} else {
    // console.log provided by Firefox + Firebug
}

function initialize(local, runtime){
    local.canvas = document.createElement("canvas");
    local.canvas.setAttribute("width", runtime.stage_width);
    local.canvas.setAttribute("height", runtime.stage_height);
    runtime.stage.appendChild(local.canvas);
    local.canvas.focus()
    local.ctx = local.canvas.getContext("2d");
    local.ctx.textAlign = "center";
}

var runtime = new Global();
var local = new Local();
initialize(local, runtime);
window.Global = Global;
window.Local = Local;
window.runtime = runtime;
window.local = local;
window.Timer = Timer;
window.twinapex = twinapex;
window.rad2deg = rad2deg;
window.deg2rad = deg2rad;
window.range = range;
window.angle = angle;
console.log('runtime ready');
})(window);
