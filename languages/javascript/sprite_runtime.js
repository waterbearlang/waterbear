// Sprite Routines

// This uses and embeds code from https://github.com/jriecken/sat-js

function PolySprite(pos,color,points){
    this.color = color;
    this.movementDirection = new SAT.Vector(0, 0);
    this.movementDegrees = 0;
    this.facingDirection = new SAT.Vector(0, 0);
    this.facingDegrees = 0;
    this.speed = 0;
    this.polygon = new SAT.Polygon();
    this.polygon.pos = new SAT.Vector(pos.x,pos.y);
    this.polygon.points = points;
    this.polygon.average = this.polygon.calculateAverage();
    this.autosteer = false;
    this.calculateBoundingBox();
};

function createRectSprite(size,pos,color){
     var rect = new PolySprite(pos,color,[]);
     rect.polygon = new SAT.Box(new SAT.Vector(pos.x,pos.y), size.w, size.h).toPolygon();
     rect.polygon.average = rect.polygon.calculateAverage();
     rect.calculateBoundingBox();
     return rect;
};

window.PolySprite = PolySprite;

PolySprite.prototype.draw = function(ctx){
    //rotation
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.polygon.points[0].x + this.polygon.pos.x, this.polygon.points[0].y + this.polygon.pos.y);
    for (var i = this.polygon.points.length - 1; i >= 1; i--) {
        ctx.lineTo(this.polygon.points[i].x + this.polygon.pos.x, this.polygon.points[i].y + this.polygon.pos.y);
    };
    ctx.closePath();
    ctx.fill();
};

PolySprite.prototype.calculateBoundingBox = function(){
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
};

PolySprite.prototype.collides = function(sprite) {
    return SAT.testPolygonPolygon(this.polygon,sprite.polygon);
};

PolySprite.prototype.bounceOff = function(sprite) {
    var response = new SAT.Response();
    if (SAT.testPolygonPolygon(this.polygon, sprite.polygon, response)) {
        this.movementDirection.reflectN(response.overlapN);
    }
}

PolySprite.prototype.setSpeed = function(speed){
    this.speed = speed;
    this.calculateMovementVector();
};

PolySprite.prototype.setFacingDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirectionBy(degrees, true);
    }
    this.facingDegreess += degrees;
    this.calculateFacingVector();
    this.polygon.rotate(degrees);
    this.polygon.recalc();
}
PolySprite.prototype.setFacingDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirection(degrees, true);
    }
    var lastDegrees = this.facingDegrees;
    this.facingDegrees = degrees;
    this.calculateFacingVector();
    this.polygon.rotate(degrees - lastDegrees);
    this.polygon.recalc();
}

PolySprite.prototype.setMovementDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirectionBy(degrees, true);
    }
    this.movementDegrees += degrees;
    this.calculateMovementVector();
}

PolySprite.prototype.setMovementDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirection(degrees, true);
    }
    this.movementDegrees = degrees;
    this.calculateMovementVector();
};

PolySprite.prototype.calculateMovementVector = function(){
    this.movementDirection.x = Math.cos(this.movementDegrees*Math.PI/180)*this.speed;
    this.movementDirection.y = Math.sin(this.movementDegrees*Math.PI/180)*this.speed;
};

PolySprite.prototype.calculateFacingVector = function(){
    this.facingDirection.x = Math.cos(this.facingDegrees*Math.PI/180);
    this.facingDirection.y = Math.sin(this.facingDegrees*Math.PI/180);
};

PolySprite.prototype.calculateMovementDegrees = function() {
    this.movementDegrees = Math.Atan2(this.movementDirection.x,this.movementDirection.y) * (Math.PI / 180);
}

//move a sprite by its own speed and direction
PolySprite.prototype.move = function(){
    this.polygon.pos.add(this.movementDirection);
    this.polygon.average = this.polygon.calculateAverage();
    this.calculateBoundingBox();
    this.polygon.recalc();
}

PolySprite.prototype.moveRelative = function(x,y){
    this.polygon.pos.x += x;
    this.polygon.pos.y += y;
    this.polygon.average = this.polygon.calculateAverage();
    this.calculateBoundingBox();
    this.polygon.recalc();
};

PolySprite.prototype.moveAbsolute = function(x,y){
    this.polygon.pos.x = x;
    this.polygon.pos.y = y;
    this.polygon.average = this.polygon.calculateAverage();
    this.calculateBoundingBox();
    this.polygon.recalc();
};

// Bounce the sprite off the edge of the stage
PolySprite.prototype.stageBounce = function(stage_width, stage_height) {
    if(this.x<0){
        this.movementDirection.reflectN(new SAT.Vector(1,0));
    } else if ((this.x+this.w) > stage_width) {
        this.movementDirection.reflectN(new SAT.Vector(-1,0));
    }
    if(this.y<0){
        this.movementDirection.reflectN(new SAT.Vector(0,1));
    } else if ((this.y+this.h) > stage_height){
        this.movementDirection.reflectN(new SAT.Vector(0,-1));
    }
};

// Stop the sprite if it hits the edge of the stage
PolySprite.prototype.edgeStop = function(stage_width, stage_height) {
    if(this.x < 0){
        this.polygon.pos.x = 0;
        this.setSpeed(0);
    } else if ((this.x + this.w) > stage_width){
        this.polygon.pos.x = (stage_width - this.w);
        this.setSpeed(0);
    }
    if(this.y < 0){
        this.polygon.pos.y = 0;
        this.setSpeed(0);
    } else if((this.polygon.pos.y + this.h) > stage_height){
        this.polygon.pos.y = (stage_height - this.h);
        this.setSpeed(0);
    }
}

// If the sprite moves to the edge of the screen, slide it along that edge
PolySprite.prototype.edgeSlide = function(stage_width, stage_height) {
    if(this.x < 0){
        this.polygon.pos.x = 0;
        this.movementDirection.x = 0;
        this.calculateMovementDegrees;
    } else if ((this.x + this.w) > stage_width){
        this.polygon.pos.x = (stage_width - this.w);
        this.movementDirection.x = 0;
        this.calculateMovementDegrees;
    }
    if(this.y < 0){
        this.polygon.pos.y = 0;
        this.movementDirection.y=0;
        this.calculateMovementDegrees;
    } else if((this.y + this.h) > stage_height){
        this.polygon.pos.y = (stage_height-this.h);
        this.movementDirection.y=0;
        this.calculateMovementDegrees;
    }
}

// Wrap around the edge of the stage
PolySprite.prototype.edgeWrap = function(stage_width, stage_height) {
    if(this.x < 0) {
        this.polygon.pos.x = (stage_width - this.w);
    } else if((this.x + this.w) > stage_width) {
        this.polygon.pos.x = 0;
    }
    if(this.y < 0) {
        this.polygon.pos.y = (stage_height - this.h);
    } else if((this.y + this.h) > stage_height) {
        this.polygon.pos.y = 0;
    }
}