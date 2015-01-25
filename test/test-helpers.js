/**
 * Test helpers for Qunit tests.
 *
 * Adds:
 *
 *  - QUnit.assert.fuzzyEqual
 *  - QUnit.testBrowser
 *
 */
(function () {
    var usingPhantomJS;

    // See http://stackoverflow.com/a/24471222
    usingPhantomJS = (window.outerWidth === 0 && window.outerHeight === 0);

    /* Assertion passes if the numbers are equal... enough (within a tolerance).
     * Use with wishy-washy floating point numbers. */
    QUnit.assert.fuzzyEqual = function(actual, expected, epsilon, message ) {
        var absoluteDifference = Math.abs(expected - actual);
        QUnit.push(absoluteDifference <= epsilon, actual, expected, message);
    };

    /**
     * Equivilent to QUnit.test. 
     */
    QUnit.testBrowser = usingPhantomJS ? noop : QUnit.test;

    /* No-op */
    function noop() {
        return;
    }
}());
