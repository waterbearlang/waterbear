#!/usr/bin/env node

var fs = require('fs');

var filenames = process.argv.slice(2); // 0 is node, and 1 is script name

filenames.forEach(function(filename){
    fs.readFile(filename, 'utf8', checkfile(filename));
});

function doNothing(){return doNothing;}
doNothing.trigger = doNothing;
doNothing.live = doNothing;
doNothing.alert = doNothing;
doNothing.append = doNothing;
doNothing.getElementsByTagName = doNothing;
doNothing.getElementById = doNothing;
doNothing.remove = doNothing;
doNothing.click = doNothing;
global.document = doNothing;
global.yepnope = doNothing;
global.jQuery = doNothing;
global.jQuery.fn = doNothing;
global.jQuery.fn.extend = doNothing;
global.window = doNothing;
global.wb = doNothing;
global.$ = doNothing;
global.choiceLists = doNothing;
global.choiceLists.types = [];
global.choiceLists.rettypes = [];
global.Local = doNothing;
global.setDefaultScript = doNothing;

global.wb.menu = function(title, specs, show){
    var ok = true;
    specs.forEach(function(spec){
        if(spec.id){
            // can check to make sure it's a UUID
        }else{
            ok = false;
            console.log('\tMissing id in %s: %s', title, spec.labels);
        }
    });
    if (ok){
        console.log('\t%s is OK', title);
    }
};


function checkfile(filename){
    return function(err, data){
        try{
            console.log('checking %s', filename);
            eval(data);
        }catch(e){
            console.log('error in %s', filename);
            console.log(e);
        }
    }
}
