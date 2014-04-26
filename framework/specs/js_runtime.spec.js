describe("Javascript_runtime test suite", function() {
	beforeEach(function(){});
	afterEach(function(){});

	describe("Test Timer Class", function() {

		it("Test Timer Constructor", function() {
			var timer = new Timer();
			assert(timer.start_time > 0, "The start_time should be greater than 0ms");
			timer.reset();
			assert(timer.start_time > 0, "The start_time should be greater than 0ms after Timer.reset()");
			var func = function() {
				console.log("done");
			}
			timer.registerListener(func);
			assert.equal(timer.listeners[0], func, "The first listener should be func");
		});

	});

	describe("Test Local Class", function(){
		
		it("Test Local Constructor", function() {
			for(var prop in local) {
				if(local.hasOwnProperty(prop)) {
					assert.notStrictEqual(local[prop], undefined, "An instance of Local should have no undefined memeber values");
				}
			}
		});

		it("Test Local get, set, delete functions", function() {
  			// try to set, retrieve, and delete a member of local.
  			local.set("type", "name", "value");

  			var expected = "value";
  			assert.strictEqual(local.get("type", "name"), expected, "local should have a type object with a member called name with a value of \"value\"");

  			local.delete("type", "name");
  		
  			assert.isUndefined(local.get("type", "name"), "Deleted member is now undefined");

  		});

	});

	describe("Test Global Class", function() {

		it("Test Global Constructor", function() {
			for(var prop in runtime) {
				if(runtime.hasOwnProperty(prop)) {
					assert.notStrictEqual(runtime[prop], undefined, "An instance of Global should have no undefined member values");
				}
			}
		});

		it("Test key listeners on Global", function() {
			  // var keyEvent = new KeyboardEvent("keydown", {key : "a", char : "a", shiftKey: true});
    		   //document.dispatchEvent(keyEvent);
    		  // console.log(runtime.isKeyDown('a'));
    		   //assert.isTrue(runtime.isKeyDown('a'), "The a key should be pressed down");
		});

	});

	describe("Test the Math functions", function() {
		it("Test rad2deg", function() {
			var rads, expected, delta;

			delta = .1;

			rads = Number.MAX_VALUE;
			expect = Number.POSITIVE_INFINITY;
			result = rad2deg(rads);
			assert.equal(result, expect, "Maximum rads is inf degrees should be true");

			rads = 2 * Math.PI;
			expect = 360;
			result = rad2deg(rads);
			assert.closeTo(result, expect, delta, "2 PI rads is 360 degrees should be true");

			rads = Math.PI;
			expect = 180;
			result = rad2deg(rads);
			assert.closeTo(result, expect, delta, "PI rads is 180 degrees should be true");

			rads = Math.PI/2;
			expect = 90;
			result = rad2deg(rads);
			assert.closeTo(result, expect, delta, "PI/2 rads is 90 degrees should be true");

			rads = Math.PI/3;
			expect = 60;
			result = rad2deg(rads);
			assert.closeTo(result, expect, delta, "PI/3 rads is 60 degrees should be true");

			rads = Math.PI/4;
			expect = 45;
			result = rad2deg(rads);
			assert.closeTo(result, expect, delta, "PI/4 rads is 45 degrees should be true");

			rads = Math.PI/6;
			expect = 30;
			result = rad2deg(rads);
			assert.closeTo(result, expect, delta, "PI/4 rads is 30 degrees should be true");

			rads = 0;
			expect = 0;
			result = rad2deg(rads);
			assert.equal(result, expect, "0 rads is 0 degrees should be true");

		});

		it("Test deg2rad", function() {
			var degrees, expected, delta;

			delta = .1;

			//only inf because of the order of operations
			degrees = Number.MAX_VALUE/(Math.PI/180);
			expect = Number.POSITIVE_INFINITY;
			result = deg2rad(degrees);
			assert.equal(result, expect, "Maximum rads is inf degrees should be true");

			expect = 2 * Math.PI;
			degrees = 360;
			result = deg2rad(degrees);
			assert.closeTo(result, expect, delta, "2 PI rads is 360 degrees should be true");

			expect = Math.PI;
			degrees = 180;
			result = deg2rad(degrees);
			assert.closeTo(result, expect, delta, "PI rads is 180 degrees should be true");

			expect = Math.PI/2;
			degrees = 90;
			result = deg2rad(degrees);
			assert.closeTo(result, expect, delta, "PI/2 rads is 90 degrees should be true");

			expect = Math.PI/3;
			degrees = 60;
			result = deg2rad(degrees);
			assert.closeTo(result, expect, delta, "PI/3 rads is 60 degrees should be true");

			expect = Math.PI/4;
			degrees = 45;
			result = deg2rad(degrees);
			assert.closeTo(result, expect, delta, "PI/4 rads is 45 degrees should be true");

			expect = Math.PI/6;
			degrees = 30;
			result = deg2rad(degrees);
			assert.closeTo(result, expect, delta, "PI/4 rads is 30 degrees should be true");

			expect = 0;
			degrees = 0;
			result = deg2rad(degrees);
			assert.equal(result, expect, "0 rads is 0 degrees should be true");

		});

		it("Test Range function", function(){
			function summation(n) {
				return (n*(n-1))/2;
			}
			function inclusiveSum(n1, n2) {
				var numOfInts = Math.abs(n2 - n1)+1;
				var avg = (n1 + n2)/2;
				return numOfInts*avg;
			}

			function sumOfMultiples(n,mul) {
            
				return (n*(mul*(mul-1)))/2;
			}

			// test one step at a time
			var start = 0;
			var end = 50;
			var step =1;

			var sum = 0;
			var ran = range(start, end, step);

			for(var i = 0; i < ran.length; i++ ) {
				sum+=ran[i];
			}

			assert.equal(sum, summation(end), "Testing Range function with step of 1");
			// check steps
			end = 300;
			step = 3;

			ran = range(start, end, step);
			sum = 0;
			for(var i = 0; i < ran.length; i++ ) {
				sum+=ran[i];
			}


			assert.equal(sum, sumOfMultiples(3, 100), "Testing Range function with step of 3");

			// inclusive sum
			start = 132;
			end = 531;
			step = 1;

			ran = range(start, end+1, step);
			sum = 0;
			for(var i = 0; i < ran.length; i++ ) {
				sum+=ran[i];
			}			
			assert.equal(sum, inclusiveSum(start, end), "Testing Range function of step 1 with nonzero start value");
	
		});

	});

});
