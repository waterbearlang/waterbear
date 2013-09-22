// Sprite Routines
function PolySprite(pos,color,points){
    this.color = color;
    this.movementDirection = 0;
    this.facingDirection = 0;
    this.speed = 0;
    this.polygon = new SAT.Polygon();
    this.polygon.pos = new SAT.Vector(pos.x,pos.y);
    this.polygon.points = points;
    this.polygon.average = this.polygon.calculateAverage();
    this.autosteer = false;
    this.calculateBoundingBox();
};

function RectSprite(size,pos,color){
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
    console.debug(points);
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
    console.debug(minX, maxX, minY, maxY);
};

PolySprite.prototype.collides = function(sprite) {
    return SAT.testPolygonPolygon(this.polygon,sprite.polygon);
};

PolySprite.prototype.setSpeed = function(speed){
    this.speed = speed;
    this.calculateDifference();
};

PolySprite.prototype.setFacingDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirectionBy(degrees, true);
    }
    this.setFacingDirection(this.facingDirection + degrees);
}
PolySprite.prototype.setFacingDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirection(degrees, true);
    }
    var lastDirection = this.facingDirection;
    this.facingDirection = degrees;
    this.polygon.rotate(degrees - lastDirection);
    this.polygon.recalc();
}

PolySprite.prototype.setMovementDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirectionBy(degrees, true);
    }
    this.setMovementDirection(this.movementDirection + degrees);
}

PolySprite.prototype.setMovementDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirection(degrees, true);
    }
    this.movementDirection = degrees % 360;
    this.calculateDifference();
};

PolySprite.prototype.calculateDifference = function(){
    this.dx = Math.cos(this.movementDirection*Math.PI/180)*this.speed;
    this.dy = Math.sin(this.movementDirection*Math.PI/180)*this.speed;
};

//move a sprite by its own speed and direction
PolySprite.prototype.move = function(){
    this.polygon.pos.x += this.dx;
    this.polygon.pos.y += this.dy;
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

/** @preserve @author Jim Riecken - released under the MIT License. */
/**
 * A simple library for determining intersections of circles and
 * polygons using the Separating Axis Theorem.
 */
/*jshint shadow:true, sub:true, forin:true, noarg:true, noempty:true, 
  eqeqeq:true, bitwise:true, strict:true, undef:true, 
  curly:true, browser:true */
var SAT = window['SAT'] = {};
(function(SAT) {
  "use strict";
  
  /** 
   * Represents a vector in two dimensions.
   * 
   * @param {?number=} x The x position.
   * @param {?number=} y The y position.
   * @constructor
   */
  var Vector = function(x, y) {
    this['x'] = this.x = x || 0;
    this['y'] = this.y = y || 0;
  };
  SAT['Vector'] = Vector;
  SAT['V'] = Vector;
  /**
   * Copy the values of another Vector into this one.
   *
   * @param {Vector} other The other Vector.
   * @return {Vector} This for chaining.
   */
  Vector.prototype.copy = function(other) {
    this.x = other.x; 
    this.y = other.y;
    return this;
  };
  Vector.prototype['copy'] = Vector.prototype.copy;
    
  /**
   * Rotate this vector by 90 degrees
   * 
   * @return {Vector} This for chaining.
   */
  Vector.prototype.perp = function() {
    var x = this.x;
    this.x = this.y; 
    this.y = -x;
    return this;
  };
  Vector.prototype['perp'] = Vector.prototype.perp;
    
  /**
   * Reverse this vector.
   * 
   * @return {Vector} This for chaining.
   */
  Vector.prototype.reverse = function() {
    this.x = -this.x; 
    this.y = -this.y;
    return this;
  };
  Vector.prototype['reverse'] = Vector.prototype.reverse;
  
  /**
   * Normalize (make unit length) this vector.
   * 
   * @return {Vector} This for chaining.
   */
  Vector.prototype.normalize = function() {
    var d = this.len();
    if(d > 0) {
      this.x = this.x / d; 
      this.y = this.y / d;
    }
    return this;
  };
  Vector.prototype['normalize'] = Vector.prototype.normalize;
  
  /**
   * Add another vector to this one.
   * 
   * @param {Vector} other The other Vector.
   * @return {Vector} This for chaining.
   */
  Vector.prototype.add = function(other) {
    this.x += other.x; 
    this.y += other.y;
    return this;
  };
  Vector.prototype['add'] = Vector.prototype.add;
  
  /**
   * Subtract another vector from this one.
   * 
   * @param {Vector} other The other Vector.
   * @return {Vector} This for chaiing.
   */
  Vector.prototype.sub = function(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  };
  Vector.prototype['sub'] = Vector.prototype.sub;
  
  /**
   * Scale this vector.
   * 
   * @param {number} x The scaling factor in the x direction.
   * @param {?number=} y The scaling factor in the y direction.  If this
   *   is not specified, the x scaling factor will be used.
   * @return {Vector} This for chaining.
   */
  Vector.prototype.scale = function(x,y) {
    this.x *= x; 
    this.y *= y || x;
    return this; 
  };
  Vector.prototype['scale'] = Vector.prototype.scale;
  
  /**
   * Project this vector on to another vector.
   * 
   * @param {Vector} other The vector to project onto.
   * @return {Vector} This for chaining.
   */
  Vector.prototype.project = function(other) {
    var amt = this.dot(other) / other.len2();
    this.x = amt * other.x; 
    this.y = amt * other.y;
    return this;
  };
  Vector.prototype['project'] = Vector.prototype.project;
  
  /**
   * Project this vector onto a vector of unit length.
   * 
   * @param {Vector} other The unit vector to project onto.
   * @return {Vector} This for chaining.
   */
  Vector.prototype.projectN = function(other) {
    var amt = this.dot(other);
    this.x = amt * other.x; 
    this.y = amt * other.y;
    return this;
  };
  Vector.prototype['projectN'] = Vector.prototype.projectN;
  
  /**
   * Reflect this vector on an arbitrary axis.
   * 
   * @param {Vector} axis The vector representing the axis.
   * @return {Vector} This for chaining.
   */
  Vector.prototype.reflect = function(axis) {
    var x = this.x;
    var y = this.y;
    this.project(axis).scale(2);
    this.x -= x; 
    this.y -= y;
    return this;
  };
  Vector.prototype['reflect'] = Vector.prototype.reflect;
  
  /**
   * Reflect this vector on an arbitrary axis (represented by a unit vector)
   * 
   * @param {Vector} axis The unit vector representing the axis.
   * @return {Vector} This for chaining.
   */
  Vector.prototype.reflectN = function(axis) {
    var x = this.x;
    var y = this.y;
    this.projectN(axis).scale(2);
    this.x -= x; 
    this.y -= y;
    return this;
  };
  Vector.prototype['relectN'] = Vector.prototype.reflectN;
  
  /**
   * Get the dot product of this vector against another.
   * 
   * @param {Vector}  other The vector to dot this one against.
   * @return {number} The dot product.
   */
  Vector.prototype.dot = function(other) {
    return this.x * other.x + this.y * other.y;
  };
  Vector.prototype['dot'] = Vector.prototype.dot;
  
  /**
   * Get the length^2 of this vector.
   * 
   * @return {number} The length^2 of this vector.
   */
  Vector.prototype.len2 = function() {
    return this.dot(this);
  };
  Vector.prototype['len2'] = Vector.prototype.len2;
  
  /**
   * Get the length of this vector.
   * 
   * @return {number} The length of this vector.
   */
  Vector.prototype.len = function() {
    return Math.sqrt(this.len2());
  };
  Vector.prototype['len'] = Vector.prototype.len;

  /**
   * Rotates a vector using a passed angle in radians.
   *
   * @param {number} radians The angle to rotate in radians.
   * @returns {Object} This vector.
   * Added by Danny Wilson
   */
  Vector.prototype.rotate = function(rotation, point) {
    var x1, y1, x2, y2, dx1, dx2, dy1, dy2;
    var rad = rotation * (Math.PI / 180);
    //origin
    x1 = point.x;
    y1 = point.y;
    //point to rotate
    x2 = this.x;
    y2 = this.y;

    dx1 = x2 - x1;
    dy1 = y2 - y1;

    dx2 = dx1 * Math.cos(rad) - dy1 * Math.sin(rad);
    dy2 = dx1 * Math.sin(rad) + dy1 * Math.cos(rad);

    this.x = dx2 + x1;
    this.y = dy2 + y1;

    return this;
  }
  /**
   * A circle.
   * 
   * @param {Vector=} pos A vector representing the position of the center of the circle
   * @param {?number=} r The radius of the circle
   * @constructor
   */
  var Circle = function(pos, r) {
    this['pos'] = this.pos = pos || new Vector();
    this['r'] = this.r = r || 0;
  };
  SAT['Circle'] = Circle;
  
  /**
   * A *convex* clockwise polygon.
   * 
   * @param {Vector=} pos A vector representing the origin of the polygon. (all other
   *   points are relative to this one)
   * @param {Array.<Vector>=} points An array of vectors representing the points in the polygon,
   *   in clockwise order.
   * @constructor
   */
  var Polygon = function(pos, points) {
    this['pos'] = this.pos = pos || new Vector();
    this['points'] = this.points = points || [];
    this.recalc();
  };
  SAT['Polygon'] = Polygon;
  
  /**
   * Recalculate the edges and normals of the polygon.  This
   * MUST be called if the points array is modified at all and
   * the edges or normals are to be accessed.
   */
  Polygon.prototype.recalc = function() {
    var points = this.points;
    var len = points.length;
    this.edges = []; 
    this.normals = [];
    for (var i = 0; i < len; i++) {
      var p1 = points[i]; 
      var p2 = i < len - 1 ? points[i + 1] : points[0];
      var e = new Vector().copy(p2).sub(p1);
      var n = new Vector().copy(e).perp().normalize();
      this.edges.push(e);
      this.normals.push(n);
    }
  };

  /**
   * Rotate a polygone about a point
   * @param {Degrees=} deg The amount to rotate
   * @param {?Point=} about The point to rotate about
   * Added by Danny Wilson
   */
  Polygon.prototype.rotate = function(deg, about){
    about = typeof about !== 'undefined' ? about : this.average;
    var points = this.points;

    var x1 = this.pos.x;
    var y1 = this.pos.y;

    this.pos.rotate(deg,about);

    for (var i = 0; i < points.length; i++) {
      points[i].add(new Vector(x1,y1));
      points[i].rotate(deg, about);
      points[i].sub(this.pos);
    }

  };

  /**
   * Get the average point from a polygon
   * Returns the average point
   * TODO: Make work
   */
  Polygon.prototype.calculateAverage = function(){
    var points = this.points;
    var len = points.length;
    var average = new Vector(0,0);
    for (var i = 0; i < len; i++) {
      average.add(points[i])
    }
    var averagePoint = new Vector(average.x/len, average.y/len);
    return averagePoint.add(this.pos);
  };

  Polygon.prototype['recalc'] = Polygon.prototype.recalc;
  
  /**
   * An axis-aligned box, with width and height.
   * 
   * @param {Vector=} pos A vector representing the top-left of the box.
   * @param {?number=} w The width of the box.
   * @param {?number=} h The height of the box.
   * @constructor
   */
  var Box = function(pos, w, h) {
    this['pos'] = this.pos = pos || new Vector();
    this['w'] = this.w = w || 0; 
    this['h'] = this.h = h || 0;
  };
  SAT['Box'] = Box;

  /**
   * Create a polygon that is the same as this box.
   * 
   * @return {Polygon} A new Polygon that represents this box.
   */
  Box.prototype.toPolygon = function() {
    var pos = this.pos;
    var w = this.w;
    var h = this.h;
    return new Polygon(new Vector(pos.x, pos.y), [
     new Vector(), new Vector(w, 0), 
     new Vector(w,h), new Vector(0,h)
    ]);
  };
  Box.prototype['toPolygon'] = Box.prototype.toPolygon;
  
  /**
   * Pool of Vectors used in calculations.
   * 
   * @type {Array.<Vector>}
   */
  var T_VECTORS = [];
  for (var i = 0; i < 10; i++) { T_VECTORS.push(new Vector()); }
  /**
   * Pool of Arrays used in calculations.
   * 
   * @type {Array.<Array.<*>>}
   */
  var T_ARRAYS = [];
  for (var i = 0; i < 5; i++) { T_ARRAYS.push([]); }

  /**
   * An object representing the result of an intersection. Contain information about:
   * - The two objects participating in the intersection
   * - The vector representing the minimum change necessary to extract the first object
   *   from the second one.
   * - Whether the first object is entirely inside the second, or vice versa.
   * 
   * @constructor
   */  
  var Response = function() {
    this['a'] = this.a = null;
    this['b'] = this.b = null;
    this['overlapN'] = this.overlapN = new Vector(); // Unit vector in the direction of overlap
    this['overlapV'] = this.overlapV = new Vector(); // Subtract this from a's position to extract it from b
    this.clear();
  };
  SAT['Response'] = Response;

  /**
   * Set some values of the response back to their defaults.  Call this between tests if 
   * you are going to reuse a single Response object for multiple intersection tests (recommented)
   * 
   * @return {Response} This for chaining
   */
  Response.prototype.clear = function() {
    this['aInB'] = this.aInB = true; // Is a fully inside b?
    this['bInA'] = this.bInA = true; // Is b fully inside a?
    this['overlap'] = this.overlap = Number.MAX_VALUE; // Amount of overlap (magnitude of overlapV). Can be 0 (if a and b are touching)
    return this;
  };
  Response.prototype['clear'] = Response.prototype.clear;
  
  /**
   * Flattens the specified array of points onto a unit vector axis,
   * resulting in a one dimensional range of the minimum and 
   * maximum value on that axis.
   *
   * @param {Array.<Vector>} points The points to flatten.
   * @param {Vector} normal The unit vector axis to flatten on.
   * @param {Array.<number>} result An array.  After calling this function,
   *   result[0] will be the minimum value,
   *   result[1] will be the maximum value.
   */
  var flattenPointsOn = function(points, normal, result) {
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    var len = points.length;
    for (var i = 0; i < len; i++ ) {
      // Get the magnitude of the projection of the point onto the normal
      var dot = points[i].dot(normal);
      if (dot < min) { min = dot; }
      if (dot > max) { max = dot; }
    }
    result[0] = min; result[1] = max;
  };
  
  /**
   * Check whether two convex clockwise polygons are separated by the specified
   * axis (must be a unit vector).
   * 
   * @param {Vector} aPos The position of the first polygon.
   * @param {Vector} bPos The position of the second polygon.
   * @param {Array.<Vector>} aPoints The points in the first polygon.
   * @param {Array.<Vector>} bPoints The points in the second polygon.
   * @param {Vector} axis The axis (unit sized) to test against.  The points of both polygons
   *   will be projected onto this axis.
   * @param {Response=} response A Response object (optional) which will be populated
   *   if the axis is not a separating axis.
   * @return {boolean} true if it is a separating axis, false otherwise.  If false,
   *   and a response is passed in, information about how much overlap and
   *   the direction of the overlap will be populated.
   */
  var isSeparatingAxis = function(aPos, bPos, aPoints, bPoints, axis, response) {
    var rangeA = T_ARRAYS.pop();
    var rangeB = T_ARRAYS.pop();
    // Get the magnitude of the offset between the two polygons
    var offsetV = T_VECTORS.pop().copy(bPos).sub(aPos);
    var projectedOffset = offsetV.dot(axis);
    // Project the polygons onto the axis.
    flattenPointsOn(aPoints, axis, rangeA);
    flattenPointsOn(bPoints, axis, rangeB);
    // Move B's range to its position relative to A.
    rangeB[0] += projectedOffset;
    rangeB[1] += projectedOffset;
    // Check if there is a gap. If there is, this is a separating axis and we can stop
    if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
      T_VECTORS.push(offsetV); 
      T_ARRAYS.push(rangeA); 
      T_ARRAYS.push(rangeB);
      return true;
    }
    // If we're calculating a response, calculate the overlap.
    if (response) {
      var overlap = 0;
      // A starts further left than B
      if (rangeA[0] < rangeB[0]) {
        response.aInB = false;
        // A ends before B does. We have to pull A out of B
        if (rangeA[1] < rangeB[1]) { 
          overlap = rangeA[1] - rangeB[0];
          response.bInA = false;
        // B is fully inside A.  Pick the shortest way out.
        } else {
          var option1 = rangeA[1] - rangeB[0];
          var option2 = rangeB[1] - rangeA[0];
          overlap = option1 < option2 ? option1 : -option2;
        }
      // B starts further left than A
      } else {
        response.bInA = false;
        // B ends before A ends. We have to push A out of B
        if (rangeA[1] > rangeB[1]) { 
          overlap = rangeA[0] - rangeB[1];
          response.aInB = false;
        // A is fully inside B.  Pick the shortest way out.
        } else {
          var option1 = rangeA[1] - rangeB[0];
          var option2 = rangeB[1] - rangeA[0];
          overlap = option1 < option2 ? option1 : -option2;
        }
      }
      // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
      var absOverlap = Math.abs(overlap);
      if (absOverlap < response.overlap) {
        response.overlap = absOverlap;
        response.overlapN.copy(axis);
        if (overlap < 0) {
          response.overlapN.reverse();
        }
      }      
    }
    T_VECTORS.push(offsetV); 
    T_ARRAYS.push(rangeA); 
    T_ARRAYS.push(rangeB);
    return false;
  };
  
  /**
   * Calculates which Vornoi region a point is on a line segment.
   * It is assumed that both the line and the point are relative to (0, 0)
   * 
   *             |       (0)      | 
   *      (-1)  [0]--------------[1]  (1)
   *             |       (0)      | 
   * 
   * @param {Vector} line The line segment.
   * @param {Vector} point The point.
   * @return  {number} LEFT_VORNOI_REGION (-1) if it is the left region, 
   *          MIDDLE_VORNOI_REGION (0) if it is the middle region, 
   *          RIGHT_VORNOI_REGION (1) if it is the right region.
   */
  var vornoiRegion = function(line, point) {
    var len2 = line.len2();
    var dp = point.dot(line);
    if (dp < 0) { return LEFT_VORNOI_REGION; }
    else if (dp > len2) { return RIGHT_VORNOI_REGION; }
    else { return MIDDLE_VORNOI_REGION; }
  };
  /**
   * @const
   */
  var LEFT_VORNOI_REGION = -1;
  /**
   * @const
   */
  var MIDDLE_VORNOI_REGION = 0;
  /**
   * @const
   */
  var RIGHT_VORNOI_REGION = 1;
  
  /**
   * Check if two circles intersect.
   * 
   * @param {Circle} a The first circle.
   * @param {Circle} b The second circle.
   * @param {Response=} response Response object (optional) that will be populated if
   *   the circles intersect.
   * @return {boolean} true if the circles intersect, false if they don't. 
   */
  var testCircleCircle = function(a, b, response) {
    var differenceV = T_VECTORS.pop().copy(b.pos).sub(a.pos);
    var totalRadius = a.r + b.r;
    var totalRadiusSq = totalRadius * totalRadius;
    var distanceSq = differenceV.len2();
    if (distanceSq > totalRadiusSq) {
      // They do not intersect 
      T_VECTORS.push(differenceV);
      return false;
    }
    // They intersect.  If we're calculating a response, calculate the overlap.
    if (response) { 
      var dist = Math.sqrt(distanceSq);
      response.a = a;
      response.b = b;
      response.overlap = totalRadius - dist;
      response.overlapN.copy(differenceV.normalize());
      response.overlapV.copy(differenceV).scale(response.overlap);
      response.aInB = a.r <= b.r && dist <= b.r - a.r;
      response.bInA = b.r <= a.r && dist <= a.r - b.r;
    }
    T_VECTORS.push(differenceV);
    return true;
  };
  SAT['testCircleCircle'] = testCircleCircle;
  
  /**
   * Check if a polygon and a circle intersect.
   * 
   * @param {Polygon} polygon The polygon.
   * @param {Circle} circle The circle.
   * @param {Response=} response Response object (optional) that will be populated if
   *   they interset.
   * @return {boolean} true if they intersect, false if they don't.
   */
  var testPolygonCircle = function(polygon, circle, response) {
    var circlePos = T_VECTORS.pop().copy(circle.pos).sub(polygon.pos);
    var radius = circle.r;
    var radius2 = radius * radius;
    var points = polygon.points;
    var len = points.length;
    var edge = T_VECTORS.pop();
    var point = T_VECTORS.pop();
    
    // For each edge in the polygon
    for (var i = 0; i < len; i++) {
      var next = i === len - 1 ? 0 : i + 1;
      var prev = i === 0 ? len - 1 : i - 1;
      var overlap = 0;
      var overlapN = null;
      
      // Get the edge
      edge.copy(polygon.edges[i]);
      // Calculate the center of the cirble relative to the starting point of the edge
      point.copy(circlePos).sub(points[i]);
      
      // If the distance between the center of the circle and the point
      // is bigger than the radius, the polygon is definitely not fully in
      // the circle.
      if (response && point.len2() > radius2) {
        response.aInB = false;
      }
      
      // Calculate which Vornoi region the center of the circle is in.
      var region = vornoiRegion(edge, point);
      if (region === LEFT_VORNOI_REGION) { 
        // Need to make sure we're in the RIGHT_VORNOI_REGION of the previous edge.
        edge.copy(polygon.edges[prev]);
        // Calculate the center of the circle relative the starting point of the previous edge
        var point2 = T_VECTORS.pop().copy(circlePos).sub(points[prev]);
        region = vornoiRegion(edge, point2);
        if (region === RIGHT_VORNOI_REGION) {
          // It's in the region we want.  Check if the circle intersects the point.
          var dist = point.len();
          if (dist > radius) {
            // No intersection
            T_VECTORS.push(circlePos); 
            T_VECTORS.push(edge);
            T_VECTORS.push(point); 
            T_VECTORS.push(point2);
            return false;
          } else if (response) {
            // It intersects, calculate the overlap
            response.bInA = false;
            overlapN = point.normalize();
            overlap = radius - dist;
          }
        }
        T_VECTORS.push(point2);
      } else if (region === RIGHT_VORNOI_REGION) {
        // Need to make sure we're in the left region on the next edge
        edge.copy(polygon.edges[next]);
        // Calculate the center of the circle relative to the starting point of the next edge
        point.copy(circlePos).sub(points[next]);
        region = vornoiRegion(edge, point);
        if (region === LEFT_VORNOI_REGION) {
          // It's in the region we want.  Check if the circle intersects the point.
          var dist = point.len();
          if (dist > radius) {
            // No intersection
            T_VECTORS.push(circlePos); 
            T_VECTORS.push(edge); 
            T_VECTORS.push(point);
            return false;              
          } else if (response) {
            // It intersects, calculate the overlap
            response.bInA = false;
            overlapN = point.normalize();
            overlap = radius - dist;
          }
        }
      // MIDDLE_VORNOI_REGION
      } else {
        // Need to check if the circle is intersecting the edge,
        // Change the edge into its "edge normal".
        var normal = edge.perp().normalize();
        // Find the perpendicular distance between the center of the 
        // circle and the edge.
        var dist = point.dot(normal);
        var distAbs = Math.abs(dist);
        // If the circle is on the outside of the edge, there is no intersection
        if (dist > 0 && distAbs > radius) {
          T_VECTORS.push(circlePos); 
          T_VECTORS.push(normal); 
          T_VECTORS.push(point);
          return false;
        } else if (response) {
          // It intersects, calculate the overlap.
          overlapN = normal;
          overlap = radius - dist;
          // If the center of the circle is on the outside of the edge, or part of the
          // circle is on the outside, the circle is not fully inside the polygon.
          if (dist >= 0 || overlap < 2 * radius) {
            response.bInA = false;
          }
        }
      }
      
      // If this is the smallest overlap we've seen, keep it. 
      // (overlapN may be null if the circle was in the wrong Vornoi region)
      if (overlapN && response && Math.abs(overlap) < Math.abs(response.overlap)) {
        response.overlap = overlap;
        response.overlapN.copy(overlapN);
      }
    }
    
    // Calculate the final overlap vector - based on the smallest overlap.
    if (response) {
      response.a = polygon;
      response.b = circle;
      response.overlapV.copy(response.overlapN).scale(response.overlap);
    }
    T_VECTORS.push(circlePos); 
    T_VECTORS.push(edge); 
    T_VECTORS.push(point);
    return true;
  };
  SAT['testPolygonCircle'] = testPolygonCircle;
  
  /**
   * Check if a circle and a polygon intersect.
   * 
   * NOTE: This runs slightly slower than polygonCircle as it just
   * runs polygonCircle and reverses everything at the end.
   * 
   * @param {Circle} circle The circle.
   * @param {Polygon} polygon The polygon.
   * @param {Response=} response Response object (optional) that will be populated if
   *   they interset.
   * @return {boolean} true if they intersect, false if they don't.
   */
  var testCirclePolygon = function(circle, polygon, response) {
    var result = testPolygonCircle(polygon, circle, response);
    if (result && response) {
      // Swap A and B in the response.
      var a = response.a;
      var aInB = response.aInB;
      response.overlapN.reverse();
      response.overlapV.reverse();
      response.a = response.b; 
      response.b = a;
      response.aInB = response.bInA; 
      response.bInA = aInB;
    }
    return result;
  };
  SAT['testCirclePolygon'] = testCirclePolygon;
  
  /**
   * Checks whether two convex, clockwise polygons intersect.
   * 
   * @param {Polygon} a The first polygon.
   * @param {Polygon} b The second polygon.
   * @param {Response=} response Response object (optional) that will be populated if
   *   they interset.
   * @return {boolean} true if they intersect, false if they don't.
   */
  var testPolygonPolygon = function(a, b, response) {
    var aPoints = a.points;
    var aLen = aPoints.length;
    var bPoints = b.points;
    var bLen = bPoints.length;
    // If any of the edge normals of A is a separating axis, no intersection.
    for (var i = 0; i < aLen; i++) {
      if (isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, a.normals[i], response)) {
        return false;
      }
    }
    // If any of the edge normals of B is a separating axis, no intersection.
    for (var i = 0;i < bLen; i++) {
      if (isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, b.normals[i], response)) {
        return false;
      }
    }
    // Since none of the edge normals of A or B are a separating axis, there is an intersection
    // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
    // final overlap vector.
    if (response) {
      response.a = a;
      response.b = b;
      response.overlapV.copy(response.overlapN).scale(response.overlap);
    }
    return true;
  };
  SAT['testPolygonPolygon'] = testPolygonPolygon;
}(SAT));