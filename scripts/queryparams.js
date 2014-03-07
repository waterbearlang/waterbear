// Sets up wb namespace (wb === waterbear). Global variable wb
// is initialized in the HTML before any javascript files are
// loaded (in template/template.html).
// Extracts parameters from URL, used to switch embed modes, load from gist, etc.
(function(global, window){
'use strict';
	// Source: http://stackoverflow.com/a/13984429
	function urlToQueryParams(url){
	    var qparams = {},
	        parts = (url||'').split('?'),
	        qparts, qpart,
	        i=0;

	    if(parts.length <= 1 ){
	        return qparams;
	    }else{
	        qparts = parts[1].split('&');
	        for(i in qparts){

	            qpart = qparts[i].split('=');
	            qparams[decodeURIComponent(qpart[0])] =
	                           decodeURIComponent(qpart[1] || '').split('#')[0];
	        }
	    }
	    return qparams;
	};

	function queryParamsToUrl(params){
		var base = location.href.split('?')[0];
		var keys = Object.keys(params);
		var parts = [];
		keys.forEach(function(key){
			if (Array.isArray(params[key])){
				params[key].forEach(function(value){
					parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
				});
			}else{
				parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
			}
		});
		if (!parts.length){
			return base;
		}
		return base + '?' + parts.join('&');
	}
	if(window.wb === undefined) window.wb = {}; 
	window.wb.urlToQueryParams = urlToQueryParams;
	window.wb.queryParamsToUrl = queryParamsToUrl;
	global.wb = window.wb;
})(this, window);
