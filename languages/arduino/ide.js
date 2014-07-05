(function(){

// This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global

// Remove stage menu item until menus get templatized
var stageMenu = document.querySelector('[data-target=stage]').parentElement;
stageMenu.parentElement.removeChild(stageMenu);

// expose these globally so the Block/Label methods can find them
wb.choiceLists = {
    boolean: ['true', 'false'],
    highlow: ['HIGH', 'LOW'],
    inoutput: ['INPUT', 'OUTPUT'],
    onoff: ['ON', 'OFF'],
    logic: ['true', 'false'],
    digitalpins: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,'A0','A1','A2','A3','A4','A5'],
    analoginpins: ['A0','A1','A2','A3','A4','A5'],
    pwmpins: [3, 5, 6, 9, 10, 11],
    baud:[9600, 300, 1200, 2400, 4800, 14400, 19200, 28800, 38400, 57600, 115200],
    analogrefs:['DEFAULT', 'INTERNAL', 'INTERNAL1V1', 'INTERNAL2V56', 'EXTERNAL']
};

wb.setDefaultScript = function(script){
    window.defaultscript = script;
};

wb.loadDefaultScript = function(script){
    if (typeof window.defaultscript != 'undefined'){
        loadScriptsFromObject(window.defaultscript);
    }
};

wb.writeScript = function(blocks, view){
    var code = blocks.map(function(elem){
        return wb.block.code(elem);
    }).join('\n');
    view.innerHTML = '<pre class="language-arduino">' + code + '</pre>';
};

wb.runCurrentScripts = function(){ /* do nothing */ };
wb.clearStage = function(){ /* do nothing */ };


wb.wrap = function(blocks){
        // update size of frame
        return blocks.map(function(elem){
          return wb.block.code(elem);
        }).join('\n\n');
};


function clearScriptsDefault(event, force){
  clearScripts(event, force);
  loadDefaultScript();
}

document.querySelector('.clear_scripts').addEventListener('click', clearScriptsDefault, false);



var defaultscript=[{"klass":"control","label":"Global Settings","script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Setup - When program starts","script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Main loop","script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[""],"next":""}];
wb.setDefaultScript(defaultscript);


})();
