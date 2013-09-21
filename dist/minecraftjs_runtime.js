
/*begin languages/minecraftjs/minecraftjs_runtime.js*/

function rad2deg(rad){
    return rad / DEGREE;
}

function deg2rad(deg){
    return deg * DEGREE;
}

function range(start, end, step){
    var rg = [];
    if (end === undefined){
        end = start;
        start = 0;
    }
    if (step === undefined){
        step = 1;
    }
    var i,val;
    len = end - start;
    for (i = 0; i < len; i++){
        val = i * step + start;
        if (val > (end-1)) break;
        rg.push(val);
    }
    return rg;
}


function randint(start, stop){
    // return an integer between start and stop, inclusive
    if (stop === undefined){
        stop = start;
        start = 0;
    }
    var factor = stop - start + 1;
    return Math.floor(Math.random() * factor) + start;
}

function Position(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}

function getPositionFromMC(data){
  var aData = data.toString().trim().split(",");
  //console.log("aData =", aData);
  return new Position(parseInt(aData[0],10), parseInt(aData[1],10), parseInt(aData[2],10));
}

Position.prototype.add = function(oPos)
{
  return new Position(this.x+oPos.x,this.y+oPos.y,this.z+oPos.z);
};


Position.prototype.equals = function(oPos)
{
  return ((this.x === oPos.x) && (this.y === oPos.y) && (this.z === oPos.z));
};

Position.prototype.subtract = function(oPos)
{
  return new Position(this.x-oPos.x,this.y-oPos.y,this.z-oPos.z);
};

Position.prototype.set = function(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
}


/*end languages/minecraftjs/minecraftjs_runtime.js*/

/*begin languages/minecraftjs/control_runtime.js*/

/*end languages/minecraftjs/control_runtime.js*/

/*begin languages/minecraftjs/game_runtime.js*/

/*end languages/minecraftjs/game_runtime.js*/

/*begin languages/minecraftjs/player_runtime.js*/

/*end languages/minecraftjs/player_runtime.js*/

/*begin languages/minecraftjs/position_runtime.js*/

/*end languages/minecraftjs/position_runtime.js*/

/*begin languages/minecraftjs/blocks_runtime.js*/

/*end languages/minecraftjs/blocks_runtime.js*/

/*begin languages/minecraftjs/camera_runtime.js*/

/*end languages/minecraftjs/camera_runtime.js*/

/*begin languages/minecraftjs/array_runtime.js*/

/*end languages/minecraftjs/array_runtime.js*/

/*begin languages/minecraftjs/boolean_runtime.js*/

/*end languages/minecraftjs/boolean_runtime.js*/

/*begin languages/minecraftjs/math_runtime.js*/

/*end languages/minecraftjs/math_runtime.js*/

/*begin languages/minecraftjs/string_runtime.js*/

/*end languages/minecraftjs/string_runtime.js*/
