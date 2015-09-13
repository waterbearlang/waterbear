/*
 * notiFire
 * by @dongzhang
 */

var wrapper = document.createElement('div');
wrapper.className = 'notifire-frame';
document.body.appendChild(wrapper);

// helper function to extend obj1 by obj2
function extend(obj1, obj2) {
	for (var property in obj2) {
		obj1[property] = obj2[property];
	}
}

// helop function to test if a color is valid
function testColor(color) {
	var rgb = document.createElement('div');
	rgb.style = 'color: #28e32a';    // Use a non standard dummy colour to ease checking for edge cases
    var valid_rgb = "rgb(40, 227, 42)";
    rgb.style = "color: " + color;
    if(rgb.style['color'] == valid_rgb && color != ':#28e32a' && color.replace(/ /g,"") != valid_rgb.replace(/ /g,""))
        return false;
    else
        return true;
}

// notifire
function notifire(config) {
	// initialize default object
	var defaults = {
		types: 'default',
		width: 200,
		height: 50,
		color: 'black',
		borderStyle: 'solid',
		borderWidth: 0,
		borderColor: '#ddd',
		position: 'left',
		msg: 'This is message by default',
		timeout: 5000,
		callback: null
	};

	// check input config validation
	for (prop in config) {
		switch(prop) {
			case 'types':
				if (['success', 'info', 'warning', 'danger', 'default'].indexOf(config.types) === -1) console.error('invalid input types');
				break;
			case 'width':
				if (typeof(config.width) !== 'number') console.error('invalid input width');
				break;
			case 'height':
				if (typeof(config.height) !== 'number') console.error('invalid input height');
				break;
			case 'color':
				if (!testColor(config.color)) console.error('invalid input color');
				break;
			case 'borderStyle':
				if (['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'initial', 'inherit'].indexOf(config.borderStyle) === -1) console.error('invalid input borderStyle');
				break;
			case 'borderWidth':
				if (typeof(config.borderWidth) !== 'number') console.error('invalid input borderWidth');
					break;
			case 'borderColor':
				if (!testColor(prop.borderColor)) console.error('invalid input color');
				break;
			case 'backgroundColor':
				if (!testColor(config.backgroundColor)) console.error('invalid input color');
				break;
			case 'opacity':
				if (typeof(config.opacity) !== 'number') console.error('invalid input opacity');
				break;
			case 'position':
				if (config.position !== 'left' && config.position !== 'right') console.error('invalid input position');
				break;
			case 'msg':
				if (typeof(config.msg) !== 'string') console.error('invalid input msg');
				break;
			case 'timeout':
				if (typeof(config.timeout) !== 'number' && config.timeout !== 'false') console.error('invalid input timeout');
				break;
			case 'callback':
				if (typeof(config.callback) !== 'function' && config.callback !== null) console.error('invalid input callback');
				break;
			default:
				console.error('invalid input');
				break;
		}
	}
	// extend defaults with config
	extend(defaults, config);

	// check other config options
	if (typeof defaults.callback !== 'function') {
		defaults.callback = null;
	}
	if (defaults.width === '100%') {
		defaults.width = screen.width;
	}

	// create message element and append to body

	var div = document.createElement('div');
	var span = document.createElement('span');
	div.className = 'notifire';
	span.innerHTML = defaults.msg;
	div.appendChild(span);
	wrapper.appendChild(div);

	// modify notifire div by config
	div.className += ' ' + defaults.types;
	div.style.width = defaults.width + 'px';
	div.style.height = defaults.height + 'px';
	div.style.color = defaults.color;
	var x = div.clientHeight; // request property that requires layout to force a layout

	// modify notifire div by customized position option
	switch(defaults.position) {
		case 'right':
			div.style['margin-left'] = document.body.clientWidth - 5 + 'px';
			div.style['margin-right'] = '-' + (defaults.width - 5) + 'px';
			div.style['transition'] = 'transform 0.5s';
			div.style['transform'] = 'translateX(-' + defaults.width + 'px)';
			div.style['-webkit-transition'] = 'transform 0.5s';
			div.style['-webkit-transform'] = 'translateX(-' + defaults.width + 'px)';
			break;
		case 'left':
			div.style['margin-left'] = '-' + (defaults.width - 5) + 'px';
			div.style['transition'] = 'transform 0.5s';
			div.style['transform'] = 'translateX(' + defaults.width + 'px)';
			div.style['-webkit-transition'] = 'transform 0.5s';
			div.style['-webkit-transform'] = 'translateX(' + defaults.width + 'px)';
			break;
	}

	if (defaults.backgroundColor) {
		div.style.backgroundColor = defaults.backgroundColor;
	}
	if (defaults.borderWidth !== 0) {
		div.style['border-style'] = defaults.borderStyle;
		div.style['border-width'] = defaults.borderWidth + 'px';
	}
	if (defaults.borderColor) {
		div.style['border-color'] = defaults.borderColor;
	}
	if (defaults.opacity) {
		div.style.opacity = defaults.opacity;
	}
	if (defaults.callback !== null) {
		defaults.timeout = 'false';
	}
	if (!isNaN(defaults.timeout)) {
		var timeout = notifireDismiss(div, defaults);
	}
	div.addEventListener('click', function() {
		if (timeout){
			clearTimeout(timeout);
		}
		defaults.timeout = 0;
		notifireDismiss(div, defaults);
	});
}

// dismiss notifire
function notifireDismiss(div, defaults) {
	if (defaults.callback !== null) {
		defaults.callback();
	}
	var timeout = setTimeout(function() {
		div.style['transform'] = '';
		div.style['-webkit-transform'] = '';
		setTimeout(function() {
			wrapper.removeChild(div);
		}, 500);
	}, defaults.timeout);
	return timeout;
}
