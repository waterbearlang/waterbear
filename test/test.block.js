// Test model objects for Waterbear blocks
//

(function(){

var assert = chai.assert;

var expression_template = 	{
	blocktype: 'expression',
	label: 'random x',
	type: 'number',
	script: 'randint(0,global.stage_width)',
	help: 'return a number between 0 and the stage width'
};

var step_template = {
    
};

var context_template = {
    
};

var event_handler_template = {
    
};


suite('Blocks', function(){
	suite('create an Expression', function(){
		test('block is an instance of Expression', function(){
			assert.instanceOf(Block(expression_template), Expression);
		});
        test('block is an instance of Block', function(){
            assert.instanceOf(Block(expression_template), Block);
        });
});

})();