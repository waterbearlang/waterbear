local.voice_16 = new Voice();
(function(voice, freq) {
    voice.osc.frequency.value = freq;
})(local.voice_16, 400);
local.voice_16.toggle(true);
local.sprite_2 = new RectSprite({
    w: 32,
    h: 32
}, {
    x: randint(0, global.stage_width),
    y: randint(0, global.stage_height)
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_2.setDirection(35);
local.sprite_2.setSpeed(8);
local.sprite_7 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 0,
    y: 0
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_11 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 300,
    y: 0
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_15 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 0,
    y: 300
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_19 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 300,
    y: 300
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_23 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 600,
    y: 0
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_30 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 600,
    y: 300
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_38 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 900,
    y: 0
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.sprite_42 = new RectSprite({
    w: 300,
    h: 300
}, {
    x: 900,
    y: 300
}, "rgb(" + randint(0, 255) + "," + randint(0, 255) + "," + randint(0, 255) + ")");
local.count_1 = 0;
(function() {
    setInterval(function() {
        local.count_1++;
        if (local.sprite_2.collides(local.sprite_7)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 500);
        }
        if (local.sprite_2.collides(local.sprite_15)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 600);
        }
        if (local.sprite_2.collides(local.sprite_11)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 200);
        }
        if (local.sprite_2.collides(local.sprite_19)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 700);
        }
        if (local.sprite_23.collides(local.sprite_2)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 800);
        }
        if (local.sprite_2.collides(local.sprite_38)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 400);
        }
        if (local.sprite_2.collides(local.sprite_30)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 300);
        }
        if (local.sprite_2.collides(local.sprite_42)) {
            (function(voice, freq) {
                voice.osc.frequency.value = freq;
            })(local.voice_16, 100);
        }(function(sprite) {
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
        })(local.sprite_2);
        (function(sprite) {
            sprite.x += sprite.dx;
            sprite.y += sprite.dy;
        })(local.sprite_2);
        local.ctx.save();
        local.ctx.fillStyle = "rgba(0,0,0,0.1)";
        local.ctx.fillRect(0, 0, global.stage_width, global.stage_height);
        local.ctx.restore();
        local.sprite_23.draw(local.ctx);
        local.sprite_7.draw(local.ctx);
        local.sprite_19.draw(local.ctx);
        local.sprite_15.draw(local.ctx);
        local.sprite_11.draw(local.ctx);
        local.sprite_30.draw(local.ctx);
        local.sprite_38.draw(local.ctx);
        local.sprite_42.draw(local.ctx);
        local.sprite_2.draw(local.ctx);
    }, 1000 / 30)
})();