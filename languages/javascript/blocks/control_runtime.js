    // Polyfill for built-in functionality, just to get rid of namespaces in older
    // browsers, or to emulate it for browsers that don't have requestAnimationFrame yet
    (function(window){
    	'use strict';
    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.mozRequestAnimationFrame || 
                                   window.msRequestAnimationFrame || 
                                   window.webkitRequestAnimationFrame || 
                                   function(fn){ setTimeout(fn, 20); };
})(window);