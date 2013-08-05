(function(){

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
	if (!assetUrls.length){
		return callback();
	}
	load = function() {
		loaded++;
	    if (loaded >= toload){
	    	callback();
	    }
	}
    assetUrls.forEach(function(url, idx){
    	toload++;
    	assets[url] = getAssetType(url);
	    assets[url].onload = load;
	    assets[url].onerror = load;
	    assets[url].onabort = load;
    	assets[url].src = url;
 	});
}


var images = Global.prototype.images = {};

function preloadImage(seqNum, url){
	images[seqNum] = assets[url];
}

Global.prototype.preloadAssets = preloadAssets; // called by runtime automatically
Global.prototype.preloadImage = preloadImage; // called by script block to set up convenient name

})();