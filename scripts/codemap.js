(function(wb){
    'use strict';
    var canvas = document.querySelector('.cm-canvas');
    var codeMap = document.querySelector('.code-map');
    var container = document.querySelector('.cm-container');
    var content = document.querySelector('.content');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "blue";
    ctx.globalAlpha = 0.3;
    var top = 0;
    var height = 0;

    function drawRectForViewPort(){
        var workspace = document.querySelector('.scripts-workspace');
        var blocked = workspace.querySelector('.contained');
        var ctOffTop = blocked.offsetTop;
        var ratio = canvas.height/ container.clientHeight ;
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, top, canvas.width, height);
    }
    function clearScripts(){
        while (codeMap.lastChild) {
            codeMap.removeChild(codeMap.lastChild);
        }
    }

    function handleScrollChange(event){
        drawRectForViewPort();
    }


    function handleClickEvent(event){
        var y = event.pageY - content.offsetTop + container.scrollTop;
        var workspace = document.querySelector('.scripts-workspace');
        workspace.scrollTop = y / wb.cm_percent;
    }

    canvas.addEventListener('mousedown', handleClickEvent, false);
    wb.clearCodeMap = clearScripts;
    wb.handleScrollChange = handleScrollChange;
    wb.drawRectForViewPort = drawRectForViewPort;

})(wb);
