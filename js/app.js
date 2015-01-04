(function(){
'use strict';

var feedbackElem = document.querySelector('.feedback');
function message(color, text){
    feedbackElem.style.color = color;
    feedbackElem.value = text;
}

function error(text){
    message('red', text);
}

function warn(text){
    message('orange', text);
}

function info(text){
    message('#333', text);
}

window.app = {
    message: message,
    error: error,
    warn: warn,
    info: info
};

})();
