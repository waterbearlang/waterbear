(function(global){
    'use strict';

    // Dependencies: ctx, canvas, Event, runtime, sound, soundEffect,
    // canvas/stage stuff
    var _canvas, _ctx;
    function canvas(){
        if (!_canvas){
            if (dom.find){
                _canvas = dom.find('wb-playground > canvas');
            }
            if (!_canvas){
                // We're not running in Waterbear
                // Just put a canvas in so tests pass
                _canvas = document.createElement('canvas');
                _canvas.setAttribute('width', '200');
                _canvas.setAttribute('height', '200');
            }
        }
        return _canvas;
    }
    function ctx(){
        if (!_ctx){
            _ctx = canvas().getContext('2d');
        }
        return _ctx;
    }
    Event.on(window, 'load', null, function(){
        handleResize();
    }, false);

    function handleResize(){
        var rect = canvas().getBoundingClientRect();
        Event.stage = {
            // FIXME: Move these to runtime.stage
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom),
            width: Math.round(rect.right) - Math.round(rect.left),
            height: Math.round(rect.bottom) - Math.round(rect.top)
        };
        canvas().setAttribute('width', Event.stage.width);
        canvas().setAttribute('height', Event.stage.height);
    }

    // Initialize the stage.
    Event.on(window, 'resize', null, handleResize);
    Event.on(document.body, 'wb-resize', null, handleResize);

    var perFrameHandlers = [];
    var lastTime = new Date().valueOf();

    function startEventLoop(){
        runtime.control._frame = 0;
        runtime.control._sinceLastTick = 0;
        requestAnimationFrame(frameHandler);
    }

    function frameHandler(){
        // where to put these? Event already has some global state.
        var currTime = new Date().valueOf();
        runtime.control._elapsed = currTime - lastTime;
        runtime.control._frame++;
        lastTime = currTime;
        perFrameHandlers.forEach(function(handler){
            handler();
        });
        requestAnimationFrame(frameHandler);
    }


    // for all of these functions, `this` is the scope object
    //
    // Contents of runtime (please add new handlers alphabetically)
    //
    // startEventLoop -> exposed for testing only
    // local - special for variables
    // array
    // boolean
    // color
    // control
    // geolocation
    // image
    // math
    // motion
    // object
    // path
    // point
    // random
    // rect
    // shape
    // size
    // sound
    // sprite
    // stage
    // string
    // text
    // vector

    global.runtime = util.extend((global.runtime || {} ), {
        startEventLoop: startEventLoop,

        local: {
            //temporary fix for locals
            value: function(){
                return this.value;
            }
        },

        array: {
            create: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'create']);
                return [].slice.call(arguments);
            },
            copy: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'copy']);
                return a.slice();
            },
            itemAt: function(a,i){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'itemAt']);
                return a[i];
            },
            join: function(a,s){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'join']);
                return a.join(s);
            },
            append: function(a,item){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'append']);
                a.push(item);
            },
            prepend: function(a,item){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'prepend']);
                a.unshift(item);
            },
            length: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'length']);
                return a.length;
            },
            removeItem: function(a,i){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'removeItem']);
                a.splice(i,1);
            },
            pop: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'pop']);
                return a.pop();
            },
            shift: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'shift']);
                return a.shift();
            },
            reverse: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Array', 'reverse']);
                return a.reverse();
            }
        },

        'boolean': {
            and: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Boolean', 'and']);
                return a && b;
            },
            or: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Boolean', 'or']);
                return a || b;
            },
            xor: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Boolean', 'xor']);
                return !a !== !b;
            },
            not: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Boolean', 'not']);
                return !a;
            }
        },
		canvas: {
			canvasWidth: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Canvas', 'canvasWidth']);
				return Event.stage.width;
			},
			canvasHeight: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Canvas', 'canvasHeight']);
				return Event.stage.height;
			},
			centerX: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Canvas', 'centerX']);
				return (Event.stage.width / 2);
			},
			centerY: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Canvas', 'centerY']);
				return (Event.stage.height / 2);
			},
			randomX: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Canvas', 'randomX']);
				return Math.random() * Event.stage.width;
			},
			randomY: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Canvas', 'randomY']);
				return Math.random() * Event.stage.height;
			},
        },
        color: {
            namedColor: function(name){
                // FIXME: We may need to return hex or other color value
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'namedColor']);
                return name;
            },
            rgb: function(r,g,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'rgb']);
                return 'rgb(' + r + ',' + g + ',' + b + ')';
            },
            rgba: function(r,g,b,a){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'rgba']);
                return 'rgba(' + r + ',' + g + ',' + b + ',' + a/100 + ')';
            },
            grey: function(g){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'grey']);
                return 'rgb(' + g + ',' + g + ',' + g + ')';
            },
            hsl: function(h,s,l){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'hsl']);
                return 'hsl(' + h + ',' + s + '%,' + l + '%)';
            },
            hsla: function(h,s,l,a){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'hsla']);
                return 'hsl(' + h + ',' + s + '%,' + l + '%,' + a/100 + ')';
            },
            random: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'random']);
                return "#"+(~~(Math.random()*(1<<30))).toString(16).toUpperCase().slice(0,6);
            },
            fill: function(color){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'fill']);
                ctx().fillStyle = color;
            },
            stroke: function(color){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'stroke']);
                ctx().strokeStyle = color;
            },
            shadow: function(color){
                _gaq.push(['_trackEvent', 'Blocks', 'Color', 'shadow']);
                ctx().shadowColor = color;
            }
        },

        control: {
            whenProgramRuns: function(args, containers){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'whenProgramRuns']);
                var self = this;
                containers[0].forEach(function(block){
                    block.run(self);
                });
            },
            whenKeyPressed: function(args, containers){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'whenKeyPressed']);
                var self = this;
                Event.onKeyDown(args[0], function(){
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                });
            },
            eachFrame: function(args, containers){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'eachFrame']);
                var self = this;
                perFrameHandlers.push(function(){
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                });
            },
            frame: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'frame']);
                return runtime.control._frame;
            },
            elapsed: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'elapsed']);
                return runtime.control._elapsed;
            },
            setVariable: function(name, value){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'setVariable']);
                //FIXME: Make sure this is named properly
                // console.log('setting variable %s to value %s', name, value);
                this[name] = value;
            },
            getVariable: function(name){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'getVariable']);
                // console.log('get %s from %o', name, this);
                return this[name];
            },
            incrementVariable: function(variable, value){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'incrementVariable']);
                this[name] += value;
            },
            loopOver: function(args, containers) {
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'loopOver']);
                // FIXME: this has to work over arrays, strings, objects, and numbers
                var self = this;
                var list = args[0];
                var type = util.type(list);
                var i =0,len,keys;
                switch(type){
                    case 'array': // fall through
                    case 'string':
                        len = list.length;
                        break;
                    case 'object':
                        keys = Object.keys(list);
                        len = keys.length;
                        break;
                    case 'number':
                        len = list;
                        break;
                }

                /* For every element in the container place
                 * the index and value into the scope. */
                for (i = 0; i < len; i++){
                    switch(type){
                        case 'array': // fall through
                        case 'string':
                            this.index = i;
                            this.value = list[i];
                            break;
                        case 'object':
                            this.key = keys[i];
                            this.value = list[this.key];
                            break;
                        case 'number':
                            this.value = i;
                            break;
                    }
                    containers[0].forEach(runBlock);
                }

                function runBlock(block){
                    block.run(self);
                }
            },
            broadcast: function(eventName, data){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'broadcast']);
                // Handle with and without data
                Event.trigger(document.body, eventName, data);
            },
            receive: function(args, containers){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'receive']);
                // Handle with and without data
                // Has a local for the data
                var self = this;
                Event.on(document.body, args[0], null, function(evt){
                    // FIXME: how do I get the local from here?
                    // As an arg would be easiest
                    self[args[1]] = evt.detail;
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                });
            },
            'if': function(args, containers){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'if']);
                if (args[0]){
                    var self = this;
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                }
            },
            ifElse: function(args, containers){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'ifElse']);
                var self = this;
                if (args[0]){
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                }else{
                    containers[1].forEach(function(block){
                        block.run(self);
                    });
                }
            },
            ternary: function(cond, iftrue, otherwise){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'ternary']);
                return cond ? iftrue : otherwise;
            },
			ask: function(args){
				_gaq.push(['_trackEvent', 'Blocks', 'Control', 'ask']);
				var message = args[0];
				var name = args[1];
				var answer = prompt(message);
				runtime.control.setVariable(name, answer);
			},
			comment: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'comment']);
            },
            log: function(item){
                _gaq.push(['_trackEvent', 'Blocks', 'Control', 'log']);
                console.log(item);
            }
        },

        /*
         * The underlying JavaScript object is the same object that is passed
         * to the getCurrentLocation callback.
         */
        geolocation: {
            /* Synchronous "get current location" */
            currentLocation: function () {
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'currentLocation']);
                return util.geolocation.currentLocation;
            },
            /* Asynchronous update event. Context. */
            whenLocationUpdated: function(args, containers) {
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'whenLocationUpdated']);
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
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'distanceBetween']);
                var R = 6371000; // m
                var lat1 = p1.coords.latitude;
                var lon1 = p1.coords.longitude;
                var lat2 = p2.coords.latitude;
                var lon2 = p2.coords.longitude;

                var φ1 = util.deg2rad(lat1);
                var φ2 = util.deg2rad(lat2);
                var Δφ = util.deg2rad(lat2-lat1);
                var Δλ = util.deg2rad(lon2-lon1);

                var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ/2) * Math.sin(Δλ/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                return R * c;
            },
            /* Returns latitude in degrees. */
            // TODO: should this return a "degrees" object?
            latitude: function (location) {
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'latitude']);
                return location.coords.latitude;
            },
            /* Returns longitude in degrees. */
            // TODO: should this return a "degrees" object?
            longitude: function (location) {
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'longitude']);
                return location.coords.longitude;
            },
            /* Returns altitude as a unit? */
            altitude: function (location) {
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'altitude']);
                return location.coords.altitude;
            },
            /* Returns degrees from north. */
            heading: function (location) {
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'heading']);
                // TODO: What do we do when this is NaN or NULL?
                return location.coords.heading;
            },
            /* Returns estimated speed. */
            speed: function (location) {
                _gaq.push(['_trackEvent', 'Blocks', 'GeoLocation', 'speed']);
                // TODO: What do we do when this is NaN or NULL?
                return location.coords.speed;
            },
        },

        image: {
            get: function(path){
                _gaq.push(['_trackEvent', 'Blocks', 'Image', 'get']);
                return assets.images[path];
            },
            drawAtPoint: function(img, pt){
                _gaq.push(['_trackEvent', 'Blocks', 'Image', 'drawAtPoint']);
                img.drawAtPoint(ctx, pt);
            },
            setWidth: function(img, w){
                _gaq.push(['_trackEvent', 'Blocks', 'Image', 'setWidth']);
                img.setWidth(w);
            },
            setHeight: function(img, h){
                _gaq.push(['_trackEvent', 'Blocks', 'Image', 'setHeight']);
                img.setHeight(h);
            },
            setSize: function(img, sz){
                _gaq.push(['_trackEvent', 'Blocks', 'Image', 'setSize']);
                img.setSize(sz);
            },
            scale: function(img, scaleFactor){
                _gaq.push(['_trackEvent', 'Blocks', 'Image', 'scale']);
                img.scale(scaleFactor);
            }
            // getScaledAtOrigin: function(path, sz){
            //     _gaq.push(['_trackEvent', 'Blocks', 'Image', 'getScaledAtOrigin']);
            //     var img = images[path];
            //     return {
            //         name: 'Image',
            //         draw: function draw(inner_ctx){
            //             inner_ctx.drawImage(img, -sz.w/2, -sz.h/2, sz.w, sz.h);
            //         }
            //     };
            // }
        },
		input: {
			keyPressed: function(key){
				_gaq.push(['_trackEvent', 'Blocks', 'Input', 'keyPressed']);
				if(Event.keys[key])
					return true;
				else
					return false;
			},
			mouseX: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Input', 'mouseX']);
				return (Event.pointerX-Event.stage.left);
			},
			mouseY: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Input', 'mouseY']);
				return (Event.pointerY-Event.stage.top);
			},
			mouseDown: function(){
				_gaq.push(['_trackEvent', 'Blocks', 'Input', 'mouseDown']);
				return Event.pointerDown;
			},
		},
        math: {
            add: util.add,
            subtract: util.subtract,
            multiply: util.multiply,
            divide: util.divide,
            equal: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'equal']);
                return a === b; },
            notEqual: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'notEqual']);
                return a !== b; },
            lt: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'lt']);
                return a < b; },
            lte: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'lte']);
                return a <= b; },
            gt: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'gt']);
                return a > b; },
            gte: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'gte']);
                return a >= b; },
            mod: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'mod']);
                return a % b; },
            round: Math.round,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            max: Math.max,
            min: Math.min,
            cos: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'cos']);
                return Math.cos(util.deg2rad(a)); },
            sin: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'sin']);
                return Math.sin(util.deg2rad(a)); },
            tan: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'tan']);
                return Math.tan(util.deg2rad(a)); },
            asin: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'asin']);
                return Math.asin(util.deg2rad(a)); },
            acos: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'acos']);
                return Math.acos(util.deg2rad(a)); },
            atan: function(a){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'atan']);
                return Math.atan(util.deg2rad(a)); },
            pow: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'pow']);
                return Math.pow(a, b); },
            sqrt: function(a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'sqrt']);
                return Math.sqrt(a); },
            pi: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'pi']);
                return Math.PI; },
            e: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'e']);
                return Math.E; },
            tau: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Math', 'tau']);
                return Math.PI * 2; }
        },

        motion: {
            /* Asynchronous update event. Context. */
            whenDeviceTurned: function(args, containers) {
                _gaq.push(['_trackEvent', 'Blocks', 'Motion', 'whenDeviceTurned']);
                var currentScope = this,
                    steps = containers[0];

                Event.on(window, 'motionchanged', null, function (event) {
                        if (args[0] === util.motion.direction) {
                            steps.forEach(function (block) {
                            block.run(currentScope);
                        });
                    }
                });
            },
            /* Synchronous "get current location" */
            tiltDirection: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Motion', 'tiltDirection']);
                return util.motion.direction;
            }
        },

        object: {
            empty: function () {
                _gaq.push(['_trackEvent', 'Blocks', 'Object', 'empty']);
                return {};
            },
            create: function () {
                _gaq.push(['_trackEvent', 'Blocks', 'Object', 'create']);
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
                _gaq.push(['_trackEvent', 'Blocks', 'Object', 'getValue']);
                return obj[key];
            },
            getKeys: function (obj) {
                _gaq.push(['_trackEvent', 'Blocks', 'Object', 'getKeys']);
                return Object.keys(obj);
            }
        },

        path:{

            lineTo: function(toPoint){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'lineTo']);
                return new util.Path(ctx().lineTo, new Array(toPoint.x, toPoint.y))
            },

            bezierCurveTo: function(toPoint, controlPoint1, controlPoint2){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'bezierCurveTo']);
                return new util.Path(ctx().bezierCurveTo, new Array(controlPoint1.x, controlPoint1.y,
                controlPoint2.x, controlPoint2.y, toPoint.x,
                toPoint.y));
            },
            moveTo: function(toPoint){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'moveTo']);
                return new util.Path(ctx().moveTo, new Array(toPoint.x, toPoint.y));
            },
            quadraticCurveTo: function(toPoint, controlPoint){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'quadraticCurveTo']);
                return new util.Path(ctx().quadraticCurveTo, new Array(controlPoint.x,
                controlPoint.y,toPoint.x, toPoint.y));
            },
            arcTo: function(radius, controlPoint1, controlPoint2){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'arcTo']);
                return new util.Path(ctx().arcTo, new Array(controlPoint1.x,
                controlPoint1.y,controlPoint2.x, controlPoint2.y,
                radius));
            },
            closePath: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'closePath']);
                return new util.Path(ctx().closePath);
            },
            pathSet: function(args){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'pathSet']);
                return new util.Shape(arguments);
            },

            lineStyle: function(width, color, capStyle, joinStyle){
                _gaq.push(['_trackEvent', 'Blocks', 'Path', 'lineStyle']);
                ctx().lineWidth = width;
                ctx().strokeStyle = color;
                ctx().lineCap = capStyle;
                ctx().lineJoin = joinStyle;
            }

        },

        point: {
            create: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'Point', 'create']);
                return new util.Point(x,y);
            },
            fromVector: function(vec){
                _gaq.push(['_trackEvent', 'Blocks', 'Point', 'fromVector']);
                return new util.Point(vec.x, vec.y);
            },
            fromArray: function(arr){
                _gaq.push(['_trackEvent', 'Blocks', 'Point', 'fromArray']);
                return new util.Point(arr[0], arr[1]);
            },
            randomPoint: function(){
                _gaq.push(['_trackEvent', 'Blocks', 'Point', 'randomPoint']);
                return new util.Point(util.randInt(Event.stage.width), util.randInt(Event.stage.height));
            },
            x: function(pt){
                _gaq.push(['_trackEvent', 'Blocks', 'Point', 'x']);
                return pt.x;
            },
            y: function(pt){
                _gaq.push(['_trackEvent', 'Blocks', 'Point', 'y']);
                return pt.y;
            },
            toArray: function(pt){
                _gaq.push(['_trackEvent', 'Blocks', 'Point', 'toArray']);
                return [pt.x, pt.y];
            },
        },

        random: {
            randFloat: Math.random,
            randInt: util.randInt,
            noise: util.noise,
            choice: util.choice
        },

        rect: {
            fromCoordinates: function (x, y, width, height) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'fromCoordinates']);
                return new util.Rect(x, y, width, height);
            },
            fromVectors: function (point, size) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'fromVectors']);
                return util.Rect.fromVectors(point, size);
            },
            fromArray: function (a) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'fromArray']);
                if (a.length < 4) {
                    throw new Error('Array must have at least four elements.');
                }
                return new util.Rect(a[0], a[1], a[2], a[3]);
            },
            getPosition: function (rect) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'getPosition']);
                return rect.getPosition();
            },
            getSize: function (rect) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'getSize']);
                return rect.getSize();
            },
            asArray: function (rect) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'asArray']);
                return [rect.x, rect.y, rect.size.width, rect.size.height];
            },
            getX: function (rect) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'getX']);
                return rect.x;
            },
            getY: function (rect) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'getY']);
                return rect.y;
            },
            getWidth: function (rect) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'getWidth']);
                return rect.size.width;
            },
            getHeight: function (rect) {
                _gaq.push(['_trackEvent', 'Blocks', 'Rect', 'getHeight']);
                return rect.size.height;
            }
        },

        shape: {
            fill: function(shapeArg){
                _gaq.push(['_trackEvent', 'Blocks', 'Shape', 'fill']);
                console.log(shapeArg);
                shapeArg.draw(ctx());
                ctx().fill();
            },
            stroke: function(shapeArg){
                _gaq.push(['_trackEvent', 'Blocks', 'Shape', 'stroke']);
                shapeArg.draw(ctx());
                ctx().stroke();
            },
            circle: function(pt, rad){
                _gaq.push(['_trackEvent', 'Blocks', 'Shape', 'circle']);
                ctx().beginPath();
                ctx().arc(pt.x, pt.y, rad, 0, Math.PI * 2, true);
            },
            rectangle: function(pt, width, height, orientation){
                _gaq.push(['_trackEvent', 'Blocks', 'Shape', 'rectangle']);
                ctx().beginPath();
                if(orientation == "center"){
                    ctx().moveTo(pt.x - width/2, pt.y - height/2);
                    ctx().lineTo(pt.x + width/2, pt.y - height/2);
                    ctx().lineTo(pt.x + width/2, pt.y + height/2);
                    ctx().lineTo(pt.x - width/2, pt.y + height/2);
                    ctx().lineTo(pt.x - width/2, pt.y - height/2);
                }
                else{
                    ctx().lineTo(pt.x + width, pt.y);
                    ctx().lineTo(pt.x + width, pt.y + height);
                    ctx().lineTo(pt.x, pt.y + height);
                    ctx().lineTo(pt.x, pt.y);
                }
            },
            ellipse: function(pt, rad1, rad2, rot){
                    _gaq.push(['_trackEvent', 'Blocks', 'Shape', 'ellipse']);
                    ctx().beginPath();
                    ctx().ellipse(pt.x, pt.y, rad1, rad2, rot, 0, Math.PI * 2);

            },

        },
        size: {
            fromCoordinates: function (width, widthUnits, height, heightUnits) {
                _gaq.push(['_trackEvent', 'Blocks', 'Size', 'fromCoordinates']);
                return new util.Size(width, widthUnits, height, heightUnits);
            },
            fromArray: function (a, widthUnits, heightUnits) {
                _gaq.push(['_trackEvent', 'Blocks', 'Size', 'fromArray']);
                if (a.length < 2) {
                    throw new Error('Array must have at least two elements.');
                }
                return new util.Size(a[0], widthUnits, a[1], heightUnits);
            },
            toArray: function (size) {
                _gaq.push(['_trackEvent', 'Blocks', 'Size', 'toArray']);
                return [size.width, size.height];
            },
            getWidth: function (size) {
                _gaq.push(['_trackEvent', 'Blocks', 'Size', 'getWidth']);
                return size.width;
            },
            getHeight: function (size) {
                _gaq.push(['_trackEvent', 'Blocks', 'Size', 'getHeight']);
                return size.height;
            }
        },

        sound: {

            get: function(url){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'get']);
                return assets.sounds[url]; // already cached by sounds library
            },
            play: function(sound){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'play']);
                sound.play();
            },
            setLoop: function(sound, flag){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'setLoop']);
                sound.loop = flag;
            },
            setVolume: function(sound, volume){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'setVolume']);
                sound.volume = volume;
            },
            pause: function(sound){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'pause']);
                sound.pause();
            },
            playFrom: function(sound, time){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'playFrom']);
                sound.playFrom(time);
            },
            pan: function(sound, balance){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'pan']);
                sound.pan = balance;
            },
            echo_DelayFeedbackFilter: function(sound, delay, feedback, filter){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'echo_DelayFeedbackFilter']);
                sound.setEcho(delay, feedback, filter);
            },
            stopEcho: function(sound){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'stopEcho']);
                sound.echo = false;
            },
            reverb_DurationDecayReverse: function(sound, duration, decay, reverse){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'reverb_DurationDecayReverse']);
                sound.setReverb(duration, decay, reverse);
            },
            stopReverb: function(sound){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'stopReverb']);
                sound.reverb = false;
            },
            effect: function(frequency, attack, decay, waveform, volume, balance, wait, pitchBend, reverseBend, random, dissonance, echoDelay, echoFeedback, echoFilter){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'effect']);
                return {
                    play: function(){
                       soundEffect(
                            frequency, attack, decay, waveform,
                            volume, balance, wait,
                            pitchBend, reverseBend, random, dissonance,
                            [echoDelay, echoFeedback, echoFilter]
                        );
                    }
                };
            }
        },

        sprite: {
            create: function(imgShapeOrSprite){
                _gaq.push(['_trackEvent', 'Blocks', 'Sprite', 'create']);
                return new util.Sprite(imgShapeOrSprite);
            },
            accelerate: function(spt, speed){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'accelerate']);
                spt.accelerate(speed);
            },
            rotate: function(spt, angle){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'rotate']);
                spt.rotate(angle);
            },
            rotateTo: function(spt, angle){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'rotateTo']);
                spt.rotateTo(angle);
            },
            move: function(spt){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'move']);
                spt.move();
            },
            moveTo: function(spt, pt){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'moveTo']);
                spt.moveTo(pt);
            },
            draw: function(spt){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'draw']);
                spt.draw(ctx());
            },
            applyForce: function(spt, vec){
                _gaq.push(['_trackEvent', 'Blocks', 'Sound', 'applyForce']);
                spt.applyForce(vec);
            }
        },

        string: {

            toString: function(x){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'toString']);
                return x.toString()
            },
            split: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'split']);
                return x.split(y);
            },
            concatenate: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'concatenate']);
                return x.concat(y);
            },
            repeat: function(x,n){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'repeat']);
                var str = "";
                for(var i=0; i<n; i++){
                    str = str.concat(x);
                }
                return str;
            },
            getChar: function(n,x){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'getChar']);
                return x.charAt(n-1);
            },
            getCharFromEnd: function(n,x){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'getCharFromEnd']);
                return x.charAt(x.length-n-1);
            },
            substring: function(x,a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'substring']);
                return x.substring(a-1,a+b-1);
            },
            substring2: function(x,a,b){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'substring2']);
                return x.substring(a-1,b)
            },
            isSubstring: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'isSubstring']);
                if(y.indexOf(x)===-1){
                    return false;
                }
                else{
                    return true;
                }
            },
            substringPosition: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'substringPosition']);
                return y.indexOf(x)+1;
            },
            replaceSubstring: function(x,y,z){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'replaceSubstring']);
                return x.replace(y,z);
            },
            trimWhitespace: function(x){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'trimWhitespace']);
                return x.trim();
            },
            uppercase: function(x){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'uppercase']);
                return x.toUpperCase();
            },
            lowercase: function(x){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'lowercase']);
                return x.toLowerCase();
            },
            matches: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'matches']);
                return x===y;
            },
            doesntMatch: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'doesntMatch']);
                return !(x===y);
            },
            startsWith: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'startsWith']);
                return (x.lastIndexOf(y, 0) === 0);
            },
            endsWith: function(x,y){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'endsWith']);
                return x.indexOf(y, x.length - y.length) !== -1;
            },
            alert: function(x){
                _gaq.push(['_trackEvent', 'Blocks', 'String', 'alert']);
                alert(x);
            },
        },

        text:{
            setFont: function (size, fontStyle){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'setFont']);
                var sizeString = size[0] + size[1];
                ctx().font = sizeString + " " + fontStyle;

            },
            textAlign: function (alignment){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'textAlign']);
                ctx().textAlign = alignment;
            },
            textBaseline: function (baseline){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'textBaseline']);
                ctx().textBaseline = baseline;
            },
            fillText: function (text, x, y){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'fillText']);
                ctx().fillText(text, x, y);
            },
            fillTextWidth: function (text, x, y, width){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'fillTextWidth']);
                ctx().fillText(text, x, y, width);
            },
            strokeText: function (text, x, y){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'strokeText']);
                ctx().strokeText(text, x, y);
            },
            strokeTextWidth: function (text, x, y, width){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'strokeTextWidth']);
                ctx().strokeText(text, x, y, width);
            },
            width: function (text){
                _gaq.push(['_trackEvent', 'Blocks', 'Text', 'width']);
                var textMetric = ctx().measureText(text);
                return textMetric.width;
            }
        }


    });

})(window);
