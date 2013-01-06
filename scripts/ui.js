(function($){

// UI Chrome Section

function tabSelect(event){
    var self = $(this);
    $('.tabbar .selected').removeClass('selected');
    self.addClass('selected');
    if (self.is('.scripts_workspace_tab')){
		$('.workspace:visible').attr('class', 'workspace blockview');
    }else if (self.is('.scripts_text_view_tab')){
		$('.workspace:visible').attr('class', 'workspace textview');
        updateScriptsView();
    }
}
$('.tabbar').on('click', '.chrome_tab', tabSelect);

// Expose this to dragging and saving functionality
function showWorkspace(){
    $('.workspace:visible').attr('class', 'workspace blockview');
}
window.showWorkspace = showWorkspace;

function updateScriptsView(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    var view = $('.workspace:visible .scripts_text_view');
    blocks.writeScript(view);
}
window.updateScriptsView = updateScriptsView;

function runCurrentScripts(event){
	if (document.body.className === 'result' && wb.script){
		wb.runScript(wb.script);
	}else{
	    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
		document.body.className = 'result';
		wb.runScript( blocks.prettyScript() );
	}
}
$('.runScripts').click(runCurrentScripts);

wb.runScript = function(script){
	wb.script = script;
	$('.stageframe')[0].contentWindow.postMessage(JSON.stringify({command: 'runscript', script: script}), '*');
}

function clearStage(event){
	$('.stageframe')[0].contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
$('.clear_canvas').click(clearStage);

// Context Menu
//
// 'this' is the object matching the selector
// key is the key in the items object
// opt is the context menu object itself

function cloneCommand(key, opt){
    console.info('cloneCommand(%s, %o)', key, opt);
}

function editCommand(key, opt){
    console.info('editCommand(%s, %o)', key, opt);
}

function expandCommand(key, opt){
    console.info('expandCommand(%s, %o)', key, opt);
}

function collapseCommand(key, opt){
    console.info('collapseCommand(%s, %o)', key, opt);
}

function cutBlockCommand(key, opt){
    console.info('cutBlockCommand(%o, %s, %o)', this, key, opt);
    var view = this.closest('.wrapper');
    pasteboard = view.data('model');
    // Remove it programatically, and trigger the right events:
    removeFromScriptEvent(view);
    view.remove();
}

function copyBlockCommand(key, opt){
    console.info('copyBlockCommand(%s, %o)', key, opt);
    pasteboard = this.closest('.wrapper').data('model').clone();
}

function copySubscriptCommand(key, opt){
    console.info('copySubscriptCommand(%s, %o)', key, opt);
    pasteboard = this.closest('.wrapper').data('model').clone(true);
}

function pasteCommand(key, opt){
    console.info('pasteCommand(%s, %o)', key, opt);
    if (pasteboard){
        this.append(pasteboard.view());
        addToScriptEvent(this, pasteboard.view());
    }
}

function pasteExpressionCommand(key, opt){
    console.info('pasteExpressionCommand(%s, %o)', key, opt);
    if (pasteboard && pasteboard.blocktype === 'expression'){
        this.hide();
        pasteCommand.call(this.parent(), key, opt);
    }
}

function pasteStepCommand(key, opt){
    console.info('pasteStepCommand(%s, %o)', key, opt);
    if (pasteboard && pasteboard.blocktype !== 'expression'){
        if (this.find('> .wrapper').length){
            console.log('already has a child element');
        }else{
            pasteCommand.call(this, key, opt);
        }
    }
}

function cancelCommand(key, opt){
    console.info('cancelCommand(%s, %o)', key, opt);
}

var pasteboard = null;

// $.contextMenu({
//     selector: '.scripts_workspace .block',
//     items: {
//         //clone: {'name': 'Clone', icon: 'add', callback: cloneCommand},
//         //edit: {'name': 'Edit', icon: 'edit', callback: editCommand},
//         //expand: {'name': 'Expand', callback: expandCommand},
//         //collapse: {'name': 'Collapse', callback: collapseCommand},
//         cut: {'name': 'Cut block', icon: 'cut', callback: cutBlockCommand},
//         copy: {'name': 'Copy block', icon: 'copy', callback: copyBlockCommand},
//         copySubscript: {'name': 'Copy subscript', callback: copySubscriptCommand},
//         //paste: {'name': 'Paste', icon: 'paste', callback: pasteCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
// 
// $.contextMenu({
//    selector: '.scripts_workspace',
//    items: {
//        paste: {'name': 'Paste', icon: 'paste', callback: pasteCommand},
//        cancel: {'name': 'Cancel', callback: cancelCommand}
//    } 
// });
// 
// $.contextMenu({
//     selector: '.scripts_workspace .value > input',
//     items: {
//         paste: {'name': 'Paste', icon: 'paste', callback: pasteExpressionCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
// 
// $.contextMenu({
//     selector: '.scripts_workspace .contained',
//     items: {
//         paste: {'name': 'Paste', icon: 'paste', callback: pasteStepCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
// 

// TODO: add event handler to enable/disable, hide/show items based on state of block

// Handle Context menu for touch devices:
// Test drawn from modernizr

function is_touch_device() {
  return !!('ontouchstart' in window);
}

if (is_touch_device()){
    $.tappable({
        container: '.blockmenu, .workspace',
        selector: '.block',
        callback: function(){
            console.info('long tap detected');
            console.info(this);
            this.contextMenu();
        },
        touchDelay: 150
    });
}

var menu_built = false;
var saved_menus = [];

// Build the Blocks menu, this is a public method
wb.menu = function(title, specs, show){
	switch(wb.view){
		case 'result': return run_menu(title, specs, show);
		case 'blocks': return edit_menu(title, specs, show);
		case 'editor': return edit_menu(title, specs, show);
		default: return edit_menu(title, specs, show);
	}
};

function run_menu(title, specs, show){
	if (menu_built){
		return edit_menu(title, specs, show);
	}
	saved_menus.push([title, specs, show]);
}

wb.buildDelayedMenus = function(){
	if (!menu_built && saved_menus.length){
		saved_menus.forEach(function(m){
			edit_menu(m[0], m[1], m[2]);
		});
		saved_menus = [];
	}
}

function edit_menu(title, specs, show){
	menu_built = true;
    var group = title.toLowerCase().split(/\s+/).join('');
    var submenu = $('.submenu.' + group);
    if (!submenu.length){
        var body = $('<h3 class="' + group + '"><a href="#">' + title + '</a></h3><div class="submenu ' + group + '"></div>');
        $('#block_menu').append(body);
        submenu = $('.submenu.' + group);
        // This is dumb, but jQuery UI accordion widget doesn't support adding sections at runtime
    }
    specs.forEach(function(spec, idx){
        spec.group = group;
        spec.isTemplateBlock = true;
        submenu.append(Block(spec).view());
    });
    var state = $("#block_menu").accordion( "option", "active" );
    $('#block_menu').accordion('destroy').accordion({
        autoHeight: false,
        collapsible: true,
        active: show ? 'h3.' + group : state
    });
}

})(jQuery);

