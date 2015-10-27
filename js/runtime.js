(function(global){
    'use strict';

    // Dependencies: ctx, canvas, Event, runtime, sound, soundEffect,
    // canvas/stage stuff
    var _canvas, _ctx;
    function canvas(){
        if (!_canvas){
            if (dom.find){
                _canvas = dom.find('canvas');
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

    function getContext(){
        // returns CanvasContext
        if (!_ctx){
            _ctx = canvas().getContext('2d');
            // Save the default state.
            _ctx.strokeStyle = 'transparent';
            _ctx.save();
        }
        return _ctx;
    }
    function resetCanvas() {
        // No context to reset!
        if (!_ctx) {
            return;
        }

        var el = canvas();
        var ctx = getContext();
        ctx.clearRect(0, 0, el.width, el.height);
        // Restore the default state and push it back on the stack again.
        ctx.restore();
        ctx.strokeStyle = 'transparent';
        ctx.save();
    }

    Event.on(window, 'ui:load', null, function(){
        handleResize();
    }, false);

    function handleResize(){
        if(dom.find('wb-playground > canvas')){ //only resize if the canvas is in the playground
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
    }

    function canvasRect(){
        return new util.Rect(0,0,Event.stage.width,Event.stage.height);
    }

    function clearRuntime() {
        /* FIXME: Event.clearRuntime() should be moved to runtime.js.
         * See: https://github.com/waterbearlang/waterbear/issues/968 */
        Event.clearRuntime();
        clearPerFrameHandlers();
        /* Clear all runtime event handlers. */
        Event.off(null, 'runtime:*');
    }

    var perFrameHandlers;
    var lastTime;
    var animationFrameHandler;

    function clearPerFrameHandlers() {
        perFrameHandlers = [];
        if (animationFrameHandler){
            cancelAnimationFrame(animationFrameHandler);
            animationFrameHandler = null;
        }
    }

    // Initialize the stage.
    Event.on(window, 'ui:resize', null, handleResize);
    Event.on(document.body, 'ui:wb-resize', null, handleResize);

    function startEventLoop(){
        clearPerFrameHandlers();
        lastTime = new Date().valueOf();
        runtime.control._startTime = lastTime;
        runtime.control._frame = 0;
        runtime.control._sinceLastTick = 0;
        animationFrameHandler = requestAnimationFrame(frameHandler);
    }

    function stopEventLoop() {
        /* TODO: Dunno lol there be more in here? */
    }

    function frameHandler(timestamp){
        // where to put these? Event already has some global state.
        if (lastTime === timestamp){
            throw new Exception('There can be only one!');
        }
        runtime.control._elapsed = timestamp - runtime.control._startTime;
        runtime.control._sinceLastTick = timestamp - lastTime;
        runtime.control._frame++;
        lastTime = timestamp;
        perFrameHandlers.forEach(function(handler){
            handler();
        });
        if (perFrameHandlers.length){
            animationFrameHandler = requestAnimationFrame(frameHandler);
        }
    }


    // for all of these functions, `this` is the scope object
    //
    // Contents of runtime (please add new handlers alphabetically)
    //
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

    global.runtime = {
        startEventLoop: startEventLoop,
        stopEventLoop: stopEventLoop,
        clear: clearRuntime,
        resetCanvas: resetCanvas, // deprecated - refer to "canvas" as "stage"
        getStage: canvas,
        resetStage: resetCanvas,
        handleResize: handleResize,

        local: {
            //temporary fix for locals
            value: function(){
                return this.value;
            }
        },

        array: {
            create: function arrayCreateExpr(){
                return [].slice.call(arguments);
            },
            copy: function arrayCopyExpr(a){
                return a.slice();
            },
            itemAt: function arrayItemFromExpr(a,i){
                return a[i];
            },
            join: function arrayJoinExpr(a,s){
                return a.join(s);
            },
            append: function arrayAppendStep(a,item){
                a.push(item);
            },
            prepend: function arrayPrependStep(a,item){
                a.unshift(item);
            },
            length: function arrayLengthExpr(a){
                return a.length;
            },
            removeItem: function arrayRemoveItemStep(a,i){
                a.splice(i,1);
            },
            pop: function arrayPopExpr(a){
                return a.pop();
            },
            shift: function arrayShiftExpr(a){
                return a.shift();
            },
            reverse: function arrayReverseExpr(a){
                return a.reverse();
            }
        },

        'boolean': {
            'true': function booleanTrue(){
                return true;
            },
            'false': function booleanFalse(){
                return false;
            },
            and: function booleanAndExpr(a,b){
                return a && b;
            },
            or: function booleanOrExpr(a,b){
                return a || b;
            },
            xor: function booleanXorExpr(a,b){
                return !a !== !b;
            },
            not: function booleanNotExpr(a){
                return !a;
            }
        },
        color: {
            namedColor: function colorNamedExpr(name){
                // FIXME: We may need to return hex or other color value
                return name;
            },
            rgb: function colorRGBExpr(r,g,b){
                return 'rgb(' + r + ',' + g + ',' + b + ')';
            },
            rgba: function colorRGBAExpr(r,g,b,a){
                return 'rgba(' + r + ',' + g + ',' + b + ',' + a/100 + ')';
            },
            grey: function colorGreyExpr(g){
                return 'rgb(' + g + ',' + g + ',' + g + ')';
            },
            hsl: function colorHSLExpr(h,s,l){
                return 'hsl(' + h + ',' + s + '%,' + l + '%)';
            },
            hsla: function colorHSLAExpr(h,s,l,a){
                return 'hsl(' + h + ',' + s + '%,' + l + '%,' + a/100 + ')';
            },
            random: function colorRandomExpr(){
                return "#"+(~~(Math.random()*(1<<30))).toString(16).toUpperCase().slice(0,6);
            },
            fill: function colorFillStep(color){
                getContext().fillStyle = color;
            },
            stroke: function colorStrokeStep(color){
                getContext().strokeStyle = color;
            },
            shadow: function colorShadowStep(color, blur){
                getContext().shadowColor = color;
                getContext().shadowBlur = blur;
            }
        },

        control: {
            eachFrame: function controlEachFrameCtx(args, containers){
                var self = this;
                perFrameHandlers.push(function runFrame(){
                    containers[0].forEach(function runBoundBlock(block){
                        block.run(self);
                    });
                });
            },
            frame: function controlFrameExpr(){
                return runtime.control._frame;
            },
            elapsed: function controlElapsedExpr(){
                return runtime.control._elapsed;
            },
            setVariable: function controlSetVariableStep(nameValuePair){
                //FIXME: Make sure this is named properly
                var name = nameValuePair[0];
                var value = nameValuePair[1];
                this[name] = value;
            },
            getVariable: function controlGetVariableExpr(name){
                return this[name];
            },
            updateVariable: function controlUpdateVariableStep(values){
                // this is one of the rare times we need access to the element
                var scope = this; // get ready to walk up the scope tree
                var oldValue = values[0];
                var newValue = values[1];
                var variableName = dom.find(scope._block, 'wb-value').getValue();
                while( scope !== null){
                    if (scope.hasOwnProperty(variableName)){
                        console.assert(scope[variableName] === oldValue);
                        scope[variableName] = newValue;
                        break;
                    }
                    scope = Object.getPrototypeOf(scope);
                }
                if (scope === null){
                    alert('something went horribly wrong, no variable to set. Old value: ' + oldValue + ', newValue: ' + newValue);
                }
            },
            // FIXME: This doesn't seem to have a block
            incrementVariable: function controlIncrementVariableExpr(variable, value){
                this[name] += value;
            },
            loopOver: function controlLoopOverCtx(args, containers) {
                // FIXME: this has to work over arrays, strings, objects, and numbers
                var self = this;
                var list = args[0];
                var indexName = args[1][0];
                var valueName = args[1][1];
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
                    case 'boolean':
                        var listName = this._block.gatherValues(this)[0];
                        len = list ? Infinity : 0
                        break;
                    default:
                        type: 'boolean';
                        list: false;
                        len: 0;
                        break;
                }

                /* For every element in the container place
                 * the index and value into the scope. */
                for (i = 0; i < len; i++){
                    switch(type){
                        // FIXME: Get names of index & value from block
                        case 'array': // fall through
                        case 'string':
                            this[indexName] = i;
                            this[valueName] = list[i];
                            break;
                        case 'object':
                            this[indexName] = keys[i];
                            this[valueName] = list[this.key];
                            break;
                        case 'number':
                            this[indexName] = i;
                            this[valueName] = i;
                            break;
                        case 'boolean':
                            this[indexName] = i;
                            this[valueName] = i;
                            list = this[listName];
                            if (!list){
                                // hopefully this will handle the case where the value changes after starting the loop
                                return;
                            }
                            break;
                    }
                    containers[0].forEach(runBlock);
                }

                function runBlock(block){
                    block.run(self);
                }
            },
            broadcast: function controlBroadcastStep(eventName, data){
                // Handle with and without data
                Event.trigger(document.body, eventName, data);
            },
            receive: function controlReceiveCtx(args, containers){
                // Handle with and without data
                // Has a local for the data
                var self = this;
                Event.on(document.body, 'runtime:' + args[0], null, function(evt){
                    // FIXME: how do I get the local from here?
                    // As an arg would be easiest
                    self[args[1]] = evt.detail;
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                });
            },
            'if': function controlIfCtx(args, containers){
                if (args[0]){
                    var self = this;
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                }
            },
            ifElse: function controlIfElseCtx(args, containers){
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
            ternary: function controlTernaryCtx(cond, iftrue, otherwise){
                return cond ? iftrue : otherwise;
            },
            ask: function controlAskStep(args){
                // Shouldn't this be a context? Or have an on-message handler?
                var message = args[0];
                var name = args[1];
                var answer = prompt(message);
                runtime.control.setVariable(name, answer);
            },
            comment: function controlCommentStep(){
                // do nothing, it's a comment
            },
            log: function controlLogStep(item){
                console.log(item);
            },
            alert: function controlAlertStep(x){
                alert(x);
            },
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
                var currentScope = this;
                var steps = containers[0];

                Event.on(window, 'runtime:locationchanged', null, function (event) {
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
                return assets.images[path];
            },
            drawAtPoint: function(img, pt){
                img.drawAtPoint(getContext(), pt);
            },
            getWidth: function(img){
                return img.getWidth();
            },
            getHeight: function(img){
                return img.getHeight();
            },
            setWidth: function(img, w){
                img.setWidth(w);
            },
            setHeight: function(img, h){
                img.setHeight(h);
            },
            setSize: function(img, sz){
                img.setSize(sz);
            },
            scale: function(img, scaleFactor){
                img.scale(scaleFactor);
            }
        },
        input: {
            keyPressed: function(key){
                if(Event.keys[key])
                    return true;
                else
                    return false;
            },
            mouseX: function(){
                return (Event.pointerX-Event.stage.left);
            },
            mouseY: function(){
                return (Event.pointerY-Event.stage.top);
            },
            mouseDown: function(){
                return Event.pointerDown;
            },
            whenKeyPressed: function(args, containers){
                var self = this;
                Event.onKeyDown(args[0], function(){
                    containers[0].forEach(function(block){
                        block.run(self);
                    });
                });
            },
        },

        math: {
            add: util.add,
            subtract: util.subtract,
            multiply: util.multiply,
            divide: util.divide,
            equal: util.equal,
            notEqual: util.notEqual,
            lt: function(a,b){
                return a < b;
            },
            lte: function(a,b){
                return a <= b;
            },
            gt: function(a,b){
                return a > b;
            },
            gte: function(a,b){
                return a >= b;
            },
            mod: function(a,b){
                return a % b;
            },
            round: Math.round,
            abs: Math.abs,
            sgn: Math.sign || function(a) {
            	if(a == 0) return 0;
            	return a / Math.abs(a);
            },
            floor: Math.floor,
            ceil: Math.ceil,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt || function(a) {
            	return Math.pow(a,1/3);
            },
            root: function(a,b) {
            	return Math.pow(a, 1/b);
            },
            log: function(val,base) {
            	return Math.log(val) / Math.log(base);
            },
            max: function(a){
            	return Math.max.apply(Math,a);
            },
            min: function(a){
            	return Math.min.apply(Math,a);
            },
            cos: function(a){
                return Math.cos(util.deg2rad(a));
            },
            sin: function(a){
                return Math.sin(util.deg2rad(a));
            },
            tan: function(a){
                return Math.tan(util.deg2rad(a));
            },
            asin: function(a){
                return Math.asin(util.deg2rad(a));
            },
            acos: function(a){
                return Math.acos(util.deg2rad(a));
            },
            atan: function(a){
                return Math.atan(util.deg2rad(a));
            },
            pow: function(a,b){
                return Math.pow(a, b);
            },
            pi: function(){
                return Math.PI;
            },
            e: function(){
                return Math.E;
            },
            tau: function(){
                return Math.PI * 2;
            },
            deg2rad: util.deg2rad,
            rad2deg: util.rad2deg,
            stringToNumber: Number
        },

        motion: {
            /* Asynchronous update event. Context. */
            whenDeviceTurned: function(args, containers) {
                var currentScope = this,
                steps = containers[0];

                Event.on(window, 'runtime:motionchanged', null, function (event) {
                    if (args[0] === util.motion.direction) {
                        steps.forEach(function (block) {
                            block.run(currentScope);
                        });
                    }
                });
            },
            /* Synchronous "get current location" */
            tiltDirection: function(){
                return util.motion.direction;
            }
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

            lineTo: function(toPoint){
                return new util.Path(getContext().lineTo, new Array(toPoint.x, toPoint.y))
            },

            bezierCurveTo: function(toPoint, controlPoint1, controlPoint2){
                return new util.Path(getContext().bezierCurveTo, new Array(controlPoint1.x, controlPoint1.y,
                    controlPoint2.x, controlPoint2.y, toPoint.x,
                    toPoint.y));
            },
            moveTo: function(toPoint){
                return new util.Path(getContext().moveTo, new Array(toPoint.x, toPoint.y));
            },
            quadraticCurveTo: function(toPoint, controlPoint){
                return new util.Path(getContext().quadraticCurveTo, new Array(controlPoint.x,
                                                                       controlPoint.y,toPoint.x, toPoint.y));
            },
            arcTo: function(radius, controlPoint1, controlPoint2){
                return new util.Path(getContext().arcTo, new Array(controlPoint1.x,
                                                            controlPoint1.y,controlPoint2.x, controlPoint2.y,
                                                            radius));
            },
            closePath: function(){
                return new util.Path(getContext().closePath);
            },
            pathSet: function(args){
                return new util.Shape(Array.prototype.slice.call(arguments));
            },

            lineStyle: function(width, color, capStyle, joinStyle){
                getContext().lineWidth = width;
                getContext().strokeStyle = color;
                getContext().lineCap = capStyle;
                getContext().lineJoin = joinStyle;
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
            getPosition: function (rect) {
                return rect.getPosition();
            },
            getSize: function (rect) {
                return rect.getSize();
            },
            asArray: function (rect) {
                return [rect.x, rect.y, rect.size.width, rect.size.height];
            },
            getX: function (rect) {
                return rect.x;
            },
            getY: function (rect) {
                return rect.y;
            },
            getWidth: function (rect) {
                return rect.size.width;
            },
            getHeight: function (rect) {
                return rect.size.height;
            }
        },

        shape: {
            draw: function(shapeArg){
                shapeArg.draw(getContext());
            },
            fill: function(shapeArg){
                shapeArg.draw(getContext());
                getContext().fill();
            },
            stroke: function(shapeArg){
                shapeArg.draw(getContext());
                getContext().stroke();
            },
            setLineWidth: function(width){
                getContext().lineWidth = width;
            },
            circle: function circle(pt, rad){
                return new util.Shape(function(ctx){
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2, true);
                    this.radius = rad;
                });
            },
            rectangle: function rectangle(pt, width, height, orientation){
                return new util.Shape(function(ctx){
                    ctx.beginPath();
                    var x = 0;
                    var y = 0;
                    if(orientation == "center"){
                        x = pt.x - width/2;
                        y = pt.y - height/2;
                        this.centered = true;
                    }
                    else{
                        x = pt.x;
                        y = pt.y;
                        this.centered = false;
                    }

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + width, y);
                    ctx.lineTo(x + width, y + height);
                    ctx.lineTo(x, y + height);
                    ctx.lineTo(x, y);

                    this.width = width;
                    this.height = height;
                });
            },
            ellipse: function(pt, rad1, rad2, rot){
                return new util.Shape(function(ctx){
                    ctx.beginPath();
                    ctx.ellipse(pt.x, pt.y, rad1, rad2, rot, 0, Math.PI * 2);
                });
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
            getWidth: function (size) {
                return size.width;
            },
            getHeight: function (size) {
                return size.height;
            }
        },

        sound: {

            get: function(url){
                return assets.sounds[url]; // already cached by sounds library
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
            effect: function(frequency, attack, decay, wait, echoDelay, echoFeedback, echoFilter, waveform, volume, balance, pitchBend, reverseBend, random, dissonance){
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
            create: function create(imgShapeOrSprite){
                return new util.Sprite(imgShapeOrSprite);
            },
            accelerate: function accelerate(spt, speed){
                spt.accelerate(speed);
            },
            setVelocity: function setVelocity(spt, vec){
                spt.setVelocity(vec);
            },
            getVelocity: function spriteGetVelocityExpr(spt){
                return spt.velocity;
            },
            getSpeed: function spriteGetSpeedExpr(spt){
                return spt.velocity.magnitude();
            },
            getXvel: function getXvel(spt){
                return spt.getXvel();
            },
            getYvel: function getYvel(spt){
                return spt.getYvel();
            },
            getXpos: function getXpos(spt){
                return spt.getXpos();
            },
            getYpos: function getYpos(spt){
                return spt.getYpos();
            },
            rotate: function rotate(spt, angle){
                spt.rotate(angle);
            },
            rotateTo: function rotateTo(spt, angle){
                spt.rotateTo(angle);
            },
            move: function move(spt){
                spt.move();
            },
            moveTo: function moveTo(spt, pt){
                spt.moveTo(pt);
            },
            draw: function draw(spt){
                spt.draw(getContext());
            },
            applyForce: function applyForce(spt, vec){
                spt.applyForce(vec);
            },
            bounceAtEdge: function bounceAtEdge(spt){
                spt.bounceWithinRect(canvasRect());
            },
            wrapAtEdge: function wrapAtEdge(spt){
                spt.wrapAroundRect(canvasRect());
            },
            stopAtEdge: function stopAtEdge(spt){
                spt.stayWithinRect(canvasRect());
            },
            checkForCollision: function checkForCollision(spt1, spt2){
                return spt1.checkForCollision(spt2);
            }
        },
        stage: {
            clearTo: new util.Method()
                .when(['string'], function(clr){ // unfortunately colors are still strings
                    var r = canvasRect();
                    var c = getContext();
                    c.save();
                    c.fillStyle = clr;
                    c.fillRect(r.x, r.y, r.width, r.height);
                    c.restore();
                })
                .when(['wbimage'], function(img){
                    var c = getContext();
                    c.save();
                    img.drawInRect(c, canvasRect());
                    c.restore();
                })
                .when(['shape'], function(shape){
                    var c = getContext();
                    c.save();
                    shape.draw(c);
                    c.restore();
                })
            .fn(),
            stageWidth: function(){
                return Event.stage.width;
            },
            stageHeight: function(){
                return Event.stage.height;
            },
            centerX: function(){
                return (Event.stage.width / 2);
            },
            centerY: function(){
                return (Event.stage.height / 2);
            },
            centerPoint: function(){
                return new util.Vector(Event.stage.width / 2, Event.stage.height / 2);
            },
            randomX: function(){
                return Math.random() * Event.stage.width;
            },
            randomY: function(){
                return Math.random() * Event.stage.height;
            },
        },
        string: {

            toString: function(x){
                return x.toString();
            },
            split: function(x,y){
                return x.split(y);
            },
            concatenate: function(x,y){
                return x.concat(y);
            },
            repeat: function(x,n){
                var str = "";
                for(var i=0; i<n; i++){
                    str = str.concat(x);
                }
                return str;
            },
            getChar: function(n,x){
                if(n<0)
                    n = x.length + n;

                return x.charAt(n);
            },
            getCharFromEnd: function(n,x){
                if(n<=0)
                    n = n*(-1)-1;
                else
                    n = x.length-n;
                return x.charAt(n);
            },
            substring: function(x,a,b){
                if(a<0)
                    return "";
                else
                    return x.substring(a,a+b);
            },
            substring2: function(x,a,b){
                if(a<0 || a>x.length)
                    return "";
                else
                    return x.substring(a,b);
            },
            isSubstring: function(x,y){
                if(y.indexOf(x)===-1){
                    return false;
                }
                else{
                    return true;
                }
            },
            substringPosition: function(x,y){
                return y.indexOf(x);
            },
            replaceSubstring: function(x,y,z){
                return x.replace(new RegExp(y, 'g'), z);
            },
            trimWhitespace: function(x){
                return x.trim();
            },
            uppercase: function(x){
                return x.toUpperCase();
            },
            lowercase: function(x){
                return x.toLowerCase();
            },
            matches: function(x,y){
                return x===y;
            },
            doesntMatch: function(x,y){
                return !(x===y);
            },
            startsWith: function(x,y){
                return (x.lastIndexOf(y, 0) === 0);
            },
            endsWith: function(x,y){
                return x.indexOf(y, x.length - y.length) !== -1;
            },
            setFont: function (size, fontStyle){
                var sizeString = size[0] + size[1];
                getContext().font = sizeString + " " + fontStyle;

            },
            textAlign: function (alignment){
                getContext().textAlign = alignment;
            },
            textBaseline: function (baseline){
                getContext().textBaseline = baseline;
            },
            fillText: function (text, x, y){
                getContext().fillText(text, x, y);
            },
            fillTextWidth: function (text, x, y, width){
                getContext().fillText(text, x, y, width);
            },
            strokeText: function (text, x, y){
                getContext().strokeText(text, x, y);
            },
            strokeTextWidth: function (text, x, y, width){
                getContext().strokeText(text, x, y, width);
            },
            width: function (text){
                var textMetric = getContext().measureText(text);
                return textMetric.width;
            }
        },
        vector: {
            create: function create(x,y){
                return new util.Vector(x,y);
            },
            createPolar: function createPolar(deg, mag){
                return util.Vector.fromPolar(deg, mag);
            },
            fromArray: function fromArray(arr){
                return new util.Vector(arr[0], arr[1]);
            },
            toArray: function toArray(vec){
                return [vec.x, vec.y];
            },
            randomPoint: function randomPoint(){
                return new util.Vector(util.randInt(Event.stage.width), util.randInt(Event.stage.height));
            },
            unitVector: function unitVector(){
                return new util.Vector(1,1);
            },
            zeroVector: function zeroVector(){
                return new util.Vector(0,0);
            },
            rotateTo: function rotateTo(vec, deg){
                return vec.rotateTo(deg);
            },
            rotate: function rotate(vec, deg){
                return vec.rotate(deg);
            },
            magnitude: function magnitude(vec){
                return vec.magnitude();
            },
            degrees: function degrees(vec){
                return vec.degrees();
            },
            normalize: function normalize(vec){
                return vec.normalize();
            },
            x: function x(vec){
                return vec.x;
            },
            y: function y(vec){
                return vec.y;
            },
            randomUnitVector: function randomUnitVector(){
                var vec = util.Vector.fromPolar(Math.random() * 360, 1);
                return vec;
            }
        },
        date: {
            create: function (year, month, day) {
                return new Date(year, month-1, day);
            },
            now: function () {
                var today = new Date();
                // Seems like "now" should have time as well, but
                // maybe "today" shouldn't?
                today.setHours(0, 0, 0, 0)
                return today;
            },
            addDays: function (prevDate, days) {
                // we don't want to mutate an argument in place
                var date = new Date(prevDate.valueOf()); // clone argument
                date.setDate(prevDate.getDate() + days);
                return date;
            },
            addMonths: function (prevDate, months) {
                var date = new Date(prevDate.valueOf());
                date.setMonth(date.getMonth() + months);
                return date;
            },
            addYears: function (prevDate, years) {
                var date = new Date(prevDate.valueOf());
                date.setFullYear(date.getFullYear() + years);
                return date;
            },
            dayOfWeek: function(date) {
                var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return days[date.getDay()];
            },
            getDay: function(date) {
                return date.getDate();
            },
            getMonth: function(date) {
                return date.getMonth()+1;
            },
            getMonthName: function(date) {
                var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                              'August', 'September', 'October', 'November', 'December'];
                return months[date.getMonth()];
            },
            getYear: function(date) {
                return date.getFullYear();
            },
            formattedDate: function(date) {
                return date.toLocaleDateString();
            }
        }
    };


})(window);
