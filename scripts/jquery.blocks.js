$.selected_block = function() {
    return $('.scripts_workspace .selected');
};

$.extend($.fn, {
    long_name: function() {
        var names;
        names = [];
        this.each(function(idx, e) {
            var parts = [e.tagName.toLowerCase()];
            e.id ? parts.push('#' + e.id) : null;
            e.className ? parts.push('.' + e.className.split(/\s/).join('.')) : null;
            return names.push(parts.join(''));
        });
        return '[' + names.join(', ') + ']';
    },
    block_type: function() {
        return this.data('model').blockType;
    },
    parent_block: function() {
        var p = this.closest('.wrapper').parent();
        return p.closest('.contained').closest('.wrapper');
    },
    child_blocks: function() {
        return this.find('> .block > .contained').map(function() {
            var kids = $(this).children('.wrapper');
            if (kids.length) {
                return kids;
            } else {
                return $('<span class="empty"></span>');
            }
        });
    },
    socket_blocks: function() {
        return this.find('> .block > .blockhead > .value').children('.socket, .autosocket').children('input, select, .wrapper');
    },
    local_blocks: function() {
        return this.find('> .block > .blockhead .locals .wrapper');
    },
    next_block: function() {
        return this.find('> .next > .wrapper');
    },
    moveTo: function(x, y) {
        return this.css({
            left: x + 'px',
            top: y + 'px'
        });
    },
    addLocalBlock: function(block) {
        window.parent_block = this;
        var head = this.find('> .block > .blockhead');
        var locals = head.find('.locals');
        if (!locals.length) {
            locals = $('<div class="locals block_menu"></div>');
            head.find('.label').after(locals);
        }
        locals.append(block);
        return this;
    },
    addSocketHelp: function() {
        var self = $(this);
        var type = self.block_type();
        var desc = 'this is a ' + type + ' socket. You can type in a value or drag in a matching value block';
        if (type === 'any') {
            desc = 'this is a socket that can take any type. Strings must be quoted.';
        }
        $(this).attr('title', desc);
    },
    extract_script: function() {
        if (this.length === 0) return '';
        if (this.is(':input')) {
            if (this.parent().is('.string') || this.parent().is('.color')) {
                return '"' + this.val() + '"';
            } else {
                return this.val();
            }
        }
        if (this.is('.empty')) return '/* do nothing */';
        return this.map(function() {
            var self = $(this);
            var script = Block.scripts[self.data('model').signature];
            if (!script) {
                return null;
            }
            var exprs = $.map(self.socket_blocks(), function(elem, idx) {
                return $(elem).extract_script();
            });
            var blks = $.map(self.child_blocks(), function(elem, idx) {
                return $(elem).extract_script();
            });
            if (exprs.length) {
                // console.log('expressions: %o', exprs);


                function exprf(match, offset, s) {
                    // console.log('%d args: <%s>, <%s>, <%s>', arguments.length, match, offset, s);
                    var idx = parseInt(match.slice(2, -2), 10) - 1;
                    // console.log('index: %d, expression: %s', idx, exprs[idx]);
                    return exprs[idx];
                };
                script = script.replace(/\{\{\d\}\}/g, exprf);
            }
            if (blks.length) {
                function blksf(match, offset, s) {
                    var idx = parseInt(match.slice(2, -2), 10) - 1;
                    return blks[idx];
                }
                // console.log('child before: %s', script);
                script = script.replace(/\[\[\d\]\]/g, blksf);
            }
            next = self.next_block().extract_script();
            if (script.indexOf('[[next]]') > -1) {
                script = script.replace('[[next]]', next);
            } else {
                if (self.is('.step, .trigger')) {
                    script = script + next;
                }
            }
            return script;
        }).get().join('');
    },
    serialize: function(){
    },
    deserialize: function(){
    },
    block_description: function() {
        if (this.length < 1) return '';
        if (this.is('.empty')) return '';
        if (this.is(':input')) {
            return this.val();
        }
        var patt = new RegExp('##', 'gm');

        var model = this.data('model');
        var desc = {
            blocktype: model.blocktype,
            group: model.group,
            signature: model.signature,
            id: model.id
        };
        // var old_desc = {
        //     klass: this.data('klass'),
        //     label: this.data('label').replace(/##/gm, '_' + this.id()),
        //     script: this.data('script').replace(/##/gm, '_' + this.id()),
        //     subContainerLabels: this.data('subContainerLabels'),
        //     containers: this.data('containers')
        // };
        // FIXME: Move specific type handling to specific plugins
        // NEW: uses model
        // model.blocktype (eventhandler, context, step, expression)
        // model.label (Model will have label OR contained labels)
        // model.contained [ label ]
        // model.group (control, operators, etc.)
        // model.help (string)
        // model.locals [(model)]
        // model.returns (model)
        // model.signature (unique string for each menu block)
        // model.id (unique string for each script block)
        // model.view (jquery)
        var self = this;
        if (model.label){
            desc.label = model.label;
        }else if(model.contained){
            desc.contained = model.contained;
        }
        if (model.locals) {
            desc.locals = model.locals.map(function(local) {
                return {
                    blocktype: local.blocktype,
                    type: local.type,
                    script: local.script.replace(/##/g, '_' + self.id()),
                    label: local.label.replace(/##/g, '_' + self.id())
                };
            });
        }
        if (model._returns) {
            desc.returns = model._returns;
            if (desc.returns !== 'block'){
                desc.returns.script = desc.returns.script.replace(/##/g, '_' + self.id());
                if (desc.returns.label){
                    desc.returns.label = desc.returns.label.replace(/##/g, '_', + self.id());
                }else{
                    desc.returns.contained = desc.returns.contained.map(function(child){
                        return child.label.replace(/##/g, '_', + self.id());
                    });
                }
            }
        }
        model.sockets = this.socket_blocks().map(function() {
            return $(this).block_description();
        }).get();
        model.contained = this.child_blocks().map(function() {
            return $(this).block_description();
        }).get();
        model.next = this.next_block().block_description();
        return desc;
    }
});
