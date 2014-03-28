describe("Asset Test Suite", function(){
	it("Test getAssetType", function(){

		result = window.preloadAssets(['clyde.jpg'], function() {
			done();
		});

	});
});