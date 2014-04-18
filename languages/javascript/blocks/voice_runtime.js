// Music Routines
(function(window){
	'use strict';
function Voice(){
    this.on = false;
    this.osc;       // The oscillator which will generate tones
    this.gain;      // The gain node for controlling volume
    var context = window.AudioContext || window.webkitAudioContext;
    this.context = new context();
    this.tempo = 100;
    this.frequency = 400;   // Frequency to be used by oscillator
    this.volume = 0.3;      // Volume to be used by the gain node
    this.playlist = [];
};

// Turn on the oscillator, routed through a gain node for volume
Voice.prototype.startOsc = function() {
    if (this.on) 
        this.stopOsc();
    this.osc = this.context.createOscillator();
    this.osc.type = 0; // Sine wave
    this.osc.frequency.value = this.frequency;
    // console.log('oscillator: %o', this.osc);
    this.osc.start(0);
    
    this.gain = this.context.createGain();
    this.gain.gain.value = this.volume;
    
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
    
    this.on = true;
};

// Turn off the oscillator
Voice.prototype.stopOsc = function() {
	//during use strict you can't call stop more than once
	// Failed to execute 'stop' on 'OscillatorNode': cannot call stop more than once. 
	// so add conditional
	if(this.on)
    this.osc.stop(0);
    this.osc.disconnect();
    this.on = false;
}

// Ensure a playing tone is updated when values change
Voice.prototype.updateTone = function() {
    if (this.on) {
        this.stopOsc();
        this.startOsc();
    }
};

// Calculate the frequency from a note name
Voice.prototype.setNote = function(note) {
	var noteIndex = Voice.notes.indexOf(note);
	this.frequency = 440 * Math.pow(2, (noteIndex - Voice.refNote) / 12);
}

Voice.prototype.push = function(note, len, dots) {
	this.playlist.push({pitch: note, duration: len, dotted: dots});
}

Voice.prototype.pushRest = function(len, dots) {
	this.playlist.push({pitch: "none", duration: len, dotted: dots});
}

Voice.prototype.play = function() {
	var note = this.playlist.shift();
	if(note.pitch == "none") {
		if(this.on) this.stopOsc();
	} else {
		this.setNote(note.pitch);
		if(this.on) this.updateTone();
		else this.startOsc();
	}
	var timeout = this.durationOf(note.duration, note.dotted);
	if(this.playlist.length > 0) {
		var me = this;
		setTimeout(function() {me.play();}, timeout);
	} else {
		var me = this;
		setTimeout(function() {me.stopOsc();}, timeout);
	}
}

// Calculate the duration from the tempo, and a note type, and a number of dots
Voice.prototype.durationOf = function(note, dots) {
	var qn_len = 60 / this.tempo;
	var base_len;
	if(note == 'double whole note') base_len = qn_len * 8;
	else if(note == 'whole note') base_len = qn_len * 4;
	else if(note == 'half note') base_len = qn_len * 2;
	else if(note == 'quarter note') base_len = qn_len;
	else if(note == 'eighth note') base_len = qn_len / 2;
	else if(note == 'sixteenth note') base_len = qn_len / 4;
	else if(note == 'thirty-second note') base_len = qn_len / 8;
	else if(note == 'sixty-fourth note') base_len = qn_len / 16;
	var len = base_len;
	while(dots > 0) {
		len += base_len / Math.pow(2,dots);
		dots--;
	}
	len *= 1000; // Convert from seconds to ms
	// console.log("Calculated voice duration:",note,dots,this.tempo,len);
	return len;
}

// Must be identical to the list in voice.js
Voice.notes = [
	// Octave 0
	'A0','A♯0/B♭0','B0',
	// Octave 1
	'C1','C♯1/D♭1','D1','D♯1/E♭1','E1',
	'F1','F♯1/G♭1','G1','G♯1/A♭1','A1','A♯1/B♭1','B1',
	// Octave 2
	'C2','C♯2/D♭2','D2','D♯2/E♭2','E2',
	'F2','F♯2/G♭2','G2','G♯2/A♭2','A2','A♯2/B♭2','B2',
	// Octave 3
	'C3','C♯3/D♭3','D3','D♯3/E♭3','E3',
	'F3','F♯3/G♭3','G3','G♯3/A♭3','A3','A♯3/B♭3','B3',
	// Octave 4
	'C4 (Middle C)','C♯4/D♭4','D4','D♯4/E♭4','E4',
	'F4','F♯4/G♭4','G4','G♯4/A♭4','A4','A♯4/B♭4','B4',
	// Octave 5
	'C5','C♯5/D♭5','D5','D♯5/E♭5','E5',
	'F5','F♯5/G♭5','G5','G♯5/A♭5','A5','A♯5/B♭5','B5',
	// Octave 6
	'C6','C♯6/D♭6','D6','D♯6/E♭6','E6',
	'F6','F♯6/G♭6','G6','G♯6/A♭6','A6','A♯6/B♭6','B6',
	// Octave 7
	'C7','C♯7/D♭7','D7','D♯7/E♭7','E7',
	'F7','F♯7/G♭7','G7','G♯7/A♭7','A7','A♯7/B♭7','B7',
	// Octave 8
	'C8'
];
Voice.refNote = Voice.notes.indexOf('A4');
window.Voice = Voice;
})(window);
