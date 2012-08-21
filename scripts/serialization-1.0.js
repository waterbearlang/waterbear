
//
//  Serialize all the blocks in every workspace
//

// TODO:
// * Remove default values from signature
// * Add timestamp
// * Allow name/description for scripts
// * Add version of script, automatically generated
// * Separate each workspace into its own file. This makes more sense and will simplify things, allow files to be cross-included
// * Include history of editorship (who created, who modified)
// * UI to get this info


Block.serialize = function(){
    return JSON.stringify(Block.scriptsToObject());
};

Block.scriptsToObject = function(){
    return {
        "waterbearVersion": "1.0",
        "plugins": Block.getPlugins(),
        "scripts": $('.scripts_workspace').get().map(function(workspace){
            return {
                "workspace": $(workspace).data('name'),
                "blocks": $(workspace).children('.wrapper').get().map(function(domBlock){
                    return $(domBlock).data('model').serialize();
                })
            };
        })
    };
};

Block.getPlugins = function(){
    return Block._plugins;
};

Block._plugins = [];
Block.registerPlugin = function(name){
    Block._plugins.push(name);
};

Block.prototype.serialize = function(){
    var serialized = {signature: this.signature};
    console.log('serializing %s', this.signature);
    if (this.values && this.values.length){
        console.log('with %s values', this.values.length);
        serialized.values = this.values.map(function(value){
            if (value.serialize){
                return value.serialize();
            }
            return value;
        });
    }
    if (this.contained && this.contained.length){
        console.log('with %s contained', this.contained.length);
        serialized.contained = this.contained.map(function(child){
            return child.serialize();
        });
    }
    if (this.next){
        console.log('with next');
        serialized.next = this.next.serialize();
    }
    return serialized;
};

Value.prototype.serialize = function(){
    // Implement me and make sure I round-trip back into the block model
    if (this.value && this.value.serialize){
        console.log('serializing block value');
        return {
            type: this.type,
            value: this.value.serialize()
        };
    }else{
        console.log('serializing raw value');
        return {
            type: this.type,
            value: this.value
        };
    }
};


Block.reify = function(serialized){
};