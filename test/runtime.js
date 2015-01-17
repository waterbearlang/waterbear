/**
 * Tests for the underlying functions for blocks in runtime.js.
 *
 * Tests are named as {blockCategory}.{block} (as they are named in their
 * script attribute in their wb-expression/wb-control/wb-step).
 *
 * util, and event MUST be included before this file.
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
/* TODO: points */

QUnit.module('rect');
QUnit.test('rect.fromCoordinates', function (assert) {
    var rect = runtime.rect;

    var r1 = rect.fromCoordinates(-1, -2, 1, 1);

    assert.ok(r1 instanceof util.Rect,
              'The rect could not be created.');
    assert.throws(
        function () {
            rect.fromCoordinates(0, 0, -1, 1);
        },
        'Created a rect with negative width'
    );
    assert.throws(
        function () {
            rect.fromCoordinates(0, 0, 0, -1);
        },
        'Created a rect with negative height'
    );
});

/* TODO: sensing */
/* TODO: motion */
/* TODO: shapes */
/* TODO: geolocation */
/* TODO: sizes */
/* TODO: text */
