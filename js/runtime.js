(function(global){
    'use strict';

    // resources

    var canvas, ctx;
    Event.on(window, 'load', null, function(){
        canvas = dom.find('wb-playground > canvas');
        ctx = canvas.getContext('2d');
    }, false);

    var perFrameHandlers = [];
    var lastTime = new Date().valueOf();

    function startEventLoop(){
        Event.frame = 0;
        Event.sinceLastTick = 0;
        requestAnimationFrame(frameHandler);
    }

    function frameHandler(){
        // where to put these? Event already has some global state.
        var currTime = new Date().valueOf();
        Event.sinceLastTick = currTime - lastTime;
        Event.frame++;
        lastTime = currTime;
        perFrameHandlers.forEach(function(handler){
            handler();
        });
        requestAnimationFrame(frameHandler);
    }

    // for all of these functions, `this` is the scope object
    global.runtime = {
        startEventLoop: startEventLoop,
        local: {
            //temporary fix for locals
            value: function(){
                return this.value;
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
            setVariable: function(name, value){
                //FIXME: Make sure this is named properly
                // console.log('setting variable %s to value %s', name, value);
                this[name] = value;
            },
            getVariable: function(name){
                // console.log('get %s from %o', name, this);
                return this[name];
            },
            loopOver: function(args, containers){
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
                for (var i = 0; i < len; i++){
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
                    containers[0].forEach(function(block){
                        block.run(self);
                    });

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
        sprite: {
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
                ctx.fillStyle = color;
            },
            stroke: function(color){
                ctx.strokeStyle = color;
            },
            shadow: function(color){
                ctx.shadowColor = color;
            }
        },
        image: {
            get: function(path){
                return images[path];
            },
            drawAtPoint: function(img, pt, w, h){
                w = w ? w : undefined;
                h = h ? h : undefined;
                ctx.drawImage(img, pt.x, pt.y, w, h);
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
        object: {
        },
        string: {
        },
        path: {
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
        },
        motion: {
        },
        shape: {
        },
        geolocation: {
        },
        size: {
        }
    };

})(window);
