/* jQuery Simple Combo Box plugin
 * Version 1.0
 *
 * Copyright (C) 2009 Bennett McElwee. (bennett at thunderguy dot com, http://www.thunderguy.com/semicolon/ )
 * 
 * This work is licensed under the Creative Commons Attribution 3.0 Unported License (http://creativecommons.org/licenses/by/3.0/)
 * Permissions beyond the scope of this license can be requested from the author.
 *
 * This is a jQuery plugin. For more information, see http://www.jquery.com
 */

(function($) {

	/*
	 * Turn all select lists in the current matched set into combo boxes.
	 *
	 * Combo boxes are normal select lists with one extra feature: you can type
	 * directly into the combo box to add an extra option, which is automatically
	 * selected.
	 *
	 * Since these combo boxes are actually just select lists plus JavaScript, they
	 * look exactly like regular select lists. They can be styled, resized, etc.
	 * with no visual glitches.
	 *
	 * Bugs:
	 * (1) Typing doesn't work on Safari when list is expanded.
	 * (2) Can't type non-ascii characters.
	 *
	 * @example
	 * $('select.allow-edit').simpleCombo();
	 * @desc Add combo box functionality to all select lists with the "allow-edit" class.
	 *
	 * @type   jQuery
	 * @return the current matched set
	 * @author Bennett McElwee
	 */
	$.fn.extend({
		simpleCombo: function() {
			this
				// Augment all single select lists that aren't already augmented
				.filter('select[type=select-one]:not(.simpleCombo)')
				.addClass('simpleCombo')
				// Ensure first option is blank if it isn't already: this is the typing area
				.each(function() {
					var firstOption = $(this).children('option').eq(0);
					if (firstOption.length == 0 || firstOption.text()) {
						$(this).prepend('<option><'+'/option>');
					}
				})
				// Backspace deletes the last typed character; Delete deletes all typed characters
				.keydown(function(event) {
					if (event.which == 8) { // backspace
						event.preventDefault();
						updateText($(this), function(text) { return text.slice(0, -1); });
					} else if (event.which == 46) { // delete
						event.preventDefault();
						updateText($(this), function(text) { return ''; });
					}
				})
				// Add typed character to the typing area and select it
				.keypress(function(event) {
					var keyCode = event.which;
					if (32 <= keyCode && keyCode <= 127) {
						event.preventDefault();
						updateText($(this), function(text) { return text + String.fromCharCode(keyCode); });
					}
				})
				// Empty the typing area if another option is selected
				.change(function() {
					var typingArea = $(this).children('option').eq(0);
					if (!typingArea[0].selected) {
						typingArea.text('');
					}
				});
			return this;
		}
	});

	function updateText(selectList, textManipulator) {
		var typingArea = selectList.blur().focus()
			.children('option').eq(0);
		var text = textManipulator(typingArea.text());
		typingArea.text(text);
		// Would prefer to do this
		// selectList.val(text).change();
		singleSelectVal(selectList, text).change();
	}

	// jQuery().val(value) can select multiple items for single select lists, which
	// has browser-dependent results. (See http://dev.jquery.com/ticket/4878)
	// So here's a specialised working version.
	// Instead of $(singleSelect).val(text), call singleSelectVal($(singleSelect), value)
	function singleSelectVal(singleSelect, value) {
		return singleSelect.each(function(){
			var values = $.makeArray(value);
			var isSet = false;
			$("option", this).each(function() {
				var selected = !isSet && (0 <= $.inArray(this.value, values) ||
					0 <= $.inArray(this.text, values));
				isSet = isSet || selected;
				this.selected = selected;
			});
			if (!values.length) {
				this.selectedIndex = -1;
			}
		});
	}
})(jQuery);
