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
