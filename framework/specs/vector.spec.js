describe("Vector Test Suite", function(){
	it("Test vectors", function(){

		var vector = new Vector(1,2);
		assert.strictEqual(vector.x, 1, 'Expected vector.x to be 1');
		assert.strictEqual(vector.y, 2, 'Expected vector.y to be 2');
		
	});
});