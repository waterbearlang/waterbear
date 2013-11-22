// Music Routines
function Voice(){
    this.on = false;
    this.osc;       // The oscillator which will generate tones
    this.gain;      // The gain node for controlling volume
    var context = window.AudioContext || window.webkitAudioContext;
    this.context = new context();
    this.frequency = 400;   // Frequency to be used by oscillator
    this.volume = 0.3;      // Volume to be used by the gain node
};

// Turn on the oscillator, routed through a gain node for volume
Voice.prototype.startOsc = function() {
    if (this.on) 
        this.stopOsc();
    this.osc = this.context.createOscillator();
    this.osc.type = 0; // Sine wave
    this.osc.frequency.value = this.frequency;
    console.log('oscillator: %o', this.osc);
    this.osc.start(0);
    
    this.gain = this.context.createGain();
    this.gain.gain.value = this.volume;
    
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
    
    this.on = true;
};

// Turn off the oscillator
Voice.prototype.stopOsc = function() {
    this.osc.stop(0);
    this.osc.disconnect();
    this.on = false;
}

// Ensure a playing tone is updated when values change
Voice.prototype.updateTone = function() {
    if (this.on) {
        stopOsc();
        startOsc();
    }
};
