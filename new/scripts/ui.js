(function($){

// UI Chrome Section

function tabSelect(event){
    var self = $(this);
    $('.tab_bar .selected').removeClass('selected');
    self.addClass('selected');
    $('.workspace:visible > div:visible').hide();
    if (self.is('.scripts_workspace_tab')){
        $('.workspace:visible .scripts_workspace').show();
    }else if (self.is('.scripts_text_view_tab')){
        $('.workspace:visible .scripts_text_view').show();
        updateScriptsView();
    }
}
$('.tab_bar').on('click', '.chrome_tab', tabSelect);

// Expose this to dragging and saving functionality
function showWorkspace(){
    $('.workspace:visible .scripts_text_view').hide();
    $('.workspace:visible .scripts_workspace').show();
}
window.showWorkspace = showWorkspace;

function updateScriptsView(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    var view = $('.workspace:visible .scripts_text_view');
    blocks.writeScript(view);
}
window.updateScriptsView = updateScriptsView;

function runScripts(event){
    $('.stage')[0].scrollIntoView();
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrapScript() + '</script></div>');
}
$('.runScripts').click(runScripts);

// Context Menu

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

function copyBlockCommand(key, opt){
    console.info('copyBlockCommand(%s, %o)', key, opt);
}

function copySubscriptCommand(key, opt){
    console.info('copySubscriptCommand(%s, %o)', key, opt);
}

function pasteCommand(key, opt){
    console.info('pasteCommand(%s, %o)', key, opt);
}

function cancelCommand(key, opt){
    console.info('cancelCommand(%s, %o)', key, opt);
}

$.contextMenu({
    selector: '.block',
    items: {
        clone: {'name': 'Clone', icon: 'add', callback: cloneCommand},
        edit: {'name': 'Edit', icon: 'edit', callback: editCommand},
        expand: {'name': 'Expand', callback: expandCommand},
        collapse: {'name': 'Collapse', callback: collapseCommand},
        copy: {'name': 'Copy block', icon: 'copy', callback: copyBlockCommand},
        copyAll: {'name': 'Copy subscript', callback: copySubscriptCommand},
        paste: {'name': 'Paste', icon: 'paste', callback: pasteCommand},
        cancel: {'name': 'Cancel', callback: cancelCommand}
    }
});

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

//THe namespace function should be namespaced because bootstrap also has a menu function.
var wb = {
	// Build the Blocks menu, this is a public method
	"menu": function (title, specs, show){
		var group = title.toLowerCase().split(/\s+/).join('_'); //add words with underscores
	
		var button = $("<button type=\"button\" class=\"btn btn-mini\" data-name=\""+group+"\">"+title+"</button>");
		$("#block_menu .menu").append(button); //append buttons here
	
		var innerMenu = $("#block_menu .sb-inner"); //append blocks here
		
		var section = $("<div class=\"group "+group+"\"><div class=\"block_header "+group+"\">"+title+"</div></div>");
		
		specs.forEach(function(spec, idx){
			spec.group = group;
			spec.isTemplateBlock = true;
			section.append(Block(spec).view());
		});
		
		innerMenu.append(section);
	}
	};
window.menu = wb.menu;

})(jQuery);

