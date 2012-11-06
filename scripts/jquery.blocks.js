//
//	Extensions to the jQuery results API to support waterbear
//
//  These methods are deprecated and being phased out in favour of operating on Block objects directly.
//
$.extend($.fn, {
    block_type: function() {
        return this.data('model').blockType;
    },
    extract_script: function() {
		return this.data('model').code();
    }
        
});
