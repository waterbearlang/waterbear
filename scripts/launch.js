switch(wb.view){
    case 'editor':
        $('#block_menu_load').remove();
        document.body.className = 'editor';
        //wb.loadCurrentScripts(q);
        // remove next line once load/save is working
        wb.createWorkspace('Workspace');
        break;
    case 'blocks':
        $('#block_menu_load').remove();
        document.body.className = 'blocks';
        //wb.loadCurrentScripts(q);
        // remove next line once load/save is working
        wb.createWorkspace('Workspace');
        break;
    case 'result':
        $('#block_menu_load').remove();
        document.body.className = 'result';
        //wb.runCurrentScripts(q);
        // remove next line once load/save is working
        wb.createWorkspace('Workspace');
        break;
    default:
        $('#block_menu_load').remove();
        document.body.className = 'editor';
        //wb.loadCurrentScripts(q);
        // remove next line once load/save is working
        wb.createWorkspace('Workspace');
        break;
}
