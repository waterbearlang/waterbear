// jQuery-based templates
//
// context is current container
// data-if="<condition>"
// data-for="<variable> in <list>"
// data-replace="variable" // variable.view() or variable.view or variable.toString()

(function(){


var assert = chai.assert,
    Template = function(str){ return new template.Template({html: str}); };

suite('Events', function(){

    suite('check that event delegation works', function(){
        var button, container, altbutton;
        container = document.createElement('div');
        button = document.createElement('button');
        button.className = 'catch-me-if-you-can';
        altbutton = document.createElement('button');
        altbutton.className = 'cant-touch-this';
        container.appendChild(button);
        container.appendChild(altbutton);
        document.body.appendChild(container);

        test('delegated click', function(done){
            Event.on(container, 'click', '.catch-me-if-you-can', function(event){
                if (event.target.className === 'catch-me-if-you-can'){
                    done();
                }else{
                    throw new Error('wrong target: ' + event.target);
                }
            });
            button.click();
        });
    });
});

})();
