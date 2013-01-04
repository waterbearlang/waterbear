/* 
 *    Canvas Plugin
 * 
 *    Support for using <canvas> from Waterbear
 *
 */

(function(){


// Pre-load dependencies
yepnope({
    load: [ 'plugins/canvas.css'
    ]
});


// expose these globally so the Block/Label methods can find them
$.extend(choiceLists, {
    unit: ['px', 'em', '%', 'pt'],
    align: ['start', 'end', 'left', 'right', 'center'],
    baseline: ['alphabetic', 'top', 'hanging', 'middle', 'ideographic', 'bottom'],
    linecap: ['round', 'butt', 'square'],
    linejoin: ['round', 'bevel', 'mitre'],
    easing: ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'],
    fontweight: ['normal', 'bold', 'inherit'],
    globalCompositeOperators: ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-atop', 'destination-in', 'destination-out', 'destination-over', 'lighter', 'copy', 'xor'],
    repetition: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']
});

choiceLists.types = choiceLists.types.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata']);
choiceLists.rettypes = choiceLists.rettypes.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata']);


// Hints for building blocks
//
//
// Value blocks can nest, so don't end them with semi-colons (i.e., if there is a "type" specified).
//
//

    // CANVAS Menu
    wb.menu('Canvas', [
        {
            blocktype: 'context',
            labels: ['with local state'],
            script: 'local.ctx.save();[[1]];local.ctx.restore();',
            help: 'save the current state, run the contained steps, then restore the saved state'
        },
        {
            blocktype: 'step',
            label: 'stroke',
            script: 'local.ctx.stroke();',
            help: 'stroke...'
        },
        {
            blocktype: 'step',
            label: 'fill',
            script: 'local.ctx.fill();',
            help: 'fill...'
        },
        {
            blocktype: 'step',
            label: 'clear rect [rect]', 
            script: 'local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'clear...'
        },
        {
            blocktype: 'step',
            label: 'fill circle at point [point] with radius [number:10]',
            script: 'var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();',
            help: 'circle...'
        },
		{
			blocktype: 'step',
			label: 'fill circle at point [point] with radius [number:10] and color [color]',
			script: 'var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.fillStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.restore();'
		},
        {
            blocktype: 'step',
            label: 'stroke circle at point [point] with radius [number:10]',
            script: 'var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();',
            help: 'circle...'
        },
		{
			blocktype: 'step',
			label: 'stroke circle at point [point] with radius [number:10] and color [color]',
			script: 'var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.strokeStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();local.ctx.restore();'
		},
        {
            blocktype: 'step',
            label: 'stroke and fill circle at point [point] with radius [number:10]',
            script: 'var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.stroke();',
            help: 'circle...'
        },
        {
            blocktype: 'step',
            label: 'fill rect [rect]', 
            script: 'var rect## = {{1}};local.ctx.fillRect(rect##.x,rect##.y,rect##.w,rect##.h);',
            help: 'fill...'
        },
		{
			blocktype: 'step',
			label: 'fill rect [rect] with color [color]',
			script: 'var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.fillStyle = color##; local.ctx.fillRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();'
		},
		{
			blocktype: 'step',
			label: 'stroke rect [rect] with color [color]',
			script: 'var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.strokeStyle = color##; local.ctx.strokeRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();'
		},
        {
            blocktype: 'step',
            label: 'stroke rect [rect]', 
            script: 'var rect## = {{1}};local.ctx.strokeRect(rect##.x,rect##.y,rect##.w,rect##.h);',
            help: 'stroke...'
        },
        {
            blocktype: 'step',
            label: 'fill and stroke rect x [number:0] y [number:0] width [number:10] height [number:10]',
            script: 'var local.ctx.fillRect({{1}},{{2}},{{3}},{{4}});local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}});',
            help: 'fill and stroke...'
        },
        // Path API
        {
            blocktype: 'context',
            labels: ['with path'],
            script: 'local.ctx.beginPath();[[1]];local.ctx.closePath();',
            help: 'create a path, run the contained steps, close the path'
        },
        {
            blocktype: 'step',
            label: 'move to point [point]',
            script: 'local.ctx.moveTo({{1}}.x,{{1}}.y);',
            help: 'move to...'
        },
        {
            blocktype: 'step',
            label: 'line to point [point]',
            script: 'local.ctx.lineTo({{1}}.x,{{1}}.y);',
            help: 'line to...'
        },
        {
            blocktype: 'step',
            label: 'quadraditic curve to point [point] with control point [point]',
            script: 'local.ctx.quadraticCurveTo({{2}}.x, {{2}}.y, {{1}}.x, {{1}}.y);',
            help: 'quad curve to ...'
        },
        {
            blocktype: 'step',
            label: 'bezier curve to point [point] with control points [point] and [point]',
            script: 'local.ctx.bezierCurveTo({{2}}.x,{{2}}.y,{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y);',
            help: 'bezier curve to...'
        },
        {
            blocktype: 'step',
            label: 'arc to point1 [point] point1 [point] with radius [number:1.0]',
            script: 'local.ctx.arcTo({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y,{{3}});',
            help: 'I wish I understood this well enough to explain it better'
        },
        {
            blocktype: 'step',
            label: 'arc with origin [point] radius [number:1] start angle [number:0] deg, end angle [number:45] deg [boolean:true]',
            script: 'local.ctx.arc({{1}}.x,{{1}}.y,{{2}},deg2rad({{3}}),deg2rad({{4}}),{{5}});',
            help: 'arc...'  
        },
        {
            blocktype: 'step',
            label: 'rect [rect]',
            script: 'local.ctx.rect({{1}},{{1}},{{1}},{{1}});',
            help: 'rect...'
        },
        {
            blocktype: 'step',
            label: 'circle at point [point] with radius [number:10]',
            script: 'local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);',
            help: 'circle...'
        },
        {
            blocktype: 'step',
            label: 'clip',
            script: 'local.ctx.clip();',
            help: 'adds current path to the clip area'
        },
        {
            blocktype: 'expression',
            label: 'is point [point] in path?',
            script: 'local.ctx.isPointInPath({{1}}.x,{{1}}.y)',
            type: 'boolean',
            help: 'test a point against the current path'
        },
        // Text
        {
            blocktype: 'step',
            label: 'font [number:10] [choice:unit] [string:sans-serif]',
            script: 'local.ctx.font = {{1}}+{{2}}+" "+{{3}};',
            help: 'set the current font'
        },
        {
            blocktype: 'step',
            label: 'text align [choice:align]',
            script: 'local.ctx.textAlign = {{1}};',
            help: 'how should the text align?'
        },
        {
            blocktype: 'step',
            label: 'text baseline [choice:baseline]',
            script: 'local.ctx.textBaseline = {{1}};',
            help: 'set the text baseline'
        },
        {
            blocktype: 'step',
            label: 'fill text [string] x [number:0] y [number:0]',
            script: 'local.ctx.fillText({{1}},{{2}},{{3}});',
            help: 'basic text operation'
        },
        {
            blocktype: 'step',
            label: 'fill text [string] x [number:0] y [number:0] max width [number:10]',
            script: 'local.ctx.fillText({{1}},{{2}},{{3}},{{4}});',
            help: 'basic text operation with optional max width'
        },
        {
            blocktype: 'step',
            label: 'stroke text [string] x [number:0] y [number:0]',
            script: 'local.ctx.strokeText({{1}},{{2}},{{3}});',
            help: 'outline the text'
        },
        {
            blocktype: 'step',
            label: 'stroke text [string] x [number:0] y [number:0] max width [number:10]',
            script: 'local.ctx.strokeText({{1}},{{2}},{{3}},{{4}});',
            help: 'outline the text with optional max width'
        },
        {
            blocktype: 'expression',
            label: 'text [string] width',
            script: 'local.ctx.measureText({{1}}).width',
            type: 'number'
        },
        // Drawing Images
        {
            blocktype: 'step',
            label: 'draw image [image] at point [point]',
            script: 'var img = {{1}}, point={{2}}; local.ctx.drawImage(img,point.x,point.y);',
            help: 'draw the HTML &lt;img&gt; into the canvas without resizing'
        },
        {
            blocktype: 'step',
            label: 'draw image [image] in rect [rect]',
            script: 'local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y,{{2}}.w,{{2}}.h);',
            help: 'draw the HTML &lt;img&gt; into the canvas sized to the given dimension'
        },
        {
            blocktype: 'step',
            label: 'draw a rect [rect] from image [image] to rect [rect]',
            script: 'local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);',
            help: 'draw a rect extracted from image into a rect specified on the canvas'
        },
//         {
//             label: 'draw canvas [canvas] x [number:0] y [number:0]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}}',
//             help: 'draw the HTML &lt;canvas&gt; into the canvas without resizing'
//         },
//         {
//             label: 'draw canvas [canvas] x [number:0] y [number:0] width [number:10] height [number:10]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}},{{4}},{{5}});',
//             help: 'draw the HTML &lt;canvas&gt; into the canvas sized to the given dimension'
//         },
//         {
//             label: 'draw a rect [rect] from canvas [canvas] to rect [rect]',
//             script: 'local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);',
//             help: 'draw a rect extracted from canvas into a rect specified on the canvas'
//         },
//         {
//             label: 'draw video [video] x [number:0] y [number:0]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}}',
//             help: 'draw the HTML &lt;video&gt; into the canvas without resizing'
//         },
//         {
//             label: 'draw video [video] x [number:0] y [number:0] width [number:10] height [number:10]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}},{{4}},{{5}});',
//             help: 'draw the HTML &lt;video&gt; into the canvas sized to the given dimension'
//         },
//         {
//             label: 'draw a rect [rect] from video [video] to rect [rect]',
//             script: 'local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);',
//             help: 'draw a rect extracted from video into a rect specified on the canvas'
//         },
        // Pixel Manipulation
        {
            blocktype: 'step',
            label: 'create ImageData## with size [size]',
            script: 'local.imageData## = local.ctx.createImageData({{1}}.w,{{1}}.h);',
            returns: {
                blocktype: 'expression',
                label: 'imageData##',
                script: 'local.imageData##',
                type: 'imagedata'
            },
            help: 'initialize a new imageData with the specified dimensions'
        },
        {
            blocktype: 'step',
            label: 'createImageData## from imageData [imageData]',
            script: 'local.imageData## = local.ctx.createImageData({{1}});',
            returns: {
                blocktype: 'expression',
                label: 'imageData##',
                script: 'local.imageData##',
                type: 'imagedata'
            },
            help: 'initialized a new imageData the same size as an existing imageData'
        },
        {
            blocktype: 'step',
            label: 'get imageData## for rect [rect]',
            script: 'local.imageData## = local.ctx.getImageData({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            returns: {
                blocktype: 'expression',
                label: 'imageData##',
                script: 'local.imageData##',
                type: 'imagedata'
            },
            help: 'returns the image data from the specified rectangle'
        },
        {
            blocktype: 'step',
            label: 'draw imageData [imagedata] at point [point]',
            script: 'local.ctx.putImageData({{1}},{{2}}.x,{{2}}.y);',
            help: 'draw the given image data into the canvas at the given coordinates'
        },
        {
            blocktype: 'step',
            label: 'draw a rect [rect] from imageData [imagedata] at point [point]',
            script: 'local.ctx.putImageData({{2}},{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'draw the given image data into the canvas from the given rect to the given position'
        },
        {
            blocktype: 'expression',
            label: 'imageData [imagedata] width',
            script: '{{1}}.width',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'imageData [imagedata] height',
            script: '{{1}}.height',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'imageData [imagedata] as array',
            script: '{{1}}.data',
            type: 'array'
        },
        // Compositing
        {
            blocktype: 'step',
            label: 'global alpha [number:1.0]',
            script: 'local.ctx.globalAlpha = {{1}};',
            help: 'set the global alpha'
        },
        {
            blocktype: 'step',
            label: 'global composite operator [choice:globalCompositeOperators]',
            script: 'local.ctx.globalCompositOperator = {{1}};',
            help: 'set the global composite operator'
        },
        // Transforms
        {
            blocktype: 'step',
            label: 'scale x [number:1.0] y [number:1.0]', 
            script: 'local.ctx.scale({{1}},{{2}});',
            help: 'change the scale of subsequent drawing'
        },
        {
            blocktype: 'step',
            label: 'rotate by [number:0] degrees', 
            script: 'local.ctx.rotate(deg2rad({{1}}));',
            help: 'rotate...'
        },
        {
            blocktype: 'step',
            label: 'translate by x [number:0] y [number:0]', 
            script: 'local.ctx.translate({{1}},{{2}});',
            help: 'translate...'
        },
        {
            blocktype: 'step',
            label: 'transform by 6-matrix [array]',
            script: 'if ({{1}}.length !== 6){alert("Array must have 6 numbers"); return false;}local.ctx.transform.apply(local.ctx, {{1}});',
            help: 'transform by an arbitrary matrix [a,b,c,d,e,f]'
        },
        {
            blocktype: 'step',
            label: 'set transform to 6-matrix [array]',
            script: 'if ({{1}}.length !== 6){alert("Array must have 6 numbers"); return false;}local.ctx.setTransform.apply(local.ctx, {{1}});',
            help: 'set transform to an arbitrary array [a,b,c,d,e,f]'
        },
        // Line caps/joins
        
        {
            blocktype: 'step',
            label: 'line width [number:1]',
            script: 'local.ctx.lineWidth = {{1}};',
            help: 'set line width'
        },
        {
            blocktype: 'step',
            label: 'line cap [choice:linecap]',
            script: 'local.ctx.lineCap = {{1}};',
            help: 'set line cap'
        },
        {
            blocktype: 'step',
            label: 'line join [choice:linejoin]',
            script: 'local.ctx.lineJoin = {{1}};',
            help: 'set line join'
        },
        {
            blocktype: 'step',
            label: 'mitre limit [number:10]',
            script: 'local.ctx.mitreLimit = {{1}};',
            help: 'set mitre limit'
        },
        // Shadows
        {
            blocktype: 'step',
            label: 'shadow offset x [number:0] y [number:0]',
            script: 'local.ctx.shadowOffsetX = {{1}}; local.ctx.shadowOffsetY = {{2}}',
            help: 'set the offsets for shadow'
        },
        {
            blocktype: 'step',
            label: 'shadow blur [number:0]',
            script: 'local.ctx.shadowBlur = {{1}}',
            help: 'set the shadow blur radius'
        },
        {
            blocktype: 'step',
            label: 'shadow color [color]',
            script: 'local.ctx.shadowColor = {{1}}',
            help: 'set the shadow color'
        }
    ]);
	
	// COLORS Menu
	wb.menu('Colors', [
        // Colour and Styles
        {
            blocktype: 'step',
            label: 'stroke color [color:#000]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'stroke color...'
        },
        {
            blocktype: 'step',
            label: 'fill color [color:#000]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'fill color...'
        },
		{
			blocktype: 'expression',
			label: 'color with red [number:0] green [number:0] blue [number:0]',
			script: '"rgb({{1}},{{2}}{{3}})"',
			type: 'color',
			help: 'returns a color'
		},
		{
			blocktype: 'expression',
			label: 'color with red [number:0] green [number:0] blue [number:0] alpha [number:0]',
			script: '"rgba({{1}},{{2}},{{3}},{{4}})"',
			type: 'color',
			help: 'returns a semi-opaque color'
		},
		{
			blocktype: 'expression',
			type: 'color',
			label: 'color with hue [number:0] saturation [number:0] brightness [number:0]]',
			script: '"hsb({{1}}, {{2}}, {{3}})"',
			help: 'returns a color'
		},
		{
			blocktype: 'expression',
			type: 'color',
			label: 'random color',
			script: '"rgb(" + randint(0,255) + "," + randint(0,255) + "," + randint(0,255) + ")"',
			help: 'returns a random color'
		},
        {
            blocktype: 'step',
            label: 'stroke gradient [gradient]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'replaces stroke color or stroke pattern with gradient'
        },
        {
            blocktype: 'step',
            label: 'fill gradient [gradient]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'replaces fill color or fill pattern with gradient'
        },
        {
            blocktype: 'step',
            label: 'stroke pattern [pattern]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'replaces stroke color or stroke gradient with pattern'
        },
        {
            blocktype: 'step',
            label: 'fill pattern [pattern]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'replaces fill color or fill gradient with pattern'
        },
        {
            blocktype: 'step',
            label: 'create radial gradient from point1 [point] radius1 [number:0] to point2 [point] radius2 [number:0]',
            script: 'local.gradient## = local.ctx.createRadialGradient({{1}}.x,{{1}}.y,{{2}},{{3}}.x,{{3}}.y,{{4}});',
            help: 'create a radial gradient in the cone described by two circles',
            returns: {
                blocktype: 'expression',
                label: 'radial gradient##',
                script: 'local.gradient##',
                type: 'gradient'
            }
        },
        {
            blocktype: 'step',
            label: 'create linear gradient from point1 [point] to point2 [point]',
            script: 'local.gradient## = local.ctx.createLinearGradient({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y);',
            help: 'create a linear gradient between two points',
            returns: {
                blocktype: 'expression',
                label: 'linear gradient##',
                script: 'local.linear.gradient##',
                type: 'gradient'
            }
        },
        {
            blocktype: 'step',
            label: 'add color stop to gradient [gradient] at offset [number:0.5] with color [color:#F00]',
            script: '{{1}}.addColorStop({{2}}, {{3}}',
            help: 'creates an additional color stop, offset must be between 0.0 and 1.0'
        },
        {
            blocktype: 'step',
            label: 'create pattern## from image [image] repeats [choice:repetition]',
            script: 'local.pattern## = local.ctx.createPattern({{1}}, {{2}});',
            help: 'create a pattern with the given html image',
            returns: {
                blocktype: 'expression',
                label: 'pattern##',
                script: 'local.pattern##',
                type: 'pattern'
            }
        },
//         {
//             label: 'create pattern## from canvas [canvas] repeats [choice:repetition]',
//             script: 'local.pattern## = local.ctx.createPattern({{1}}, {{2}});',
//             help: 'create a pattern with the given html canvas',
//             returns: {
//                 blocktype: 'expression',
//                 label: 'pattern##',
//                 script: 'local.pattern##',
//                 type: 'pattern'
//             }
//         },
//         {
//             label: 'create pattern## from video [video] repeats [choice:repetition]',
//             script: 'local.pattern## = local.ctx.createPattern({{1}}, {{2}});',
//             help: 'create a pattern with the given html video',
//             returns: {
//                 blocktype: 'expression',
//                 label: 'pattern##',
//                 script: 'local.pattern##',
//                 type: 'pattern'
//             }
//         },
	]);
    
    // POINT Menu
    wb.menu('Point', [
        {
            blocktype: 'expression',
            label: 'point at x [number:0] y [number:0]',
            script: '{x: {{1}}, y: {{2}} }',
            type: 'point'
        },
        {
            blocktype: 'expression',
			type: 'point',
            label: 'point from array [array]',
            script: '{x: {{1}}[0], y: {{1}}[1]}',
            type: 'point'
        },
		{
			blocktype: 'expression',
			type: 'point',
			label: 'random point',
			script: '{x: randint(0, global.stage_width), y: randint(0, global.stage_height)}',
			help: 'returns a point at a random location on the stage'
		},
        {
            blocktype: 'expression',
            label: 'point [point] x',
            script: '{{1}}.x',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'point [point] y',
            script: '{{1}}.y',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'point [point] as array',
            script: '[{{1}}.x, {{1}}.y]',
            type: 'array'
        }
    ]);
    
    // SIZE Menu
    wb.menu('Size', [
        {
            blocktype: 'expression',
            label: 'size with width [number:10] height [number:10]',
            script: '{w: {{1}}, h: {{2}} }',
            type: 'size'
        },
        {
            blocktype: 'expression',
            label: 'size from array [array]',
            script: '{w: {{1}}[0], h: {{1}}[1]',
            type: 'size'
        },
        {
            blocktype: 'expression',
            label: 'size [size] width',
            script: '{{1}}.w',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'size [size] height',
            script: '{{1}}.h',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'size [size] as array',
            script: '[{{1}}.w, {{1}}.h]',
            type: 'array'
        }
    ]);
    
    // RECT Menu
    wb.menu('Rect', [
        {
            blocktype: 'expression',
            label: 'rect at x [number:0] y [number:0] with width [number:10] height [number:10]',
            script: '{x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}} }',
            type: 'rect'
        },
        {
            blocktype: 'expression',
            label: 'rect at point [point] with size [size]',
            script: '{x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h}',
            type: 'rect'
        },
        {
            blocktype: 'expression',
            label: 'rect from array [array]',
            script: '{x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] };',
            type: 'rect'
        },
        {
            blocktype: 'expression',
            label: 'rect [rect] position',
            script: '{x: {{1}}.x, y: {{1}}.y}',
            type: 'point'
        },
        {
            blocktype: 'expression',
            label: 'rect [rect] size',
            script: '{w: {{1}}.w, h: {{1}}.h}',
            type: 'size'
        },
        {
            blocktype: 'expression',
            label: 'rect [rect] as array',
            script: '[{{1}}.x, {{1}}.y, {{1}}.w, {{1}}.h]',
            type: 'array'
        },
        {
            blocktype: 'expression',
            label: 'rect [rect] x',
            script: '{{1}}.x',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'rect [rect] y',
            script: '{{1}}.y',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'rect [rect] width',
            script: '{{1}}.w',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'rect [rect] height',
            script: '{{1}}.h',
            type: 'number'
        }
    ]);
    
    // IMAGE Menu
    wb.menu('Image', [
        // TODO: Change this to a container : when loaded, that fires on image load
        {
            blocktype: 'expression',
            label: 'image from url [string]',
            script: '(function(){var img = new Image(); img.src="{{1}}";return img;})()',
            type: 'image'
        },
        {
            blocktype: 'expression',
            label: 'image [image] width',
            script: '{{1}}.width',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'image [image] height',
            script: '{{1}}.height',
            type: 'number'
        },
        {
            blocktype: 'expression',
            label: 'image [image] url',
            script: '{{1}}.width',
            type: 'string'
        }
    ]); 
})();
