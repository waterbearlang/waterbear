

// Utility functions

(function(){
    'use strict';

    var cos = Math.cos, sin = Math.sin, atan2 = Math.atan2, sqrt = Math.sqrt, floor = Math.floor, PI = Math.PI;
    var DEGREE = PI / 180;
    var _lastPoint = new Vector(0,0);
    var drawingPath = false;

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

    function isDrawingPath(){
        return drawingPath;
    }

    function lastPoint(){
        return _lastPoint;
    }

    function setLastPoint(point){
        _lastPoint = point;
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

   window.cancelAnimationFrame = window.cancelAnimationFrame ||
                                 window.mozCancelAnimationFrame ||
                                 window.msCancelAnimationFrame ||
                                 window.webkitCancelAnimationFrame ||
                                 function(timer){ clearTimeout(timer); };

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
        var diff = v1.radians() - v2.radians();
        return atan2(sin(diff), cos(diff));
    }

    function dist(x1, y1, x2, y2){
        // absolute distance between two points
        var dx = x1 - x2;
        var dy = y1 - y2;
        sqrt(dx * dx + dy * dy);
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
    Vector.fromPoint = function(pt){
        return new Vector(pt.x, pt.y);
    }

    Vector.prototype.getX = function(){
        return this.x;
    }

    Vector.prototype.getY = function(){
        return this.y;
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
        var mag = this.magnitude();
        if (mag === 0 || mag === 1){
            return this;
        }
        return multiply(this, 1 / mag);
    }

    Vector.prototype.rotateTo = function rotateTo(degrees){
        return Vector.fromPolar(degrees, this.magnitude());
    }

    Vector.prototype.rotate = function rotate(degrees){
        var radians = this.radians() + deg2rad(degrees);
        var mag = this.magnitude();
        return new Vector(cos(radians) * mag, sin(radians) * mag);
    }

    Vector.prototype.rotateRads = function rotate(rads){
        var newAngle = this.radians() + rads;
        var mag = this.magnitude();
        return new Vector(cos(newAngle) * mag, sin(newAngle) * mag);
    }

    Vector.prototype.toString = function strv(){
        return '<' + this.x + ',' + this.y + '>';
    }

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
        this.width = width;
        this.height = height;
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

    //Paths
    function Path(funcToCall, inputPoints, startPoint){
        this.funcToCall = funcToCall;
        this.inputPoints = inputPoints;
        this.startPoint = startPoint;
    }

    Path.prototype.draw = function(ctx){
        if (!drawingPath) {
            ctx.beginPath();
            ctx.moveTo(this.startPoint.x, this.startPoint.y);
        }

        if(this.inputPoints !== undefined){
            this.funcToCall.apply(ctx, this.inputPoints);
        }
        else{
            this.funcToCall.apply(ctx, new Array());
        }
        ctx.fill();
        ctx.stroke();
    }


    //Shape
    function Shape(pathArrayOrFunction, pointsArray){
        if (type(pathArrayOrFunction) === 'function'){
            this._draw = pathArrayOrFunction;
            if (pointsArray != undefined)
                this.pointsArray = pointsArray;
        }
        else if (type(pathArrayOrFunction) === 'array'){
            this.pathArray = pathArrayOrFunction;
        }
        else if (pathArrayOrFunction instanceof Path) {
            this.path = pathArrayOrFunction;
        }
        else{
            throw new Error('Can only add a path array or a draw function to Shape');
        }
    }


    Shape.prototype.draw = function(ctx){
        if (this.pathArray){
            var i;
            var paths = this.pathArray.slice(0, this.pathArray.length-1);
            var type = this.pathArray[this.pathArray.length-1];

            ctx.beginPath();

            for(i=0; i<paths.length; i++){
                paths[i].draw(ctx);

                if (!drawingPath && (type == "connected" || type == "connected and closed")){
                    drawingPath = true;
                }
            }

            if (type == "connected and closed"){
                ctx.closePath()
            }

            drawingPath = false;
        }
        else if(this._draw){
            this._draw(ctx);
        }

        ctx.fill();
        ctx.stroke();
    }


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
        .when(['date', 'date'], function(a,b){ return (a-b) / (1000 * 3600 * 24); })
        .tryInverse()
        .fn();

    var multiply = new Method()
        .when(['array', 'number'], function(a,b){ return a.map(function(x){ return multiply(x,b); }); })
        .when(['array', 'vector'], function(a,b){ return a.map(function(x){ return multiply(x,b); }); })
        .when(['vector', 'number'], function(a,b){ return new Vector(a.x * b, a.y * b); })
        .when(['number', 'vector'], function(a,b){ return new Vector(b.x * a, b.y * a); })
        // dot product, cross product only makes sense in 3 dimensions
        .when(['vector', 'vector'], function(a,b){ return a.x * b.x + a.y * b.y; })
        .when(['number', 'number'], function(a,b){ return a * b; })
        .fn(); // no inverse!

    var divide = new Method()
        .when(['array', 'number'], function(a,b){ return a.map(function(x){ return divide(x,b); }); })
        .when(['vector', 'number'], function(a,b){ return new Vector(a.x / b, a.y / b); })
        .when(['number', 'number'], function(a,b){ return a / b; })
        .fn();

    var equal = new Method()
        .when(['date', 'date'], function(a,b){ console.log("date === date"); return a.valueOf() === b.valueOf(); })
        .default(function(a,b){ console.log("Default"); return a === b; })
        .fn();

    var notEqual = new Method()
        .when(['date', 'date'], function(a,b){ console.log("date !== date"); return a.valueOf() !== b.valueOf(); })
        .default(function(a,b){ console.log("Default !=="); return a !== b; })
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
     * Motion mini-module.
     *
     * Call startTrackingMotion(). The direction property will be
     * updated.
     *
     * Events:
     *
     */
    var motionModule  = (function () {
        var direction = "",
            motionModule;

        motionModule = {
            /**
             * Starts fetching the motion, periodically, and sets the
             * direction property of this module.
             */
            startTrackingMotion: function () {

                /* Handle if motion is not supported. */
                if (!window.DeviceOrientationEvent) {
                    app.warn('This app tracks your motion, but your browser ' +
                             'does not have an accelerometer.');
                    return;
                }

                window.addEventListener('deviceorientation', onMotionChange);
            }
        };

        /* Define a read-only getter for the current direction. */
        Object.defineProperties(motionModule, {
            direction: {
                get: function () {
                    return direction;
                }
            }
        });

        function onMotionChange(eventData) {
            // gamma is the left-to-right tilt in degrees, where right is positive
            var left_right = eventData.gamma;

            // beta is the front-to-back tilt in degrees, where front is positive
            var front_back = eventData.beta;

            var limit = 10;

            direction = "";

            if(left_right > limit && front_back > limit) {
                direction = "upright";
            } else if(left_right > limit && front_back < -limit) {
                direction = "downright";
            } else if(left_right < -limit && front_back < -limit) {
                direction = "downleft";
            } else if(left_right < -limit && front_back > limit) {
                direction = "upleft";
            } else if(front_back > limit) {
                direction = "up";
            } else if(left_right > limit) {
                direction = "right";
            } else if(front_back < -limit) {
                direction = "down";
            } else if(left_right < -limit) {
                direction = "left";
            }

            Event.trigger(window, 'motionchanged', direction);
        }

        return motionModule;
    })();

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

    /**
     *  assets
     *  ------
     *
     *  `assets` is an module that ensures that sounds, images, and other
     *  things are loaded before the start of the script.
     *
     *  `assets.load` works by determining whether the asset is needed by
     *  matching a selector on the document (usually this means elements
     *  inside the script). Once elements are matched, they're passed to a
     *  given callback that should set in place the asynchronous loading of
     *  said elements.  Once all elements are done loading, the callback
     *  provided with the selector is called.
     *
     *  Here's how could use the `assets` object to execute loading callbacks
     *  and call a `setup` method when all the files have finished loading:
     *
     *      assets.load({
     *          'wb-expression[isasset=true]': function () { ... },
     *          'wb-expression[fn="geolocation"]': function () { ... },
     *          'wb-expression[fn="motion"]': function () { ... }
     *      }).whenLoaded(function () { ... });
     *
     *  You can now access these loaded media assets in you application code
     *  like this:
     *
     *  var shoot = assets.sounds["sounds/shoot.wav"],
     *      steampunk = assets.images["images/mascot-steampunk.png"],
     *      bounce = assets.videos["videos/bounce.mov"];
     *
     *  helpers
     *  =======
     *
     *  A common use of assets is loading images, sounds, and videos.
     *  Together, these are called *media*. Use `assets.loadMedia` as the
     *  callback for the selector matching all elements that specify the file
     *  path of some media to load as its first element of
     *  WBExpression.gatherValues().
     *
     *  Another use is to initialize a resource that singles it's ready by
     *  triggering an event. For this use case, use `assets.waitFor` given a
     *  function that will setup the resource, and the name of an event to
     *  listen to that will signal that it's ready.
     *
     */
    (function () {
        // We're going to use the loader to load images and video too, since it is here

        var assets = {

            /**
             * Loads stuff based on dependencies.
             * Passed an object of selector-callback pairs.
             */
            load: function (dependencies) {
                //Properties to help track the assets being loaded.
                var toLoad = 0;
                var loaded = 0;
                var whenLoaded, selector, matchedElements, matchCallback;

                /* Default whenLoaded callback. */
                whenLoaded = function () {
                    // console.log('default asset load');
                };

                /* Try every selector. */
                for (selector in dependencies) {
                    matchedElements = dom.findAll(selector);

                    // No need to call the matched elements.
                    if (!matchedElements.length)
                        continue;

                    toLoad++;

                    matchCallback = dependencies[selector];
                    // Call the callback. When it's ready,
                    // it MUST call ready!
                    matchCallback(matchedElements, ready);
                }

                // Called when all assets are loaded.
                function ready() {
                    /* No assets to load; just call whenLoaded. */
                    if (toLoad === 0) {
                        Event.trigger(window, 'asset-load');
                        whenLoaded();
                        return;
                    }

                    console.assert(loaded < toLoad);
                    loaded++;
                    if (loaded === toLoad) {
                        Event.trigger(window, 'asset-load');
                        whenLoaded();
                    }
                }

                // We need at least *ONE* async callback so that ready is
                // called; fake it here when there's notthing to load.
                if (toLoad === 0) {
                    setTimeout(function () {
                        ready();
                    }, 0);
                }

                /* Returns an object that looks and acts like a promise
                 * object. */
                return {
                    // Pass the callback function that should run when all assets
                    // have loaded.
                    whenLoaded: function(callback) { whenLoaded = callback; },
                };

            },

            /*
             * Data.
             */

            //File extensions for different types of sounds.
            audioExtensions: ["mp3", "ogg", "wav", "webm"],
            //File extensions for different types of images.
            imageExtensions: ["gif", "png", "jpg", "jpeg", "bmp"],
            //File extensions for different types of videos.
            videoExtensions: ["mov", "mpg", "mpeg"],

            /*
             * Storage.
             * See assets.loadMedia
             */

            // All loaded sounds are stored here.
            sounds: {},
            // All loaded images are stored here.
            images: {},
            // All loaded videos are stored here.
            videos: {},

            /*
             * Selector helper functions
             */

            // Returns a callback for use with a selector in assets.load()
            // that calls setup, and then waits for the particularly named
            // event. When the event is finally fired, ready is called.
            waitFor: function (eventName, setup) {
                return function (ignoredElements, ready) {
                    setup();
                    Event.once(window, 'runtime:' + eventName, null, ready);
                };
            },

            // Loading media.
            // This was adapted from the old sounds library:
            // the soundsForGames:
            // https://github.com/kittykatattack/soundForGames
            // Incidentally, this was also most of the old asset loader.
            loadMedia: function (elements, ready) {
                /* These counters are similar but COMPLETELY UNRELATED to
                 * assets.load(). When ALL media are loaded, only then will
                 * the counter be incremented by one in assets.load().
                 */
                var toLoad = 0;
                var loaded = 0;

                /**
                 * For each matched wb-expression, get its first value.
                 * We assume that this is the filename of the asset to load.
                 */
                var sources = elements.map(function(asset){
                    return asset.gatherValues()[0];
                });

                //Find the number of files that need to be loaded.
                toLoad = sources.length;
                sources.forEach(function(source){

                    //Find the file extension of the asset.
                    var extension = source.split('.').pop().toLowerCase();

                    //#### Sounds
                    //Load audio files that have file extensions that match
                    //the `audioExtensions` array.
                    if (assets.audioExtensions.indexOf(extension) !== -1) {

                        //Create a sound sprite.
                        var soundSprite = makeSound(source, loadHandler);

                        //Get the sound file name.
                        soundSprite.name = source;

                        //If you just want to extract the file name with the
                        //extension, you can do it like this:
                        //soundSprite.name = source.split("/").pop();
                        //Assign the sound as a property of the assets object so
                        //we can access it like this: `assets.sounds["sounds/sound.mp3"]`.
                        assets.sounds[soundSprite.name] = soundSprite;
                    }
                    else if (assets.imageExtensions.indexOf(extension) !== -1){
                        var imageSprite = new WBImage(source, loadHandler);
                        assets.images[source] = imageSprite;
                    }else if (assets.videoExtensions.indexOf(extension) !== -1){
                        var videoSprite = new Video();
                        videoSprite.name = source;
                        assets.videos[source] = videoSprite;
                        videoSprite.addEventListener('canplay', loadHandler, false);
                        videoSprite.src = source;
                    }else{
                        //Display a message if the file type isn't recognized.
                        console.log("File type not recognized: " + source);
                    }


                    //#### loadHandler
                    //The `loadHandler` will be called each time an asset finishes loading.
                    function loadHandler () {
                        loaded += 1;

                        //Check whether everything has loaded.
                        if (toLoad === loaded) {

                            //If it has, say that we're ready!
                            ready();
                        }
                    }

                });
            }, /* loadMedia */
        };

        window.assets = assets;
    })();


    /****************************
    *
    * Image, loadable, drawable
    *
    *****************************/

    function WBImage(src, loadHandler){
        self = this;
        function selfLoad(evt){
            self.width = self.origWidth = self._image.width;
            self.height = self.origHeight = self._image.height;
            self.origProportion = self.origWidth / self.origHeight;
            loadHandler(evt);
        }
        this.name = src;
        this._image = new Image();
        this._image.addEventListener('load', selfLoad, false);
        this._image.src = src;
    }

    WBImage.prototype.draw = function(ctx){
        ctx.drawImage(this._image, -this.width/2, -this.height/2, this.width, this.height);
    };

    WBImage.prototype.drawAtPoint = function(ctx, pt){
        ctx.translate(pt.x, pt.y);
        this.draw(ctx);
        ctx.setTransform(1,0,0,1,0,0); // back to identity matrix
    };

    WBImage.prototype.drawInRect = function(ctx, r){
        ctx.drawImage(this._image, r.x, r.y, r.width, r.height);
    };

    WBImage.prototype.getHeight = function(){
        return this.height;
    };

    WBImage.prototype.getWidth = function(){
        return this.width;
    };

    WBImage.prototype.setWidth = function(w){
        this.width = w;
        this.height = this.width / this.origProportion;
    };

    WBImage.prototype.setHeight = function(h){
        this.height = h;
        this.width = this.height * this.origProportion;
    };

    WBImage.prototype.setSize = function(sz){
        this.width = sz.w;
        this.height = sz.h;
    };

    WBImage.prototype.scale = function(scaleFactor){
        this.width = this.origWidth * scaleFactor;
        this.height = this.origHeight * scaleFactor;
    };

    WBImage.prototype.toString = function(){
        return this.name + "; " + this.width + "px wide by " + this.height + "px high";
    };


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
        this.facing = new Vector(1,0);
        this.velocity = new Vector(0,0);
    }

    Sprite.prototype.accelerate = function(speed){
        this.velocity = add(this.velocity, multiply(this.facing, speed));
        // console.log('position: %s, velocity: %s, facing: %s', strv(this.position), strv(this.velocity), strv(this.facing));
    }

    Sprite.prototype.setVelocity = function(vec){
        this.velocity = vec;
    }

    Sprite.prototype.getXvel = function(){
        return this.velocity.getX();
    }

    Sprite.prototype.getYvel = function(){
        return this.velocity.getY();
    }

    Sprite.prototype.getXpos = function(){
        return this.position.getX();
    }

    Sprite.prototype.getYpos = function(){
        return this.position.getY();
    }

    Sprite.prototype.applyForce = function(vec){
        this.velocity = add(this.velocity, vec);
    }

    Sprite.prototype.rotate = function(r){
        this.facing = this.facing.rotate(r);
    }

    Sprite.prototype.rotateTo = function(r){
        this.facing = this.facing.rotateTo(r);
    }

    Sprite.prototype.move = function(){
        this.position = add(this.position, this.velocity);
    }

    Sprite.prototype.moveTo = function(pt){
        this.position = new Vector(pt.x, pt.y);
    }

    Sprite.prototype.draw = function(ctx){
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.facing.radians()); // drawable should be centered on 0,0
        this.drawable.draw(ctx);
        ctx.setTransform(1,0,0,1,0,0); // back to identity matrix
    }

    Sprite.prototype.toString = function(){
        return 'Sprite pos: ' + this.position + ', vel: ' + this.velocity;
    };

    Sprite.prototype.bounceWithinRect = function bounceWithinRect(r){
        if (this.position.x > (r.x + r.width) && this.velocity.x > 0){
            this.velocity = new Vector(this.velocity.x *= -1, this.velocity.y);
        }else if (this.position.x < r.x && this.velocity.x < 0){
            this.velocity = new Vector(this.velocity.x *= -1, this.velocity.y);
        }
        if (this.position.y > (r.y + r.height) && this.velocity.y > 0){
            this.velocity = new Vector(this.velocity.x, this.velocity.y *= -1);
        }else if (this.position.y < r.y && this.velocity.y < 0){
            this.velocity = new Vector(this.velocity.x, this.velocity.y *= -1);
        }
    }

    Sprite.prototype.checkForCollision = function checkForCollision(other){

        var collision = false;

        if(this.drawable.width && other.drawable.width){
            collision = checkForCollisionTwoRectangles(this, other);
        }
        else if(this.drawable.radius && other.drawable.radius){
            collision = checkForCollisionTwoCircles(this, other);
        }
        else if(this.drawable.radius && other.drawable.width){
            collision = checkForCollisionRectangleAndCircle(other, this);
        }
        else if(this.drawable.width && other.drawable.radius){
            collision = checkForCollisionRectangleAndCircle(this, other);
        }

        return collision;

    }

    function checkForCollisionRectangleAndCircle(rectangle, circle){

        var rectangle_x;
        var rectangle_y;

        if(rectangle.drawable.centered){
            rectangle_x = rectangle.position.x - rectangle.drawable.width/2;
            rectangle_y = rectangle.position.y - rectangle.drawable.height/2;
        }
        else{
            rectangle_x = rectangle.position.x;
            rectangle_y = rectangle.position.y;
        }

        var rect = new SAT.Box(new SAT.Vector(rectangle_x, rectangle_y), rectangle.drawable.width, rectangle.drawable.height);
        var circ = new SAT.Circle(new SAT.Vector(circle.position.x, circle.position.y), circle.drawable.radius);

        var response = new SAT.Response();

        var collision = SAT.testPolygonCircle(rect.toPolygon(), circ, response)

        return collision;

    }


    function checkForCollisionTwoCircles(this_, other){

        var this_circle = new SAT.Circle(new SAT.Vector(this_.position.x, this_.position.y), this_.drawable.radius);
        var other_circle = new SAT.Circle(new SAT.Vector(other.position.x, other.position.y), other.drawable.radius);

        var response = new SAT.Response();

        var collision = SAT.testCircleCircle(this_circle, other_circle, response)

        return collision;

    }

    function checkForCollisionTwoRectangles(this_, other){

        var this_x;
        var this_y;
        var other_x;
        var other_y;

        if(this_.drawable.centered){
            this_x = this_.position.x - this_.drawable.width/2;
            this_y = this_.position.y - this_.drawable.height/2;
        }
        else{
            this_x = this_.position.x;
            this_y = this_.position.y;
        }


        if(other.drawable.centered){
            other_x = other.position.x - other.drawable.width/2;
            other_y = other.position.y - other.drawable.height/2;
        }
        else{
            other_x = other.position.x;
            other_y = other.position.y;
        }

        var this_rect = new SAT.Box(new SAT.Vector(this_x, this_y), this_.drawable.width, this_.drawable.height);
        var other_rect = new SAT.Box(new SAT.Vector(other_x, other_y), other.drawable.width, other.drawable.height);

        var response = new SAT.Response();

        var collision = SAT.testPolygonPolygon(this_rect.toPolygon(), other_rect.toPolygon(), response)

        return collision;
    }

    Sprite.prototype.wrapAroundRect = function(r){
        if (this.position.x > (r.x + r.width) && this.velocity.x > 0){
            this.position = new Vector(this.position.x - r.width, this.position.y);
        }else if (this.position.x < r.x && this.velocity.x < 0){
            this.position = new Vector(this.position.x + r.x + r.width, this.position.y);
        }
        if (this.position.y > (r.y + r.height) && this.velocity.y > 0){
            this.position = new Vector(this.position.x, this.position.y - r.height);
        }else if (this.position.y < r.y && this.velocity.y < 0){
            this.position = new Vector(this.position.x, this.position.y + r.y + r.height);
        }
    }

    Sprite.prototype.stayWithinRect = function(r){
        if (this.position.x > (r.x + r.width) && this.velocity.x > 0){
            this.position = new Vector(r.x + r.width, this.position.y);
        }else if (this.position.x < r.x && this.velocity.x < 0){
            this.position = new Vector(r.x, this.position.y);
        }
        if (this.position.y > (r.y + r.height) && this.velocity.y > 0){
            this.position = new Vector(this.position.x, r.y + r.height);
        }else if (this.position.y < r.y && this.velocity.y < 0){
            this.position = new Vector(this.position.x, r.y);
        }
    }

    function defaultDrawable(ctx){
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
    }

    function randomId(){
        // Based on Paul Irish's random hex color:http://www.paulirish.com/2009/random-hex-color-code-snippets/
        // Theoretically could return non-unique values, not going to let that keep me up at night
        return 'k'+Math.floor(Math.random()*16777215).toString(16); // 'k' because ids have to start with a letter
    }

    // exports
    window.util = {
        Size: Size,
        extend: extend,
        deleteItem: deleteItem,
        setDefault: setDefault,
        type: type,
        dist: dist,
        Method: Method,
        Vector: Vector,
        Rect: Rect,
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide,
        equal: equal,
        notEqual: notEqual,
        deg2rad: deg2rad,
        rad2deg: rad2deg,
        angle: angle,
        randInt: randInt,
        noise: noise,
        choice: choice,
        isNumber: isNumber,
        Path: Path,
        Shape: Shape,
        Sprite: Sprite,
        geolocation: geolocationModule,
        motion: motionModule,
        WBImage: WBImage,
        randomId: randomId,
        lastPoint: lastPoint,
        setLastPoint: setLastPoint,
        isDrawingPath: isDrawingPath
    };


})();
