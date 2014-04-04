describe("String Test Suite", function(){
	it("Test Levenstein Distance", function(){
		var distance = levenshtein('kitten', 'sitting');
		assert.strictEqual(distance, 3, 'Expected distance to be 3');
	});
});