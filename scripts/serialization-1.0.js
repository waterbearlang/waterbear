
//
//  Serialize all the blocks in every workspace
//

// TODO:
// * Add timestamp
// * Allow name/description for scripts
// * Add version of script, automatically generated
// * Separate each workspace into its own file. This makes more sense and will simplify things, allow files to be cross-included
// * Include history of editorship (who created, who modified)
// * UI to get this info

(function(){


Block.serialize = function(){
    return JSON.stringify(Block.scriptsToObject('.scripts_workspace'));
};

Block.scriptsToObject = function(workspace){
	if (!workspace) workspace = '.scripts_workspace'; // make a default for debugging convience
    console.log('workspace selector: %s', workspace);
    console.log('workspaces found: %s', $(workspace).length);
    return {
        "waterbearVersion": "1.0",
        "plugins": Block.getPlugins(),
        "workspace": $(workspace).data('name'),
        "blocks": $(workspace).children('.wrapper').get().map(function(domBlock){
            return $(domBlock).data('model').serialize();
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

// Utility to verify that a list exists and contains values
function exists(list){
    if (!list) return false;
    if (!list.length) return false;
    for (var i=0; i < list.length; i++){
        if (list[i]) return true;
    }
    return false;
}

Block.prototype.serialize = function(){
    var serialized = {signature: this.signature};
    console.info('serializing %s', this.signature);
    if (exists(this.values)){
        console.info('with %s values', this.values.length);
        serialized.values = this.values.map(function(value){
            if (value && value.serialize){
                return value.serialize();
            }
            return value;
        });
    }
    if (exists(this.contained)){
        console.info('with %s contained', this.contained.length);
        serialized.contained = this.contained.map(function(child){
            if (child && child.serialize){
                return child.serialize();
            }
            return null;
        });
    }
    if (this.next){
        console.info('with next');
        serialized.next = this.next.serialize();
    }
    return serialized;
};

Value.prototype.serialize = function(){
    // Implement me and make sure I round-trip back into the block model
    if (this.value && this.value.serialize){
        console.info('serializing block value');
        return {
            type: this.type,
            value: this.value.serialize()
        };
    }else{
        console.info('serializing raw value');
        return {
            type: this.type,
            value: this.value
        };
    }
};


Block.reify = function(serialized){
};

})();