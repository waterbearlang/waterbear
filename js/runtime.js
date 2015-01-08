(function(global){
    'use strict';

    // resources

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
                return sounds(url); // already cached by sounds library
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
        },
        color: {
        },
        image: {
        },
        math: {
        },
        random: {
        },
        vector: {
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
