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

        color: {
            namedColor: function(name){
                // FIXME: We may need to return hex or other color value
                return name;
            },
            rgb: function(r,g,b){
                return 'rgb(' + r + ',' + g + ',' + b + ')';
            },
            rgba: function(r,g,b,a){
                return 'rgba(' + r + ',' + g + ',' + b + ',' + a/100 + ')';
            },
            grey: function(g){
                return 'rgb(' + g + ',' + g + ',' + g + ')';
            },
            hsl: function(h,s,l){
                return 'hsl(' + h + ',' + s + '%,' + l + '%)';
            },
            hsla: function(h,s,l,a){
                return 'hsl(' + h + ',' + s + '%,' + l + '%,' + a/100 + ')';
            },
            random: function(){
                return "#"+(~~(Math.random()*(1<<30))).toString(16).toUpperCase().slice(0,6);
            },
            fill: function(color){
                ctx().fillStyle = color;
            },
            stroke: function(color){
                ctx().strokeStyle = color;
            },
            shadow: function(color){
                ctx().shadowColor = color;
            }
        },

        control: {
            whenProgramRuns: function(args, containers){
                var self = this;
                containers[0].forEach(function(block){
                    block.run(self);
                });
            },
            whenKeyPressed: function(args, containers){
                var self = this;
                Event.onKeyDown(args[0], function(){
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                });
            },
            eachFrame: function(args, containers){
                var self = this;
                perFrameHandlers.push(function(){
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                });
            },
            frame: function(){
                return runtime.control._frame;
            },
            elapsed: function(){
                return runtime.control._elapsed;
            },
            setVariable: function(name, value){
                //FIXME: Make sure this is named properly
                // console.log('setting variable %s to value %s', name, value);
                this[name] = value;
            },
            getVariable: function(name){
                // console.log('get %s from %o', name, this);
                return this[name];
            },
            incrementVariable: function(variable, value){
                this[name] += value;
            },
            loopOver: function(args, containers) {
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
                // Handle with and without data
                Event.trigger(document.body, eventName, data);
            },
            receive: function(args, containers){
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
                if (args[0]){
                    var self = this;
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                }
            },
            ifElse: function(args, containers){
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
                return cond ? iftrue : otherwise;
            },
            log: function(item){
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

        image: {
            get: function(path){
                return images[path];
            },
            drawAtPoint: function(img, pt, w, h){
                ctx().drawImage(img, pt.x, pt.y, w, h);
            },
            drawAtPointWithSize: function(img, pt, sz){
                ctx().drawImage(img, pt.x, pt.y, sz.w, sz.h);
            },
            getScaledAtOrigin: function(path, sz){
                var img = images[path];
                return {
                    name: 'Image',
                    draw: function draw(inner_ctx){
                        inner_ctx.drawImage(img, -sz.w/2, -sz.h/2, sz.w, sz.h);
                    }
                };
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

        motion: {
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

        path:{

            lineTo: function(toPoint){return new util.Path(ctx().lineTo, new Array(toPoint.x, toPoint.y))},

            bezierCurveTo: function(toPoint, controlPoint1, controlPoint2){
                return new util.Path(ctx().bezierCurveTo, new Array(controlPoint1.x, controlPoint1.y,
                controlPoint2.x, controlPoint2.y, toPoint.x,
                toPoint.y));
            },
            moveTo: function(toPoint){
                return new util.Path(ctx().moveTo, new Array(toPoint.x, toPoint.y));
            },
            quadraticCurveTo: function(toPoint, controlPoint){
                return new util.Path(ctx().quadraticCurveTo, new Array(controlPoint.x,
                controlPoint.y,toPoint.x, toPoint.y));
            },
            arcTo: function(radius, controlPoint1, controlPoint2){
                return new util.Path(ctx().arcTo, new Array(controlPoint1.x,
                controlPoint1.y,controlPoint2.x, controlPoint2.y,
                radius));
            },
            closePath: function(){return new util.Path(ctx().closePath);},
            pathSet: function(args){return new util.Shape(arguments);},
            
            lineStyle: function(width, color, capStyle, joinStyle){
                ctx().lineWidth = width;
                ctx().strokeStyle = color;
                ctx().lineCap = capStyle;
                ctx().lineJoin = joinStyle;
            }

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

        random: {
            randFloat: Math.random,
            randInt: util.randInt,
            noise: util.noise,
            choice: util.choice
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

        shape: {
            fill: function(shapeArg){
                console.log(shapeArg);
                shapeArg.draw(ctx());
                ctx().fill();
            },
            stroke: function(shapeArg){
                shapeArg.draw(ctx());
                ctx().stroke();
            },
           
            circle: function(pt, rad){
                    ctx().beginPath();
                    ctx().arc(pt.x, pt.y, rad, 0, Math.PI * 2, true);
               
            },
            rectangle: function(pt, width, height, orientation){
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
                    ctx().beginPath();
                    ctx().ellipse(pt.x, pt.y, rad1, rad2, rot, 0, Math.PI * 2);
               
            },
            
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

        sound: {

            // sounds is the soundsForGames library that we wrap:
            // https://github.com/kittykatattack/soundForGames

            // called after pre-loader has loaded sound file
            init: function(url, result){
                // initialized by loader
                return sounds(url);
            },
            get: function(url){
                return sounds[url]; // already cached by sounds library
            },
            play: function(sound){
                sound.play();
            },
            setLoop: function(sound, flag){
                sound.loop = flag;
            },
            setVolume: function(sound, volume){
                sound.volume = volume;
            },
            pause: function(sound){
                sound.pause();
            },
            playFrom: function(sound, time){
                sound.playFrom(time);
            },
            pan: function(sound, balance){
                sound.pan = balance;
            },
            echo_DelayFeedbackFilter: function(sound, delay, feedback, filter){
                sound.setEcho(delay, feedback, filter);
            },
            stopEcho: function(sound){
                sound.echo = false;
            },
            reverb_DurationDecayReverse: function(sound, duration, decay, reverse){
                sound.setReverb(duration, decay, reverse);
            },
            stopReverb: function(sound){
                sound.reverb = false;
            },
            effect: function(frequency, attack, decay, waveform, volume, balance, wait, pitchBend, reverseBend, random, dissonance, echoDelay, echoFeedback, echoFilter){
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
            create: function(imgShapeOrText){
                return new Sprite(imgShapeOrText);
            },
            accelerate: function(spt, speed){
                spt.accelerate(speed);
            },
            rotate: function(spt, angle){
                spt.rotate(angle);
            },
            move: function(spt){
                spt.move();
            },
            draw: function(spt){
                spt.draw();
            },
            applyForce: function(spt, vec){
                spt.applyForce(vec);
            }
        },

        stage: {
        },

        string: {

            toString: function(x){ return x.toString() },
            split: function(x,y){ return x.split(y); },
            concatenate: function(x,y){ return x.concat(y); },
            repeat: function(x,n){
                var str = "";
                for(var i=0; i<n; i++){
                    str = str.concat(x);
                }
                return str;
            },
            getChar: function(n,x){ return x.charAt(n-1); },
            getCharFromEnd: function(n,x){ return x.charAt(x.length-n-1); },
            substring: function(x,a,b){ return x.substring(a-1,a+b-1); },
            substring2: function(x,a,b){ return x.substring(a-1,b) },
            isSubstring: function(x,y){
                if(y.indexOf(x)===-1){
                    return false;
                }
                else{
                    return true;
                }
            },
            substringPosition: function(x,y){ return y.indexOf(x)+1; },
            replaceSubstring: function(x,y,z){ return x.replace(y,z); },
            trimWhitespace: function(x){ return x.trim(); },
            uppercase: function(x){ return x.toUpperCase(); },
            lowercase: function(x){ return x.toLowerCase(); },
            matches: function(x,y){ return x===y; },
            doesntMatch: function(x,y){ return !(x===y); },
            startsWith: function(x,y){ return (x.lastIndexOf(y, 0) === 0); },
            endsWith: function(x,y){ return x.indexOf(y, x.length - y.length) !== -1; },
            alert: function(x){ alert(x); },
            comment: function(args, containers){},
        },


        text:{
            setFont: function (size, fontStyle){
                var sizeString = size[0] + size[1];
                ctx.font = sizeString + " " + fontStyle;

            },
            textAlign: function (alignment){ctx.textAlign = alignment;},
            textBaseline: function (baseline){ctx.textBaseline = baseline;},
            fillText: function (text, x, y){ctx.fillText(text, x, y);},
            fillTextWidth: function (text, x, y, width){ctx.fillText(text, x, y, width);},
            strokeText: function (text, x, y){ctx.strokeText(text, x, y);},
            strokeTextWidth: function (text, x, y, width){ctx.strokeText(text, x, y, width);},
            width: function (text){
                var textMetric = ctx.measureText(text);
                return textMetric.width;
            }
        }


    });

})(window);
