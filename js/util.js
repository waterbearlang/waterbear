// Utility functions

(function(){
    'use strict';

    var cos = Math.cos, sin = Math.sin, atan2 = Math.atan2, sqrt = Math.sqrt, floor = Math.floor, PI = Math.PI;
    var DEGREE = PI / 180;

    // Polyfill for Function.prototype.bind (PhantomJS doesn't support it for
    // some bizarre reason).
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (obj) {
            var fn = this;
            return function () {
                return fn.apply(obj, arguments);
            };
        };
    }

    // properly delete from a list
    function deleteItem(list, item){
        var idx = list.indexOf(item);
        if (idx > -1){
            list.splice(idx, 1);
        }
        return item;
    }

    // check if a string is a number (works on numbers too)
    function isNumber(check){
        check = check + "";
        return check.trim().length > 0 ? !isNaN(check) : false;
    }

    // extend an object. to (shallow) copy an object, pass {} for target
    function extend(target, source){
        if (source === null || typeof source !== 'object') return source;
        for (var attr in source) {
            if (source.hasOwnProperty(attr)){
                target[attr] = source[attr];
            }
        }
        return target;
    }

    // Remove namespaces and/or polyfill requestAnimationFrame
    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.mozRequestAnimationFrame ||
                                   window.msRequestAnimationFrame ||
                                   window.webkitRequestAnimationFrame ||
                                   function(fn){ setTimeout(fn, 20); };


    // add defaultValue if key does't exist in an object yet and return it
    // otherwise return current valud of key
    function setDefault(obj, key, defaultValue){
        if (obj[key] === undefined){
            obj[key] = defaultValue;
        }
        return obj[key];
    }

    // An improved replacement for typeof
    // Based on http://youmightnotneedjquery.com/#type
    function type(obj){
        var t = Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
        if (t === 'object' && obj.constructor && obj.constructor.name){
            return obj.constructor.name.toLowerCase();
        }
        return t;
    }

    // Super-simple implementation of multimethods (aka generics, aka multiple dispatch)
    // Inspired by http://krisjordan.com/multimethod-js
    // and https://leanpub.com/javascript-spessore/read#leanpub-auto-multiple-dispatch
    function Method(){}
    // Use this to add a function to use when the types match (fluent)
    Method.prototype.when = function when(types, fn){
        this[types.join('_')] = fn;
        return this;
    };
    // Utility replacement for default to try the arguments in reverse in case that's defined
    // Only use this if the argument order is not important
    Method.prototype.tryInverse = function(){
        this._default = function(){
            var signature = [].slice.call(arguments).reverse().map(type).join('_');
            if (this[signature]){
                return this[signature].call(arguments).map(type).join('_');
            }
            throw new Exception('no match found for ' + signature.split('_').join(' '));
        }
        return this;
    };
    // Use this to add a single function to call when no types match (fluent)
    Method.prototype.default = function(fn){
        this._default = fn;
        return this;
    };
    // This is the actual method that gets called, but use .fn() to wrap it nicely
    Method.prototype.send = function send(){
        var signature = [].slice.call(arguments).map(type).join('_');
        if (this[signature]){
            return this[signature].apply(this, arguments);
        }
        if (this._default){
            return this._default.apply(this, arguments);
        }
        throw new Error('no match found for ' + signature.split('_').join(' ') + ': ' +
            [].slice.call(arguments).map(function(arg){
                return 'type(' + arg + ') = ' + type(arg);
            }).join(',')
        );
    };
    // Wrap .send() so we don't have to call mymultimethod.send()
    Method.prototype.fn = function fn(){
        return this.send.bind(this);
    };

    // Tiny vector library
    // defer math to the math multimethods

    // convert degrees to radians
    function deg2rad(deg){
        return deg * DEGREE;
    }
    function rad2deg(rad){
        return rad / DEGREE;
    }

    // replace JavaScript % operator because of sign conversion
    function mod(a,b){
        return a - floor(a/b) * b
    }

    // angle between two vectors in radians
    function angle(v1, v2){
        var diff = v1.rad - v2.rad;
        return atan2(sin(diff), cos(diff));
    }

    // Create a vector from an angle in degrees and a magnitude (length)
    function Vector(x,y){
        this.x = x;
        this.y = y;
    }
    Vector.fromPolar = function(degrees, mag){
        var radians = deg2rad(degrees);
        return new Vector(cos(radians) * mag, sin(radians) * mag);
    }

    Vector.prototype.magnitude = function(){
        return sqrt(this.x * this.x + this.y * this.y);
    }

    Vector.prototype.radians = function(){
        return atan2(this.y, this.x);
    }
    Vector.prototype.degrees = function(){
        return rad2deg(this.radians());
    }

    // Make magnitude equal to 1
    Vector.prototype.normalize = function normalize(){
        if (this.magnitude() !== 0){
            return multiply(vec, 1 / vec.magnitude());
        }
        return vec;
    }

    Vector.prototype.rotateTo = function rotateTo(degrees){
        return Vector.fromPolar(degrees, this.magnitude());
    }

    Vector.prototype.rotate = function rotate(degrees){
        var radians = this.radians + deg2rad(degrees);
        var mag = this.magnitude();
        return new Vector(cos(radians) * mag, sin(radians) * mag);
    }

    Vector.prototype.rotateRads = function rotate(rads){
        var newAngle = this.radians + rads;
        var mag = this.magnitude();
        return new Vector(cos(newAngle) * mag, sin(newAngle) * mag);
    }

    Vector.prototype.toString = function strv(){
        return '<' + this.x + ',' + this.y + '>';
    }

    // Point

    function Point(x,y){
        this.x = x;
        this.y = y;
    }

    Point.prototype.toString = function(){
        return '[' + this.x + ',' + this.y + ']';
    };

    // Size

    function Size(width, widthUnit, height, heightUnit){
        if (height < 0) {
            throw new Error('Size height must be non-negative.');
        }
        this.height = height;
        this.heightUnit = heightUnit;
        if (width < 0) {
            throw new Error('Size width must be non-negative.');
        }
        this.width = width;
        this.widthUnit = widthUnit;
    }

    Size.prototype.toString = function(){
        return '[' + this.width + ',' + this.height + ']';
    };


    // Get Rect!
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.size = new Size(width, 'px', height, 'px');
    }

    Rect.prototype.getPosition = function () {
        return new Vector(this.x, this.y);
    };

    Rect.prototype.getSize = function () {
        return new Size(this.size.width, 'px', this.size.height, 'px');
    };

    /* Creates from two vectors or two points. They're basically the same. */
    Rect.fromVectors = function (position, size) {
        return new Rect(position.x, position.y, size.x, size.y);
    };


    // Utilities for math

    var add = new Method()
        .when(['array', 'number'], function(a,b){ return a.map(function(x){ return add(x,b); }); })
        .when(['array', 'vector'], function(a,b){ return a.map(function(x){ return add(x,b); }); })
        .when(['array', 'array'], function(a,b){ return a.concat(b); })
        .when(['vector', 'number'], function(a,b){ return new Vector(a.x + b, a.y + b); })
        .when(['vector', 'vector'], function(a,b){ return new Vector(a.x + b.x, a.y + b.y); })
        .when(['number', 'number'], function(a,b){ return a + b; })
        .tryInverse()
        .fn();

    var subtract = new Method()
        .when(['array', 'number'], function(a,b){ return a.map(function(x){ return subtract(x,b); }); })
        .when(['array', 'vector'], function(a,b){ return a.map(function(x){ return subtract(x,b); }); })
        .when(['array', 'array'], function(a,b){ return a.filter(function(x){ return a.indexOf(x) < 0; }); })
        .when(['vector', 'number'], function(a,b){ return new Vector(a.x - b, a.y - b); })
        .when(['vector', 'vector'], function(a,b){ return new Vector(a.x - b.x, a.y - b.y); })
        .when(['number', 'number'], function(a,b){ return a - b; })
        .tryInverse()
        .fn();

    var multiply = new Method()
        .when(['array', 'number'], function(a,b){ return a.map(function(x){ return multiply(x,b); }); })
        .when(['array', 'vector'], function(a,b){ return a.map(function(x){ return multiply(x,b); }); })
        .when(['vector', 'number'], function(a,b){ return new Vector(a.x * b, a.y * b); })
        .when(['number', 'vector'], function(a,b){ return new Vector(b.x * a, b.y * a); })
        // dot product, cross product only makes sense in 3 (or more?) dimensions
        .when(['vector', 'vector'], function(a,b){ return a.x * b.x + a.y * b.y; })
        .when(['number', 'number'], function(a,b){ return a * b; })
        .fn(); // no inverse!

    var divide = new Method()
        .when(['array', 'number'], function(a,b){ return a.map(function(x){ return divide(x,b); }); })
        .when(['vector', 'number'], function(a,b){ return new Vector(a.x / b, a.y / b); })
        .when(['number', 'number'], function(a,b){ return a / b; })
        .fn();

    // Random methods

    function randInt(start, stop){
        // return an integer between start and stop, inclusive
        if (stop === undefined){
            stop = start;
            start = 0;
        }
        var factor = stop - start + 1;
        return Math.floor(Math.random() * factor) + start;
    }

    // This is a port of Ken Perlin's Java code. The
    // original Java code is at http://cs.nyu.edu/%7Eperlin/noise/.
    // Note that in this version, a number from 0 to 1 is returned.
    // Original JS port from http://asserttrue.blogspot.ca/2011/12/perlin-noise-in-javascript_31.html,
    // but heavily modified by Dethe for 1 and 2 dimensional noise

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp( t, a, b) { return a + t * (b - a); }
    function grad(hash, x, y, z) {
      var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
      var u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
             v = h<4 ? y : h==12||h==14 ? x : z;
      return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
    }
    function scale(n) { return (1 + n)/2; }

    // permutations
    var p = [ 151,160,137,91,90,15,
       131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
       190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
       88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
       77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
       102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
       135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
       5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
       223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
       129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
       251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
       49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
       138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
       151,160,137,91,90,15,
       131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
       190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
       88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
       77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
       102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
       135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
       5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
       223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
       129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
       251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
       49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
       138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];

    function noise(x, y, z) {

          var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
              Y = Math.floor(y) & 255,                  // CONTAINS POINT.
              Z = Math.floor(z) & 255;
          x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
          y -= Math.floor(y);                                // OF POINT IN CUBE.
          z -= Math.floor(z);
          var    u = fade(x),                                // COMPUTE FADE CURVES
                 v = fade(y),                                // FOR EACH OF X,Y,Z.
                 w = fade(z);
          var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
              B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,

          return scale(lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                         grad(p[BA  ], x-1, y  , z   )), // BLENDED
                                 lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                         grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                         lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                         grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                                 lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                         grad(p[BB+1], x-1, y-1, z-1 )))));
    }

    function choice(list){
      return list[Math.floor(Math.random() * list.length)];
    }



    /*
     * Geolocation mini-module.
     *
     * Call startTrackingLocation(). The currentLocation property will be
     * updated.
     *
     * Events:
     *
     *  - locationchanged: bound on window. Register to this get location
     *                     updates immediately without polling
     *                     currentLocation.
     */
    var geolocationModule  = (function () {
        var hasLocation = false,
            currentLocation = null,
            watchID = null,
            geolocationModule;

        geolocationModule = {
            /**
             * Starts fetching the location, periodically, and sets the
             * currentLocation property of this module. Use
             * geolocation.isTracking to check whether geolocation is ready.
             */
            startTrackingLocation: function () {
                if (watchID !== null)
                    return;

                /* Handle if geolocation is not supported. */
                if (!navigator.geolocation) {
                    // TODO: I dunno lol. An error or warning of some sort?
                    app.warn('This app tracks your location, but your browser ' +
                             'does not support geolocation.');
                    // There are scenarios where geolocation can be optionally
                    // used in a program.
                    return;
                }

                watchID = navigator.geolocation.watchPosition(
                    onLocationChange, onLocationError, {
                });

                /* TODO: need to call clearWatch() with the handle when there
                 * are no more geolocation blocks in the script. */
            }
        };

        /* Define a read-only getter for the current location. */
        Object.defineProperties(geolocationModule, {
            currentLocation: {
                get: function () {
                    return currentLocation;
                }
            },
            isTracking: {
                get: function () {
                    return hasLocation;
                }
            }
        });

        function onLocationChange(location) {
            hasLocation = true;
            currentLocation = location;
            Event.trigger(window, 'locationchanged', location);
        }

        function onLocationError(positionError) {
            /* TODO: probably something better than this... */
            console.warn('Unable to fetch location.');
            currentLocation = null;
            // Say the location is changed, so that things waiting on location
            // changed aren't waiting forever (e.g., asset loading).
            Event.trigger(window, 'locationchanged', location);
        }

        return geolocationModule;
    })();

    /******************************
    *
    * Sprite mini-library
    *
    *
    *******************************/

    function Sprite(drawable){
        // drawable can be a shape function, an image, or text
        // wrap image with a function, make sure all are centred on 0,0
        this.drawable = drawable || defaultDrawable;
        this.position = new Vector(0,0);
        this.facing = new Vector(-PI/2,0.1);
        this.velocity = new Vector(0,0.1);
    }

    Sprite.prototype.accelerate = function(speed){
        this.velocity = add(this.velocity, multiply(this.facing, speed));
        // console.log('position: %s, velocity: %s, facing: %s', strv(this.position), strv(this.velocity), strv(this.facing));
    }

    Sprite.prototype.applyForce = function(vec){
        this.velocity = add(this.velocity, vec);
    }

    Sprite.prototype.rotate = function(r){
        this.facing = this.facing.rotate(r);
        console.log('position: %s, velocity: %s, facing: %s', strv(this.position), strv(this.velocity), strv(this.facing));
    }

    Sprite.prototype.move = function(){
        this.position = add(this.position, this.velocity);
    }

    Sprite.prototype.draw = function(ctx){
        ctx.rotate(this.facing.radians()); // drawable should be centered on 0,0
        ctx.translate(this.position.x, this.position.y);
        this.drawable.draw(ctx);
        ctx.setTransform(1,0,0,1,0,0); // back to identity matrix
    }

    function defaultDrawable(ctx){
        // ctx.save();
        var width = PI - PI/6;
        var length = 20;
        var frontX = cos(this.facing.rad) * length + this.position.x;
        var frontY = sin(this.facing.rad) * length + this.position.y;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(frontX, frontY);
        ctx.lineTo(cos(this.facing.rad - width) * length + this.position.x,
                   sin(this.facing.rad - width) * length + this.position.y);
        ctx.moveTo(frontX, frontY);
        ctx.lineTo(cos(this.facing.rad + width) * length + this.position.x,
                   sin(this.facing.rad + width) * length + this.position.y);
        ctx.stroke();
        // ctx.restore();

    }


    // exports
    window.util = {
        Size: Size,
        extend: extend,
        deleteItem: deleteItem,
        setDefault: setDefault,
        type: type,
        Method: Method,
        Vector: Vector,
        Rect: Rect,
        Point: Point,
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide,
        deg2rad: deg2rad,
        randInt: randInt,
        noise: noise,
        choice: choice,
        isNumber: isNumber,
        geolocation: geolocationModule
    };


})();
