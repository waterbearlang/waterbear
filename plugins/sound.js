/*global browser, yepnope */
yepnope(
    {
        load: ['plugins/javascript.css'],
        complete: setup
    }
);

function setup() {};

var menus = {
    Sound : menu('Sound', [
    {
    label: 'play sound [string:src]',
    script: 'playSound({{1}});'
    } , {
        label: 'stop audio',
        script: 'document.getElementById("playaudio").pause()'
    } 
    ] )
}; 

$('body').append( $('<audio>' , { id: "playaudio", preload:"auto" } ) );

function checkBrowser(src){

	var a = document.getElementById("playaudio");

    // checks does the browser support <audio>	
	if( ! $.isFunction( a.canPlayType ) ){
		return false;
	}

    // detect type of sound file
    var type = src.substr( -3 );
    type.toLowerCase();
	
    // based on
    var types = {
        'mp3' : 'audio/mpeg;',
        'ogg' : 'audio/ogg; codecs="vorbis"',
        'wav' : 'audio/wav; codecs="1"'
    };


    if( !( type in types ) ) {
        return false;
    }

    var codec = types[type];

    if( a.canPlayType(codec) == 'no') {
        return false;
    }

    return codec;
}

function playSound(src) {

    var playType = checkBrowser(src);

	if( playType != false ){
        var audioPlayer = document.getElementById("playaudio");

        audioPlayer.src = src;
        audioPlayer.type = playType;
        audioPlayer.load();
        audioPlayer.play();

    } else {
        alert('Can not play media');
    }
}

