/*
 *    Gamequery PLUGIN
 *
 *    Support for writing Gamequery.js Javascript using Waterbear
 *
 */

(function(){
// Pre-load dependencies
yepnope({
    load: [ 'plugins/gamequery.css',
            'lib/jquery.gamequery.js', // FIXME: Move all runtime code to framerunner project
    ]
});

// Add some utilities
jQuery.fn.extend({
  extract_script_filtered: function(position){
    if(this.data('position') == position)
    {
      return this.extract_script();
    }
    return '';
  },
  prettyScript: function(){
      var structured = $(this).structured_script();
      return js_beautify(structured);
      //return js_beautify(this.map(function(){ return $(this).extract_script();}).get().join(''));
  },

  structured_script: function(){
      var anyscript =  this.map(function(){ return $(this).extract_script_filtered('any');}).get().join('');
      var mainscript = this.map(function(){ return $(this).extract_script_filtered('main');}).get().join('');
      var loopscript = this.map(function(){ return $(this).extract_script_filtered('loop');}).get().join('');

      var structured = anyscript+'\n$(function(){$("#stage").playground({});\n'+mainscript+'\n'+loopscript+'\n$.playground.startGame();\n});';
      return structured;
  }
});

// End UI section

wb.menu('Sprites', [
    {
        blocktype: 'step',
        id: 'e6b196e9-c20e-4522-936c-4b71b2a7ec79',
        label: 'new image##  [image]',
        script: 'var image## = new $.gameQuery.Animation({imageURL: {{1}}});',
        //script: 'local.sprite## = Gamequery.e().addComponent("2D, DOM");',
        returns: {
            blocktype: 'expression',
            label: 'image##',
            script: 'image##',
            type: 'image'
        },
        help: 'create a new image'
    },

    {
      blocktype: 'step',
      id: '7033b782-8d88-4e7a-af90-83a5802bcea7',
      label: 'new animation##  [image] frames [number:1] width of cell [number:32] fps [number:30] ',
      script: 'var animation## = new $.gameQuery.Animation({imageURL: {{1}}, numberOfFrame: {{2}}, delta:{{3}}, rate: (1000 / {{4}}), type: $.gameQuery.ANIMATION_HORIZONTAL });',
        //script: 'local.sprite## = Gamequery.e().addComponent("2D, DOM");',
        returns: {
            blocktype: 'expression',
            label: 'animation##',
            script: 'animation##',
            type: 'image'
        },
        help: 'create a new animation'
    },


    {
      blocktype: 'step',
      id: '906e927b-d4ef-43dd-816e-6437c97fbdf9',
      label: 'new animation##  of XEON running ',
      script: 'var animation## = new $.gameQuery.Animation({imageURL: "./images/xeon-walking.png", numberOfFrame: 4, delta:68, rate: (1000 / 30), type: $.gameQuery.ANIMATION_HORIZONTAL });',
        //script: 'local.sprite## = Gamequery.e().addComponent("2D, DOM");',
        returns: {
            blocktype: 'expression',
            label: 'animation##',
            script: 'animation##',
            type: 'image'
        },
        help: 'create a new of xeon running'
    },

    {
      blocktype: 'step',
      id: 'cf8eaf8b-687f-4823-97ce-e0de8253f624',
      label: 'new sprite## based on [image] height [number:32] width [number:32] x [number:0] y [number:0]',
        script: '$.playground.addSprite("sprite##",{animation: {{1}}, height:{{2}}, width: {{3}}, posx: {{4}},posy:{{5}}});',
        returns: {
            blocktype: 'expression',
            label: 'sprite##',
            script: 'sprite##',
            type: 'sprite'
        },
        help: 'create a new sprite'
    },
]);

})();
