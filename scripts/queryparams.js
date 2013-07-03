// Sets up wb namespace (wb === waterbear)
// Extracts parameters from URL, used to switch embed modes, load from gist, etc.

    	var wb = {};

		// Source: http://stackoverflow.com/a/13984429
		wb.urlToQueryParams = function(url){
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
		                           decodeURIComponent(qpart[1] || '');
		        }
		    }

		    return qparams;
		};

		wb.queryParamsToUrl = function(params){
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
			return base + '?' + parts.join('&');
		}

	    var q = wb.urlToQueryParams(location.href);
		wb.queryParams = q;
		wb.view = wb.queryParams.view || 'editor';
	    // if they don't have the plugin part of the query string lets send them back home.
