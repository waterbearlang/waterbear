
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

(function(wb){

wb.Block.serialize = function(){
    return JSON.stringify(wb.Block.scriptsToObject('.scripts_workspace'));
};

wb.Block.scriptsToObject = function(workspace){
	if (!workspace) workspace = '.scripts_workspace'; // make a default for debugging convience
    // console.log('workspace selector: %s', workspace);
    // console.log('workspaces found: %s', $(workspace).length);
    return {
        "waterbearVersion": "1.1",
        "workspace": $(workspace).data('name'),
        "blocks": $(workspace).children('.wrapper').get().map(function(domBlock){
            return $(domBlock).data('model').toJSON();
        })
    };
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

wb.Block.prototype.toJSON = function(){
    var self = this;
    var serialized = {
        signature: self.signature,
        blocktype: self.blocktype,
        label: self.spec.label,
        group: self.group,
        id: self.id
    };
    if (self.name){
        serialized.name = self.name;
    }
    if (self.seqnum){
        serialized.seqnum = self.seqnum;
    }
    if (self.scriptid){
        serialized.scriptid = self.scriptid;
    }
    if (self.collapsed){
        serialized.collapsed = self.collapsed; // persist open/closed state
    }
    if (exists(self.values)){
        // console.info('with %s values', this.values.length);
        serialized.values = self.values.map(function(value){
            if (value && value.toJSON){
                return value.toJSON();
            }
            return value;
        });
    }
    if (exists(self.contained)){
        // console.info('with %s contained', this.contained.length);
        serialized.contained = self.contained.map(function(child){
            if (child && child.toJSON){
                return child.toJSON();
            }
            return null;
        });
    }
    return serialized;
};

wb.Value.prototype.toJSON = function(){
    // Implement me and make sure I round-trip back into the block model
    var struct;
    if (this.value && this.value.toJSON){
        // console.info('serializing block value');
        struct = {
            type: this.type,
            value: this.value.toJSON()
        };
    }else{
        // console.info('serializing raw value');
        struct = {
            type: this.type,
            value: this.value
        };
        if (this.choiceName){
            struct.choiceName = this.choiceName;
        }
    }
    return struct;
};


wb.Block.reify = function(serialized){
};

})(wb);
