(function(global){
    'use strict';

    // resources

    var canvas, ctx;
    window.addEventListener('load', function(){
        canvas = dom.find('wb-playground > canvas');
        ctx = canvas.getContext('2d');
    }, false);


    global.runtime = {
        control: {
        },
        sprite: {
        },
        sound: {
            // sounds is the soundsForGames library that we wrap:
            // https://github.com/kittykatattack/soundForGames

            // called after pre-loader has loaded sound file
            init: function(url, result){
                // initialized by loader
                console.log('sound %s loaded', url);
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
            create: function(x,y){ return new Vector(x,y); },
            createPolar: function(r,m){ return Vector.fromPolar(r,m); },
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
