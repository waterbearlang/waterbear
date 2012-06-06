/* 
 *    JAVASCRIPT PLUGIN
 * 
 *    Support for writing Javascript using Waterbear
 *
 */


// Pre-load dependencies
yepnope({
    load: [ 'plugins/javascript.css',
            'lib/raphael-1.3.1-min.js',
            'lib/raphael-path.js',
            'lib/sketchy.js',
            'lib/colorwheel.js',
            'lib/beautify.js',
            'lib/highlight.js',
            'lib/highlight-javascript.js',
            'lib/highlight-github.css'
    ],
    complete: setup
});

// Add some utilities
jQuery.fn.extend({
  extract_script: function(){
      if (this.length === 0) return '';
      if (this.is(':input')){
          if (this.parent().is('.string') || this.parent().is('.color')){
              return '"' + this.val() + '"';
          }else{
              return this.val();
          }
      }
      if (this.is('.empty')) return '/* do nothing */';
      return this.map(function(){
          var self = $(this);
          var script = self.data('script');
          if (!script) return null;
          var exprs = $.map(self.socket_blocks(), function(elem, idx){return $(elem).extract_script();});
          var blks = $.map(self.child_blocks(), function(elem, idx){return $(elem).extract_script();});
          if (exprs.length){
              // console.log('expressions: %o', exprs);
              function exprf(match, offset, s){
                  // console.log('%d args: <%s>, <%s>, <%s>', arguments.length, match, offset, s);
                  var idx = parseInt(match.slice(2,-2), 10) - 1;
                  // console.log('index: %d, expression: %s', idx, exprs[idx]);
                  return exprs[idx];
              };
              //console.log('before: %s', script);
              script = script.replace(/\{\{\d\}\}/g, exprf);
              //console.log('after: %s', script);
          }
          if (blks.length){
              function blksf(match, offset, s){
                  var idx = parseInt(match.slice(2,-2), 10) - 1;
                  return blks[idx];
              }
              // console.log('child before: %s', script);
              script = script.replace(/\[\[\d\]\]/g, blksf);
              // console.log('child after: %s', script);   
          }
          next = self.next_block().extract_script();
          if (script.indexOf('[[next]]') > -1){
              script = script.replace('[[next]]', next);
          }else{
              if (self.is('.step, .trigger')){
                  script = script + next;
              }
          }
          return script;
      }).get().join('');
  },
  wrap_script: function(){
      // wrap the top-level script to prevent leaking into globals
      var script = this.pretty_script();
      return 'var global = new Global();(function($){var stage = $(".stage");global.paper = Raphael(stage.get(0), stage.outerWidth(), stage.outerHeight());var local = new Local();try{' + script + '}catch(e){alert(e);}})(jQuery);';
  },
  pretty_script: function(){
      return js_beautify(this.map(function(){ return $(this).extract_script();}).get().join(''));
  },
  write_script: function(view){
      view.html('<pre class="language-javascript">' + this.pretty_script() + '</pre>');
      hljs.highlightBlock(view.children()[0]);
  }
});

function setup(){
    // This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global
    
function showColorPicker(){
    var self = $(this);
    cw.input(this);
    cw.onchange(function(){
        var color = self.val();
        self.css({color: color, 'background-color': color});
    });
    $('#color_popup').bPopup({modalColor: 'transparent'});
}
$('.workspace:visible .scripts_workspace').delegate('input[type=color]', 'click', showColorPicker);
$(document).ready(function(){
    window.cw = Raphael.colorwheel($('#color_contents')[0], 300, 180);
});

window.update_scripts_view = function(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    //console.log('found %s scripts to view', blocks.length);
    var view = $('.workspace:visible .scripts_text_view');
    blocks.write_script(view);
}

function run_scripts(event){
    $('.stage')[0].scrollIntoView();
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrap_script() + '</script></div>');
}
$('.run_scripts').click(run_scripts);

// End UI section


// expose these globally so the Block/Label methods can find them
window.choice_lists = {
    keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt', 
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown', 
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
    linecap: ['round', 'butt', 'square'],
    linejoin: ['round', 'bevel', 'mitre'],
    arity: ['0', '1', '2', '3', 'array', 'object'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function','color', 'image', 'shape', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'color', 'image', 'shape', 'any'],
    easing: ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'],
    fontweight: ['normal', 'bold', 'inherit']
};

// Hints for building blocks
//
//
// Value blocks can nest, so don't end them with semi-colons (i.e., if there is a "type" specified).
//
//
var menus = {
  animation: menu('Facebook', [
        {
            label: 'get tweet for [string]',
            containers: 1,
            script: 'local.getTweet({{1}}, function(tweet){local.tweet## = tweet;[[1]]});',
            returns: {
                label: 'last tweet##',
                script: 'local.tweet## || "waiting…"',
                type: 'string'
            },
            help: 'asynchronous call to get the last tweet of the named account'
        }
    ])
};

var demos = [
    {title: 'Rotating Squares',
     description: 'Just a simple animation test',
     scripts: [{"klass":"control","label":"when program runs","script":"function _start(){[[1]]}_start();","containers":1,"trigger":true,"locals":[],"sockets":[],"contained":[{"klass":"control","label":"repeat [number:10]","script":"range({{1}}).forEach(function(idx, item){local.count = idx; local.last_var = item;[[1]]});","containers":1,"locals":[{"label":"loop index","script":"local.index","type":"number","klass":"control"}],"sockets":["10"],"contained":[{"klass":"shapes","label":"rect_1 with width [number:0] and height [number:0] at position x [number:0] y [number:0]","script":"local.shape_1 = global.paper.rect({{3}}, {{4}}, {{1}}, {{2}});","containers":0,"locals":[],"returns":{"label":"rect_1","script":"local.shape_1","type":"shape","klass":"shapes"},"sockets":["40","40",{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","locals":[],"sockets":["1",{"klass":"sensing","label":"stage width","script":"global.stage_width","containers":0,"type":"number","locals":[],"sockets":[],"contained":[],"next":""}],"contained":[],"next":""},{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","locals":[],"sockets":["1",{"klass":"sensing","label":"stage height","script":"global.stage_height","containers":0,"type":"number","locals":[],"sockets":[],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"animation","label":"shape [shape] rotation [number:15] degrees over [number:500] ms with [choice:easing]","script":"{{1}}.animate({rotation: {{2}} }, {{3}}, {{4}});","containers":0,"locals":[],"sockets":[{"klass":"shapes","label":"rect_1","script":"local.shape_1","containers":0,"type":"shape","locals":[],"sockets":[],"contained":[],"next":""},"360","2000",">"],"contained":[],"next":""}}],"next":""}],"next":""}]}    
];
populate_demos_dialog(demos);
load_current_scripts();
$('.scripts_workspace').trigger('init');
console.log("Done");

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});
}
