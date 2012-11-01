(function($){


function test_block(block){
    var name = block.data('klass') + ': ' + block.data('label');
    try{
        eval(block.wrapScript());
        return true;
    }catch(e){
        if (e.name === 'SyntaxError'){
            console.error('failed: %s, %o', name, e);
            return false;
        }else{
            return true;
        }
    }
}

function test(){
    var blocks = $('#block_menu .wrapper');
    var total = blocks.length;
    var success = 0;
    var fail = 0;
    console.info('running %d tests', total);
    blocks.each(function(idx, elem){
        setTimeout(function(){
            test_block($(elem)) ? success++ : fail++;
            if( success + fail === total){
                console.info('Ran %d tests, %d successes, %s failures', total, success, fail);
            }
        }, 10);
    });
}
window.test = test;

})(jQuery);
