// Size Routines
(function(window){
'use strict';

/**
 * Convert size parameter to pixel value
 *
 * @param {?size=} size is the size parameter
 * @return {number} pixel value for size
 *
 */
function convert(size) {
  switch(size.unit) {
    case "px":
        return size.value;
    case "% width":
        return (runtime.stage_width * size.value)/100;
    case "% height":
        return (runtime.stage_height * size.value)/100;
    default: //need this b/c examples currently have size blocks w/o option list
      return size.value;
  }
}
window.convert = convert;
})(window);
