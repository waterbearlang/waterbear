// Minimal script to run on load
// Loads stored state from localStorage
// Detects mode from URL for different embed views

switch(wb.view){
    case 'editor':
    case 'blocks':
    case 'result':
        switchMode(wb.view);
        break;
    default:
        switchMode('editor');
        break;
}

function switchMode(mode){
    var loader = document.querySelector('#block_menu_load');
    loader.parentElement.removeChild(loader);
    document.body.className = mode;
    wb.loadCurrentScripts(q);
}
