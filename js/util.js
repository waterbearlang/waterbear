// Utility functions

(function(){
    'use strict';

    var cos = Math.cos, sin = Math.sin, atan2 = Math.atan2, sqrt = Math.sqrt, floor = Math.floor, PI = Math.PI;
    var DEGREE = PI / 180;

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
        throw new Exception('no match found for ' + signature.split('_').join(' '));
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


    // Get Rect!
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        if (width < 0) {
            throw new Error('Rect width must be non-negative.');
        }
        this.width = width;
        if (height < 0) {
            throw new Error('Rect height must be non-negative.');
        }
        this.height = height;
    }

    Rect.prototype.getPosition = function () {
        return new Vector(this.x, this.y);
    };

    Rect.prototype.getSize = function () {
        return new Vector(this.width, this.height);
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

    // exports
    window.util = {
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
        isNumber: isNumber
    };


})();
