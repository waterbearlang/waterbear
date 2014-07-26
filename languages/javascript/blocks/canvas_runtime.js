(function(runtime){
    'use strict';
runtime.shape = {

    drawCircle: function(shape) {
        local.ctx.beginPath();
        local.ctx.arc(shape.x,shape.y,shape.r,0,Math.PI*2,true);
        local.ctx.closePath();
    },

    drawPolygon: function(shape) {
        local.ctx.beginPath();
        local.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (var i = 1; i < shape.points.length; i ++ )
            local.ctx.lineTo(shape.points[i].x, shape.points[i].y);
        local.ctx.closePath();
    },

    drawRect: function(shape) {
        local.ctx.beginPath();
        var w = Math.max(shape.r * 2, shape.w);
        var h = Math.max(shape.r * 2, shape.h);
        local.ctx.moveTo(shape.x + shape.r, shape.y);
        local.ctx.arcTo(shape.x + w, shape.y, shape.x + w, shape.y + h, shape.r);
        local.ctx.arcTo(shape.x + w, shape.y + h, shape.x, shape.y + h, shape.r);
        local.ctx.arcTo(shape.x, shape.y + h, shape.x, shape.y, shape.r);
        local.ctx.arcTo(shape.x, shape.y, shape.x + w, shape.y, shape.r);
        local.ctx.closePath();

    },

    fillShape: function(shape, color) {

        local.ctx.save();
        local.ctx.fillStyle = color;
        switch (shape.type) {
            case "circle":
                runtime.shape.drawCircle(shape);
                break;

            case "poly":
                runtime.shape.drawPolygon(shape);
                break;

            case "rect":
                runtime.shape.drawRect(shape);
                break;
        }
        local.ctx.fill();
        local.ctx.restore();
    },

    strokeShape: function(shape, color, width) {
        local.ctx.save();
        local.ctx.strokeStyle = color;
        local.ctx.lineWidth = width;

        switch (shape.type) {
            case "circle":
            runtime.shape.drawCircle(shape);
                break;

            case "poly":
                runtime.shape.drawPolygon(shape);
                break;

            case "rect":
                runtime.shape.drawRect(shape);
                break;
        }
        local.ctx.stroke();
        local.ctx.restore();
    },

    fillCircleAtPointWithRadiusAndColor: function(point, radius, color){
        local.ctx.save();
        local.ctx.beginPath();
        local.ctx.fillStyle = color;
        local.ctx.arc(point.x, point.y, radius, 0, Math.PI*2, true);
        local.ctx.closePath();
        local.ctx.fill();
        local.ctx.restore();
    }

};
})(runtime);
