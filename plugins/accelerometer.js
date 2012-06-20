/*global yepnope, FB */
yepnope(
    {
        load: ['plugins/javascript.css'],
        complete: setup
    }
);

function setup() {

    var menus = {
      accelerometer : menu('Accelerometer', [
      {
      label: 'tilt direction',
      script: 'getTilt();',
      type: 'string'
    } /*, {
      label: 'my friends',  
      script: 'fb.friends.data',
      type: 'array'
    } , {
	    label: 'me',
      script: 'fb.me',
      type: 'object'
	  } , {
      label: 'name of [object]',
      script: '{{1}}.name',
      type: 'string'
	   } , {
      label: 'image of [object]',
      script: '"https://graph.facebook.com/" + {{1}}.id + "/picture"',
      type: 'string'
	   }*/
    ] )
    } 
    console.log("menu tuli");
};

function getTilt(){

    console.log("getTilt");

	if(window.DeviceOrientationEvent){

	window.addEventListener('deviceOrientation', function(eventData){
	
	//Otetaan kallistuskulmat talteen
		var LF = event.gamma;
		var FB = event.beta;
		var DIR = event.alpha;
		}, false);
		
		//Raja, jossa kallistus kulma menee.
		var limit = 10;
		
		//Väli-ilmansuunnat
		if(FB > limit && LF > limit){
			return "northeast";
		}else if(LF > limit && FB < -limit){
			return "southeast";
		}else if(LF < -limit && FB < -limit){
			return "southwest";
		}else if(LF < -limit && FB > limit){
			return "northwest";
		}
		
		//Pääilmansuunnat
		if(FB > limit){
			return "north";
		}else if(LF > limit){
			return "east";
		}else if(FB < -limit){
			return "south";
		}else if(LF < -limit){
			return "west";
		}
	}else{
		console.log("Ei toomi tässä :/");
	}
	
	//Laitetta ei kallistettu tai kallistelu ei toiminut
	return "null";
};

load_current_scripts();
$('.scripts_workspace').trigger('init');

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});


