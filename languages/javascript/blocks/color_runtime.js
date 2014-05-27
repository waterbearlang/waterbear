(function(runtime){
	'use strict';

	function greyValueAsHex(value){
		var level = runtime.math.limit(value, 0, 255);
		var hex = level.toString(16);
		if (hex.length == 1){
			hex = '0' + hex;
		}
		return '#' + hex + hex + hex;
	}

	runtime.color = {
		greyValueAsHex: greyValueAsHex
	};
})(runtime);