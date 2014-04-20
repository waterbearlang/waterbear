
// This was built directly from the formal definition of Levenshtein distance found on Wikipedia
// It's possible there's a more efficient way of doing it?
(function(window){
	'use strict';
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
window.levenshtein = levenshtein;
})(window);