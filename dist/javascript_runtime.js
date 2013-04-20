
/*begin javascript.js*/

/*end javascript.js*/

/*begin control.js*/

/*end control.js*/

/*begin sprite.js*/

/*end sprite.js*/

/*begin array.js*/

/*end array.js*/

/*begin boolean.js*/

/*end boolean.js*/

/*begin canvas.js*/

/*end canvas.js*/

/*begin color.js*/

/*end color.js*/

/*begin image.js*/

/*end image.js*/

/*begin math.js*/

/*end math.js*/

/*begin object.js*/

/*end object.js*/

/*begin string.js*/

/*end string.js*/

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

/*begin fb.js*/
(function(){
// initialize empty object for fb data
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

/*end fb.js*/

/*begin text.js*/

/*end text.js*/

/*begin matrix.js*/

/*end matrix.js*/
