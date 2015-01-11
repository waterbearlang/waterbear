// Simple multimethods dispatching on types

(function(){
    'use strict';

    function type(obj){
        var t = Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
        if (t === 'object' && obj.constructor && obj.constructor.name){
            return obj.constructor.name.toLowerCase();
        }
        return t;
    }

    function Method(){}
    Method.prototype.when = function when(types, fn){
        this[types.join('_')] = fn;
        return this;
    };
    Method.prototype.default = function(fn){
        this._default = fn;
        return this;
    };
    Method.prototype.send = function send(){
        var signature = [].slice.call(arguments).map(type).join('_');
        if (this[signature]){
            return this[signature].apply(this, arguments);
        }
        if (this._default){
            return this._default.apply(this, arguments);
        }
        throw new Exception('no match found for ' + signature.split('_').join(' '));
    };
    Method.prototype.fn = function fn(){
        return this.send.bind(this);
    };

    var add = new Method()
                  .when(['number', 'number'], function(a,b){ return a+b; })
                  .when(['array', 'number'], function(a,b){ return a.map(function(x){ return x + b; }); })
                  .when(['vector', 'number'], function(a,b){ return new Vector(a.x + b, a.y + b); })
                  .when(['array', 'array'], function(a,b){ return a.concat(b); })
                  .when(['vector', 'vector'], function(a,b){ return new Vector(a.x + b.x, a.y + b.y); })
                  .when(['array', 'vector'], function(a,b){ return a.map(function(x){ return add(x,b); }); })
                  .default(function(a,b){ return add(b,a); })
                  .fn();

    function Vector(x,y){
        this.x = x;
        this.y = y;
    }
    Vector.prototype.toString = function(){
        return '<' + this.x + ',' + this.y + '>';
    };

    var a = [1,2,3,4,5];
    var n = 5;
    var v = new Vector(3,6);

    console.log('array + number = %s => %s', type(add(a,n)), add(a,n));
    console.log('array + vector = %s => %s', type(add(a,v)), add(a,v));
    console.log('array + array = %s => %s', type(add(a,a)), add(a,a));
    console.log('vector + number = %s => %s', type(add(v,n)), add(v,n));
    console.log('vector + array = %s => %s', type(add(v,a)), add(v,a));
    console.log('vector + vector = %s => %s', type(add(v,v)), add(v,v));
    console.log('number + array = %s => %s', type(add(n,a)), add(n,a));
    console.log('number + vector = %s => %s', type(add(n,v)), add(n,v));
    console.log('number + number = %s => %s', type(add(n,n)), add(n,n));

})();
