$(function() {
  return $('a[rel]').overlay({
    mask: 'darkred',
    effect: 'apple',
    onBeforeLoad: function() {
        var klass = this.getTrigger().attr('class');
        var menu = menus[klass];
        return this.getOverlay()
            .find('.content_wrap').empty()
            .append(menus[this.getTrigger().attr('class')]);
    }
  });
});

function log(msg){
    $('.stage').append('<p>' + msg + '</p>');
}

$('.scripts_workspace')[0].ontouchmove = function(event){
     event.preventDefault();
};

function menu(klass, specs){
    var col = $('<table><tr><td></td><td></td></tr></table>');
    var half = Math.round((specs.length + 1) / 2);
    var col1 = col.find('td').eq(0);
    var col2 = col.find('td').eq(1);
    specs.forEach(function(spec, idx){
        spec.klass = klass;
        if (idx < half){
            col1.append(block(spec));
        }else{
            col2.append(block(spec));
        }
    });
    return col;
}

var menus = {
    motion: menu('motion', [
        {label: 'move [number: 10] steps'},
        {label: 'turn [clockwise] [number:15] degrees'},
        {label: 'turn [counterclockwise] [number:15] degrees'},
        {label: 'point in direction [degrees:90]'},
        {label: 'point towards [sprite_or_mouse]'},
        {label: 'go to x: [number:0] y: [number:0]'},
        {label: 'go to [sprite_or_mouse]'},
        {label: 'glide [number:1] secs to x: [number:0] y: [number:0]'},
        {label: 'change x by [number:10]'},
        {label: 'set x to [number:0]'},
        {label: 'change y by [number:10]'},
        {label: 'set y to [number:0]'},
        {label: 'if on edge, bounce'},
        {label: 'x position', 'type': Number},
        {label: 'y position', 'type': Number},
        {label: 'direction', 'type': Number}        
    ]),
    looks: menu('looks', [
        {label: 'switch to costume [costume]'},
        {label: 'next costume'},
        {label: 'costume #', 'type': Number},
        {label: 'say [string:Hello!] for [number:2] secs'},
        {label: 'say [string:Hello!]'},
        {label: 'think [string:Hmm…] for [number:2] secs'},
        {label: 'think [string:Hmm…]'},
        {label: 'change [effect] effect by [number:25]'},
        {label: 'set [effect] effect to [number:0]'},
        {label: 'clear graphic effects'},
        {label: 'change size by [number:10]'},
        {label: 'set size to [number:100]%'},
        {label: 'size', 'type': Number},
        {label: 'show'},
        {label: 'hide'},
        {label: 'go to front'},
        {label: 'go back [number:1] layers'}
    ]),
    sound: menu('sound', [
        {label: 'play sound [sound_or_record]'},
        {label: 'play sound [sound_or_record] until done'},
        {label: 'stop all sounds'},
        {label: 'play drum [drum:48] for [number:0.2] beats'},
        {label: 'rest for [number:0.2] beats'},
        {label: 'play note [note:60] for [number:0.5] beats'},
        {label: 'set instrument to [instrument:1]'},
        {label: 'change volume by [number:-10]'},
        {label: 'set volume to [number:100]%'},
        {label: 'volume', 'type': Number},
        {label: 'change tempo by [number:20]'},
        {label: 'set tempo to [number:60] bpm'},
        {label: 'tempo', 'type': Number}
    ]),
    pen: menu('pen', [
        {label: 'clear'},
        {label: 'pen down'},
        {label: 'pen up'},
        {label: 'set pen color to [color_picker]'},
        {label: 'change pen color by [number:10]'},
        {label: 'set pen color to [number:0]'},
        {label: 'change pen shade by [number:10]'},
        {label: 'set pen shade to [number:50]'},
        {label: 'change pen size by [number:1]'},
        {label: 'set pen size to [number:1]'},
        {label: 'stamp'}
    ]),
    control: menu('control', [
        {label: 'when [flag] clicked', trigger: true},
        {label: 'when [key] key pressed', trigger: true},
        {label: 'when [sprite] clicked', trigger: true},
        {label: 'wait [number:1] secs'},
        {label: 'forever', containers: 1, tab: false},
        {label: 'repeat [number:10]', containers: 1},
        {label: 'broadcast [message]'},
        {label: 'broadcast [message] and wait'},
        {label: 'when I receive [message]', trigger: true},
        {label: 'forever if [boolean]', containers: 1, tab: false},
        {label: 'if [boolean]', containers: 1},
        {label: 'if [boolean] else', containers: 2},
        {label: 'wait until [boolean]'},
        {label: 'repeat until [boolean]'},
        {label: 'stop script'},
        {label: 'stop all [stop]', tab: false}
    ]),
    sensing: menu('sensing', [
        {label: 'touching [sprite_or_mouse_or_edge]?', 'type': Boolean},
        {label: 'touching [color_eyedropper]?', 'type': Boolean},
        {label: '[color_eyedropper] is touching [color_eyedropper]?', 'type': Boolean},
        {label: "[ask [string:What's your name?] and wait"},
        {label: 'answer', 'type': String},
        {label: 'mouse x', 'type': Number},
        {label: 'mouse y', 'type': Number},
        {label: 'mouse down', 'type': Boolean},
        {label: 'key [key] pressed?', 'type': Boolean},
        {label: 'distance to [sprite_or_mouse]', 'type': Number},
        {label: 'reset timer'},
        {label: 'timer', 'type': Number},
        {label: '[property] of [sprite_or_stage]', type: Number},
        {label: 'loudness', type: Number},
        {label: 'loud?', type: Boolean},
        {label: '[sensor] sensor value', type: Number},
        {label: 'sensor [button_or_connection]?', type: Boolean}
    ]),
    operators: menu('operators', [
        {label: '[number] + [number]', type: Number},
        {label: '[number] - [number]', type: Number},
        {label: '[number] * [number]', type: Number},
        {label: '[number] / [number]', type: Number},
        {label: 'pick random [number:1] to [number:10]', type: Number},
        {label: '[number] < [number]', type: Boolean},
        {label: '[number] = [number]', type: Boolean},
        {label: '[number] > [number]', type: Boolean},
        {label: '[boolean] and [boolean]', type: Boolean},
        {label: '[boolean] or [boolean]', type: Boolean},
        {label: 'not [boolean]', type: Boolean},
        {label: 'join [string:hello] [string:world]', type: String},
        {label: 'letter [number:1] of [string:world]', type: String},
        {label: 'length of [string:world]', type: Number},
        {label: '[number] mod [number]', type: Number},
        {label: 'round [number]', type: Number},
        {label: '[function] of [number:10]', type: Number}
    ]),
    variables: menu('variables', [
        {button: 'Make a variable'},
        {button: 'Make a list'}
    ])
};