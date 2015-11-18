/**
 * Use with PhantomJS:
 *
 *      phantomjs test/all-blocks-have-functions.js
 *
 * Tests if all blocks in the page sidebar have defined functions.
 */
var webPage = require('webpage');
var system = require('system');
var pageName = 'playground.html';

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
            var namespaceAttr = block.attributes.ns;
            if (!namespaceAttr) {
                addBadScript(block, 'no namespace (ns) attribute');
                return;
            }

            var functionAttr = block.attributes.fn;
            if (!functionAttr){
                addBadScript(block, 'no function (fn) attribute');
                return;
            }
            if (functionAttr.value === 'commentContext'){
                // comments don't need functions
                return;
            }

            var namespace = namespaceAttr.value, functionName = functionAttr.value;

            var element = runtime[namespace];

            if (!element) {
                addBadScript(block, 'namespace ' + namespace + ' does not exist');
                return;
            }

            var fun = element[functionName];

            if (typeof fun === 'undefined') {
                addBadScript(block, 'function ' + namespace + '.' + functionName + ' is undefined');
                return;
            }

            if (typeof fun !== 'function') {
                addBadScript(block, 'function' + namespace + '.' + functionName + ' is not a function');
                return;
            }
        });

        return badScripts;

        function addBadScript(block, reason) {
            badScripts.push({
                'element': block.localName,
                'script': block.attributes.fn ?
                    block.attributes.fn.value :
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
