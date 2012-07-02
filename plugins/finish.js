/*global yepnope, jQuery */

yepnope(
    {
        load: [],
        complete: setup
    }
);

function setup(){
    console.log('All done?');
};
