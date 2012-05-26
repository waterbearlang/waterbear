(function($){

// UI Chrome Section

function accordion(event){
    // console.log('accordion');
    var self = $(this);
    if (self.hasClass('selected')){
        self.removeClass('selected').siblings('.option').slideUp('slow');
        return;
    }
    $('.select.selected').removeClass('selected').siblings('.option').slideUp('slow');
    self.addClass('selected').siblings('.option').slideDown('slow');
    $('#block_menu').trigger('open', self);
}
$('#block_menu').delegate('.select', 'click', accordion);

})(jQuery);
