(function(global){
	
	Event.on('.loginGitHub', 'click', null, wb.clearScripts);
	wb.authGitHub = function(){
		var popup = open('https://github.com/login/oauth/authorize?client_id='
			+ 001ab661dc3e20b3abd9 + '&scope=gist,user', 'popup', 'width=1015,height=500');
	};

})(this);