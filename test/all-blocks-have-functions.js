/**
 * Use with PhantomJS:
 *
 *      phantomjs test/all-blocks-have-functions.js playground.html
 *
 * Tests if all blocks in the page sidebar have defined functions.
 */
var webPage = require('webpage');
var system = require('system');
var pageName;

if (system.args.length <= 1) {
    console.error('Must provide playground.html');
    phantom.exit(-1);
} else {
    pageName = system.args[1];
}

var page = webPage.create();

page.open(pageName, function (status) {
    'use strict';

    /* Evaluate some JavaScript in the page context that counts how many of
     * the blocks have INVALID script attributes. */
    var badScripts = page.evaluate(function () {
        var selector = 'sidebar wb-context, sidebar wb-expression, sidebar wb-step';
        var allBlocks = document.querySelectorAll(selector);
        var badScripts = [];

        /* Check the script for each block. */
        Array.prototype.forEach.call(allBlocks, function (block) {
            var scriptAttr = block.attributes.script;
            if (!scriptAttr) {
                addBadScript(block, 'no script attribute');
                return;
            }

            var temp = scriptAttr.value.split('.');

            if (temp.length !== 2) {
                addBadScript(block, 'invalid script name');
                return;
            }

            var namespace = temp[0], callbackName = temp[1];

            var element = runtime[namespace];

            if (!element) {
                addBadScript(block, 'namespace does not exist');
                return;
            }

            var callback = element[callbackName];

            if (typeof callback === 'undefined') {
                addBadScript(block, 'callback undefined');
                return;
            }

            if (typeof callback !== 'function') {
                addBadScript(block, 'callback not a function');
                return;
            }
        });

        return badScripts;

        function addBadScript(block, reason) {
            badScripts.push({
                'element': block.localName,
                'script': block.attributes.script ?
                    block.attributes.script.value :
                    '<unknown>',
                'reason': reason,
            });
        }
    });

    if (badScripts.length === 0) {
        // Success!
        phantom.exit(0);
    }

    /* Print all the information as raw JSON. */
    console.error('\x1b[1;31mInvalid block functions found:\x1b[0m');
    console.error(JSON.stringify(badScripts, null, 2));
    phantom.exit(1);
});
