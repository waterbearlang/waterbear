/**
 * Tests for the underlying functions for blocks in runtime.js.
 *
 * Tests are grouped using QUnit.module given their block category.
 * Tests are named according to their script attribute in their
 * wb-expression/wb-control/wb-step.
 *
 * util.js, and event.js MUST be included before this file (so you can use
 * anything in those files in your tests).
 */

/* TODO: control */

QUnit.module('control');

/* sprite */

QUnit.module('sprites');
QUnit.test('create', function(assert){
    var sprite_empty = runtime.sprite.create();
    var image = runtime.sprite.create( runtime.image.get('images/mascot/mascot-steampunk.png') );
    var sprite_image = runtime.sprite.create( image );
    var position = new util.Vector(2,2);
    var rectangle = runtime.shape.rectangle(position,1,1);
    var sprite_shape = runtime.sprite.create( rectangle );
    var sprite = runtime.sprite.create();
    var sprite_sprite = runtime.sprite.create( sprite );

    assert.ok(sprite_empty);
    assert.ok(sprite_image);
    assert.ok(sprite_image.drawable === image);
    assert.ok(sprite_shape);
    assert.ok(sprite_shape.drawable === rectangle);
    assert.ok(sprite_sprite);
    assert.ok(sprite_sprite.drawable = sprite);
});
QUnit.test('check for collision, colliding rectangles', function(assert){
    var rectangle1 = runtime.shape.rectangle(new util.Vector(0,0),10,10);
    var rectangle2 = runtime.shape.rectangle(new util.Vector(0,0),10,10);
    var rectangle3 = runtime.shape.rectangle(new util.Vector(9,9),10,10);
    var sprite1 = runtime.sprite.create( rectangle1 );
    var sprite2 = runtime.sprite.create( rectangle2 );
    var sprite3 = runtime.sprite.create( rectangle3 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite1.checkForCollision(sprite3));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite3));
    assert.ok(sprite3.checkForCollision(sprite1));
    assert.ok(sprite3.checkForCollision(sprite2));
    assert.ok(sprite3.checkForCollision(sprite3));
});
QUnit.test('check for collision, just touching rectangles', function(assert){
    var rectangle1 = runtime.shape.rectangle(new util.Vector(0,0),10,10);
    var rectangle2 = runtime.shape.rectangle(new util.Vector(-10,-10),10,10);
    var rectangle3 = runtime.shape.rectangle(new util.Vector(10,10),10,10);
    var sprite1 = runtime.sprite.create( rectangle1 );
    var sprite2 = runtime.sprite.create( rectangle2 );
    var sprite3 = runtime.sprite.create( rectangle3 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite1.checkForCollision(sprite3));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
    assert.ok(!sprite2.checkForCollision(sprite3));
    assert.ok(sprite3.checkForCollision(sprite1));
    assert.ok(!sprite3.checkForCollision(sprite2));
    assert.ok(sprite3.checkForCollision(sprite3));
});
QUnit.test('check for collision, no collision rectangles', function(assert){
    var rectangle1 = runtime.shape.rectangle(new util.Vector(0,0),10,10);
    var rectangle2 = runtime.shape.rectangle(new util.Vector(-10.1,-10.1),10,10);
    var rectangle3 = runtime.shape.rectangle(new util.Vector(0,10.1),10,10);
    var sprite1 = runtime.sprite.create( rectangle1 );
    var sprite2 = runtime.sprite.create( rectangle2 );
    var sprite3 = runtime.sprite.create( rectangle3 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(!sprite1.checkForCollision(sprite2));
    assert.ok(!sprite1.checkForCollision(sprite3));
    assert.ok(!sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
    assert.ok(!sprite2.checkForCollision(sprite3));
    assert.ok(!sprite3.checkForCollision(sprite1));
    assert.ok(!sprite3.checkForCollision(sprite2));
    assert.ok(sprite3.checkForCollision(sprite3));
});
QUnit.test('check for collision, colliding rectangle and circle', function(assert){
    var rectangle1 = runtime.shape.rectangle(new util.Vector(0,0),10,10);
    var circle1 = runtime.shape.circle(new util.Vector(0,0),10);
    var sprite1 = runtime.sprite.create( rectangle1 );
    var sprite2 = runtime.sprite.create( circle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, just touching rectangle and circle', function(assert){
    var rectangle1 = runtime.shape.rectangle(new util.Vector(0,0),10,10);
    var circle1 = runtime.shape.circle(new util.Vector(20,0),10);
    var sprite1 = runtime.sprite.create( rectangle1 );
    var sprite2 = runtime.sprite.create( circle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, not colliding rectangle and circle', function(assert){
    var rectangle1 = runtime.shape.rectangle(new util.Vector(-0.1,0),10,10);
    var circle1 = runtime.shape.circle(new util.Vector(20,0),10);
    var sprite1 = runtime.sprite.create( rectangle1 );
    var sprite2 = runtime.sprite.create( circle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(!sprite1.checkForCollision(sprite2));
    assert.ok(!sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, colliding circles', function(assert){
    var circle1 = runtime.shape.circle(new util.Vector(0,0),10);
    var circle2 = runtime.shape.circle(new util.Vector(0,0),5);
    var sprite1 = runtime.sprite.create( circle1 );
    var sprite2 = runtime.sprite.create( circle2 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, touching circles', function(assert){
    var circle1 = runtime.shape.circle(new util.Vector(15,0),10);
    var circle2 = runtime.shape.circle(new util.Vector(0,0),5);
    var sprite1 = runtime.sprite.create( circle1 );
    var sprite2 = runtime.sprite.create( circle2 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, not colliding circles', function(assert){
    var circle1 = runtime.shape.circle(new util.Vector(15,0),10);
    var circle2 = runtime.shape.circle(new util.Vector(0,-1),5);
    var sprite1 = runtime.sprite.create( circle1 );
    var sprite2 = runtime.sprite.create( circle2 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(!sprite1.checkForCollision(sprite2));
    assert.ok(!sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, colliding polygons', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var polygon2 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( polygon2 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, touching polygons', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(20,20),
        new util.Vector(20,30),
        new util.Vector(30,30),
        new util.Vector(10,10)
        );
    var polygon2 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( polygon2 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, no colliding polygons', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(20,20),
        new util.Vector(20,30),
        new util.Vector(30,30),
        new util.Vector(20,30)
        );
    var polygon2 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( polygon2 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(!sprite1.checkForCollision(sprite2));
    assert.ok(!sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, colliding rectangle and polygon', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var rectangle1 = runtime.shape.rectangle(new util.Vector(0,0),10,10);
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( rectangle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, touching rectangle and polygon', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var rectangle1 = runtime.shape.rectangle(new util.Vector(10,10),10,10);
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( rectangle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, no colliding rectangle and polygon', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var rectangle1 = runtime.shape.rectangle(new util.Vector(10,10.1),10,10);
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( rectangle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(!sprite1.checkForCollision(sprite2));
    assert.ok(!sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, colliding circle and polygon', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var circle1 = runtime.shape.circle(new util.Vector(0,0),10);
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( circle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, touching circle and polygon', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var circle1 = runtime.shape.circle(new util.Vector(20,0),10);
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( circle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(sprite1.checkForCollision(sprite2));
    assert.ok(sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});
QUnit.test('check for collision, no colliding circle and polygon', function(assert){
    var polygon1 = runtime.shape.polygon(
        new util.Vector(0,0),
        new util.Vector(10,0),
        new util.Vector(10,10),
        new util.Vector(0,10)
        );
    var circle1 = runtime.shape.circle(new util.Vector(20,20),10);
    var sprite1 = runtime.sprite.create( polygon1 );
    var sprite2 = runtime.sprite.create( circle1 );

    assert.ok(sprite1.checkForCollision(sprite1));
    assert.ok(!sprite1.checkForCollision(sprite2));
    assert.ok(!sprite2.checkForCollision(sprite1));
    assert.ok(sprite2.checkForCollision(sprite2));
});

/* TODO: sound */
QUnit.module('sound');
QUnit.test('get', function(assert){
    var sound = runtime.sound;
    var synth = sound.get('tri', '10', '300');
    assert.ok(synth);
});
QUnit.test('addNote', function(assert){
    var sound = runtime.sound;
    var notes = ['C','C#/Db','D','D#/Eb','E','F','F#/Gb','G','G#/Ab','A','A#/Bb','B','Rest'];
    notes.forEach(function (note, index) {
        sound.addNote(note, '4', '1/4');
    });
    var octaves = ['1','2','3','4','5','6','7','8'];
    octaves.forEach(function (octave, index) {
        sound.addNote('C', octave, '1/16');
    })
    var beats = ['1/32','1/16','1/8','1/4','1/2','1'];
    beats.forEach(function (length, index) {
        sound.addNote('C', '3', length);
    })
    assert.ok(sound);
});
QUnit.test('playChord', function(assert){
    var sound = runtime.sound;
    var synth = sound.get('tri', '10', '300');
    sound.playChord(synth, 'A', '4', 'A#/Bb', '4', 'B', '4', 'C', '4', 'C#/Db', '4', 'D', '4', 'D#/Eb', '4', 'E', '4', 'F', '4', 'F#/Gb', '4', 'G', '4', 'G#/Ab', '4');
    assert.ok(sound);
});
QUnit.test('playNotes', function(assert){
    var sound = runtime.sound;
    var synth = sound.get('tri', '10', '300');
    sound.playNotes(synth);
    assert.ok(sound);
});
QUnit.test('playMML', function(assert){
    var sound = runtime.sound;
    var synth = sound.get('tri', '10', '300');
    var mml = "abcdefg";
    sound.playMML(synth, mml);
    assert.ok(sound);
});
QUnit.test('tempoChange', function(assert){
    var sound = runtime.sound;
    sound.tempoChange('200');
    assert.ok(sound);
});
QUnit.test('keys', function(assert){
    var sound = runtime.sound;
    var synth = sound.get('tri', '10', '300');
    sound.keys(synth);
    assert.ok(sound);
});
QUnit.test('soundEffect', function(assert){
    var sound = runtime.sound;
    sound.soundEffect('laser');
    sound.soundEffect('alarm');
    assert.ok(sound);
});
QUnit.test('getAudio', function(assert){
    var sound = runtime.sound;
    var audio = sound.getAudio('/sounds/pianoA.wav');
    assert.ok(audio);
});
QUnit.test('playAudio', function(assert){
    var sound = runtime.sound;
    var audio = sound.getAudio('/sounds/pianoA.wav');
    sound.playAudio(audio);
    sound.playAudio();
    assert.ok(sound);
});
QUnit.test('pauseAudio', function(assert){
    var sound = runtime.sound;
    var audio = sound.getAudio('/sounds/pianoA.wav');
    sound.playAudio(audio);
    sound.pauseAudio(audio);
    sound.pauseAudio();
    assert.ok(sound);
});
/* TODO: arrays */
QUnit.module('arrays');
QUnit.test('create', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var create = array.create('item1',image,sprite);
    assert.ok(create[0] === 'item1');
    //test items other than strings
    assert.ok(create[1] === image);
    assert.ok(create[2] === sprite);
    assert.ok(create[0] !== image);
});
QUnit.test('copy', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var original = ['item1',image,sprite];
    var copy = array.copy(original);
    assert.ok(copy[0] === original[0]);
    assert.ok(copy[1] === original[1]);
    assert.ok(copy[2] === original[2]);
    assert.ok(copy[0] !== original[2]);
});
QUnit.test('itemAt', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var original = ['item1',image,sprite];
    assert.ok(array.itemAt(original,0) === 'item1');
    assert.ok(array.itemAt(original,1) === image);
    assert.ok(array.itemAt(original,2) === sprite);
});
QUnit.test('join', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var array1 = ['item1',image,sprite];
    var array2 = ['item4','item5'];
    var joined = array.join(array1,array2);
    assert.ok(joined[3] === 'item4');
    assert.ok(joined[4] === 'item5');
});
QUnit.test('makeString', function(assert){
    var array = runtime.array;
    var array1 = ['the','boy','went'];
    var sentence = array.makeString(array1);
    assert.ok(sentence === "the,boy,went");
});
QUnit.test('append', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var appended = ['item1',sprite];
    array.append(appended,'newItem');
    array.append(appended,image);
    assert.ok(appended[0] === 'item1');
    assert.ok(appended[1] === sprite);
    assert.ok(appended[2] === 'newItem');
    assert.ok(appended[3] === image);
});
QUnit.test('prepend', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var prependArray = ['item1',sprite];
    array.prepend(prependArray,'newItem');
    array.prepend(prependArray, image);
    assert.ok(prependArray[0] === image);
    assert.ok(prependArray[1] === 'newItem');
    assert.ok(prependArray[2] === 'item1');
    assert.ok(prependArray[3] === sprite);
});
QUnit.test('length', function(assert){
    var array = runtime.array;
    var lengthArray = ['one','two','three'];
    assert.ok(array.length(lengthArray) === 3);
});
QUnit.test('removeItem', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var array1 = ['item1',image,sprite];
    array.removeItem(array1,1);
    assert.ok(array1[0] === 'item1');
    assert.ok(array1[1] === sprite);
    assert.ok(array1.length === 2);
});
QUnit.test('pop', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var array1 = ['item1',image,sprite];
    array.pop(array1);
    assert.ok(array1[0] === 'item1');
    assert.ok(array1[1] === image);
    assert.ok(array1.length === 2);
});
QUnit.test('shift', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var array1 = ['item1',image,sprite];
    array.shift(array1);
    assert.ok(array1[0] === image);
    assert.ok(array1[1] === sprite);
    assert.ok(array1.length === 2);
});
QUnit.test('reverse', function(assert){
    var array = runtime.array;
    var image = runtime.image.get('images/mascot/mascot-steampunk.png');
    var sprite = runtime.sprite.create();
    var array1 = ['item1',image,sprite];
    array.reverse(array1);
    assert.ok(array1[0] === sprite);
    assert.ok(array1[1] === image);
    assert.ok(array1[2] === 'item1');
});

QUnit.module('boolean');
QUnit.test('and', function(assert){
    var bool = runtime.boolean;

    var b1 = bool.and(true, true);
    var b2 = bool.and(true, false);
    var b3 = bool.and(false, true);
    var b4 = bool.and(false, false);

    assert.ok(b1, "true and true = true");
    assert.ok(!b2, "true and false = false");
    assert.ok(!b3, "false and true = false");
    assert.ok(!b4, "false and false = false");
});
QUnit.test('or', function(assert){
    var bool = runtime.boolean;

    var b1 = bool.or(true, true);
    var b2 = bool.or(true, false);
    var b3 = bool.or(false, true);
    var b4 = bool.or(false, false);

    assert.ok(b1, "true or true = true");
    assert.ok(b2, "true or false = true");
    assert.ok(b3, "false or true = true");
    assert.ok(!b4, "false or false = false");
});
QUnit.test('xor', function(assert){
    var bool = runtime.boolean;

    var b1 = bool.xor(true, true);
    var b2 = bool.xor(true, false);
    var b3 = bool.xor(false, true);
    var b4 = bool.xor(false, false);

    assert.ok(!b1, "true xor true = false");
    assert.ok(b2, "true xor false = true");
    assert.ok(b3, "false xor true = true");
    assert.ok(!b4, "false xor false = false");
});
QUnit.test('not', function(assert){
    var bool = runtime.boolean;

    var b1 = bool.not(true);
    var b2 = bool.not(false);

    assert.ok(!b1, "not true = false");
    assert.ok(b2, "not false = true");
});

/* TODO: canvas */
/* TODO: colors */
/* TODO: images */
/* TODO: math */
QUnit.module('math');
QUnit.test('add',function(assert){
    var math = runtime.math;
    var array = [2,2,2,2];
    var array2 = [5,5,5,5];

    //array to number
    assert.ok(math.add(3,2) === 5);
    var numAdd = math.add(array,1);
    assert.ok(numAdd[0] === 3);

    //array to array
    var arrAdd = math.add(array,array2);
    assert.ok(arrAdd[0] === 2);
    assert.ok(arrAdd[4] === 5);

    //array to vector
    var vecArray = [new util.Vector(2,2)];
    var vector1 = new util.Vector(1,1);
    var vecAdd = math.add(vecArray,vector1);
    assert.ok(vecAdd[0].x === 3);
    assert.ok(vecAdd[0].y === 3);

    //vector to vector
    var vector2 = new util.Vector(5,5);
    var newVec = math.add(vector1,vector2);
    assert.ok(newVec.x === 6);
    assert.ok(newVec.y === 6);

    //vector to number
    var newNum = math.add(vector1,4);
    assert.ok(newNum.x === 5);
    assert.ok(newNum.y === 5);

    //number to number
    var num = math.add(4,3);
    assert.ok(num === 7);

});
QUnit.test('subtract',function(assert){
    var math = runtime.math;
    var array = [2,2,2,2,5,3];
    var array2 = [5,3];

    //array from number
    var numSub = math.subtract(array,1);
    assert.ok(numSub[0] === 1);
    assert.ok(numSub[4] === 4);

    /*array from array
    var arrSub = math.subtract(array2,array);
    assert.ok(arrSub[0] === 2);
    assert.ok(arrSub[4] === NULL);
    */
    //array from vector
    var vecArray = [new util.Vector(2,2)];
    var vector1 = new util.Vector(1,1);
    var vecSub = math.subtract(vecArray,vector1);
    assert.ok(vecSub[0].x === 1);
    assert.ok(vecSub[0].y === 1);

    //vector from vector
    var vector2 = new util.Vector(5,5);
    var newVec = math.subtract(vector2,vector1);
    assert.ok(newVec.x === 4);
    assert.ok(newVec.y === 4);

    //vector from number
    var newNum = math.subtract(vector2,4);
    assert.ok(newNum.x === 1);
    assert.ok(newNum.y === 1);

    //number from number
    var num = math.subtract(4,3);
    assert.ok(num === 1);
});
QUnit.test('multiply',function(assert){
    var math = runtime.math;
    var array = [2,3,4];

    //number by number
    assert.ok(math.multiply(4,3) === 12);

    //array by number
    var arrMult = math.multiply(array,2);
    assert.ok(arrMult[0] === 4);
    assert.ok(arrMult[2] == 8);

    //array by vector
    var vecMult = math.multiply(array,new util.Vector(1,1));
    assert.ok(vecMult[0].x === 2);
    assert.ok(vecMult[0].y === 2);

    //vector by number
    var vec = math.multiply(new util.Vector(1,1),5);
    assert.ok(vec.x === 5);
    assert.ok(vec.y === 5);

    //vector by vector
    var dotProd = math.multiply(new util.Vector(1,1), new util.Vector(4,4));
    assert.ok(dotProd === 8);

    //number by vector
    var newVec = math.multiply(4,new util.Vector(1,1));
    assert.ok(newVec.x === 4);
    assert.ok(newVec.y === 4);

});
QUnit.test('divide',function(assert){
    var math = runtime.math;

    //array by number
    var array = [2,4,6];
    var arrDiv = math.divide(array,2);
    assert.ok(arrDiv[2] === 3);

    //vector by number
    var vec = new util.Vector(4,4);
    var vecDiv = math.divide(vec,2);
    assert.ok(vecDiv.x === 2);
    assert.ok(vecDiv.y === 2);

    //number by number
    assert.ok(math.divide(4,2) === 2);
    //assert.ok(math.divide(4,0) === NaN);

});
QUnit.test('equal',function(assert){
    var math = runtime.math;

    //numbers
    assert.ok(math.equal(5,5));

    //vectors
    var vec = new util.Vector(1,1);
    assert.ok(math.equal(vec,vec));

    //arrays
    var array = [2,2,2];
    assert.ok(math.equal(array,array));

});
QUnit.test('notequal',function(assert){
    var math = runtime.math;

    //numbers
    assert.ok(math.notEqual(4,2));

    //vectors
    assert.ok(math.notEqual(new util.Vector(1,1),new util.Vector(1,1)));

    //arrays
    assert.ok(math.notEqual([2,2,2],[2,2,2]));

});
QUnit.test('lessthan',function(assert){
    var math = runtime.math;

    //numbers
    assert.ok(math.lt(5,8));
    assert.raises(math.lt(8,8));

    //dates
    var date1 = new Date(1990,3,4);
    var date2 = new Date(1995,5,3);
    assert.ok(math.lt(date1,date2));
    assert.raises(math.lt(date1,date1));

});
QUnit.test('lessthanequal',function(assert){
    var math = runtime.math;

    //numbers
    assert.ok(math.lte(5,7));
    assert.ok(math.lte(4,4));

    //dates
    var date1 = new Date(1990,3,4);
    var date2 = new Date(1995,5,3);
    var date3 = new Date(1990,3,4);
    assert.ok(math.lte(date1,date2));
    assert.ok(math.lte(date1,date3));

});
QUnit.test('greaterthan',function(assert){
    var math = runtime.math;

    //numbers
    assert.ok(math.gt(8,5));
    assert.raises(math.gt(8,8));

    //dates
    var date1 = new Date(1990,3,4);
    var date2 = new Date(1995,5,3);
    assert.ok(math.gt(date2,date1));
    assert.raises(math.gt(date1,date1));

});
QUnit.test('greaterthanequal',function(assert){
    var math = runtime.math;

    //numbers
    assert.ok(math.gte(7,5));
    assert.ok(math.gte(4,4));

    //dates
    var date1 = new Date(1990,3,4);
    var date2 = new Date(1995,5,3);
    var date3 = new Date(1990,3,4);
    assert.ok(math.gte(date2,date1));
    assert.ok(math.gte(date1,date3));

});
QUnit.test('mod',function(assert){
    var math = runtime.math;

    assert.ok(math.mod(4,2) === 0);
    assert.ok(math.mod(4,3) === 1);
});
QUnit.test('round',function(assert){
    var math = runtime.math;

    assert.ok(math.round(4.5632) === 5);
    assert.ok(math.round(3.21232) === 3);
});
QUnit.test('abs',function(assert){
    var math = runtime.math;

    assert.ok(math.abs(5.32) === 5.32);
    assert.ok(math.abs(-4.5) === 4.5);
});
QUnit.test('sgn',function(assert){
    var math = runtime.math;

    assert.ok(math.sgn(5.32) === 1);
    assert.ok(math.sgn(-4.33) === -1);
});
QUnit.test('floor',function(assert){
    var math = runtime.math;

    assert.ok(math.floor(4.9999) === 4);
    assert.ok(math.floor(-3.9999) === -4);
});
QUnit.test('ceiling',function(assert){
    var math = runtime.math;

    assert.ok(math.ceil(4.1) === 5);
    assert.ok(math.ceil(-5.1) === -5);
});
QUnit.test('sqrt',function(assert){
    var math = runtime.math;

    assert.ok(math.sqrt(16) === 4);
    //assert.ok(math.sqrt(-4) === NaN);
});
QUnit.test('cbrt',function(assert){
    var math = runtime.math;

    assert.ok(math.cbrt(8) === 2);
    //assert.ok(math.cbrt(-8) === NaN);
});
QUnit.test('root',function(assert){
    var math = runtime.math;

    assert.ok(math.root(16,4) === 2);
    //assert.ok(math.root(-16,4) === NaN);
});
QUnit.test('log',function(assert){
    var math = runtime.math;

    assert.ok(math.log(50,10) === 1.6989700043360185);
});
QUnit.test('max',function(assert){
    var math = runtime.math;
    var array1 = [4,6,2,1,7];
    var array2 = [-4,-1,-10];

    assert.ok(math.max(array1) === 7);
    assert.ok(math.max(array2) === -1);
});
QUnit.test('min',function(assert){
    var math = runtime.math;
    var array1 = [4,1,6,4];
    var array2 = [-1,-6,-11];

    assert.ok(math.min(array1) === 1);
    assert.ok(math.min(array2) === -11);
});
QUnit.test('cos',function(assert){
    var math = runtime.math;

    assert.ok(math.cos(45) === 0.7071067811865476);
});
QUnit.test('sin',function(assert){
    var math = runtime.math;

    assert.ok(math.sin(45) === 0.7071067811865475);
});
QUnit.test('tan',function(assert){
    var math = runtime.math;

    assert.ok(math.tan(45) === 0.9999999999999999);
});
QUnit.test('asin',function(assert){
    var math = runtime.math;

    assert.ok(math.asin(45) === 0.9033391107665127);
});
QUnit.test('acos',function(assert){
    var math = runtime.math;

    assert.ok(math.acos(45) === 0.6674572160283838);
})
QUnit.test('atan',function(assert){
    var math = runtime.math;

    assert.ok(math.atan(45) === 0.6657737500283538);
});
QUnit.test('pow',function(assert){
    var math = runtime.math;

    assert.ok(math.pow(2,3) === 8);
});
QUnit.test('pi',function(assert){
    var math = runtime.math;

    assert.ok(math.pi() === 3.141592653589793);
});
QUnit.test('e',function(assert){
    var math = runtime.math;

    assert.ok(math.e() === 2.718281828459045);
});
QUnit.test('tau',function(assert){
    var math = runtime.math;

    assert.ok(math.tau() === 6.283185307179586);
});
QUnit.test('deg2rad',function(assert){
    var math = runtime.math;

    assert.ok(math.deg2rad(45) === 0.7853981633974483);
});
QUnit.test('rad2deg',function(assert){
    var math = runtime.math;

    assert.ok(math.rad2deg(0.7853981633974483) === 45);
});
QUnit.test('stringtonumber',function(assert){
    var math = runtime.math;
    var string = math.stringToNumber("50");
    assert.ok(string === 50);
});
/* TODO: random */

/* vectors */

var iota = 0.0001;

QUnit.module('vectors');
QUnit.test('create', function(assert){
    var vec = new util.Vector(1,1);
    assert.ok(vec, 'Vector must exist');
    assert.strictEqual(vec.x, 1, 'X should be 1 here');
    assert.strictEqual(vec.y, 1, 'Y should be 1 here');
});
QUnit.test('utilities', function(assert){
    assert.strictEqual(util.deg2rad(180), Math.PI, '180 degrees == PI radians');
    assert.strictEqual(util.rad2deg(Math.PI / 2), 90, 'Half PI radians == 90 degrees');
    var v1 = new util.Vector(1,0);
    var v2 = new util.Vector(0,1);
    assert.strictEqual(util.angle(v1,v2), -Math.PI / 2, 'Angle between <1,0> and <0,1> should be -PI/2');
});
QUnit.test('fromPolar', function(assert){
    var vec = util.Vector.fromPolar(90, 1);
    assert.fuzzyEqual(vec.x, 0, iota); // Probably all floating-point tests should use this pattern
    assert.strictEqual(vec.y, 1);
});
QUnit.test('magnitude', function(assert){
    var vec = new util.Vector(3,4);
    assert.strictEqual(vec.magnitude(), 5);
});
QUnit.test('radians', function(assert){
    assert.fuzzyEqual(new util.Vector(1,0).radians(), 0, iota);
    assert.fuzzyEqual(new util.Vector(0,1).radians(), Math.PI/2, iota);
    assert.fuzzyEqual(new util.Vector(-1,0).radians(), Math.PI, iota);
});
QUnit.test('degrees', function(assert){
    assert.fuzzyEqual(new util.Vector(1,0).degrees(), 0, iota);
    assert.fuzzyEqual(new util.Vector(0,1).degrees(), 90, iota);
    assert.fuzzyEqual(new util.Vector(-1,0).degrees(), 180, iota);
});
QUnit.test('normalize', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).normalize().x, 1, iota);
    assert.fuzzyEqual(new util.Vector(0,5).normalize().y, 1, iota);
});
QUnit.test('rotateTo', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).rotateTo(0).x, 5, iota);
    assert.fuzzyEqual(new util.Vector(0,5).rotateTo(90).y, 5, iota);
});
QUnit.test('rotate', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).rotate(90).y, 5, iota);
    assert.fuzzyEqual(new util.Vector(5,0).rotate(-90).y, -5, iota);
});
QUnit.test('rotateRads', function(assert){
    assert.fuzzyEqual(new util.Vector(5,0).rotateRads(Math.PI/2).y, 5, iota);
    assert.fuzzyEqual(new util.Vector(5,0).rotateRads(-Math.PI/2).y, -5, iota);
});
QUnit.test('toString', function(assert){
    assert.strictEqual(new util.Vector(5,0).toString(), '<5,0>');
    assert.strictEqual(new util.Vector(0,5).toString(), '<0,5>');
});

/* TODO: objects */

/* This should get rid of testing errors caused by Google Analytics*/
var _gaq = _gaq || [];

QUnit.module('objects');
QUnit.test('empty', function (assert) {
    var object = runtime.object;

    // you guys, is this test even... like... does it even?
    assert.ok(object.empty() instanceof Object,
              'Creating an empty object');
    assert.strictEqual(Object.keys(object.empty()).length, 0,
                       "Checking that it's actually empty");
});

QUnit.test('create', function (assert) {
    var object = runtime.object;

    // omigosh you guys. like, omigosh
    var o1 = object.create(['hi', 'immakitty'], [1, 2], [true, false]);

    assert.ok(o1 instanceof Object,
              'Creating an object');
    assert.strictEqual(Object.keys(o1).length, 3,
                       'Asserting it has three keys');
    assert.strictEqual(o1.hi, 'immakitty');
    assert.strictEqual(o1['1'], 2);
    assert.strictEqual(o1['true'], false);
});

QUnit.test('getValue', function (assert) {
    var object = runtime.object;

    var o1 = object.create(['hi', 'immakitty'], [1, 2], [true, false]);

    assert.strictEqual(object.getValue(o1, 'hi'), 'immakitty',
                       'Got element one');
    assert.strictEqual(object.getValue(o1, '1'), 2,
                       'Got element two');
    assert.strictEqual(object.getValue(o1, 'true'), false,
                       'Got element three');
});

QUnit.test('getKeys', function (assert) {
    var object = runtime.object;

    var o1 = object.create(['hi', 'immakitty'], [1, 2], [true, false]);
    var actual = object.getKeys(o1);
    var expected = ['hi', '1', 'true'];
    assert.deepEqual(actual.sort(), expected.sort(),
                     'Retrieved the keys in insertion order');
});

QUnit.module('strings');
QUnit.test('toString', function(assert) {
    var str = runtime.string;

    //TODO -- test each individual toString is correct as well
    //colour (is just a string for now)
    var shape = new util.Shape(function(ctx){
                    ctx.beginPath();
                    ctx.arc(50, 50, 10, 0, Math.PI * 2, true);
                });
    var geolocation = mockLocation({
        latitude: 43.662108,
        longitude: -79.380023,
        altitude: 76,
        heading: 337.89,
        speed: 1.0
    });

    var piStr = str.toString(4);
    var niStr = str.toString(-2);
    var fpStr = str.toString(6.5969);
    var blnStr = str.toString(true);
    var strStr = str.toString("hello");
    // var pointStr = str.toString(new util.Point(4,-7));
    var vecStr = str.toString(new util.Vector(50,100));
    var shapeStr = str.toString(shape);
    var sprStr = str.toString(new util.Sprite(shape));
    var rectStr = str.toString(new util.Rect(50, 100, 70, 30));
    var sizeStr = str.toString(new util.Size(100, "px", 50, "px"));
    var arrStr = str.toString([1, 0, -5, 1000]);
    var geoStr = str.toString(geolocation);
    var imgStr = str.toString(new util.WBImage("path/image.jpg", function(){}));

    assert.ok(typeof(piStr) === 'string' || piStr instanceof String, 'positive integer toString');
    assert.ok(typeof(niStr) === 'string' || niStr instanceof String, 'negative integer toString');
    assert.ok(typeof(fpStr) === 'string' || fpStr instanceof String, 'floating point toString');
    assert.ok(typeof(blnStr) === 'string' || blnStr instanceof String, 'boolean toString');
    assert.ok(typeof(strStr) === 'string' || strStr instanceof String, 'string toString');
    // assert.ok(typeof(pointStr) === 'string' || pointStr instanceof String, 'point toString');
    assert.ok(typeof(vecStr) === 'string' || vecStr instanceof String, 'vector toString');
    assert.ok(typeof(shapeStr) === 'string' || shapeStr instanceof String, 'shape toString');
    assert.ok(typeof(sprStr) === 'string' || sprStr instanceof String, 'sprite toString');
    assert.ok(typeof(rectStr) === 'string' || rectStr instanceof String, 'rect toString');
    assert.ok(typeof(sizeStr) === 'string' || sizeStr instanceof String, 'size toString');
    assert.ok(typeof(arrStr) === 'string' || arrStr instanceof String, 'array toString');
    assert.ok(typeof(geoStr) === 'string' || geoStr instanceof String, 'geolocation toString');
    assert.ok(typeof(imgStr) === 'string' || imgStr instanceof String, 'image toString');
});
QUnit.test('split', function(assert) {
   var string = runtime.string;

    var s1 = "test,string,split";
    var s2 = "";
    var s3 = "noseparator"
    var s4 = "test split on different separator and longer string test"

    var s1Split = string.split(s1, ',');
    var s2Split = string.split(s2, " ");
    var s3Split = string.split(s3, " ");
    var s4Split = string.split(s4, " ");

    assert.deepEqual(s1Split, ["test", "string", "split"], 'splitting short string on comma');
    assert.deepEqual(s2Split, [""], 'splitting empty string');
    assert.deepEqual(s3Split, ["noseparator"], 'splitting string with no separator');
    assert.deepEqual(s4Split, ["test", "split", "on", "different", "separator","and", "longer", "string", "test"], 'splitting long string on space');
});
QUnit.test('concatenate', function(assert) {
    var string = runtime.string;

    var s1 = "string1";
    var s2 = "string2";
    var s3 = "";

    var c1 = string.concatenate(s1, s2);
    var c2 = string.concatenate(s1, s3);
    var c3 = string.concatenate(s3, s3);

    assert.equal(c1, "string1string2", 'concatenate two strings');
    assert.equal(c2, "string1", 'concatenate with empty string');
    assert.equal(c3, "", 'concatenate two empty strings');

});
QUnit.test('repeat', function(assert){
    var string = runtime.string;

    var s = "string";

    var r0 = string.repeat(s,0);
    var r1 = string.repeat(s,1);
    var r3 = string.repeat(s,3);
    var rNeg = string.repeat(s,-5);

    assert.equal(r0, "", 'repeat 0 times');
    assert.equal(r1, "string", 'repeat 1 time');
    assert.equal(r3, "stringstringstring", 'repeat 3 times');
    assert.equal(rNeg, "", 'repeat negative times');

});
QUnit.test('getChar', function(assert){
    var string = runtime.string;

    var s = "here is my string";

    var c1 = string.getChar(0, s);
    var c5 = string.getChar(4, s);
    var cNeg = string.getChar(-4, s);
    var cLarge = string.getChar(100, s);

    assert.equal(c1, "h", 'get first character');
    assert.equal(c5, " ", 'get character at index 4');
    assert.equal(cNeg, "r", 'get character at negative position');
    assert.equal(cLarge, "", 'get out of bounds character');
});
QUnit.test('getCharFromEnd', function(assert){
    var string = runtime.string;

    var s = "here is my string";

    var c1 = string.getCharFromEnd(1, s);
    var c5 = string.getCharFromEnd(5, s);
    var cNeg = string.getCharFromEnd(-4, s);
    var cLarge = string.getCharFromEnd(100, s);

    assert.equal(c1, "g", 'get first character from end');
    assert.equal(c5, "t", 'get fifth character from end');
    assert.equal(cNeg, "e", 'get negative character position');
    assert.equal(cLarge, "", 'get out of bounds character');

});
QUnit.test('substring', function(assert){
    var string = runtime.string;

    var s = "here is my string";

    var sStart = string.substring(s, 0, 4);
    var sMid = string.substring(s, 5, 6);
    var cNegStart = string.substring(s, -4, 10);
    var cNegLength = string.substring(s, 4, -6);
    var cStartOut = string.substring(s, 100, 4);
    var cLengthOut = string.substring(s, 0, 100);

    assert.equal(sStart, "here", 'substring from start');
    assert.equal(sMid, "is my ", 'substring from middle');
    assert.equal(cNegStart, "", 'substring with negative start position');
    assert.equal(cNegLength, "here", 'substring with negative length');
    assert.equal(cStartOut, "", 'substring with out of bounds start position');
    assert.equal(cLengthOut, "here is my string", 'substring with length too long');
});
QUnit.test('substring2', function(assert){
    var string = runtime.string;

    var s = "here is my string";

    var sStart = string.substring2(s, 0, 4);
    var sMid = string.substring2(s, 5, 10);
    var cNegStart = string.substring2(s, -4, 10);
    var cNegLength = string.substring2(s, 0, -4);
    var cStartOut = string.substring2(s, 100, 4);
    var cLengthOut = string.substring2(s, 0, 100);

    assert.equal(sStart, "here", 'substring from start');
    assert.equal(sMid, "is my", 'substring from middle');
    assert.equal(cNegStart, "", 'substring with negative start position');
    assert.equal(cNegLength, "", 'substring with negative length');
    assert.equal(cStartOut, "", 'substring with out of bounds start position');
    assert.equal(cLengthOut, "here is my string", 'substring with end out of bounds');
});
QUnit.test('isSubstring', function(assert){
    var string = runtime.string;

    var s = "here is my string";

    var b1 = string.isSubstring("here", s);
    var b2 = string.isSubstring("ing", s);
    var b3 = string.isSubstring("not a sub", s);
    var b4 = string.isSubstring("ingNo", s);

    assert.ok(b1, 'substring from start');
    assert.ok(b2, 'substring from end');
    assert.ok(!b3, 'not substring');
    assert.ok(!b4, 'not substring');
});
QUnit.test('substringPosition', function(assert){
    var string = runtime.string;

    var s = "here is my string";

    var p1 = string.substringPosition("here", s);
    var p2 = string.substringPosition("ing", s);
    var p3 = string.substringPosition("not a sub", s);
    var p4 = string.substringPosition("ingNo", s);
    var p5 = string.substringPosition("e", s);

    assert.equal(p1, 0, 'substring from start');
    assert.equal(p2, 14, 'substring from end');
    assert.equal(p3, -1, 'not substring');
    assert.equal(p4, -1, 'not substring');
    assert.equal(p5, 1, 'substring appears twice');
});
QUnit.test('replaceSubstring', function(assert){
    var string = runtime.string;

    var s = "here is my string";

    var s1 = string.replaceSubstring(s, "here is", "that was");
    var s2 = string.replaceSubstring(s, "string", "test method for replaceSubstring");
    var s3 = string.replaceSubstring(s, "not a sub", "no replacement");
    var s4 = string.replaceSubstring(s, "ingNo", "no replacement");
    var s5 = string.replaceSubstring(s, "e", "ee");
    var s6 = string.replaceSubstring(s, " my", "");

    assert.equal(s1, "that was my string", 'substring from start');
    assert.equal(s2, "here is my test method for replaceSubstring", 'substring from end');
    assert.equal(s3, "here is my string", 'not substring');
    assert.equal(s4, "here is my string", 'not substring');
    assert.equal(s5, "heeree is my string", 'substring appears twice');
    assert.equal(s6, "here is string", 'replace with empty string');
});
QUnit.test('trimWhitespace', function(assert){
    var string = runtime.string;

    var s1 = "nowhitespace";
    var s2 = "none to trim";
    var s3 = "      leading whitespace";
    var s4 = "trailing whitespace      ";
    var s5 = "      both whitespace      ";
    var s6 = "middle        whitespace";

    var t1 = string.trimWhitespace(s1);
    var t2 = string.trimWhitespace(s2);
    var t3 = string.trimWhitespace(s3);
    var t4 = string.trimWhitespace(s4);
    var t5 = string.trimWhitespace(s5);
    var t6 = string.trimWhitespace(s6);

    assert.equal(t1, "nowhitespace", 'no whitespace');
    assert.equal(t2, "none to trim", 'only spaces');
    assert.equal(t3, "leading whitespace", 'leading whitespace');
    assert.equal(t4, "trailing whitespace", 'trailing whitespace');
    assert.equal(t5, "both whitespace", 'leading and trailing whitespace');
    assert.equal(t6, "middle        whitespace", 'whitespace in middle');
});
QUnit.test('uppercase', function(assert){
    var string = runtime.string;

    var s1 = "all lowercase";
    var s2 = "sOmE lOwErCaSe";
    var s3 = "ALL UPPERCASE";
    var s4 = "";

    var c1 = string.uppercase(s1);
    var c2 = string.uppercase(s2);
    var c3 = string.uppercase(s3);
    var c4 = string.uppercase(s4);

    assert.equal(c1, "ALL LOWERCASE", 'all lowercase');
    assert.equal(c2, "SOME LOWERCASE", 'some lowercase');
    assert.equal(c3, "ALL UPPERCASE", 'all uppercase');
    assert.equal(c4, "", 'empty string');

});
QUnit.test('lowercase', function(assert){
    var string = runtime.string;

    var s1 = "all lowercase";
    var s2 = "sOmE lOwErCaSe";
    var s3 = "ALL UPPERCASE";
    var s4 = "";

    var c1 = string.lowercase(s1);
    var c2 = string.lowercase(s2);
    var c3 = string.lowercase(s3);
    var c4 = string.lowercase(s4);

    assert.equal(c1, "all lowercase", 'all lowercase');
    assert.equal(c2, "some lowercase", 'some lowercase');
    assert.equal(c3, "all uppercase", 'all uppercase');
    assert.equal(c4, "", 'empty string');

});
QUnit.test('matches', function(assert){
    var string = runtime.string;

    var s1 = "string1";
    var s2 = "string2";
    var s3 = "str";
    var s4 = "";

    var b1 = string.matches(s1, s1);
    var b2 = string.matches(s1, s2);
    var b3 = string.matches(s1, s3);
    var b4 = string.matches(s1, s4);
    var b5 = string.matches(s4, s1);

    assert.ok(b1, 'same string');
    assert.ok(!b2, 'different string');
    assert.ok(!b3, 'substring');
    assert.ok(!b4, 'string matches empty string');
    assert.ok(!b5, 'empty string matches string');
});
QUnit.test('doesntMatch', function(assert){
    var string = runtime.string;

    var s1 = "string1";
    var s2 = "string2";
    var s3 = "str";
    var s4 = "";

    var b1 = string.doesntMatch(s1, s1);
    var b2 = string.doesntMatch(s1, s2);
    var b3 = string.doesntMatch(s1, s3);
    var b4 = string.doesntMatch(s1, s4);
    var b5 = string.doesntMatch(s4, s1);

    assert.ok(!b1, 'same string');
    assert.ok(b2, 'different string');
    assert.ok(b3, 'substring');
    assert.ok(b4, 'string matches empty string');
    assert.ok(b5, 'empty string matches string');
});
QUnit.test('startsWith', function(assert){
    var string = runtime.string;

    var s1 = "string1";
    var s2 = "string2";
    var s3 = "str";
    var s4 = "";
    var s5 = "string1longer"

    var b1 = string.startsWith(s1, s1);
    var b2 = string.startsWith(s1, s2);
    var b3 = string.startsWith(s1, s3);
    var b4 = string.startsWith(s1, s4);
    var b5 = string.startsWith(s1, s5);

    assert.ok(b1, 'same string');
    assert.ok(!b2, 'different string');
    assert.ok(b3, 'substring');
    assert.ok(b4, 'string starts with empty string');
    assert.ok(!b5, 'string starts with same string but longer');
});
QUnit.test('endsWith', function(assert){
    var string = runtime.string;

    var s1 = "string1";
    var s2 = "string2";
    var s3 = "ing1";
    var s4 = "";
    var s5 = "longerstring1"

    var b1 = string.endsWith(s1, s1);
    var b2 = string.endsWith(s1, s2);
    var b3 = string.endsWith(s1, s3);
    var b4 = string.endsWith(s1, s4);
    var b5 = string.endsWith(s1, s5);

    assert.ok(b1, 'same string');
    assert.ok(!b2, 'different string');
    assert.ok(b3, 'substring');
    assert.ok(b4, 'string starts with empty string');
    assert.ok(!b5, 'string starts with same string but longer');
});

// QUnit.module('points');
// QUnit.test('create', function (assert) {
//     var point = runtime.point;
//
//     var p1 = point.create(1, 5);
//     var p2 = point.create(-4, 20);
//
//     assert.ok(p1 instanceof util.Point, 'Creating a point from coordinates');
//     assert.ok(p2 instanceof util.Point, 'Creating a point from negative coordinates');
// });

// QUnit.test('fromVector', function (assert) {
//     var point = runtime.point;
//
//     var zero = new util.Vector(0, 0);
//     var identity = new util.Vector(1, 1);
//     var negVector = new util.Vector(-1, -1);
//
//     var p1 = point.fromVector(zero);
//     var p2 = point.fromVector(identity);
//     var p3 = point.fromVector(negVector);
//
//     assert.ok(p1 instanceof util.Point, 'Creating a point from zero vector');
//     assert.ok(p2 instanceof util.Point, 'Creating a point from identity vector');
//     assert.ok(p3 instanceof util.Point, 'Creating a point from negative vector');
// });

// QUnit.test('fromArray', function (assert) {
//     var point = runtime.point;
//
//     QUnit.ok(point.fromArray([4, 5]) instanceof util.Point,
//              'Creating a point from an array');
//     QUnit.throws(
//         function () { rect.fromArray([1]); },
//         'Creating from an array with less than two elements should throw'
//     );
// });

// QUnit.test('x', function (assert) {
//     var point = runtime.point;
//
//     var p1 = new util.Point(2, 3);
//     var x = point.x(p1);
//
//     assert.equal(x, 2, 'Getting the x position of a point');
// });

// QUnit.test('y', function (assert) {
//     var point = runtime.point;
//
//     var p1 = new util.Point(2, 3);
//     var y = point.y(p1);
//
//     assert.equal(y, 3, 'Getting the y position of a point');
// });

// QUnit.test('toArray', function (assert) {
//     var point = runtime.point;
//
//     var p1 = new util.Point(2, 3);
//     var array = point.toArray(p1);
//
//     assert.deepEqual(array, [2,3], 'Getting array from point');
// });



QUnit.module('rect');
QUnit.test('fromCoordinates', function (assert) {
    var rect = runtime.rect;

    var r1 = rect.fromCoordinates(-1, -2, 1, 1);

    assert.ok(r1 instanceof util.Rect,
              'Creating a rect from coordinates');
    assert.throws(
        function () {
            rect.fromCoordinates(0, 0, -1, 1);
        },
        'Creating a rect with negative width throws'
    );
    assert.throws(
        function () {
            rect.fromCoordinates(0, 0, 0, -1);
        },
        'Creating a rect with negative height throws'
    );
});

QUnit.test('fromVectors', function (assert) {
    var rect = runtime.rect;

    var zero = new util.Vector(0, 0);
    var identity = new util.Vector(1, 1);
    var negVector = new util.Vector(-1, -1);

    var r1 = rect.fromVectors(zero, identity);

    assert.ok(r1 instanceof util.Rect,
              'Creating a rect from vectors');
    assert.throws(
        function () {
            rect.fromVectors(zero, negVector);
        },
        'Creating a rect with negative size throws'
    );
});

QUnit.test('fromArray', function (assert) {
    var rect = runtime.rect;

    QUnit.ok(rect.fromArray([0, 0, 1, 1]) instanceof util.Rect,
             'Creating a Rect from an array');
    QUnit.throws(
        function () { rect.fromArray([1,2,3]); },
        'Creating from an array with less than four elements should throw'
    );
});


QUnit.test('getPosition', function (assert) {
    var rect = runtime.rect;

    var r1 = rect.fromCoordinates(37, 42, 1, 1);
    var position = rect.getPosition(r1);

    assert.ok(position instanceof util.Vector,
             'Position is returned as a Vector');
    assert.strictEqual(position.x, 37);
    assert.strictEqual(position.y, 42);
});

QUnit.test('getSize', function (assert) {
    var rect = runtime.rect;

    var r1 = rect.fromCoordinates(0, 0, 536, 231);
    var size = rect.getSize(r1);

    assert.ok(size instanceof util.Size,
             'Size is returned as a Size');
    assert.strictEqual(size.width, 536);
    assert.strictEqual(size.height, 231);
});

QUnit.test('asArray', function (assert) {
    var rect = runtime.rect;

    var r1 = rect.fromVectors(new util.Vector(0, 0), new util.Vector(1, 1));

    assert.deepEqual(rect.asArray(r1), [0, 0, 1, 1],
             'Rect can be returned as an array');
});

// Four methods combined into one!
QUnit.test('get{X,Y,Width,Height}', function (assert) {
    var rect = runtime.rect;

    var r1 = rect.fromVectors(new util.Vector(37, 42),
                              new util.Vector(536, 231));

    assert.strictEqual(rect.getX(r1), 37,
             'getX works');
    assert.strictEqual(rect.getY(r1), 42,
             'getY works');
    assert.strictEqual(rect.getWidth(r1), 536,
             'getWidth works');
    assert.strictEqual(rect.getHeight(r1), 231,
             'getHeight works');
});


/* TODO: sensing */
/* TODO: motion */
/* TODO: shapes */

QUnit.module('Geolocation');
QUnit.testBrowser('currentLocation', function (assert) {
    var geolocation = runtime.geolocation,
        lat = 53.526748,
        lon = -113.527410,
        alt = 645;

    assert.expect(4);

    /* First, stub the API... */
    var stub;

    if (navigator.geolocation) {
        /* On user agents with geolocation. */
        stub = sinon.stub(navigator.geolocation, 'watchPosition');
    } else {
        /* Create the API if it does not exist (like on PhantomJS). */
        stub = sinon.stub();
        navigator.geolocation = {
            watchPosition: stub,
            clearWatch: function () {}
        };
    }

    stub.callsArgWithAsync(0, mockLocation({
            latitude: lat,
            longitude: lon,
            altitude: alt
        }));

    /* Subscribe to the locationchanged event... */
    var done = assert.async();
    Event.on(window, 'test:locationchanged', null, function () {
        var location = geolocation.currentLocation();
        assert.strictEqual(location.coords.latitude, lat,
                           'API returned expected latitude');
        assert.strictEqual(location.coords.longitude, lon,
                           'API returned expected longitude');
        assert.strictEqual(location.coords.altitude, alt,
                           'API returned expected altitude');
        done();
    });

    /* Before we get the ball rolling, though, make sure currentLocation is
     * initial null. */
    assert.strictEqual(util.geolocation.currentLocation, null,
                       'Current location starts null');

    util.geolocation.startTrackingLocation();
    if (stub.restore) {
        stub.restore();
    }
});

QUnit.test('distanceBetween', function (assert) {
    var geolocation = runtime.geolocation;
    var distance;

    var pointA = mockLocation({latitude: 53.526748, longitude: -113.527410});
    var pointB = mockLocation({latitude: 43.662108, longitude: -79.380023});
    var pointC = mockLocation({latitude: 53.523256, longitude: -113.512348});
    var pointD = mockLocation({latitude: 21.882504, longitude: 33.710796});

    var actual = 2710127.747;

    // Answers found using:
    // http://www.daftlogic.com/projects-google-maps-distance-calculator.htm
    distance = geolocation.distanceBetween(pointA, pointA);
    assert.fuzzyEqual(distance, 0, 10, // ±10 m
                      'Distance between the same point');
    distance = geolocation.distanceBetween(pointA, pointB);
    assert.fuzzyEqual(distance, actual, 4000, // ±4 km
                      'Distance between points across Canada');
    distance = geolocation.distanceBetween(pointA, pointC);
    assert.fuzzyEqual(distance, 1058.173, 20, // ±20 m
                      'Distance between points around 1 km');
    distance = geolocation.distanceBetween(pointA, pointD);
    assert.fuzzyEqual(distance, 11070578.184, 25000, // ±25 km
                      'Distance between points across the world');
});

QUnit.test('[getters]', function (assert) {
    var geolocation = runtime.geolocation;
    var location = mockLocation({
        latitude: 43.662108,
        longitude: -79.380023,
        altitude: 76,
        heading: 337.89,
        speed: 1.0
    });

    assert.fuzzyEqual(geolocation.latitude(location), 43.662108, 0.0625,
                        'Fetch latitude as decimal string');
    assert.fuzzyEqual(geolocation.longitude(location), -79.380023, 0.0625,
                        'Fetch longitude as decimal string');
    assert.fuzzyEqual(geolocation.altitude(location), 76, 1,
                        'Fetch altitude as double');
    assert.fuzzyEqual(geolocation.speed(location), 1.0, 5,
                        'Fetch speed in m/s');
    assert.fuzzyEqual(geolocation.heading(location), 338.0, 5,
                        'Fetch speed in degrees');
});

/* Creates a violation object, as if created by the API itself. */
function mockLocation(options) {
    if (!options) options = {};

    var location = {
        // https://developer.mozilla.org/en-US/docs/Web/API/Coordinates
        coords: {
            latitude: options.latitude || "40.714224",
            longitude: options.longitude || "-73.961452",
            // In meters.
            altitude: options.altitude || null,
            // In meters.
            accuracy: options.accuracy || 645,
            // In meters.
            altitudeAccuracy: options.altitudeAccuracy || 100,
            // Specified in degrees. Can be NaN (when there is no speed) and null -_-.
            heading: options.heading || NaN,
            // In m/s. Can be null.
            speed: options.speed || 0,
        },
        timestamp: options.timestamp || Date.now()
    };

    return location;
}

QUnit.module('date');
QUnit.test('create',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000, 01, 01);
    var date2 = new Date("Jan 01 2000");

    var date3 = date.create(2000, 01, -1);
    var date4 = new Date("Dec 30 1999");

    var date5 = date.create(2000, -1, 01);
    var date6 = new Date("Nov 01 1999");

    var date7 = date.create(0, 01, 01);
    var date8 = new Date("Jan 01 1900");

    assert.ok(date1.valueOf() === date2.valueOf());
    assert.ok(date3.valueOf() === date4.valueOf());
    assert.ok(date5.valueOf() === date6.valueOf());
    assert.ok(date7.valueOf() === date8.valueOf());
});

QUnit.test('now',function(assert){
    var date = runtime.date;

    var today = date.now();
    var day = new Date();
    day.setHours(0,0,0,0);

    assert.ok(today.valueOf() === day.valueOf());
});

QUnit.test('addDays',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var date2 = new Date("Jan 20 2000");
    var date5 = new Date("Dec 27 1999");

    var date3 = date.addDays(date1, 19);
    var date4 = date.addDays(date1, -5);

    assert.ok(date3.valueOf() === date2.valueOf());
    assert.ok(date4.valueOf() === date5.valueOf());
});

QUnit.test('addMonths',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var date2 = new Date("May 01 2000");
    var date5 = new Date("Nov 01 1999");

    var date3 = date.addMonths(date1, 4);
    var date4 = date.addMonths(date1, -2);

    assert.ok(date3.valueOf() === date2.valueOf());
    assert.ok(date4.valueOf() === date5.valueOf());
});

QUnit.test('addYears',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var date2 = new Date("Jan 01 2010");
    var date5 = new Date("Jan 01 1990");

    var date3 = date.addYears(date1, 10);
    var date4 = date.addYears(date1, -10);

    assert.ok(date3.valueOf() === date2.valueOf());
    assert.ok(date4.valueOf() === date5.valueOf());
});

QUnit.test('dayOfWeek',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var day1 = date.dayOfWeek(date1);

    var date2 = date.create(2000,01,03);
    var day2 = date.dayOfWeek(date2);

    assert.ok(day1 === 6);
    assert.ok(day2 === 1);
});

QUnit.test('getDay',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var day1 = date.getDay(date1);

    var date2 = date.create(2000,01,25);
    var day2 = date.getDay(date2);

    assert.ok(day1 === 1);
    assert.ok(day2 === 25);
});

QUnit.test('getMonth',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var month1 = date.getMonth(date1);

    var date2 = date.create(2000,10,25);
    var month2 = date.getMonth(date2);

    assert.ok(month1 === 1);
    assert.ok(month2 === 10);
});

QUnit.test('getMonthName',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var month1 = date.getMonthName(date1);

    var date2 = date.create(2000,10,25);
    var month2 = date.getMonthName(date2);

    assert.ok(month1 === "January");
    assert.ok(month2 === "October");
});

QUnit.test('getYear',function(assert){
    var date = runtime.date;

    var date1 = date.create(2000,01,01);
    var year1 = date.getYear(date1);

    var date2 = date.create(2020,10,25);
    var year2 = date.getYear(date2);

    assert.ok(year1 === 2000);
    assert.ok(year2 === 2020);
});

/* TODO: sizes */
/* TODO: text */
