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

/* sprite */

// QUnit.module('sprites');
// QUnit.test('create', function(assert){

// });

/* TODO: sound */
/* TODO: arrays */
/* TODO: boolean */
/* TODO: canvas */
/* TODO: colors */
/* TODO: images */
/* TODO: math */
/* TODO: random */

/* vectors */

var iota = 0.0001;

QUnit.module('vectors');
QUnit.test('create', function(assert){
    var vec = new util.Vector(1,1);
    assert.ok(vec, 'Vector must exist');
    assert.strictEqual(vec.x, 1, 'X should be 1 here');
    assert.strictEqual(vec.y, 1, 'Y should be 1 here');
});
QUnit.test('utilities', function(assert){
    assert.strictEqual(util.deg2rad(180), Math.PI, '180 degrees == PI radians');
    assert.strictEqual(util.rad2deg(Math.PI / 2), 90, 'Half PI radians == 90 degrees');
    var v1 = new util.Vector(1,0);
    var v2 = new util.Vector(0,1);
    assert.strictEqual(util.angle(v1,v2), -Math.PI / 2, 'Angle between <1,0> and <0,1> should be -PI/2');
});
QUnit.test('fromPolar', function(assert){
    var vec = util.Vector.fromPolar(90, 1);
    assert.fuzzyEqual(vec.x, 0, iota); // Probably all floating-point tests should use this pattern
    assert.strictEqual(vec.y, 1);
});
QUnit.test('magnitude', function(assert){
    var vec = new util.Vector(3,4);
    assert.strictEqual(vec.magnitude(), 5);
});
QUnit.test('radians', function(assert){
    assert.fuzzyEqual(new util.Vector(1,0).radians(), 0, iota);
    assert.fuzzyEqual(new util.Vector(0,1).radians(), Math.PI/2, iota);
    assert.fuzzyEqual(new util.Vector(-1,0).radians(), Math.PI, iota);
});
QUnit.test('degrees', function(assert){
    assert.fuzzyEqual(new util.Vector(1,0).degrees(), 0, iota);
    assert.fuzzyEqual(new util.Vector(0,1).degrees(), 90, iota);
    assert.fuzzyEqual(new util.Vector(-1,0).degrees(), 180, iota);
});
QUnit.test('normalize', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).normalize().x, 1, iota);
    assert.fuzzyEqual(new util.Vector(0,5).normalize().y, 1, iota);
});
QUnit.test('rotateTo', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).rotateTo(0).x, 5, iota);
    assert.fuzzyEqual(new util.Vector(0,5).rotateTo(90).y, 5, iota);
});
QUnit.test('rotate', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).rotate(90).y, 5, iota);
    assert.fuzzyEqual(new util.Vector(5,0).rotate(-90).y, -5, iota);
});
QUnit.test('rotateRads', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).rotateRads(Math.PI/2).y, 5, iota);
    assert.fuzzyEqual(new util.Vector(5,0).rotateRads(-Math.PI/2).y, -5, iota);
});
QUnit.test('toString', function(assert){
    assert.strictEqual(new util.Vector(5,0).toString(), '<5,0>');
    assert.strictEqual(new util.Vector(0,5).toString(), '<0,5>');
});

/* TODO: objects */

/* This should get rid of testing errors caused by Google Analytics*/
var _gaq = _gaq || [];

QUnit.module('objects');
QUnit.test('empty', function (assert) {
    var object = runtime.object;

    // you guys, is this test even... like... does it even?
    assert.ok(object.empty() instanceof Object,
              'Creating an empty object');
    assert.strictEqual(Object.keys(object.empty()).length, 0,
                       "Checking that it's actually empty");
});

QUnit.test('create', function (assert) {
    var object = runtime.object;

    // omigosh you guys. like, omigosh
    var o1 = object.create(['hi', 'immakitty'], [1, 2], [true, false]);

    assert.ok(o1 instanceof Object,
              'Creating an object');
    assert.strictEqual(Object.keys(o1).length, 3,
                       'Asserting it has three keys');
    assert.strictEqual(o1.hi, 'immakitty');
    assert.strictEqual(o1['1'], 2);
    assert.strictEqual(o1['true'], false);
});

QUnit.test('getValue', function (assert) {
    var object = runtime.object;

    var o1 = object.create(['hi', 'immakitty'], [1, 2], [true, false]);

    assert.strictEqual(object.getValue(o1, 'hi'), 'immakitty',
                       'Got element one');
    assert.strictEqual(object.getValue(o1, '1'), 2,
                       'Got element two');
    assert.strictEqual(object.getValue(o1, 'true'), false,
                       'Got element three');
});

QUnit.test('getKeys', function (assert) {
    var object = runtime.object;

    var o1 = object.create(['hi', 'immakitty'], [1, 2], [true, false]);
    var actual = object.getKeys(o1);
    var expected = ['hi', '1', 'true'];
    assert.deepEqual(actual.sort(), expected.sort(),
                     'Retrieved the keys in insertion order');
});


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

    assert.ok(size instanceof util.Size,
             'Size is returned as a Size');
    assert.strictEqual(size.width, 536);
    assert.strictEqual(size.height, 231);
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

QUnit.module('Geolocation');
QUnit.testBrowser('currentLocation', function (assert) {
    var geolocation = runtime.geolocation,
        lat = 53.526748,
        lon = -113.527410,
        alt = 645;

    assert.expect(4);

    /* First, stub the API... */
    var stub;

    if (navigator.geolocation) {
        /* On user agents with geolocation. */
        stub = sinon.stub(navigator.geolocation, 'watchPosition');
    } else {
        /* Create the API if it does not exist (like on PhantomJS). */
        stub = sinon.stub();
        navigator.geolocation = {
            watchPosition: stub,
            clearWatch: function () {}
        };
    }

    stub.callsArgWithAsync(0, mockLocation({
            latitude: lat,
            longitude: lon,
            altitude: alt
        }));

    /* Subscribe to the locationchanged event... */
    var done = assert.async();
    Event.on(window, 'locationchanged', null, function () {
        var location = geolocation.currentLocation();
        assert.strictEqual(location.coords.latitude, lat,
                           'API returned expected latitude');
        assert.strictEqual(location.coords.longitude, lon,
                           'API returned expected longitude');
        assert.strictEqual(location.coords.altitude, alt,
                           'API returned expected altitude');
        done();
    });

    /* Before we get the ball rolling, though, make sure currentLocation is
     * initial null. */
    assert.strictEqual(util.geolocation.currentLocation, null,
                       'Current location starts null');

    util.geolocation.startTrackingLocation();
    if (stub.restore) {
        stub.restore();
    }
});

QUnit.test('distanceBetween', function (assert) {
    var geolocation = runtime.geolocation;
    var distance;

    var pointA = mockLocation({latitude: 53.526748, longitude: -113.527410});
    var pointB = mockLocation({latitude: 43.662108, longitude: -79.380023});
    var pointC = mockLocation({latitude: 53.523256, longitude: -113.512348});
    var pointD = mockLocation({latitude: 21.882504, longitude: 33.710796});

    var actual = 2710127.747;

    // Answers found using:
    // http://www.daftlogic.com/projects-google-maps-distance-calculator.htm
    distance = geolocation.distanceBetween(pointA, pointA);
    assert.fuzzyEqual(distance, 0, 10, // ±10 m
                      'Distance between the same point');
    distance = geolocation.distanceBetween(pointA, pointB);
    assert.fuzzyEqual(distance, actual, 4000, // ±4 km
                      'Distance between points across Canada');
    distance = geolocation.distanceBetween(pointA, pointC);
    assert.fuzzyEqual(distance, 1058.173, 20, // ±20 m
                      'Distance between points around 1 km');
    distance = geolocation.distanceBetween(pointA, pointD);
    assert.fuzzyEqual(distance, 11070578.184, 25000, // ±25 km
                      'Distance between points across the world');
});

QUnit.test('[getters]', function (assert) {
    var geolocation = runtime.geolocation;
    var location = mockLocation({
        latitude: 43.662108,
        longitude: -79.380023,
        altitude: 76,
        heading: 337.89,
        speed: 1.0
    });

    assert.fuzzyEqual(geolocation.latitude(location), 43.662108, 0.0625,
                        'Fetch latitude as decimal string');
    assert.fuzzyEqual(geolocation.longitude(location), -79.380023, 0.0625,
                        'Fetch longitude as decimal string');
    assert.fuzzyEqual(geolocation.altitude(location), 76, 1,
                        'Fetch altitude as double');
    assert.fuzzyEqual(geolocation.speed(location), 1.0, 5,
                        'Fetch speed in m/s');
    assert.fuzzyEqual(geolocation.heading(location), 338.0, 5,
                        'Fetch speed in degrees');
});

/* Creates a violation object, as if created by the API itself. */
function mockLocation(options) {
    if (!options) options = {};

    var location = {
        // https://developer.mozilla.org/en-US/docs/Web/API/Coordinates
        coords: {
            latitude: options.latitude || "40.714224",
            longitude: options.longitude || "-73.961452",
            // In meters.
            altitude: options.altitude || null,
            // In meters.
            accuracy: options.accuracy || 645,
            // In meters.
            altitudeAccuracy: options.altitudeAccuracy || 100,
            // Specified in degrees. Can be NaN (when there is no speed) and null -_-.
            heading: options.heading || NaN,
            // In m/s. Can be null.
            speed: options.speed || 0,
        },
        timestamp: options.timestamp || Date.now()
    };

    return location;
}

/* TODO: sizes */
/* TODO: text */
