// Utility methods

window.debug = false;

function h(node){
	if (node.nodeType){
		return node.outerHTML;
	}
	if (node.jquery){
		if (node.length === 1){
			return 'jq' + node[0].outerHTML;
		}
		return 'jq' + JSON.stringify(node.get().map(function(x){return x.outerHTML}));
	}
	if (node.length && node[0].jquery){
		print ('Do you really mean to have a list of jquery objects?');
		return node.map(function(x){return h(x);});
	}
	return node;
}

function c(node){
	return j(node.data('context'));
}
	
function j(obj){
	try{
		return JSON.stringify(h(obj));
	}catch(e){
		print('cannot stringify %o', obj);
		return 'cannot stringify ' + obj;
	}
}

function print(){
	if (debug){
		console.log.apply(console, arguments);
	}
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
	
	function print(msg) {
		console.log(msg);
	}
	
	print(exc);
	
	if (!exc.stack) {
		print('no stacktrace available');
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
		print('  ' + toprint[i][1]);
		print('    ' + toprint[i][0]);
	};
	print();
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
 *	    console.log("Help pop up page wide init");
 *	    twinapex.debug.manageExceptions(initHelpPopUpHandlers(document));
 *  });
 *  </pre>
 *  
 *
 * @param func: Javascript function reference
 */
twinapex.debug.manageExceptions = function(func) {

	var orignal = func;

	decorated = function() {
		try {
			orignal.apply(this, arguments);
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

