// Sprite Routines

// This uses and embeds code from https://github.com/jriecken/sat-js
(function(window){
    'use strict';

function Sprite(type, color){
    this.color = color;
    this.type = type;
    this.movementDirection = new SAT.Vector(0, 0);
    this.movementDegrees = 0;
    this.facingDirection = new SAT.Vector(0, 0);
    this.facingDegrees = 0;
    this.speed = 0;
    this.autosteer = false;
    this.circle = null;
    this.polygon = null;
    this.image = null;
    this.text = null;
};

function createImageSprite(size,pos,image){
    var img = createRectSprite(size,pos);
    img.size = size;
    img.image = image;
    return img;
};

function createTextSprite(size,pos,bColor,text,tColor){
    var txt = createRectSprite(size,pos,bColor);
    txt.size = size;
    txt.text = text;
    txt.tColor = tColor;
    return txt;
};

function createRectSprite(size,pos,color){
    var rect = new Sprite('polygon', color);
    rect.polygon = new SAT.Box(new SAT.Vector(pos.x,pos.y), size.w, size.h).toPolygon();
    rect.polygon.average = rect.polygon.calculateAverage();
    rect.calculateBoundingBox();
    return rect;
};

function createPolygonSprite(points,color){
    var poly = new Sprite('polygon', color);
    var vPoints = [];
    for (var i = 0; i < points.length; i++){
        vPoints.push(new SAT.Vector(points[i].x, points[i].y));
    }
    poly.polygon = new SAT.Polygon(new SAT.Vector(0, 0), vPoints);
    poly.polygon.average = poly.polygon.calculateAverage();
    poly.calculateBoundingBox();
    return poly;
};

function createCircleSprite(x, y, r, color){
    var cir = new Sprite('circle', color);
    cir.circle = new SAT.Circle(new SAT.Vector(x, y), r);
    cir.calculateBoundingBox();
    return cir;
};

function createSprite(shape, color){
    switch (shape.type){
        case 'rect':
            return createRectSprite({w: shape.w, h: shape}, {x: shape.x, y: shape.y}, color);

        case 'circle':
            return createCircleSprite(shape.x, shape.y, shape.r, color);

        case 'poly':
            return createPolygonSprite(shape.points, color);
    }
};

Sprite.prototype.isPolygon = function(){
    return this.type === 'polygon';
};

Sprite.prototype.getPos = function(){
    if(this.polygon != null){
        return this.polygon.pos;
    }else if(this.circle != null){
        return this.circle.pos;
    }
}

Sprite.prototype.setPos = function(x, y){
    if(this.polygon != null){
        this.polygon.pos.x = x != null ? x : this.polygon.pos.x;
        this.polygon.pos.y = y != null ? y : this.polygon.pos.y;
        this.polygon.average = this.polygon.calculateAverage();
    }else if(this.circle != null){
        this.circle.pos.x = x != null ? x : this.circle.pos.x;
        this.circle.pos.y = y != null ? y : this.circle.pos.y;
    }
    this.calculateBoundingBox();
}

Sprite.prototype.draw = function(ctx){
    //rotation
    if(this.image != null){
        ctx.save();
        ctx.translate(this.getPos().x,this.getPos().y);
        ctx.rotate( this.facingDegrees *Math.PI/180);
        ctx.drawImage(this.image, 0, 0,this.size.w,this.size.h);
        ctx.restore();
    }else{
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if(this.isPolygon()){
            ctx.moveTo(this.polygon.points[0].x + this.polygon.pos.x, this.polygon.points[0].y + this.polygon.pos.y);
            for (var i = this.polygon.points.length - 1; i >= 1; i--){
                ctx.lineTo(this.polygon.points[i].x + this.polygon.pos.x, this.polygon.points[i].y + this.polygon.pos.y);
            };
        }else{
            ctx.arc(this.circle.pos.x,this.circle.pos.y,this.circle.r,0,Math.PI*2,true);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    if(this.text != null){
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.textAlign="center";
        var height = this.size.h * 0.6;
        ctx.font = String(height) +"px Arial";
        ctx.fillStyle = this.tColor;
        ctx.save();
        ctx.translate(this.getPos().x ,this.getPos().y );
        ctx.rotate( this.facingDegrees *Math.PI/180);
        ctx.fillText(this.text,this.size.w *0.5,this.size.h *0.6, this.size.w *0.8);
        ctx.restore();
    }
};

function isSpriteClicked(sprite){
    if(global.mouse_down){
        var pos = {x: global.mouse_x, y: global.mouse_y};
        var color = null;
        var size = {w: 1, h: 1};
        var detRect = createRectSprite(size, pos, color);
        return detRect.collides(sprite);
    }
    return false;
};

Sprite.prototype.calculateBoundingBox = function(){
    if(this.isPolygon()){
        var minX, maxX, minY, maxY;
        var points = this.polygon.points;
        for(var i=0; i < points.length; i++){

            minX = (points[i].x < minX || minX == null) ? points[i].x : minX;
            maxX = (points[i].x > maxX || maxX == null) ? points[i].x : maxX;
            minY = (points[i].y < minY || minY == null) ? points[i].y : minY;
            maxY = (points[i].y > maxY || maxY == null) ? points[i].y : maxY;
        }
        this.x = minX + this.polygon.pos.x;
        this.y = minY + this.polygon.pos.y;
        this.w = maxX - minX;
        this.h = maxY - minY;
    }else{
        this.x = this.circle.pos.x - this.circle.r;
        this.y = this.circle.pos.y - this.circle.r;
        this.w = this.circle.r * 2;
        this.h = this.circle.r * 2;
    }
};

Sprite.prototype.collides = function(sprite, response){
    if(this.isPolygon() && sprite.isPolygon()){
        return SAT.testPolygonPolygon(this.polygon, sprite.polygon, response);
    }else if(this.isPolygon()){
        return SAT.testPolygonCircle(this.polygon, sprite.circle, response);
    }else if(sprite.isPolygon()){
        return SAT.testCirclePolygon(this.circle,sprite.polygon, response);
    }else{
        return SAT.testCircleCircle(this.circle, sprite.circle, response);
    }
};

Sprite.prototype.bounceOff = function(sprite){
    var response = new SAT.Response();
    if(this.collides(sprite, response)){
        this.movementDirection.reflectN(response.overlapN);
    }
};

Sprite.prototype.setSpeed = function(speed){
    this.speed = speed;
    this.calculateMovementVector();
};

Sprite.prototype.setFacingDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirectionBy(degrees, true);
    }
    this.facingDegrees += degrees;
    this.calculateFacingVector();
    if(this.isPolygon()){
        this.polygon.rotate(degrees);
        this.polygon.recalc();
    }
    this.calculateBoundingBox();
}
Sprite.prototype.setFacingDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirection(degrees, true);
    }
    var lastDegrees = this.facingDegrees;
    this.facingDegrees = degrees;
    this.calculateFacingVector();
    if(this.isPolygon()){
        this.polygon.rotate(degrees - lastDegrees);
        this.polygon.recalc();
    }
    this.calculateBoundingBox()
};

Sprite.prototype.setMovementDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirectionBy(degrees, true);
    }
    this.movementDegrees += degrees;
    this.calculateMovementVector();
};

Sprite.prototype.setMovementDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirection(degrees, true);
    }
    this.movementDegrees = degrees;
    this.calculateMovementVector();
};

Sprite.prototype.calculateMovementVector = function(){
    this.movementDirection.x = Math.cos(this.movementDegrees*Math.PI/180)*this.speed;
    this.movementDirection.y = Math.sin(this.movementDegrees*Math.PI/180)*this.speed;
};

Sprite.prototype.calculateFacingVector = function(){
    this.facingDirection.x = Math.cos(this.facingDegrees*Math.PI/180);
    this.facingDirection.y = Math.sin(this.facingDegrees*Math.PI/180);
};

Sprite.prototype.calculateMovementDegrees = function(){
    this.movementDegrees = Math.Atan2(this.movementDirection.x,this.movementDirection.y) * (Math.PI / 180);
};

//move a sprite by its own speed and direction
Sprite.prototype.move = function(){
    var x = this.getPos().x + this.movementDirection.x;
    var y = this.getPos().y + this.movementDirection.y;
    this.setPos(x, y);
};

Sprite.prototype.moveRelative = function(x,y){
    this.setPos(this.getPos().x + x, this.getPos().y + y);
};

Sprite.prototype.moveAbsolute = function(x,y){
    this.setPos(x, y);
};

// Bounce the sprite off the edge of the stage
Sprite.prototype.stageBounce = function(stage_width, stage_height){
    if(this.x<0){
        this.movementDirection.reflectN(new SAT.Vector(1,0));
    }else if((this.x+this.w) > stage_width){
        this.movementDirection.reflectN(new SAT.Vector(-1,0));
    }
    if(this.y<0){
        this.movementDirection.reflectN(new SAT.Vector(0,1));
    }else if((this.y+this.h) > stage_height){
        this.movementDirection.reflectN(new SAT.Vector(0,-1));
    }
};

Sprite.prototype.getBounds = function(stage_width, stage_height){
    var baseX = this.getPos().x - this.x, baseY = this.getPos().y - this.y;
    return {
        'up'    : baseY,
        'down'  : stage_height - this.h + baseY,
        'left'  : baseX,
        'right' : stage_width - this.w + baseX
    };
}

// Stop the sprite if it hits the edge of the stage
Sprite.prototype.edgeStop = function(stage_width, stage_height){
    var bounds = this.getBounds(stage_width, stage_height);
    if(this.x < 0){
        this.setPos(bounds.left, null);
        this.setSpeed(0);
    }else if((this.x + this.w) > stage_width){
        this.setPos(bounds.right, null);
        this.setSpeed(0);
    }
    if(this.y < 0){
        this.setPos(null, bounds.up);
        this.setSpeed(0);
    }else if((this.y + this.h) > stage_height){
        this.setPos(null, bounds.down);
        this.setSpeed(0);
    }
}

// If the sprite moves to the edge of the screen, slide it along that edge
Sprite.prototype.edgeSlide = function(stage_width, stage_height){
    var bounds = this.getBounds(stage_width, stage_height);
    if(this.x < 0){
        this.setPos(bounds.left, null);
        this.movementDirection.x = 0;
        this.calculateMovementDegrees;
    }else if((this.x + this.w) > stage_width){
        this.setPos(bounds.right, null);
        this.movementDirection.x = 0;
        this.calculateMovementDegrees;
    }
    if(this.y < 0){
        this.setPos(null, bounds.up);
        this.movementDirection.y = 0;
        this.calculateMovementDegrees;
    }else if((this.y + this.h) > stage_height){
        this.setPos(null, bounds.down);
        this.movementDirection.y = 0;
        this.calculateMovementDegrees;
    }
}

// Wrap around the edge of the stage
Sprite.prototype.edgeWrap = function(stage_width, stage_height){
    var bounds = this.getBounds(stage_width, stage_height);
    if(this.x < 0){
        this.setPos(bounds.right, null);
    }else if((this.x + this.w) > stage_width){
        this.setPos(bounds.left, null);
    }
    if(this.y < 0){
        this.setPos(null, bounds.down);
    }else if((this.y + this.h) > stage_height){
        this.setPos(null, bounds.up);
    }
}

window.createRectSprite = createRectSprite; // deprecated
window.createTextSprite = createTextSprite;
window.createImageSprite = createImageSprite;
window.createPolygonSprite = createPolygonSprite;
window.createCircleSprite = createCircleSprite;
window.createSprite = createSprite;
window.isSpriteClicked = isSpriteClicked;
window.Sprite = Sprite;

})(window);
