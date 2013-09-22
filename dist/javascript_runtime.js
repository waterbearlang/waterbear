
/*begin languages/javascript/javascript_runtime.js*/
// Timer utility
//console.log('Loaded runtime, defining utilities');
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
    this.keys = {};
    this.stage = document.getElementsByClassName('stage')[0];
    this.mouse_x = -1;
    this.mouse_y = -1;
    this.stage_width = this.stage.clientWidth;
    this.stage_height = this.stage.clientHeight;
    this.stage_center_x = this.stage_width / 2;
    this.stage_center_y = this.stage_height / 2;
    this.mouse_down = false;
    this.subscribeMouseEvents();
    this.subscribeKeyboardEvents();
};

Global.prototype.subscribeMouseEvents = function(){
    var self = this;
    this.stage.addEventListener('mousedown', function(evt){
        self.mouse_down = true;
    });
    this.stage.addEventListener('mousemove', function(evt){
        self.mouse_x = evt.offsetX;
        self.mouse_y = evt.offsetY;
    });
    this.stage.setAttribute('style', 'overflow: hidden');
    document.body.addEventListener('mouseup', function(evt){
        self.mouse_down = false;
    });
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
twinapex = {}

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
    var console = {};
    console.log = function(msg) {};
    console.info = function(msg) {};
    console.warn = function(msg) {};

    // TODO: Add IE Javascript console output

    // TODO: Add Opera console output

} else {
    // console.log provided by Firefox + Firebug
}
console.log('runtime ready');

/*end languages/javascript/javascript_runtime.js*/

/*begin languages/javascript/asset_runtime.js*/
(function(){

var assets = {};

function getAssetType(url){
	var extension = url.split('.').slice(-1)[0].toLowerCase();
	switch(extension){
		case 'gif':
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'bmp':
			return new Image();
		case 'mov':
		case 'mpeg':
		case 'mpg':
			return new Video();
		case 'wav':
		case 'mp3':
			return new Audio();
		default:
			console.error('No format recognized for %s type', ext);
			return null;
	}
}
var loaded = 0;
var toload = 0;

function preloadAssets(assetUrls, callback){
	if (!assetUrls.length){
		return callback();
	}
	load = function() {
		loaded++;
	    if (loaded >= toload){
	    	callback();
	    }
	}
    assetUrls.forEach(function(url, idx){
    	toload++;
    	assets[url] = getAssetType(url);
	    assets[url].onload = load;
	    assets[url].onerror = load;
	    assets[url].onabort = load;
    	assets[url].src = url;
 	});
}


var images = Global.prototype.images = {};

function preloadImage(seqNum, url){
	images[seqNum] = assets[url];
}

Global.prototype.preloadAssets = preloadAssets; // called by runtime automatically
Global.prototype.preloadImage = preloadImage; // called by script block to set up convenient name

})();
/*end languages/javascript/asset_runtime.js*/

/*begin languages/javascript/control_runtime.js*/

/*end languages/javascript/control_runtime.js*/

/*begin languages/javascript/sprite_runtime.js*/
// Sprite Routines
function RectSprite(size,pos,color){
    this.x = pos.x;
    this.y = pos.y;
    this.w = size.w;
    this.h = size.h;
    this.collisionRect = this;
    this.color = color;
    this.origW = size.w;
    this.origH = size.h;
    this.direction = 0;
    this.speed = 0;
};

window.RectSprite = RectSprite;

RectSprite.prototype.draw = function(ctx){
    // console.log(this.direction, this);
    ctx.save();
    //rotation
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.direction * Math.PI / 180);
    ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.restore();
};

RectSprite.prototype.collides = function(sprite){
    var self = this.collisionRect;
    var that = sprite.collisionRect;
    if ((self.x + self.w) < that.x) return false;
    if ((self.y + self.h) < that.y) return false;
    if (self.x > (that.x + that.w)) return false;
    if (self.y > (that.y + that.h)) return false;
    return true;
};

RectSprite.prototype.setSpeed = function(speed){
    this.speed = speed;
    this.calculateDifference();
};

RectSprite.prototype.setDirection = function(degrees){
    this.direction = degrees % 360;
    this.calculateDifference();
};

RectSprite.prototype.rotate = function(degrees){
    this.setDirection(this.direction + degrees);
}

RectSprite.prototype.setColor = function(color){
    this.color = color;
}

RectSprite.prototype.calculateDifference = function(){
    this.dx=Math.cos(this.direction*Math.PI/180)*this.speed;
    this.dy=Math.sin(this.direction*Math.PI/180)*this.speed;
};

RectSprite.prototype.toString = function(){
    return '<RectSprite ' + this.x + ' ' + this.y + ' ' + this.w + ' ' +  this.h + ' ' + this.color + '>';
};

function Vector2(dx,dy){
    this.dx = dx || 0;
    this.dy = dy || 0;
}

Vector2.fromAngle = function(radians, magnitude){
    if (magnitude <= 0) magnitude = 1.0;
    return new Vector(Math.cos(radians) * magnitude, Math.sin(radians) * magnitude);
}

Vector2.prototype.magnitude = function(){
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
}

Vector2.prototype.add = function(v){
    return new Vector2(this.dx + v.dx, this.dy + v.dy);
}

Vector2.prototype.subtract = function(v){
    return new Vector2(this.dx - v.dx, this.dy - v.dy);
}

Vector2.prototype.reflect = function(rx, ry){
    return new Vector2(rx ? -this.dx: this.dx, ry ? -this.dy : this.dy);
}

Vector2.prototype.angle = function(){
    // angle of vector in radians
    return Math.atan2(this.dy, this.dx);
}

Vector2.prototype.rotate = function(radians){
    var mag = this.magnitude();
    var theta = this.angle();
    return Vector.fromAngle(theta + radians, mag);
}

/*end languages/javascript/sprite_runtime.js*/

/*begin languages/javascript/voice_runtime.js*/
// Music Routines
function Voice(){
    console.log("Message");
    this.on = false;
    this.osc;
    this.amp;
    context = new webkitAudioContext();
    var vco = context.createOscillator();
    vco.type = vco.SINE;
    vco.frequency.value = 400;
    var vca = context.createGain();
    vca.gain.value = 0.3;
    vco.connect(vca);
    vca.connect(context.destination);
    this.osc = vco;
    this.amp = vca;
};

Voice.prototype.toggle = function(boolean){
    this.on = boolean;
    if (boolean) 
        this.osc.start(0);
    else
        this.osc.stop(0);
    return true;
};

/*end languages/javascript/voice_runtime.js*/

/*begin languages/javascript/array_runtime.js*/

/*end languages/javascript/array_runtime.js*/

/*begin languages/javascript/boolean_runtime.js*/

/*end languages/javascript/boolean_runtime.js*/

/*begin languages/javascript/canvas_runtime.js*/

/*end languages/javascript/canvas_runtime.js*/

/*begin languages/javascript/color_runtime.js*/

/*end languages/javascript/color_runtime.js*/

/*begin languages/javascript/image_runtime.js*/

/*end languages/javascript/image_runtime.js*/

/*begin languages/javascript/math_runtime.js*/

/*end languages/javascript/math_runtime.js*/

/*begin languages/javascript/object_runtime.js*/

/*end languages/javascript/object_runtime.js*/

/*begin languages/javascript/string_runtime.js*/

/*end languages/javascript/string_runtime.js*/

/*begin languages/javascript/path_runtime.js*/

/*end languages/javascript/path_runtime.js*/

/*begin languages/javascript/point_runtime.js*/

/*end languages/javascript/point_runtime.js*/

/*begin languages/javascript/rect_runtime.js*/

/*end languages/javascript/rect_runtime.js*/

/*begin languages/javascript/sensing_runtime.js*/

/*end languages/javascript/sensing_runtime.js*/

/*begin languages/javascript/shape_runtime.js*/

/*end languages/javascript/shape_runtime.js*/

/*begin languages/javascript/size_runtime.js*/

/*end languages/javascript/size_runtime.js*/

/*begin languages/javascript/text_runtime.js*/

/*end languages/javascript/text_runtime.js*/

/*begin languages/javascript/matrix_runtime.js*/

/*end languages/javascript/matrix_runtime.js*/

/*begin languages/javascript/demo_runtime.js*/

/*end languages/javascript/demo_runtime.js*/
