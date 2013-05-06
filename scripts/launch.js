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
    document.querySelector('#block_menu_load').remove();
    document.body.className = mode;
    //wb.loadCurrentScripts(q);
    // remove next line once load/save is working
    wb.createWorkspace('Workspace');
}
