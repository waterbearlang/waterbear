(function(wb, Event){
'use strict';
    var elem = wb.elem;

    function createSocket(desc, blockdesc, cloneForCM){
        // console.log('createSocket(%o)', desc);
        // desc is a socket descriptor object, block is the owner block descriptor
        // Sockets are described by text, type, and (default) value
        // type and value are optional, but if you have one you must have the other
        // If the type is choice it must also have a options for the list of values
        // that can be found in the wb.choiceLists
        // A socket may also have a suffix, text after the value
        // A socket may also have a block, the id of a default block
        // A socket may also have a uValue, if it has been set by the user, over-rides value
        // A socket may also have a uName if it has been set by the user, over-rides name
        // A socket may also have a uBlock descriptor, if it has been set by the user, this over-rides the block
        var holder;
        var socket = elem('div',
            {
                'class': 'socket',
                'data-name': desc.name,
                'data-id': blockdesc.id
            },
            elem('span', {'class': 'name'}, desc.uName || desc.name)
        );
        // Optional settings
        if (desc.value){
            socket.dataset.value = desc.value;
        }
        if (desc.options){
            socket.dataset.options = desc.options;
        }
        if (desc.min !== undefined){
            socket.dataset.min = desc.min;
        }
        if (desc.max !== undefined){
            socket.dataset.max = desc.max;
        }
        // if (!blockdesc.isTemplateBlock){
        //      console.log('socket seq num: %s', blockdesc.seqNum);
        // }
        socket.firstElementChild.innerHTML = socket.firstElementChild.innerHTML.replace(/##/, ' <span class="seq-num">' + (blockdesc.seqNum || '##') + '</span>');
        if (desc.type){
            socket.dataset.type = desc.type;
            holder = elem('div', {'class': 'holder'}, [defaultInput(desc)]);
            socket.appendChild(holder);
        }
        if (desc.block){
            socket.dataset.block = desc.block;
        }
        if (blockdesc.seqNum !== undefined){
            socket.dataset.seqNum = blockdesc.seqNum;
        }
        if (!blockdesc.isTemplateBlock){
            //console.log('socket seq num: %s', blockdesc.seqNum);
            var newBlock = null;
            if (desc.uBlock){
                // console.log('trying to instantiate %o', desc.uBlock);
                delete desc.uValue;
                newBlock = wb.block.create(desc.uBlock, cloneForCM);
                //console.log('created instance: %o', newBlock);
            } else if (desc.block && ! desc.uValue){
                //console.log('desc.block');
                newBlock = cloneBlock(document.getElementById(desc.block), cloneForCM);
            }else if (desc.block && desc.uValue){
                // for debugging only
                // console.log('block: %s, uValue: %s', desc.block, desc.uValue);
            }
            if (newBlock){
                //console.log('appending new block');
                holder.appendChild(newBlock);
                // Event.trigger(newBlock, 'wb-add');
                wb.block.addExpression({'target': newBlock});
            }
        }
        if (desc.suffix){
            socket.dataset.suffix = desc.suffix;
            socket.appendChild(elem('span', {'class': 'suffix'}, desc.suffix));
        }
        return socket;
    }


    function socketDesc(socket){
        var parentBlock = wb.closest(socket, '.block');
        var isTemplate = !!parentBlock.dataset.isTemplateBlock;
        var desc = {
            name: socket.dataset.name
        };
        // optional defined settings
        if (socket.dataset.type){
            desc.type = socket.dataset.type;
        }
        if (socket.dataset.value){
            desc.value = socket.dataset.value;
        }
        if (socket.dataset.options){
            desc.options = socket.dataset.options;
        }
        if (socket.dataset.block){
            desc.block = socket.dataset.block;
        }
        if (socket.dataset.suffix){
            desc.suffix = socket.dataset.suffix;
        }
        if (socket.dataset.min !== undefined){
            desc.min = socket.dataset.min;
        }
        if (socket.dataset.max !== undefined){
            desc.max = socket.dataset.max;
        }
        // User-specified settings
        if (isTemplate)
        {
            return desc;
        }
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name');

        if (desc.name && desc.name.replace(/##/, ' ' + socket.dataset.seqNum) !== uName){
            desc.uName = uName;
        }
        var holder = wb.findChild(socket, '.holder');
        if (holder){
            var input = wb.findChild(holder, 'input, select');
            // var block = wb.findChild(holder, '.block');
            if (wb.matches(holder.lastElementChild, '.block')){
                desc.uBlock = wb.block.description(holder.lastElementChild);
            }else{
                desc.uValue = input.value;
            }
        }
        return desc;
    }

    function getHolderValue(holder){
        if (!holder) return null;
        if (holder.children.length > 1){
            return wb.block.code(wb.findChild(holder, '.block'));
        }else{
            var value = wb.findChild(holder, 'input, select').value;
            var type = holder.parentElement.dataset.type;

            // DONE : #227
            if (type === 'string' || type === 'color' || type === 'url'){
                if (value[0] === '"'){value = value.slice(1);}
                if (value[value.length-1] === '"'){value = value.slice(0,-1);}
                value = value.replace(/"/g, '\\"');
                value = '"' + value + '"';
            } else if (type === 'regex'){
                if (value[0] === '/'){value = value.slice(1);}
                if (value[value.length-1] === '/'){value = value.slice(0,-1);}
                value = value.replace(/\//g, '\\/');
                value = '/' + value + '/';
            }
            return value;
        }
    }

    function getSocketValue (socket){
        var holder = wb.findChild(socket, '.holder');
        if (holder){
            return getHolderValue(holder);
        }else{
            return null;
        }
    }

    function socketValidate(socket){
        // Going to assume for now that empty strings are not wanted
        if (getSocketValue(socket) === ''){
            console.warn('Empty socket: %o', socket);
            socket.classList.add('invalid');
            return false;
        }else{
            socket.classList.remove('invalid');
            return true;
        }
    }



    function createSockets(obj, cloneForCM){
        return obj.sockets.map(function(socket_descriptor){
            return createSocket(socket_descriptor, obj, cloneForCM);
        });
    }

    function defaultInput(obj){
        // return an input for input types (number, string, color, date)
        // return a block for block types
        var value, input;
        var type = obj.type;

        if(type === 'boolean'){
            obj.options = 'boolean';
        }

        if(typeof obj.options !== 'undefined'){
            // DONE : #24
            // DONE : #227
            var choice = elem('select');
            var list = wb.choiceLists[obj.options];

            if(Array.isArray(list)){
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    var value = obj.uValue || obj.value;

                    if (value !== undefined && value !== null && value == opt){
                        option.setAttribute('selected', 'selected');
                    }

                    choice.appendChild(option);
                });
            }
            else{
                var values = Object.keys(list);

                values.forEach(function(val){
                    var option = elem('option', {"value":val}, list[val]);
                    var value = obj.uValue || obj.value;

                    if (value !== undefined && value !== null && value == val){
                        option.setAttribute('selected', 'selected');
                    }

                    choice.appendChild(option);
                });
            }

            return choice;

        }
        //Known issue: width manually set to 160, need to programmatically get
        //(size of "Browse" button) + (size of file input field).
        if (type === 'file'){
            //var value = obj.uValue || obj.value || '';
            input = elem('input', {type: "file"});//, value: value});
            input.addEventListener('change', function(evt){
                if(confirm("Your potentially sensitive data will be uploaded to the server. Continue?")) {
                    var file = input.files[0];
                    var reader = new FileReader();
                    reader.onload = function (evt){
                        localStorage['__' + file.name]= evt.target.result;
                    };
                    reader.readAsText( file );
                }else{
                    input.value= "";
                }
            });
            input.style.width= "160px"; //known issue stated above
            return input;
        }
        if (type === 'int' || type === 'float'){
            type = 'number';
        }
        if (type === 'image'){
            type = '_image'; // avoid getting input type="image"
        }
        switch(type){
            case 'any':
                value = obj.uValue || obj.value || ''; break;
            case 'number':
                value = obj.uValue || obj.value || 0; break;
            case 'string':
                value = obj.uValue || obj.value || ''; break;
            case 'regex':
                value = obj.uValue || obj.value || /.*/; break;
            case 'color':
                value = obj.uValue || obj.value || '#000000'; break;
            case 'date':
                value = obj.uValue || obj.value || new Date().toISOString().split('T')[0]; break;
            case 'time':
                value = obj.uValue || obj.value || new Date().toISOString().split('T')[1]; break;
            case 'datetime':
                value = obj.uValue || obj.value || new Date().toISOString(); break;
            case 'url':
                value = obj.uValue || obj.value || 'http://waterbearlang.com/'; break;
            case 'phone':
                value = obj.uValue || obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.uValue || obj.value || 'waterbear@waterbearlang.com'; break;
            default:
                value = obj.uValue || obj.value || '';
        }
        input = elem('input', {type: type, value: value, 'data-value': value});
        if (type === 'number'){
            if (obj.min !== undefined){
                input.setAttribute('min', obj.min);
            }
            if (obj.max !== undefined){
                input.setAttribute('max', obj.max);
            }
            input.setAttribute('required', 'required');
        }
        //Only enable editing for the appropriate types
        if (!(type === "string" || type === "any" || type === 'regex' ||
              type === "url"    || type === "phone" ||
              type === "number" || type === "color")) {
            input.readOnly = true;
        }

        wb.resize(input);
        return input;
    }

    // SUPPORT FUNCTIONS FOR CHANGING VARIABLE NAMES

    function changeName(event){
        var nameSpan = event.target;
        var input = elem('input', {value: nameSpan.textContent});
        nameSpan.parentNode.appendChild(input);
        nameSpan.style.display = 'none';
        input.focus();
        input.select();
        wb.resize(input);
        Event.on(input, 'blur', null, updateName);
        Event.on(input, 'keydown', null, maybeUpdateName);
    }

    function updateName(event){
        // console.log('updateName on %o', event);
        var input = event.target;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        var nameSpan = input.previousSibling;
        var newName = input.value;
        var oldName = input.parentElement.textContent;
        // if (!input.parentElement) return; // already removed it, not sure why we're getting multiple blurs
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
        function propagateChange(newName) {
            // console.log('now update all instances too');
            var source = wb.closest(nameSpan, '.block');
            var instances = wb.findAll(wb.closest(source, '.context'), '[data-local-source="' + source.dataset.localSource + '"]');
            instances.forEach(function(elem){
                wb.find(elem, '.name').textContent = newName;
                wb.find(elem, '.socket').dataset.name = newName;
            });

            //Change name of parent
            var parent = document.getElementById(source.dataset.localSource);
            var nameTemplate = wb.block.getSocketDefinitions(parent)[0].name;
            nameTemplate = nameTemplate.replace(/[^' ']*##/g, newName);

            //Change locals name of parent
            var parentLocals = JSON.parse(parent.dataset.locals);
            var localSocket = parentLocals[0].sockets[0];
            localSocket.name = newName;
            parent.dataset.locals = JSON.stringify(parentLocals);

            wb.find(parent, '.name').textContent = nameTemplate;
            Event.trigger(document.body, 'wb-modified', {block: event.target, type: 'nameChanged'});
        }
        var action = {
            undo: function() {
                propagateChange(oldName);
            },
            redo: function() {
                propagateChange(newName);
            }
        };
        wb.history.add(action);
        action.redo();
    }

    function cancelUpdateName(event){
        var input = event.target;
        var nameSpan = input.previousSibling;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
    }

    function maybeUpdateName(event){
        var input = event.target;
        if (event.keyCode === 0x1B /* escape */ ){
            event.preventDefault();
            input.value = input.previousSibling.textContent;
            input.blur();
        }else if(event.keyCode === 0x0D /* return or enter */ || event.keyCode === 0x09 /* tab */){
            event.preventDefault();
            input.blur();
        }
    }

    function confirmNumberValue(evt){
        var input = evt.target;
        if (input.validity.valid){
            input.dataset.value = input.value;
        }else{
            if (input.validity.rangeUnderflow){
                input.value = input.getAttribute('min');
                input.dataset.value = input.value;
            }else if (input.validity.rangeOverflow){
                input.value = input.getAttribute('max');
                input.dataset.value = input.value;
            }else{
                // We allow blanks, unfortunately, we can't detect blank vs. say 'abc'
                input.value = '';
            }
        }
    }

    Event.on(document.body, 'input', 'input[type=number]', confirmNumberValue);

    wb.socket = {
        value: getSocketValue,
        holderValue: getHolderValue,
        validate: socketValidate,
        mapCreate: createSockets,
        changeName: changeName,
        description: socketDesc
    };


})(wb, Event);