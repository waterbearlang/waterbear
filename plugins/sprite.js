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
        id: 'a5ec5438-a3e5-4949-a3d6-296f959670b1',
        label: 'clear stage to color [color]',
        script: 'local.ctx.save();local.ctx.fillStyle = {{1}};local.ctx.fillRect(0,0,global.stage_width, global.stage_height);local.ctx.restore();',
        help: 'clear the stage to a solid color'
    },
    {
        blocktype: 'step',
        id: '9d6b3a43-8319-482e-b0f8-2ce0fe7c2f3a',
        label: 'clear stage to image [image]',
        script: 'local.ctx.drawImage(img, 0,0,img.width,img.height,0,0,global.stage_width,global.stage_height);',
        help: 'clear the stage to a background image'
    },
    {
        blocktype: 'step',
        id: 'eb889480-c381-4cfa-a6ee-7c6928c08817',
        label: 'rectangle sprite## [size] big at [point] with color [color]',
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
        id: 'db5f8b4e-93f2-4f88-934b-5eb4bac40e0d',
        label: 'draw sprite [sprite]',
        script: '{{1}}.draw(local.ctx);',
        help: 'draw the sprite at its current location'
    },
    {
        blocktype: 'expression',
        id: '04c9dfd8-82eb-4f64-9d1c-54b78d744c21',
        label: 'sprite [sprite] collides with sprite [sprite]',
        script: '{{1}}.collides({{2}})',
        type: 'boolean',
        help: 'test for collision'
    },
    {
        blocktype: 'step',
        id: 'd1521a30-c7bd-4f42-b21d-6330a2a73631',
        label: 'move [sprite] by x [number] y [number]',
        script: '(function(sprite,dx,dy){sprite.x += dx;sprite.y += dy;})({{1}},{{2}},{{3}})',
        help: 'move a sprite relatively'
    },
    {
        blocktype: 'step',
        id: '88c75c2b-18f1-4195-92bc-a90d99743551',
        label: 'move [sprite] to [point]',
        script: '(function(sprite,pos){sprite.x = pos.x; sprite.y=pos.y;})({{1}},{{2}})',
        help: 'move a sprite absolutely'
    },
    {
        blocktype: 'expression',
        id: 'a0c6d157-7fc7-4819-9b97-7b81d4c49a83',
        label: 'sprite [sprite] left',
        script: '{{1}}.x',
        help: 'get x (left) position of sprite',
        type: 'number'
    },
    {
        blocktype: 'expression',
        id: '23b4ffd1-3812-4372-8873-8a1b3107bdac',
        label: 'sprite [sprite] right',
        script: '{{1}}.x + {{1}}.w',
        help: 'get x+w (right) position of sprite',
        type: 'number'
    },
    {
        blocktype: 'expression',
        id: '898208b7-4d38-4c24-ba23-0b0443089435',
        label: 'sprite [sprite] top',
        script: '{{1}}.y',
        help: 'get y (top) position of sprite',
        type: 'number'
    },
    {
        blocktype: 'expression',
        id: '8c73e3fd-7c53-4c92-be1d-286db5357cbb',
        label: 'sprite [sprite] bottom',
        script: '{{1}}.y + {{1}}.h',
        type: 'number'
    }
]);

})();
