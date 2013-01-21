/* 
 *    Sprite Plugin
 * 
 *    Support for building games using Waterbear
 *
 */

(function(){


// Pre-load dependencies
yepnope({
    load: [ 'plugins/sprite.css'
    ]
});

choiceLists.types = choiceLists.types.concat(['sprite']);
choiceLists.rettypes = choiceLists.rettypes.concat(['sprite']);


// Sprite Menu
wb.menu('Sprite', [
    {
        blocktype: 'step',
        label: 'clear stage to color [color]',
        script: 'local.ctx.save();local.ctx.fillStyle = {{1}};local.ctx.fillRect(0,0,global.stage_width, global.stage_height);local.ctx.restore();',
        help: 'clear the stage to a solid color'
    },
    {
        blocktype: 'step',
        label: 'clear stage to image [image]',
        script: 'local.ctx.drawImage(img, 0,0,img.width,img.height,0,0,global.stage_width,global.stage_height);',
        help: 'clear the stage to a background image'
    },
    {
        blocktype: 'step',
        label: '[size] rectangle sprite at [position] with color [color]',
        script: 'local.sprite## = new RectSprite({{1}}, {{2}}, {{3}});',
        returns: {
            blocktype: 'expression',
            label: 'sprite##',
            script: 'local.sprite##',
            type: 'sprite'
        },
        help: 'create a simple rectangle sprite'
    },
    {
        blocktype: 'step',
        label: 'draw sprite [sprite]',
        script: '{{1}}.draw(local.ctx);',
        help: 'draw the sprite at its current location'
    },
    {
        blocktype: 'expression',
        label: 'sprite [sprite] collides with sprite [sprite]',
        script: '{{1}}.collides({{2}})',
        type: 'boolean',
        help: 'test for collision'
    },
    {
        blocktype: 'step',
        label: 'move [sprite] by x [number] y [number]',
        script: '(function(sprite,dx,dy){sprite.x += dx;sprite.y += dy;})({{1}},{{2}},{{3}})',
        help: 'move a sprite relatively'
    },
    {
        blocktype: 'step',
        label: 'move [sprite] to [point]',
        script: '(function(sprite,pos){sprite.x = pos.x; sprite.y=pos.y;})({{1}},{{2}})',
        help: 'move a sprite absolutely'
    },
    {
        blocktype: 'expression',
        label: 'sprite [sprite] left',
        script: '{{1}}.x',
        help: 'get x (left) position of sprite',
        type: 'number'
    },
    {
        blocktype: 'expression',
        label: 'sprite [sprite] right',
        script: '{{1}}.x + {{1}}.w',
        help: 'get x+w (right) position of sprite',
        type: 'number'
    },
    {
        blocktype: 'expression',
        label: 'sprite [sprite] top',
        script: '{{1}}.y',
        help: 'get y (top) position of sprite',
        type: 'number'
    },
    {
        blocktype: 'expression',
        label: 'sprite [sprite] bottom',
        script: '{{1}}.y + {{1}}.h',
        type: 'number'
    }
]);

wb.menu('MovingSprite', [
]);

})();