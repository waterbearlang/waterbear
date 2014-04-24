(function(wb){
	'use strict';
	var canvas = document.getElementById('cm_canvas');
	var code_map = document.querySelector('.code_map');
	var container = document.getElementById('cm_container');
	var content = document.querySelector('.content');	
	var ctx = canvas.getContext('2d');
	ctx.fillStyle="blue"; 
	ctx.globalAlpha = 0.3;
	var top = 0;
	var height = 0; 
	
	function drawRectForViewPort(){
		var workspace = document.querySelector('.scripts_workspace'); 
		var blocked = workspace.querySelector('.contained');
		var ctOffTop = blocked.offsetTop;
		var ratio = canvas.height/ container.clientHeight;
		var scrt = workspace.scrollTop;
		top = scrt;
		var work_space_vh = workspace.clientHeight; 
		if(scrt < ctOffTop ){
			work_space_vh = work_space_vh - (ctOffTop - scrt);
			top = 0;
		}
		else{
			top = (top - ctOffTop)*ratio*wb.cm_percent;
		}
		height = work_space_vh * wb.cm_percent * ratio;
		ctx.clearRect(0,0,canvas.width, canvas.height);
		ctx.fillRect(0,top, canvas.width, height);
	}
	
	function clearScripts(){
		while (code_map.lastChild) {
		code_map.removeChild(code_map.lastChild);
		}
	}

	function handleScrollChange(event){
		drawRectForViewPort();
	}
	

	function handleClickEvent(event){ 
		var y = event.pageY - content.offsetTop;
		var workspace = document.querySelector('.scripts_workspace'); 
		workspace.scrollTop = y / wb.cm_percent;
	}

	code_map.addEventListener('mousedown', handleClickEvent, false);
	wb.clearCodeMap = clearScripts;
	wb.handleScrollChange = handleScrollChange;
	wb.drawRectForViewPort = drawRectForViewPort;
	
})(wb);
