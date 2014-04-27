/*
 *    Canvas Plugin
 *
 *    Support for using <canvas> from Waterbear
 *
 */

(function(wb){
// expose these globally so the Block/Label methods can find them
'use strict';
wb.choiceLists.unit = ['px', 'em', '%', 'pt'];
wb.choiceLists.relativeUnit = ['px', '%'];
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
