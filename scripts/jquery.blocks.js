//
//	Extensions to the jQuery results API to support waterbear
//
//  These methods are deprecated and being phased out in favour of operating on Block objects directly.
//
$.extend($.fn, {
    block_type: function() {
        return this.data('model').blockType;
    },
    context_block: function(){
        return this.closest('.context');
    },
    addLocalBlock: function(block) {
        var head = this.find('> .block > .blockhead');
        var locals = head.find('.locals');
        if (!locals.length) {
            locals = $('<div class="locals block_menu"></div>');
            head.find('.label').after(locals);
        }
        locals.append(block);
        return this;
    },
    extract_script: function() {
		return this.data('model').code();
    }
        
});
