/*global yepnope, jQuery */

yepnope(
    {
        load: [],
        complete: setup
    }
);

function setup(){
    console.log('All done?');

    load_current_scripts();
    $('.scripts_workspace').trigger('init');
    
    $('.socket input').live('click',function(){
        $(this).focus();
        $(this).select();
    });
};
