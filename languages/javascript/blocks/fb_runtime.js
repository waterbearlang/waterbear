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
