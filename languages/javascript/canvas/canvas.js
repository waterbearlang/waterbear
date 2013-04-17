/*
 *    Canvas Plugin
 *
 *    Support for using <canvas> from Waterbear
 *
 */


// expose these globally so the Block/Label methods can find them
choiceLists.unit = ['px', 'em', '%', 'pt'];
choiceLists.align = ['start', 'end', 'left', 'right', 'center'];
choiceLists.baseline = ['alphabetic', 'top', 'hanging', 'middle', 'ideographic', 'bottom'];
choiceLists.linecap = ['round', 'butt', 'square'];
choiceLists.linejoin = ['round', 'bevel', 'mitre'];
choiceLists.easing = ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'];
choiceLists.fontweight = ['normal', 'bold', 'inherit'];
choiceLists.globalCompositeOperators = ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-atop', 'destination-in', 'destination-out', 'destination-over', 'lighter', 'copy', 'xor'];
choiceLists.repetition = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'];
choiceLists.types = choiceLists.types.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata']);
choiceLists.rettypes = choiceLists.rettypes.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata']);


