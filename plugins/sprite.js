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

function RectSprite(size,pos,color){
    this.x = pos.x;
    this.y = pos.y;
    this.w = size.w;
    this.h = size.h;
    this.collisionRect = this;
    this.color = color;
}
window.RectSprite = RectSprite;

RectSprite.prototype.draw = function(ctx){
    ctx.save();
    ctx.fillStyle = this.color;
    console.log('filling rect <%s,%s,%s,%s> with %s', this.x, this.y, this.w, this.h, this.color);
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.restore();
}

RectSprite.prototype.collides = function(sprite){
    var self = this.collisionRect;
    var that = sprite.collisionRect;
    if ((self.x + self.w) < that.x) return false;
    if ((self.y + self.h) < that.y) return false;
    if (self.x > (that.x + that.w)) return false;
    if (self.y > (that.y + that.h)) return false;
    return true;
}


// Sprite Menu
menu('Sprite', [
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
    }
]);

})();