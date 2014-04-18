// Migrate a language from 0.8 to 0.9 format

var fs = require('fs');
var cp = require('child_process');
var path = require('path');


// Each command
var commands = [];

function next(err, stdout, stderr){
	if (err){
		console.log(stderr);
	}
	if (commands.length){
		var command = commands.shift();
		if (typeof command === 'string'){
			cp.exec(command, next);
		}else if (typeof command === 'function'){
			command(err, stdout, stderr);
		}else if (Array.isArray(command)){
			cp.exec(command[0], command[1]);
		}
	}
}

function rename(oldpath, newpath){
	commands.push('git mv ' + oldpath + ' ' + newpath);
}

function isCSS(filename){
	return !! filename.match(/\.css$/);
}

function isJson(filename){
	return !! filename.match(/\.json$/);
}

function isRuntime(filename){
	return !! filename.match(/_runtime\.js$/);
}

function isJavascript(filename){
	return !! filename.match(/\.js$/);
}

function isIde(filename){
	return isJavascript(filename) && !isRuntime(filename) && !isBlockmenu(filename);
}

function isBlockmenu(filename){
	return !! filename.match(/_blockmenu\.js/);
}

function migration_moveJsToIdeJs(){
	var blockdir = 'languages/' + language + '/blocks';
	var blockFiles = fs.readdirSync(blockdir);
	// console.log(blockFiles.filter(isIde).join(', '));
	blockFiles.filter(isIde).forEach(function(filename){
		var basename = path.basename(filename, '.js');
		// console.log('rename(%s %s)', path.join(blockdir, filename), path.join(blockdir, basename + 'ide.js'));
		rename(path.join(blockdir, filename), path.join(blockdir, basename + '_ide.js'));
	});
	next();
}

function migration_moveJsonMenuFilesToJs(language){
	var blockdir = 'languages/' + language + '/blocks';
	var blockFiles = fs.readdirSync(blockdir);
	// console.log(blockFiles.filter(isIde).join(', '));
	blockFiles.filter(isJson).forEach(function(filename){
		var basename = path.basename(filename, '.json');
		// console.log('rename(%s %s)', path.join(blockdir, filename), path.join(blockdir, basename + 'ide.js'));
		rename(path.join(blockdir, filename), path.join(blockdir, basename + '_blockmenu.js'));
	});
}

function migration_wrapJsMenuFiles(language){
	var blockdir = 'languages/' + language + '/blocks';
	var blockFiles = fs.readdirSync(blockdir);
	blockFiles.filter(isBlockmenu).forEach(function(filename){
		var filepath = path.join(blockdir, filename);
		var contents = fs.readFileSync(filepath, 'utf-8').split('\n');
		for (var i = 0; i < contents.length; i++){
			contents[i] = '        ' + contents[i].replace(/\t/, '    ');
		}
		contents.unshift('    wb.menu(');
		contents.unshift("'use strict';");
		contents.unshift('(function(wb){');
		contents.push('    );');
		contents.push('})(wb);');
		fs.writeFileSync(filepath, contents.join('\n'), 'utf-8');
	});
}

// migration_moveJsToIdeJs();
['arduino','javascript','node','processingjs'].forEach(migration_moveJsonMenuFilesToJs);
commands.push(function(){
	['arduino','javascript','node','processingjs'].forEach(migration_wrapJsMenuFiles);
});
next();