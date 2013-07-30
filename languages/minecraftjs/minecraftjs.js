/*
 *    MINECRAFTJS PLUGIN
 *
 *    Support for writing Javascript for Minecraft using Waterbear
 *
 */


// Add some utilities

/*

$('.runScripts').click(function(){
     var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
     var code = blocks.prettyScript();
     var query = $.param({'code':code});
     
     $.ajax({
      url: '/run?',
      data: query,
      success: function(){alert("Code running on RPi");},
      error: function(){alert("Code failed / server not running on RPi");}
     });
     
     
});

// Add some utilities
jQuery.fn.extend({
    prettyScript: function(){
        var script = this.map(function(){
            return $(this).extract_script();
        }).get().join('');
        
        script = "var Minecraft = require('./minecraft-pi/lib/minecraft.js'); \n var client = new Minecraft('localhost', 4711, function() {\n"+script+"\n});";
        
        return js_beautify(script);
    },
    writeScript: function(view){
      view.html('<pre class="language-javascript">' + this.prettyScript() + '</pre>');
      hljs.highlightBlock(view.children()[0]);
    }
});

// End UI section

// expose these globally so the Block/Label methods can find them
window.choiceLists = {
    keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
        blocks:["AIR","STONE","GRASS","DIRT","COBBLESTONE","WOOD_PLANKS","SAPLING","BEDROCK","WATER_FLOWING","WATER_STATIONARY","LAVA_FLOWING","LAVA_STATIONARY","SAND","GRAVEL","GOLD_ORE","IRON_ORE","COAL_ORE","WOOD","LEAVES","GLASS","LAPIS_LAZULI_ORE","LAPIS_LAZULI_BLOCK","SANDSTONE","BED","COBWEB","GRASS_TALL","WOOL","FLOWER_YELLOW","FLOWER_CYAN","MUSHROOM_BROWN","MUSHROOM_RED","GOLD_BLOCK","IRON_BLOCK","STONE_SLAB_DOUBLE","STONE_SLAB","BRICK_BLOCK","TNT","BOOKSHELF","MOSS_STONE","OBSIDIAN","TORCH","FIRE","STAIRS_WOOD","CHEST","DIAMOND_ORE","DIAMOND_BLOCK","CRAFTING_TABLE","FARMLAND","FURNACE_INACTIVE","FURNACE_ACTIVE","DOOR_WOOD","LADDER","STAIRS_COBBLESTONE","DOOR_IRON","REDSTONE_ORE","SNOW","ICE","SNOW_BLOCK","CACTUS","CLAY","SUGAR_CANE","FENCE","GLOWSTONE_BLOCK","BEDROCK_INVISIBLE","GLASS_PANE","MELON","FENCE_GATE","GLOWING_OBSIDIAN","NETHER_REACTOR_CORE"],
        cameramode:['normal','thirdPerson','fixed'],
        blocktypes: ['step', 'expression', 'context', 'eventhandler'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
};

*/

wb.wrap = function(script){
    return 'try{' + script + '}catch(e){console,log(e);}})()';
}

function runCurrentScripts(event){
    if (document.body.className === 'result' && wb.script){
        wb.runScript(wb.script);
    }else{
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        document.body.className = 'result';
        wb.runScript( wb.prettyScript(blocks) );
    }
}
Event.on('.runScripts', 'click', null, runCurrentScripts);

wb.runScript = function(script){
    wb.script = script;
    var runtimeUrl = location.protocol + '//' + location.host + '/dist/javascript_runtime.min.js';
    console.log('trying to load library %s', runtimeUrl);
    document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: runtimeUrl, script: wb.wrap(script)}), '*');
}

function clearStage(event){
    document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
Event.on('.clear_canvas', 'click', null, clearStage);
Event.on('.editScript', 'click', null, clearStage);



wb.prettyScript = function(elements){
    var script = js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join(''));
    script = "var Minecraft = require('./minecraft-pi/lib/minecraft.js'); \n var client = new Minecraft('localhost', 4711, function() {\nvar zeros={x:0, y:0, z:0};\n"+script+"\n});";
    return script;
};

wb.writeScript = function(elements, view){
    view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
    hljs.highlightBlock(view.firstChild);
};

// End UI section

// expose these globally so the Block/Label methods can find them
wb.choiceLists = {
    boolean: ['true', 'false'],
    blocktypes: ['step', 'expression', 'context', 'eventhandler'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
};

// Hints for building blocks
//
//
// Expression blocks can nest, so don't end their scripts with semi-colons (i.e., if there is a "type" specified).
//
//

// Temporarily disable these until I can get time to implement them properly
// wb.menu('Recent Blocks', []);
// wb.menu('Favourite Blocks', []);



Event.on('.socket input', 'click', null, function(event){
    event.wbTarget.focus();
    event.wbTarget.select();
});

