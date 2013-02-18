//
// Blocks which take parameters store those parameters as Value objects, which may hold primitive
// values such as numbers or strings, or may be Expression blocks.
//

//
// Value objects get defaults depending on their type. These are the defaults for
// primitive values when the plugin does not over-ride the default.
//

(function(wb){
var defaultValue = {
    'number': 0,
    'boolean': false,
    'string': '',
    'date': function(){ return new Date().toISOString().split('T')[0]; },
    'time': function(){ return new Date().toISOString().split('T')[1].split('.')[0] + 'Z'; },
    'datetime': function(){ return new Date().toISOString(); },
    'color': 'rgb(0,0,0)'
};

function Value(textValue, index){
    assert.isNumber(index, 'Values must know their place');
    this.index = index;
    if ($.isPlainObject(textValue)){
        print('initializing Value with object: %o', textValue);
        $.extend(this, textValue);
        if (this.choiceName){
            this.choiceList = choiceLists[this.choiceName];
        }
        if (textValue.value && textValue.value.signature){
            var block = Block(textValue.value);
            if (block){
                this.addBlock(block);
            }else{
                Deferred.add(this, 'value', null, textValue.value);
            }
            // assert.isObject(block, 'Value blocks must be objects');
        }else{
            this.literal = true;
        }
    }else{
        print('initializing Value with text: %o', textValue);
        assert(textValue.length > 0, 'textValue must contain text');
        var parts = textValue.slice(1,-1).split(':');
        this.type = parts[0];
        if (this.type === 'choice'){
            this.choiceName = parts[1];
            this.choiceList = choiceLists[this.choiceName];
            if (parts.length === 3){
                this.value = parts[2];
            }else{
                this.value = this.choiceList[0];
            }
        }else{
            if (parts.length === 1){
                this.value = defaultValue[this.type];
                if (this.value && this.value.apply){
                    this.value = this.value();
                }
            }else{
                this.value = parts[1];
                if (this.type.match(/number|float|double/)){
                    this.value = parseFloat(this.value);
                }else if (this.type.match(/int|long/)){
                    this.value = parseInt(this.value, 10);
                }else if (this.type.match(/boolean|bool/)){
                    this.value = !!(this.value === 'true');
                    this.choiceName = 'boolean';
                    this.choiceList = [true,false];
                }
            }
        }
        if (this.value !== undefined){
            this.defaultValue = this.value; // for when expressions are removed
            this.literal = true;
        }
    }
}

Value.prototype.code = function(){
    if (this.literal){
        if (this.value && this.value.substring && this.type !== 'any'){ // is it a string?
            return '"' + this.value + '"';
        }
        return this.value;
    }else{
        try{
            return this.value.code();
        }catch(e){
            console.log('What happened to code? %o', this);
            throw e;
        }
    }
}

Value.prototype.addBlock = function(blockModel){
    this.literal = false;
    this.value = blockModel;
};

Value.prototype.removeBlock = function(blockModel){
    this.literal = true;
    this.value = this.defaultValue;
};

function getInputType(testType){
    if (['color', 'date', 'datetime', 'time', 'email', 'month', 'number', 'tel', 'text', 'url', 'week'].indexOf(testType) > -1){
        return testType;
    }
    if (['float', 'double', 'int', 'long'].indexOf(testType) > -1){
        return 'number';
    }
    return 'text';
}

Value.prototype.view = function(){
    print('building view for %o, has cached view: %s', j(this), !!this._view);
    print('we do not have a cached view');
    if (! this.literal && this.value){ return this.value.view(); }
    print('we do not have a block value');
    var inputType;
    if (this.choiceName){
        print('return choice view');
        this._view =  this.choiceView(this.choiceName, this.choiceList);
    }else if (this.value !== undefined){
        inputType = getInputType(this.type);
        print('return type/index/value %o/%o/%o', this.type, this.index, this.value);
        this._view = $('<span class="value ' + this.type + ' socket" data-type="' + this.type + '" data-index="' + this.index  + '"><input type="' + inputType + '" value="' + this.value + '"></span>');
    }else{
        print('return undefined value');
        inputType = getInputType(this.type);
        this._view = $('<span class="value ' + this.type + ' socket" data-type="' + this.type + '" data-index="' + this.index + '"><input type="' + inputType + '"></span>');
    }
    print('return cached value: %o', h(this._view));
    return this._view;
};

Value.prototype.choiceView = function(){
    var self = this;
    return $('<span class="value string ' + this.choiceName + ' autosocket" data-type="  " + data-index="' + this.index + '"><select>' +
        this.choiceList.map(function(item){
            if (item === self.value){
                return '<option selected>' + item + '</option>';
            }else{
                return '<option>' + item + '</option>';
            }
        }).join('') +
        '</select></span>');
};

Value.prototype.update = function(newValue){
    switch(this.type){
        case 'number': this.value = parseFloat(newValue); break;
        case 'boolean': this.value = newValue === 'true'; break;
        case 'string': this.value = newValue; break;
        case 'date': assert.isString(newValue, 'expects an ISO8601 value');this.value = newValue; break;
        case 'datetime': assert.isString(newValue, 'expects an ISO8601 value');this.value = newValue; break;
        case 'time': assert.isString(newValue, 'expects an ISO8601 value');this.value = newValue; break;
        case 'int': this.value = parseInteger(newValue); break;
        case 'float': this.value = parseInteger(newValue); break;
        default: this.value = newValue; break;
    }
}

wb.Value = Value;
wb.getInputType = getInputType;
})(wb);
