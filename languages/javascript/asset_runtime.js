(function(window){
'use strict';
var assets = {};

function getAssetType(url){
	var extension = url.split('.').slice(-1)[0].toLowerCase();
	switch(extension){
		case 'gif':
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'bmp':
			return new Image();
		case 'mov':
		case 'mpeg':
		case 'mpg':
			return new Video();
		case 'wav':
		case 'mp3':
			return new Audio();
		default:
			console.error('No format recognized for %s type', ext);
			return null;
	}
}
var loaded = 0;
var toload = 0;

function preloadAssets(assetUrls, callback){
	// console.log('preloading %o', assetUrls);
	if (!assetUrls.length){
		return callback();
	}
	var load = function() {
		// console.log('loaded');
		loaded++;
	    if (loaded >= toload){
	    	callback();
	    }
	}
    assetUrls.forEach(function(url, idx){
    	toload++;
    	assets[url] = getAssetType(url);
	    assets[url].addEventListener('load', load,false);
	    assets[url].addEventListener('canplay', load, false);
	    assets[url].addEventListener('error', load, false);
	    assets[url].addEventListener('abort', load, false);
    	assets[url].src = url;
 	});
}


var images = Global.prototype.images = {};
var audio = Global.prototype.audio = {};
var video = Global.prototype.video = {};

function preloadImage(seqNum, url){
	images[seqNum] = assets[url];
}

function preloadAudio(seqNum, url){
	audio[seqNum] = assets[url];
}

function preloadVideo(seqNum, url){
	video[seqNum] = assets[url];
}

Global.prototype.preloadAssets = preloadAssets; // called by runtime automatically
Global.prototype.preloadImage = preloadImage; // called by script block to set up convenient name
Global.prototype.preloadAudio = preloadAudio;
Global.prototype.preloadVideo = preloadVideo;

})(window);