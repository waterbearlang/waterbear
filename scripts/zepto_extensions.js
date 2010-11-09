// Extend Zepto global
$.h = function(html){
    var div = document.createElement('div');
    div.innerHTML = html;
    var innerNodes = Array.prototype.slice.call(div.children);
    var r = $();
    r.dom = innerNodes;
    return r;
};

// Extend Zepto objects
$.extend($.fn,{
      _append: function(nodes_or_sel){
      var self = this.get(0);
      var nodes;
      if(nodes_or_sel.dom){
          nodes = nodes_or_sel;
      }else{
          nodes = $(nodes_or_sel);
      }
      nodes.dom.forEach(function(node){
          self.appendChild(node);
      });
      return this;
  },
  appendTo: function(sel){
      var target = $(sel);
      if (target.dom.length){
          target = target.get(0);
          this.dom.forEach(function(node){
              target.appendChild(node);
          });
      }
      return this;
  },
  eq: function(index){
      var r = $();
      r.dom = [this.get(index)];
      return r;
  },
  children: function(sel){
      var r = $();
      this.dom.forEach(function(node){
          r.dom = r.dom.concat(Array.prototype.slice.call(node.children));
      });
      if(sel !== undefined){
          r = r.filter(sel);
      }
      return r;
  },
  siblings: function(sel){
      var r = $();
      this.dom.forEach(function(node){
          Array.prototype.slice.call(node.parentElement.children).forEach(function(child){
              if (node !== child){
                  r.dom.push(child);
              }
          });
      });
      if (sel !== undefined){
          r = r.filter(sel);
      }
      return r;
  }
});