#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var findOldPlugins = require('./checkplugin').findBlocks;

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

function getOldBlocks(){
    var oldplugins = {};
    var oldpluginfilenames = getPlugins('plugins', '.js');
    oldpluginfilenames.forEach(function(filename){
        findOldPlugins(filename, oldplugins);
    });
    return oldplugins;
}

function getNewBlocks(){
    var blockdefs = getPlugins('languages', '.json');
    var blocks = {};
    blockdefs.forEach(function(p){
        try{
           var blocklist = JSON.parse(fs.readFileSync(p, 'utf8'));
           try{
              checkDefs(blocklist, p, blocks);
           }catch(e){
              console.log('Error checking defs in %s (%s)', p, e.message);
           }
        }catch(e){
            console.log('Invalid JSON in %s (%s)', p, e.message);
        }
    });
    return blocks;
}

function checkDefs(blocklist, filepath, blocks){
    blocklist.forEach(function(block, idx){
        if (!block.id){
            console.log('%s block %s: %s has no id', filepath, idx, block.label);
        }else if(blocks[block.id]){
            blocks[block.id].push({path: path.basename(filepath), label: block.label});
        }else{
            blocks[block.id] = [{path: path.basename(filepath), label: block.label}];
        }
    });
 }

function checkForDuplicateBlocks(blocks){
    Object.keys(blocks).forEach(function(key){
        var where = blocks[key];
        if (where.length < 1){
            console.log('ERROR: You should never have an empty list here');
        }else if(where.length > 1){
            console.log('Block [%s] found in %s', where[0].label, where.map(function(item){return item.path;}).join(','));
        }
    });
}

function checkForMissingBlocks(oldblocks, newblocks){
    Object.keys(oldblocks).forEach(function(key){
        var oldblock = oldblocks[key];
        var newblock = newblocks[key];
        if (!newblock){
            console.log('Block [%s] not found in any file', oldblock.label || oldblock.id);
        }
    });
}

function main(){
    var oldblocks = getOldBlocks();
    var newblocks = getNewBlocks();
    checkForDuplicateBlocks(newblocks);
    checkForMissingBlocks(oldblocks, newblocks);
}

main();

