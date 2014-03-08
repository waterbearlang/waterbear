/* DataBlock Plugin for WaterBear */

(function(window){
	'use strict';
	function DataBlock(url) {
		this.url = url;
		this.data = "";
	}

	function createDataBlock(url) {
		var block = new DataBlock(url);
		return block;
	}

	DataBlock.prototype.getData = function() {
		if(this.url == null || this.url == undefined) {
			alert("Please give a url");
			return;
		} 
		this.data = window.ajax.gets(this.url); 
	}
	window.DataBlock = DataBlock;
	window.createDataBlock = createDataBlock;
})(window);