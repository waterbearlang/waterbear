/*global yepnope, FB, menu */

yepnope({
  load: ['plugins/javascript.css'],
  complete: setup
});

function setup() {}

// initialize empty object for fb data
var fb = {}
fb.me = {};

// what user permissions should be requrested
fb._permissions = 'user_about_me,user_photos,publish_stream';

var menus = {
  facebook: wb.menu('Facebook', [{
    label: 'share [string]',
    script: 'FB.api("/me/feed/", "post", { message : {{1}} }, $.noop );'
  }, {
    label: 'all my friends',
    script: 'fb.friends.data',
    type: 'array'
  }, {
    label: 'me',
    script: 'fb.me',
    type: 'object'
  }, {
    label: 'name of [any]',
    script: '{{1}}.name',
    type: 'string'
  }, {
    label: 'image of [any]',
    script: '(function(){var img = new Image(); img.src="https://graph.facebook.com/" + {{1}}.id + "/picture"; return img;})',
    type: 'image'
  }, {
    label: 'images url of [any]',
    type: 'string',
    script: '"https://graph.facebook.com/" + {{1}}.id + "/picture"'
  }, {
    label: 'friend with name like [string]',
    script: '(function(){var correct = {id: "", name: ""}; $.each( fb.friends.data , function(i, user) { if( user.name.indexOf( {{1}} ) != -1 ) correct = user; } ); return correct;})()',
    type: 'object'
  }, {
    label: 'checkin at [location]',
    script: 'FB.api( "/search", { "type" : "place", "center" : "{{1}}.latitude,{{1}}.longitude", "distance": "1000" }, function(r){ FB.api("/me/feed/", "post", { place : r.data[0].id }, $.noop ); } );'
  }])
};

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
(function(d) {
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