(function(wb){
	'use strict';
	var canvas = document.getElementById('cm_canvas');
	var code_map = document.querySelector('.code_map');
	var container = document.getElementById('cm_container');
	var workspace = document.querySelector('.workspace');       
	
	function clearScripts(){
		while (code_map.lastChild) {
		code_map.removeChild(code_map.lastChild);
		}
	}

	function handleScrollChange(event){
	}
	

	function handleClickEvent(event){ 
	}

	code_map.addEventListener('mousedown', handleClickEvent, false);
	wb.clearCodeMap = clearScripts;
	wb.handleScrollChange = handleScrollChange;
	
})(wb);
