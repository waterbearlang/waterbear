// jQuery-based templates
//
// context is current container
// data-if="<condition>"
// data-for="<variable> in <list>"
// data-replace="variable" // variable.view() or variable.view or variable.toString()

(function(){
	

var assert = chai.assert,
    Template = function(str){ return new template.Template({html: str}); };

assert.hequal = function(jq, h){
	assert.equal(jq.get().map(function(d){return d.outerHTML}).join(''), h);
}

suite('Template', function(){

	suite('basic template functions', function(){
		test('template is an instance of Template', function(){
			assert.instanceOf(Template('<div></div>'), template.Template);
		});
		test('template should render one element', function(){
			assert.equal(Template('<div></div>').render().length, 1);
		});
		test('Simple string replace works', function(){
			assert.hequal(Template('<div><span data-replace="foo"></span></div>').render({foo: 'bar'}), '<div>bar</div>');
		});
		test('Simple path replacement', function(){
			assert.hequal(Template('<div><span data-replace="foo.bar"></span></div>').render({foo: {bar: 'baz'}}), '<div>baz</div>');
		});
		test('Multiple replacement', function(){
			assert.hequal(Template('<div><span data-replace="one"></span>/<span data-replace="three"></span></div>').render({one: '1', three: '3'}), '<div>1/3</div>');
		});
		test('Simple if statement matches', function(){
			assert.hequal(Template('<div><span data-if="foo">bar</span></div>').render({foo: true}), '<div><span>bar</span></div>');
		});
		test('Simple if statement misses', function(){
			assert.hequal(Template('<div><span data-if="foo"></span></div>').render({bar: 'baz'}), '<div></div>');
		});
		test('Outer if statement matches', function(){
			assert.hequal(Template('<div data-if="foo">Hello</div>').render({foo: true}), '<div>Hello</div>');
		});
		test('Simple for loop', function(){
			assert.hequal(Template('<div><span data-for="bar in bars"><span data-replace="bar"></span></span></div').render({bars: ['sand', 'chocolate', 'gold']}), '<div><span>sand</span><span>chocolate</span><span>gold</span></div>');
		});
		test('Add attributes', function(){
			assert.hequal(Template('<div><span class="prisoner" data-classes="name rank serialnumber"></span></div>').render({name: 'Dashiell', rank: 'Corporal', serialnumber: 's2324343'}), '<div><span class="prisoner Dashiell Corporal s2324343"></span></div>');
		});
		test('Add attributes to base element', function(){
			assert.hequal(Template('<div class="prisoner" data-classes="name rank serialnumber"></div>').render({name: 'Dashiell', rank: 'Corporal', serialnumber: 's2324343'}), '<div class="prisoner Dashiell Corporal s2324343"></div>');
		});
		test('Add title', function(){
			assert.hequal(Template('<div data-title="definition"></div>').render({definition:'This is teh official title'}), '<div title="This is teh official title"></div>');
		});
		test('If in a for loop', function(){
			assert.hequal(Template('<div><p data-for="label in labels"><span data-if="label.title">Artemis Fowl</span></p></div>').render({labels:[{title:true}]}), '<div><p><span>Artemis Fowl</span></p></div>');
		});
		test('Replace with another jQuery node', function(){
			assert.hequal(Template('<div><span data-replace="label"></span></div>').render({label: $('<p>Label</p>')}), '<div><p>Label</p></div>');
		});
		test('Replace with jQuery nodes in a loop', function(){
			assert.hequal(Template('<div><span data-for="label in labels"><span data-replace="label"></span></span></div>').render({labels: $('<div><p>Ham</p><p>Eggs</p><p>Spam</p></div>').find('p')}), '<div><span><p>Ham</p></span><span><p>Eggs</p></span><span><p>Spam</p></span></div>');
		});
		test('replace in loop', function(){
			assert.hequal(Template('<div><span data-for="label in labels"><span data-replace="label"></span></span></div>').render({labels: ['one', 'two', 'three']}), '<div><span>one</span><span>two</span><span>three</span></div>');
		});
		test('add classes in loop', function(){
			assert.hequal(Template('<div data-for="label in labels"><span data-classes="label"></span></div>').render({labels: ['one', 'two', 'three']}), '<div><span class="one"></span></div><div><span class="two"></span></div><div><span class="three"></span></div>');
		});
		test('replace multiple elements with the same value', function(){
			assert.hequal(Template('<div data-for="label in labels"><span data-classes="label"><b data-replace="label"></b>//<i data-replace="label"></i></span></div>').render({labels: ['one', 'two', 'three']}), '<div><span class="one">one//one</span></div><div><span class="two">two//two</span></div><div><span class="three">three//three</span></div>', true);
		});
	});
	
	suite('waterbear templates', function(){
		// test('get step template from host page', function(){
		// 	assert(template('step'))
		// });
	});
	
});

})();