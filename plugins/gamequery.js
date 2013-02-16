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
        labels: ['new image##  [image]'],
        script: 'var image## = new $.gameQuery.Animation({imageURL: {{1}}});',
        //script: 'local.sprite## = Gamequery.e().addComponent("2D, DOM");',
        returns: {
            blocktype: 'expression',
            labels: ['image##'],
            script: 'image##',
            type: 'image'
        },
        help: 'create a new image'
    },

    {
      blocktype: 'step',
      labels: ['new animation##  [image] frames [number:1] width of cell [number:32] fps [number:30] '],
      script: 'var animation## = new $.gameQuery.Animation({imageURL: {{1}}, numberOfFrame: {{2}}, delta:{{3}}, rate: (1000 / {{4}}), type: $.gameQuery.ANIMATION_HORIZONTAL });',
        //script: 'local.sprite## = Gamequery.e().addComponent("2D, DOM");',
        returns: {
            blocktype: 'expression',
            labels: ['animation##'],
            script: 'animation##',
            type: 'image'
        },
        help: 'create a new animation'
    },


    {
      blocktype: 'step',
      labels: ['new animation##  of XEON running '],
      script: 'var animation## = new $.gameQuery.Animation({imageURL: "./images/xeon-walking.png", numberOfFrame: 4, delta:68, rate: (1000 / 30), type: $.gameQuery.ANIMATION_HORIZONTAL });',
        //script: 'local.sprite## = Gamequery.e().addComponent("2D, DOM");',
        returns: {
            blocktype: 'expression',
            labels: ['animation##'],
            script: 'animation##',
            type: 'image'
        },
        help: 'create a new of xeon running'
    },

    {
      blocktype: 'step',
      labels: ['new sprite## based on [image] height [number:32] width [number:32] x [number:0] y [number:0]'],
        script: '$.playground.addSprite("sprite##",{animation: {{1}}, height:{{2}}, width: {{3}}, posx: {{4}},posy:{{5}}});',
        returns: {
            blocktype: 'expression',
            labels: ['sprite##'],
            script: 'sprite##',
            type: 'sprite'
        },
        help: 'create a new sprite'
    },
]);

})();
