(function(window){
	'use strict';
function gcd(a,b) {
	var c;
	while(b > 0) {
		c = Math.abs(b);
		b = Math.abs(a) % c;
		a = c;
	}
	return a;
}

function lcm(a,b) {
	return (Math.abs(a)/gcd(a,b))*Math.abs(b);
}

// Adapted from an example found on Wikipedia:
// http://en.wikipedia.org/w/index.php?title=Lanczos_approximation&oldid=552993029#Simple_implementation

var g = 7
var p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
     771.32342877765313, -176.61502916214059, 12.507343278686905,
     -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
 
function gamma(n) {
	// Reflection formula
	if(n < 0.5) {
		return Math.PI / (Math.sin(Math.PI*n) * gamma(1-n));
	} else {
		n -= 1;
		var x = p[0];
		for(var i = 1; i < g+2; i++) {
			x += p[i]/(n+i);
		}
		var t = n + g + 0.5;
		return Math.sqrt(2*Math.PI) * Math.pow(t,n+0.5) * Math.exp(-t) * x;
	}
}

function summation(n) {
	return (n*(n+1))/2;
}

function sumOfFirstNMultiples(mul, n) {
	return mul*summation(n);
}

function inclusiveSummation(from, to) {
	if(from >= to) return -1;
	var numOfInts = Math.abs(to - from)+1;
	var avg = (from + to)/2;
	return numOfInts*avg;
}
window.gcd = gcd;
window.lcm = lcm;
window.gamma = gamma;
window.summation = summation;
window.sumOfFirstNMultiples = sumOfFirstNMultiples;
window.inclusiveSummation = inclusiveSummation;
})(window);