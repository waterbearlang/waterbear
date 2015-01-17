/**
 * runtime-simple.js -- simple block functions
 *
 * This contains "simple" blocks that make few assumptions about the state of
 * the page. Functions split out into this file are thus easier to test due to
 * fewer dependencies.
 */
(function (global) {
    global.runtime = util.extend((global.runtime || {} ), {
    });
}(window));
