/**
 * runtime-simple.js -- simple block functions
 *
 * This contains "simple" blocks that make few assumptions about the state of
 * the page. Functions split out into this file are thus easier to test due to
 * fewer dependencies.
 */
(function (global) {
    /** Converts numeric degrees to radians */
    if (!Number.prototype.toRadians) {
      Number.prototype.toRadians = function() {
        return this * Math.PI / 180;
      };
    }

    global.runtime = util.extend((global.runtime || {} ), {
        array: {
            create: function(){
                return [].slice.call(arguments);
            },
            copy: function(a){
                return a.slice();
            },
            itemAt: function(a,i){
                return a[i];
            },
            join: function(a,s){
                return a.join(s);
            },
            append: function(a,item){
                a.push(item);
            },
            prepend: function(a,item){
                a.unshift(item);
            },
            length: function(a){
                return a.length;
            },
            removeItem: function(a,i){
                a.splice(i,1);
            },
            pop: function(a){
                return a.pop();
            },
            shift: function(a){
                return a.shift();
            },
            reverse: function(a){
                return a.reverse();
            }
        },

        'boolean': {
            and: function(a,b){
                return a && b;
            },
            or: function(a,b){
                return a || b;
            },
            xor: function(a,b){
                return !a !== !b;
            },
            not: function(a){
                return !a;
            }
        },

        math: {
            add: util.add,
            subtract: util.subtract,
            multiply: util.multiply,
            divide: util.divide,
            equal: function(a,b){ return a === b; },
            notEqual: function(a,b){ return a !== b; },
            lt: function(a,b){ return a < b; },
            lte: function(a,b){ return a <= b; },
            gt: function(a,b){ return a > b; },
            gte: function(a,b){ return a >= b; },
            mod: function(a,b){ return a % b; },
            round: Math.round,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            max: Math.max,
            min: Math.min,
            cos: function(a){ return Math.cos(util.deg2rad(a)); },
            sin: function(a){ return Math.sin(util.deg2rad(a)); },
            tan: function(a){ return Math.tan(util.deg2rad(a)); },
            asin: function(a){ return Math.asin(util.deg2rad(a)); },
            acos: function(a){ return Math.acos(util.deg2rad(a)); },
            atan: function(a){ return Math.atan(util.deg2rad(a)); },
            pow: function(a,b){ return Math.pow(a, b); },
            sqrt: function(a,b){ return Math.sqrt(a); },
            pi: function(){ return Math.PI; },
            e: function(){ return Math.E; },
            tau: function(){ return Math.PI * 2; }
        },

        random: {
            randFloat: Math.random,
            randInt: util.randInt,
            noise: util.noise,
            choice: util.choice
        },

        vector: {
            create: function(x,y){ return new util.Vector(x,y); },
            fromPoint: function(pt){ return new util.Vector(pt.x, pt.y); },
            createPolar: function(r,m){ return util.Vector.fromPolar(r,m); },
            rotate: function(v,a){ return v.rotate(a); },
            rotateTo: function(v,a){ return v.rotateTo(a); },
            magnitude: function(v){ return v.magnitude(); },
            degrees: function(v){ return v.degrees(); },
            x: function(v){ return v.x; },
            y: function(v){ return v.y; },
            normalize: function(v){ return v.normalize(); }
        },

        point: {
            create: function(x,y){
                return new util.Point(x,y);
            },
            fromVector: function(vec){
                return new util.Point(vec.x, vec.y);
            },
            fromArray: function(arr){
                return new util.Point(arr[0], arr[1]);
            },
            randomPoint: function(){
                return new util.Point(util.randInt(Event.stage.width), util.randInt(Event.stage.height));
            },
            x: function(pt){
                return pt.x;
            },
            y: function(pt){
                return pt.y;
            },
            toArray: function(pt){
                return [pt.x, pt.y];
            }
        },

        rect: {
            fromCoordinates: function (x, y, width, height) {
                return new util.Rect(x, y, width, height);
            },
            fromVectors: function (point, size) {
                return util.Rect.fromVectors(point, size);
            },
            fromArray: function (a) {
                if (a.length < 4) {
                    throw new Error('Array must have at least four elements.');
                }
                return new util.Rect(a[0], a[1], a[2], a[3]);
            },
            getPosition: function (rect) { return rect.getPosition(); },
            getSize: function (rect) { return rect.getSize(); },
            asArray: function (rect) {
                return [rect.x, rect.y, rect.size.width, rect.size.height];
            },
            getX: function (rect) { return rect.x; },
            getY: function (rect) { return rect.y; },
            getWidth: function (rect) { return rect.size.width; },
            getHeight: function (rect) { return rect.size.height; }
        },

        size: {
            fromCoordinates: function (width, widthUnits, height, heightUnits) {
                return new util.Size(width, widthUnits, height, heightUnits);
            },
            fromArray: function (a, widthUnits, heightUnits) {
                if (a.length < 2) {
                    throw new Error('Array must have at least two elements.');
                }
                return new util.Size(a[0], widthUnits, a[1], heightUnits);
            },
            toArray: function (size) {
                return [size.width, size.height];
            },
            getWidth: function (size) { return size.width; },
            getHeight: function (size) { return size.height; }
        },

        object: {
            empty: function () {
                return {};
            },
            create: function () {
                var i, key, val, obj;
                obj = {};
                // Get key/value pairs from arguments.
                for (i = 0; i < arguments.length; i++) {
                    key = arguments[i][0];
                    val = arguments[i][1];
                    obj[key] = val;
                }
                return obj;
            },
            getValue: function (obj, key) {
                return obj[key];
            },
            getKeys: function (obj) {
                return Object.keys(obj);
            }
        },

        /*
         * The underlying JavaScript object is the same object that is passed
         * to the getCurrentLocation callback.
         */
        geolocation: {
            /* Synchronous "get current location" */
            currentLocation: function () {
                return util.geolocation.currentLocation;
            },
            /* Asynchronous update event. Context. */
            whenLocationUpdated: function(args, containers) {
                var currentScope = this,
                    steps = containers[0];

                Event.on(window, 'locationchanged', null, function (event) {
                    // TODO: probably factor out augmenting scope and running
                    // the block stuff to somewhere else.
                    steps.forEach(function (block) {
                        block.run(currentScope);
                    });
                });
            },
            // Returns the distance between two points in meters.
            // taken from http://www.movable-type.co.uk/scripts/latlong.html
            // Using the haversine formula.
            distanceBetween: function (p1, p2) {
                var R = 6371000; // m
                var lat1 = p1.coords.latitude;
                var lon1 = p1.coords.longitude;
                var lat2 = p2.coords.latitude;
                var lon2 = p2.coords.longitude;

                var φ1 = lat1.toRadians();
                var φ2 = lat2.toRadians();
                var Δφ = (lat2-lat1).toRadians();
                var Δλ = (lon2-lon1).toRadians();

                var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ/2) * Math.sin(Δλ/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                return R * c;
            },
            /* Returns latitude in degrees. */
            // TODO: should this return a "degrees" object?
            latitude: function (location) {
                return location.coords.latitude;
            },
            /* Returns longitude in degrees. */
            // TODO: should this return a "degrees" object?
            longitude: function (location) {
                return location.coords.longitude;
            },
            /* Returns altitude as a unit? */
            altitude: function (location) {
                return location.coords.altitude;
            },
            /* Returns degrees from north. */
            heading: function (location) {
                // TODO: What do we do when this is NaN or NULL?
                return location.coords.heading;
            },
            /* Returns estimated speed. */
            speed: function (location) {
                // TODO: What do we do when this is NaN or NULL?
                return location.coords.speed;
            },
        },


    });


}(window));
