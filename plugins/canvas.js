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
            label: 'with local state',
            script: 'local.ctx.save();[[1]];local.ctx.restore();',
            help: 'save the current state, run the contained steps, then restore the saved state',
            id: '9e514499-05a6-4b76-ad4b-1ea888181a8b'
        },
        {
            blocktype: 'step',
            label: 'stroke',
            script: 'local.ctx.stroke();',
            help: 'stroke...',
            id: '99d5828c-ccdd-47db-9abe-f67a8c065fe6'
        },
        {
            blocktype: 'step',
            label: 'fill',
            script: 'local.ctx.fill();',
            help: 'fill...',
            id: 'd540bb5f-7711-4133-a631-53821daeb593'
        },
        {
            blocktype: 'step',
            label: 'clear rect [rect]',
            script: 'local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'clear...',
            id: '3d714bd6-8d02-49cb-8e56-ece642b295ad'
        },
        {
            blocktype: 'step',
            label: 'fill circle at point [point] with radius [number:10]',
            script: 'var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();',
            help: 'circle...',
            id: '3ae0e65c-1d1c-4976-8807-799b0408984b'
        },
		{
			blocktype: 'step',
			label: 'fill circle at point [point] with radius [number:10] and color [color]',
			script: 'var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.fillStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.restore();',
            id: 'e399d950-4d91-49aa-ac42-bfc58299633c'
		},
        {
            blocktype: 'step',
            label: 'stroke circle at point [point] with radius [number:10]',
            script: 'var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();',
            help: 'circle...',
            id: '79133274-d53f-4ef4-8b17-9259fe25fb87'
        },
		{
			blocktype: 'step',
			label: 'stroke circle at point [point] with radius [number:10] and color [color]',
			script: 'var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.strokeStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();local.ctx.restore();',
            id: '8a091a21-1fa9-49b6-a622-696c38556a2e'
		},
        {
            blocktype: 'step',
            label: 'stroke and fill circle at point [point] with radius [number:10]',
            script: 'var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.stroke();',
            help: 'circle...',
            id: '094fa424-8b6f-4759-a9bc-f4dbf289f697'
        },
        {
            blocktype: 'step',
            label: 'fill rect [rect]',
            script: 'var rect## = {{1}};local.ctx.fillRect(rect##.x,rect##.y,rect##.w,rect##.h);',
            help: 'fill...',
            id: 'bf909ec4-5387-4baf-ba43-f17df493f9bd'
        },
		{
			blocktype: 'step',
            id: '7a342b2b-f169-4071-8771-34394cc07393',
			label: 'fill rect [rect] with color [color]',
			script: 'var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.fillStyle = color##; local.ctx.fillRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();'
		},
		{
			blocktype: 'step',
            id: '9cf3a017-ab20-4987-875a-5d8436377bd0',
			label: 'stroke rect [rect] with color [color]',
			script: 'var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.strokeStyle = color##; local.ctx.strokeRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();'
		},
        {
            blocktype: 'step',
            id: 'b28a6aeb-bbad-4828-8ff1-2f846e556e1a',
            label: 'stroke rect [rect]',
            script: 'var rect## = {{1}};local.ctx.strokeRect(rect##.x,rect##.y,rect##.w,rect##.h);',
            help: 'stroke...'
        },
        {
            blocktype: 'step',
            id: 'ebe1b968-f117-468d-91cb-1e67c5776030',
            label: 'fill and stroke rect x [number:0] y [number:0] width [number:10] height [number:10]',
            script: 'var local.ctx.fillRect({{1}},{{2}},{{3}},{{4}});local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}});',
            help: 'fill and stroke...'
        },
        // Path API
        {
            blocktype: 'context',
            id: '5bd66c5d-1a66-4cbb-8984-a4361270c2c6',
            label: 'with path',
            script: 'local.ctx.beginPath();[[1]];local.ctx.closePath();',
            help: 'create a path, run the contained steps, close the path'
        },
        {
            blocktype: 'step',
            id: 'f9c9328b-746c-468b-90fa-4d3da4cb1479',
            label: 'move to point [point]',
            script: 'local.ctx.moveTo({{1}}.x,{{1}}.y);',
            help: 'move to...'
        },
        {
            blocktype: 'step',
            id: '1dec1d26-282b-4d14-b943-6c06ebdd5ceb',
            label: 'line to point [point]',
            script: 'local.ctx.lineTo({{1}}.x,{{1}}.y);',
            help: 'line to...'
        },
        {
            blocktype: 'step',
            id: 'e79ff085-fb9a-46cb-8e4f-f61c5563d73b',
            label: 'quadradic curve to point [point] with control point [point]',
            script: 'local.ctx.quadraticCurveTo({{2}}.x, {{2}}.y, {{1}}.x, {{1}}.y);',
            help: 'quad curve to ...'
        },
        {
            blocktype: 'step',
            id: 'f311980c-eb49-4e42-9e9b-a4bdf428d5b5',
            label: 'bezier curve to point [point] with control points [point] and [point]',
            script: 'local.ctx.bezierCurveTo({{2}}.x,{{2}}.y,{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y);',
            help: 'bezier curve to...'
        },
        {
            blocktype: 'step',
            id: 'adf632ea-02e1-4087-8dfd-91e41ec520b1',
            label: 'arc to point1 [point] point1 [point] with radius [number:1.0]',
            script: 'local.ctx.arcTo({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y,{{3}});',
            help: 'I wish I understood this well enough to explain it better'
        },
        {
            blocktype: 'step',
            id: '5b46a44d-6974-4eb9-ac35-ba1ec5a79304',
            label: 'arc with origin [point] radius [number:1] start angle [number:0] deg, end angle [number:45] deg [boolean:true]',
            script: 'local.ctx.arc({{1}}.x,{{1}}.y,{{2}},deg2rad({{3}}),deg2rad({{4}}),{{5}});',
            help: 'arc...'
        },
        {
            blocktype: 'step',
            id: '236e2fb4-3705-4465-9aa8-d7128e1f1c7f',
            label: 'rect [rect]',
            script: 'local.ctx.rect({{1}},{{1}},{{1}},{{1}});',
            help: 'rect...'
        },
        {
            blocktype: 'step',
            id: 'e4198722-951c-4dd9-8396-a70813478152',
            label: 'circle at point [point] with radius [number:10]',
            script: 'local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);',
            help: 'circle...'
        },
        {
            blocktype: 'step',
            id: 'db455432-c7dd-4cba-af80-1802e38446c2',
            label: 'clip',
            script: 'local.ctx.clip();',
            help: 'adds current path to the clip area'
        },
        {
            blocktype: 'expression',
            id: '5b0fd9a6-39e7-4a70-86f8-1e7dc1c7166f',
            label: 'is point [point] in path?',
            script: 'local.ctx.isPointInPath({{1}}.x,{{1}}.y)',
            type: 'boolean',
            help: 'test a point against the current path'
        },
        // Text
        {
            blocktype: 'step',
            id: 'd16df0dc-f90a-4e21-967d-f054956c8135',
            label: 'font [number:10] [choice:unit] [string:sans-serif]',
            script: 'local.ctx.font = {{1}}+{{2}}+" "+{{3}};',
            help: 'set the current font'
        },
        {
            blocktype: 'step',
            id: '7ea4ef80-8355-4987-8d3b-165367b97cc1',
            label: 'text align [choice:align]',
            script: 'local.ctx.textAlign = {{1}};',
            help: 'how should the text align?'
        },
        {
            blocktype: 'step',
            id: '46345cbf-e095-4b34-9d37-c9dcc22da7db',
            label: 'text baseline [choice:baseline]',
            script: 'local.ctx.textBaseline = {{1}};',
            help: 'set the text baseline'
        },
        {
            blocktype: 'step',
            id: '9f3fb819-f8a9-4929-87c8-6c6742b4cb2d',
            label: 'fill text [string] x [number:0] y [number:0]',
            script: 'local.ctx.fillText({{1}},{{2}},{{3}});',
            help: 'basic text operation'
        },
        {
            blocktype: 'step',
            id: '742ee568-8a27-49d5-9dce-8b9151b30bef',
            label: 'fill text [string] x [number:0] y [number:0] max width [number:10]',
            script: 'local.ctx.fillText({{1}},{{2}},{{3}},{{4}});',
            help: 'basic text operation with optional max width'
        },
        {
            blocktype: 'step',
            id: 'b9bfe426-3110-4b67-bc4e-5da48103e890',
            label: 'stroke text [string] x [number:0] y [number:0]',
            script: 'local.ctx.strokeText({{1}},{{2}},{{3}});',
            help: 'outline the text'
        },
        {
            blocktype: 'step',
            id: '6d03d273-8c5d-4059-b525-641ceb7ed662',
            label: 'stroke text [string] x [number:0] y [number:0] max width [number:10]',
            script: 'local.ctx.strokeText({{1}},{{2}},{{3}},{{4}});',
            help: 'outline the text with optional max width'
        },
        {
            blocktype: 'expression',
            id: '7edfa688-bdbb-491b-9011-4cb866b7dc2e',
            label: 'text [string] width',
            script: 'local.ctx.measureText({{1}}).width',
            type: 'number'
        },
        // Drawing Images
        {
            blocktype: 'step',
            id: '1a6150d8-b3d5-46e3-83e5-a4fe3b00f7db',
            label: 'draw image [image] at point [point]',
            script: 'var img = {{1}}, point={{2}}; local.ctx.drawImage(img,point.x,point.y);',
            help: 'draw the HTML &lt;img&gt; into the canvas without resizing'
        },
        {
            blocktype: 'step',
            id: 'da300b03-1d39-4865-ab99-beec07b53bb2',
            label: 'draw image [image] in rect [rect]',
            script: 'local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y,{{2}}.w,{{2}}.h);',
            help: 'draw the HTML &lt;img&gt; into the canvas sized to the given dimension'
        },
        {
            blocktype: 'step',
            id: '5514e085-970f-48c2-b6bf-a443488c3c07',
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
            id: '6c79800c-af02-48e1-b9cb-d043e8299f7a',
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
            id: '2137c296-1666-499c-871c-60226188f031',
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
            id: 'a2745268-a506-46b6-8d96-e4c275dd5584',
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
            id: '207c93f2-d8c7-4b87-99bf-d79b61faafc2',
            label: 'draw imageData [imagedata] at point [point]',
            script: 'local.ctx.putImageData({{1}},{{2}}.x,{{2}}.y);',
            help: 'draw the given image data into the canvas at the given coordinates'
        },
        {
            blocktype: 'step',
            id: '52ecfee7-005f-45ef-8c2a-df7b15dd974f',
            label: 'draw a rect [rect] from imageData [imagedata] at point [point]',
            script: 'local.ctx.putImageData({{2}},{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'draw the given image data into the canvas from the given rect to the given position'
        },
        {
            blocktype: 'expression',
            id: '578ba232-d1c2-4354-993d-8538bbaf4de2',
            label: 'imageData [imagedata] width',
            script: '{{1}}.width',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '01bc0775-1a0b-4d0f-b009-786e18417703',
            label: 'imageData [imagedata] height',
            script: '{{1}}.height',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '5e97eed9-acf7-45af-838e-fae9bf85921c',
            label: 'imageData [imagedata] as array',
            script: '{{1}}.data',
            type: 'array'
        },
        // Compositing
        {
            blocktype: 'step',
            id: 'c7e2e322-921a-4a96-9c86-9dbbaf54eb53',
            label: 'global alpha [number:1.0]',
            script: 'local.ctx.globalAlpha = {{1}};',
            help: 'set the global alpha'
        },
        {
            blocktype: 'step',
            id: '0237bbab-d62a-4ff9-afb8-4a64bc98dbc3',
            label: 'global composite operator [choice:globalCompositeOperators]',
            script: 'local.ctx.globalCompositOperator = {{1}};',
            help: 'set the global composite operator'
        },
        // Transforms
        {
            blocktype: 'step',
            id: '96085392-9a2d-4857-85f1-af2af72cf800',
            label: 'scale x [number:1.0] y [number:1.0]',
            script: 'local.ctx.scale({{1}},{{2}});',
            help: 'change the scale of subsequent drawing'
        },
        {
            blocktype: 'step',
            id: '5e6ce8f8-d5a2-454e-8e88-d5155fb0eef0',
            label: 'rotate by [number:0] degrees',
            script: 'local.ctx.rotate(deg2rad({{1}}));',
            help: 'rotate...'
        },
        {
            blocktype: 'step',
            id: 'df0ffca8-dd43-45aa-8b9f-b7d588090cd5',
            label: 'translate by x [number:0] y [number:0]',
            script: 'local.ctx.translate({{1}},{{2}});',
            help: 'translate...'
        },
        {
            blocktype: 'step',
            id: '0f9e96f3-52d3-4ace-afdf-c598c1bd31ed',
            label: 'transform by 6-matrix [array]',
            script: 'if ({{1}}.length !== 6){alert("Array must have 6 numbers"); return false;}local.ctx.transform.apply(local.ctx, {{1}});',
            help: 'transform by an arbitrary matrix [a,b,c,d,e,f]'
        },
        {
            blocktype: 'step',
            id: '64e785e8-147a-4a9f-8439-cdba5f148ea1',
            label: 'set transform to 6-matrix [array]',
            script: 'if ({{1}}.length !== 6){alert("Array must have 6 numbers"); return false;}local.ctx.setTransform.apply(local.ctx, {{1}});',
            help: 'set transform to an arbitrary array [a,b,c,d,e,f]'
        },
        // Line caps/joins

        {
            blocktype: 'step',
            id: 'd297afc2-3941-4977-a6af-d7f4e222b467',
            label: 'line width [number:1]',
            script: 'local.ctx.lineWidth = {{1}};',
            help: 'set line width'
        },
        {
            blocktype: 'step',
            id: 'b538aadd-e90d-4d0d-bc12-95b7df9c2a61',
            label: 'line cap [choice:linecap]',
            script: 'local.ctx.lineCap = {{1}};',
            help: 'set line cap'
        },
        {
            blocktype: 'step',
            id: '4b3f5315-295c-46d7-baf2-e791c707cf4f',
            label: 'line join [choice:linejoin]',
            script: 'local.ctx.lineJoin = {{1}};',
            help: 'set line join'
        },
        {
            blocktype: 'step',
            id: 'c3aec6b2-ccb1-4e24-b00f-0736214f44c3',
            label: 'mitre limit [number:10]',
            script: 'local.ctx.mitreLimit = {{1}};',
            help: 'set mitre limit'
        },
        // Shadows
        {
            blocktype: 'step',
            id: 'f28b6498-87f7-4b39-bf16-81644a2a1996',
            label: 'shadow offset x [number:0] y [number:0]',
            script: 'local.ctx.shadowOffsetX = {{1}}; local.ctx.shadowOffsetY = {{2}}',
            help: 'set the offsets for shadow'
        },
        {
            blocktype: 'step',
            id: '278b0b41-895c-4786-9c09-d745ae5501af',
            label: 'shadow blur [number:0]',
            script: 'local.ctx.shadowBlur = {{1}}',
            help: 'set the shadow blur radius'
        },
        {
            blocktype: 'step',
            id: '01e39af1-679d-4b4d-b30e-a093a2687063',
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
            id: '9286b647-2c6f-4fbe-ae92-3d0062bc438f',
            label: 'stroke color [color:#000]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'stroke color...'
        },
        {
            blocktype: 'step',
            id: '6fe550a9-c630-4876-950c-f727de27b7ae',
            label: 'fill color [color:#000]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'fill color...'
        },
		{
			blocktype: 'expression',
            id: '271c8b4c-b045-4ff9-8ad5-9608ea204b09',
			label: 'color with red [number:0] green [number:0] blue [number:0]',
			script: '"rgb({{1}},{{2}},{{3}})"',
			type: 'color',
			help: 'returns a color'
		},
		{
			blocktype: 'expression',
            id: '13236aef-cccd-42b3-a041-e26528174323',
			label: 'color with red [number:0] green [number:0] blue [number:0] alpha [number:0]',
			script: '"rgba({{1}},{{2}},{{3}},{{4}})"',
			type: 'color',
			help: 'returns a semi-opaque color'
		},
		{
			blocktype: 'expression',
            id: 'e9496816-4f7b-47d3-8c70-163df835230c',
			type: 'color',
			label: 'color with hue [number:0] saturation [number:0] brightness [number:0]]',
			script: '"hsb({{1}}, {{2}}, {{3}})"',
			help: 'returns a color'
		},
		{
			blocktype: 'expression',
            id: 'da9a266b-8ec0-4b97-bd79-b18dc7d4596f',
			type: 'color',
			label: 'random color',
			script: '"rgb(" + randint(0,255) + "," + randint(0,255) + "," + randint(0,255) + ")"',
			help: 'returns a random color'
		},
        {
            blocktype: 'step',
            id: 'c2d8442b-c9eb-45bb-8ca6-69f2e6d4c7c7',
            label: 'stroke gradient [gradient]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'replaces stroke color or stroke pattern with gradient'
        },
        {
            blocktype: 'step',
            id: 'b80bc4ea-7f07-4dd5-b2f9-d8f09e0aca55',
            label: 'fill gradient [gradient]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'replaces fill color or fill pattern with gradient'
        },
        {
            blocktype: 'step',
            id: '7fd65106-276d-43f3-b433-5ce6b750d511',
            label: 'stroke pattern [pattern]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'replaces stroke color or stroke gradient with pattern'
        },
        {
            blocktype: 'step',
            id: '9f54e5b1-f539-4005-bd8e-5b759e776bba',
            label: 'fill pattern [pattern]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'replaces fill color or fill gradient with pattern'
        },
        {
            blocktype: 'step',
            id: '5caf94c7-f489-4423-a0c7-d1ad066c4dc7',
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
            id: 'be35754d-da0e-4b26-b8f1-9a4f36e902c3',
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
            id: 'a0783aab-194c-4059-8f8e-4afd93ec1ca5',
            label: 'add color stop to gradient [gradient] at offset [number:0.5] with color [color:#F00]',
            script: '{{1}}.addColorStop({{2}}, {{3}}',
            help: 'creates an additional color stop, offset must be between 0.0 and 1.0'
        },
        {
            blocktype: 'step',
            id: '3a6b43b7-3392-4f0d-b2b7-c5e1dc0cf501',
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
//             blocktype: 'step',
//             id: '17e6d6ad-102a-420b-b6ed-4a30c8a24209',
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
//             blocktype: 'step',
//             id: 'f71e348e-20f8-47c3-9fe8-b859e61806ae',
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
            id: '71eb3271-6dc0-4a82-81cc-4c50d8acb9e7',
            label: 'point at x [number:0] y [number:0]',
            script: '{x: {{1}}, y: {{2}} }',
            type: 'point',
            help: 'create a new point'
        },
        {
            blocktype: 'expression',
            id: 'efe5e679-8336-4e5a-ade0-4bd930826096',
			type: 'point',
            label: 'point from array [array]',
            script: '{x: {{1}}[0], y: {{1}}[1]}',
            help: 'convert array to point'
        },
		{
			blocktype: 'expression',
            id: '29803c49-5bd5-4473-bff7-b3cf66ab9711',
			type: 'point',
			label: 'random point',
			script: '{x: randint(0, global.stage_width), y: randint(0, global.stage_height)}',
			help: 'returns a point at a random location on the stage'
		},
        {
            blocktype: 'expression',
            id: '36f0eb56-9370-402d-83ef-99201a62c732',
            label: 'point [point] x',
            script: '{{1}}.x',
            type: 'number',
            help: 'get the x value of a point'
        },
        {
            blocktype: 'expression',
            id: '90b42cf3-185d-4556-b7e8-d9682c187425',
            label: 'point [point] y',
            script: '{{1}}.y',
            type: 'number',
            help: 'get the y value of a point'
        },
        {
            blocktype: 'expression',
            id: '743cba63-11d4-4a84-a3b6-a98480bdd731',
            label: 'point [point] as array',
            script: '[{{1}}.x, {{1}}.y]',
            type: 'array',
            help: 'convert a point to an array'
        }
    ]);

    // SIZE Menu
    wb.menu('Size', [
        {
            blocktype: 'expression',
            id: 'd8e71067-afc2-46be-8bb5-3527b36474d7',
            label: 'size with width [number:10] height [number:10]',
            script: '{w: {{1}}, h: {{2}} }',
            type: 'size'
        },
        {
            blocktype: 'expression',
            id: '404cb2f4-abe5-4c3b-a9da-9b44050e012d',
            labels:[ 'size from array [array]'],
            script: '{w: {{1}}[0], h: {{1}}[1]',
            type: 'size'
        },
        {
            blocktype: 'expression',
            id: '33f2a3b7-5d87-4481-ad1c-f2970915db51',
            label: 'size [size] width',
            script: '{{1}}.w',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '2d449e0e-cb18-473f-a574-614320b7ba22',
            label: 'size [size] height',
            script: '{{1}}.h',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '7ca31ad7-946a-4587-a5c8-d6b8879dc4e2',
            label: 'size [size] as array',
            script: '[{{1}}.w, {{1}}.h]',
            type: 'array'
        }
    ]);

    // RECT Menu
    wb.menu('Rect', [
        {
            blocktype: 'expression',
            id: '67924ef4-71eb-4793-9599-d8605b14320a',
            label: 'rect at x [number:0] y [number:0] with width [number:10] height [number:10]',
            script: '{x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}} }',
            type: 'rect'
        },
        {
            blocktype: 'expression',
            id: '24b44fea-7be1-472a-a203-2a0d97515311',
            label: 'rect at point [point] with size [size]',
            script: '{x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h}',
            type: 'rect'
        },
        {
            blocktype: 'expression',
            id: '68c9cfd0-d06b-41ae-9eac-d762126f6bd7',
            label: 'rect from array [array]',
            script: '{x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] };',
            type: 'rect'
        },
        {
            blocktype: 'expression',
            id: 'aed385a0-7439-4b36-ad3e-fd07c562523a',
            label: 'rect [rect] position',
            script: '{x: {{1}}.x, y: {{1}}.y}',
            type: 'point'
        },
        {
            blocktype: 'expression',
            id: '453db037-c418-467b-8808-52d84c7a3273',
            label: 'rect [rect] size',
            script: '{w: {{1}}.w, h: {{1}}.h}',
            type: 'size'
        },
        {
            blocktype: 'expression',
            id: '599f6375-e26e-414c-9740-fa9fcfc8ff00',
            label: 'rect [rect] as array',
            script: '[{{1}}.x, {{1}}.y, {{1}}.w, {{1}}.h]',
            type: 'array'
        },
        {
            blocktype: 'expression',
            id: 'c95a1658-e1ec-4500-8766-abab8f67f865',
            label: 'rect [rect] x',
            script: '{{1}}.x',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '7ee1fb57-7a16-4eff-9077-ade7fad60e86',
            label: 'rect [rect] y',
            script: '{{1}}.y',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '79df9d07-6894-45bc-bcc8-fc565e66df0c',
            label: 'rect [rect] width',
            script: '{{1}}.w',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '8ae2a7ee-712d-4288-ac55-957a7e2b2b72',
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
            id: '7fa79655-4c85-45b3-be9e-a19aa038feae',
            label: 'image from url [string]',
            script: '(function(){var img = new Image(); img.src="{{1}}";return img;})()',
            type: 'image'
        },
        {
            blocktype: 'expression',
            id: 'a7e59ad2-47ab-4240-8801-5d66d8f57fc9',
            label: 'image [image] width',
            script: '{{1}}.width',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: 'd9c7d36e-d15f-48a9-9423-1a6497727221',
            label: 'image [image] height',
            script: '{{1}}.height',
            type: 'number'
        },
        {
            blocktype: 'expression',
            id: '8d90b1fa-2791-4381-add5-c3c5d238ac0d',
            label: 'image [image] url',
            script: '{{1}}.width',
            type: 'string'
        }
    ]);
})();
