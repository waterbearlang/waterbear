
/*begin SAT.js*/
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
    this.x = x - this.x; 
    this.y = y - this.y;
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
    this.x = x - this.x; 
    this.y = y - this.y;
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
/*end SAT.js*/

/*begin languages/javascript/javascript_runtime.js*/
// Timer utility
//console.log('Loaded runtime, defining utilities');
function Timer(){
    this.time = 0;
    this.start_time = Date.now();
    this.update_time();
}

Timer.prototype.update_time = function(){
    var self = this;
    this.time = Math.round(Date.now() - this.start_time);
    setTimeout(function(){self.update_time()}, 1000);
};

Timer.prototype.reset = function(){
    this.start_time = Date.now();
    this.time = 0;
};

Timer.prototype.value = function(){
    return this.time;
};


// Encapsulate workspace-specific state to allow one block to build on the next
// Also provide a runtime environment for the block script

function Local(){
    this.shape = null;
    this.shape_references = {};
    this.array_references = {};
    this.object_references = {};
    this.function_references = {};
    this.regex_references = {};
    this.string_references = {};
    this.last_var = null;
    this.variables = {};
};

Local.prototype.set = function(type, name, value){
    if (this[type] === undefined){
        this[type] = {};
    }
    if (this[type][name] !== undefined){
        console.warn('Overwriting %s named %s', type, name);
    }
    this[type][name] = value;
    this.last_var = value;
    return this;
};

Local.prototype.get = function(type, name){
    if (this[type] === undefined){
        console.error('Cannot remove %s from unknown type %s', name, type);
        return undefined;
    }
    if (this[type][name] === undefined){
        console.error('No %s named %s to remove', type, name);
        return undefined;
    }
    return this[type][name];
};

Local.prototype.delete = function(type, name){
    if (this[type] === undefined){
        console.error('Cannot remove %s from unknown type %s', name, type);
        return undefined;
    }
    if (this[type][name] === undefined){
        console.error('No %s named %s to remove', type, name);
        return undefined;
    }
    var value = this[type][name];
    delete this[type][name];
    return value;
};

function Global(){
    this.timer = new Timer();
    this.keys = {};
    this.stage = document.getElementsByClassName('stage')[0];
    this.mouse_x = -1;
    this.mouse_y = -1;
    this.stage_width = this.stage.clientWidth;
    this.stage_height = this.stage.clientHeight;
    this.stage_center_x = this.stage_width / 2;
    this.stage_center_y = this.stage_height / 2;
    this.mouse_down = false;
    this.subscribeMouseEvents();
    this.subscribeKeyboardEvents();
};

Global.prototype.subscribeMouseEvents = function(){
    var self = this;
    this.stage.addEventListener('mousedown', function(evt){
        self.mouse_down = true;
    });
    this.stage.addEventListener('mousemove', function(evt){
        self.mouse_x = evt.offsetX;
        self.mouse_y = evt.offsetY;
    });
    this.stage.setAttribute('style', 'overflow: hidden');
    document.body.addEventListener('mouseup', function(evt){
        self.mouse_down = false;
    });
};

Global.prototype.specialKeys = {
    // taken from jQuery Hotkeys Plugin
    8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
    20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
    37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
    96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
    104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
    112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
    120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
};

Global.prototype.shiftNums = {
    // taken from jQuery Hotkeys Plugin
    "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
    "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
    ".": ">",  "/": "?",  "\\": "|"
}


Global.prototype.keyForEvent = function(evt){
    if (this.specialKeys[evt.keyCode]){
        return this.specialKeys[evt.keyCode];
    }else{
        return String.fromCharCode( evt.which ).toLowerCase();
    }
}

Global.prototype.isKeyDown = function(key){
    return this.keys[key];
}

Global.prototype.subscribeKeyboardEvents = function(){
    var self = this;
    document.body.addEventListener('keydown', function(evt){
        self.keys[self.keyForEvent(evt)] = true;
    });
    document.body.addEventListener('keyup', function(evt){
        self.keys[self.keyForEvent(evt)] = false;
    });
};


// Utility methods

var DEGREE = Math.PI / 180;


function rad2deg(rad){
    return rad / DEGREE;
}

function deg2rad(deg){
    return deg * DEGREE;
}

function range(start, end, step){
    var rg = [];
    if (end === undefined){
        end = start;
        start = 0;
    }
    if (step === undefined){
        step = 1;
    }
    var i,val;
    len = end - start;
    for (i = 0; i < len; i++){
        val = i * step + start;
        if (val > (end-1)) break;
        rg.push(val);
    }
    return rg;
}


function randint(start, stop){
    // return an integer between start and stop, inclusive
    if (stop === undefined){
        stop = start;
        start = 0;
    }
    var factor = stop - start + 1;
    return Math.floor(Math.random() * factor) + start;
}

function angle(shape){
    // return the angle of rotation
    var tform = shape.rotate();
    if (tform === 0) return tform;
    return parseInt(tform.split(/\s+/)[0], 10);
}


/**
 * Enhanced Javascript logging and exception handler.
 *
 * It is utterly annoying when DOM event handler exceptions fail
 * silently with Firebug. This package fixes this common problem.
 *
 * @copyright Copyright 2008 Twinapex Research
 *
 * @author Mikko Ohtamaa
 *
 * @license 3-clause BSD
 *
 * http://www.twinapex.com
 *
 * http://blog.redinnovation.com/2008/08/19/catching-silent-javascript-exceptions-with-a-function-decorator/
 *
 */

// Declare namespace
twinapex = {}

twinapex.debug = {}

/**
 * Print exception stack trace in human readable format into the console
 *
 * @param {Exception} exc
 */
twinapex.debug.printException = function(exc) {

    function prints(msg) {
        console.log(msg);
    }

    prints(exc);

    if (!exc.stack) {
        prints('no stacktrace available');
        return;
    };
    var lines = exc.stack.toString().split('\n');
    var toprint = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('ecmaunit.js') > -1) {
            // remove useless bit of traceback
            break;
        };
        if (line.charAt(0) == '(') {
            line = 'function' + line;
        };
        var chunks = line.split('@');
        toprint.push(chunks);
    };
    toprint.reverse();

    for (var i = 0; i < toprint.length; i++) {
        prints('  ' + toprint[i][1]);
        prints('    ' + toprint[i][0]);
    };
    prints();
}


/**
 * Decorate function so that exceptions falling through are printed always.
 *
 * Returns a decorated function which will be used instead of the normal function.
 * The decorated function has preplaced try ... catch block which will not let
 * through any exceptions silently or without logging. Even though there is an
 * exception it is normally throw upwards in the stack after logging.
 *
 *  <pre>
 *
 *  // myFunction can be bind to many events and exceptions are logged always
 *  myfunction = function()
 *     // crash here
 *     var i = foobar; // missing variable foobar
 *  });
 *  </pre>
 *
 *  Then there are alternative usage examples:
 *
 *  <pre>
 *
 *  // Decorate function
 *  myfunction = twinapex.debug.manageExceptions(myfunction);
 *
 *  // Bind with exception manager
 *  $document.clicker(twinapex.debug.manageExceptions(myfunction));
 *
 *  // Run loader code with exception manager
 *  jq(document).ready(function() {
 *      console.log("Help pop up page wide init");
 *      twinapex.debug.manageExceptions(initHelpPopUpHandlers(document));
 *  });
 *  </pre>
 *
 *
 * @param func: Javascript function reference
 */
twinapex.debug.manageExceptions = function(func) {

    var original = func;

    decorated = function() {
        try {
            original.apply(this, arguments);
        } catch(exception) {
            twinapex.debug.printException(exception);
            throw exception;
        }
    }
    return decorated;
}

// Don't use windows load handler for init()
// since debug code might be called from other load handlers
// Browser specific logging output initialization
// - fake Firebug console.log for other browsers
if(typeof(console) == "undefined") {
    // Install dummy functions, so that logging does not break the code if Firebug is not present
    var console = {};
    console.log = function(msg) {};
    console.info = function(msg) {};
    console.warn = function(msg) {};

    // TODO: Add IE Javascript console output

    // TODO: Add Opera console output

} else {
    // console.log provided by Firefox + Firebug
}

var global = new Global();
var local = new Local();

console.log('runtime ready');

/*end languages/javascript/javascript_runtime.js*/

/*begin languages/javascript/asset_runtime.js*/
(function(){

var assets = {};

function getAssetType(url){
	var extension = url.split('.').slice(-1)[0].toLowerCase();
	switch(extension){
		case 'gif':
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'bmp':
			return new Image();
		case 'mov':
		case 'mpeg':
		case 'mpg':
			return new Video();
		case 'wav':
		case 'mp3':
			return new Audio();
		default:
			console.error('No format recognized for %s type', ext);
			return null;
	}
}
var loaded = 0;
var toload = 0;

function preloadAssets(assetUrls, callback){
	// console.log('preloading %o', assetUrls);
	if (!assetUrls.length){
		return callback();
	}
	load = function() {
		// console.log('loaded');
		loaded++;
	    if (loaded >= toload){
	    	callback();
	    }
	}
    assetUrls.forEach(function(url, idx){
    	toload++;
    	assets[url] = getAssetType(url);
	    assets[url].addEventListener('load', load,false);
	    assets[url].addEventListener('canplay', load, false);
	    assets[url].addEventListener('error', load, false);
	    assets[url].addEventListener('abort', load, false);
    	assets[url].src = url;
 	});
}


var images = Global.prototype.images = {};
var audio = Global.prototype.audio = {};
var video = Global.prototype.video = {};

function preloadImage(seqNum, url){
	images[seqNum] = assets[url];
}

function preloadAudio(seqNum, url){
	audio[seqNum] = assets[url];
}

function preloadVideo(seqNum, url){
	video[seqNum] = assets[url];
}

Global.prototype.preloadAssets = preloadAssets; // called by runtime automatically
Global.prototype.preloadImage = preloadImage; // called by script block to set up convenient name
Global.prototype.preloadAudio = preloadAudio;
Global.prototype.preloadVideo = preloadVideo;

})();
/*end languages/javascript/asset_runtime.js*/

/*begin languages/javascript/control_runtime.js*/
    // Polyfill for built-in functionality, just to get rid of namespaces in older
    // browsers, or to emulate it for browsers that don't have requestAnimationFrame yet
    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.mozRequestAnimationFrame || 
                                   window.msRequestAnimationFrame || 
                                   window.webkitRequestAnimationFrame || 
                                   function(fn){ setTimeout(fn, 20); };

/*end languages/javascript/control_runtime.js*/

/*begin languages/javascript/sprite_runtime.js*/
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
/*end languages/javascript/sprite_runtime.js*/

/*begin languages/javascript/voice_runtime.js*/
// Music Routines
function Voice(){
    this.on = false;
    this.osc;       // The oscillator which will generate tones
    this.gain;      // The gain node for controlling volume
    var context = window.AudioContext || window.webkitAudioContext;
    this.context = new context();
    this.tempo = 100;
    this.frequency = 400;   // Frequency to be used by oscillator
    this.volume = 0.3;      // Volume to be used by the gain node
    this.playlist = [];
};

// Turn on the oscillator, routed through a gain node for volume
Voice.prototype.startOsc = function() {
    if (this.on) 
        this.stopOsc();
    this.osc = this.context.createOscillator();
    this.osc.type = 0; // Sine wave
    this.osc.frequency.value = this.frequency;
    // console.log('oscillator: %o', this.osc);
    this.osc.start(0);
    
    this.gain = this.context.createGain();
    this.gain.gain.value = this.volume;
    
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
    
    this.on = true;
};

// Turn off the oscillator
Voice.prototype.stopOsc = function() {
    this.osc.stop(0);
    this.osc.disconnect();
    this.on = false;
}

// Ensure a playing tone is updated when values change
Voice.prototype.updateTone = function() {
    if (this.on) {
        this.stopOsc();
        this.startOsc();
    }
};

// Calculate the frequency from a note name
Voice.prototype.setNote = function(note) {
	var noteIndex = Voice.notes.indexOf(note);
	this.frequency = 440 * Math.pow(2, (noteIndex - Voice.refNote) / 12);
}

Voice.prototype.push = function(note, len, dots) {
	this.playlist.push({pitch: note, duration: len, dotted: dots});
}

Voice.prototype.pushRest = function(len, dots) {
	this.playlist.push({pitch: "none", duration: len, dotted: dots});
}

Voice.prototype.play = function() {
	var note = this.playlist.shift();
	if(note.pitch == "none") {
		if(this.on) this.stopOsc();
	} else {
		this.setNote(note.pitch);
		if(this.on) this.updateTone();
		else this.startOsc();
	}
	var timeout = this.durationOf(note.duration, note.dotted);
	if(this.playlist.length > 0) {
		var me = this;
		setTimeout(function() {me.play();}, timeout);
	} else {
		var me = this;
		setTimeout(function() {me.stopOsc();}, timeout);
	}
}

// Calculate the duration from the tempo, and a note type, and a number of dots
Voice.prototype.durationOf = function(note, dots) {
	var qn_len = 60 / this.tempo;
	var base_len;
	if(note == 'double whole note') base_len = qn_len * 8;
	else if(note == 'whole note') base_len = qn_len * 4;
	else if(note == 'half note') base_len = qn_len * 2;
	else if(note == 'quarter note') base_len = qn_len;
	else if(note == 'eighth note') base_len = qn_len / 2;
	else if(note == 'sixteenth note') base_len = qn_len / 4;
	else if(note == 'thirty-second note') base_len = qn_len / 8;
	else if(note == 'sixty-fourth note') base_len = qn_len / 16;
	var len = base_len;
	while(dots > 0) {
		len += base_len / Math.pow(2,dots);
		dots--;
	}
	len *= 1000; // Convert from seconds to ms
	// console.log("Calculated voice duration:",note,dots,this.tempo,len);
	return len;
}

// Must be identical to the list in voice.js
Voice.notes = [
	// Octave 0
	'A0','A♯0/B♭0','B0',
	// Octave 1
	'C1','C♯1/D♭1','D1','D♯1/E♭1','E1',
	'F1','F♯1/G♭1','G1','G♯1/A♭1','A1','A♯1/B♭1','B1',
	// Octave 2
	'C2','C♯2/D♭2','D2','D♯2/E♭2','E2',
	'F2','F♯2/G♭2','G2','G♯2/A♭2','A2','A♯2/B♭2','B2',
	// Octave 3
	'C3','C♯3/D♭3','D3','D♯3/E♭3','E3',
	'F3','F♯3/G♭3','G3','G♯3/A♭3','A3','A♯3/B♭3','B3',
	// Octave 4
	'C4 (Middle C)','C♯4/D♭4','D4','D♯4/E♭4','E4',
	'F4','F♯4/G♭4','G4','G♯4/A♭4','A4','A♯4/B♭4','B4',
	// Octave 5
	'C5','C♯5/D♭5','D5','D♯5/E♭5','E5',
	'F5','F♯5/G♭5','G5','G♯5/A♭5','A5','A♯5/B♭5','B5',
	// Octave 6
	'C6','C♯6/D♭6','D6','D♯6/E♭6','E6',
	'F6','F♯6/G♭6','G6','G♯6/A♭6','A6','A♯6/B♭6','B6',
	// Octave 7
	'C7','C♯7/D♭7','D7','D♯7/E♭7','E7',
	'F7','F♯7/G♭7','G7','G♯7/A♭7','A7','A♯7/B♭7','B7',
	// Octave 8
	'C8'
];
Voice.refNote = Voice.notes.indexOf('A4');

/*end languages/javascript/voice_runtime.js*/

/*begin languages/javascript/sound_runtime.js*/

/*end languages/javascript/sound_runtime.js*/

/*begin languages/javascript/array_runtime.js*/

/*end languages/javascript/array_runtime.js*/

/*begin languages/javascript/boolean_runtime.js*/

/*end languages/javascript/boolean_runtime.js*/

/*begin languages/javascript/canvas_runtime.js*/

/*end languages/javascript/canvas_runtime.js*/

/*begin languages/javascript/color_runtime.js*/

/*end languages/javascript/color_runtime.js*/

/*begin languages/javascript/image_runtime.js*/

/*end languages/javascript/image_runtime.js*/

/*begin languages/javascript/math_runtime.js*/

/*end languages/javascript/math_runtime.js*/

/*begin languages/javascript/vector_runtime.js*/
function Vector(x,y) {
    this.x = x;
    this.y = y;
};
/*end languages/javascript/vector_runtime.js*/

/*begin languages/javascript/object_runtime.js*/

/*end languages/javascript/object_runtime.js*/

/*begin languages/javascript/string_runtime.js*/

/*end languages/javascript/string_runtime.js*/

/*begin languages/javascript/path_runtime.js*/

/*end languages/javascript/path_runtime.js*/

/*begin languages/javascript/point_runtime.js*/

/*end languages/javascript/point_runtime.js*/

/*begin languages/javascript/rect_runtime.js*/

/*end languages/javascript/rect_runtime.js*/

/*begin languages/javascript/sensing_runtime.js*/

/*end languages/javascript/sensing_runtime.js*/

/*begin languages/javascript/motion_runtime.js*/
(function(global){

var accelerometer = {};
accelerometer.direction = "";

if(window.DeviceOrientationEvent) {
    // always follow direction changes
    window.addEventListener('deviceorientation', processData);
} else {
    console.warn("Detection of acceleration is not supported");
}

function processData(event) {
    console.log('caught device orientation event');
    var left_right = event.gamma;
    var front_back = event.beta;

    var limit = 10;
    accelerometer.direction = "";

    if(left_right > limit && front_back > limit) {
        accelerometer.direction = "upright";
    } else if(left_right > limit && front_back < -limit) {
        accelerometer.direction = "downright";
    } else if(left_right < -limit && front_back < -limit) {
        accelerometer.direction = "downleft";
    } else if(left_right < -limit && front_back > limit) {
        accelerometer.direction = "upleft";
    } else if(front_back > limit) {
        accelerometer.direction = "up";
    } else if(left_right > limit) {
        accelerometer.direction = "right";
    } else if(front_back < -limit) {
        accelerometer.direction = "down";
    } else if(left_right < -limit) {
        accelerometer.direction = "left";
    }
};

global.accelerometer = accelerometer;

})(global);
/*end languages/javascript/motion_runtime.js*/

/*begin languages/javascript/shape_runtime.js*/

/*end languages/javascript/shape_runtime.js*/

/*begin languages/javascript/geolocation_runtime.js*/
(function(global){

var location = {};

if (navigator.geolocation){
  location.watchPosition = function watchPosition(cb){
    navigator.geolocation.watchPosition(
      function(data) {
        location.currentLocation = data.coords; // sets latitude and longitude
        cb();
      }, 
      function(){
        console.warn('Sorry, no position available');
      }
    );
  };
}else{
  location.watchPosition = function watchPosition(cb){
    console.warn('Sorry, geolocation services not available');
  };
}

if (navigator.geolocation){
  location.whenWithinXOf = function whenWithinXOf(distance, loc, cb){
    navigator.geolocation.watchPosition(
      function(data) {
        location.currentLocation = data.coords; // sets latitude and longitude
        if (location.distance(loc, data.coords) < distance){
          cb();
        }
      }, 
      function(){
        console.warn('Sorry, no position available');
      }
    );
  };
}else{
  location.whenWithinXOf = function whenWithinXOf(distance, loc, cb){
    console.warn('Sorry, geolocation services not available');
  };
}


// taken from http://www.movable-type.co.uk/scripts/latlong.html
location.distance = function distance( coord1, coord2 ) {

    var lat1 = coord1.latitude;
    var lon1 = coord1.longitude;

    var lat2 = coord2.latitude;
    var lon2 = coord2.longitude;

    var R = 6371; // km
    return Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                  Math.cos(lat1)*Math.cos(lat2) *
                  Math.cos(lon2-lon1)) * R;
};

location.currentLocation = {
  latitude: 0,
  longitude: 0
};

global.location = location;

})(global);
/*end languages/javascript/geolocation_runtime.js*/

/*begin languages/javascript/size_runtime.js*/

/*end languages/javascript/size_runtime.js*/

/*begin languages/javascript/text_runtime.js*/

/*end languages/javascript/text_runtime.js*/

/*begin languages/javascript/matrix_runtime.js*/

/*end languages/javascript/matrix_runtime.js*/
