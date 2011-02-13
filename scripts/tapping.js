$('.submenu .wrapper').live(clickEvent, function(event) {
    var copy = $(this.cloneNode(true));
    $('.scripts_workspace').append(copy);
    copy.center();
    copy.selectBlock();
});

$('.scripts_workspace').live(clickEvent, function(event){
    if (event.srcElement !== this){
        var selected = $('.scripts_workspace .selected');
        if (!selected.length) return;
        var wrapper = $(event.srcElement).closest('.wrapper');
        if (!wrapper.length) return;
        if (!wrapper.is('.scripts_workspace .wrapper')) return;
        if (wrapper[0] == selected[0]) return;
        wrapper.appendToBlock(selected);
        return;
    }
    $.selectedBlock().moveTo(event.offsetX, event.offsetY);
});

$('input').live(clickEvent, function(event){
    event.stopPropagation();
});

$('.scripts_workspace .wrapper').live(clickEvent, function(event){
    var self = $(elem);
    if (self.is('.selected')){
        self.unselectBlock();
    }else{
        self.selectBlock();
    }
    event.stopPropagation();
});
