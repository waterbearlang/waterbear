// Revised Block handling.
//
// Nearly all the block is defined in the HTML and DOM
// This file helps to initialize the block DOM, and provide
// support routines
//
// Block(obj) -> Block element
// scriptForId(scriptid) -> script template
// nextSeqNum() -> int
// registerSeqNum(int) make sure we don't re-use sequence numbers
// Socket(json) -> Socket element

(function(wb){

    var elem = wb.elem;


    var _nextSeqNum = 0;

    var newSeqNum = function(){
        _nextSeqNum++;
        return _nextSeqNum;
    };

    var registerSeqNum = function(seqNum){
        // When reifying saved blocks, call this for each block to make sure we start new blocks
        // that do not overlap with old ones.
        if (!seqNum) return;
        seqNum = Math.max(parseInt(seqNum, 10), _nextSeqNum);
    }

    var blockRegistry = {};

    var registerBlock = function(blockdesc){
        if (blockdesc.seqNum){
            registerSeqNum(blockdesc.seqNum);
        }else{
            blockdesc.seqNum = newSeqNum();
        }
        if (! blockdesc.id){
            blockdesc.id = uuid();
        }
        blockRegistry[blockdesc.id] = blockdesc;
    }

    var getHelp = function(id){
        return blockRegistry[id] ? blockRegistry[id].help : '';
    }

    var getScript = function(id){
        return blockRegistry[id].script;
    }

    var getSockets = function(obj){
        return blockRegistry[obj.scriptid || obj.id].sockets.map(Socket);
    }

    var Block = function(obj){
        // FIXME:
        // Handle values coming from serialized (saved) blocks
        // Handle customized names (sockets)
        registerBlock(obj);
        return elem(
            'div',
            {
                'class': function(a){
                    var names = ['block', a.group, a.blocktype];
                    if (a.blocktype === 'context'){
                        names.push('step');
                    }else if (a.blocktype === 'eventhandler'){
                        names.push('step');
                        names.push('context');
                    }
                    return names.join(' ');
                },
                'data-blocktype': obj.blocktype,
                'id': obj.id,
                'data-scopeid': obj.scopeid || 0,
                'data-scriptid': obj.scriptid,
                'title': obj.help || getHelp(obj.scriptid)
            },
            [
                ['div', {'class': 'label'}, getSockets(obj)], // how to get values for restored classes?
                ['div', {'class': 'contained'}, (obj.contained || []).map(Block)]
            ]
        );
    }

    var Socket = function(obj){
        // Sockets are described by text, type, and default value
        // type and default value are optional, but if you have one you must have the other
        // If the type is choice it must also have a choicename for the list of values
        // that can be found in the wb.choiceLists
        var socket = elem('div', {
            'class': 'socket',
            'data-name': obj.name
        },
        [
            ['label', {'class': 'name'}, [obj.name]]
        ]);
        if (obj.type){
            socket.dataset.type = obj.type;
            socket.appendChild(elem('div', {'class': 'contained'}, [Default(obj)]))
        }
    }

    var Default = function(obj){
        // return an input for input types (number, string, color, date)
        // return a block for block types
        var value;
        var type = obj.type;
        if (type === 'int' || type === 'float'){
            type = 'number';
        }
        switch(type){
            case 'number':
                value = obj.value || 0; break;
            case 'string':
                value = obj.value || ''; break;
            case 'color':
                value = obj.value || '#000000'; break;
            case 'date':
                value = obj.value || new Date().toISOString().split('T')[0]; break;
            case 'time':
                value = obj.value || new Date().toISOString().split('T')[1]; break;
            case 'datetime':
                value = obj.value || new Date().toISOString(); break;
            case 'url':
                value = obj.value || 'http://waterbearlang.com'; break;
            case 'phone':
                value = obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.value || 'waterbear@waterbearlang.com'; break;
            case 'boolean':
                obj.options = 'boolean';
            case 'choice':
                var choice = elem('select');
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    if (obj.default && obj.default === opt){
                        option.setAttribute('selected', 'selected');
                    }
                    choice.appendChild(option);
                });
                return choice;
            default:
                if (obj.default){
                    return Block(obj.default);
                }else{
                    return null;
                }
        }
        return elem('input', {type: type, value: value});
    }


    wb.Block = Block;
    wb.registerSeqNum = registerSeqNum;

})(wb);

