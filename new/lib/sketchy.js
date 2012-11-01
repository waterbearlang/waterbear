// Utility methods I usually need
(function(){
function Path(){
    this._path = [];
}
Path.prototype.moveto = function(x, y){
    this._path.push('M' + x + ' ' + y);
    return this;
};
// Path.prototype.moveby = function(x, y){
//     this._path.push('m' + x + ' ' + y);
//     return this;
// };
// Path.prototype.lineto = function(x, y){
//     this._path.push('L' + x + ' ' + y);
//     return this;
// };
// Path.prototype.lineby = function(x, y){
//     this._path.push('l' + x + ' ' + y);
//     return this;
// };
// Path.prototype.closepath = function(){
//     this._path.push('Z');
//     return this;
// };
// Path.prototype.horizontalto = function(x){
//     this._path.push('H' + x);
//     return this;
// };
// Path.prototype.horizontalby = function(x){
//     this._path.push('h' + x);
//     return this;
// };
// Path.prototype.verticalto = function(y){
//     this._path.push('V' + y);
//     return this;
// };
// Path.prototype.verticalby = function(y){
//     this._path.push('v', + y);
//     return this;
// };
Path.prototype.beziercurveto = function(cx1, cy1, cx2, cy2, x, y){
    this._path.push('C' + [cx1, cy1, cx2, cy2, x, y].map(function(p){return Math.round(p);}).join(' '));
    return this;
};
// Path.prototype.beziercurveby = function(cx1, cy1, cx2, cy2, x, y){
//     this._path.push('c' + [cx1, cy1, cx2, cy2, x, y].join(' '));
//     return this;
// };
// Can add smooth and quadratic beziers and elliptical arcs as needed
Path.prototype.toString = function(){
    return this._path.join(' ');
};
Path.prototype.curve = function(vertArray, tightness){
// Catmull-Rom curve, approximated with beziers
    if (vertArray.length > 3) {
        var b = [],
            curTightness = tightness || 0,
            s = 1 - curTightness;
        this.moveto(vertArray[1][0], vertArray[1][1]);
         /*
         * Matrix to convert from Catmull-Rom to cubic Bezier
         * where t = curTightness
         * |0         1          0         0       |
         * |(t-1)/6   1          (1-t)/6   0       |
         * |0         (1-t)/6    1         (t-1)/6 |
         * |0         0          0         0       |
         */
         for (var i = 1; (i+2) < vertArray.length; i++) {
             b[0] = [vertArray[i][0], vertArray[i][1]];
             b[1] = [vertArray[i][0] + (s * vertArray[i+1][0] - s * vertArray[i-1][0]) / 6,
                vertArray[i][1] + (s * vertArray[i+1][1] - s * vertArray[i-1][1]) / 6];
             b[2] = [vertArray[i+1][0] + (s * vertArray[i][0] - s * vertArray[i+2][0]) / 6,
                vertArray[i+1][1] + (s * vertArray[i][1] - s * vertArray[i+2][1]) / 6];
             b[3] = [vertArray[i+1][0], vertArray[i+1][1]];
             this.beziercurveto(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
         }
         return this;
     }
};

Path.prototype.sk_line = function(x1,y1,x2,y2){
    var random = $u.random;
    var dx = (x2 - x1) / 3;
    var dy = (y2 - y1) / 3;
    var splitline = [[x1,y1],[x1,y1],[x1+dx,y1+dy],[x1+dx*2,y1+dy*2],[x2,y2],[x2,y2]];
    var overlines = $u.choice([1,1,1,1,1,1,1,2,2,2,3]);
    for (var i = 0; i < overlines; i++){
        this.curve(splitline.map($u.nudge));
    }
    return this;
};

Raphael.fn.sk_line = function(x1,y1,x2,y2){
    var p = new Path();
    p.sk_line(x1,y1,x2,y2);
    return this.path(p);
}

Raphael.prototype.sk_rect = function(x, y, w, h){
    var p = new Path();
    p.sk_line(x,y,x,y+h);
    p.sk_line(x,y,x+w,y);
    p.sk_line(x+w,y,x+w,y+h);
    p.sk_line(x,y+h,x+w,y+h);
    return this.path(p);
};
Raphael.prototype.sk_ellipse = function(x,y,w,h){
    var p = new Path();
    var points = $u.ellipse(x,y,w,h, 8);
    var count = $u.random(3, 19);
    $u.range(count).forEach(function(i){
        points.push(points[i % 8]);
    });
    p.curve(points.map($u.nudge));
    return this.path(p);
};

var $u = {
    removeItem: function(list, item){
        list.splice(list.indexOf(item), 1);
    },
    dcos: function(degrees){
        return Math.cos(Raphael.rad(degrees));
    },
    dsin: function(degrees){
        return Math.sin(Raphael.rad(degrees));
    },
    random: function(a,b){
        // 'Returns an integer between a and b, inclusive';
        // 'If b is not specified, returns an integer between 0 and a';
        if (b === undefined){
            b = a;
            a = 0;
        }
        return Math.floor(Math.random() * (b-a + 1)) + a;
    },
    choice: function(list){
        // This is an exclusive, or mutating choice that
        // picks a random item from a list and removes that
        // item before returning it
        var idx = $u.random(0, list.length - 1);
        var item = list[idx];
        list.splice(idx, 1); // remove item from list
        return item;
    },
    range: function(start, stop, step){
        // similar to Python's range function
        // should be extended to handle negative steps
        if (stop === undefined){
            stop = start;
            start = 0;
        }
        if (step === undefined){
            step = 1;
        }
        var r = [], i;
        for(i = start; i < stop; i += step){
            r.push(i);
        }
        return r;
    },
    iterrange: function(start, stop, step, func){
        var r = $u.range(start, stop, step);
        for (var i in r){
            func(r[i]);
        }
    },
    intarray: function(array){
        return $.map(array, $u.integ);
    },
    integ: function(str){
        return parseInt(str, 10);
    },
    nudge: function(pt){
        return [pt[0] + $u.random(-2,2), pt[1] + $u.random(-2, 2)];
    },
    ellipse: function(x,y,w,h,steps){
    /*
    * This functions returns an array containing points to draw an
    * ellipse in the rect defined by x,y,w,h
    */
        w = w/2;
        h = h/2;
        x = x + w;
        y = y + h;
        if (steps === undefined){
            steps = 36;
        }
        var points = [];
        var a = w, // semi-major axis
            b = h, // semi-minor axis
            beta = 0;
        if (w > h){
            a = h;
            b = w;
            beta = -Math.PI / 2;
        } 
        var sinbeta = Math.sin(beta);
        var cosbeta = Math.cos(beta);
        var i, alpha, sinalpha, cosalpha,X,Y;
        for (i = 0; i < 360; i += 360 / steps) {
            alpha = i * (Math.PI / 180) ;
            sinalpha = Math.sin(alpha);
            cosalpha = Math.cos(alpha);
            X = x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta);
            Y = y + (a * cosalpha * sinbeta + b * sinalpha * cosbeta);

            points.push([X,Y]);
        }
        return points;
    }
};
})();
