var DomElem, Elements, HtmlElem, LeafElem, Leaves, _a, _b, _c, _d, _e, _f, elem, isEmpty, isIdClassString, isObject, isString, name, parseArgs, root;
var __hasProp = Object.prototype.hasOwnProperty, __slice = Array.prototype.slice, __extends = function(child, parent) {
    var ctor = function(){ };
    ctor.prototype = parent.prototype;
    child.__superClass__ = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
  };
isIdClassString = function(str) {
  return str && isString(str) && (str[0] === '#' || str[0] === '.');
};
isObject = function(obj) {
  var _a;
  return !(isString(obj) || (typeof (_a = obj.parseIdClass) !== "undefined" && _a !== null));
};
isString = function(obj) {
  return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
};
isEmpty = function(obj) {
  var _a, key;
  _a = obj;
  for (key in _a) { if (__hasProp.call(_a, key)) {
    if (hasOwnProperty.call(obj, key)) {
            return false;;
    }
  }}
  return true;
};
parseArgs = function() {
  var args, attributes, idClassString;
  var _a = arguments.length, _b = _a >= 1;
  args = __slice.call(arguments, 0, _a - 0);
  idClassString = args.length && isIdClassString(args[0]) ? args.shift() : null;
  attributes = args.length && isObject(args[0]) ? args.shift() : {};
  return [idClassString, attributes, args];
};
DomElem = function(name, idClassString, attributes, children) {
  this.name = name;
  this.children = children;
  this.attributes = attributes;
  this.parseIdClass(idClassString);
  return this;
};
DomElem.prototype.parseIdClass = function(str) {
  var names;
  if (str) {
    names = str.split('.');
    names[0][0] === '#' ? (this.id = names.shift().slice(1)) : null;
    names.length && names[0] === '' ? names.shift() : null;
    this.classes = names;
    return this.classes;
  } else {
    this.id = null;
    this.classes = [];
    return this.classes;
  }
};
DomElem.prototype.attrsToString = function() {
  var _a, atts, key, value;
  atts = [];
  if (this.id) {
    atts.push("id=\"" + this.id + "\"");
  }
  if (!(isEmpty(this.classes))) {
    atts.push(("class=\"" + (this.classes.join(' ')) + "\""));
  }
  _a = this.attributes;
  for (key in _a) { if (__hasProp.call(_a, key)) {
    value = _a[key];
    atts.push("" + key + "=\"" + value + "\"");
  }}
  return atts.length ? ' ' + atts.join(' ') : '';
};
DomElem.prototype.childrenToString = function() {
  var _a, _b, _c, _d, child, kids;
  kids = (function() {
    _a = []; _c = this.children;
    for (_b = 0, _d = _c.length; _b < _d; _b++) {
      child = _c[_b];
      _a.push(isString(child) ? child : child.toString());
    }
    return _a;
  }).call(this);
  return kids.join('');
};
DomElem.prototype.toString = function() {
  return "<" + this.name + (this.attrsToString()) + ">" + (this.childrenToString()) + "</" + this.name + ">";
};

LeafElem = function() {
  return DomElem.apply(this, arguments);
};
__extends(LeafElem, DomElem);
LeafElem.prototype.toString = function() {
  return "<" + this.name + (this.attrsToString()) + "/>";
};

HtmlElem = function() {
  return DomElem.apply(this, arguments);
};
__extends(HtmlElem, DomElem);
HtmlElem.prototype.toString = function() {
  return "<!DOCTYPE html>" + (HtmlElem.__superClass__.toString.call(this));
};

elem = function(name, isLeaf) {
  return function() {
    var _c, args, attributes, children, idClassString;
    var _a = arguments.length, _b = _a >= 1;
    args = __slice.call(arguments, 0, _a - 0);
    _c = parseArgs.apply(this, args);
    idClassString = _c[0];
    attributes = _c[1];
    children = _c[2];
    if (name === 'html') {
      return new HtmlElem(name, idClassString, attributes, children);
    } else if (isLeaf) {
      return new LeafElem(name, idClassString, attributes, children);
    } else {
      return new DomElem(name, idClassString, attributes, children);
    }
  };
};
Elements = ['a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdo', 'blockquote', 'body', 'button', 'canvas', 'caption', 'cite', 'code', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'i', 'iframe', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'map', 'mark', 'menu', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'p', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 'samp', 'script', 'section', 'select', 'small', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'ul', 'variable', 'video'];
Leaves = ['area', 'col', 'base', 'br', 'command', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'wbr'];
root = (typeof exports !== "undefined" && exports !== null) ? exports : this;
root['html'] = elem('html');
_b = Elements;
for (_a = 0, _c = _b.length; _a < _c; _a++) {
  name = _b[_a];
  root[name] = elem(name, false);
}
_e = Leaves;
for (_d = 0, _f = _e.length; _d < _f; _d++) {
  name = _e[_d];
  root[name] = elem(name, true);
}