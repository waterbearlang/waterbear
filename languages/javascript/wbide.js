/*
 *    Canvas Plugin
 *
 *    Support for using <canvas> from Waterbear
 *
 */

(function(wb){
// expose these globally so the Block/Label methods can find them
'use strict';
wb.choiceLists.align = ['start', 'end', 'left', 'right', 'center'];
wb.choiceLists.baseline = ['alphabetic', 'top', 'hanging', 'middle', 'ideographic', 'bottom'];
wb.choiceLists.linecap = ['round', 'butt', 'square'];
wb.choiceLists.linejoin = ['round', 'bevel', 'mitre'];
wb.choiceLists.easing = ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'];
wb.choiceLists.fontweight = ['normal', 'bold', 'inherit'];
wb.choiceLists.globalCompositeOperators = ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-atop', 'destination-in', 'destination-out', 'destination-over', 'lighter', 'copy', 'xor'];
wb.choiceLists.repetition = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'];
wb.choiceLists.types = wb.choiceLists.types.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata', 'file']);
wb.choiceLists.rettypes = wb.choiceLists.rettypes.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata', 'file']);

})(wb);
wb.choiceLists.pointerEvents = ["mousecancel", "mousedown", "mouseenter", "mouseleave", "mouseout", "mousemove", "mouseover", "mouseup", "click", "dblclick", "contextmenu"];
wb.choiceLists.types.push('control');
wb.choiceLists.rettypes.push('control');// set up choices
(function(wb) {
'use strict';
wb.choiceLists.directions = ["upright", "downright", "downleft", "upleft", "up", "down", "right", "left"];
wb.choiceLists.types.push('motion');
wb.choiceLists.rettypes.push('motion');
})(wb);(function(wb){
	'use strict';
wb.choiceLists.types.push('sound');
wb.choiceLists.rettypes.push('sound');
})(wb);/*
 *    Sprite Plugin
 *
 *    Support for building games using Waterbear
 *
 */

(function(wb){
	'use strict';
wb.choiceLists.types.push('sprite');
wb.choiceLists.rettypes.push('sprite');
})(wb);
/*
 *    Vector Plugin
 *
 *    Support for vector math in Waterbear
 *
 */

(function(wb){
'use strict';
wb.choiceLists.types.push('vector');
wb.choiceLists.rettypes.push('vector');
})(wb);
/*
 *    Music Plugin
 *
 *    Support for playing music/sounds using Waterbear
 *
 */
(function(wb){
	'use strict';
// Based on an 88-key piano
wb.choiceLists.notes = [
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
wb.choiceLists.durations = [
	'double whole note', 'whole note', 'half note', 'quarter note', 'eighth note',
	'sixteenth note', 'thirty-second note', 'sixty-fourth note'
];
wb.choiceLists.types.push('voice');
wb.choiceLists.rettypes.push('voice');

})(wb);

