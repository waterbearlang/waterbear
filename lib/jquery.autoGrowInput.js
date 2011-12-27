(function($){
    
    // jQuery autoGrowInput plugin by James Padolsey
    // See related thread: http://stackoverflow.com/questions/931207/is-there-a-jquery-autogrow-plugin-for-text-fields
        
    $.fn.autoGrowInput = function(o) {
            
        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 30
        }, o);
            
        this.filter('input').each(function(){
                
            var minWidth = o.minWidth || $(this).width(),
            val = '',
            input = $(this),
            testSubject = $('<tester/>').css({
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontSize: input.css('fontSize'),
                fontFamily: input.css('fontFamily'),
                fontWeight: input.css('fontWeight'),
                letterSpacing: input.css('letterSpacing'),
                whiteSpace: 'nowrap'
            }),
            check = function() {
                        
                if (val === (val = input.val())) {
                    return;
                }
                        
                // Enter new content into testSubject
                var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,'&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                testSubject.html(escaped);
                        
                // Calculate new width + whether to change
                var testerWidth = testSubject.width(),
                newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                currentWidth = input.width(),
                isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                || (newWidth > minWidth && newWidth < o.maxWidth);
                        
                // Animate width
                if (isValidWidthChange) {
                    input.width(newWidth);
                }
                        
            };
                    
            testSubject.insertAfter(input);
                
            $(this).live('keyup keydown blur update', check);
            check();
                
        });
            
        return this;
        
    };
        
})(jQuery);
    
//After the blocks menu has been generated, this is triggerd, 
//and when blocks are added to the .scripts_workspace   
$('.scripts_workspace').bind("init add", function(e) {
    $('.scripts_workspace .socket input').autoGrowInput();
});
//When an accordion section expands, we make all the fields big enough.
$('.block_menu').bind("open", function(e, who) {
    $(who).siblings('.option').find('.socket input').autoGrowInput();
});


