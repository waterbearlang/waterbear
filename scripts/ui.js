(function($){

// UI Chrome Section

// function accordion(event){
//     // console.log('accordion');
//     var self = $(this);
//     if (self.hasClass('selected')){
//         self.removeClass('selected').siblings('.option').slideUp('slow');
//         return;
//     }
//     $('.select.selected').removeClass('selected').siblings('.option').slideUp('slow');
//     self.addClass('selected').siblings('.option').slideDown('slow');
//     $('#block_menu').trigger('open', self);
// }
//$('#block_menu').delegate('.select', 'click', accordion);


function tab_select(event){
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
$('.tab_bar').delegate('.chrome_tab', 'click', tab_select);

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



// Build the Blocks menu, this is a public method

function menu(title, specs, show){
    var group = title.toLowerCase();
    var body = $('<section class="submenu"></section>');
    var select = $('<h3><a href="#">' + title + '</a></h3>').appendTo(body);
    var options = $('<div class="option"></div>').appendTo(body);
    specs.forEach(function(spec, idx){
        spec.group = group;
        options.append(Block(spec).view());
    });
    $('#block_menu').append(body);
    if (show){
        select.addClass('selected');
    }else{
        options.hide();
    }
    return body;
}
window.menu = menu;

})(jQuery);

