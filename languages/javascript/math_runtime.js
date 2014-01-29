
function gcd(a,b) {
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
