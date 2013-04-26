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
        seqNum = Math.max(parseInt(seqNum, 10), _seqNum);
    }

    var blockRegistry = {};

    var registerBlock(blockdesc){
        if (blockdesc.seqNum){
            registerSeqNum(blockdesc.seqNum);
        }else{
            blockdesc.seqNum = newSeqNum();
        }
        if (! blockdesc.id){
            blockdesc.id = uuid();
        }
        blockRegistry[blockdec.id] = blockdesc;
    }

    var getHelp(id){
        return blockRegistry[id].help;
    }

    var getScript(id){
        return blockRegistry[id].script;
    }

    var getSockets(id, instance){
        return blockingRegistry[id].sockets.map(function(s,idx){
            var custom = instance[idx];
            if (custom.text && custom.text !== s.text){
                return {
                    text: custom.text,
                    type: s.type,
                    default: s.default
                }
            return s;
        });
    }

    function Block(obj){
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
                'data-blocktype': a.blocktype,
                'id': a.id,
                'data-scopeid': a.scopeid || 0,
                'data-scriptid': a.scriptid,
                'title': a.help || getHelp(a.scriptid)
            },
            [
                ['div', {'class': 'label'}, getSockets(a.scriptid, a.sockets).map(Socket)], // how to get values for restored classes?
                ['div', {'class': 'contained'}, (a.contained || []).map(Block)]
            ]
        );
    }

    function Socket(obj){
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

    function Default(obj){
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
            case 'choice':
                var choice = elem('select');
                choicelists[obj.options].forEach(function(opt){
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

