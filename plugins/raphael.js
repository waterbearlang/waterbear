(function(){

// Pre-load dependencies
yepnope({
    load: [ 'plugins/raphael.css',
            'lib/raphael-1.3.1-min.js',
            'lib/raphael-path.js',
            'lib/sketchy.js',
            'lib/colorwheel.js'
    ]
});


function showColorPicker(){
    var self = $(this);
    cw.input(this);
    cw.onchange(function(){
        var color = self.val();
        self.css({color: color, 'background-color': color});
    });
    $('#color_popup').bPopup({modalColor: 'transparent'});
}
$('.workspace:visible .scripts_workspace').on('click', 'input[type=color]', showColorPicker);
$(document).ready(function(){
    window.cw = Raphael.colorwheel($('#color_contents')[0], 300, 180);
});

    
// Raphael Extensions (making life easier on our script templates)

// Provide the arc of a circle, given the radius and the angles to start and stop at
Raphael.fn.arcslice = function(radius, fromangle, toangle){
   var x1 = Math.cos(deg2rad(fromangle)) * radius, 
       y1 = Math.sin(deg2rad(fromangle)) * radius,
       x2 = Math.cos(deg2rad(toangle)) * radius, 
       y2 = Math.sin(deg2rad(toangle)) * radius;
    var arc = this.path();
    arc.moveTo(x1, y1).arcTo(radius, radius, 0, 1, x2,y2, rad2deg(toangle - fromangle));
    return arc;
};

Raphael.fn.regularPolygon = function(cx,cy,radius, sides, pointsOnly){
    var angle = 0;
    var theta = Math.PI * 2 / sides;
    var x = Math.cos(0) * radius + cx;
    var y = Math.sin(0) * radius + cy;
    if (pointsOnly){
        var points = [[x,y]];
    }else{
        var path = this.path();
        path.moveTo(x,y);
    }
    for (var i = 1; i < sides; i++){
        x = Math.cos(theta * i) * radius + cx;
        y = Math.sin(theta * i) * radius + cy;
        if (pointsOnly){
            points.push([x,y]);
        }else{
            path.lineTo(x,y);
        }
    }
    if (pointsOnly){
        return points;
    }else{
        path.andClose();
        return path;
    }
};

Raphael.fn.imageWithNaturalHeight = function(url){
    var img = this.image(url, 0, 0, 0, 0);
    function getWidthAndHeight() {
        img.attr({width: this.width, height: this.height});
        return true;
    }
    function loadFailure() {
        console.error("'" + this.name + "' failed to load.");
        return true;
    }
    var myImage = new Image();
    myImage.name = url;
    myImage.onload = getWidthAndHeight;
    myImage.onerror = loadFailure;
    myImage.src = "http://waterbearlang.com/images/waterbear.png";
    return img;
};



// expose these globally so the Block/Label methods can find them
$.extend(choiceLists, {
    linecap: ['round', 'butt', 'square'],
    linejoin: ['round', 'bevel', 'mitre'],
    easing: ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'],
    fontweight: ['normal', 'bold', 'inherit']
});
choiceLists.types = choiceLists.types.concat(['color', 'image', 'shape']);
choiceLists.rettypes = choiceLists.rettype.concat(['color', 'image', 'shape']);

// Hints for building blocks
//
//
// Value blocks can nest, so don't end them with semi-colons (i.e., if there is a "type" specified).
//
//
var menus = {
    shapes: wb.menu('Shapes', [
        {
            blocktype: 'step',
            label: 'circle## with radius [number:0] at position x [number:0] y [number:0]',
            script: 'local.shape## = global.paper.circle({{2}}, {{3}}, {{1}});',
            returns: {
                blocktype: 'expression',
                label: 'circle##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws a circle'
        },
        {
            blocktype: 'step',
            label: 'rect## with width [number:0] and height [number:0] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.rect({{3}}, {{4}}, {{1}}, {{2}});',
            returns: {
                blocktype: 'expression',
                label: 'rect##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws a rectangle'
        },
        {
            blocktype: 'step',
            label: 'rounded rect## with width [number:0] height [number:0] and radius [number:0] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.rect({{4}}, {{5}}, {{1}}, {{2}}, {{3}});',
            returns: {
                blocktype: 'expression',
                label: 'rounded rect##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws a rounded rectangle'
        },
        {
            blocktype: 'step',
            label: 'ellipse## x radius [number:0] y radius [number:0] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.ellipse({{3}}, {{4}}, {{1}}, {{2}});',
            returns: {
                blocktype: 'expression',
                label: 'ellipse##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws an ellipse'
        },
        {
            blocktype: 'step',
            label: 'arc## at radius [number:100] from [number:0] degrees to [number:30] degrees centered at x [number:0] y [number:0]',
            script: 'local.shape## = global.paper.arcslice({{1}}, {{2}}, {{3}});',
            returns: {
                blocktype: 'expression',
                label: 'arc##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws an arc around a circle at the given coordinates'
        },
        {
            blocktype: 'step',
            label: 'image## src: [string:http://waterbearlang.com/images/waterbear.png]', 
            script: 'local.shape## = global.paper.imageWithNaturalHeight({{1}});',
            returns: {
                blocktype: 'expression',
                label: 'image##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws an image at the origin'
        },
        {
            blocktype: 'step',
            label: 'clip shape [shape] to rect x [number:0] y [number:0] width [number:50] height [number:50]', 
            script: '{{1}}.last_var.attr("clip-rect", "{{2}},{{3}},{{4}},{{5}}");',
            help: 'make a clipping rect that cuts off other drawing commands'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] fill color [color:#FFFFFF]', 
            script: '{{1}}.attr("fill", {{2}});',
            help: 'change the fill color for the shape'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke color [color:#000000]', 
            script: '{{1}}.attr("stroke", {{2}});',
            help: 'change the stroke color for the shape'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] fill transparent', 
            script: '{{1}}.attr("fill", "transparent");',
            help: 'make the shape fill transparent'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke transparent', 
            script: '{{1}}.attr("stroke", "transparent");',
            help: 'make the current shape stroke transparent'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke linecap [choice:linecap]', 
            script: '{{1}}.attr("stroke-linecap", {{2}});',
            help: 'change the linecap style of the current shape'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke linejoin [choice:linejoin]', 
            script: '{{1}}.attr("stroke-linejoin", {{2}});',
            help: 'change the linejoin style of the shape'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke opacity [number:100]%', 
            script: '{{1}}.attr("stroke-opacity", {{2}}+"%");',
            help: 'change the opacity of the shape stroke'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke width [number:1]', 
            script: '{{1}}.attr("stroke-width", {{2}});',
            help: 'change the line width of the shape stroke'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] rotate [number:5] degrees', 
            script: '{{1}}.rotate({{2}});',
            help: 'rotate the current shape around its origin by the given amount'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] rotate [number:5] degrees around x [number:0] y [number:0]', 
            script: '{{1}}.rotate({{2}}, {{3}}, {{4}});',
            help: 'rotate the shape around an arbitrary point by the given amount'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] clone shape##', 
            script: 'local.shape## = {{1}}.clone()',
            returns: {
                blocktype: 'expression',
                label: 'shape##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'create a copy of the shape'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] fill opacity [number:100]%', 
            script: '{{1}}.attr("fill-opacity", {{2}}+"%")',
            help: 'change the opacity of the shape fill'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] link to [string:http://waterbearlang.com]', 
            script: '{{1}}.attr("href", {{2}})',
            help: 'make the shape a link to the given URL'
        },
        {
            blocktype: 'step',
            label: 'text## [string:Hello World] at x: [number:0] y: [number:0]', 
            script: 'local.shape## = global.paper.text({{2}}, {{3}}, {{1}});',
            returns: {
                blocktype: 'expression',
                label: 'text##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'write the string at the given coordinates'
        },
        {   
            blocktype: 'step',
            label: 'shape [shape] font family [string:Helvetica]',
            script: '{{1}}.attr("font-family", {{2}});',
            help: 'change the font for the text object'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] font size [number:12]',
            script: '{{1}}.attr("font-size", {{2}});',
            help: 'change the font size for the text object'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] font weight [choice:fontweight]',
            script: '{[1}}.attr("font-weight", {{2}});',
            help: 'change the font weight for the text object'
        }
    ]),
    text: wb.menu('Sketchy', [
        {
            blocktype: 'step',
            label: 'sketchy rect## with width [number:50] and height [number:50] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.sk_rect({{3}},{{4}}, {{1}},{{2}});',
            returns: {
                blocktype: 'expression',
                label: 'sketchy rect##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draw a sketchy rect'
        },
        {
            blocktype: 'step',
            label: 'sketchy ellipse## with width [number:50] and height [number:50] at position x [number:0], y [number:0]', 
            script: 'local.shape## = global.paper.sk_ellipse({{3}},{{4}}, {{1}}, {{2}});',
            returns: {
                blocktype: 'expression',
                label: 'sketchy ellipse##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draw a sketchy ellipse'
        },
        {
            blocktype: 'step',
            label: 'sketchy line## from x1 [number:10] y1 [number:10] to x2 [number:40] y2 [number:40]', 
            script: 'local.shape## = global.paper.sk_line({{1}}, {{2}}, {{3}}, {{4}});',
            returns: {
                blocktype: 'expression',
                label: 'sketchy line##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draw a sketchy line between two points'
        }
    ]),
    transform: wb.menu('Transform', [
        {
            blocktype: 'step',
            label: 'clear canvas', 
            script: 'global.paper.clear();',
            help: 'clear the canvas of all drawing'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] hide', 
            script: '{{1}}.hide();',
            help: 'hide the object'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] show', 
            script: '{{1}}.show();',
            help: 'show the object'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] rotate by [number:0] degrees', 
            script: '{{1}}.rotate({{2}}, false);',
            help: 'rotate the object'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] rotate to [number:0] degrees', 
            script: '{{1}.rotate({{2}}, true);',
            help: 'rotate the object to the given angle around its own center'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] rotate to [number:0] around x: [number:0] y: [number:0]', 
            script: '{{1}}.rotate({{2}}, {{3}}, {{4}}, true);',
            help: 'rotate the current object to the given angle around an arbitrary point'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] translate by x: [number:0] y: [number:0]', 
            script: '{{1}}.translate({{2}}, {{3}});',
            help: 'move the object by the given distances'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] position at x [number:0] y [number:0]', 
            script: '{{1}}.attr({x: {{2}}, y: {{3}}, cx: {{2}}, cy: {{3}} });',
            help: 'move the object to the given coordinates'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] size width [number:100] height [number:100]', 
            script: '{{1}}.attr({width: {{2}}, height: {{3}} })',
            help: 'change the object to the given size'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] scale by [number:0]', 
            script: '{{1}}.scale({{2}}, {{3}});',
            help: 'resize the object by the given scale'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] scaled by [number:0] centered at x: [number:0] y: [number:0]', 
            script: '{{1}}.scale({{2}}, {{3}}, {{4}}, {{5}});',
            help: 'resize the object with scaling centered at an arbitrary point'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] to front', 
            script: '{{1}}.toFront();',
            help: 'move the shape to the foreground'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] to back', 
            script: '{{1}}.toBack();',
            help: 'move the shape to the background'
        }
    ]),
    animation: wb.menu('Animation', [
        {
            blocktype: 'step',
            label: 'shape [shape] position x [number:10] y [number:10] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({translation: "{{2}}, {{3}}"}, {{4}}, {{5}});',
            help: 'change the position of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({opacity: {{2}} }, {{3}}, {{4}});',
            help: 'change the opacity of the current shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] fill color [color:#00FF00] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({fill: {{2}}}, {{3}}, {{4}});',
            help: 'change the fill color of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] fill opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({"fill-opacity": {{2}} }, {{3}}, {{4}});',
            help: 'change the fill opacity of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke color [color:#FF0000] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({stroke: {{2}}}, {{3}}, {{4}});',
            help: 'change the stroke color of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stroke opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({"stroke-opacity": {{2}} }, {{3}}, {{4}});',
            help: 'change the stroke opacity of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] width [number:10] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({width: {{2}} }, {{3}}, {{4}});',
            help: 'change the width of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] height [number:10] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({height: {{2}} }, {{3}}, {{4}});',
            help: 'change the height of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] radius [number:25] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({r: {{2}} }, {{3}}, {{4}});',
            help: 'change the radius of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] rotation [number:15] degrees over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({rotation: {{2}} }, {{3}}, {{4}});',
            help: 'change the rotation of the shape over time'
        },
        {
            blocktype: 'step',
            label: 'shape [shape] stop animations',
            script: '{{1}}.stop()',
            help: 'cancels all animations'
        }
    ])
};

})();