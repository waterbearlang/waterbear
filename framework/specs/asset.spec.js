describe("Asset Test Suite", function(){
	it("Test preloadAssets", function(){

		result = window.preloadAssets(['http://waterbearlang.com/images/waterbear_steampunk.png', 'http://static.jsconf.us/promotejsh.gif', 'http://waterbearlang.com/images/tardigrade.jpg', 'http://static.sfdict.com/dictstatic/dictionary/audio/luna/T00/T0011900.mp3' ], function() {
			done();
		});

	});

	it("Test preloadImage", function(){
		window.preloadImage(0, "http://waterbearlang.com/images/waterbear_steampunk.png" );
	});
	it("Test preloadAudio", function(){
		window.preloadAudio(0, "http://static.sfdict.com/dictstatic/dictionary/audio/luna/T00/T0011900.mp3" );
	});

	//Video obj doesn't exist?
	/*it("Test preloadVideo", function(){
		window.preloadVideo(0, "https://ia600201.us.archive.org/14/items/ligouHDR-HC1_sample1/Sample.mpg" );
	}); */
});