// Testing blocks in playground.html

// Load playground
// parse into DOM
// Walk each block, place into an empty wb-playground
// Add child blocks as needed
// Run and check results (use sinon as needed)

// Requires `lib/ajax.js` be loaded

// Polyfill for DOMParser via
// https://developer.mozilla.org/en-US/docs/Web/API/DOMParser

/* inspired by https://gist.github.com/1129031 */
/*global document, DOMParser*/
(function(DOMParser) {
	"use strict";
	var
	  proto = DOMParser.prototype
	, nativeParse = proto.parseFromString
	;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser()).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var
			  doc = document.implementation.createHTMLDocument("")
			;
	      		if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        			doc.documentElement.innerHTML = markup;
      			}
      			else {
        			doc.body.innerHTML = markup;
      			}
			return doc;
		} else {
			return nativeParse.apply(this, arguments);
		}
	};
}(DOMParser));


(function(){

    var doc;
    var blocksToTest;
    var testTracker = {};
    QUnit.config.autostart = false;

    QUnit.moduleDone(function( details ) {
        console.log( "Finished running: ", details.name, "Failed/total: ", details.failed, details.total );
        if (details.name === 'playground'){
            var totalBlocks = testTracker.length();
            var untestedBlocks = testTracker.filter(function(blockInfo){
                return ! blockInfo.tested;
            });
            console.log('%s blocks not tested', untestedBlocks);
        }
    });

    function getName(block){
        return block.getAttribute('ns') + '/' + block.getAttribute('fn');
    }

    function loadPlayground(){
        ajax.get('../playground.html?' + Math.random(), function(playgroundhtml){
            var parser = new DOMParser();
            var doc = parser.parseFromString(playgroundhtml, "text/html");
            blocksToTest = [].slice.call(doc.body.querySelectorAll('sidebar wb-context, sidebar wb-step, sidebar wb-expression'));
            blocksToTest.forEach(function(block){
                var blockName = getName(block);
                if (typeof testTracker[blockName] !== 'undefined'){
                    console.error('duplicate block name: %s', blockName);
                }
                testTracker[blockName] = {
					ns: block.getAttribute('ns'),
					fn: block.getAttribute('fn'),
					name: blockName,
                    tested: false,
                    block: block
                };
            });
            QUnit.start();
        }, function(statusCode, xhr){
            console.error('Failed to load playground: %s', statusCode + xhr);
        });
    }

    QUnit.module('playground', function(){

        QUnit.test( "Run some tests on playground.html", function( assert ) {
          console.log('testing a block');
		  var block = blocksToTest[0];
          var tracker = testTracker[getName(block)];
          assert.ok(tracker, 'Must have a tracker for each block');
        });
    });

	loadPlayground();

})();
