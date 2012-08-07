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
    //console.log('found %s scripts to view', blocks.length);
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
    console.log('cloneCommand(%s, %o)', key, opt);
}

function editCommand(key, opt){
    console.log('editCommand(%s, %o)', key, opt);
}

function expandCommand(key, opt){
    console.log('expandCommand(%s, %o)', key, opt);
}

function collapseCommand(key, opt){
    console.log('collapseCommand(%s, %o)', key, opt);
}

function copyBlockCommand(key, opt){
    console.log('copyBlockCommand(%s, %o)', key, opt);
}

function copySubscriptCommand(key, opt){
    console.log('copySubscriptCommand(%s, %o)', key, opt);
}

function pasteCommand(key, opt){
    console.log('pasteCommand(%s, %o)', key, opt);
}

function cancelCommand(key, opt){
    console.log('cancelCommand(%s, %o)', key, opt);
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
            console.log('long tap detected');
            console.log(this);
            this.contextMenu();
        },
        touchDelay: 150
    });
}



// Build the Blocks menu, this is a public method
function menu(title, specs, show){
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
    console.log('state: %s, show: %s', state, !!show);
    $('#block_menu').accordion('destroy').accordion({
        autoHeight: false,
        collapsible: true,
        active: show ? 'h3.' + group : state
    });
}
window.menu = menu;

})(jQuery);

