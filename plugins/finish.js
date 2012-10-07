/*global yepnope, jQuery, $ */

yepnope(
    {
        load: [],
        complete: setup
    }
);

function setup(){
    console.log('All done?');
	$('#block_menu').accordion({
        autoHeight: false,
        collapsible: true,
        header: '> section > h3'
    });
    $('#block_menu_load').remove();
    $('#block_menu').show();

    $('.goto_script').click( function() {
        // shut down execution
        $('body').trigger('waterbear_close');
    } );
};
