// Size Routines
(function(window){
'use strict';

/**
 * Convert size parameter to pixel value 
 * 
 * @param {?number=} x is the size parameter
 * @param {?relativeUnit=} unit is px or %
 * @param {?boolean=} isWidth is true for width, false for height
 * @return {number} pixel value for size
 *
 * Notes: -em and pt irrelevant for these purposes, need way to disable these
 *         options in the dropdown
 */
function convert(x, relativeUnit, isWidth) {
  switch(relativeUnit) {
    case "px":
      return x;
    case "%":
      if(isWidth){
        return (runtime.stage_width*x)/100;
      }
      else {
        return (runtime.stage_height*x)/100;
      }
    default: //need this b/c examples currently have size blocks w/o option list
      return x; 
  }
}
window.convert = convert;
})(window);