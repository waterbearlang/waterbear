/*
 * SCHEME PLUGIN
 *
 * Support for writing Scheme in Waterbear
 */

(function(wb,Event){
    var bscheme = new BiwaScheme.Interpreter(function(e, state) {
        console.error(e.message);
    });
    wb.runScript = function(script){
        var run = function(){
            wb.script = script;
            bscheme.evaluate(script, function(result) {
                if (result !== undefined && result !== BewaScheme.undef) {
                    console.log(BiwaScheme.to_write(result));
                }
            });
        }
        run();
    }
}
            

