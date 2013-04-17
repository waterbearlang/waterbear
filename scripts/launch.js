switch(wb.view){
    case 'editor':
        $('#block_menu_load').remove();
        document.body.className = 'editor';
        wb.loadCurrentScripts(q);
        break;
    case 'blocks':
        $('#block_menu_load').remove();
        document.body.className = 'blocks';
        wb.loadCurrentScripts(q);
        break;
    case 'result':
        $('#block_menu_load').remove();
        document.body.className = 'result';
        wb.runCurrentScripts(q);
        break;
    default:
        $('#block_menu_load').remove();
        document.body.className = 'editor';
        wb.loadCurrentScripts(q);
        break;
}
