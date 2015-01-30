(function(global){
    'use strict';

    // canvas/stage stuff
    var canvas, ctx;
    Event.on(window, 'load', null, function(){
        canvas = dom.find('wb-playground > canvas');
        ctx = canvas.getContext('2d');
        handleResize();
    }, false);

    function handleResize(){
        var rect = canvas.getBoundingClientRect();
        Event.stage = {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom),
            width: Math.round(rect.right) - Math.round(rect.left),
            height: Math.round(rect.bottom) - Math.round(rect.top)
        };
        canvas.setAttribute('width', Event.stage.width);
        canvas.setAttribute('height', Event.stage.height);
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
    // **If the functions don't have dependencies beyond util.js, and event.js
    // they should go in runtime-simple.js.***
    global.runtime = util.extend((global.runtime || {} ), {
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
                ctx.drawImage(img, pt.x, pt.y, w, h);
            }
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
        path:{
            
            lineTo: function(toPoint){return new util.Path(ctx.lineTo, new Array(toPoint.getX(), toPoint.getY()), ctx)},

            bezierCurveTo: function(toPoint, controlPoint1, controlPoint2){
                return new util.Path(ctx.bezierCurveTo, new Array(controlPoint1.getX(), controlPoint1.getY(),
                controlPoint2.getX(), controlPoint2.getY(), toPoint.getX(),
                toPoint.getY()), ctx);
            },
            moveTo: function(toPoint){
                return new util.Path(ctx.moveTo, new Array(toPoint.getX(), toPoint.getY()), ctx);
            },
            quadraticCurveTo: function(toPoint, controlPoint){
                return new util.Path(ctx.quadraticCurveTo, new Array(controlPoint.getX(),
                controlPoint.getY(),toPoint.getX(), toPoint.getY()), ctx);
            },
            arcTo: function(toPoint, controlPoint1, controlPoint2){
                return new util.Path(ctx.arcTo, new Array(controlPoint1.getX(),
                controlPoint1.getY(),controlPoint2.getX(), controlPoint2.getY(),
                toPoint.getX(), toPoint.getY()), ctx);
            },
            closePath: function(){return new util.Path(ctx.closePath, undefined, ctx)},
            pathSet: function(args){
                ctx.beginPath();
                var i;
                for(i=0; i<arguments.length; i++){
                    arguments[i].draw();
                }    
            },
            fill: function(pathSet){
                ctx.closePath();
                ctx.fill();
            },
            stroke: function(pathSet){
                ctx.stroke();
            },
            lineStyle: function(width, color, capStyle, joinStyle){
                ctx.lineWidth = width;
                ctx.strokeStyle = color;
                ctx.lineCap = capStyle;
                ctx.lineJoin = joinStyle;
            }

        },

        motion: {
        },
        shape: {
            fillShape: function(shp){
                shp();
                ctx.fill();
            },
            circle: function(pt, rad){
                return function(){
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2, true);
                };
            }
        },

        size: {
        },
		
		sensing: {
			keyPressed: function(key){
				if(Event.keys[key])
					return true;
				else
					return false;
			},
			mouseX: function(){ return Event.pointerX-Event.stage.left; },	//TODO
			mouseY: function(){ return Event.pointerY-Event.stage.top; },	//TODO
			mouseDown: function(){ return Event.pointerDown; }, 			//TODO
			stageWidth: function(){ return Event.stage.width; },
			stageHeight: function(){ return Event.stage.height; },
			centerX: function(){ return (Event.stage.width / 2); },
			centerY: function(){ return (Event.stage.height / 2); },
			randomX: function(){ return Math.random() * Event.stage.width; },
			randomY: function(){ return Math.random() * Event.stage.height; },
			
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
