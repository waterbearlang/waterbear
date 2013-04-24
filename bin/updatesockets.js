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

function updateBlocks(){
    var blockdefs = getPlugins('languages', '.json');
    var blocks = {};
    var plugindef;
    blockdefs.forEach(function(pluginpath){
        if (/.*_socket.*/.test(pluginpath)) return;
        try{
            plugindef = JSON.parse(fs.readFileSync(pluginpath, 'utf8'));
            var blocklist = plugindef.blocks;
            try{
                // update list in place
                blocklist.forEach(upgradeLabelToSocketSpec);
            }catch(e){
                console.log('Error updating labels to sockets in %s (%s)', pluginpath, e.message);
            }
        }catch(e){
            console.log('Invalid JSON in %s (%s)', pluginpath, e.message);
        }
        var updatedpath = pluginpath.slice(0,-5) + '_socket.json';
        fs.writeFileSync(updatedpath, JSON.stringify(plugindef, null, 4));
    });
    return blocks;
}

function upgradeLabelToSocketSpec(block){
    block.sockets = parseLabel(block.label);
    delete block.label;
}

function parseLabel(textLabel){
    // Recognize special values in the label string and replace them with
    // appropriate markup. Some values are dynamic and based on the objects currently
    // in the environment
    //
    // values include:
    //
    // [number] => an empty number socket
    // [number:default] => a number socket with a default value
    // [boolean] => an empty boolean socket
    // [boolean:default] => a boolean with a default value
    // [string] => an empty string socket
    // [string:default] => a string socket with a default value
    // [choice:options] => a fixed set of options, listed in options parameter function
    // [choice:options:default] => choice list with a default besides the first item
    // etc…

    // strategy:
    //
    // 1. Split on white space
    // 2. For each item that starts with [ and ends with ], convert to socket object
    // 3. For remaining strings, join adjacent with space

    var parts = textLabel.split(/\s/);
    var sockets = [];
    var currentString = '';
    parts.forEach(function(str){
        if (/^\[.+\]$/.test(str)){
            sockets.push(Socket(currentString, str));
            currentString = '';
        }else{
            if (currentString.length){
                currentString = currentString + ' ' + str;
            }else{
                currentString = str;
            }
        }
    });
    if (currentString.length){
        sockets.push(Socket(currentString));
    }
    return sockets;
};

function Socket(name, spec){
    // remove brackets
    if (!spec){
        return {name: name};
    }
    spec = spec.slice(1,-1);
    var parts = spec.split(':');
    var socket = {
        name: name,
        type: parts[0]
    }
    if (parts[0] === 'choice'){
        socket.options = parts[1];
        socket.value = parts[0] || null;
    }else{
        socket.value = parts[1] || null;
    }
    return socket;
}

updateBlocks();
