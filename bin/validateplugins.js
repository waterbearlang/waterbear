#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var blockdefs = getPlugins('languages', '.json');
var blocks = {};

function getPlugins(pathname, ext){
    var p = [];
    var filenames = fs.readdirSync(pathname);
    filenames.forEach(function(filepath){
        var fp = path.join(pathname, filepath);
        var stat = fs.statSync(fp);
        if (stat.isDirectory()){
            p = p.concat(getPlugins(fp, ext));
        }else if (stat.isFile()){
            if (path.extname(fp) === ext){
                p.push(fp);
            }
        }else{
            console.log('path not recognized: %s (%j)', fp, stat);
        }
    });
    return p;
}

blockdefs.forEach(function(p){
    try{
       var blocklist = JSON.parse(fs.readFileSync(p, 'utf8'));
       try{
          checkDefs(blocklist, p);
       }catch(e){
          console.log('Error checking defs in %s (%s)', p, e.message);
       }
    }catch(e){
        console.log('Invalid JSON in %s (%s)', p, e.message);
    }
});


function checkDefs(blocklist, filepath){
    var valid = true;
    blocklist.forEach(function(block, idx){
        if (!block.id){
            console.log('%s block %s: %s has no id', filepath, idx, block.label);
            valid = false;
        }else if(blocks[block.id]){
            console.log('%s block %s: %s has duplicate id', filepath, idx, block.label);
            valid = false;
        }else{
            blocks[block.id] = block;
        }
    });
    if (valid){
        console.log('%s OK with %s blocks', filepath, blocklist.length);
    }
}

