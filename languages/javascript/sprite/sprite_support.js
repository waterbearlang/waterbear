/*
 *    Sprite Plugin
 *
 *    Support for building games using Waterbear
 *
 */

(function(){


// Pre-load dependencies
yepnope({
    load: [ 'plugins/sprite.css'
    ]
});

choiceLists.types = choiceLists.types.concat(['sprite']);
choiceLists.rettypes = choiceLists.rettypes.concat(['sprite']);

})();
