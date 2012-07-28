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
    id: function(_id) {
        if (_id) {
            if (!this.data('_id')) {
                this.data('_id', _id);
                if (this.data('script') && this.data('script').indexOf('##') > -1) {
                    this.data('script', this.data('script').replace(/##/gm, '_' + _id));
                    this.data('label', this.data('label').replace(/##/gm, '_' + _id));
                    this.find('> .block > .blockhead > .label').html(Label(this.data('label')));
                }
            }
        } else {
            return this.data('_id');
        }
    },
    info: function() {
        return this.closest('.wrapper').long_name();
    },
    block_type: function() {
        return this.data('type');
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
            var script = scripts[self.data('model').signature];
            if (!script) {
                return null;
            }
            var exprs = $.map(self.socket_blocks(), function(elem, idx) {
                return $(elem).extract_script();
            });
            console.log('script exprs: %s', exprs.length);
            var blks = $.map(self.child_blocks(), function(elem, idx) {
                return $(elem).extract_script();
            });
            console.log('children %s', blks.length);
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
            console.log('next: %s', !!next);
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
    block_description: function() {
        if (this.length < 1) return '';
        if (this.is('.empty')) return '';
        if (this.is(':input')) {
            return this.val();
        }
        var patt = new RegExp('##', 'gm');

        var desc = {
            klass: this.data('klass'),
            label: this.data('label').replace(/##/gm, '_' + this.id()),
            script: this.data('script').replace(/##/gm, '_' + this.id()),
            subContainerLabels: this.data('subContainerLabels'),
            containers: this.data('containers')
        };
        // FIXME: Move specific type handling to raphael_demo.js
        if (this.is('.trigger')) {
            desc.trigger = true;
        }
        if (this.is('.value')) {
            desc['type'] = this.data('type')
        };
        if (this.data('locals')) {
            var self = this;
            desc.locals = this.data('locals');
            desc.locals.forEach(function(local) {
                local.script = local.script.replace(/##/g, '_' + self.id());
                local.label = local.label.replace(/##/g, '_' + self.id());
            });
        }
        if (this.data('returns')) {
            desc.returns = this.data('returns');
            desc.returns.script = desc.returns.script.replace(/##/g, '_' + this.id());
            desc.returns.label = desc.returns.label.replace(/##/g, '_' + this.id());
        }
        desc.sockets = this.socket_blocks().map(function() {
            return $(this).block_description();
        }).get();
        desc.contained = this.child_blocks().map(function() {
            return $(this).block_description();
        }).get();
        desc.next = this.next_block().block_description();
        return desc;
    }
});
