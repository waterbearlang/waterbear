
// This was built directly from the formal definition of Levenshtein distance found on Wikipedia
// It's possible there's a more efficient way of doing it?
function levenshtein(a,b) {
	function indicator(i,j) {
		if(a[i-1] == b[j-1])
			return 0;
		return 1;
	}
	function helper(i,j) {
		if(Math.min(i,j) == 0)
			return Math.max(i,j);
		return Math.min(
			helper(i-1,j) + 1,
			helper(i,j-1) + 1,
			helper(i-1,j-1) + indicator(i,j)
		);
	}
	return helper(a.length,b.length);
}

// A class representing a regex match
function PatternMatch(match) {
	if(match instanceof Array) {
		// It's the result of RegExp.exec()
		this.offset = match.index;
		this.string = match.input;
		this.match = match.shift();
		this.submatches = match;
	} else {
		// It's the arguments list that String.replace() passed to a function
		var len = match.length;
		this.offset = match[len-2];
		this.string = match[len-1];
		this.match = match[0];
		this.submatches = [];
		for(var i = 1; i < len-2; i++) {
			this.submatches.push(match[i]);
		}
	}
}

PatternMatch.prototype = {
	get prefix() {
		return this.string.slice(0,this.offset);
	},
	get suffix() {
		return this.string.slice(this.offset+this.match.length);
	},
};
