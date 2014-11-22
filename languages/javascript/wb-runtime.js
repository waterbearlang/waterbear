
//Calculate sum of number array
function sum(arr){
    if(arr.length==0) {
        console.error("Array is empty!");
        return NaN;
    }
    var total= 0;
    for(var i = 0; i < arr.length; i++){
        if(typeof arr[i] != "number") {
            console.error("Non-numerical value in array!");
            return NaN;
        }
        total += arr[i];    
    }
    return total;
}

//Calculate mean of number array
function mean(arr){
    return sum(arr)/arr.length;
}

//Calculate mean of number array when error checks aren't needed
function fastMean(arr){
    var sum= 0;
    for(var i = 0; i < arr.length; i++){
        sum += arr[i];    
    }
    //console.log("Mean= %d", sum/arr.length);
    return sum/arr.length;    
}

//Calculate variance of number array
function variance(arr){
    var avg= mean(arr);
    //appending to "squares" array via grow-as-you-go method:
    //http://jsperf.com/array-pre-allocate-vs-array-push
    var squares= [];
    for(var i = 0; i < arr.length; i++){
        squares[i]= Math.pow((arr[i]-avg),2);    
    }
    //console.log("Stdev= %d", Math.sqrt(fastMean(squares)));
    return fastMean(squares);
}

//Calculate standard deviation of number array
function stdev(arr){
    return Math.sqrt(variance(arr));
}

//Normalize a number array (error checks done by "sum" function)
function normalize(arr){
    var total= sum(arr);
    for(var i = 0; i < arr.length; i++){
        arr[i] /= total;    
    }    
}

//ignores last entry b/c that's assumed to be the label
function dist(a,b){
    //appending to "diffs" array via grow-as-you-go method:
    //http://jsperf.com/array-pre-allocate-vs-array-push
    var diffs= [];
    for(var i = 0; i < a.length-1; i++){
        diffs[i]= Math.pow(a[i]-b[i],2);    
    }
    return Math.sqrt(sum(diffs));
}

//returns an array of the form:
//[[neighbor_1_label, similarity score], ... , [neighbor_k_label, similarity score]]
function getNearestNeighbors(k, trainSet, testPoint) {
    if(trainSet.length==0) {
        console.error("Training set is empty!");
        return NaN;
    }
    var kClosest= [];
    var distBound= Number.MIN_VALUE;
    var furthestIndex= 0
    for(var i=0; i<trainSet.length; i++) {
        label= trainSet[i][trainSet[i].length-1];
        d= dist(trainSet[i],testPoint);
        //if there aren't k neighbors yet, add one
        if(kClosest.length < k) {
            kClosest[kClosest.length]= [label,d];
            if(distBound < d) {
                distBound= d;
                furthestIndex= kClosest.length-1;
            }
        }
        //else only add if it is closer than the current furthest neighbor N,
        //and replace N with it
        else {
            if(d < distBound) {
                kClosest[furthestIndex]= [label,d];
                distBound= d;
                for(var j=0; j<kClosest.length; j++) {
                    if(kClosest[j][1] >= distBound) {
                        distBound= kClosest[j][1];
                        furthestIndex= j;
                    }
                }
            }
        }
    }
    return kClosest;
}

//no weighting, just majority vote
function kNN(k,trainSet,testPoint) {
    kClosest= getNearestNeighbors(k, trainSet, testPoint);
    //majority vote, can be made more efficient
    kClosest.sort();
    mode= kClosest[0][0]; //guaranteed to exist (so no array bounds issue)
    modeFreq= 0;
    currMode= kClosest[0][0];
    currModeFreq= 0;
    for(var n=0; n<kClosest.length; n++) {
        if(kClosest[n][0] == currMode) {
            currModeFreq++;
            if(currModeFreq > modeFreq) {
                modeFreq= currModeFreq;
                mode= currMode;
            }
        }
        else{
            currMode= kClosest[n][0];
            currModeFreq= 1;
        }
    }
    //alert("Your test point can be labeled as: " + mode);
    return mode;
}

//uses 1/similarity_score for weight, value of infinity if sim_score=0
function weightedKNN(k,trainSet,testPoint) {
    kClosest= getNearestNeighbors(k, trainSet, testPoint);
    //majority vote, can be made more efficient
    kClosest.sort();
    mode= kClosest[0][0]; //guaranteed to exist (so no array bounds issue)
    modeFreq= 0;
    currMode= kClosest[0][0];
    currModeFreq= 0;
    for(var n=0; n<kClosest.length; n++) {
        if(kClosest[n][0] == currMode) {
            //console.log(kClosest[n][1]);
            currModeFreq += 1/kClosest[n][1]; //when kClosest[n][1], currModeFreq= infinity
            if(currModeFreq > modeFreq) {
                modeFreq= currModeFreq;
                mode= currMode;
            }
        }
        else{
            currMode= kClosest[n][0];
            currModeFreq= kClosest[n][1];
        }
    }
    //alert("Your test point can be labeled as: " + mode);
    return mode;
}


//Possible issue: does this cover all possible control sequence issues?
//Do all browsers handle all control sequences the same way?
function stringEscape(s) {
    //not optimal design decision, but "escapse" contains length-3 arrays where:
    //1st entry is the escape character
    //2nd entry is the regex to be used in the replace function
    //3rd entry is the the replacement string
    escapes= [["\b", " b"], ["\t", " t"], ["\n", " n"],
              ["\v", " v"], ["\f", " f"], ["\r", " r"]];
    for (var i = 0; i < escapes.length; i++) {
        ind = s.indexOf(escapes[i][0]);
        while (ind != -1) {
            s = s.replace(escapes[i][0], escapes[i][1]);
            //console.log("Replacement process"+escapes[i][1]+": " + s);
            ind = s.substr(ind + 1).indexOf(escapes[i][0]);
        }
    }
    filepathParts= s.split(' ');
    filename= filepathParts[filepathParts.length-1]
    //the below replace is needed b/c "\" followed by something like "c" (i.e.
    //something that doesn't make an escape sequence) just gets reduced to "c"
    //(i.e. the "\" disappears), so the "fakepath" part of the filepath gets
    //prepended to the actual filename
    filename= filename.replace("fakepath","");
    return filename;
}

//Create number array from user-inputted CSV file
//potential issue: use of "Number()" to convert string to number may be too
//lenient, because Number() auto-converts variables of type "Date" to a number,
//and there may be similar auto-conversions too. TBD if this is desired behavior
function createArrayFromCSV(file) {
    file= stringEscape(file);//want to replace backslashes so that they arent seen as escapes
    if(localStorage.getItem('__' + file) === null) {
        console.error("File not entered");
        return;
    }
    if (file.indexOf('.csv', file.length - 4) === -1) {
        console.error("File is not a CSV file");
	return;
    }
    var arr= localStorage['__' + file];
    var parsed= CSV.parse(arr);
    if(parsed.length==1) {
        parsed= parsed[0];
    }
    return parsed;
}(function(window){
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
			console.error('No format recognized for %s type', url);
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

function makeObj() { this.notReal = true;};

if(!window.Global) { 
	console.log("If this was in a production environment something is wrong. window.Global is undefined");
	
	window.Global = new makeObj();
	window.Global.prototype = {};
	window.preloadAssets = preloadAssets;
	window.preloadImage = preloadImage;
	window.preloadAudio = preloadAudio;
	window.preloadVideo = preloadVideo;
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

})(window);(function(runtime){
    'use strict';
runtime.shape = {

    drawCircle: function(shape) {
        local.ctx.beginPath();
        local.ctx.arc(shape.x,shape.y,shape.r,0,Math.PI*2,true);
        local.ctx.closePath();
    },

    drawPolygon: function(shape) {
        local.ctx.beginPath();
        local.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (var i = 1; i < shape.points.length; i ++ )
            local.ctx.lineTo(shape.points[i].x, shape.points[i].y);
        local.ctx.closePath();
    },

    drawRect: function(shape) {
        local.ctx.beginPath();
        var w = Math.max(shape.r * 2, shape.w);
        var h = Math.max(shape.r * 2, shape.h);
        local.ctx.moveTo(shape.x + shape.r, shape.y);
        local.ctx.arcTo(shape.x + w, shape.y, shape.x + w, shape.y + h, shape.r);
        local.ctx.arcTo(shape.x + w, shape.y + h, shape.x, shape.y + h, shape.r);
        local.ctx.arcTo(shape.x, shape.y + h, shape.x, shape.y, shape.r);
        local.ctx.arcTo(shape.x, shape.y, shape.x + w, shape.y, shape.r);
        local.ctx.closePath();

    },

    fillShape: function(shape, color) {

        local.ctx.save();
        local.ctx.fillStyle = color;
        switch (shape.type) {
            case "circle":
                runtime.shape.drawCircle(shape);
                break;

            case "poly":
                runtime.shape.drawPolygon(shape);
                break;

            case "rect":
                runtime.shape.drawRect(shape);
                break;
        }
        local.ctx.fill();
        local.ctx.restore();
    },

    strokeShape: function(shape, color, width) {
        local.ctx.save();
        local.ctx.strokeStyle = color;
        local.ctx.lineWidth = width;

        switch (shape.type) {
            case "circle":
            runtime.shape.drawCircle(shape);
                break;

            case "poly":
                runtime.shape.drawPolygon(shape);
                break;

            case "rect":
                runtime.shape.drawRect(shape);
                break;
        }
        local.ctx.stroke();
        local.ctx.restore();
    },

    fillCircleAtPointWithRadiusAndColor: function(point, radius, color){
        local.ctx.save();
        local.ctx.beginPath();
        local.ctx.fillStyle = color;
        local.ctx.arc(point.x, point.y, radius, 0, Math.PI*2, true);
        local.ctx.closePath();
        local.ctx.fill();
        local.ctx.restore();
    }

};
})(runtime);
(function(runtime){
	'use strict';

	function greyValueAsHex(value){
		var level = runtime.math.limit(value, 0, 255);
		var hex = level.toString(16);
		if (hex.length == 1){
			hex = '0' + hex;
		}
		return '#' + hex + hex + hex;
	}

	runtime.color = {
		greyValueAsHex: greyValueAsHex
	};
})(runtime);    // Polyfill for built-in functionality, just to get rid of namespaces in older
    // browsers, or to emulate it for browsers that don't have requestAnimationFrame yet
    (function(window){
    	'use strict';
    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.mozRequestAnimationFrame || 
                                   window.msRequestAnimationFrame || 
                                   window.webkitRequestAnimationFrame || 
                                   function(fn){ setTimeout(fn, 20); };
})(window);/* DataBlock Plugin for WaterBear */

(function(window){
    'use strict';

    var  whitelist = [
        'www.google.com',
        'www.wikipedia.com'
    ];
    function DataBlock(url) {
        this.url = 'http://www.corsproxy.com/' + url;
        this.data = '';
    }

    DataBlock.prototype.getData = function() {
        if(this.url === null || this.url === undefined) {
            alert("Please give a url");
            return;
        } 
        // else if(whitelist.indexOf(this.url) < 0) {
        //     alert(this.url + " is not supported");
        //     return;
        // }
        console.log(JSON.stringify(this.url));
        this.data = ajax.gets(this.url); 
        console.log(JSON.stringify(this.data));
    };
    window.DataBlock = DataBlock;
})(window);
(function(d){
// initialize empty object for fb data
'use strict';
var fb = {}
fb.me = {};

// what user permissions should be requested
fb._permissions = 'user_about_me,user_photos,publish_stream';


fb._init = function() {
  FB.api("/me/friends", function(data) {
    fb.friends = data;
  });
  FB.api("/me", function(data) {
    fb.me = data;
  });
}

// TODO: FIXME: set up the correct application id
// to aquire it, check the Facebook developers site
fb._appId = '';

if(fb._appId == '') {
  window.alert('Set up the connection with Facebook by aquiring Facebook Application ID± and setting it up in plugins/fb.js');
}


// LOAD FB API
// FIXME: Move all runtime code to iframerunner project
$('body').append($('<div>', {
  id: 'fb-root',
  style: 'display: none'
}));

window.fbAsyncInit = function() {
  FB.init({
    appId: fb._appId, // App ID
    // channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
    status: true,
    cookie: true,
    xfbml: false
  });
  // load FB
  FB.login(fb._init, {
    scope: fb._permissions
  });
};

// Load the SDK Asynchronously
  var js, id = 'facebook-jssdk',
    ref = d.getElementsByTagName('script')[0];
  if(d.getElementById(id)) {
    return;
  }
  js = d.createElement('script');
  js.id = id;
  js.async = true;
  js.src = "//connect.facebook.net/en_US/all.js";
  ref.parentNode.insertBefore(js, ref);
}(document));
(function(runtime){
'use strict';
var location = {};

if (navigator.geolocation){
  location.watchPosition = function watchPosition(cb){
    navigator.geolocation.watchPosition(
      function(data) {
        location.currentLocation = data.coords; // sets latitude and longitude
        cb();
      }, 
      function(){
        console.warn('Sorry, no position available');
      }
    );
  };
}else{
  location.watchPosition = function watchPosition(cb){
    console.warn('Sorry, geolocation services not available');
  };
}

if (navigator.geolocation){
  location.whenWithinXOf = function whenWithinXOf(distance, loc, cb){
    navigator.geolocation.watchPosition(
      function(data) {
        location.currentLocation = data.coords; // sets latitude and longitude
        if (location.distance(loc, data.coords) < distance){
          cb();
        }
      }, 
      function(){
        console.warn('Sorry, no position available');
      }
    );
  };
}else{
  location.whenWithinXOf = function whenWithinXOf(distance, loc, cb){
    console.warn('Sorry, geolocation services not available');
  };
}


// taken from http://www.movable-type.co.uk/scripts/latlong.html
location.distance = function distance( coord1, coord2 ) {

    var lat1 = coord1.latitude;
    var lon1 = coord1.longitude;

    var lat2 = coord2.latitude;
    var lon2 = coord2.longitude;

    var R = 6371; // km
    return Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                  Math.cos(lat1)*Math.cos(lat2) *
                  Math.cos(lon2-lon1)) * R;
};

location.currentLocation = {
  latitude: 0,
  longitude: 0
};

runtime.location = location;

})(runtime);(function(runtime){
	'use strict';
function gcd(a,b) {
	var c;
	while(b > 0) {
		c = Math.abs(b);
		b = Math.abs(a) % c;
		a = c;
	}
	return a;
}

function lcm(a,b) {
	return (Math.abs(a)/gcd(a,b))*Math.abs(b);
}

// Adapted from an example found on Wikipedia:
// http://en.wikipedia.org/w/index.php?title=Lanczos_approximation&oldid=552993029#Simple_implementation

var g = 7;
var p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
     771.32342877765313, -176.61502916214059, 12.507343278686905,
     -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
 
function gamma(n) {
	// Reflection formula
	if(n < 0.5) {
		return Math.PI / (Math.sin(Math.PI*n) * gamma(1-n));
	} else {
		n -= 1;
		var x = p[0];
		for(var i = 1; i < g+2; i++) {
			x += p[i]/(n+i);
		}
		var t = n + g + 0.5;
		return Math.sqrt(2*Math.PI) * Math.pow(t,n+0.5) * Math.exp(-t) * x;
	}
}

function summation(n) {
	return (n*(n+1))/2;
}

function sumOfFirstNMultiples(mul, n) {
	return mul*summation(n);
}

function inclusiveSummation(from, to) {
	if(from >= to) return -1;
	var numOfInts = Math.abs(to - from)+1;
	var avg = (from + to)/2;
	return numOfInts*avg;
}

function limit(value, min, max){
	return Math.min(max, Math.max(min, value));
}

runtime.math = {
	limit: limit,
	gcd: gcd,
	lcm: lcm,
	gamma: gamma,
	summation: summation,
	sumOfFirstNMultiples: sumOfFirstNMultiples,
	inclusiveSummation: inclusiveSummation
};

})(runtime);(function(runtime){
'use strict';
var accelerometer = {
    direction: ""
};

var turnListeners = {};

if(window.DeviceOrientationEvent) {
    // always follow direction changes
    window.addEventListener('deviceorientation', processData);
} else {
    console.warn("Detection of acceleration is not supported");
}

accelerometer.whenTurned = function whenTurned(direction, cb){
    if (Array.isArray(turnListeners[direction])){
        turnListeners[direction].push(cb);
    }else{
        turnListeners[direction] = [cb];
    }
}

function processData(event) {
    var left_right = event.gamma;
    var front_back = event.beta;

    var limit = 10;
    accelerometer.direction = "";

    if(left_right > limit && front_back > limit) {
        accelerometer.direction = "upright";
    } else if(left_right > limit && front_back < -limit) {
        accelerometer.direction = "downright";
    } else if(left_right < -limit && front_back < -limit) {
        accelerometer.direction = "downleft";
    } else if(left_right < -limit && front_back > limit) {
        accelerometer.direction = "upleft";
    } else if(front_back > limit) {
        accelerometer.direction = "up";
    } else if(left_right > limit) {
        accelerometer.direction = "right";
    } else if(front_back < -limit) {
        accelerometer.direction = "down";
    } else if(left_right < -limit) {
        accelerometer.direction = "left";
    }

    // Call any callbacks set in whenTurned()
    if (turnListeners[accelerometer.direction]){
        turnListeners[accelerometer.direction].forEach(function(cb){
            cb();
        })
    }
};

if(runtime === undefined) {
    console.log("Runtime is undefined; If this was called in a production environment look in to this!");
    runtime = {};
}
runtime.accelerometer = accelerometer;

})(window.runtime);(function(window){
  'use strict';
function randint(start, stop){
    // return an integer between start and stop, inclusive
    if (stop === undefined){
        stop = start;
        start = 0;
    }
    var factor = stop - start + 1;
    return Math.floor(Math.random() * factor) + start;
}

// This is a port of Ken Perlin's Java code. The
// original Java code is at http://cs.nyu.edu/%7Eperlin/noise/.
// Note that in this version, a number from 0 to 1 is returned.
// Original JS port from http://asserttrue.blogspot.ca/2011/12/perlin-noise-in-javascript_31.html,
// but heavily modified by Dethe for 1 and 2 dimensional noise

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp( t, a, b) { return a + t * (b - a); }
function grad(hash, x, y, z) {
  var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
  var u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
         v = h<4 ? y : h==12||h==14 ? x : z;
  return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
} 
function scale(n) { return (1 + n)/2; }

// permutations
var p = [ 151,160,137,91,90,15,
   131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
   190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
   88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
   77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
   102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
   135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
   5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
   223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
   129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
   251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
   49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
   138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
   151,160,137,91,90,15,
   131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
   190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
   88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
   77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
   102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
   135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
   5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
   223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
   129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
   251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
   49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
   138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
];

function noise(x, y, z) {

      var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
          Y = Math.floor(y) & 255,                  // CONTAINS POINT.
          Z = Math.floor(z) & 255;
      x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
      y -= Math.floor(y);                                // OF POINT IN CUBE.
      z -= Math.floor(z);
      var    u = fade(x),                                // COMPUTE FADE CURVES
             v = fade(y),                                // FOR EACH OF X,Y,Z.
             w = fade(z);
      var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
          B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,

      return scale(lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                     grad(p[BA  ], x-1, y  , z   )), // BLENDED
                             lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                     grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                     lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                     grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                             lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                     grad(p[BB+1], x-1, y-1, z-1 )))));
}

function choice(list){
  return list[Math.floor(Math.random() * list.length)];
}

function removeChoice(list){
  return list.splice(Math.floor(Math.random() * list.length), 1);
}

window.randint = randint;
window.fade = fade;
window.lerp = lerp;
window.grad = grad;
window.scale = scale;
window.noise = noise;

})(window);
// Size Routines
(function(window){
'use strict';

/**
 * Convert size parameter to pixel value
 *
 * @param {?size=} size is the size parameter
 * @return {number} pixel value for size
 *
 */
function convert(size) {
  switch(size.unit) {
    case "px":
        return size.value;
    case "% width":
        return (runtime.stage_width * size.value)/100;
    case "% height":
        return (runtime.stage_height * size.value)/100;
    default: //need this b/c examples currently have size blocks w/o option list
      return size.value;
  }
}
window.convert = convert;
})(window);
(function(window){
'use strict';
    // FIXME: move ajax and other utils to runtime proper
    var ajax = {
        jsonp: function(url, data, success, error){
            var callbackname = '_callback' + Math.round(Math.random() * 10000);
            window[callbackname] = function(result){
                delete window[callbackname];
                success(result);
            };
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4){
                    if (xhr.status = 200){
                        // this is particularly unsafe code
                        eval(xhr.responseText); // this should call window[callbackname]
                    }else{
                        delete window[callbackname];
                        error(xhr);
                    }
                }
            };
            xhr.open('GET', url + '?' + data + '&callback=' + callbackname, true);
            xhr.send();
        }
    };

    if(!window.Local) {
        console.log("This should not be called in production. If this is called then window.Local is undefined.");
        window.Local = function() { return this};
    }
    Local.prototype.getTweet = function(name, callback){
        var jsonTwitterFeed = "https://twitter.com/statuses/user_timeline/" + name + ".json";
        var args = 'count=1';
        function success(list){
            list.forEach(function(tweet){
                callback(tweet.text);
            });
        };
        function error(xhr){
            callback(xhr.textStatus);
            console.error('getTweet error: %s: %o', xhr.textStatus, xhr);
        };
        ajax.jsonp( jsonTwitterFeed, args, success, error);
    };

})(window);
// Sprite Routines

// This uses and embeds code from https://github.com/jriecken/sat-js
(function(window){
    'use strict';

function Sprite(type, color){
    this.color = color;
    this.type = type;
    this.movementDirection = new SAT.Vector(0, 0);
    this.movementDegrees = 0;
    this.facingDirection = new SAT.Vector(0, 0);
    this.facingDegrees = 0;
    this.speed = 0;
    this.autosteer = false;
    this.circle = null;
    this.polygon = null;
    this.image = null;
    this.text = null;
};

function createImageSprite(size,pos,image){
    var img = createRectSprite(size,pos);
    img.size = size;
    img.image = image;
    return img;
};

function createTextSprite(size,pos,bColor,text,tColor){
    var txt = createRectSprite(size,pos,bColor);
    txt.size = size;
    txt.text = text;
    txt.tColor = tColor;
    return txt;
};

function createRectSprite(size,pos,color){
    var rect = new Sprite('polygon', color);
    rect.polygon = new SAT.Box(new SAT.Vector(pos.x,pos.y), size.w, size.h).toPolygon();
    rect.polygon.average = rect.polygon.calculateAverage();
    rect.calculateBoundingBox();
    return rect;
};

function createPolygonSprite(points,color){
    var poly = new Sprite('polygon', color);
    var vPoints = [];
    for (var i = 0; i < points.length; i++){
        vPoints.push(new SAT.Vector(points[i].x, points[i].y));
    }
    poly.polygon = new SAT.Polygon(new SAT.Vector(0, 0), vPoints);
    poly.polygon.average = poly.polygon.calculateAverage();
    poly.calculateBoundingBox();
    return poly;
};

function createCircleSprite(x, y, r, color){
    var cir = new Sprite('circle', color);
    cir.circle = new SAT.Circle(new SAT.Vector(x, y), r);
    cir.calculateBoundingBox();
    return cir;
};

function createSprite(shape, color){
    switch (shape.type){
        case 'rect':
            return createRectSprite({w: shape.w, h: shape}, {x: shape.x, y: shape.y}, color);

        case 'circle':
            return createCircleSprite(shape.x, shape.y, shape.r, color);

        case 'poly':
            return createPolygonSprite(shape.points, color);
    }
};

Sprite.prototype.isPolygon = function(){
    return this.type === 'polygon';
};

Sprite.prototype.getPos = function(){
    if(this.polygon != null){
        return this.polygon.pos;
    }else if(this.circle != null){
        return this.circle.pos;
    }
}

Sprite.prototype.setPos = function(x, y){
    if(this.polygon != null){
        this.polygon.pos.x = x != null ? x : this.polygon.pos.x;
        this.polygon.pos.y = y != null ? y : this.polygon.pos.y;
        this.polygon.average = this.polygon.calculateAverage();
    }else if(this.circle != null){
        this.circle.pos.x = x != null ? x : this.circle.pos.x;
        this.circle.pos.y = y != null ? y : this.circle.pos.y;
    }
    this.calculateBoundingBox();
}

Sprite.prototype.draw = function(ctx){
    //rotation
    if(this.image != null){
        ctx.save();
        ctx.translate(this.getPos().x,this.getPos().y);
        ctx.rotate( this.facingDegrees *Math.PI/180);
        ctx.drawImage(this.image, 0, 0,this.size.w,this.size.h);
        ctx.restore();
    }else{
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if(this.isPolygon()){
            ctx.moveTo(this.polygon.points[0].x + this.polygon.pos.x, this.polygon.points[0].y + this.polygon.pos.y);
            for (var i = this.polygon.points.length - 1; i >= 1; i--){
                ctx.lineTo(this.polygon.points[i].x + this.polygon.pos.x, this.polygon.points[i].y + this.polygon.pos.y);
            };
        }else{
            ctx.arc(this.circle.pos.x,this.circle.pos.y,this.circle.r,0,Math.PI*2,true);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    if(this.text != null){
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.textAlign="center";
        var height = this.size.h * 0.6;
        ctx.font = String(height) +"px Arial";
        ctx.fillStyle = this.tColor;
        ctx.save();
        ctx.translate(this.getPos().x ,this.getPos().y );
        ctx.rotate( this.facingDegrees *Math.PI/180);
        ctx.fillText(this.text,this.size.w *0.5,this.size.h *0.6, this.size.w *0.8);
        ctx.restore();
    }
};

function isSpriteClicked(sprite){
    if(runtime.mouse_down){
        var pos = {x: runtime.mouse_x, y: runtime.mouse_y};
        var color = null;
        var size = {w: 1, h: 1};
        var detRect = createRectSprite(size, pos, color);
        return detRect.collides(sprite);
    }
    return false;
};

Sprite.prototype.calculateBoundingBox = function(){
    if(this.isPolygon()){
        var minX, maxX, minY, maxY;
        var points = this.polygon.points;
        for(var i=0; i < points.length; i++){

            minX = (points[i].x < minX || minX == null) ? points[i].x : minX;
            maxX = (points[i].x > maxX || maxX == null) ? points[i].x : maxX;
            minY = (points[i].y < minY || minY == null) ? points[i].y : minY;
            maxY = (points[i].y > maxY || maxY == null) ? points[i].y : maxY;
        }
        this.x = minX + this.polygon.pos.x;
        this.y = minY + this.polygon.pos.y;
        this.w = maxX - minX;
        this.h = maxY - minY;
    }else{
        this.x = this.circle.pos.x - this.circle.r;
        this.y = this.circle.pos.y - this.circle.r;
        this.w = this.circle.r * 2;
        this.h = this.circle.r * 2;
    }
};

Sprite.prototype.collides = function(sprite, response){
    if(this.isPolygon() && sprite.isPolygon()){
        return SAT.testPolygonPolygon(this.polygon, sprite.polygon, response);
    }else if(this.isPolygon()){
        return SAT.testPolygonCircle(this.polygon, sprite.circle, response);
    }else if(sprite.isPolygon()){
        return SAT.testCirclePolygon(this.circle,sprite.polygon, response);
    }else{
        return SAT.testCircleCircle(this.circle, sprite.circle, response);
    }
};

Sprite.prototype.bounceOff = function(sprite){
    var response = new SAT.Response();
    if(this.collides(sprite, response)){
        this.movementDirection.reflectN(response.overlapN);
    }
};

Sprite.prototype.setSpeed = function(speed){
    this.speed = speed;
    this.calculateMovementVector();
};

Sprite.prototype.setFacingDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirectionBy(degrees, true);
    }
    this.facingDegrees += degrees;
    this.calculateFacingVector();
    if(this.isPolygon()){
        this.polygon.rotate(degrees);
        this.polygon.recalc();
    }
    this.calculateBoundingBox();
}
Sprite.prototype.setFacingDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setMovementDirection(degrees, true);
    }
    var lastDegrees = this.facingDegrees;
    this.facingDegrees = degrees;
    this.calculateFacingVector();
    if(this.isPolygon()){
        this.polygon.rotate(degrees - lastDegrees);
        this.polygon.recalc();
    }
    this.calculateBoundingBox()
};

Sprite.prototype.setMovementDirectionBy = function(degrees,internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirectionBy(degrees, true);
    }
    this.movementDegrees += degrees;
    this.calculateMovementVector();
};

Sprite.prototype.setMovementDirection = function(degrees, internalCall){
    if(this.autosteer && !internalCall){
        this.setFacingDirection(degrees, true);
    }
    this.movementDegrees = degrees;
    this.calculateMovementVector();
};

Sprite.prototype.calculateMovementVector = function(){
    this.movementDirection.x = Math.cos(this.movementDegrees*Math.PI/180)*this.speed;
    this.movementDirection.y = Math.sin(this.movementDegrees*Math.PI/180)*this.speed;
};

Sprite.prototype.calculateFacingVector = function(){
    this.facingDirection.x = Math.cos(this.facingDegrees*Math.PI/180);
    this.facingDirection.y = Math.sin(this.facingDegrees*Math.PI/180);
};

Sprite.prototype.calculateMovementDegrees = function(){
    this.movementDegrees = Math.Atan2(this.movementDirection.x,this.movementDirection.y) * (Math.PI / 180);
};

//move a sprite by its own speed and direction
Sprite.prototype.move = function(){
    var x = this.getPos().x + this.movementDirection.x;
    var y = this.getPos().y + this.movementDirection.y;
    this.setPos(x, y);
};

Sprite.prototype.moveRelative = function(x,y){
    this.setPos(this.getPos().x + x, this.getPos().y + y);
};

Sprite.prototype.moveAbsolute = function(x,y){
    this.setPos(x, y);
};

// Bounce the sprite off the edge of the stage
Sprite.prototype.stageBounce = function(stage_width, stage_height){
    if(this.x<0){
        this.movementDirection.reflectN(new SAT.Vector(1,0));
    }else if((this.x+this.w) > stage_width){
        this.movementDirection.reflectN(new SAT.Vector(-1,0));
    }
    if(this.y<0){
        this.movementDirection.reflectN(new SAT.Vector(0,1));
    }else if((this.y+this.h) > stage_height){
        this.movementDirection.reflectN(new SAT.Vector(0,-1));
    }
};

Sprite.prototype.getBounds = function(stage_width, stage_height){
    var baseX = this.getPos().x - this.x, baseY = this.getPos().y - this.y;
    return {
        'up'    : baseY,
        'down'  : stage_height - this.h + baseY,
        'left'  : baseX,
        'right' : stage_width - this.w + baseX
    };
}

// Stop the sprite if it hits the edge of the stage
Sprite.prototype.edgeStop = function(stage_width, stage_height){
    var bounds = this.getBounds(stage_width, stage_height);
    if(this.x < 0){
        this.setPos(bounds.left, null);
        this.setSpeed(0);
    }else if((this.x + this.w) > stage_width){
        this.setPos(bounds.right, null);
        this.setSpeed(0);
    }
    if(this.y < 0){
        this.setPos(null, bounds.up);
        this.setSpeed(0);
    }else if((this.y + this.h) > stage_height){
        this.setPos(null, bounds.down);
        this.setSpeed(0);
    }
}

// If the sprite moves to the edge of the screen, slide it along that edge
Sprite.prototype.edgeSlide = function(stage_width, stage_height){
    var bounds = this.getBounds(stage_width, stage_height);
    if(this.x < 0){
        this.setPos(bounds.left, null);
        this.movementDirection.x = 0;
        this.calculateMovementDegrees;
    }else if((this.x + this.w) > stage_width){
        this.setPos(bounds.right, null);
        this.movementDirection.x = 0;
        this.calculateMovementDegrees;
    }
    if(this.y < 0){
        this.setPos(null, bounds.up);
        this.movementDirection.y = 0;
        this.calculateMovementDegrees;
    }else if((this.y + this.h) > stage_height){
        this.setPos(null, bounds.down);
        this.movementDirection.y = 0;
        this.calculateMovementDegrees;
    }
}

// Wrap around the edge of the stage
Sprite.prototype.edgeWrap = function(stage_width, stage_height){
    var bounds = this.getBounds(stage_width, stage_height);
    if(this.x < 0){
        this.setPos(bounds.right, null);
    }else if((this.x + this.w) > stage_width){
        this.setPos(bounds.left, null);
    }
    if(this.y < 0){
        this.setPos(null, bounds.down);
    }else if((this.y + this.h) > stage_height){
        this.setPos(null, bounds.up);
    }
}

window.createRectSprite = createRectSprite; // deprecated
window.createTextSprite = createTextSprite;
window.createImageSprite = createImageSprite;
window.createPolygonSprite = createPolygonSprite;
window.createCircleSprite = createCircleSprite;
window.createSprite = createSprite;
window.isSpriteClicked = isSpriteClicked;
window.Sprite = Sprite;

})(window);

// This was built directly from the formal definition of Levenshtein distance found on Wikipedia
// It's possible there's a more efficient way of doing it?
(function(window){
	'use strict';
function levenshtein(a,b) {
	function indicator(i,j) {
		if(a[i-1] == b[j-1])
			return 0;
		return 1;
	}
	function helper(i,j) {
		if(Math.min(i,j) == 0)
			return Math.max(i,j);
		return Math.min(
			helper(i-1,j) + 1,
			helper(i,j-1) + 1,
			helper(i-1,j-1) + indicator(i,j)
		);
	}
	return helper(a.length,b.length);
}
window.levenshtein = levenshtein;
})(window);(function(window) {
'use strict';
function Vector(x,y) {
    this.x = x;
    this.y = y;
};

window.Vector = Vector;
})(window);// Music Routines
(function(window){
	'use strict';
function Voice(){
    this.on = false;
    this.osc;       // The oscillator which will generate tones
    this.gain;      // The gain node for controlling volume
    var context = window.AudioContext || window.webkitAudioContext;
    this.context = new context();
    this.tempo = 100;
    this.frequency = 400;   // Frequency to be used by oscillator
    this.volume = 0.3;      // Volume to be used by the gain node
    this.playlist = [];
};

// Turn on the oscillator, routed through a gain node for volume
Voice.prototype.startOsc = function() {
    if (this.on) 
        this.stopOsc();
    this.osc = this.context.createOscillator();
    this.osc.type = 0; // Sine wave
    this.osc.frequency.value = this.frequency;
    // console.log('oscillator: %o', this.osc);
    this.osc.start(0);
    
    this.gain = this.context.createGain();
    this.gain.gain.value = this.volume;
    
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
    
    this.on = true;
};

// Turn off the oscillator
Voice.prototype.stopOsc = function() {
	//during use strict you can't call stop more than once
	// Failed to execute 'stop' on 'OscillatorNode': cannot call stop more than once. 
	// so add conditional
	if(this.on)
    this.osc.stop(0);
    this.osc.disconnect();
    this.on = false;
}

// Ensure a playing tone is updated when values change
Voice.prototype.updateTone = function() {
    if (this.on) {
        this.stopOsc();
        this.startOsc();
    }
};

// Calculate the frequency from a note name
Voice.prototype.setNote = function(note) {
	var noteIndex = Voice.notes.indexOf(note);
	this.frequency = 440 * Math.pow(2, (noteIndex - Voice.refNote) / 12);
}

Voice.prototype.push = function(note, len, dots) {
	this.playlist.push({pitch: note, duration: len, dotted: dots});
}

Voice.prototype.pushRest = function(len, dots) {
	this.playlist.push({pitch: "none", duration: len, dotted: dots});
}

Voice.prototype.play = function() {
	var note = this.playlist.shift();
	if(note.pitch == "none") {
		if(this.on) this.stopOsc();
	} else {
		this.setNote(note.pitch);
		if(this.on) this.updateTone();
		else this.startOsc();
	}
	var timeout = this.durationOf(note.duration, note.dotted);
	if(this.playlist.length > 0) {
		var me = this;
		setTimeout(function() {me.play();}, timeout);
	} else {
		var me = this;
		setTimeout(function() {me.stopOsc();}, timeout);
	}
}

// Calculate the duration from the tempo, and a note type, and a number of dots
Voice.prototype.durationOf = function(note, dots) {
	var qn_len = 60 / this.tempo;
	var base_len;
	if(note == 'double whole note') base_len = qn_len * 8;
	else if(note == 'whole note') base_len = qn_len * 4;
	else if(note == 'half note') base_len = qn_len * 2;
	else if(note == 'quarter note') base_len = qn_len;
	else if(note == 'eighth note') base_len = qn_len / 2;
	else if(note == 'sixteenth note') base_len = qn_len / 4;
	else if(note == 'thirty-second note') base_len = qn_len / 8;
	else if(note == 'sixty-fourth note') base_len = qn_len / 16;
	var len = base_len;
	while(dots > 0) {
		len += base_len / Math.pow(2,dots);
		dots--;
	}
	len *= 1000; // Convert from seconds to ms
	// console.log("Calculated voice duration:",note,dots,this.tempo,len);
	return len;
}

// Must be identical to the list in voice.js
Voice.notes = [
	// Octave 0
	'A0','A♯0/B♭0','B0',
	// Octave 1
	'C1','C♯1/D♭1','D1','D♯1/E♭1','E1',
	'F1','F♯1/G♭1','G1','G♯1/A♭1','A1','A♯1/B♭1','B1',
	// Octave 2
	'C2','C♯2/D♭2','D2','D♯2/E♭2','E2',
	'F2','F♯2/G♭2','G2','G♯2/A♭2','A2','A♯2/B♭2','B2',
	// Octave 3
	'C3','C♯3/D♭3','D3','D♯3/E♭3','E3',
	'F3','F♯3/G♭3','G3','G♯3/A♭3','A3','A♯3/B♭3','B3',
	// Octave 4
	'C4 (Middle C)','C♯4/D♭4','D4','D♯4/E♭4','E4',
	'F4','F♯4/G♭4','G4','G♯4/A♭4','A4','A♯4/B♭4','B4',
	// Octave 5
	'C5','C♯5/D♭5','D5','D♯5/E♭5','E5',
	'F5','F♯5/G♭5','G5','G♯5/A♭5','A5','A♯5/B♭5','B5',
	// Octave 6
	'C6','C♯6/D♭6','D6','D♯6/E♭6','E6',
	'F6','F♯6/G♭6','G6','G♯6/A♭6','A6','A♯6/B♭6','B6',
	// Octave 7
	'C7','C♯7/D♭7','D7','D♯7/E♭7','E7',
	'F7','F♯7/G♭7','G7','G♯7/A♭7','A7','A♯7/B♭7','B7',
	// Octave 8
	'C8'
];
Voice.refNote = Voice.notes.indexOf('A4');
window.Voice = Voice;
})(window);
