
/*begin javascript.js*/

/*end javascript.js*/

/*begin array.js*/

/*end array.js*/

/*begin boolean.js*/

/*end boolean.js*/

/*begin canvas.js*/

/*end canvas.js*/

/*begin color.js*/

/*end color.js*/

/*begin control.js*/

/*end control.js*/

/*begin image.js*/

/*end image.js*/

/*begin math.js*/

/*end math.js*/

/*begin matrix.js*/

/*end matrix.js*/

/*begin object.js*/

/*end object.js*/

/*begin path.js*/

/*end path.js*/

/*begin point.js*/

/*end point.js*/

/*begin rect.js*/

/*end rect.js*/

/*begin sensing.js*/

/*end sensing.js*/

/*begin shape.js*/

/*end shape.js*/

/*begin size.js*/

/*end size.js*/

/*begin social.js*/
(function(){

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

})();

/*end social.js*/

/*begin sprite.js*/

/*end sprite.js*/

/*begin string.js*/

/*end string.js*/

/*begin text.js*/

/*end text.js*/
