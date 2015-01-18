/**
 * Tests for the underlying functions for blocks in runtime.js.
 *
 * Tests are grouped using QUnit.module given their block category.
 * Tests are named according to their script attribute in their
 * wb-expression/wb-control/wb-step.
 *
 * util.js, and event.js MUST be included before this file (so you can use
 * anything in those files in your tests).
 */

/* TODO: control */
/* TODO: sprite */
/* TODO: sound */
/* TODO: arrays */
/* TODO: boolean */
/* TODO: canvas */
/* TODO: colors */
/* TODO: images */
/* TODO: math */
/* TODO: random */
/* TODO: vectors */
/* TODO: objects */
/* TODO: strings */

QUnit.module('points');
QUnit.test('create', function (assert) {
    var point = runtime.point;

    var p1 = point.create(1, 5);
    var p2 = point.create(-4, 20);

    assert.ok(p1 instanceof util.Point, 'Creating a point from coordinates');
    assert.ok(p2 instanceof util.Point, 'Creating a point from negative coordinates');
});

QUnit.test('fromVector', function (assert) {
    var point = runtime.point;

    var zero = new util.Vector(0, 0);
    var identity = new util.Vector(1, 1);
    var negVector = new util.Vector(-1, -1);

    var p1 = point.fromVector(zero);
    var p2 = point.fromVector(identity);
    var p3 = point.fromVector(negVector);

    assert.ok(p1 instanceof util.Point, 'Creating a point from zero vector');
    assert.ok(p2 instanceof util.Point, 'Creating a point from identity vector');
    assert.ok(p3 instanceof util.Point, 'Creating a point from negative vector');
});

QUnit.test('fromArray', function (assert) {
    var point = runtime.point;

    QUnit.ok(point.fromArray([4, 5]) instanceof util.Point,
             'Creating a point from an array');
    QUnit.throws(
        function () { rect.fromArray([1]); },
        'Creating from an array with less than two elements should throw'
    );
});

QUnit.test('x', function (assert) {
    var point = runtime.point;

    var p1 = new util.Point(2, 3);
    var x = point.x(p1);

    assert.equal(x, 2, 'Getting the x position of a point');
});

QUnit.test('y', function (assert) {
    var point = runtime.point;

    var p1 = new util.Point(2, 3);
    var y = point.y(p1);

    assert.equal(y, 3, 'Getting the y position of a point');
});

QUnit.test('toArray', function (assert) {
    var point = runtime.point;

    var p1 = new util.Point(2, 3);
    var array = point.toArray(p1);

    assert.deepEqual(array, [2,3], 'Getting array from point');
});

QUnit.module('rect');
QUnit.test('fromCoordinates', function (assert) {
    var rect = runtime.rect;

    var r1 = rect.fromCoordinates(-1, -2, 1, 1);

    assert.ok(r1 instanceof util.Rect,
              'Creating a rect from coordinates');
    assert.throws(
        function () {
            rect.fromCoordinates(0, 0, -1, 1);
        },
        'Creating a rect with negative width throws'
    );
    assert.throws(
        function () {
            rect.fromCoordinates(0, 0, 0, -1);
        },
        'Creating a rect with negative height throws'
    );
});

QUnit.test('fromVectors', function (assert) {
    var rect = runtime.rect;

    var zero = new util.Vector(0, 0);
    var identity = new util.Vector(1, 1);
    var negVector = new util.Vector(-1, -1);

    var r1 = rect.fromVectors(zero, identity);

    assert.ok(r1 instanceof util.Rect,
              'Creating a rect from vectors');
    assert.throws(
        function () {
            rect.fromVectors(zero, negVector);
        },
        'Creating a rect with negative size throws'
    );
});

QUnit.test('fromArray', function (assert) {
    var rect = runtime.rect;

    QUnit.ok(rect.fromArray([0, 0, 1, 1]) instanceof util.Rect,
             'Creating a Rect from an array');
    QUnit.throws(
        function () { rect.fromArray([1,2,3]); },
        'Creating from an array with less than four elements should throw'
    );
});


QUnit.test('getPosition', function (assert) {
    var rect = runtime.rect;
    
    var r1 = rect.fromCoordinates(37, 42, 1, 1);
    var position = rect.getPosition(r1);
    
    assert.ok(position instanceof util.Vector,
             'Position is returned as a Vector');
    assert.strictEqual(position.x, 37);
    assert.strictEqual(position.y, 42);
});

QUnit.test('getSize', function (assert) {
    var rect = runtime.rect;
    
    var r1 = rect.fromCoordinates(0, 0, 536, 231);
    var size = rect.getSize(r1);
    
    assert.ok(size instanceof util.Vector,
             'Size is returned as a Vector');
    assert.strictEqual(size.x, 536);
    assert.strictEqual(size.y, 231);
});

QUnit.test('asArray', function (assert) {
    var rect = runtime.rect;
    
    var r1 = rect.fromVectors(new util.Vector(0, 0), new util.Vector(1, 1));
    
    assert.deepEqual(rect.asArray(r1), [0, 0, 1, 1],
             'Rect can be returned as an array');
});

// Four methods combined into one!
QUnit.test('get{X,Y,Width,Height}', function (assert) {
    var rect = runtime.rect;
    
    var r1 = rect.fromVectors(new util.Vector(37, 42),
                              new util.Vector(536, 231));
    
    assert.strictEqual(rect.getX(r1), 37,
             'getX works');
    assert.strictEqual(rect.getY(r1), 42,
             'getY works');
    assert.strictEqual(rect.getWidth(r1), 536,
             'getWidth works');
    assert.strictEqual(rect.getHeight(r1), 231,
             'getHeight works');
});


/* TODO: sensing */
/* TODO: motion */
/* TODO: shapes */
/* TODO: geolocation */
/* TODO: sizes */
/* TODO: text */
