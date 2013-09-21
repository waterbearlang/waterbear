// Sprite Routines
function RectSprite(size,pos,color){
    this.x = pos.x;
    this.y = pos.y;
    this.w = size.w;
    this.h = size.h;
    this.collisionRect = this;
    this.color = color;
    this.origW = size.w;
    this.origH = size.h;
    this.direction = 0;
    this.speed = 0;
};

window.RectSprite = RectSprite;

RectSprite.prototype.draw = function(ctx){
    // console.log(this.direction, this);
    ctx.save();
    //rotation
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.direction * Math.PI / 180);
    ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.restore();
};

RectSprite.prototype.collides = function(sprite){
    var self = this.collisionRect;
    var that = sprite.collisionRect;
    if ((self.x + self.w) < that.x) return false;
    if ((self.y + self.h) < that.y) return false;
    if (self.x > (that.x + that.w)) return false;
    if (self.y > (that.y + that.h)) return false;
    return true;
};

RectSprite.prototype.setSpeed = function(speed){
    this.speed = speed;
    this.calculateDifference();
};

RectSprite.prototype.setDirection = function(degrees){
    this.direction = degrees % 360;
    this.calculateDifference();
};

RectSprite.prototype.rotate = function(degrees){
    this.setDirection(this.direction + degrees);
}

RectSprite.prototype.setColor = function(color){
    this.color = color;
}

RectSprite.prototype.calculateDifference = function(){
    this.dx=Math.cos(this.direction*Math.PI/180)*this.speed;
    this.dy=Math.sin(this.direction*Math.PI/180)*this.speed;
};

RectSprite.prototype.toString = function(){
    return '<RectSprite ' + this.x + ' ' + this.y + ' ' + this.w + ' ' +  this.h + ' ' + this.color + '>';
};

function Vector2(dx,dy){
    this.dx = dx || 0;
    this.dy = dy || 0;
}

Vector2.fromAngle = function(radians, magnitude){
    if (magnitude <= 0) magnitude = 1.0;
    return new Vector(Math.cos(radians) * magnitude, Math.sin(radians) * magnitude);
}

Vector2.prototype.magnitude = function(){
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
}

Vector2.prototype.add = function(v){
    return new Vector2(this.dx + v.dx, this.dy + v.dy);
}

Vector2.prototype.subtract = function(v){
    return new Vector2(this.dx - v.dx, this.dy - v.dy);
}

Vector2.prototype.reflect = function(rx, ry){
    return new Vector2(rx ? -this.dx: this.dx, ry ? -this.dy : this.dy);
}

Vector2.prototype.angle = function(){
    // angle of vector in radians
    return Math.atan2(this.dy, this.dx);
}

Vector2.prototype.rotate = function(radians){
    var mag = this.magnitude();
    var theta = this.angle();
    return Vector.fromAngle(theta + radians, mag);
}
