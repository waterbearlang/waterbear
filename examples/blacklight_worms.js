local.array_205 = [];
range(30).forEach(function(idx, item) {
    local.count_208 = idx;
    local.sprite_210 = new RectSprite({
        w: randint(10, 30),
        h: randint(10, 30)
    }, {
        x: randint(0, global.stage_width),
        y: randint(0, global.stage_height)
    }, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
    local.sprite_210.setDirection(randint(1, 360));
    local.sprite_210.setSpeed(randint(2, 5));
    local.array_205.push(local.sprite_210);
});
(function() {
    local.count_209 = 0;
    setInterval(function() {
        local.count_209++;
        local.ctx.save();
        local.ctx.fillStyle = "rgba(0,0,0,0.1)";
        local.ctx.fillRect(0, 0, global.stage_width, global.stage_height);
        local.ctx.restore();
        local.array_205.forEach(function(item, idx) {
            local.index = idx;
            local.item = item;
            local.item.draw(local.ctx);
            (function(sprite) {
                sprite.x += sprite.dx;
                sprite.y += sprite.dy;
            })(local.item);
            (function(sprite) {
                if (sprite.x < 0) {
                    sprite.dx = Math.abs(sprite.dx);
                } else if ((sprite.x + sprite.w) > global.stage_width) {
                    sprite.dx = Math.abs(sprite.dx) * -1;
                };
                if (sprite.y < 0) {
                    sprite.dy = Math.abs(sprite.dy);
                } else if ((sprite.y + sprite.h) > global.stage_height) {
                    sprite.dy = Math.abs(sprite.dy) * -1;
                }
            })(local.item);
        });
    }, 1000 / 30)
})();