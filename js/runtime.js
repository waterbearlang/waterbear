(function(global) {
    'use strict';

    // Dependencies: ctx, canvas, Event, runtime
    // canvas/stage stuff
    var _canvas, _ctx;
    var song = "o4 l4 V12 ";
    var current_octave = 4;

    function canvas() {
        if (!_canvas) {
            if (dom.find) {
                _canvas = dom.find('canvas');
            }
            if (!_canvas) {
                // We're not running in Waterbear
                // Just put a canvas in so tests pass
                _canvas = document.createElement('canvas');
                _canvas.setAttribute('width', '200');
                _canvas.setAttribute('height', '200');
            }
        }
        return _canvas;
    }

    function getContext() {
        // returns CanvasContext
        if (!_ctx) {
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

        util.setLastPoint(new util.Vector(0, 0));
    }

    Event.on(window, 'ui:load', null, function() {
        handleResize();
    }, false);

    function handleResize() {
        if (dom.find('wb-playground > canvas')) { //only resize if the canvas is in the playground
            var can = canvas();
            can.removeAttribute('height');
            var rect = can.parentElement.getBoundingClientRect();
            Event.stage = {
                // FIXME: Move these to runtime.stage
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                bottom: Math.round(rect.bottom),
                width: Math.round(rect.right) - Math.round(rect.left),
                height: Math.round(rect.bottom) - Math.round(rect.top)
            };
            can.setAttribute('width', Event.stage.width);
            can.setAttribute('height', Event.stage.height);
        }
    }

    function canvasRect() {
        return new util.Rect(0, 0, Event.stage.width, Event.stage.height);
    }

    function clearRuntime() {
        /* FIXME: Event.clearRuntime() should be moved to runtime.js.
         * See: https://github.com/waterbearlang/waterbear/issues/968 */
        Event.clearRuntime();
        clearPerFrameHandlers();
        /* Clear all runtime event handlers. */
        Event.off(null, 'runtime:*');
        for (var prop in assets.sounds) {
            if (!assets.sounds.hasOwnProperty(prop)) {
                continue;
            }
            assets.sounds[prop].pause();
        }
    }

    // utility for iterating over child blocks
    function runBlock(block) {
        block.run(self);
    }

    var perFrameHandlers;
    var lastTime;
    var animationFrameHandler;

    function clearPerFrameHandlers() {
        perFrameHandlers = [];
        if (animationFrameHandler) {
            cancelAnimationFrame(animationFrameHandler);
            animationFrameHandler = null;
        }
    }

    // Initialize the stage.
    Event.on(window, 'ui:resize', null, handleResize);
    Event.on(document.body, 'ui:wb-resize', null, handleResize);

    function startEventLoop() {
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

    function frameHandler(timestamp) {
        // where to put these? Event already has some global state.
        if (lastTime === timestamp) {
            throw new Exception('There can be only one!');
        }
        runtime.control._elapsed = timestamp - runtime.control._startTime;
        runtime.control._sinceLastTick = timestamp - lastTime;
        runtime.control._frame++;
        lastTime = timestamp;
        perFrameHandlers.forEach(function(handler) {
            handler();
        });
        if (perFrameHandlers.length) {
            animationFrameHandler = requestAnimationFrame(frameHandler);
        }
    }


    // for all of these functions, `this` is the block object
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

        // All Contexts, for reference:
        // * control.eachFrame
        // * control.loopOver
        // * control.receive
        // * control.if
        // * control.ifElse
        // * control.comment
        // * input.whenKeyPressed
        // * geolocation.whenLocationUpdated

        local: {
            // temporary fix for locals
            // is this still used anywhere?
            value: function() {
                return this.value;
            }
        },

        array: {
            create: function arrayCreateExpr() {
                return [].slice.call(arguments);
            },
            copy: function arrayCopyExpr(a) {
                return a.slice();
            },
            itemAt: function arrayItemFromExpr(a, i) {
                return a[i];
            },
            join: function arrayJoinExpr(a1, a2) {
                return a1.concat(a2);
            },
            makeString: function arrayMakeStringExpr(a, s) {
                return a.join(s);
            },
            append: function arrayAppendStep(a, item) {
                a.push(item);
            },
            prepend: function arrayPrependStep(a, item) {
                a.unshift(item);
            },
            length: function arrayLengthExpr(a) {
                return a.length;
            },
            removeItem: function arrayRemoveItemStep(a, i) {
                a.splice(i, 1);
            },
            pop: function arrayPopExpr(a) {
                return a.pop();
            },
            shift: function arrayShiftExpr(a) {
                return a.shift();
            },
            reverse: function arrayReverseExpr(a) {
                return a.reverse();
            }
        },

        'boolean': {
            'true': function booleanTrue() {
                return true;
            },
            'false': function booleanFalse() {
                return false;
            },
            and: function booleanAndExpr(a, b) {
                return a && b;
            },
            or: function booleanOrExpr(a, b) {
                return a || b;
            },
            xor: function booleanXorExpr(a, b) {
                return Boolean(a) !== Boolean(b);
            },
            not: function booleanNotExpr(a) {
                return !a;
            }
        },
        color: {
            namedColor: function colorNamedExpr(name) {
                // FIXME: We may need to return hex or other color value
                return name;
            },
            rgb: function colorRGBExpr(r, g, b) {
                return 'rgb(' + r + ',' + g + ',' + b + ')';
            },
            rgba: function colorRGBAExpr(r, g, b, a) {
                return 'rgba(' + r + ',' + g + ',' + b + ',' + a / 100 + ')';
            },
            grey: function colorGreyExpr(g) {
                return 'rgb(' + g + ',' + g + ',' + g + ')';
            },
            hsl: function colorHSLExpr(h, s, l) {
                return 'hsl(' + h + ',' + s + '%,' + l + '%)';
            },
            hsla: function colorHSLAExpr(h, s, l, a) {
                return 'hsl(' + h + ',' + s + '%,' + l + '%,' + a / 100 + ')';
            },
            random: function colorRandomExpr() {
                return "#" + (~~(Math.random() * (1 << 30))).toString(16).toUpperCase().slice(0, 6);
            },
            fill: function colorFillStep(color) {
                getContext().fillStyle = color;
            },
            stroke: function colorStrokeStep(color) {
                getContext().strokeStyle = color;
            },
            shadow: function colorShadowStep(color, blur) {
                getContext().shadowColor = color;
                getContext().shadowBlur = blur;
            }
        },

        control: {
            eachFrame: function controlEachFrameCtx() {
                var self = this;
                perFrameHandlers.push(function runFrame() {
                    var steps = self.gatherSteps();
                    steps.forEach(runBlock);
                });
            },
            frame: function controlFrameExpr() {
                return runtime.control._frame;
            },
            elapsed: function controlElapsedExpr() {
                return runtime.control._elapsed;
            },
            setVariable: function controlSetVariableStep() {
                this.getLocals()[0]._currentValue = this.gatherValues()[0];
            },
            getVariable: function controlGetVariableExpr(name) {
                var local = this.localOrSelf();
                if (typeof(local._currentValue) !== undefined) {
                    return local._currentValue;
                }
                return local.run();
            },
            updateVariable: function controlUpdateVariableStep() {
                // Do I need to find the setVariable block and set the value there?
                var row = this.gatherArguments()[0];
                var instance = row.firstElementChild.lastElementChild;
                var local = instance.localOrSelf();
                local._currentValue = row.lastElementChild.getValue()[0];
            },
            // FIXME: This doesn't seem to have a block
            incrementVariable: function controlIncrementVariableExpr(variable, value) {
                this[name] += value;
            },
            loopOver: function controlLoopOverCtx() {
                // FIXME: this has to work over arrays, strings, objects, and numbers
                var listElem = this.gatherArguments()[0];
                var list = listElem.getValue()[0];
                var locals = this.getLocals();
                var index = locals[0];
                var value = locals[1];
                var type = util.type(list);
                var i = 0,
                    len, keys;
                switch (type) {
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
                        len = list ? Infinity : 0;
                }

                /* For every element in the container place
                 * the index and value into the scope. */
                for (i = 0; i < len; i++) {
                    list = listElem.getValue()[0];
                    switch (type) {
                        // FIXME: Get names of index & value from block
                        case 'array': // fall through
                        case 'string':
                            index.setValue(i);
                            value.setValue(list[i]);
                            break;
                        case 'object':
                            index.setValue(keys[i]);
                            value.setValue(list[this.key]);
                            break;
                        case 'number':
                            index.setValue(i);
                            value.setValue(i);
                            break;
                        case 'boolean':
                            index.setValue(i);
                            value.setValue(list);
                            if (!list) {
                                // handle the case where the value changes after starting the loop
                                return;
                            }
                            break;
                    }
                    this.gatherSteps().forEach(runBlock);
                }
            },
            broadcast: function controlBroadcastStep(messageName, data) {
                // Handle with and without data
                Event.trigger(document.body, messageName, data);
            },
            receive: function controlReceiveCtx(messageName) {
                // Handle with and without data
                // Has a local for the data
                var self = this;
                Event.on(document.body, 'runtime:' + args[0], null, function(evt) {
                    // FIXME: how do I get the local from here?
                    // As an arg would be easiest
                    var local = self.locals()[0];
                    local.setValue(evt.detail);
                    self.gatherSteps().forEach(runBlock);
                });
            },
            'if': function controlIfCtx(predicate) {
                if (predicate) {
                    this.gatherSteps().forEach(runBlock);
                }
            },
            ifElse: function controlIfElseCtx(predicate) {
                if (predicate) {
                    this.gatherSteps().forEach(runBlock);
                } else {
                    this.gatherContains()[1].forEach(runBlock);
                }
            },
            ternary: function controlTernaryExpr(cond, iftrue, otherwise) {
                var args = this.gatherArguments();
                cond = args[0].getValue();
                return cond ? args[1].getValue() : args[2].getValue();
            },
            ask: function controlAskStep(message, name) {
                var answer = prompt(message);
                this.getLocals()[0]._currentValue = answer;
            },
            comment: function controlCommentCtx() {
                // do nothing, it's a comment
            },
            log: function controlLogStep(item) {
                console.log(item);
            },
            alert: function controlAlertStep(x) {
                alert(x);
            },
        },


        /*
         * The underlying JavaScript object is the same object that is passed
         * to the getCurrentLocation callback.
         */
        geolocation: {
            /* Synchronous "get current location" */
            currentLocation: function geoLocationCurrentLocationExpr() {
                return util.geolocation.currentLocation;
            },
            /* Asynchronous update event. Context. */
            whenLocationUpdated: function geoWhenLocationUpdatedCtx() {
                var self = this;
                Event.on(window, 'runtime:locationchanged', null, function(event) {
                    // TODO: probably factor out augmenting scope and running
                    // the block stuff to somewhere else.
                    // FIXME: save event values for access
                    // FIXME: update the location object?
                    self.gatherSteps().forEach(runBlock);
                });
            },
            // Returns the distance between two points in meters.
            // taken from http://www.movable-type.co.uk/scripts/latlong.html
            // Using the haversine formula.
            distanceBetween: function geoDistanceBetweenExpr(p1, p2) {
                var R = 6371000; // m
                var lat1 = p1.coords.latitude;
                var lon1 = p1.coords.longitude;
                var lat2 = p2.coords.latitude;
                var lon2 = p2.coords.longitude;

                var φ1 = util.deg2rad(lat1);
                var φ2 = util.deg2rad(lat2);
                var Δφ = util.deg2rad(lat2 - lat1);
                var Δλ = util.deg2rad(lon2 - lon1);

                var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                return R * c;
            },
            /* Returns latitude in degrees. */
            // TODO: should this return a "degrees" object?
            latitude: function geoLatitudeExpr(location) {
                return location.coords.latitude;
            },
            /* Returns longitude in degrees. */
            // TODO: should this return a "degrees" object?
            longitude: function geoLongitudeExpr(location) {
                return location.coords.longitude;
            },
            /* Returns altitude as a unit? */
            altitude: function geoAltitudeExpr(location) {
                return location.coords.altitude;
            },
            /* Returns degrees from north. */
            heading: function geoHeadingExpr(location) {
                // TODO: What do we do when this is NaN or NULL?
                return location.coords.heading || 0;
            },
            /* Returns estimated speed. */
            speed: function geoSpeedExpr(location) {
                // TODO: What do we do when this is NaN or NULL?
                return location.coords.speed || 0;
            },
        },

        image: {
            get: function imageGetExpr(path) {
                return assets.images[path];
            },
            create: function imageCreate(width, height) {
                return util.WBImage.create(width, height);
            },
            drawAtPoint: function imageDrawAtPointStep(img, pt) {
                img.drawAtPoint(getContext(), pt);
            },
            getWidth: function imageGetWidthExpr(img) {
                return img.getWidth();
            },
            getHeight: function imageGetHeightExpr(img) {
                return img.getHeight();
            },
            setWidth: function imageSetWidthStep(img, w) {
                img.setWidth(w);
            },
            setHeight: function imageSetHeightStep(img, h) {
                img.setHeight(h);
            },
            setSize: function imageSetSizeStep(img, sz) {
                img.setSize(sz);
            },
            scale: function imageScaleStep(img, scaleFactor) {
                img.scale(scaleFactor);
            },
            flipHorizontal: function imageFlipHorizontal(img) {
                img.flipH();
            },
            flipVertical: function imageFlipVertical(img) {
                img.flipV();
            },
            flipBoth: function imageFlipBoth(img) {
                img.flipBoth();
            },
            drawOnImage: function drawOnImageCtx(img) {
                var oldContext = _ctx;
                _ctx = img.getContext();
                this.gatherSteps().forEach(runBlock);
                _ctx = oldContext;
            }
        },
        input: {
            keyPressed: function inputKeyPressedExpr(key) {
                if (Event.keys[key])
                    return true;
                else
                    return false;
            },
            pointerX: function inputPointerXExpr() {
                return (Event.pointerX - Event.stage.left);
            },
            pointerY: function inputPointerYExpr() {
                return (Event.pointerY - Event.stage.top);
            },
            pointerDown: function inputPointerDownExpr() {
                return Event.pointerDown;
            },
            whenKeyPressed: function inputWhenKeyPressedCtx(key) {
                var self = this;
                Event.onKeyDown(key, function() {
                    self.gatherSteps().forEach(runBlock);
                });
            },
            whenPointerPressed: function() {
                var self = this;
                Event.mouseOrTouchEvent('down', function() {
                    self.gatherSteps().forEach(runBlock);
                });
            },
            whenPointerReleased: function() {
                var self = this;
                Event.mouseOrTouchEvent('up', function() {
                    self.gatherSteps().forEach(runBlock);
                });
            },
            whenPointerMoves: function() {
                var self = this;
                Event.mouseOrTouchEvent('move', function() {
                    self.gatherSteps().forEach(runBlock);
                });
            }
        },

        math: {
            add: util.add,
            subtract: util.subtract,
            multiply: util.multiply,
            divide: util.divide,
            equal: util.equal,
            notEqual: util.notEqual,
            lt: function mathLessThanExpr(a, b) {
                return a < b;
            },
            lte: function mathLessThanEqualToExpr(a, b) {
                return a <= b;
            },
            gt: function mathGreaterThanExpr(a, b) {
                return a > b;
            },
            gte: function mathGreaterThanEqualToExpr(a, b) {
                return a >= b;
            },
            mod: function mathModulusExpr(a, b) {
                return a % b;
            },
            round: Math.round,
            abs: Math.abs,
            sgn: Math.sign || function(a) {
                if (a === 0) return 0;
                return a / Math.abs(a);
            },
            floor: Math.floor,
            ceil: Math.ceil,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt || function(a) {
                return Math.pow(a, 1 / 3);
            },
            root: function mathRootExpr(a, b) {
                return Math.pow(a, 1 / b);
            },
            log: function mathLogExpr(val, base) {
                return Math.log(val) / Math.log(base);
            },
            max: function mathMaxExpr(a) {
                return Math.max.apply(Math, a);
            },
            min: function mathMinExpr(a) {
                return Math.min.apply(Math, a);
            },
            cos: function mathCosExpr(a) {
                return Math.cos(util.deg2rad(a));
            },
            sin: function mathSinExpr(a) {
                return Math.sin(util.deg2rad(a));
            },
            tan: function mathTanExpr(a) {
                return Math.tan(util.deg2rad(a));
            },
            asin: function mathAsinExpr(a) {
                return Math.asin(util.deg2rad(a));
            },
            acos: function mathAcosExpr(a) {
                return Math.acos(util.deg2rad(a));
            },
            atan: function mathAtanExpr(a) {
                if (a instanceof util.Vector)
                    return Math.atan2(a.y, a.x);

                return Math.atan(util.deg2rad(a));
            },
            pow: function mathPowerExpr(a, b) {
                return Math.pow(a, b);
            },
            pi: function mathPiExpr() {
                return Math.PI;
            },
            e: function mathEExpr() {
                return Math.E;
            },
            tau: function mathTauExpr() {
                return Math.PI * 2;
            },
            deg2rad: util.deg2rad,
            rad2deg: util.rad2deg,
            stringToNumber: Number
        },

        motion: {
            /* Asynchronous update event. Context. */
            // FIXME: We don't seem to have a block for this
            whenDeviceTurned: function whenDeviceTurnedCtx(direction) {
                var self = this;
                Event.on(window, 'runtime:motionchanged', null, function(event) {
                    if (direction === util.motion.direction) {
                        self.gatherSteps().forEach(runBlock);
                    }
                });
            },
            /* Synchronous "get current location" */
            tiltDirection: function tiltDirectionExpr() {
                return util.motion.direction;
            }
        },

        object: {
            empty: function objectEmpty() {
                return {};
            },
            create: function objectCreate() {
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
            getValue: function objectGetValue(obj, key) {
                return obj[key];
            },
            getKeys: function objectGetKeys(obj) {
                return Object.keys(obj);
            }
        },

        random: {
            randFloat: Math.random,
            randInt: util.randInt,
            noise: util.noise,
            choice: util.choice
        },

        rect: {
            fromCoordinates: function(x, y, width, height) {
                return new util.Rect(x, y, width, height);
            },
            fromVectors: function(point, size) {
                return util.Rect.fromVectors(point, size);
            },
            fromArray: function(a) {
                if (a.length < 4) {
                    throw new Error('Array must have at least four elements.');
                }
                return new util.Rect(a[0], a[1], a[2], a[3]);
            },
            getPosition: function(rect) {
                return rect.getPosition();
            },
            getSize: function(rect) {
                return rect.getSize();
            },
            asArray: function(rect) {
                return [rect.x, rect.y, rect.size.width, rect.size.height];
            },
            getX: function(rect) {
                return rect.x;
            },
            getY: function(rect) {
                return rect.y;
            },
            getWidth: function(rect) {
                return rect.size.width;
            },
            getHeight: function(rect) {
                return rect.size.height;
            }
        },

        shape: {
            draw: function(shapeArg) {
                shapeArg.draw(getContext());
            },
            fill: function(shapeArg) {
                shapeArg.draw(getContext());
                getContext().fill();
            },
            stroke: function(shapeArg) {
                shapeArg.draw(getContext());
                getContext().stroke();
            },
            setLineWidth: function(width) {
                getContext().lineWidth = width;
            },
            setLineCap: function(capStyle) {
                getContext().lineCap = capStyle;
            },
            setLineJoin: function(joinStyle) {
                getContext().lineJoin = joinStyle;
            },
            circle: function circle(pt, rad) {
                var satObject = new SAT.Circle(new SAT.Vector(pt.x, pt.y), rad);

                return new util.Shape(satObject);
            },
            rectangle: function rectangle(pt, width, height) {
                util.setLastPoint(pt);

                // The starting point of the object is ignored for now until sprites come
                // into the picture
                var satObject = new SAT.Polygon(new SAT.Vector(), [
                    new SAT.Vector(pt.x, pt.y),
                    new SAT.Vector(width + pt.x, pt.y),
                    new SAT.Vector(width + pt.x, height + pt.y),
                    new SAT.Vector(pt.x, height + pt.y)
                ]);

                return new util.Shape(satObject);
            },
            ellipse: function ellipse(pt, rad1, rad2, rot) {
                util.setLastPoint(pt);

                return new util.Shape(function(ctx) {
                    if (!util.isDrawingPath()) {
                        ctx.beginPath();
                    }

                    ctx.ellipse(pt.x, pt.y, rad1, rad2, rot, 0, Math.PI * 2);
                });
            },
            triangle: function(p1, p2, p3) {
                util.setLastPoint(p1);

                return new util.Shape(function(ctx) {
                    ctx.beginPath();

                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p1.x, p1.y);
                });
            },
            polygon: function() {
                var points = [].slice.call(arguments);
                util.setLastPoint(points[0]);

                var satObject = new SAT.Polygon(new SAT.Vector(), []);

                for (var i = 0; i < points.length; i++) {
                    points[i] = new SAT.Vector(points[i].x, points[i].y);
                }

                satObject.setPoints(points);

                return new util.Shape(satObject);
            },
            regularPolygon: function regularPolygon(origin, noSides, radius) {
                var points = [];
                util.setLastPoint(origin);
                var dA = 360 / noSides;
                for (var i = 0; i < noSides; i++) {
                    var angle = util.deg2rad(i * dA);
                    points.push(util.add(origin, new util.Vector(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius)));
                }
                return new util.Shape(function(ctx) {
                    var start = points[noSides - 1];
                    if (!util.isDrawingPath()) {
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                    } else {
                        ctx.lineTo(start.x, start.y);
                    }
                    points.forEach(function(pt) {
                        ctx.lineTo(pt.x, pt.y);
                    });
                });
            },
            star: function star(origin, noPoints, innerRadius, outerRadius) {
                var points = [];
                util.setLastPoint(origin);
                var dA = 360 / (noPoints * 2);
                for (var i = 0; i < noPoints; i++) {
                    var angle = util.deg2rad(i * 2 * dA);
                    points.push(util.add(origin, new util.Vector(
                        Math.cos(angle) * outerRadius,
                        Math.sin(angle) * outerRadius)));
                    angle += dA;
                    points.push(util.add(origin, new util.Vector(
                        Math.cos(angle) * innerRadius,
                        Math.sin(angle) * innerRadius)));
                }
                return new util.Shape(function(ctx) {
                    var start = points[points.length - 1];
                    if (!util.isDrawingPath()) {
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                    } else {
                        ctx.lineTo(start.x, start.y);
                    }
                    points.forEach(function(pt) {
                        ctx.lineTo(pt.x, pt.y);
                    });
                });
            },
            lineTo: function(startPoint, toPoint) {
                util.setLastPoint(toPoint);
                return new util.Path(getContext().lineTo, new Array(toPoint.x, toPoint.y), startPoint);
            },
            arc: function(radius, centerPoint, startAngle, endAngle, direction) {
                startAngle = util.deg2rad(startAngle);
                endAngle = util.deg2rad(endAngle);

                util.setLastPoint(new util.Vector(centerPoint.x + Math.cos(endAngle) * radius, centerPoint.y + Math.sin(endAngle) * radius));

                return new util.Shape(function(ctx) {
                    if (!util.isDrawingPath()) {
                        ctx.beginPath();
                    }

                    ctx.arc(centerPoint.x, centerPoint.y, radius, startAngle, endAngle, false);
                });
            },
            bezierCurve: function(startPoint, toPoint, controlPoint1, controlPoint2) {
                util.setLastPoint(toPoint);
                var path = new util.Path(
                    getContext().bezierCurveTo,
                    new Array(controlPoint1.x,
                        controlPoint1.y,
                        controlPoint2.x,
                        controlPoint2.y,
                        toPoint.x,
                        toPoint.y),
                    startPoint
                );
                return path;
            },
            quadraticCurve: function(startPoint, toPoint, controlPoint) {
                util.setLastPoint(toPoint);
                var path = new util.Path(
                    getContext().quadraticCurveTo,
                    new Array(
                        controlPoint.x,
                        controlPoint.y,
                        toPoint.x,
                        toPoint.y),
                    startPoint
                );
                return path;
            },
            withClip: function withClipCtx(shape) {
                getContext().save();
                shape.draw(getContext());
                getContext().clip();
                this.gatherSteps().forEach(runBlock);
                getContext().restore();
            },
            path: function() {
                var args = [].slice.call(arguments);
                return new util.Shape(args);
            },
            lastPoint: function() {
                return util.lastPoint();
            },
            bezierPoint: function(position, startPoint, toPoint, controlPoint1, controlPoint2) {
                var adjustedPosition = 1 - position;

                var x = Math.pow(adjustedPosition, 3) * startPoint.x +
                    3 * (Math.pow(adjustedPosition, 2)) * position * controlPoint1.x +
                    3 * adjustedPosition * Math.pow(position, 2) * controlPoint2.x +
                    Math.pow(position, 3) * toPoint.x;

                var y = Math.pow(adjustedPosition, 3) * startPoint.y +
                    3 * (Math.pow(adjustedPosition, 2)) * position * controlPoint1.y +
                    3 * adjustedPosition * Math.pow(position, 2) * controlPoint2.y +
                    Math.pow(position, 3) * toPoint.y;

                return new util.Vector(x, y);
            },
            bezierTangent: function(position, startPoint, toPoint, controlPoint1, controlPoint2) {
                var adjustedPosition = 1 - position;

                var x = 3 * toPoint.x * Math.pow(position, 2) -
                    3 * controlPoint2.x * Math.pow(position, 2) +
                    6 * controlPoint2.x * adjustedPosition * position -
                    6 * controlPoint1.x * adjustedPosition * position +
                    3 * controlPoint1.x * Math.pow(adjustedPosition, 2) -
                    3 * startPoint.x * Math.pow(adjustedPosition, 2);

                var y = 3 * toPoint.y * Math.pow(position, 2) -
                    3 * controlPoint2.y * Math.pow(position, 2) +
                    6 * controlPoint2.y * adjustedPosition * position -
                    6 * controlPoint1.y * adjustedPosition * position +
                    3 * controlPoint1.y * Math.pow(adjustedPosition, 2) -
                    3 * startPoint.y * Math.pow(adjustedPosition, 2);

                return new util.Vector(x, y);
            }
        },
        size: {
            fromCoordinates: function(width, widthUnits, height, heightUnits) {
                return new util.Size(width, widthUnits, height, heightUnits);
            },
            fromArray: function(a, widthUnits, heightUnits) {
                if (a.length < 2) {
                    throw new Error('Array must have at least two elements.');
                }
                return new util.Size(a[0], widthUnits, a[1], heightUnits);
            },
            toArray: function(size) {
                return [size.width, size.height];
            },
            getWidth: function(size) {
                return size.width;
            },
            getHeight: function(size) {
                return size.height;
            }
        },

        sound: {
            /* turn off jshint warnings for using constructors without "new" */
            /* jshint -W064 */
            get: function(wave, a, r) {
                var osc = T(wave); 
                var env = T("perc", {
                    a: a,
                    r: r
                });
                var oscenv = T("OscGen", {
                    osc: osc,
                    env: env,
                    mul: 0.15
                }).play();
                return oscenv;
            },
            getAudio: function(file) {
                var audio = T("audio", { 
                    load: file
                });
                return audio;
            },
            addNote: function(note, octave, beats) {
                var octave_diff, i;
                switch (note) {
                    case "A":
                        note = "a";
                        break;
                    case "A#/Bb":
                        note = "a#";
                        break;
                    case "B":
                        note = "b";
                        break;
                    case "C":
                        note = "c";
                        break;
                    case "C#/Db":
                        note = "c#";
                        break;
                    case "D":
                        note = "d";
                        break;
                    case "D#/Eb":
                        note = "d#";
                        break;
                    case "E":
                        note = "e";
                        break;
                    case "F":
                        note = "f";
                        break;
                    case "F#/Gb":
                        note = "f#";
                        break;
                    case "G":
                        note = "g";
                        break;
                    case "G#/Ab":
                        note = "g#";
                        break;
                    case "Rest":
                        note = "r";
                        break;
                }
                if (octave > current_octave) {
                    octave_diff = octave - current_octave;
                    for (i = 0; i < octave_diff; i++) {
                        song += "<";
                    }
                } else if (octave < current_octave) {
                    octave_diff = current_octave - octave;
                    for (i = 0; i < octave_diff; i++) {
                        song += ">";
                    }
                }
                current_octave = octave;
                var length;
                switch (beats) {
                    case "1/32":
                        length = "32";
                        break;
                    case "1/16":
                        length = "16";
                        break;
                    case "1/8":
                        length = "8";
                        break;
                    case "1/4":
                        length = "4";
                        break;
                    case "1/2":
                        length = "2";
                        break;
                    case "1":
                        length = "1";
                        break;
                }
                var newNote = note + length;
                song += newNote;
            },
            playChord: function() {
                var args = [].slice.call(arguments);
                var oscenv = args[0];
                var freqs = [];
                for (var i = 1; i < args.length; i++) {
                    var freq;
                    switch (args[i]) {
                        case "A":
                            freq = 55.000;
                            break;
                        case "A#/Bb":
                            freq = 58.270;
                            break;
                        case "B":
                            freq = 61.735;
                            break;
                        case "C":
                            freq = 65.406;
                            break;
                        case "C#/Db":
                            freq = 69.296;
                            break;
                        case "D":
                            freq = 73.416;
                            break;
                        case "D#/Eb":
                            freq = 77.782;
                            break;
                        case "E":
                            freq = 82.407;
                            break;
                        case "F":
                            freq = 87.307;
                            break;
                        case "F#/Gb":
                            freq = 92.499;
                            break;
                        case "G":
                            freq = 97.999;
                            break;
                        case "G#/Ab":
                            freq = 103.826;
                            break;
                    }
                    var octave = args[++i];
                    parseInt(octave);
                    freq = freq * Math.pow(2, octave - 1);
                    freqs.push(freq);
                }
                T("interval", {
                    interval: "L4",
                    timeout: "L4"
                }, function() {
                    for (var i = 0; i < freqs.length; i++) {
                        oscenv.noteOnWithFreq(freqs[i], 64);
                    }
                }).on("ended", function() {
                    this.stop();
                }).set({
                    buddies: oscenv
                }).start();
            },
            playAudio: function(audio) {
                if (audio) {
                    audio.play();
                }
            },
            playNotes: function(sound) {
                T("mml", {
                    mml: song
                }, sound).on("ended", function() {
                    sound.pause();
                    this.stop();
                }).start();
                song = "o4 l4 V12 ";
            },
            playMML: function(sound, mml) {
                var gen = T("OscGen", {
                    wave: sound,
                    env: {
                        type: "perc"
                    },
                    mul: 0.25
                }).play();
                T("mml", {
                    mml: mml
                }, gen).on("ended", function() {
                    gen.pause();
                    this.stop();
                }).start();
            },
            tempoChange: function(tempo) {
                song += ("t" + tempo + " ");
            },
            pauseAudio: function(audio) {
                if (audio) {
                    audio.pause();
                }
            },
            keys: function(synth) {
                var keydict = T("ndict.key");
                var midicps = T("midicps");
                T("keyboard").on("keydown", function(e) {
                    var midi = keydict.at(e.keyCode);
                    if (midi) {
                        var freq = midicps.at(midi);
                        synth.noteOnWithFreq(freq, 100);
                    }
                }).on("keyup", function(e) {
                    var midi = keydict.at(e.keyCode);
                    if (midi) {
                        synth.noteOff(midi, 100);
                    }
                }).start();
            },
            soundEffect: function(effect) {
                var table;
                switch (effect) {
                    case "laser":
                        table = [1760, [110, "200ms"]];

                        var freq = T("env", {
                            table: table
                        }).on("bang", function() {
                            VCO.mul = 0.2;
                        }).on("ended", function() {
                            VCO.mul = 0;
                        });
                        var VCO = T("saw", {
                            freq: freq,
                            mul: 0
                        }).play();
                        freq.bang();
                        break;
                    case "alarm":
                        table = [440, [880, 500],
                            [660, 250]
                        ];
                        var env = T("env", {
                            table: table
                        }).bang();
                        var synth = T("saw", {
                            freq: env,
                            mul: 0.25
                        });

                        var interval = T("interval", {
                            interval: 1000
                        }, function(count) {
                            if (count === 3) {
                                interval.stop();
                            }
                            env.bang();
                        }).set({
                            buddies: synth
                        }).start();
                        break;
                }
            }
            /* jshint +W064 */
        },

        sprite: {
            create: function create(imgShapeOrSprite) {
                return new util.Sprite(imgShapeOrSprite);
            },
            accelerate: function accelerate(spt, speed) {
                spt.accelerate(speed);
            },
            setVelocity: function setVelocity(spt, vec) {
                // console.log('set velocity of ' + spt + ' to ' + vec);
                spt.setVelocity(vec);
            },
            getVelocity: function spriteGetVelocityExpr(spt) {
                return spt.velocity;
            },
            getSpeed: function spriteGetSpeedExpr(spt) {
                return spt.velocity.magnitude();
            },
            getXvel: function getXvel(spt) {
                return spt.getXvel();
            },
            getYvel: function getYvel(spt) {
                return spt.getYvel();
            },
            getXpos: function getXpos(spt) {
                return spt.getXpos();
            },
            getYpos: function getYpos(spt) {
                return spt.getYpos();
            },
            rotate: function rotate(spt, angle) {
                spt.rotate(angle);
            },
            rotateTo: function rotateTo(spt, angle) {
                spt.rotateTo(angle);
            },
            move: function move(spt) {
                spt.move();
            },
            moveTo: function moveTo(spt, pt) {
                // console.log('move ' + spt + ' to ' + pt);
                spt.moveTo(pt);
            },
            draw: function draw(spt) {
                spt.draw(getContext());
            },
            applyForce: function applyForce(spt, vec) {
                spt.applyForce(vec);
            },
            bounceAtEdge: function bounceAtEdge(spt) {
                spt.bounceWithinRect(canvasRect());
            },
            wrapAtEdge: function wrapAtEdge(spt) {
                spt.wrapAroundRect(canvasRect());
            },
            stopAtEdge: function stopAtEdge(spt) {
                spt.stayWithinRect(canvasRect());
            },
            checkForCollision: function checkForCollision(spt1, spt2) {
                return spt1.checkForCollision(spt2);
            }
        },
        stage: {
            clearTo: new util.Method()
                .when(['string'], function(clr) { // unfortunately colors are still strings
                    var r = canvasRect();
                    var c = getContext();
                    c.save();
                    c.fillStyle = clr;
                    c.fillRect(r.x, r.y, r.width, r.height);
                    c.restore();
                })
                .when(['wbimage'], function(img) {
                    var c = getContext();
                    c.save();
                    img.drawInRect(c, canvasRect());
                    c.restore();
                })
                .when(['shape'], function(shape) {
                    var c = getContext();
                    c.save();
                    shape.draw(c);
                    c.restore();
                })
                .fn(),
            stageWidth: function() {
                return Event.stage.width;
            },
            stageHeight: function() {
                return Event.stage.height;
            },
            centerX: function() {
                return (Event.stage.width / 2);
            },
            centerY: function() {
                return (Event.stage.height / 2);
            },
            centerPoint: function() {
                return new util.Vector(Event.stage.width / 2, Event.stage.height / 2);
            },
            randomX: function() {
                return Math.random() * Event.stage.width;
            },
            randomY: function() {
                return Math.random() * Event.stage.height;
            },
        },
        string: {

            toString: function(x) {
                return x.toString();
            },
            split: function(x, y) {
                return x.split(y);
            },
            concatenate: function(x, y) {
                return x.concat(y);
            },
            repeat: function(x, n) {
                var str = "";
                for (var i = 0; i < n; i++) {
                    str = str.concat(x);
                }
                return str;
            },
            getChar: function(n, x) {
                if (n < 0)
                    n = x.length + n;

                return x.charAt(n);
            },
            getCharFromEnd: function(n, x) {
                if (n <= 0)
                    n = n * (-1) - 1;
                else
                    n = x.length - n;
                return x.charAt(n);
            },
            substring: function(x, a, b) {
                if (a < 0)
                    return "";
                else
                    return x.substring(a, a + b);
            },
            substring2: function(x, a, b) {
                if (a < 0 || a > x.length)
                    return "";
                else
                    return x.substring(a, b);
            },
            isSubstring: function(x, y) {
                if (y.indexOf(x) === -1) {
                    return false;
                } else {
                    return true;
                }
            },
            substringPosition: function(x, y) {
                return y.indexOf(x);
            },
            replaceSubstring: function(x, y, z) {
                return x.replace(new RegExp(y, 'g'), z);
            },
            trimWhitespace: function(x) {
                return x.trim();
            },
            uppercase: function(x) {
                return x.toUpperCase();
            },
            lowercase: function(x) {
                return x.toLowerCase();
            },
            matches: function(x, y) {
                return x === y;
            },
            doesntMatch: function(x, y) {
                return (x !== y);
            },
            startsWith: function(x, y) {
                return (x.lastIndexOf(y, 0) === 0);
            },
            endsWith: function(x, y) {
                return x.indexOf(y, x.length - y.length) !== -1;
            },
            setFont: function(size, fontStyle) {
                var sizeString = size[0] + size[1];
                getContext().font = sizeString + " " + fontStyle;

            },
            textAlign: function(alignment) {
                getContext().textAlign = alignment;
            },
            textBaseline: function(baseline) {
                getContext().textBaseline = baseline;
            },
            fillText: function(text, x, y) {
                getContext().fillText(text, x, y);
            },
            fillTextWidth: function(text, x, y, width) {
                getContext().fillText(text, x, y, width);
            },
            strokeText: function(text, x, y) {
                getContext().strokeText(text, x, y);
            },
            strokeTextWidth: function(text, x, y, width) {
                getContext().strokeText(text, x, y, width);
            },
            width: function(text) {
                var textMetric = getContext().measureText(text);
                return textMetric.width;
            }
        },
        vector: {
            create: function create(x, y) {
                return new util.Vector(x, y);
            },
            createPolar: function createPolar(deg, mag) {
                return util.Vector.fromPolar(deg, mag);
            },
            fromArray: function fromArray(arr) {
                return new util.Vector(arr[0], arr[1]);
            },
            toArray: function toArray(vec) {
                return [vec.x, vec.y];
            },
            randomPoint: function randomPoint() {
                return new util.Vector(util.randInt(Event.stage.width), util.randInt(Event.stage.height));
            },
            unitVector: function unitVector() {
                return new util.Vector(1, 1);
            },
            zeroVector: function zeroVector() {
                return new util.Vector(0, 0);
            },
            rotateTo: function rotateTo(vec, deg) {
                return vec.rotateTo(deg);
            },
            rotate: function rotate(vec, deg) {
                return vec.rotate(deg);
            },
            magnitude: function magnitude(vec) {
                return vec.magnitude();
            },
            degrees: function degrees(vec) {
                return Math.atan2(vec.y, vec.x) / (Math.PI / 180);
            },
            normalize: function normalize(vec) {
                return vec.normalize();
            },
            x: function x(vec) {
                return vec.x;
            },
            y: function y(vec) {
                return vec.y;
            },
            randomUnitVector: function randomUnitVector() {
                var vec = util.Vector.fromPolar(Math.random() * 360, 1);
                return vec;
            }
        },
        date: {
            create: function(year, month, day) {
                return new Date(year, month - 1, day);
            },
            now: function() {
                var today = new Date();
                // Seems like "now" should have time as well, but
                // maybe "today" shouldn't?
                today.setHours(0, 0, 0, 0);
                return today;
            },
            addDays: function(prevDate, days) {
                // we don't want to mutate an argument in place
                var date = new Date(prevDate.valueOf()); // clone argument
                date.setDate(prevDate.getDate() + days);
                return date;
            },
            addMonths: function(prevDate, months) {
                var date = new Date(prevDate.valueOf());
                date.setMonth(date.getMonth() + months);
                return date;
            },
            addYears: function(prevDate, years) {
                var date = new Date(prevDate.valueOf());
                date.setFullYear(date.getFullYear() + years);
                return date;
            },
            dayOfWeek: function(date) {
                return date.getDay();
            },
            getDay: function(date) {
                return date.getDate();
            },
            getMonth: function(date) {
                return date.getMonth() + 1;
            },
            getMonthName: function(date) {
                return ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November',
                    'December'
                ][date.getMonth()];
            },
            getYear: function(date) {
                return date.getFullYear();
            },

        }
    };


})(window);