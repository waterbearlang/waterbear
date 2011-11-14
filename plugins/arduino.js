yepnope({
    load: 'plugins/arduino.css'
});

(function(){
    // This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global
    
// expose these globally so the Block/Label methods can find them
window.choice_lists = {
    /*keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt', 
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown', 
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),*/
    highlow: ['HIGH', 'LOW'],
    inoutput: ['INPUT', 'OUTPUT'],
    logic: ['true', 'false'],
    digitalpins: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,'A0','A1','A2','A3','A4','A5'],
    analoginpins: ['A0','A1','A2','A3','A4','A5'],
    pwmpins: [3, 5, 6, 9, 10, 11],
    baud:[9600, 300, 1200, 2400, 4800, 14400, 19200, 28800, 38400, 57600, 115200],
    analogrefs:['DEFAULT', 'INTERNAL', 'INTERNAL1V1', 'INTERNAL2V56', 'EXTERNAL']
};

window.set_defaultscript = function(script){
    window.defaultscript = script; 
};

window.load_defaultscript = function(script){
    if (typeof window.defaultscript != 'undefined'){
        //console.log("window.defaultscript =", window.defaultscript);
        load_scripts_from_object(window.defaultscript);
    }
};

window.update_scripts_view = function(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    var view = $('.workspace:visible .scripts_text_view');
    blocks.write_script(view);
}

function run_scripts(event){
    $(document).scrollLeft(10000);
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrap_script() + '</script></div>');
}
$('.run_scripts').click(run_scripts);

jQuery.fn.extend({
  extract_script: function(){
      if (this.length === 0) {return '';}
      if (this.is(':input')) {return this.val();}
      if (this.is('.empty')) {return '// do nothing';}
      return this.map(function(){
          var self = $(this);
          var script = self.data('script');
          if (!script) {return null;}
          var exprs = $.map(self.socket_blocks(), function(elem, idx){return $(elem).extract_script();});
          var blks = $.map(self.child_blocks(), function(elem, idx){return $(elem).extract_script();});
          if (exprs.length){
              // console.log('expressions: %o', exprs);
              var exprf = function(match, offset, s){
                  // console.log('%d args: <%s>, <%s>, <%s>', arguments.length, match, offset, s);
                  var idx = parseInt(match.slice(2,-2), 10) - 1;
                  // console.log('index: %d, expression: %s', idx, exprs[idx]);
                  return exprs[idx];
              };
              script = script.replace(/\{\{\d\}\}/g, exprf);
          }
          if (blks.length){
              var blksf = function(match, offset, s){
                  var idx = parseInt(match.slice(2,-2), 10) - 1;
                  return blks[idx];
              };
              script = script.replace(/\[\[\d\]\]/g, blksf);
          }
          next = self.next_block().extract_script();
          if (script.indexOf('[[next]]') > -1){
              script = script.replace('[[next]]', next);
          }else{
              if (self.is('.step, .trigger')){
                  script = script + '\n' + next;
              }
          }
          return script;
      }).get().join('\n\n');
  },
  wrap_script: function(){
      // wrap the top-level script to prevent leaking into globals
      var script = this.map(function(){return $(this).extract_script();}).get().join('\n\n');
      //return 'var global = new Global();\n(function($){\nvar local = new Local();\n' + script + '\n})(jQuery);';
      return script;
  },
  write_script: function(view){
      view.html('<code><pre class="script_view">' + this.wrap_script() +  '</pre></code>');
  }
});

function test_block(block){
    var name = block.data('klass') + ': ' + block.data('label');
    try{
        eval(block.wrap_script());
        // console.log('passed: %s', name);
        return true;
    }catch(e){
        if (e.name === 'SyntaxError'){
            console.error('failed: %s, %o', name, e);
            return false;
        }else{
            // console.warn('passed with error: %s, %o', name, e);
            return true;
        }
    }
}

function test(){
    var blocks = $('.block_menu .wrapper');
    var total = blocks.length;
    var success = 0;
    var fail = 0;
    console.log('running %d tests', total);
    blocks.each(function(idx, elem){
        setTimeout(function(){
            // console.log('running test %d', idx);
            if(test_block($(elem)))
            {
              success++;
            }
            else
            {
              fail++;
            }
            if( success + fail === total){
                console.log('Ran %d tests, %d successes, %s failures', total, success, fail);
            }
        }, 10);
    });
}
window.test = test;

function clear_scripts(event, force){
    if (force || confirm('Throw out the current script?')){
        $('.workspace:visible > *').empty();
        $('.stage').replaceWith('<div class="stage"></div>');
    }
}

function clear_scripts_default(event, force){
  clear_scripts(event, force);
  load_defaultscript();  
}


$('.clear_scripts').click(clear_scripts_default);


var menus = {
    control: menu('Control', [
        {
            label: 'Setup - When program starts', 
            trigger: true, 
            script: 'void setup()\n{\n[[next]]\n}\n'
        },
        {
            label: 'Main loop', 
            trigger: true, 
            containers: 1, 
            slot: false, 
        
            script: 'void loop()\n{\n[[1]]\n}\n'
        },
        {
            label: 'Global Settings', 
            trigger: true, 
            script: '/*Global Settings*/\n\n[[next]]\n\n'
        },
        /*{
            label: 'Comment [string]', 
            script: '//{{1}}\n'
        },
        {
            label: 'Comment [comment] (not working)', 
        */
        //script: '/*{{1}}*/\n\n'
        //},
        
        
        /*{
            label: 'every 1/[number:30] of a second', 
            trigger: true, 
            script: 'setInterval(function(){\n[[next]]},\n1000/{{1}}\n);'
        },*/
        
        /* TODO : repeat , needs unquie id
        {
            label: 'repeat [int:10]', 
            containers: 1, 
            script: 'range({{1}}).forEach(function(){\n[[1]]\n});'
        },*/
        //unqie id?
        {
            label: 'broadcast [string:ack] message', 
            script: '{{1}}();'
        },
        {
            label: 'when I receive [string:ack] message', 
            trigger: true, 
            script: 'function {{1}}(){\n[[next]]\n}'
        },
        {
            label: 'forever if [boolean:false]', 
            containers: 1, 
            slot: false, 
            script: 'while({{1}}){\n[[1]]\n}'
        },
        {
            label: 'if [boolean]', 
            containers: 1, 
            script: 'if({{1}}){\n[[1]]\n}'
        },
        {
            label: 'if [boolean] else', 
            containers: 2, 
            script: 'if({{1}}){\n[[1]]\n}else{\n[[2]]\n}'
        },
        {
            label: 'repeat until [boolean]', 
            script: 'while(!({{1}})){\n[[1]]\n}'
        }
    ], false),
    
    timing: menu('Timing', [
        {
            label: 'wait [int:1] secs', 
            script: 'delay(1000*{{1}});'
        },
        {
            label: 'Milliseconds since program started', 
            'type': 'int', 
            script: '(millis())'
        },
        {
            label: 'Seconds since program started', 
            'type': 'int', 
            script: '(int(millis()/1000))'
        }
        
    ]),
    
    io: menu('IO', [
        
        {
            label: 'Digital Pin [choice:digitalpins]', 
            'type': 'int', 
            script: ' {{1}} '
        },
        {
            label: 'Set digital pin  [string:0] to [choice:inoutput]', 
            script: 'pinMode({{1}}, {{2}});'
        },
        
        {
          label: 'Input from digital pin [string:0]', 
            'type': 'boolean', 
            script: '(digitalRead({{1}}) == HIGH)'
        },
        /*
        {
            label: 'Pin HIGH [choice:digitalpins]', 
            'type': 'boolean', 
            script: '(digitalRead({{1}}) == HIGH)'
        },*/
        
        /*{
            label: 'circle with radius [number:0]', 
            script: 'local.shape = global.paper.circle(0, 0, {{1}});'
        }*/
        
        {
          label: 'Digital Pin [string:0] outputs [choice:highlow]', 
          script: 'digitalWrite({{1}}, {{2}});'
        },
        
        {
          label: 'Digital Pin [string:0] output high [boolean]', 
          script: 'if({{2}} == HIGH)\n{\ndigitalWrite({{1}}, HIGH);\n}\nelse\n{\ndigitalWrite({{1}}, LOW);\n}\n'
        },
        
        {
            label: 'Set analog reference [choice:analogrefs]', 
            script: 'analogReference({{1}});'
        },
        
        {
            label: 'Analog Pin [choice:analoginpins]', 
            'type': 'string', 
            script: ' {{1}} '
        },
        
        {
          label: 'Analog Input [string:0]', 
            'type': 'int', 
            script: '(analogRead({{1}}))'
        },
        
        {
            label: 'PWM Pin [choice:pwmpins]', 
            'type': 'int', 
            script: ' {{1}} '
        },
        
        {
          label: 'PWM [string:0] outputs [int:255]', 
          script: 'anologWrite({{1}}, {{2}});'
        }
        /*,
        
        {
            label: 'ask [string:What\'s your name?] and wait',
            script: 'local.answer = prompt("{{1}}");'
        },
        {
            label: 'answer', 
            'type': 'string', 
            script: 'local.answer'
        },
        {
            label: 'mouse x', 
            'type': 'number', 
            script: 'global.mouse_x'
        },
        {
            label: 'mouse y', 
            'type': 'number', 
            script: 'global.mouse_y'
        },
        {
            label: 'mouse down', 
            'type': 'boolean', 
            script: 'global.mouse_down'
        },
        {
            label: 'key [choice:keys] pressed?', 
            'type': 'boolean', 
            script: '$(document).bind("keydown", {{1}}, function(){\n[[1]]\n});'
        },
        {
            label: 'stage width', 
            'type': 'number', 
            script: 'global.stage_width'
        },
        {
            label: 'stage height', 
            'type': 'number', 
            script: 'global.stage_height'
        },
        {
            label: 'center x', 
            'type': 'number', 
            script: 'global.stage_center_x'
        },
        {
            label: 'center y', 
            'type': 'number', 
            script: 'global.stage_center_y'
        },
        {
            label: 'reset timer', 
            script: 'global.timer.reset()'
        },
        {
            label: 'timer', 
            'type': 'number', 
            script: 'global.timer.value()'
        }*/
    ]),
    
    variables: menu('Variables', [
        {
          label:'Create [string:var] set to [string]',
          script: "String {{1}} = '{{2}}';"
        },
        /*{
          label:'Create constant [string:var] set to [string:value]',
          script: "const String {{1}} = '{{2}}';"
        },*/
        {
          label:'[string:var] = [string]',
          script: "{{1}} = '{{2}}';"
        },
        {
          label:'value of [string:var]',
          type : 'string',
          script: "{{1}}"
        },
        
        {
          label:'Create [string:var] set to [int:0]',
          script: "int {{1}} = {{2}}'"
        },
        
        /*{
          label:'Create constant [string:var] set to [number:0]',
          script: "const int {{1}} = {{2}};"
        },*/
        {
          label:'[string:var] = [int:0]',
          script: "{{1}} = {{2}};"
        },
        {
          label:'value of [string:var]',
          type : 'int',
          script: "{{1}}"
        },
        
        {
          label:'Create [string:var] set to [float:0.0]',
          script: "float {{1}} = {{2}}"
        },
        
        /*{
          label:'Create constant [string:var] set to [number:0]',
          script: "const float {{1}} = {{2}};"
        },*/
        {
          label:'[string:var] = [float:0.0]',
          script: "{{1}} = {{2}};"
        },
        {
          label:'value of [string:var]',
          type : 'float',
          script: "{{1}}"
        },
        
        
        
        {
          label:'Create [string:var] set to [boolean:false]',
          script: "int {{1}} = {{2}};"
        },
        /*{
          label:'Create constant [string:var] set to [boolean:false]',
          script: "const int {{1}} = {{2}};"
        },*/
        {
          label:'[string:var] = [boolean:false]',
          script: "{{1}} = {{2}};"
        },
        {
          label:'value of [string:var]',
          type : 'boolean',
          script: "{{1}}"
        }
        
        
        
      ]),
    operators: menu('Operators', [
        {
            label: '[number:0] + [number:0]', 
            'type': 'number', 
            script: "({{1}} + {{2}})"
        },
        {
            label: '[number:0] - [number:0]', 
            'type': 'number', 
            script: "({{1}} - {{2}})"
        },
        {
            label: '[number:0] * [number:0]', 
            'type': 'number', 
            script: "({{1}} * {{2}})"
        },
        {
            label: '[number:0] / [number:0]',
            'type': 'number', 
            script: "({{1}} / {{2}})"
        },
        {
            label: 'pick random [number:1] to [number:10]', 
            'type': 'number', 
            script: "(random({{1}}, {{2}}))"
        },
        
        {
            label: 'set seed for random numbers to [number:1]', 
            script: "(randomSeed({{1}}))"
        },
        
        {
            label: '[number:0] < [number:0]', 
            'type': 'boolean', 
            script: "({{1}} < {{2}})"
        },
        {
            label: '[number:0] = [number:0]', 
            'type': 'boolean', 
            script: "({{1}} == {{2}})"
        },
        
        {
            label: '[number:0] > [number:0]', 
            'type': 'boolean', 
            script: "({{1}} > {{2}})"
        },
        {
            label: '[boolean] and [boolean]', 
            'type': 'boolean', 
            script: "({{1}} && {{2}})"
        },
        {
            label: '[boolean] or [boolean]', 
            'type': 'boolean', 
            script: "({{1}} || {{2}})"
        },
        {
            label: 'not [boolean]', 
            'type': 'boolean', 
            script: "(! {{1}})"
        },
        /*{
            label: 'join [string:hello] with [string:world]', 
            'type': 'string', script: "({{1}} + {{2}})"},
        {
            label: 'letter [number:1] of [string:world]', 
            'type': 'string', 
            script: "{{2}}[{{1}}]"
        },
        {
            label: 'length of [string:world]', 
            'type': 'number', 
            script: "({{1}}.length)"
        },*/
        {
            label: '[number:0] mod [number:0]', 
            'type': 'number', 
            script: "({{1}} % {{2}})"
        },
        
        {
            label: 'round [number:0]', 
            'type': 'int', 
            script: "(int({{1}}))"
        },
        {
            label: 'absolute of [number:10]', 
            'type': 'number', 
            script: "(abs({{1}}))"
        },
        /*
        {
            label: 'arccosine degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.acos({{1}}))'
        },
        {
            label: 'arcsine degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.asin({{1}}))'
        },
        {
            label: 'arctangent degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.atan({{1}}))'
        },
        {
            label: 'ceiling of [number:10]', 
            'type': 'number', 
            script: 'Math.ceil({{1}})'
        },
        */
        {
            label: 'cosine of [number:10] degrees', 
            'type': 'float', 
            script: '(cos((180 / {{1}})/ 3.14159))'
        },
        {
            label: 'sine of [number:10] degrees', 
            'type': 'float', 
            script: '(sin((180 / {{1}})/ 3.14159))'
        },
        {
            label: 'tangent of [number:10] degrees', 
            'type': 'float', 
            script: '(tan((180 / {{1}})/ 3.14159))'
        },
        {
            label: '[number:10] to the power of [number:2]', 
            'type': 'number', 
            script: '(pow({{1}}, {{2}}))'
        },
        {
            label: 'round [number:10]', 
            'type': 'int', 
            script: '(int({{1}}))'
        },
        {
            label: 'square root of [number:10]', 
            'type': 'float', 
            script: '(sqrt({{1}}))'
        },
        {
            label: '[number:10] as string', 
            'type': 'string', 
            script: '{{1}}'
        },
        {
          label: 'Map [number] from Analog in to Analog out',
          type: 'number',
          script: 'map({{1}}, 0, 1023, 0, 255)'
        },
        {
          label: 'Map [number] from [number:0]-[number:1023] to [number:0]-[number:255] ',
          type: 'number',
          script: 'map({{1}}, 0, 1023, 0, 255)'
        }
    ]),
    serial: menu('Serial', [
        {
          label: 'Setup serial communication at [choice:baud]', 
          script: "Serial.begin({{1}});"
        },
        
        {
          label: 'Send [any:Message] as a line', 
          script: "Serial.println({{1}});"
        },
        
        {
          label: 'Send [any:Message]', 
          script: "Serial.print({{1}});"
        },
        
/*        {
          label: 'Send [number:0] as a line', 
          script: "Serial.println({{1}});"
        },
        
        {
          label: 'Send [boolean:true] as a line', 
          script: "Serial.println({{1}});"
        },
  */      
        
        {
          label: 'Message Value', 
          type: 'string',
          script: "Serial.read()"
        },
        
        
        {
          label: 'End serial communication', 
            script: "Serial.end();"
        }
    ])

};

var defaultscript=[{"klass":"control","label":"Global Settings","script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Setup - When program starts","script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Main loop","script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[""],"next":""}];
set_defaultscript(defaultscript);

var demos = [
    {
      title:"AnalogInOutSerial",
      description:"first example in Arduino IDE",
      scripts:[{"klass":"control","label":"Global Settings","script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [string]","script":"String {{1}} = '{{2}}';","containers":0,"sockets":["analogInPin","0"],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [string]","script":"String {{1}} = '{{2}}';","containers":0,"sockets":["analogOutPin","9"],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [int:0]","script":"int {{1}} = {{2}}'","containers":0,"sockets":["sensorValue","0"],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [int:0]","script":"int {{1}} = {{2}}'","containers":0,"sockets":["outputValue","0"],"contained":[],"next":""}}}}},{"klass":"control","label":"Setup - When program starts","script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"serial","label":"Setup serial communication at [choice:baud]","script":"Serial.begin({{1}});","containers":0,"sockets":["9600"],"contained":[],"next":""}},{"klass":"control","label":"Main loop","script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[{"klass":"variables","label":"[string:var] = [int:0]","script":"{{1}} = {{2}};","containers":0,"sockets":["sensorValue",{"klass":"io","label":"Analog Input [string:0]","script":"(analogRead({{1}}))","containers":0,"type":"int","sockets":[{"klass":"variables","label":"value of [string:var]","script":"{{1}}","containers":0,"type":"string","sockets":["analogInPin"],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"variables","label":"[string:var] = [int:0]","script":"{{1}} = {{2}};","containers":0,"sockets":["outputValue",{"klass":"operators","label":"round [number:10]","script":"(int({{1}}))","containers":0,"type":"int","sockets":[{"klass":"operators","label":"Map [number] from Analog in to Analog out","script":"map({{1}}, 0, 1023, 0, 255)","containers":0,"type":"number","sockets":[{"klass":"variables","label":"value of [string:var]","script":"{{1}}","containers":0,"type":"int","sockets":["sensorValue"],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"serial","label":"Send [any:Message] as a line","script":"Serial.println({{1}});","containers":0,"sockets":[{"klass":"variables","label":"value of [string:var]","script":"{{1}}","containers":0,"type":"int","sockets":["outputValue"],"contained":[],"next":""}],"contained":[],"next":""}}}],"next":""}]
    }
];
populate_demos_dialog(demos);

})();
