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
