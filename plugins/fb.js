/*global yepnope, FB, menu */

yepnope(
    {
        load: ['plugins/javascript.css'],
        complete: setup
    }
);

function setup() { console.log("FB setup"); }

// initialize empty object for fb data
var fb = {}
fb.me = {};

// what user permissions should be requrested
fb._permissions = 'user_about_me,user_photos,publish_stream';

var menus = {
    facebook : menu('Facebook', [
        {
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
            label: 'name of [object]',
            script: '{{1}}.name',
            type: 'string'
	      }, {
            label: 'image of [object]',
            script: '(function(){var img = new Image(); img.src="https://graph.facebook.com/" + {{1}}.id + "/picture"; return img;})',
            type: 'image'
	      }
    ])
};

fb._init = function() {
        FB.api("/me/friends", function (data) { fb.friends = data; });
        FB.api("/me", function (data) { fb.me = data; });
}


// LOAD FB API
$('body').append( $('<div>' , { id: 'fb-root' , style : 'display: none' } ) );

window.fbAsyncInit = function() {
  FB.init( {
    appId      : '466738416673020', // App ID
    // channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : false  // parse XFBML
  } );
  // load FB
  FB.login( fb._init , { scope : fb._permissions } );    
};

// Load the SDK Asynchronously
(function(d){
  var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = "//connect.facebook.net/en_US/all.js";
  ref.parentNode.insertBefore(js, ref);
}(document));

load_current_scripts();
$('.scripts_workspace').trigger('init');

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});
