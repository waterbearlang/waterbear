describe("Math Test Suite", function(){
	it("Test GCD", function(){
		var greatest = gcd(1, 5);
		assert.strictEqual(greatest, 1, 'Expected gcd to be 1');
		greatest = gcd(1024, 2048);
		assert.strictEqual(greatest, 1024, 'Expected gcd to be 1024');
		greatest = gcd(4096, 5000);
		assert.strictEqual(greatest, 8, 'Expected gcd to be 8');
		
	});
	it("Test LCM", function(){
		var lowest = lcm(1, 5);
		assert.strictEqual(lowest, 5, 'Expected lcm to be 1');
		lowest = lcm(1024, 2048);
		assert.strictEqual(lowest, 2048, 'Expected lcm to be 2048');
		lowest = lcm(4096, 5000);
		assert.strictEqual(lowest, 2560000, 'Expected lcm to be 2,560,000');
		
	});

	it("Test Gamma", function(){
		var gam = gamma(10);
		var delta = .00001;
		assert.closeTo(gam, 362880, delta, "Expected gamme to be close to 362,880");
	});
});