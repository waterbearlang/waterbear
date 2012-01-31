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
    onoff: ['ON', 'OFF'],
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
};

function run_scripts(event){
    $('.stage')[0].scrollIntoView();
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
    var blocks = $('#block_menu .wrapper');
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
            script: 'void setup()\n{\n[[next]]\n}\n',
            help: 'Start scripts when program starts'
        },
        {
            label: 'Main loop', 
            trigger: true, 
            containers: 1, 
            slot: false, 
            script: 'void loop()\n{\n[[1]]\n}\n',
            help: 'Trigger for main loop'
        },
        {
            label: 'Global Settings', 
            trigger: true, 
            script: '/*Global Settings*/\n\n[[next]]\n\n',
            help: 'Trigger for blocks in global setup'
        },
        //uniqe id?
        {
            label: 'broadcast [string:ack] message', 
            script: '{{1}}();',
            help: 'Send a message to all listeners'
        },
        {
            label: 'when I receive [string:ack] message', 
            trigger: true, 
            script: 'function {{1}}(){\n[[next]]\n}',
            help: 'Trigger for blocks to run when message is received'
        },
        {
            label: 'forever if [boolean:false]', 
            containers: 1, 
            slot: false, 
            script: 'while({{1}}){\n[[1]]\n}',
            help: 'loop until condition fails'
        },
        {
            label: 'if [boolean]', 
            containers: 1, 
            script: 'if({{1}}){\n[[1]]\n}',
            help: 'only run blocks if condition is true'
        },
        {
            label: 'if [boolean]', 
            containers: 2, 
            subContainerLabels: ['else'],
            script: 'if({{1}}){\n[[1]]\n}else{\n[[2]]\n}',
            help: 'run first set of blocks if condition is true, second set otherwise'
        },
        {
            label: 'repeat until [boolean]', 
            script: 'while(!({{1}})){\n[[1]]\n}',
            help: 'loop until condition is true'
        }
    ], false),
    
    timing: menu('Timing', [
        {
            label: 'wait [int:1] secs', 
            script: 'delay(1000*{{1}});',
            help: 'pause before running subsequent blocks'
        },
        {
            label: 'Milliseconds since program started', 
            'type': 'int', 
            script: '(millis())',
            help: 'int value of time elapsed'
        },
        {
            label: 'Seconds since program started', 
            'type': 'int', 
            script: '(int(millis()/1000))',
            help: 'int value of time elapsed'
        }
        
    ]),
    
    io: menu('Electronic Interface', [
        {
            label: 'Create digital_output## on Pin [choice:digitalpins]', 
            script: 'digital_output## = "{{1}}"; pinMode(digital_output##, OUTPUT);',
            help: 'Create a named pin set to output',
            returns: {
                label: 'digital_output##',
                script: 'digital_output##',
                type: 'string'
            }
        },
        /*
        {
          	label: 'Set Digital Pin [string] [choice:highlow]', 
          	script: 'digitalWrite({{1}}, {{2}});',
          	help: 'Write a value to given pin'
        },
        */
        {
          	label: 'Digital Pin [string] ON if [boolean]', 
          	script: 'if({{2}} == HIGH)\n{\ndigitalWrite({{1}}, HIGH);\n}\nelse\n{\ndigitalWrite({{1}}, LOW);\n}\n',
          	help: 'Write a boolean value to given pin'
        },
        
        {
            label: 'Create digital_input## on Pin [choice:digitalpins]', 
            script: 'digital_input## = "{{1}}"; pinMode(digital_input##, INPUT);',
            help: 'Create a named pin set to input',
            returns: {
                label: 'digital_input##',
                script: 'digital_input##',
                type: 'string'
            }
        },
        
        {
            label: 'Digital Pin [string]', 
            //label: 'Is Pin [string] HIGH', 
            'type': 'boolean', 
            script: '(digitalRead({{1}}) == HIGH)',
            help: 'Is the digital input pin ON'
        },
        
        
        {
            label: 'Create analog_input## on Pin [choice:analoginpins]', 
            script: 'analog_input## = "{{1}}"; pinMode(analog_input##, INPUT);',
            help: 'Create a named pin set to input',
            returns: {
                label: 'analog_input##',
                script: 'analog_input##',
                type: 'string'
            }
        },
        
        {
            label: 'Analog Pin [string]', 
            'type': 'int', 
            script: '(analogRead({{1}}))',
            help: 'Value of analog pin'
        },
        
        {
            label: 'Create analog_output## on Pin [choice:pwmpins]', 
            script: 'analog_output## = "{{1}}"; pinMode(analog_output##, OUTPUT);',
            help: 'Create a named pin set to output',
            returns: {
                label: 'analog_output##',
                script: 'analog_output##',
                type: 'string'
            }
        },
        
        {
          	label: 'Analog [string] outputs [int:255]', 
          	script: 'analogWrite({{1}}, {{2}});',
          	help: 'Set value of a pwm pin'
        }
    ]),
    
    variables: menu('Variables', [
        {
          	label:'Create [string:var] set to [string]',
          	script: "String {{1}} = '{{2}}';",
          	help: 'Create a string variable'
        },
        {
          	label:'[string:var] = [string]',
          	script: "{{1}} = '{{2}}';",
          	help: 'Change the value of an already created string variable'
        },
        {
          	label:'value of [string:var]',
          	type : 'string',
          	script: "{{1}}",
          	help: 'Get the value of a string variable'
        },
        {
          	label:'Create [string:var] set to [int:0]',
          	script: "int {{1}} = {{2}}'",
          	help: 'Create an integer variable'
        },
        {
          	label:'[string:var] = [int:0]',
          	script: "{{1}} = {{2}};",
          	help: 'Change the value of an already created integer variable'
        },
        {
          	label:'value of [string:var]',
          	type : 'int',
          	script: "{{1}}",
          	help: 'Get the value of an integer variable'
        },
        
        {
          	label:'Create [string:var] set to [float:0.0]',
          	script: "float {{1}} = {{2}}",
          	help: 'Create a decimal variable'
        },
        {
          	label:'[string:var] = [float:0.0]',
          	script: "{{1}} = {{2}};",
          	help: 'Change the value of an already created deciaml variable'
        },
        {
          	label:'value of [string:var]',
          	type : 'float',
          	script: "{{1}}",
          	help: 'Get the value of a decimal variable'
        },
        {
         	label:'Create [string:var] set to [boolean:false]',
         	script: "int {{1}} = {{2}};",
          	help: 'Create a new true or false variable'
        },
        {
          	label:'[string:var] = [boolean:false]',
         	script: "{{1}} = {{2}};",
          	help: 'Change the value of an already created true or false variable'
        },
        {
          	label:'value of [string:var]',
          	type : 'boolean',
          	script: "{{1}}",
          	help: 'Get the value of a true or false variable'
        }
      ]),
    operators: menu('Operators', [
        {
            label: '[number:0] + [number:0]', 
            'type': 'number', 
            script: "({{1}} + {{2}})",
            help: 'Add two numbers'
        },
        {
            label: '[number:0] - [number:0]', 
            'type': 'number', 
            script: "({{1}} - {{2}})",
            help: 'Subtract two numbers'
        },
        {
            label: '[number:0] * [number:0]', 
            'type': 'number', 
            script: "({{1}} * {{2}})",
            help: 'Multiply two numbers'
        },
        {
            label: '[number:0] / [number:0]',
            'type': 'number', 
            script: "({{1}} / {{2}})",
            help: 'Divide two numbers'
        },
        {
            label: 'pick random [number:1] to [number:10]', 
            'type': 'number', 
            script: "(random({{1}}, {{2}}))",
            help: 'Generate a random number between two other numbers'
        },
        {
            label: 'set seed for random numbers to [number:1]', 
            script: "(randomSeed({{1}}))",
            help: ''
        },
        {
            label: '[number:0] < [number:0]', 
            'type': 'boolean', 
            script: "({{1}} < {{2}})",
            help: 'Check if one number is less than another'
        },
        {
            label: '[number:0] = [number:0]', 
            'type': 'boolean', 
            script: "({{1}} == {{2}})",
            help: 'Check if one number is equal to another'
        },
        
        {
            label: '[number:0] > [number:0]', 
            'type': 'boolean', 
            script: "({{1}} > {{2}})",
            help: 'Check if one number is greater than another'
        },
        {
            label: '[boolean] and [boolean]', 
            'type': 'boolean', 
            script: "({{1}} && {{2}})",
            help: 'Check if both are true'
        },
        {
            label: '[boolean] or [boolean]', 
            'type': 'boolean', 
            script: "({{1}} || {{2}})",
            help: 'Check if one is true'
        },
        {
            label: 'not [boolean]', 
            'type': 'boolean', 
            script: "(! {{1}})",
            help: 'Not true is false and Not false is true'
        },
        {
            label: '[number:0] mod [number:0]', 
            'type': 'number', 
            script: "({{1}} % {{2}})",
            help: 'Gives the remainder from the division of these two number'
        },
        
        {
            label: 'round [number:0]', 
            'type': 'int', 
            script: "(int({{1}}))",
            help: 'Gives the whole number, without the decimal part'
        },
        {
            label: 'absolute of [number:10]', 
            'type': 'number', 
            script: "(abs({{1}}))",
            help: 'Gives the positive of the number'
        },
        {
            label: 'cosine of [number:10] degrees', 
            'type': 'float', 
            script: '(cos((180 / {{1}})/ 3.14159))',
            help: 'Gives the cosine of the angle'
        },
        {
            label: 'sine of [number:10] degrees', 
            'type': 'float', 
            script: '(sin((180 / {{1}})/ 3.14159))',
            help: 'Gives the sine of the angle'
        },
        {
            label: 'tangent of [number:10] degrees', 
            'type': 'float', 
            script: '(tan((180 / {{1}})/ 3.14159))',
            help: 'Gives the tangent of the angle given'
        },
        {
            label: '[number:10] to the power of [number:2]', 
            'type': 'number', 
            script: '(pow({{1}}, {{2}}))',
            help: 'Gives the first number multiplied by itself the second number of times'
        },
        {
            label: 'square root of [number:10]', 
            'type': 'float', 
            script: '(sqrt({{1}}))',
            help: 'Gives the two numbers that if multiplied will be equal to the number input'
        },
        {
            label: '[number:10] as string', 
            'type': 'string', 
            script: '{{1}}',
            help: 'Allows you to use a numeric result as a string'
        },
        {
          	label: 'Map [number] from Analog in to Analog out',
          	type: 'number',
          	script: 'map({{1}}, 0, 1023, 0, 255)',
          	help: ''
        },
        {
          	label: 'Map [number] from [number:0]-[number:1023] to [number:0]-[number:255] ',
          	type: 'number',
          	script: 'map({{1}}, 0, 1023, 0, 255)',
            help: ''
        }
    ]),
    serial: menu('Serial', [
        {
          	label: 'Setup serial communication at [choice:baud]', 
          	script: "Serial.begin({{1}});",
            help: 'Eanble serial communications at a chosen speed'
        },
        {
          	label: 'Send [any:Message] as a line', 
          	script: "Serial.println({{1}});",
            help: 'Send a message over the serial connection followed by a line return'
        },
        {
          	label: 'Send [any:Message]', 
          	script: "Serial.print({{1}});",
            help: 'Send a message over the serial connection'
        },
        {
          	label: 'Message Value', 
          	type: 'string',
          	script: "Serial.read()",
          	help: 'Read a message from the serial connection'
        },
        {
          	label: 'End serial communication', 
            script: "Serial.end();",
          	help: 'Disable serial communications'
        }
    ])

};

var defaultscript=[{"klass":"control","label":"Global Settings","script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Setup - When program starts","script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Main loop","script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[""],"next":""}];
set_defaultscript(defaultscript);

var demos = [
    {
      title:"AnalogInOutSerial",
      description:"first example in Arduino IDE",
      scripts:[{"klass":"control","label":"Global Settings","script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [string]","script":"String {{1}} = '{{2}}';","containers":0,"sockets":["analogInPin","0"],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [string]","script":"String {{1}} = '{{2}}';","containers":0,"sockets":["analogOutPin","9"],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [int:0]","script":"int {{1}} = {{2}}'","containers":0,"sockets":["sensorValue","0"],"contained":[],"next":{"klass":"variables","label":"Create [string:var] set to [int:0]","script":"int {{1}} = {{2}}'","containers":0,"sockets":["outputValue","0"],"contained":[],"next":""}}}}},{"klass":"control","label":"Setup - When program starts","script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"serial","label":"Setup serial communication at [choice:baud]","script":"Serial.begin({{1}});","containers":0,"sockets":["9600"],"contained":[],"next":""}},{"klass":"control","label":"Main loop","script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[{"klass":"variables","label":"[string:var] = [int:0]","script":"{{1}} = {{2}};","containers":0,"sockets":["sensorValue",{"klass":"io","label":"Analog Input [string:0]","script":"(analogRead({{1}}))","containers":0,"type":"int","sockets":[{"klass":"variables","label":"value of [string:var]","script":"{{1}}","containers":0,"type":"string","sockets":["analogInPin"],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"variables","label":"[string:var] = [int:0]","script":"{{1}} = {{2}};","containers":0,"sockets":["outputValue",{"klass":"operators","label":"round [number:10]","script":"(int({{1}}))","containers":0,"type":"int","sockets":[{"klass":"operators","label":"Map [number] from Analog in to Analog out","script":"map({{1}}, 0, 1023, 0, 255)","containers":0,"type":"number","sockets":[{"klass":"variables","label":"value of [string:var]","script":"{{1}}","containers":0,"type":"int","sockets":["sensorValue"],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"serial","label":"Send [any:Message] as a line","script":"Serial.println({{1}});","containers":0,"sockets":[{"klass":"variables","label":"value of [string:var]","script":"{{1}}","containers":0,"type":"int","sockets":["outputValue"],"contained":[],"next":""}],"contained":[],"next":""}}}],"next":""}]
    }
];
populate_demos_dialog(demos);

})();
