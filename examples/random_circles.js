local.count_201 = 0;
(function() {
    setInterval(function() {
        local.count_201++;
        var point_202 = {
            x: randint(0, global.stage_width),
            y: randint(0, global.stage_height)
        };
        var radius_202 = 30;
        var color_202 = "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")";
        local.ctx.save();
        local.ctx.fillStyle = color_202;
        local.ctx.beginPath();
        local.ctx.arc(point_202.x, point_202.y, radius_202, 0, Math.PI * 2, true);
        local.ctx.closePath();
        local.ctx.fill();
        local.ctx.restore();
    }, 1000 / 30)
})();