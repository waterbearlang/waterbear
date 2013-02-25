(function(){


yepnope({
    load: 'plugins/arduino.css'
});

    // This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global

    // remove UI we don't use (Maybe JS plugin should *add* this?)
    $('.goto_stage, .runScripts, .result').remove();

// expose these globally so the Block/Label methods can find them
window.choiceLists = {
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

window.setDefaultScript = function(script){
    window.defaultscript = script;
};

window.loadDefaultScript = function(script){
    if (typeof window.defaultscript != 'undefined'){
        loadScriptsFromObject(window.defaultscript);
    }
};

window.updateScriptsView = function(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    var view = $('.workspace:visible .scripts_text_view');
    blocks.writeScript(view);
};

jQuery.fn.extend({
  wrapScript: function(){
      // wrap the top-level script to prevent leaking into globals
      var script = this.map(function(){return $(this).extract_script();}).get().join('\n\n');
      return script;
  },
  writeScript: function(view){
      view.html('<code><pre class="script_view">' + this.wrapScript() +  '</pre></code>');
  }
});

function clearScripts(event, force){
    if (force || confirm('Throw out the current script?')){
        $('.workspace:visible > *').empty();
        $('.stage').replaceWith('<div class="stage"></div>');
    }
}

function clearScriptsDefault(event, force){
  clearScripts(event, force);
  loadDefaultScript();
}


$('.clearScripts').click(clearScriptsDefault);


    wb.menu('Control', [
        {
            blocktype: 'eventhandler',
            id: '25339ea4-1bc2-4c66-bde8-c455b9a3d1cd',
            label: 'Setup - When program starts',
            script: 'void setup()\n{\n[[1]]\n}\n',
            help: 'Start scripts when program starts'
        },
        {
            blocktype: 'eventhandler',
            id: 'fb958a3d-0372-4ab7-95c1-70dd9c454d19',
            label: 'Main loop',
            script: 'void loop()\n{\n[[1]]\n}\n',
            help: 'Trigger for main loop'
        },
        {
            blocktype: 'eventhandler',
            id: '1e4b61cf-c4ce-4b08-9944-7ea1ebf54775',
            label: 'Global Settings',
            script: '/*Global Settings*/\n\n[[1]]\n\n',
            help: 'Trigger for blocks in global setup'
        },
        //unique id?
        {
            blocktype: 'step',
            id: 'b54a3daa-3dfa-4885-afc4-9592944296df',
            label: 'broadcast [string:ack] message',
            script: '{{1}}();',
            help: 'Send a message to all listeners'
        },
        {
            blocktype: 'eventhandler',
            id: '64fd2a90-a689-4ffd-bd66-bc8c61775cd4',
            label: 'when I receive [string:ack] message',
            script: 'function {{1}}(){\n[[next]]\n}',
            help: 'Trigger for blocks to run when message is received'
        },
        {
            blocktype: 'context',
            id: 'c79f205e-eab3-4ebd-9c72-2e6a54209593',
            label: 'forever if [boolean:false]',
            script: 'while({{1}}){\n[[1]]\n}',
            help: 'loop until condition fails'
        },
        {
            blocktype: 'context',
            id: '0a313a7a-1187-4619-9819-fbfd7a32f6a6',
            label: 'if [boolean]',
            script: 'if({{1}}){\n[[1]]\n}',
            help: 'only run blocks if condition is true'
        },
        {
            blocktype: 'context',
            id: 'dc724c8c-27b3-4c93-9420-050dd2466c43',
            label: 'if not [boolean]',
            script: 'if(! {{1}} ){\n[[1]]\n}',
            help: 'run blocks if condition is not true'
        },
        {
            blocktype: 'context',
            id: 'a11f426a-9a48-4e0f-83f5-cff4ec5b4154',
            label: 'repeat until [boolean]',
            script: 'while(!({{1}})){\n[[1]]\n}',
            help: 'loop until condition is true'
        }
    ], false);


    wb.menu('Timing', [
        {
            blocktype: 'step',
            id: '5f4a98ff-3a12-4f2d-8327-7c6a375c0192',
            label: 'wait [int:1] secs',
            script: 'delay(1000*{{1}});',
            help: 'pause before running subsequent blocks'
        },
        {
            blocktype: 'expression',
            id: '937921ed-49f4-4915-ba39-be217ddb6175',
            label: 'Milliseconds since program started',
            type: 'int',
            script: '(millis())',
            help: 'int value of time elapsed'
        },
        {
            blocktype: 'expression',
            id: '7d4ab88b-7769-497a-8822-8f0cc92c81de',
            label: 'Seconds since program started',
            type: 'int',
            script: '(int(millis()/1000))',
            help: 'int value of time elapsed'
        }

    ]);

    wb.menu('Electronic Interface', [
        {
            blocktype: 'step',
            id: '451eda35-be10-498f-a714-4a32f3bcbe53',
            label: 'Create digital_output## on Pin [choice:digitalpins]',
            script: 'digital_output## = "{{1}}"; pinMode(digital_output##, OUTPUT);',
            help: 'Create a named pin set to output',
            returns: {
                blocktype: 'expression',
                label: 'digital_output##',
                script: 'digital_output##',
                type: 'string'
            }
        },
        /*
        {
            blocktype: 'step',
            id: '028c3174-ab7c-4119-8fd1-72c82d05443f',
          	label: 'Set Digital Pin [string] [choice:highlow]',
          	script: 'digitalWrite({{1}}, {{2}});',
          	help: 'Write a value to given pin'
        },
        */
        {
            blocktype: 'step',
            id: 'd0a3d825-0d2d-4339-838f-b30d06441c23',
          	label: 'Digital Pin [string] ON if [boolean]',
          	script: 'if({{2}} == HIGH)\n{\ndigitalWrite({{1}}, HIGH);\n}\nelse\n{\ndigitalWrite({{1}}, LOW);\n}\n',
          	help: 'Write a boolean value to given pin'
        },

        {
            blocktype: 'step',
            id: 'ef757ca5-053d-4cfd-8ed4-9345cefef569',
            label: 'Create digital_input## on Pin [choice:digitalpins]',
            script: 'digital_input## = "{{1}}"; pinMode(digital_input##, INPUT);',
            help: 'Create a named pin set to input',
            returns: {
                blocktype: 'expression',
                label: 'digital_input##',
                script: 'digital_input##',
                type: 'string'
            }
        },

        {
            blocktype: 'expression',
            id: '010020b8-4e76-4e56-9cd5-65541bf2dbc9',
            label: 'Digital Pin [string]',
            //label: 'Is Pin [string] HIGH',
            type: 'boolean',
            script: '(digitalRead({{1}}) == HIGH)',
            help: 'Is the digital input pin ON'
        },


        {
            blocktype: 'step',
            id: '220caace-bd77-4e82-9f5d-0457a5bbfe9f',
            label: 'Create analog_input## on Pin [choice:analoginpins]',
            script: 'analog_input## = "{{1}}"; pinMode(analog_input##, INPUT);',
            help: 'Create a named pin set to input',
            returns: {
                blocktype: 'expression',
                label: 'analog_input##',
                script: 'analog_input##',
                type: 'string'
            }
        },

        {
            blocktype: 'expression',
            id: '5b76796a-7fa9-4d56-b532-5194bf5db20f',
            label: 'Analog Pin [string]',
            type: 'int',
            script: '(analogRead({{1}}))',
            help: 'Value of analog pin'
        },

        {
            blocktype: 'step',
            id: '4fa77d69-30fb-4734-8697-5ed56ba67433',
            label: 'Create analog_output## on Pin [choice:pwmpins]',
            script: 'analog_output## = "{{1}}"; pinMode(analog_output##, OUTPUT);',
            help: 'Create a named pin set to output',
            returns: {
                blocktype: 'expression',
                label: 'analog_output##',
                script: 'analog_output##',
                type: 'string'
            }
        },

        {
            blocktype: 'step',
            id: '4b29af90-96e0-4de9-a7d8-2c88a35e1f49',
          	label: 'Analog [string] outputs [int:255]',
          	script: 'analogWrite({{1}}, {{2}});',
          	help: 'Set value of a pwm pin'
        }
    ]);

    wb.menu('Variables', [
        {
            blocktype: 'step',
            id: 'eda33e3e-c6de-4f62-b070-f5035737a241',
          	label: 'Create [string:var] set to [string]',
          	script: "String {{1}} = '{{2}}';",
          	help: 'Create a string variable'
        },
        {
            blocktype: 'step',
            id: '3423bd33-6a55-4660-ba78-2304308b653d',
          	label: '[string:var] = [string]',
          	script: "{{1}} = '{{2}}';",
          	help: 'Change the value of an already created string variable'
        },
        {
            blocktype: 'expression',
            id: '076b71fc-23eb-485a-8002-7e84abe8b6cf',
          	label: 'value of [string:var]',
          	type : 'string',
          	script: "{{1}}",
          	help: 'Get the value of a string variable'
        },
        {
            blocktype: 'step',
            id: '1236184b-2397-44b3-8c69-0b184e24ffd8',
          	label: 'Create [string:var] set to [int:0]',
          	script: "int {{1}} = {{2}}'",
          	help: 'Create an integer variable'
        },
        {
            blocktype: 'step',
            id: '60a81c46-fd2e-4eb4-a828-00d201534baa',
          	label: '[string:var] = [int:0]',
          	script: "{{1}} = {{2}};",
          	help: 'Change the value of an already created integer variable'
        },
        {
            blocktype: 'expression',
            id: '06a44aae-31a8-4909-80b9-61151dc2d666',
          	label: 'value of [string:var]',
          	type : 'int',
          	script: "{{1}}",
          	help: 'Get the value of an integer variable'
        },

        {
            blocktype: 'step',
            id: '645f8dde-a050-4106-b436-57c9f2301b17',
          	label: 'Create [string:var] set to [float:0.0]',
          	script: "float {{1}} = {{2}}",
          	help: 'Create a decimal variable'
        },
        {
            blocktype: 'step',
            id: 'f487db77-3f81-47ae-8fb5-478e24019c0b',
          	label: '[string:var] = [float:0.0]',
          	script: "{{1}} = {{2}};",
          	help: 'Change the value of an already created deciaml variable'
        },
        {
            blocktype: 'expression',
            id: '705a5ef3-c0b9-49f5-885d-f195c2f4c464',
          	label: 'value of [string:var]',
          	type : 'float',
          	script: "{{1}}",
          	help: 'Get the value of a decimal variable'
        },
        {
            blocktype: 'step',
            id: 'c4ab9c5d-4493-429c-beb1-be9b411c0a7e',
         	label: 'Create [string:var] set to [boolean:false]',
         	script: "int {{1}} = {{2}};",
          	help: 'Create a new true or false variable'
        },
        {
            blocktype: 'step',
            id: '027bbe7b-6b50-4d94-b447-9bca02ec513f',
          	label: '[string:var] = [boolean:false]',
         	script: "{{1}} = {{2}};",
          	help: 'Change the value of an already created true or false variable'
        },
        {
            blocktype: 'expression',
            id: 'a41881a2-7cce-4ee5-98f4-c8067e3d57a6',
          	label: 'value of [string:var]',
          	type : 'boolean',
          	script: "{{1}}",
          	help: 'Get the value of a true or false variable'
        }
      ]);

    wb.menu('Operators', [
        {
            blocktype: 'expression',
            id: 'cbb65aa7-b36c-4311-a479-f1776579dcd3',
            label: '[number:0] + [number:0]',
            type: 'number',
            script: "({{1}} + {{2}})",
            help: 'Add two numbers'
        },
        {
            blocktype: 'expression',
            id: '594700d5-64c6-4b21-bc70-f3fbf6913a69',
            label: '[number:0] - [number:0]',
            type: 'number',
            script: "({{1}} - {{2}})",
            help: 'Subtract two numbers'
        },
        {
            blocktype: 'expression',
            id: 'afec758c-7ccc-4ee5-8d2c-f95160da83d4',
            label: '[number:0] * [number:0]',
            type: 'number',
            script: "({{1}} * {{2}})",
            help: 'Multiply two numbers'
        },
        {
            blocktype: 'expression',
            id: '5cec08b8-eb58-4ef0-a73e-f5245d6859a2',
            label: '[number:0] / [number:0]',
            type: 'number',
            script: "({{1}} / {{2}})",
            help: 'Divide two numbers'
        },
        {
            blocktype: 'expression',
            id: '90a5d524-fa8a-4a52-a4df-0beb83d32c40',
            label: 'pick random [number:1] to [number:10]',
            type: 'number',
            script: "(random({{1}}, {{2}}))",
            help: 'Generate a random number between two other numbers'
        },
        {
            blocktype: 'step',
            id: 'd35330ee-5b49-492b-b7dd-41c3fd1496d0',
            label: 'set seed for random numbers to [number:1]',
            script: "(randomSeed({{1}}))",
            help: ''
        },
        {
            blocktype: 'expression',
            id: '7f047e8a-3a87-49f8-b9c7-daad742faa9d',
            label: '[number:0] < [number:0]',
            type: 'boolean',
            script: "({{1}} < {{2}})",
            help: 'Check if one number is less than another'
        },
        {
            blocktype: 'expression',
            id: 'faddd68c-6c75-4908-9ee6-bccc246f9d89',
            label: '[number:0] = [number:0]',
            type: 'boolean',
            script: "({{1}} == {{2}})",
            help: 'Check if one number is equal to another'
        },

        {
            blocktype: 'expression',
            id: 'e4d81ccd-f9dc-4a0b-b41f-a5cd146a8c27',
            label: '[number:0] > [number:0]',
            type: 'boolean',
            script: "({{1}} > {{2}})",
            help: 'Check if one number is greater than another'
        },
        {
            blocktype: 'expression',
            id: '03d1df81-c7de-40a0-a88f-95b732d19936',
            label: '[boolean] and [boolean]',
            type: 'boolean',
            script: "({{1}} && {{2}})",
            help: 'Check if both are true'
        },
        {
            blocktype: 'expression',
            id: '482db566-b14b-4381-8135-1e29f8c4e7c3',
            label: '[boolean] or [boolean]',
            type: 'boolean',
            script: "({{1}} || {{2}})",
            help: 'Check if one is true'
        },
        {
            blocktype: 'expression',
            id: '866a1181-e0ff-4ebc-88dd-55e2b70d7c52',
            label: 'not [boolean]',
            type: 'boolean',
            script: "(! {{1}})",
            help: 'Not true is false and Not false is true'
        },
        {
            blocktype: 'expression',
            id: '8353c1f3-a1da-4d80-9bf9-0c9584c3896b',
            label: '[number:0] mod [number:0]',
            type: 'number',
            script: "({{1}} % {{2}})",
            help: 'Gives the remainder from the division of these two number'
        },

        {
            blocktype: 'expression',
            id: '1fde8b93-1306-4908-97c8-d628dd91eb4f',
            label: 'round [number:0]',
            type: 'int',
            script: "(int({{1}}))",
            help: 'Gives the whole number, without the decimal part'
        },
        {
            blocktype: 'expression',
            id: 'b7634de4-69ed-492c-bc9a-16ac3bb5ca45',
            label: 'absolute of [number:10]',
            type: 'number',
            script: "(abs({{1}}))",
            help: 'Gives the positive of the number'
        },
        {
            blocktype: 'expression',
            id: '20268318-b168-4519-a32a-10b94c264226',
            label: 'cosine of [number:10] degrees',
            type: 'float',
            script: '(cos((180 / {{1}})/ 3.14159))',
            help: 'Gives the cosine of the angle'
        },
        {
            blocktype: 'expression',
            id: '86c2f303-861f-4ad7-a7de-3108637ce264',
            label: 'sine of [number:10] degrees',
            type: 'float',
            script: '(sin((180 / {{1}})/ 3.14159))',
            help: 'Gives the sine of the angle'
        },
        {
            blocktype: 'expression',
            id: '0e018648-0b45-4096-9052-e3080a47793a',
            label: 'tangent of [number:10] degrees',
            type: 'float',
            script: '(tan((180 / {{1}})/ 3.14159))',
            help: 'Gives the tangent of the angle given'
        },
        {
            blocktype: 'expression',
            id: '814444c5-f3f4-4412-975c-7284409f1f3d',
            label: '[number:10] to the power of [number:2]',
            type: 'number',
            script: '(pow({{1}}, {{2}}))',
            help: 'Gives the first number multiplied by itself the second number of times'
        },
        {
            blocktype: 'expression',
            id: '1f4df24e-22ea-460e-87c5-4b0f92e233ce',
            label: 'square root of [number:10]',
            type: 'float',
            script: '(sqrt({{1}}))',
            help: 'Gives the two numbers that if multiplied will be equal to the number input'
        },
        {
            blocktype: 'expression',
            id: '18a0560d-beff-43da-8708-55398cc08d30',
            label: '[number:10] as string',
            type: 'string',
            script: '{{1}}',
            help: 'Allows you to use a numeric result as a string'
        },
        {
            blocktype: 'expression',
            id: 'e37dae6d-608f-43e9-9cd9-57ff03aba29d',
          	label: 'Map [number] from Analog in to Analog out',
          	type: 'number',
          	script: 'map({{1}}, 0, 1023, 0, 255)',
          	help: ''
        },
        {
            blocktype: 'expression',
            id: '007bccc5-36b2-4ff8-a0bc-f80def66ff49',
          	label: 'Map [number] from [number:0]-[number:1023] to [number:0]-[number:255]',
          	type: 'number',
          	script: 'map({{1}}, 0, 1023, 0, 255)',
            help: ''
        }
    ]);

    wb.menu('Serial', [
        {
            blocktype: 'step',
            id: '11c7b422-0549-403e-9f2e-e1db13964f1b',
          	label: 'Setup serial communication at [choice:baud]',
          	script: "Serial.begin({{1}});",
            help: 'Eanble serial communications at a chosen speed'
        },
        {
            blocktype: 'step',
            id: '9ffc70c4-b0da-4d2c-a38a-f1ec2ec743ac',
          	label: 'Send [any:Message] as a line',
          	script: "Serial.println({{1}});",
            help: 'Send a message over the serial connection followed by a line return'
        },
        {
            blocktype: 'step',
            id: '40fb939a-a393-4d26-8902-93ee78bd01b0',
          	label: 'Send [any:Message]',
          	script: "Serial.print({{1}});",
            help: 'Send a message over the serial connection'
        },
        {
            blocktype: 'expression',
            id: 'a1630959-fc16-4ba8-af98-4724edc636b4',
          	label: 'Message Value',
          	type: 'string',
          	script: "Serial.read()",
          	help: 'Read a message from the serial connection'
        },
        {
            blocktype: 'step',
            id: '43618563-c8a3-4330-bfef-89469a797a90',
          	label: 'End serial communication',
            script: "Serial.end();",
          	help: 'Disable serial communications'
        }
    ]);


var defaultscript=[{"klass":"control","labels":["Global Settings"],"script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","labels":["Setup - When program starts"],"script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","labels":["Main loop"],"script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[""],"next":""}];
setDefaultScript(defaultscript);


})();
