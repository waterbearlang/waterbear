/*global yepnope, FB, menu */

yepnope({
  load: ['plugins/javascript.css'],
  complete: setup
});

function setup() {}

// initialize empty object for fb data
var fb = {}
fb.me = {};

// what user permissions should be requested
fb._permissions = 'user_about_me,user_photos,publish_stream';

var menus = {
  facebook: wb.menu('Facebook', [{
    blocktype: 'step',
    id: '4a2fd78c-4d0e-4c96-8ec3-52a96b2d6920',
    label: 'share [string]',
    script: 'FB.api("/me/feed/", "post", { message : {{1}} }, $.noop );'
  }, {
    blocktype: 'expression',
    id: '4f41013c-b053-439a-b284-769525f6df5d',
    label: 'all my friends',
    script: 'fb.friends.data',
    type: 'array'
  }, {
    blocktype: 'expression',
    id: '9f987bdb-87f4-4cf7-aea7-6d282bc0276e',
    label: 'me',
    script: 'fb.me',
    type: 'object'
  }, {
    blocktype: 'expression',
    id: 'c290da4a-c84d-46ac-a6c8-20b367283ea1',
    label: 'name of [any]',
    script: '{{1}}.name',
    type: 'string'
  }, {
    blocktype: 'expression',
    id: 'f0361c85-7ed9-4ecf-b5dc-c08da20034e1',
    label: 'image of [any]',
    script: '(function(){var img = new Image(); img.src="https://graph.facebook.com/" + {{1}}.id + "/picture"; return img;})',
    type: 'image'
  }, {
    blocktype: 'expression',
    id: '6a4bbc09-5782-43b9-968b-4610c7664d29',
    label: 'images url of [any]',
    type: 'string',
    script: '"https://graph.facebook.com/" + {{1}}.id + "/picture"'
  }, {
    blocktype: 'expression',
    id: 'ac41fb9e-c0c6-4e41-b190-87ba3fdb258d',
    label: 'friend with name like [string]',
    script: '(function(){var correct = {id: "", name: ""}; $.each( fb.friends.data , function(i, user) { if( user.name.indexOf( {{1}} ) != -1 ) correct = user; } ); return correct;})()',
    type: 'object'
  }, {
    blocktype: 'step',
    id: 'cc6fa7cf-fa7e-47fc-b97a-27f5c83d8d4b',
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
