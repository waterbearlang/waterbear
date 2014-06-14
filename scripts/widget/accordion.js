(function(wb){
'use strict';
// UI Chrome Section


function accordion(event){
    event.preventDefault();
    var open = document.querySelector('#block_menu .open');
    if (open){
        open.classList.remove('open');
    }
    if (open && open === event.target.nextSibling) return;
    event.target.nextSibling.classList.add('open');
}

wb.accordion = accordion;

})(wb);