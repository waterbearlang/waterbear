
/*begin beautify.js*/
/*jslint onevar: false, plusplus: false */
/*

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>
  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>

  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    preserve_newlines (default true) — whether existing line breaks should be preserved,
    preserve_max_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,

    jslint_happy (default false) — if true, then jslint-stricter mode is enforced.

            jslint_happy   !jslint_happy
            ---------------------------------
             function ()      function()

    brace_style (default "collapse") - "collapse" | "expand" | "end-expand"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.

    e.g

    js_beautify(js_source_text, {
      'indent_size': 1,
      'indent_char': '\t'
    });


*/



function js_beautify(js_source_text, options) {

    var input, output, token_text, last_type, last_text, last_last_text, last_word, flags, flag_store, indent_string;
    var whitespace, wordchar, punct, parser_pos, line_starters, digits;
    var prefix, token_type, do_block_just_closed;
    var wanted_newline, just_added_newline, n_newlines;
    var preindent_string = '';


    // Some interpreters have unexpected results with foo = baz || bar;
    options = options ? options : {};

    var opt_brace_style;

    // compatibility
    if (options.space_after_anon_function !== undefined && options.jslint_happy === undefined) {
        options.jslint_happy = options.space_after_anon_function;
    }
    if (options.braces_on_own_line !== undefined) { //graceful handling of depricated option
        opt_brace_style = options.braces_on_own_line ? "expand" : "collapse";
    }
    opt_brace_style = options.brace_style ? options.brace_style : (opt_brace_style ? opt_brace_style : "collapse");


    var opt_indent_size = options.indent_size ? options.indent_size : 4;
    var opt_indent_char = options.indent_char ? options.indent_char : ' ';
    var opt_preserve_newlines = typeof options.preserve_newlines === 'undefined' ? true : options.preserve_newlines;
    var opt_max_preserve_newlines = typeof options.max_preserve_newlines === 'undefined' ? false : options.max_preserve_newlines;
    var opt_jslint_happy = options.jslint_happy === 'undefined' ? false : options.jslint_happy;
    var opt_keep_array_indentation = typeof options.keep_array_indentation === 'undefined' ? false : options.keep_array_indentation;

    just_added_newline = false;

    // cache the source's length.
    var input_length = js_source_text.length;

    function trim_output(eat_newlines) {
        eat_newlines = typeof eat_newlines === 'undefined' ? false : eat_newlines;
        while (output.length && (output[output.length - 1] === ' '
            || output[output.length - 1] === indent_string
            || output[output.length - 1] === preindent_string
            || (eat_newlines && (output[output.length - 1] === '\n' || output[output.length - 1] === '\r')))) {
            output.pop();
        }
    }

    function trim(s) {
        return s.replace(/^\s\s*|\s\s*$/, '');
    }

    function force_newline()
    {
        var old_keep_array_indentation = opt_keep_array_indentation;
        opt_keep_array_indentation = false;
        print_newline()
        opt_keep_array_indentation = old_keep_array_indentation;
    }

    function print_newline(ignore_repeated) {

        flags.eat_next_space = false;
        if (opt_keep_array_indentation && is_array(flags.mode)) {
            return;
        }

        ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;

        flags.if_line = false;
        trim_output();

        if (!output.length) {
            return; // no newline on start of file
        }

        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
            just_added_newline = true;
            output.push("\n");
        }
        if (preindent_string) {
            output.push(preindent_string);
        }
        for (var i = 0; i < flags.indentation_level; i += 1) {
            output.push(indent_string);
        }
        if (flags.var_line && flags.var_line_reindented) {
            if (opt_indent_char === ' ') {
                output.push('    '); // var_line always pushes 4 spaces, so that the variables would be one under another
            } else {
                output.push(indent_string); // skip space-stuffing, if indenting with a tab
            }
        }
    }



    function print_single_space() {
        if (flags.eat_next_space) {
            flags.eat_next_space = false;
            return;
        }
        var last_output = ' ';
        if (output.length) {
            last_output = output[output.length - 1];
        }
        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
            output.push(' ');
        }
    }


    function print_token() {
        just_added_newline = false;
        flags.eat_next_space = false;
        output.push(token_text);
    }

    function indent() {
        flags.indentation_level += 1;
    }


    function remove_indent() {
        if (output.length && output[output.length - 1] === indent_string) {
            output.pop();
        }
    }

    function set_mode(mode) {
        if (flags) {
            flag_store.push(flags);
        }
        flags = {
            previous_mode: flags ? flags.mode : 'BLOCK',
            mode: mode,
            var_line: false,
            var_line_tainted: false,
            var_line_reindented: false,
            in_html_comment: false,
            if_line: false,
            in_case: false,
            eat_next_space: false,
            indentation_baseline: -1,
            indentation_level: (flags ? flags.indentation_level + ((flags.var_line && flags.var_line_reindented) ? 1 : 0) : 0),
            ternary_depth: 0
        };
    }

    function is_array(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]';
    }

    function is_expression(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]' || mode === '(EXPRESSION)';
    }

    function restore_mode() {
        do_block_just_closed = flags.mode === 'DO_BLOCK';
        if (flag_store.length > 0) {
            flags = flag_store.pop();
        }
    }

    function all_lines_start_with(lines, c) {
        for (var i = 0; i < lines.length; i++) {
            if (trim(lines[i])[0] != c) {
                return false;
            }
        }
        return true;
    }

    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }

    function get_next_token() {
        n_newlines = 0;

        if (parser_pos >= input_length) {
            return ['', 'TK_EOF'];
        }

        wanted_newline = false;

        var c = input.charAt(parser_pos);
        parser_pos += 1;


        var keep_whitespace = opt_keep_array_indentation && is_array(flags.mode);

        if (keep_whitespace) {

            //
            // slight mess to allow nice preservation of array indentation and reindent that correctly
            // first time when we get to the arrays:
            // var a = [
            // ....'something'
            // we make note of whitespace_count = 4 into flags.indentation_baseline
            // so we know that 4 whitespaces in original source match indent_level of reindented source
            //
            // and afterwards, when we get to
            //    'something,
            // .......'something else'
            // we know that this should be indented to indent_level + (7 - indentation_baseline) spaces
            //
            var whitespace_count = 0;

            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    trim_output();
                    output.push("\n");
                    just_added_newline = true;
                    whitespace_count = 0;
                } else {
                    if (c === '\t') {
                        whitespace_count += 4;
                    } else if (c === '\r') {
                        // nothing
                    } else {
                        whitespace_count += 1;
                    }
                }

                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }
            if (flags.indentation_baseline === -1) {
                flags.indentation_baseline = whitespace_count;
            }

            if (just_added_newline) {
                var i;
                for (i = 0; i < flags.indentation_level + 1; i += 1) {
                    output.push(indent_string);
                }
                if (flags.indentation_baseline !== -1) {
                    for (i = 0; i < whitespace_count - flags.indentation_baseline; i++) {
                        output.push(' ');
                    }
                }
            }

        } else {
            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    n_newlines += ( (opt_max_preserve_newlines) ? (n_newlines <= opt_max_preserve_newlines) ? 1: 0: 1 );
                }


                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }

            if (opt_preserve_newlines) {
                if (n_newlines > 1) {
                    for (i = 0; i < n_newlines; i += 1) {
                        print_newline(i === 0);
                        just_added_newline = true;
                    }
                }
            }
            wanted_newline = n_newlines > 0;
        }


        if (in_array(c, wordchar)) {
            if (parser_pos < input_length) {
                while (in_array(input.charAt(parser_pos), wordchar)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos === input_length) {
                        break;
                    }
                }
            }

            // small and surprisingly unugly hack for 1E-10 representation
            if (parser_pos !== input_length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {

                var sign = input.charAt(parser_pos);
                parser_pos += 1;

                var t = get_next_token(parser_pos);
                c += sign + t[0];
                return [c, 'TK_WORD'];
            }

            if (c === 'in') { // hack for 'in' operator
                return [c, 'TK_OPERATOR'];
            }
            if (wanted_newline && last_type !== 'TK_OPERATOR'
                && last_type !== 'TK_EQUALS'
                && !flags.if_line && (opt_preserve_newlines || last_text !== 'var')) {
                print_newline();
            }
            return [c, 'TK_WORD'];
        }

        if (c === '(' || c === '[') {
            return [c, 'TK_START_EXPR'];
        }

        if (c === ')' || c === ']') {
            return [c, 'TK_END_EXPR'];
        }

        if (c === '{') {
            return [c, 'TK_START_BLOCK'];
        }

        if (c === '}') {
            return [c, 'TK_END_BLOCK'];
        }

        if (c === ';') {
            return [c, 'TK_SEMICOLON'];
        }

        if (c === '/') {
            var comment = '';
            // peek for comment /* ... */
            var inline_comment = true;
            if (input.charAt(parser_pos) === '*') {
                parser_pos += 1;
                if (parser_pos < input_length) {
                    while (! (input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/') && parser_pos < input_length) {
                        c = input.charAt(parser_pos);
                        comment += c;
                        if (c === '\x0d' || c === '\x0a') {
                            inline_comment = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            break;
                        }
                    }
                }
                parser_pos += 2;
                if (inline_comment) {
                    return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
                } else {
                    return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
                }
            }
            // peek for comment // ...
            if (input.charAt(parser_pos) === '/') {
                comment = c;
                while (input.charAt(parser_pos) !== '\r' && input.charAt(parser_pos) !== '\n') {
                    comment += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input_length) {
                        break;
                    }
                }
                parser_pos += 1;
                if (wanted_newline) {
                    print_newline();
                }
                return [comment, 'TK_COMMENT'];
            }

        }

        if (c === "'" || // string
        c === '"' || // string
        (c === '/' &&
            ((last_type === 'TK_WORD' && in_array(last_text, ['return', 'do'])) ||
                (last_type === 'TK_COMMENT' || last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EQUALS' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
            var sep = c;
            var esc = false;
            var resulting_string = c;

            if (parser_pos < input_length) {
                if (sep === '/') {
                    //
                    // handle regexp separately...
                    //
                    var in_char_class = false;
                    while (esc || in_char_class || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                            if (input.charAt(parser_pos) === '[') {
                                in_char_class = true;
                            } else if (input.charAt(parser_pos) === ']') {
                                in_char_class = false;
                            }
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }

                } else {
                    //
                    // and handle string also separately
                    //
                    while (esc || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }
                }



            }

            parser_pos += 1;

            resulting_string += sep;

            if (sep === '/') {
                // regexps may have modifiers /regexp/MOD , so fetch those, too
                while (parser_pos < input_length && in_array(input.charAt(parser_pos), wordchar)) {
                    resulting_string += input.charAt(parser_pos);
                    parser_pos += 1;
                }
            }
            return [resulting_string, 'TK_STRING'];
        }

        if (c === '#') {


            if (output.length === 0 && input.charAt(parser_pos) === '!') {
                // shebang
                resulting_string = c;
                while (parser_pos < input_length && c != '\n') {
                    c = input.charAt(parser_pos);
                    resulting_string += c;
                    parser_pos += 1;
                }
                output.push(trim(resulting_string) + '\n');
                print_newline();
                return get_next_token();
            }



            // Spidermonkey-specific sharp variables for circular references
            // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
            // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
            var sharp = '#';
            if (parser_pos < input_length && in_array(input.charAt(parser_pos), digits)) {
                do {
                    c = input.charAt(parser_pos);
                    sharp += c;
                    parser_pos += 1;
                } while (parser_pos < input_length && c !== '#' && c !== '=');
                if (c === '#') {
                    //
                } else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
                    sharp += '[]';
                    parser_pos += 2;
                } else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
                    sharp += '{}';
                    parser_pos += 2;
                }
                return [sharp, 'TK_WORD'];
            }
        }

        if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
            parser_pos += 3;
            flags.in_html_comment = true;
            return ['<!--', 'TK_COMMENT'];
        }

        if (c === '-' && flags.in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
            flags.in_html_comment = false;
            parser_pos += 2;
            if (wanted_newline) {
                print_newline();
            }
            return ['-->', 'TK_COMMENT'];
        }

        if (in_array(c, punct)) {
            while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
                c += input.charAt(parser_pos);
                parser_pos += 1;
                if (parser_pos >= input_length) {
                    break;
                }
            }

            if (c === '=') {
                return [c, 'TK_EQUALS'];
            } else {
                return [c, 'TK_OPERATOR'];
            }
        }

        return [c, 'TK_UNKNOWN'];
    }

    //----------------------------------
    indent_string = '';
    while (opt_indent_size > 0) {
        indent_string += opt_indent_char;
        opt_indent_size -= 1;
    }

    while (js_source_text && (js_source_text[0] === ' ' || js_source_text[0] === '\t')) {
        preindent_string += js_source_text[0];
        js_source_text = js_source_text.substring(1);
    }
    input = js_source_text;

    last_word = ''; // last 'TK_WORD' passed
    last_type = 'TK_START_EXPR'; // last token type
    last_text = ''; // last token text
    last_last_text = ''; // pre-last token text
    output = [];

    do_block_just_closed = false;

    whitespace = "\n\r\t ".split('');
    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
    digits = '0123456789'.split('');

    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::'.split(' ');

    // words which should always start on new line.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
    // some formatting depends on that.
    flag_store = [];
    set_mode('BLOCK');

    parser_pos = 0;
    while (true) {
        var t = get_next_token(parser_pos);
        token_text = t[0];
        token_type = t[1];
        if (token_type === 'TK_EOF') {
            break;
        }

        switch (token_type) {

        case 'TK_START_EXPR':

            if (token_text === '[') {

                if (last_type === 'TK_WORD' || last_text === ')') {
                    // this is array index specifier, break immediately
                    // a[x], fn()[x]
                    if (in_array(last_text, line_starters)) {
                        print_single_space();
                    }
                    set_mode('(EXPRESSION)');
                    print_token();
                    break;
                }

                if (flags.mode === '[EXPRESSION]' || flags.mode === '[INDENTED-EXPRESSION]') {
                    if (last_last_text === ']' && last_text === ',') {
                        // ], [ goes to new line
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');
                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else if (last_text === '[') {
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');

                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else {
                        set_mode('[EXPRESSION]');
                    }
                } else {
                    set_mode('[EXPRESSION]');
                }



            } else {
                set_mode('(EXPRESSION)');
            }

            if (last_text === ';' || last_type === 'TK_START_BLOCK') {
                print_newline();
            } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_text === '.') {
                // do nothing on (( and )( and ][ and ]( and .(
            } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                print_single_space();
            } else if (last_word === 'function' || last_word === 'typeof') {
                // function() vs function ()
                if (opt_jslint_happy) {
                    print_single_space();
                }
            } else if (in_array(last_text, line_starters) || last_text === 'catch') {
                print_single_space();
            }
            print_token();

            break;

        case 'TK_END_EXPR':
            if (token_text === ']') {
                if (opt_keep_array_indentation) {
                    if (last_text === '}') {
                        // trim_output();
                        // print_newline(true);
                        remove_indent();
                        print_token();
                        restore_mode();
                        break;
                    }
                } else {
                    if (flags.mode === '[INDENTED-EXPRESSION]') {
                        if (last_text === ']') {
                            restore_mode();
                            print_newline();
                            print_token();
                            break;
                        }
                    }
                }
            }
            restore_mode();
            print_token();
            break;

        case 'TK_START_BLOCK':

            if (last_word === 'do') {
                set_mode('DO_BLOCK');
            } else {
                set_mode('BLOCK');
            }
            if (opt_brace_style=="expand") {
                if (last_type !== 'TK_OPERATOR') {
                    if (last_text === 'return' || last_text === '=') {
                        print_single_space();
                    } else {
                        print_newline(true);
                    }
                }
                print_token();
                indent();
            } else {
                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                    if (last_type === 'TK_START_BLOCK') {
                        print_newline();
                    } else {
                        print_single_space();
                    }
                } else {
                    // if TK_OPERATOR or TK_START_EXPR
                    if (is_array(flags.previous_mode) && last_text === ',') {
                        if (last_last_text === '}') {
                            // }, { in array context
                            print_single_space();
                        } else {
                            print_newline(); // [a, b, c, {
                        }
                    }
                }
                indent();
                print_token();
            }

            break;

        case 'TK_END_BLOCK':
            restore_mode();
            if (opt_brace_style=="expand") {
                if (last_text !== '{') {
                    print_newline();
                }
                print_token();
            } else {
                if (last_type === 'TK_START_BLOCK') {
                    // nothing
                    if (just_added_newline) {
                        remove_indent();
                    } else {
                        // {}
                        trim_output();
                    }
                } else {
                    if (is_array(flags.mode) && opt_keep_array_indentation) {
                        // we REALLY need a newline here, but newliner would skip that
                        opt_keep_array_indentation = false;
                        print_newline();
                        opt_keep_array_indentation = true;

                    } else {
                        print_newline();
                    }
                }
                print_token();
            }
            break;

        case 'TK_WORD':

            // no, it's not you. even I have problems understanding how this works
            // and what does what.
            if (do_block_just_closed) {
                // do {} ## while ()
                print_single_space();
                print_token();
                print_single_space();
                do_block_just_closed = false;
                break;
            }

            if (token_text === 'function') {
                if (flags.var_line) {
                    flags.var_line_reindented = true;
                }
                if ((just_added_newline || last_text === ';') && last_text !== '{') {
                    // make sure there is a nice clean space of at least one blank line
                    // before a new function definition
                    n_newlines = just_added_newline ? n_newlines : 0;
                    if ( ! opt_preserve_newlines) {
                        n_newlines = 1;
                    }

                    for (var i = 0; i < 2 - n_newlines; i++) {
                        print_newline(false);
                    }
                }
            }

            if (token_text === 'case' || token_text === 'default') {
                if (last_text === ':') {
                    // switch cases following one another
                    remove_indent();
                } else {
                    // case statement starts in the same line where switch
                    flags.indentation_level--;
                    print_newline();
                    flags.indentation_level++;
                }
                print_token();
                flags.in_case = true;
                break;
            }

            prefix = 'NONE';

            if (last_type === 'TK_END_BLOCK') {

                if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    prefix = 'NEWLINE';
                } else {
                    if (opt_brace_style=="expand" || opt_brace_style=="end-expand") {
                        prefix = 'NEWLINE';
                    } else {
                        prefix = 'SPACE';
                        print_single_space();
                    }
                }
            } else if (last_type === 'TK_SEMICOLON' && (flags.mode === 'BLOCK' || flags.mode === 'DO_BLOCK')) {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
                prefix = 'SPACE';
            } else if (last_type === 'TK_STRING') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_WORD') {
                if (last_text === 'else') {
                    // eat newlines between ...else *** some_op...
                    // won't preserve extra newlines in this place (if any), but don't care that much
                    trim_output(true);
                }
                prefix = 'SPACE';
            } else if (last_type === 'TK_START_BLOCK') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_END_EXPR') {
                print_single_space();
                prefix = 'NEWLINE';
            }

            if (in_array(token_text, line_starters) && last_text !== ')') {
                if (last_text == 'else') {
                    prefix = 'SPACE';
                } else {
                    prefix = 'NEWLINE';
                }
            }

            if (flags.if_line && last_type === 'TK_END_EXPR') {
                flags.if_line = false;
            }
            if (in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                if (last_type !== 'TK_END_BLOCK' || opt_brace_style=="expand" || opt_brace_style=="end-expand") {
                    print_newline();
                } else {
                    trim_output(true);
                    print_single_space();
                }
            } else if (prefix === 'NEWLINE') {
                if ((last_type === 'TK_START_EXPR' || last_text === '=' || last_text === ',') && token_text === 'function') {
                    // no need to force newline on 'function': (function
                    // DONOTHING
                } else if (token_text === 'function' && last_text == 'new') {
                    print_single_space();
                } else if (last_text === 'return' || last_text === 'throw') {
                    // no newline between 'return nnn'
                    print_single_space();
                } else if (last_type !== 'TK_END_EXPR') {
                    if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                        // no need to force newline on 'var': for (var x = 0...)
                        if (token_text === 'if' && last_word === 'else' && last_text !== '{') {
                            // no newline for } else if {
                            print_single_space();
                        } else {
                            flags.var_line = false;
                            flags.var_line_reindented = false;
                            print_newline();
                        }
                    }
                } else if (in_array(token_text, line_starters) && last_text != ')') {
                    flags.var_line = false;
                    flags.var_line_reindented = false;
                    print_newline();
                }
            } else if (is_array(flags.mode) && last_text === ',' && last_last_text === '}') {
                print_newline(); // }, in lists get a newline treatment
            } else if (prefix === 'SPACE') {
                print_single_space();
            }
            print_token();
            last_word = token_text;

            if (token_text === 'var') {
                flags.var_line = true;
                flags.var_line_reindented = false;
                flags.var_line_tainted = false;
            }

            if (token_text === 'if') {
                flags.if_line = true;
            }
            if (token_text === 'else') {
                flags.if_line = false;
            }

            break;

        case 'TK_SEMICOLON':

            print_token();
            flags.var_line = false;
            flags.var_line_reindented = false;
            if (flags.mode == 'OBJECT') {
                // OBJECT mode is weird and doesn't get reset too well.
                flags.mode = 'BLOCK';
            }
            break;

        case 'TK_STRING':

            if (last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
                print_newline();
            } else if (last_type === 'TK_WORD') {
                print_single_space();
            }
            print_token();
            break;

        case 'TK_EQUALS':
            if (flags.var_line) {
                // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
                flags.var_line_tainted = true;
            }
            print_single_space();
            print_token();
            print_single_space();
            break;

        case 'TK_OPERATOR':

            var space_before = true;
            var space_after = true;

            if (flags.var_line && token_text === ',' && (is_expression(flags.mode))) {
                // do not break on comma, for(var a = 1, b = 2)
                flags.var_line_tainted = false;
            }

            if (flags.var_line) {
                if (token_text === ',') {
                    if (flags.var_line_tainted) {
                        print_token();
                        flags.var_line_reindented = true;
                        flags.var_line_tainted = false;
                        print_newline();
                        break;
                    } else {
                        flags.var_line_tainted = false;
                    }
                // } else if (token_text === ':') {
                    // hmm, when does this happen? tests don't catch this
                    // flags.var_line = false;
                }
            }

            if (last_text === 'return' || last_text === 'throw') {
                // "return" had a special handling in TK_WORD. Now we need to return the favor
                print_single_space();
                print_token();
                break;
            }

            if (token_text === ':' && flags.in_case) {
                print_token(); // colon really asks for separate treatment
                print_newline();
                flags.in_case = false;
                break;
            }

            if (token_text === '::') {
                // no spaces around exotic namespacing syntax operator
                print_token();
                break;
            }

            if (token_text === ',') {
                if (flags.var_line) {
                    if (flags.var_line_tainted) {
                        print_token();
                        print_newline();
                        flags.var_line_tainted = false;
                    } else {
                        print_token();
                        print_single_space();
                    }
                } else if (last_type === 'TK_END_BLOCK' && flags.mode !== "(EXPRESSION)") {
                    print_token();
                    if (flags.mode === 'OBJECT' && last_text === '}') {
                        print_newline();
                    } else {
                        print_single_space();
                    }
                } else {
                    if (flags.mode === 'OBJECT') {
                        print_token();
                        print_newline();
                    } else {
                        // EXPR or DO_BLOCK
                        print_token();
                        print_single_space();
                    }
                }
                break;
            // } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS']) || in_array(last_text, line_starters) || in_array(last_text, ['==', '!=', '+=', '-=', '*=', '/=', '+', '-'])))) {
            } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(last_text, line_starters)))) {
                // unary operators (and binary +/- pretending to be unary) special cases

                space_before = false;
                space_after = false;

                if (last_text === ';' && is_expression(flags.mode)) {
                    // for (;; ++i)
                    //        ^^^
                    space_before = true;
                }
                if (last_type === 'TK_WORD' && in_array(last_text, line_starters)) {
                    space_before = true;
                }

                if (flags.mode === 'BLOCK' && (last_text === '{' || last_text === ';')) {
                    // { foo; --i }
                    // foo(); --bar;
                    print_newline();
                }
            } else if (token_text === '.') {
                // decimal digits or object.property
                space_before = false;

            } else if (token_text === ':') {
                if (flags.ternary_depth == 0) {
                    flags.mode = 'OBJECT';
                    space_before = false;
                } else {
                    flags.ternary_depth -= 1;
                }
            } else if (token_text === '?') {
                flags.ternary_depth += 1;
            }
            if (space_before) {
                print_single_space();
            }

            print_token();

            if (space_after) {
                print_single_space();
            }

            if (token_text === '!') {
                // flags.eat_next_space = true;
            }

            break;

        case 'TK_BLOCK_COMMENT':

            var lines = token_text.split(/\x0a|\x0d\x0a/);

            if (all_lines_start_with(lines.slice(1), '*')) {
                // javadoc: reformat and reindent
                print_newline();
                output.push(lines[0]);
                for (i = 1; i < lines.length; i++) {
                    print_newline();
                    output.push(' ');
                    output.push(trim(lines[i]));
                }

            } else {

                // simple block comment: leave intact
                if (lines.length > 1) {
                    // multiline comment block starts with a new line
                    print_newline();
                    trim_output();
                } else {
                    // single-line /* comment */ stays where it is
                    print_single_space();

                }

                for (i = 0; i < lines.length; i++) {
                    output.push(lines[i]);
                    output.push('\n');
                }

            }
            print_newline();
            break;

        case 'TK_INLINE_COMMENT':

            print_single_space();
            print_token();
            if (is_expression(flags.mode)) {
                print_single_space();
            } else {
                force_newline();
            }
            break;

        case 'TK_COMMENT':

            // print_newline();
            if (wanted_newline) {
                print_newline();
            } else {
                print_single_space();
            }
            print_token();
            force_newline();
            break;

        case 'TK_UNKNOWN':
            if (last_text === 'return' || last_text === 'throw') {
                print_single_space();
            }
            print_token();
            break;
        }

        last_last_text = last_text;
        last_type = token_type;
        last_text = token_text;
    }

    var sweet_code = preindent_string + output.join('').replace(/[\n ]+$/, '');
    return sweet_code;

}

// Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var js_beautify = require("beautify").js_beautify`.
if (typeof exports !== "undefined")
    exports.js_beautify = js_beautify;
/*end beautify.js*/

/*begin highlight.js*/
/*
Syntax highlighting with language autodetection.
http://softwaremaniacs.org/soft/highlight/
*/

var hljs = new function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;');
  }

  function langRe(language, value, global) {
    return RegExp(
      value,
      'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
    );
  }

  function findCode(pre) {
    for (var i = 0; i < pre.childNodes.length; i++) {
      var node = pre.childNodes[i];
      if (node.nodeName == 'CODE')
        return node;
      if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/)))
        break;
    }
  }

  function blockText(block, ignoreNewLines) {
    var result = '';
    for (var i = 0; i < block.childNodes.length; i++)
      if (block.childNodes[i].nodeType == 3) {
        var chunk = block.childNodes[i].nodeValue;
        if (ignoreNewLines)
          chunk = chunk.replace(/\n/g, '');
        result += chunk;
      } else if (block.childNodes[i].nodeName == 'BR')
        result += '\n';
      else
        result += blockText(block.childNodes[i]);
    // Thank you, MSIE...
    if (/MSIE [678]/.test(navigator.userAgent))
      result = result.replace(/\r/g, '\n');
    return result;
  }

  function blockLanguage(block) {
    var classes = block.className.split(/\s+/)
    classes = classes.concat(block.parentNode.className.split(/\s+/));
    for (var i = 0; i < classes.length; i++) {
      var class_ = classes[i].replace(/^language-/, '');
      if (languages[class_] || class_ == 'no-highlight') {
        return class_;
      }
    }
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function (node, offset) {
      for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType == 3)
          offset += node.childNodes[i].nodeValue.length;
        else if (node.childNodes[i].nodeName == 'BR')
          offset += 1
        else {
          result.push({
            event: 'start',
            offset: offset,
            node: node.childNodes[i]
          });
          offset = arguments.callee(node.childNodes[i], offset)
          result.push({
            event: 'stop',
            offset: offset,
            node: node.childNodes[i]
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(stream1, stream2, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (stream1.length && stream2.length) {
        if (stream1[0].offset != stream2[0].offset)
          return (stream1[0].offset < stream2[0].offset) ? stream1 : stream2;
        else {
          /*
          To avoid starting the stream just before it should stop the order is
          ensured that stream1 always starts first and closes last:

          if (event1 == 'start' && event2 == 'start')
            return stream1;
          if (event1 == 'start' && event2 == 'stop')
            return stream2;
          if (event1 == 'stop' && event2 == 'start')
            return stream1;
          if (event1 == 'stop' && event2 == 'stop')
            return stream2;

          ... which is collapsed to:
          */
          return stream2[0].event == 'start' ? stream1 : stream2;
        }
      } else {
        return stream1.length ? stream1 : stream2;
      }
    }

    function open(node) {
      var result = '<' + node.nodeName.toLowerCase();
      for (var i = 0; i < node.attributes.length; i++) {
        var attribute = node.attributes[i];
        result += ' ' + attribute.nodeName.toLowerCase();
        if (attribute.nodeValue != undefined) {
          result += '="' + escape(attribute.nodeValue) + '"';
        }
      }
      return result + '>';
    }

    while (stream1.length || stream2.length) {
      var current = selectStream().splice(0, 1)[0];
      result += escape(value.substr(processed, current.offset - processed));
      processed = current.offset;
      if ( current.event == 'start') {
        result += open(current.node);
        nodeStack.push(current.node);
      } else if (current.event == 'stop') {
        var i = nodeStack.length;
        do {
          i--;
          var node = nodeStack[i];
          result += ('</' + node.nodeName.toLowerCase() + '>');
        } while (node != current.node);
        nodeStack.splice(i, 1);
        while (i < nodeStack.length) {
          result += open(nodeStack[i]);
          i++;
        }
      }
    }
    result += value.substr(processed);
    return result;
  }

  /* Core highlighting function */

  function highlight(language_name, value) {

    function subMode(lexem, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        if (mode.contains[i].beginRe.test(lexem)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode_index, lexem) {
      if (modes[mode_index].end && modes[mode_index].endRe.test(lexem))
        return 1;
      if (modes[mode_index].endsWithParent) {
        var level = endOfMode(mode_index - 1, lexem);
        return level ? level + 1 : 0;
      }
      return 0;
    }

    function isIllegal(lexem, mode) {
      return mode.illegalRe && mode.illegalRe.test(lexem);
    }

    function compileTerminators(mode, language) {
      var terminators = [];

      for (var i = 0; i < mode.contains.length; i++) {
        terminators.push(mode.contains[i].begin);
      }

      var index = modes.length - 1;
      do {
        if (modes[index].end) {
          terminators.push(modes[index].end);
        }
        index--;
      } while (modes[index + 1].endsWithParent);

      if (mode.illegal) {
        terminators.push(mode.illegal);
      }

      return langRe(language, '(' + terminators.join('|') + ')', true);
    }

    function eatModeChunk(value, index) {
      var mode = modes[modes.length - 1];
      if (!mode.terminators) {
        mode.terminators = compileTerminators(mode, language);
      }
      mode.terminators.lastIndex = index;
      var match = mode.terminators.exec(value);
      if (match)
        return [value.substr(index, match.index - index), match[0], false];
      else
        return [value.substr(index), '', true];
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0]
      for (var className in mode.keywordGroups) {
        if (!mode.keywordGroups.hasOwnProperty(className))
          continue;
        var value = mode.keywordGroups[className].hasOwnProperty(match_str);
        if (value)
          return [className, value];
      }
      return false;
    }

    function processKeywords(buffer, mode) {
      if (!mode.keywords)
        return escape(buffer);
      var result = '';
      var last_index = 0;
      mode.lexemsRe.lastIndex = 0;
      var match = mode.lexemsRe.exec(buffer);
      while (match) {
        result += escape(buffer.substr(last_index, match.index - last_index));
        var keyword_match = keywordMatch(mode, match);
        if (keyword_match) {
          keyword_count += keyword_match[1];
          result += '<span class="'+ keyword_match[0] +'">' + escape(match[0]) + '</span>';
        } else {
          result += escape(match[0]);
        }
        last_index = mode.lexemsRe.lastIndex;
        match = mode.lexemsRe.exec(buffer);
      }
      result += escape(buffer.substr(last_index, buffer.length - last_index));
      return result;
    }

    function processBuffer(buffer, mode) {
      if (mode.subLanguage && languages[mode.subLanguage]) {
        var result = highlight(mode.subLanguage, buffer);
        keyword_count += result.keyword_count;
        return result.value;
      } else {
        return processKeywords(buffer, mode);
      }
    }

    function startNewMode(mode, lexem) {
      var markup = mode.className?'<span class="' + mode.className + '">':'';
      if (mode.returnBegin) {
        result += markup;
        mode.buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexem) + markup;
        mode.buffer = '';
      } else {
        result += markup;
        mode.buffer = lexem;
      }
      modes.push(mode);
      relevance += mode.relevance;
    }

    function processModeInfo(buffer, lexem, end) {
      var current_mode = modes[modes.length - 1];
      if (end) {
        result += processBuffer(current_mode.buffer + buffer, current_mode);
        return false;
      }

      var new_mode = subMode(lexem, current_mode);
      if (new_mode) {
        result += processBuffer(current_mode.buffer + buffer, current_mode);
        startNewMode(new_mode, lexem);
        return new_mode.returnBegin;
      }

      var end_level = endOfMode(modes.length - 1, lexem);
      if (end_level) {
        var markup = current_mode.className?'</span>':'';
        if (current_mode.returnEnd) {
          result += processBuffer(current_mode.buffer + buffer, current_mode) + markup;
        } else if (current_mode.excludeEnd) {
          result += processBuffer(current_mode.buffer + buffer, current_mode) + markup + escape(lexem);
        } else {
          result += processBuffer(current_mode.buffer + buffer + lexem, current_mode) + markup;
        }
        while (end_level > 1) {
          markup = modes[modes.length - 2].className?'</span>':'';
          result += markup;
          end_level--;
          modes.length--;
        }
        var last_ended_mode = modes[modes.length - 1];
        modes.length--;
        modes[modes.length - 1].buffer = '';
        if (last_ended_mode.starts) {
          startNewMode(last_ended_mode.starts, '');
        }
        return current_mode.returnEnd;
      }

      if (isIllegal(lexem, current_mode))
        throw 'Illegal';
    }

    var language = languages[language_name];
    var modes = [language.defaultMode];
    var relevance = 0;
    var keyword_count = 0;
    var result = '';
    try {
      var index = 0;
      language.defaultMode.buffer = '';
      do {
        var mode_info = eatModeChunk(value, index);
        var return_lexem = processModeInfo(mode_info[0], mode_info[1], mode_info[2]);
        index += mode_info[0].length;
        if (!return_lexem) {
          index += mode_info[1].length;
        }
      } while (!mode_info[2]);
      if(modes.length > 1)
        throw 'Illegal';
      return {
        language: language_name,
        relevance: relevance,
        keyword_count: keyword_count,
        value: result
      }
    } catch (e) {
      if (e == 'Illegal') {
        return {
          language: null,
          relevance: 0,
          keyword_count: 0,
          value: escape(value)
        }
      } else {
        throw e;
      }
    }
  }

  /* Initialization */

  function compileModes() {

    function compileMode(mode, language, is_default) {
      if (mode.compiled)
        return;

      if (!is_default) {
        mode.beginRe = langRe(language, mode.begin ? mode.begin : '\\B|\\b');
        if (!mode.end && !mode.endsWithParent)
          mode.end = '\\B|\\b'
        if (mode.end)
          mode.endRe = langRe(language, mode.end);
      }
      if (mode.illegal)
        mode.illegalRe = langRe(language, mode.illegal);
      if (mode.relevance == undefined)
        mode.relevance = 1;
      if (mode.keywords)
        mode.lexemsRe = langRe(language, mode.lexems || hljs.IDENT_RE, true);
      for (var key in mode.keywords) {
        if (!mode.keywords.hasOwnProperty(key))
          continue;
        if (mode.keywords[key] instanceof Object)
          mode.keywordGroups = mode.keywords;
        else
          mode.keywordGroups = {'keyword': mode.keywords};
        break;
      }
      if (!mode.contains) {
        mode.contains = [];
      }
      // compiled flag is set before compiling submodes to avoid self-recursion
      // (see lisp where quoted_list contains quoted_list)
      mode.compiled = true;
      for (var i = 0; i < mode.contains.length; i++) {
        compileMode(mode.contains[i], language, false);
      }
      if (mode.starts) {
        compileMode(mode.starts, language, false);
      }
    }

    for (var i in languages) {
      if (!languages.hasOwnProperty(i))
        continue;
      compileMode(languages[i].defaultMode, languages[i], true);
    }
  }

  function initialize() {
    if (initialize.called)
        return;
    initialize.called = true;
    compileModes();
  }

  /* Public library functions */

  function highlightBlock(block, tabReplace, useBR) {
    initialize();

    var text = blockText(block, useBR);
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    if (language) {
      var result = highlight(language, text);
    } else {
      var result = {language: '', keyword_count: 0, relevance: 0, value: escape(text)};
      var second_best = result;
      for (var key in languages) {
        if (!languages.hasOwnProperty(key))
          continue;
        var current = highlight(key, text);
        if (current.keyword_count + current.relevance > second_best.keyword_count + second_best.relevance) {
          second_best = current;
        }
        if (current.keyword_count + current.relevance > result.keyword_count + result.relevance) {
          second_best = result;
          result = current;
        }
      }
    }

    var class_name = block.className;
    if (!class_name.match(result.language)) {
      class_name = class_name ? (class_name + ' ' + result.language) : result.language;
    }
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElement('pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    if (tabReplace) {
      result.value = result.value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, tabReplace);
      })
    }
    if (useBR) {
      result.value = result.value.replace(/\n/g, '<br>');
    }
    if (/MSIE [678]/.test(navigator.userAgent) && block.tagName == 'CODE' && block.parentNode.tagName == 'PRE') {
      // This is for backwards compatibility only. IE needs this strange
      // hack becasue it cannot just cleanly replace <code> block contents.
      var pre = block.parentNode;
      var container = document.createElement('div');
      container.innerHTML = '<pre><code>' + result.value + '</code></pre>';
      block = container.firstChild.firstChild;
      container.firstChild.className = pre.className;
      pre.parentNode.replaceChild(container.firstChild, pre);
    } else {
      block.innerHTML = result.value;
    }
    block.className = class_name;
    block.dataset = {};
    block.dataset.result = {
      language: result.language,
      kw: result.keyword_count,
      re: result.relevance
    };
    if (second_best && second_best.language) {
      block.dataset.second_best = {
        language: second_best.language,
        kw: second_best.keyword_count,
        re: second_best.relevance
      };
    }
  }

  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;
    initialize();
    var pres = document.getElementsByTagName('pre');
    for (var i = 0; i < pres.length; i++) {
      var code = findCode(pres[i]);
      if (code)
        highlightBlock(code, hljs.tabReplace);
    }
  }

  function initHighlightingOnLoad() {
    var original_arguments = arguments;
    var handler = function(){initHighlighting.apply(null, original_arguments)};
    if (window.addEventListener) {
      window.addEventListener('DOMContentLoaded', handler, false);
      window.addEventListener('load', handler, false);
    } else if (window.attachEvent)
      window.attachEvent('onload', handler);
    else
      window.onload = handler;
  }

  var languages = {}; // a shortcut to avoid writing "this." everywhere

  /* Interface definition */

  this.LANGUAGES = languages;
  this.initHighlightingOnLoad = initHighlightingOnLoad;
  this.highlightBlock = highlightBlock;
  this.initHighlighting = initHighlighting;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)';
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\.', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$'
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/'
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$'
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };

  // Utility functions
  this.inherit = function(parent, obj) {
    var result = {}
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  }
}();

/*end highlight.js*/

/*begin highlight-javascript.js*/
/*
Language: Javascript
Category: common
*/

hljs.LANGUAGES.javascript = {
  defaultMode: {
    keywords: {
      'keyword': {'in': 1, 'if': 1, 'for': 1, 'while': 1, 'finally': 1, 'var': 1, 'new': 1, 'function': 1, 'do': 1, 'return': 1, 'void': 1, 'else': 1, 'break': 1, 'catch': 1, 'instanceof': 1, 'with': 1, 'throw': 1, 'case': 1, 'default': 1, 'try': 1, 'this': 1, 'switch': 1, 'continue': 1, 'typeof': 1, 'delete': 1},
      'literal': {'true': 1, 'false': 1, 'null': 1}
    },
    contains: [
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      { // regexp container
        begin: '(' + hljs.RE_STARTERS_RE + '|case|return|throw)\\s*',
        keywords: {'return': 1, 'throw': 1, 'case': 1},
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'regexp',
            begin: '/.*?[^\\\\/]/[gim]*'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        begin: '\\bfunction\\b', end: '{',
        keywords: {'function': 1},
        contains: [
          {
            className: 'title', begin: '[A-Za-z$_][0-9A-Za-z$_]*'
          },
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          }
        ]
      }
    ]
  }
};

/*end highlight-javascript.js*/

/*begin queryparams.js*/
    	var wb = {};

		// Source: http://stackoverflow.com/a/13984429
		wb.urlToQueryParams = function(url){
		    var qparams = {},
		        parts = (url||'').split('?'),
		        qparts, qpart,
		        i=0;

		    if(parts.length <= 1 ){
		        return qparams;
		    }else{
		        qparts = parts[1].split('&');
		        for(i in qparts){

		            qpart = qparts[i].split('=');
		            qparams[decodeURIComponent(qpart[0])] =
		                           decodeURIComponent(qpart[1] || '');
		        }
		    }

		    return qparams;
		};

		wb.queryParamsToUrl = function(params){
			var base = location.href.split('?')[0];
			var keys = Object.keys(params);
			var parts = [];
			keys.forEach(function(key){
				if (Array.isArray(params[key])){
					params[key].forEach(function(value){
						parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
					});
				}else{
					parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
				}
			});
			return base + '?' + parts.join('&');
		}

	    var q = wb.urlToQueryParams(location.href);
		wb.queryParams = q;
		wb.view = wb.queryParams.view || 'editor';
	    // if they don't have the plugin part of the query string lets send them back home.

/*end queryparams.js*/

/*begin util.js*/
(function(global){
    //
    //
    // UTILITY FUNCTIONS
    //
    // A bunch of these are to avoid needing jQuery just for simple things like matches(selector) and closest(selector)
    //
    //
    // TODO
    // Make these methods on HTMLDocument, HTMLElement, NodeList prototypes

    wb.makeArray = function makeArray(arrayLike){
        return Array.prototype.slice.call(arrayLike);
    };

    wb.reposition = function reposition(elem, position){
        // put an absolutely positioned element in the right place
        // May need to take into account offsets of container
        elem.style.top = position.top + 'px';
        elem.style.left = position.left + 'px';
    };

    wb.hide = function(elem){
        elem.dataset.display = elem.style.display;
        elem.style.display = 'none';
    };

    wb.show = function(elem){
        elem.style.display = elem.dataset.display || 'block';
        delete elem.dataset.display;
    };

    // wb.mag = function mag(p1, p2){
    //     return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
    // };

    wb.dist = function dist(p1, p2, m1, m2){
        return Math.sqrt(Math.pow(p1 - m1, 2) + Math.pow(p2 - m2, 2));
    };


    wb.overlapRect = function overlapRect(r1, r2){ // determine area of overlap between two rects
        if (r1.left > r2.right){ return 0; }
        if (r1.right < r2.left){ return 0; }
        if (r1.top > r2.bottom){ return 0; }
        if (r1.bottom < r2.top){ return 0; }
        var max = Math.max, min = Math.min;
        return (max(r1.left, r2.left) - min(r1.right, r2.right)) * (max(r1.top, r2.top) - min(r1.bottom, r2.bottom));
    };

    wb.rect = function rect(elem){
        return elem.getBoundingClientRect();
    };

    wb.overlap = function overlap(elem1, elem2){
        return wb.overlapRect(wb.rect(elem1), wb.rect(elem2));
    };

    wb.area = function area(elem){
        return elem.clientWidth * elem.clientHeight;
    };

    wb.containedBy = function containedBy(target, container){
        var targetArea = Math.min(wb.area(target), wb.area(container) * 0.90);
        return target.overlap(container) >= targetArea;
    };

    wb.closest = function closest(elem, selector){
        if (elem.jquery){
            elem = elem[0];
        }
        while(elem){
            if (wb.matches(elem, selector)){
                return elem;
            }
            if (!elem.parentElement){
                throw new Error('Element has no parent, is it in the tree? %o', elem);
            }
            elem = elem.parentElement;
        }
        return null;
    };

    wb.indexOf = function indexOf(elem){
        var idx = 0;
        while(elem.previousSiblingElement){
            elem = elem.previousSiblingElement;
            idx++;
        }
        return idx;
    }

    wb.find = function find(elem, selector){
        return elem.querySelector(selector);
    };

    wb.findAll = function findAll(elem, selector){
        return wb.makeArray(elem.querySelectorAll(selector));
    };

    wb.findChildren = function findChildren(elem, selector){
        return wb.makeArray(elem.children).filter(function(item){
            return wb.matches(item, selector);
        });
    };

    wb.findChild = function(){
        var args = wb.makeArray(arguments);
        var elem = wb.elem(args.shift());
        var children, selector;
        while(args.length){
            selector = args.shift();
            children = wb.makeArray(elem.children);
            for(var i = 0; i < children.length; i++){
                if (wb.matches(children[i], selector)){
                    elem = children[i];
                    break;
                }
            }
        }
        return elem;
    }

    wb.elem = function elem(name, attributes, children){
        // name can be a jquery object, an element, or a string
        // attributes can be null or undefined, or an object of key/values to set
        // children can be text or an array. If an array, can contain strings or arrays of [name, attributes, children]
        var e, val;
        if (name.jquery){
            e = name[0];
        }else if(name.nodeType){
            e = name;
        }else{
            // assumes name is a string
            e = document.createElement(name);
        }
        if (attributes){
            Object.keys(attributes).forEach(function(key){
                if (typeof attributes[key] === 'function'){
                    val = attributes[key](attributes);
                    if (val){
                        e.setAttribute(key, val);
                    }
                }else{
                    e.setAttribute(key, attributes[key]);
                }
            });
        }
        if (children){
            if (Array.isArray(children)){
                children.forEach(function(child){
                    if (child.nodeName){
                        e.appendChild(child);
                    }else if (Array.isArray(child)){
                        console.log('DEPRECATED array arg to elem: use sub-elem instead');
                        e.appendChild(elem(child[0], child[1], child[2]));
                    }else{
                        // assumes child is a string
                        e.appendChild(document.createTextNode(child));
                    }
                });
            }else{
                if (children.nodeName){
                    // append single node
                    e.appendChild(children);
                }else{
                    // assumes children is a string
                    e.appendChild(document.createTextNode(children));
                }
            }
        }
        return e;
    };


    // Remove namespace for matches
    if (document.body.matches){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).matches(selector); };
    }else if(document.body.mozMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).mozMatchesSelector(selector); };
    }else if (document.body.webkitMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).webkitMatchesSelector(selector); };
    }else if (document.body.msMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).msMatchesSelector(selector); };
    }else if(document.body.oMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).oMatchesSelector(selector); };
    }

    // AJAX utilities

    var jsonpHandlers = {};
    wb.jsonp = function(url, callback){
        var id = 'handler' + Math.floor(Math.random() * 0xFFFF);
        var handler = function(data){
            // remove jsonp element
            var script = document.getElementById(id);
            script.parentElement.removeChild(script);
            // remove self
            delete window[id];
            callback(data);
        };
        window[id] = handler;
        document.head.append(wb.elem('script', {src: url, id: id}));
    }




})(this);

/*end util.js*/

/*begin event.js*/
// Add support for event delegation on top of normal DOM events
// Minimal support for non-DOM events
// Normalized between mouse and touch events

(function(global){
    "use strict";

    var on = function on(elem, eventname, selector, handler){
        if (typeof elem === 'string'){
            return wb.makeArray(document.querySelectorAll(elem)).map(function(e){
                return on(e, eventname, selector, handler);
            });
        }
        if (!elem.tagName){ console.error('first argument must be element'); }
        if (typeof eventname !== 'string'){ console.error('second argument must be eventname'); }
        if (selector && typeof selector !== 'string'){ console.log('third argument must be selector or null'); }
        if (typeof handler !== 'function'){ console.flog('fourth argument must be handler'); }
        var listener;
        if (selector){
            listener = function(event){
                blend(event); // normalize between touch and mouse events
                // if (eventname === 'mousedown'){
                //     console.log(event);
                // }
                if (!event.wbValid) return;
                if (wb.matches(event.wbTarget, selector)){
                    handler(event);
                }else if (wb.matches(event.wbTarget, selector + ' *')){
                    event.wbTarget = wb.closest(event.wbTarget, selector);
                    handler(event);
                }
            };
        }else{
            listener = function(event){
                blend(event);
                if (!event.wbValid) return;
                handler(event);
            };
        }
        elem.addEventListener(eventname, listener);
        return listener;
    };

    var off = function(elem, eventname, handler){
        elem.removeEventListener(eventname, handler);
    }

    var once = function(elem, eventname, selector, handler){
        var listener = function listener(event){
            handler(event);
            Event.off(elem, eventname, listener);
        };
        return Event.on(elem, eventname, selector, listener);
    }

    var trigger = function(elemOrSelector, eventname, data){
        var elem;
        if (elemOrSelector.nodeName){
            elem = elemOrSelector;
        }else{
            elem = document.querySelector(elem);
        }
        var evt = new CustomEvent(eventname, {detail: data});
        elem.dispatchEvent(evt);
    };

    // Are touch events supported?
    var isTouch = ('ontouchstart' in global);

    // Treat mouse events and single-finger touch events similarly
    var blend = function(event){
        if (isTouch){
            if (event.touches.length > 1){
                return event;
            }
            var touch = event.touches[0];
            event.wbTarget = touch.target;
            event.wbPageX = touch.pageX;
            event.wbPageY = touch.pageY;
            event.wbValid = true;
        }else{
            if (event.which !== 1){ // left mouse button
                return event;
            }
            event.wbTarget = event.target;
            event.wbPageX = event.pageX;
            event.wbPageY = event.pageY;
            event.wbValid = true;
        }
        // fix target?
        return event;
    }


    global.Event = {
        on: on,
        off: off,
        once: once,
        trigger: trigger,
        isTouch: isTouch
    };
})(this);

/*end event.js*/

/*begin drag.js*/
(function(global){

    // FIXME: Remove references to waterbear or jquery (jquery done!)
    // FIXME: Include mousetouch in garden
    // FIXME: Refactor utilities for testing rectangles to its own library (done)


// Goals:
//
// Drag any block from block menu to canvas: clone and add to canvas
// Drag any block from anywhere besides menu to menu: delete block and attached blocks
// Drag any attached block to canvas: detach and add to canvas
// Drag any block (from block menu, canvas, or attached) to a matching, open attachment point: add to that script at that point
//    Triggers have no flap, so no attachment point
//    Steps can only be attached to flap -> slot
//    Values can only be attached to sockets of a compatible type
// Drag any block to anywhere that is not the block menu or on a canvas: undo the drag

// Drag Pseudocode
//
// Mouse Dragging:
//
// 1. On mousedown, test for potential drag target
// 2. On mousemove, if mousedown and target, start dragging
//     a) test for potential drop targets, remember them for hit testing
//     b) hit test periodically (not on mouse move)
//     c) clone element (if necessary)
//     d) if dragging out of a socket, replace with input of proper type
//     e) move drag target
// 3. On mouseup, if dragging, stop
//     a) test for drop, handle if necessary
//     b) clean up temporary elements, remove or move back if not dropping
//
//
// Touch dragging
//
// 1. On touchmove, test for potential drag target, start dragging
//     a..d as above
// 2. On touchend, if dragging, stop
//    a..b as above

// Key to jquery.event.touch is the timer function for handling movement and hit testing

    var dragTimeout = 20;
    var snapDist = 25; //In pixels
    var startParent;
    var startIndex;
    var timer;
    var dragTarget;
    var dropTarget;
    var dragging;
    var currentPosition;
    var scope;
    var workspace;
    var blockMenu = document.querySelector('#block_menu');
    var potentialDropTargets;
    var selectedSocket;

    var _dropCursor;

    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.dropCursor');
        }
        return _dropCursor;
    }

    function reset(){
        dragTarget = null;
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        dragging = false;
        cloned = false;
        scope = null;
    }
    reset();



    function initDrag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        var eT = event.wbTarget;
        if (wb.matches(eT, 'input, select, option, .disclosure')  && !wb.matches(eT, '#block_menu *')) {
            console.log('not a drag handle');
            return undefined;
        }
        var target = wb.closest(eT, '.block');
        if (target){
            // console.log('got a drag target: %o', target);
            dragTarget = target;
            if (target.parentElement.classList.contains('block-menu')){
                target.dataset.isTemplateBlock = 'true';
            }
            if (target.parentElement.classList.contains('local')){
                target.dataset.isLocal = 'true';
            }
            //dragTarget.classList.add("dragIndication");
            startPosition = wb.rect(target);
            if (! wb.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            // Need index too, if it is a step
            if (wb.matches(target, '.step')){
                startIndex = wb.indexOf(target);
            }
        }else{
            console.log('not a valid drag target');
            dragTarget = null;
        }
        return false;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {return undefined;}
        if (wb.matches(dragTarget, '.expression')){
            wb.hide(dropCursor());
        }
        dragTarget.classList.add("dragIndication");
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
        if (dragTarget.dataset.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            dragTarget = dragTarget.cloneNode(true); // clones dataset and children, yay
            delete dragTarget.dataset.isTemplateBlock;
            dragTarget.classList.add('dragIndication');
            if (dragTarget.dataset.isLocal){
                scope = wb.closest(parent, '.context');
            }else{
                scope = null;
            }
            cloned = true;
            // Make sure the workspace is available to drag to
            wb.showWorkspace('block');
        }else{
            // TODO: handle detach better (generalize restoring sockets, put in language file)
            // FIXME: Need to handle this somewhere
            // FIXME: Better name?
            Event.trigger(dragTarget, 'removeFromScript');
        }
        dragging = true;
        // get position and append target to .content, adjust offsets
        // set last offset
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
//        if (wb.matches(dragTarget, '.scripts_workspace .step')){
//            dragPlaceholder.style.height = dragTarget.clientHeight + 'px';
//            dragTarget.parentElement.insertBefore(dragPlaceholder, dragTarget);
//        }
        document.querySelector('.content.editor').appendChild(dragTarget);
        wb.reposition(dragTarget, startPosition);
        potentialDropTargets = getPotentialDropTargets(dragTarget);
        dropRects = potentialDropTargets.map(function(elem, idx){
            elem.classList.add('dropTarget');
            return wb.rect(elem);
        });

        // start timer for drag events
        timer = setTimeout(hitTest, dragTimeout);
        return false;
    }

    function drag(event){
        if (!dragTarget) {return undefined;}
        if (!currentPosition) {startDrag(event);}
        event.preventDefault();
        // update the variables, distance, button pressed
        var nextPosition = {left: event.wbPageX, top: event.wbPageY};
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget);
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        currentPosition = nextPosition;
        return false;
    }

    function endDrag(end){
        clearTimeout(timer);
        timer = null;
        if (!dragging) {return undefined;}
        handleDrop();
        reset();
        return false;
    }

    function handleDrop(){
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        dragTarget.classList.remove('dragActive');
        dragTarget.classList.remove('dragIndication');
        potentialDropTargets.forEach(function(elem){
            elem.classList.remove('dropTarget');
        });
        if (wb.overlap(dragTarget, blockMenu)){
            // delete block if dragged back to menu
            // FIXME: Handle this event
            console.log('triggering deleteBlock');
            Event.trigger(dragTarget, 'deleteBlock');
            dragTarget.parentElement.removeChild(dragTarget);
        }else if (wb.overlap(dragTarget, workspace)){
            dropTarget.classList.remove('dropActive');
            if (wb.matches(dragTarget, '.step')){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                dropTarget.insertBefore(dragTarget, dropCursor());
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'addToScript', dropTarget);
            }else{
                console.log('inserting a value in a socket');
                // Insert a value block into a socket
                wb.findChildren(dropTarget, 'input, select').forEach(function(elem){
                    wb.hide(elem); // FIXME: Move to block.js
                });
                dropTarget.appendChild(dragTarget);
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'addToScript', dropTarget);
            }
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                // Put blocks back where we got them from
                if (startParent){
                    if (wb.matches(startParent, '.socket')){
                        wb.findChildren(startParent, 'input').forEach(function(elem){
                            elem.hide();
                        });
                    }
                    startParent.appendChild(dragTarget); // FIXME: We'll need an index into the contained array
                    dragTarget.removeAttribute('style');
                    startParent = null;
                }else{
                    workspace.appendChild(dragTarget); // FIXME: We'll need an index into the canvas array
                    wb.reposition(dragTarget, startPosition);
                }
            }
        }
    }

    function positionExpressionDropCursor(){
        if (!potentialDropTargets.length){
            console.log('no drop targets found');
            return;
        }
        var targets = potentialDropTargets.map(function(target){
            return [wb.overlap(dragTarget, target), target];
        });
        targets.sort().reverse();
        if(dropTarget){
            dropTarget.classList.remove('dropActive');
        }
        dropTarget = targets[0][1]; // should be the potential target with largest overlap
        dropTarget.classList.add('dropActive');
    }

    function positionDropCursor(){
        var position, middle, y = wb.rect(dragTarget).top;
        for (var tIdx = 0; tIdx < potentialDropTargets.length; tIdx++){
            dropTarget = potentialDropTargets[tIdx];
            if (wb.overlap(dragTarget, dropTarget)){
                var siblings = wb.findChildren(dropTarget, '.step');
                if (siblings.length){
                    for (sIdx = 0; sIdx < siblings.length; sIdx++){
                        var sibling = siblings[sIdx];
                        position = wb.rect(sibling);
                        if (y < position.top || y > position.bottom) continue;
                        middle = position.top + (position.height / 2);
                        if (y < middle){
                            dropTarget.insertBefore(dropCursor(), sibling);
                            return;
                        }else{
                            dropTarget.insertBefore(dropCursor(), sibling.nextSibling);
                            return;
                        }
                    }
                }else{
                    dropTarget.appendChild(dropCursor());
                    return;
                }
            }
        }
        wb.findAll(workspace, '.step').forEach(function(elem){
            // FIXME: Convert to for() iteration to avoid going over every element
            position = wb.rect(elem);
            if (y < position.top || y > position.bottom) return;
            middle = position.top + (position.height / 2);
            if (y < middle){
                elem.parentElement.insertBefore(dropCursor(), elem);
            }else{
                elem.parentElement.insertBefore(dropCursor(), elem.nextSibling);
            }
        });
    }

    function selectSocket(event){
        // FIXME: Add tests for type of socket, whether it is filled, etc.
        event.wbTarget.classList.add('selected');
        selectedSocket = event.wbTarget;
    }

    function hitTest(){
        // test the dragging rect(s) against the target rect(s)
        // test all of the left borders first, then the top, right, bottom
        // goal is to eliminate negatives as fast as possible
        if (!dragTarget) {return;}
        if (wb.matches(dragTarget, '.expression')){
            positionExpressionDropCursor();
        }else{
            positionDropCursor();
        }
        setTimeout(hitTest, dragTimeout);
    }

    function expressionDropTypes(expressionType){
        switch(expressionType){
            case 'number': return ['.number', '.int', '.float', '.any'];
            case 'int': return ['.number', '.int', '.float', '.any'];
            case 'float': return ['.number', '.float', '.any'];
            case 'any': return [];
            default: return ['.' + expressionType, '.any'];
        }
    }

    function hasChildBlock(elem){
        // FIXME, I don't know how to work around this if we allow default blocks
        return true;
    }

    function getPotentialDropTargets(view){
        if (!workspace){
            workspace = document.querySelector('.scripts_workspace').querySelector('.contained');
        }
        var blocktype = view.dataset.blocktype;
        switch(blocktype){
            case 'step':
            case 'context':
                if (scope){
                    return wb.findAll(scope, '.contained');
                }else{
                    return wb.findAll(workspace, '.contained').concat([workspace]);
                }
            case 'expression':
                var selector = expressionDropTypes(view.dataset.type).map(dataSelector).join(',');
                if (scope){
                    return wb.findAll(scope, selector).filter(hasChildBlock);
                }else{
                    return wb.findAll(workspace, selector).filter(hasChildBlock);
                }
            case 'eventhandler':
                return [workspace];
            default:
                throw new Error('Unrecognized blocktype: ' + blocktype);
        }
    };

    function dataSelector(name){
        if (name[0] === '.'){
            name = name.slice(1); // remove leading dot
        }
        return '.socket[data-type=' + name + '] > .holder';
    }

    // Initialize event handlers
    wb.initializeDragHandlers = function(){
        if (Event.isTouch){
            Event.on('.scripts_workspace .contained, .block-menu', 'touchstart', '.block', initDrag);
            Event.on('.content', 'touchmove', null, drag);
            Event.on('.content', 'touchend', null, endDrag);
            Event.on('.scripts_workspace', 'tap', '.socket', selectSocket);
        }else{
            Event.on('.scripts_workspace .contained, .block-menu', 'mousedown', '.block', initDrag);
            Event.on('.content', 'mousemove', null, drag);
            Event.on('.content', 'mouseup', null, endDrag);
            Event.on('.scripts_workspace', 'click', '.socket', selectSocket);
        }
    };



})(this);


/*end drag.js*/

/*begin uuid.js*/
// This returns a Version 4 (random) UUID
// See: https://en.wikipedia.org/wiki/Universally_unique_identifier for more info

function hex(length){
  if (length > 8) return hex(8) + hex(length-8); // routine is good for up to 8 digits
  var myHex = Math.random().toString(16).slice(2,2+length);
  return pad(myHex, length); // just in case we don't get 8 digits for some reason
}

function pad(str, length){
    while(str.length < length){
        str += '0';
    }
    return str;
}

function variant(){
    return '89ab'[Math.floor(Math.random() * 4)];
}

// Constants
var UUID_TEST = /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}/;

function isUuid(value){
  return UUID_TEST.test(value);
}

// Public interface
function uuid(){
  return hex(8) + '-' + hex(4) + '-4' + hex(3) + '-' + variant() + hex(3) + '-' + hex(12);
}


/*end uuid.js*/

/*begin block.js*/
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
        return blockRegistry[obj.scriptid || obj.id].sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj);
        });
    }

    var Block = function(obj){
        // FIXME:
        // Handle values coming from serialized (saved) blocks
        // Handle customized names (sockets)
        registerBlock(obj);
        var block = elem(
            'div',
            {
                'class': function(){
                    var names = ['block', obj.group, obj.blocktype];
                    if (obj.blocktype === 'context'){
                        names.push('step');
                    }else if (obj.blocktype === 'eventhandler'){
                        names.push('step');
                        names.push('context');
                    }
                    return names.join(' ');
                },
                'data-blocktype': obj.blocktype,
                'id': obj.id,
                'data-scopeid': obj.scopeid || 0,
                'data-scriptid': obj.scriptid || obj.id,
                'title': obj.help || getHelp(obj.scriptid || obj.id)
            },
            elem('div', {'class': 'label'}, getSockets(obj))
        );
        if (obj.type){
            block.dataset.type = obj.type; // capture type of expression blocks
        }
        if (obj.blocktype === 'context' || obj.blocktype === 'eventhandler'){
            block.appendChild(elem('div', {'class': 'locals block-menu'}, (obj.locals || []).map(
                function(spec){
                    spec.isTemplateBlock = true;
                    spec.isLocal = true;
                    spec.group = obj.group;
                    return Block(spec)
                })));
            block.appendChild(elem('div', {'class': 'contained'}, (obj.contained || []).map(Block)));
        }
        return block;
    }

    var Socket = function(obj, block){
        // obj is a socket descriptor object, block is the owner block descriptor
        // Sockets are described by text, type, and default value
        // type and default value are optional, but if you have one you must have the other
        // If the type is choice it must also have a choicename for the list of values
        // that can be found in the wb.choiceLists
        var socket = elem('div',
            {
                'class': 'socket',
                'data-name': obj.name,
                'data-id': block.id,
                'data-seq-num': block.seqNum
            },
            elem('span', {'class': 'name'}, obj.name)
        );
        socket.firstElementChild.innerHTML = socket.firstElementChild.innerHTML.replace(/##/, ' <span class="seq-num">' + block.seqNum + '</span>');
        if (obj.type){
            socket.dataset.type = obj.type;
            socket.appendChild(elem('div', {'class': 'holder'}, [Default(obj)]))
        }
        return socket;
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
            case 'any':
                value = obj.value || ''; break;
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
            case 'image':
                value = obj.value || ''; break;
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
                    value = obj.value || '';
                }
        }
        return elem('input', {type: type, value: value});
    }


    wb.Block = Block;
    wb.registerSeqNum = registerSeqNum;

})(wb);


/*end block.js*/

/*begin ui.js*/
(function(wb){

// UI Chrome Section

function tabSelect(event){
    var target = event.wbTarget;
    document.querySelector('.tabbar .selected').classList.remove('selected');
    target.classList.addToScriptEvent('selected');
    if (wb.matches(target, '.scripts_workspace_tab')){
        showWorkspace('block');
    }else if (self.is('.scripts_text_view_tab')){
        showWorkspace('text');
        updateScriptsView();
    }
}
Event.on('.tabbar', 'click', '.chrome_tab', tabSelect);

function accordion(event){
    var open = document.querySelector('#block_menu .open');
    if (open){
        open.classList.remove('open');
    }
    if (open && open === event.wbTarget.nextSibling) return;
    event.wbTarget.nextSibling.classList.add('open');
}

Event.on('#block_menu', 'click', '.accordion-header', accordion);


function showWorkspace(mode){
    var workspace = document.querySelector('.workspace');
    if (mode === 'block'){
        workspace.classList.remove('textview');
        workspace.classList.add('blockview');
    }else if (mode === 'text'){
        workspace.classList.remove('blockview');
        workspace.classList.add('textview');
    }
}
// Expose this to dragging and saving functionality
wb.showWorkspace = showWorkspace;

function updateScriptsView(){
    var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
    var view = wb.find(document.body, '.workspace .scripts_text_view');
    wb.writeScript(blocks, view);
}
window.updateScriptsView = updateScriptsView;

function runCurrentScripts(event){
	if (document.body.className === 'result' && wb.script){
		wb.runScript(wb.script);
	}else{
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
		document.body.className = 'result';
		wb.runScript( wb.prettyScript(blocks) );
	}
}
Event.on('.runScripts', 'click', null, runCurrentScripts);

wb.runScript = function(script){
	wb.script = script;
	document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'runscript', script: script}), '*');
}

function clearStage(event){
	document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
Event.on('.clear_canvas', 'click', null, clearStage);

// Context Menu
//
// 'this' is the object matching the selector
// key is the key in the items object
// opt is the context menu object itself

function cloneCommand(key, opt){
    console.info('cloneCommand(%s, %o)', key, opt);
}

function editCommand(key, opt){
    console.info('editCommand(%s, %o)', key, opt);
}

function expandCommand(key, opt){
    console.info('expandCommand(%s, %o)', key, opt);
}

function collapseCommand(key, opt){
    console.info('collapseCommand(%s, %o)', key, opt);
}

function cutBlockCommand(key, opt){
    console.info('cutBlockCommand(%o, %s, %o)', this, key, opt);
    var view = this.closest('.wrapper');
    pasteboard = Block.model(view);
    // Remove it programatically, and trigger the right events:
    removeFromScriptEvent(view);
    view.remove();
}

function copyBlockCommand(key, opt){
    console.info('copyBlockCommand(%s, %o)', key, opt);
    pasteboard = Block.model(this.closest('.wrapper')).clone();
}

function copySubscriptCommand(key, opt){
    console.info('copySubscriptCommand(%s, %o)', key, opt);
    pasteboard = Block.model(this.closest('.wrapper')).clone(true);
}

function pasteCommand(key, opt){
    console.info('pasteCommand(%s, %o)', key, opt);
    if (pasteboard){
        this.append(pasteboard.view());
        addToScriptEvent(this, pasteboard.view());
    }
}

function pasteExpressionCommand(key, opt){
    console.info('pasteExpressionCommand(%s, %o)', key, opt);
    if (pasteboard && pasteboard.blocktype === 'expression'){
        this.hide();
        pasteCommand.call(this.parent(), key, opt);
    }
}

function pasteStepCommand(key, opt){
    console.info('pasteStepCommand(%s, %o)', key, opt);
    if (pasteboard && pasteboard.blocktype !== 'expression'){
        if (this.find('> .wrapper').length){
            console.log('already has a child element');
        }else{
            pasteCommand.call(this, key, opt);
        }
    }
}

function cancelCommand(key, opt){
    console.info('cancelCommand(%s, %o)', key, opt);
}

var pasteboard = null;

// $.contextMenu({
//     selector: '.scripts_workspace .block',
//     items: {
//         //clone: {'name': 'Clone', icon: 'add', callback: cloneCommand},
//         //edit: {'name': 'Edit', icon: 'edit', callback: editCommand},
//         //expand: {'name': 'Expand', callback: expandCommand},
//         //collapse: {'name': 'Collapse', callback: collapseCommand},
//         cut: {'name': 'Cut block', icon: 'cut', callback: cutBlockCommand},
//         copy: {'name': 'Copy block', icon: 'copy', callback: copyBlockCommand},
//         copySubscript: {'name': 'Copy subscript', callback: copySubscriptCommand},
//         //paste: {'name': 'Paste', icon: 'paste', callback: pasteCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
//
// $.contextMenu({
//    selector: '.scripts_workspace',
//    items: {
//        paste: {'name': 'Paste', icon: 'paste', callback: pasteCommand},
//        cancel: {'name': 'Cancel', callback: cancelCommand}
//    }
// });
//
// $.contextMenu({
//     selector: '.scripts_workspace .value > input',
//     items: {
//         paste: {'name': 'Paste', icon: 'paste', callback: pasteExpressionCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
//
// $.contextMenu({
//     selector: '.scripts_workspace .contained',
//     items: {
//         paste: {'name': 'Paste', icon: 'paste', callback: pasteStepCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
//

// TODO: add event handler to enable/disable, hide/show items based on state of block

// Handle Context menu for touch devices:
// Test drawn from modernizr

function is_touch_device() {
  return !!('ontouchstart' in window);
}

// if (is_touch_device()){
//     $.tappable({
//         container: '.blockmenu, .workspace',
//         selector: '.block',
//         callback: function(){
//             console.info('long tap detected');
//             console.info(this);
//             this.contextMenu();
//         },
//         touchDelay: 150
//     });
// }

var menu_built = false;
var saved_menus = [];

// Build the Blocks menu, this is a public method
wb.menu = function(blockspec){
    var title = blockspec.name.replace(/\W/g, '');
    var specs = blockspec.blocks;
	switch(wb.view){
		case 'result': return run_menu(title, specs);
		case 'blocks': return edit_menu(title, specs);
		case 'editor': return edit_menu(title, specs);
		default: return edit_menu(title, specs);
	}
};

function run_menu(title, specs){
	if (menu_built){
		return edit_menu(title, specs);
	}
	saved_menus.push([title, specs]);
}

wb.buildDelayedMenus = function(){
	if (!menu_built && saved_menus.length){
		saved_menus.forEach(function(m){
			edit_menu(m[0], m[1]);
		});
		saved_menus = [];
	}
}

function edit_menu(title, specs, show){
	menu_built = true;
    var group = title.toLowerCase().split(/\s+/).join('');
    var submenu = document.querySelector('.' + group + '+ .submenu');
    if (!submenu){
        var header = wb.elem('h3', {'class': group + ' accordion-header'}, title);
        var submenu = wb.elem('div', {'class': 'submenu block-menu accordion-body'});
        var blockmenu = document.querySelector('#block_menu');
        blockmenu.appendChild(header);
        blockmenu.appendChild(submenu);
    }
    specs.forEach(function(spec, idx){
        spec.group = group;
        spec.isTemplateBlock = true;
        submenu.appendChild(wb.Block(spec));
    });
}

})(wb);


/*end ui.js*/

/*begin workspace.js*/
(function(wb){

var language = location.pathname.match(/\/(.*)\.html/)[1];

function clearScripts(event, force){
    if (force || confirm('Throw out the current script?')){
        document.querySelector('.workspace > .scripts_workspace').remove();
        createWorkspace('Workspace');
		document.querySelector('.workspace > .scripts_text_view').innerHTML = '';
    }
}
Event.on('.clearScripts', 'click', null, clearScripts);
Event.on('.editScript', 'click', null, function(){
	document.body.className = 'editor';
	wb.buildDelayedMenus();
	wb.loadCurrentScripts(wb.queryParams);
});

Event.on('.goto_stage', 'click', null, function(){
	document.body.className = 'result';
});

// Load and Save Section

function saveCurrentScripts(){
    wb.showWorkspace('block');
    document.querySelector('#block_menu').scrollIntoView();
    localStorage['__' + language + '_current_scripts'] = wb.Block.serialize();
}
// window.onunload = saveCurrentScripts;

function scriptsToString(title, description){
    if (!title){ title = ''; }
    if (!description){ description = ''; }
    return JSON.stringify({
        title: title,
        description: description,
        date: Date.now(),
        scripts: wb.Block.scriptsToObject('.scripts_workspace')
    });
}


function createDownloadUrl(evt){
    var URL = window.webkitURL || window.URL;
    var file = new Blob([scriptsToString()], {type: 'application/json'});
    var reader = new FileReader();
    var a = document.createElement('a');
    reader.onloadend = function(){
        a.href = reader.result;
        a.download = 'script.json';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
    };
    reader.readAsDataURL(file);
    evt.preventDefault();
}

function comingSoon(evt){
    alert('Restore will be working again soon. You can drag saved json files to the script workspace now.');
}

Event.on('.save_scripts', 'click', null, createDownloadUrl);
Event.on('.restore_scripts', 'click', null, comingSoon);

function loadScriptsFromObject(fileObject){
    // console.info('file format version: %s', fileObject.waterbearVersion);
    // console.info('restoring to workspace %s', fileObject.workspace);
    // FIXME: Make sure we have the appropriate plugins loaded
	if (!fileObject) return createWorkspace();
    var blocks = fileObject.blocks.map(function(spec){
        return wb.Block(spec);
    });
    if (!blocks.length){
        return createWorkspace();
    }
    if (blocks.length > 1){
        console.log('not really expecting multiple blocks here right now');
    }
    blocks.forEach(function(block){
        var view = block.view()[0]; // FIXME: strip jquery wrapper
        wireUpWorkspace(view);
        block.script = '[[1]]';
        Event.trigger(view, 'addToScript', workspace);
    });
    wb.loaded = true;
}

function loadScriptsFromGist(gist){
	var keys = Object.keys(gist.data.files);
	var file;
	keys.forEach(function(key){
		if (/.*\.json/.test(key)){
			// it's a json file
			file = gist.data.files[key].content;
		}
	});
	if (!file){
		console.log('no json file found in gist: %o', gist);
		return;
	}
	loadScriptsFromObject(JSON.parse(file).scripts);
    Event.trigger(document.body, 'scriptLoaded');
}

function runScriptFromGist(gist){
	console.log('running script from gist');
	var keys = Object.keys(gist.data.files);
	var file;
	keys.forEach(function(key){
		if (/.*\.js$/.test(key)){
			// it's a javascript file
			console.log('found javascript file: %s', key);
			file = gist.data.files[key].content;
		}
	});
	if (!file){
		console.log('no javascript file found in gist: %o', gist);
		return;
	}
	wb.runScript(file);
}


wb.loaded = false;
wb.loadCurrentScripts = function(queryParsed){
    if (wb.loaded) return;
    console.log('loading current scripts');
	if (queryParsed.gist){
		wb.jsonp(
			'https://api.github.com/gists/' + queryParsed.gist,
			loadScriptsFromGist
		);
	}else if (localStorage['__' + language + '_current_scripts']){
        var fileObject = JSON.parse(localStorage['__' + language + '_current_scripts']);
        if (fileObject){
            loadScriptsFromObject(fileObject);
        }
    }else{
        createWorkspace('Workspace');
    }
};

wb.runCurrentScripts = function(queryParsed){
	if (queryParsed.gist){
		wp.json(
			'https://api.github.com/gists/' + queryParsed.gist,
			runScriptFromGist
		);
	}else if (localStorage['__' + language + '_current_scripts']){
		var fileObject = localStorage['__' + language + '_current_scripts'];
		if (fileObject){
			wb.runScript(fileObject);
		}
	}
}


// Allow saved scripts to be dropped in
function createWorkspace(name){
    var id = uuid();
    var workspace = wb.Block({
        group: 'scripts_workspace',
        id: id,
        scriptid: id,
        blocktype: 'context',
        sockets: [
            {
                name: name
            }
        ],
        script: '[[1]]',
        isTemplateBlock: false,
        help: 'Drag your script blocks here'
    });
    wireUpWorkspace(workspace);
}
wb.createWorkspace = createWorkspace;

function wireUpWorkspace(workspace){
    workspace.addEventListener('drop', getFiles, false);
    workspace.addEventListener('dragover', function(evt){evt.preventDefault();}, false);
    document.querySelector('.workspace').appendChild(workspace);
    workspace.querySelector('.contained').appendChild(wb.elem('div', {'class': 'dropCursor'}));
    wb.initializeDragHandlers();
}

function handleDragover(evt){
    // Stop Firefox from grabbing the file prematurely
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function getFiles(evt){
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    if ( files.length > 0 ){
        // we only support dropping one file for now
        var file = files[0];
        if ( file.type.indexOf( 'json' ) === -1 ) { return; }
        var reader = new FileReader();
        reader.readAsText( file );
        reader.onload = function (evt){
            clearScripts(null, true);
            var saved = JSON.parse(evt.target.result);
            loadScriptsFromObject(saved.scripts);
        };
    }
}



})(wb);

/*end workspace.js*/

/*begin serialization-1.1.js*/
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
    var workspaceDom = document.querySelector(workspace);
    var workspaceModel = wb.Block.model(workspaceDom);
    // console.log('workspace selector: %s', workspace);
    // console.log('workspaces found: %s', $(workspace).length);
    return {
        "waterbearVersion": "1.1",
        "workspace": workspaceModel.spec.label,
        "blocks": [workspaceModel.toJSON()]
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
        blocktype: self.blocktype,
        label: self.spec.label,
        group: self.group,
        id: self.id
    };
    if (self.seqNum){
        serialized.seqNum = self.seqNum;
    }else{
        console.warn('Block has no seqnum');
    }
    if (self.scriptid){
        serialized.scriptid = self.scriptid;
    }else{
        console.warn('Block has no scriptid');
    }
    if (self.collapsed){
        serialized.collapsed = self.collapsed; // persist open/closed state
    }
    if (self.scope){
        serialized.scope = self.scope;
    }else{
        console.warn('Block has no scope');
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
    if (exists(self.locals)){
        serialized.locals = self.locals.map(function(local){
            if (local && local.toJSON){
                return local.toJSON();
            }
            return local;
        });
    }
    return serialized;
};

// wb.Value.prototype.toJSON = function(){
//     // Implement me and make sure I round-trip back into the block model
//     var struct;
//     if (this.value && this.value.toJSON){
//         // console.info('serializing block value');
//         struct = {
//             type: this.type,
//             value: this.value.toJSON()
//         };
//     }else{
//         // console.info('serializing raw value');
//         struct = {
//             type: this.type,
//             value: this.value
//         };
//         if (this.choiceName){
//             struct.choiceName = this.choiceName;
//         }
//     }
//     return struct;
// };


wb.Block.reify = function(serialized){
};

})(wb);

/*end serialization-1.1.js*/

/*begin javascript.js*/
/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */


// Add some utilities

wb.prettyScript = function(elements){
    return js_beautify(elements.map(function(elem){
        return wb.Block.model(elem).code();
    }).join(''));
};

wb.writeScript = function(elements, view){
    view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
    hljs.highlightBlock(view.firstChild);
};

// End UI section

// expose these globally so the Block/Label methods can find them
wb.choiceLists = {
    boolean: ['true', 'false'],
    keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
    blocktypes: ['step', 'expression', 'context', 'eventhandler'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
};

// Hints for building blocks
//
//
// Expression blocks can nest, so don't end their scripts with semi-colons (i.e., if there is a "type" specified).
//
//

// Temporarily disable these until I can get time to implement them properly
// wb.menu('Recent Blocks', []);
// wb.menu('Favourite Blocks', []);



Event.on('.socket input', 'click', null, function(event){
    event.wbTarget.focus();
    event.wbTarget.select();
});


/*end javascript.js*/

/*begin control.js*/

/*end control.js*/

/*begin sprite.js*/
/*
 *    Sprite Plugin
 *
 *    Support for building games using Waterbear
 *
 */


wb.choiceLists.types.push('sprite');
wb.choiceLists.rettypes.push('sprite');


/*end sprite.js*/

/*begin array.js*/

/*end array.js*/

/*begin boolean.js*/

/*end boolean.js*/

/*begin canvas.js*/
/*
 *    Canvas Plugin
 *
 *    Support for using <canvas> from Waterbear
 *
 */


// expose these globally so the Block/Label methods can find them
wb.choiceLists.unit = ['px', 'em', '%', 'pt'];
wb.choiceLists.align = ['start', 'end', 'left', 'right', 'center'];
wb.choiceLists.baseline = ['alphabetic', 'top', 'hanging', 'middle', 'ideographic', 'bottom'];
wb.choiceLists.linecap = ['round', 'butt', 'square'];
wb.choiceLists.linejoin = ['round', 'bevel', 'mitre'];
wb.choiceLists.easing = ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'];
wb.choiceLists.fontweight = ['normal', 'bold', 'inherit'];
wb.choiceLists.globalCompositeOperators = ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-atop', 'destination-in', 'destination-out', 'destination-over', 'lighter', 'copy', 'xor'];
wb.choiceLists.repetition = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'];
wb.choiceLists.types = wb.choiceLists.types.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata']);
wb.choiceLists.rettypes = wb.choiceLists.rettypes.concat(['color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata']);



/*end canvas.js*/

/*begin color.js*/

/*end color.js*/

/*begin image.js*/

/*end image.js*/

/*begin math.js*/

/*end math.js*/

/*begin object.js*/

/*end object.js*/

/*begin string.js*/

/*end string.js*/

/*begin path.js*/

/*end path.js*/

/*begin point.js*/

/*end point.js*/

/*begin rect.js*/

/*end rect.js*/

/*begin sensing.js*/

/*end sensing.js*/

/*begin shape.js*/

/*end shape.js*/

/*begin size.js*/

/*end size.js*/

/*begin social.js*/

/*end social.js*/

/*begin fb.js*/

/*end fb.js*/

/*begin text.js*/

/*end text.js*/

/*begin matrix.js*/

/*end matrix.js*/

/*begin control.json*/
wb.menu({
    "name": "Controls",
    "blocks": [
        {
            "blocktype": "eventhandler",
            "id": "1cf8132a-4996-47db-b482-4e336200e3ca",
            "script": "function _start(){[[1]]}_start();",
            "help": "this trigger will run its scripts once when the program starts",
            "sockets": [
                {
                    "name": "when program runs"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "f4a604cd-f0b5-4133-9f91-4e1abe48fb6a",
            "script": "$(document).bind(\"keydown\", {{1}}, function(){[[1]]; return false;});",
            "help": "this trigger will run the attached blocks every time this key is pressed",
            "sockets": [
                {
                    "name": "when",
                    "type": "choice",
                    "options": "keys",
                    "default": "choice"
                },
                {
                    "name": "key pressed"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "cfea9087-3d7c-46ad-aa41-579bba2f4709",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "count##"
                        }
                    ],
                    "script": "local.count##",
                    "type": "number"
                }
            ],
            "script": "local.count##=0;(function(){setInterval(function(){local.count##++;[[1]]},1000/{{1}})})();",
            "help": "this trigger will run the attached blocks periodically",
            "sockets": [
                {
                    "name": "repeat",
                    "type": "number",
                    "default": "30"
                },
                {
                    "name": "times a second"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "66b33236-c9ce-4b6c-9b69-e8c4fdadbf52",
            "script": "setTimeout(function(){[[1]]},1000*{{1}});",
            "help": "pause before running the following blocks",
            "sockets": [
                {
                    "name": "wait",
                    "type": "number",
                    "default": "1"
                },
                {
                    "name": "secs"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "aa146082-9a9c-4ae7-a409-a89e84dc113a",
            "script": "range({{1}}).forEach(function(idx, item){local.count## = idx;[[1]]});",
            "help": "repeat the contained blocks so many times",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "count##"
                        }
                    ],
                    "script": "local.count##",
                    "type": "number"
                }
            ],
            "sockets": [
                {
                    "name": "repeat",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b7079d91-f76d-41cc-a6aa-43fc2749429c",
            "script": "global.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}));",
            "help": "send this message to any listeners",
            "sockets": [
                {
                    "name": "broadcast",
                    "type": "string",
                    "default": "ack"
                },
                {
                    "name": "message"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "d175bd7d-c7fd-4465-8b1f-c82687f35577",
            "script": "global.stage.dispatchEvent(new CustomEvent(\"wb_\" + {{1}}, {detail: {{2}}}));",
            "help": "send this message with an object argument to any listeners",
            "sockets": [
                {
                    "name": "broadcast",
                    "type": "string",
                    "default": "ping"
                },
                {
                    "name": "message with data",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "3931a20c-f510-45e4-83d2-4005983d5cae",
            "script": "global.stage.addEventListener(\"wb_\" + {{1}}, function(){[[1]]});",
            "help": "add a listener for the given message, run these blocks when it is received",
            "sockets": [
                {
                    "name": "when I receive",
                    "type": "string",
                    "default": "ack"
                },
                {
                    "name": "message"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "a0496339-c405-4d1c-8185-9bc211bf5a56",
            "script": "global.stage.addEventListener(\"wb_\" + {{1}}, function(event){local.data##=event.detail;[[1]]});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "data##"
                        }
                    ],
                    "script": "local.data##",
                    "type": "any"
                }
            ],
            "help": "add a listener for the given message which receives data, run these blocks when it is received",
            "sockets": [
                {
                    "name": "when I receive",
                    "type": "string",
                    "default": "ping"
                },
                {
                    "name": "message with data"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "b1e43170-800a-4e9b-af82-0ed5c62c47a0",
            "script": "while({{1}}){[[1]]}",
            "help": "repeat until the condition is false",
            "sockets": [
                {
                    "name": "forever if",
                    "type": "boolean",
                    "default": "false"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "20ba3e08-74c0-428e-b612-53545de63ce0",
            "script": "if({{1}}){[[1]]}",
            "help": "run the following blocks only if the condition is true",
            "sockets": [
                {
                    "name": "if",
                    "type": "boolean",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "6dddaf61-caf0-4976-a3f1-9d9c3bbbf5a4",
            "script": "if( ! {{1}} ){ [[1]]} }",
            "help": "run the  blocks if the condition is not true",
            "sockets": [
                {
                    "name": "if not",
                    "type": "boolean",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "5a09e58a-4f45-4fa8-af98-84de735d0fc8",
            "script": "while(!({{1}})){[[1]]}",
            "help": "repeat forever until condition is true",
            "sockets": [
                {
                    "name": "repeat until",
                    "type": "boolean",
                    "default": null
                }
            ]
        }
    ]
}
);
/*end control.json*/

/*begin sprite.json*/
wb.menu({
    "name": "Sprites",
    "blocks": [
        {
            "blocktype": "step",
            "id": "a5ec5438-a3e5-4949-a3d6-296f959670b1",
            "script": "local.ctx.save();local.ctx.fillStyle = {{1}};local.ctx.fillRect(0,0,global.stage_width, global.stage_height);local.ctx.restore();",
            "help": "clear the stage to a solid color",
            "sockets": [
                {
                    "name": "clear stage to color",
                    "type": "color",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "9d6b3a43-8319-482e-b0f8-2ce0fe7c2f3a",
            "script": "local.ctx.drawImage(img, 0,0,img.width,img.height,0,0,global.stage_width,global.stage_height);",
            "help": "clear the stage to a background image",
            "sockets": [
                {
                    "name": "clear stage to image",
                    "type": "image",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "eb889480-c381-4cfa-a6ee-7c6928c08817",
            "script": "local.sprite## = new RectSprite({{1}}, {{2}}, {{3}});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "sprite##"
                        }
                    ],
                    "script": "local.sprite##",
                    "type": "sprite"
                }
            ],
            "help": "create a simple rectangle sprite",
            "sockets": [
                {
                    "name": "rectangle sprite##",
                    "type": "size",
                    "default": null
                },
                {
                    "name": "big at",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with color",
                    "type": "color",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "db5f8b4e-93f2-4f88-934b-5eb4bac40e0d",
            "script": "{{1}}.draw(local.ctx);",
            "help": "draw the sprite at its current location",
            "sockets": [
                {
                    "name": "draw sprite",
                    "type": "sprite",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "04c9dfd8-82eb-4f64-9d1c-54b78d744c21",
            "script": "{{1}}.collides({{2}})",
            "type": "boolean",
            "help": "test for collision",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "default": null
                },
                {
                    "name": "collides with sprite",
                    "type": "sprite",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "d1521a30-c7bd-4f42-b21d-6330a2a73631",
            "script": "(function(sprite,dx,dy){sprite.x += dx;sprite.y += dy;})({{1}},{{2}},{{3}})",
            "help": "move a sprite relatively",
            "sockets": [
                {
                    "name": "move",
                    "type": "sprite",
                    "default": null
                },
                {
                    "name": "by x",
                    "type": "number",
                    "default": null
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "88c75c2b-18f1-4195-92bc-a90d99743551",
            "script": "(function(sprite,pos){sprite.x = pos.x; sprite.y=pos.y;})({{1}},{{2}})",
            "help": "move a sprite absolutely",
            "sockets": [
                {
                    "name": "move",
                    "type": "sprite",
                    "default": null
                },
                {
                    "name": "to",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a0c6d157-7fc7-4819-9b97-7b81d4c49a83",
            "script": "{{1}}.x",
            "help": "get x (left) position of sprite",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "default": null
                },
                {
                    "name": "left"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "23b4ffd1-3812-4372-8873-8a1b3107bdac",
            "script": "{{1}}.x + {{1}}.w",
            "help": "get x+w (right) position of sprite",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "default": null
                },
                {
                    "name": "right"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "898208b7-4d38-4c24-ba23-0b0443089435",
            "script": "{{1}}.y",
            "help": "get y (top) position of sprite",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "default": null
                },
                {
                    "name": "top"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8c73e3fd-7c53-4c92-be1d-286db5357cbb",
            "script": "{{1}}.y + {{1}}.h",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "default": null
                },
                {
                    "name": "bottom"
                }
            ]
        }
    ]
}
);
/*end sprite.json*/

/*begin array.json*/
wb.menu({
    "name": "Arrays",
    "blocks": [
        {
            "blocktype": "step",
            "id": "e6a297e9-1255-4701-91d8-80548489ee9a",
            "script": "local.array## = [];",
            "help": "Create an empty array",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "array##"
                        }
                    ],
                    "script": "local.array##",
                    "type": "array"
                }
            ],
            "sockets": [
                {
                    "name": "new array##"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "83d67170-4ba7-45ac-95ae-bb2f314c3ae0",
            "script": "local.array## = {{1}}.slice();",
            "help": "create a new array with the contents of another array",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "array##"
                        }
                    ],
                    "script": "local.array##",
                    "type": "array"
                }
            ],
            "sockets": [
                {
                    "name": "new array with array##",
                    "type": "array",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "3e56f9c1-29b9-4d0c-99bd-05ccabfa29c2",
            "script": "{{1}}[{{2}}]",
            "type": "any",
            "help": "get an item from an index in the array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "item",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5b1cc330-b9b1-4062-b8d4-e5032c7a5776",
            "script": "{{1}}.join({{2}})",
            "type": "string",
            "help": "join items of an array into a string, each item separated by given string",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "join with [string:, ]"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "3fab2b88-430a-401e-88b2-2703d614780a",
            "script": "{{1}}.push({{2}});",
            "help": "add any object to an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "append",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "bf3ed213-4435-4152-bb2c-573ce1721036",
            "script": "{{1}}.length",
            "type": "number",
            "help": "get the length of an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "length"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "f4870f0f-1dbb-4bc7-b8e3-3a00af613689",
            "script": "{{1}}.splice({{2}}, 1)[0]",
            "type": "any",
            "help": "remove item at index from an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "remove item",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e137e1a3-fe66-4d15-ae2a-596050acb6a7",
            "script": "{{1}}.pop()",
            "type": "any",
            "help": "remove and return the last item from an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "pop"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "00685267-c279-4fc1-bdbd-a07742a76b1e",
            "script": "{{1}}.shift()",
            "type": "any",
            "help": "remove and return the first item from an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "shift"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "b4f115d3-fc52-4d75-a363-5119de21e97c",
            "script": "{{1}}.slice().reverse()",
            "type": "array",
            "help": "reverse a copy of array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "reversed"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "0931d219-707c-41dd-92e6-b1a7c2a0f6b3",
            "script": "{{1}}.concat({{2}});",
            "type": "array",
            "help": "a new array formed by joining the arrays",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "concat",
                    "type": "array",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "9f6f4e21-7abf-4e6f-b9bf-4ce8a1086a21",
            "script": "{{1}}.forEach(function(item, idx){local.index = idx; local.item = item; [[1]] });",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "index"
                        }
                    ],
                    "script": "local.index",
                    "help": "index of current item in array",
                    "type": "number"
                },
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "item"
                        }
                    ],
                    "script": "local.item",
                    "help": "the current item in the iteration",
                    "type": "any"
                }
            ],
            "help": "run the blocks with each item of a named array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "default": null
                },
                {
                    "name": "for each"
                }
            ]
        }
    ]
}
);
/*end array.json*/

/*begin boolean.json*/
wb.menu({
    "name": "Boolean",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "770756e8-3a10-4993-b02e-3d1333c98958",
            "type": "boolean",
            "script": "({{1}} && {{2}})",
            "help": "both operands are true",
            "sockets": [
                {
                    "name": "",
                    "type": "boolean",
                    "default": null
                },
                {
                    "name": "and",
                    "type": "boolean",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a56c0d03-5c5c-4459-9aaf-cbbea6eb3abf",
            "type": "boolean",
            "script": "({{1}} || {{2}})",
            "help": "either or both operands are true",
            "sockets": [
                {
                    "name": "",
                    "type": "boolean",
                    "default": null
                },
                {
                    "name": "or",
                    "type": "boolean",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "cb9ddee8-5ee1-423b-9559-6d2cbb379b80",
            "type": "boolean",
            "script": "({{1}} ? !{{2}} : {{2}})",
            "help": "either, but not both, operands are true",
            "sockets": [
                {
                    "name": "",
                    "type": "boolean",
                    "default": null
                },
                {
                    "name": "xor",
                    "type": "boolean",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "138a6840-37cc-4e2d-b44a-af32e673ba56",
            "type": "boolean",
            "script": "(! {{1}})",
            "help": "operand is false",
            "sockets": [
                {
                    "name": "not",
                    "type": "boolean",
                    "default": null
                }
            ]
        }
    ]
});
/*end boolean.json*/

/*begin canvas.json*/
wb.menu({
    "name": "Canvas",
    "blocks": [
        {
            "blocktype": "context",
            "script": "local.ctx.save();[[1]];local.ctx.restore();",
            "help": "save the current state, run the contained steps, then restore the saved state",
            "id": "9e514499-05a6-4b76-ad4b-1ea888181a8b",
            "sockets": [
                {
                    "name": "with local state"
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "local.ctx.stroke();",
            "help": "stroke...",
            "id": "99d5828c-ccdd-47db-9abe-f67a8c065fe6",
            "sockets": [
                {
                    "name": "stroke"
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "local.ctx.fill();",
            "help": "fill...",
            "id": "d540bb5f-7711-4133-a631-53821daeb593",
            "sockets": [
                {
                    "name": "fill"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "c7e2e322-921a-4a96-9c86-9dbbaf54eb53",
            "script": "local.ctx.globalAlpha = {{1}};",
            "help": "set the global alpha",
            "sockets": [
                {
                    "name": "global alpha",
                    "type": "number",
                    "default": "1.0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "0237bbab-d62a-4ff9-afb8-4a64bc98dbc3",
            "script": "local.ctx.globalCompositOperator = {{1}};",
            "help": "set the global composite operator",
            "sockets": [
                {
                    "name": "global composite operator",
                    "type": "choice",
                    "options": "globalCompositeOperators",
                    "default": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "96085392-9a2d-4857-85f1-af2af72cf800",
            "script": "local.ctx.scale({{1}},{{2}});",
            "help": "change the scale of subsequent drawing",
            "sockets": [
                {
                    "name": "scale x",
                    "type": "number",
                    "default": "1.0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "1.0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "5e6ce8f8-d5a2-454e-8e88-d5155fb0eef0",
            "script": "local.ctx.rotate(deg2rad({{1}}));",
            "help": "rotate...",
            "sockets": [
                {
                    "name": "rotate by",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "df0ffca8-dd43-45aa-8b9f-b7d588090cd5",
            "script": "local.ctx.translate({{1}},{{2}});",
            "help": "translate...",
            "sockets": [
                {
                    "name": "translate by x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "d297afc2-3941-4977-a6af-d7f4e222b467",
            "script": "local.ctx.lineWidth = {{1}};",
            "help": "set line width",
            "sockets": [
                {
                    "name": "line width",
                    "type": "number",
                    "default": "1"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b538aadd-e90d-4d0d-bc12-95b7df9c2a61",
            "script": "local.ctx.lineCap = {{1}};",
            "help": "set line cap",
            "sockets": [
                {
                    "name": "line cap",
                    "type": "choice",
                    "options": "linecap",
                    "default": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "4b3f5315-295c-46d7-baf2-e791c707cf4f",
            "script": "local.ctx.lineJoin = {{1}};",
            "help": "set line join",
            "sockets": [
                {
                    "name": "line join",
                    "type": "choice",
                    "options": "linejoin",
                    "default": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "c3aec6b2-ccb1-4e24-b00f-0736214f44c3",
            "script": "local.ctx.mitreLimit = {{1}};",
            "help": "set mitre limit",
            "sockets": [
                {
                    "name": "mitre limit",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "f28b6498-87f7-4b39-bf16-81644a2a1996",
            "script": "local.ctx.shadowOffsetX = {{1}}; local.ctx.shadowOffsetY = {{2}}",
            "help": "set the offsets for shadow",
            "sockets": [
                {
                    "name": "shadow offset x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "278b0b41-895c-4786-9c09-d745ae5501af",
            "script": "local.ctx.shadowBlur = {{1}}",
            "help": "set the shadow blur radius",
            "sockets": [
                {
                    "name": "shadow blur",
                    "type": "number",
                    "default": "0"
                }
            ]
        }
    ]
});
/*end canvas.json*/

/*begin color.json*/
wb.menu({
    "name": "Color",
    "blocks": [
        {
            "blocktype": "step",
            "id": "01e39af1-679d-4b4d-b30e-a093a2687063",
            "script": "local.ctx.shadowColor = {{1}}",
            "help": "set the shadow color",
            "sockets": [
                {
                    "name": "shadow color",
                    "type": "color",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "9286b647-2c6f-4fbe-ae92-3d0062bc438f",
            "script": "local.ctx.strokeStyle = {{1}};",
            "help": "stroke color...",
            "sockets": [
                {
                    "name": "stroke color",
                    "type": "color",
                    "default": "#000"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "6fe550a9-c630-4876-950c-f727de27b7ae",
            "script": "local.ctx.fillStyle = {{1}};",
            "help": "fill color...",
            "sockets": [
                {
                    "name": "fill color",
                    "type": "color",
                    "default": "#000"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "271c8b4c-b045-4ff9-8ad5-9608ea204b09",
            "script": "\"rgb({{1}},{{2}},{{3}})\"",
            "type": "color",
            "help": "returns a color",
            "sockets": [
                {
                    "name": "color with red",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "green",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "blue",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "13236aef-cccd-42b3-a041-e26528174323",
            "script": "\"rgba({{1}},{{2}},{{3}},{{4}})\"",
            "type": "color",
            "help": "returns a semi-opaque color",
            "sockets": [
                {
                    "name": "color with red",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "green",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "blue",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "alpha",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e9496816-4f7b-47d3-8c70-163df835230c",
            "type": "color",
            "script": "\"hsb({{1}}, {{2}}, {{3}})\"",
            "help": "returns a color",
            "sockets": [
                {
                    "name": "color with hue",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "saturation",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "brightness",
                    "type": "number",
                    "default": "0]"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f",
            "type": "color",
            "script": "\"rgb(\" + randint(0,255) + \",\" + randint(0,255) + \",\" + randint(0,255) + \")\"",
            "help": "returns a random color",
            "sockets": [
                {
                    "name": "random color"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "c2d8442b-c9eb-45bb-8ca6-69f2e6d4c7c7",
            "script": "local.ctx.strokeStyle = {{1}};",
            "help": "replaces stroke color or stroke pattern with gradient",
            "sockets": [
                {
                    "name": "stroke gradient",
                    "type": "gradient",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b80bc4ea-7f07-4dd5-b2f9-d8f09e0aca55",
            "script": "local.ctx.fillStyle = {{1}};",
            "help": "replaces fill color or fill pattern with gradient",
            "sockets": [
                {
                    "name": "fill gradient",
                    "type": "gradient",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "7fd65106-276d-43f3-b433-5ce6b750d511",
            "script": "local.ctx.strokeStyle = {{1}};",
            "help": "replaces stroke color or stroke gradient with pattern",
            "sockets": [
                {
                    "name": "stroke pattern",
                    "type": "pattern",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "9f54e5b1-f539-4005-bd8e-5b759e776bba",
            "script": "local.ctx.fillStyle = {{1}};",
            "help": "replaces fill color or fill gradient with pattern",
            "sockets": [
                {
                    "name": "fill pattern",
                    "type": "pattern",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "5caf94c7-f489-4423-a0c7-d1ad066c4dc7",
            "script": "local.gradient## = local.ctx.createRadialGradient({{1}}.x,{{1}}.y,{{2}},{{3}}.x,{{3}}.y,{{4}});",
            "help": "create a radial gradient in the cone described by two circles",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "radial gradient##"
                        }
                    ],
                    "script": "local.gradient##",
                    "type": "gradient"
                }
            ],
            "sockets": [
                {
                    "name": "create radial gradient from point1",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "radius1",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "to point2",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "radius2",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "be35754d-da0e-4b26-b8f1-9a4f36e902c3",
            "script": "local.gradient## = local.ctx.createLinearGradient({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y);",
            "help": "create a linear gradient between two points",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "linear gradient##"
                        }
                    ],
                    "script": "local.linear.gradient##",
                    "type": "gradient"
                }
            ],
            "sockets": [
                {
                    "name": "create linear gradient from point1",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "to point2",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "a0783aab-194c-4059-8f8e-4afd93ec1ca5",
            "script": "{{1}}.addColorStop({{2}}, {{3}}",
            "help": "creates an additional color stop, offset must be between 0.0 and 1.0",
            "sockets": [
                {
                    "name": "add color stop to gradient",
                    "type": "gradient",
                    "default": null
                },
                {
                    "name": "at offset",
                    "type": "number",
                    "default": "0.5"
                },
                {
                    "name": "with color",
                    "type": "color",
                    "default": "#F00"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "3a6b43b7-3392-4f0d-b2b7-c5e1dc0cf501",
            "script": "local.pattern## = local.ctx.createPattern({{1}}, {{2}});",
            "help": "create a pattern with the given html image",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "pattern##"
                        }
                    ],
                    "script": "local.pattern##",
                    "type": "pattern"
                }
            ],
            "sockets": [
                {
                    "name": "create pattern## from image",
                    "type": "image",
                    "default": null
                },
                {
                    "name": "repeats",
                    "type": "choice",
                    "options": "repetition",
                    "default": "choice"
                }
            ]
        }
    ]
}
);
/*end color.json*/

/*begin image.json*/
wb.menu({
    "name": "Images",
    "blocks": [
        {
            "blocktype": "step",
            "id": "1a6150d8-b3d5-46e3-83e5-a4fe3b00f7db",
            "script": "var img = {{1}}, point={{2}}; local.ctx.drawImage(img,point.x,point.y);",
            "help": "draw the HTML &lt;img&gt; into the canvas without resizing",
            "sockets": [
                {
                    "name": "draw image",
                    "type": "image",
                    "default": null
                },
                {
                    "name": "at point",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "da300b03-1d39-4865-ab99-beec07b53bb2",
            "script": "local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y,{{2}}.w,{{2}}.h);",
            "help": "draw the HTML &lt;img&gt; into the canvas sized to the given dimension",
            "sockets": [
                {
                    "name": "draw image",
                    "type": "image",
                    "default": null
                },
                {
                    "name": "in rect",
                    "type": "rect",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "5514e085-970f-48c2-b6bf-a443488c3c07",
            "script": "local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);",
            "help": "draw a rect extracted from image into a rect specified on the canvas",
            "sockets": [
                {
                    "name": "draw a rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "from image",
                    "type": "image",
                    "default": null
                },
                {
                    "name": "to rect",
                    "type": "rect",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "6c79800c-af02-48e1-b9cb-d043e8299f7a",
            "script": "local.imageData## = local.ctx.createImageData({{1}}.w,{{1}}.h);",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "imageData##"
                        }
                    ],
                    "script": "local.imageData##",
                    "type": "imagedata"
                }
            ],
            "help": "initialize a new imageData with the specified dimensions",
            "sockets": [
                {
                    "name": "create ImageData## with size",
                    "type": "size",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "2137c296-1666-499c-871c-60226188f031",
            "script": "local.imageData## = local.ctx.createImageData({{1}});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "imageData##"
                        }
                    ],
                    "script": "local.imageData##",
                    "type": "imagedata"
                }
            ],
            "help": "initialized a new imageData the same size as an existing imageData",
            "sockets": [
                {
                    "name": "createImageData## from imageData",
                    "type": "imageData",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "a2745268-a506-46b6-8d96-e4c275dd5584",
            "script": "local.imageData## = local.ctx.getImageData({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "imageData##"
                        }
                    ],
                    "script": "local.imageData##",
                    "type": "imagedata"
                }
            ],
            "help": "returns the image data from the specified rectangle",
            "sockets": [
                {
                    "name": "get imageData## for rect",
                    "type": "rect",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "207c93f2-d8c7-4b87-99bf-d79b61faafc2",
            "script": "local.ctx.putImageData({{1}},{{2}}.x,{{2}}.y);",
            "help": "draw the given image data into the canvas at the given coordinates",
            "sockets": [
                {
                    "name": "draw imageData",
                    "type": "imagedata",
                    "default": null
                },
                {
                    "name": "at point",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "52ecfee7-005f-45ef-8c2a-df7b15dd974f",
            "script": "local.ctx.putImageData({{2}},{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
            "help": "draw the given image data into the canvas from the given rect to the given position",
            "sockets": [
                {
                    "name": "draw a rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "from imageData",
                    "type": "imagedata",
                    "default": null
                },
                {
                    "name": "at point",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "578ba232-d1c2-4354-993d-8538bbaf4de2",
            "script": "{{1}}.width",
            "type": "number",
            "sockets": [
                {
                    "name": "imageData",
                    "type": "imagedata",
                    "default": null
                },
                {
                    "name": "width"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "01bc0775-1a0b-4d0f-b009-786e18417703",
            "script": "{{1}}.height",
            "type": "number",
            "sockets": [
                {
                    "name": "imageData",
                    "type": "imagedata",
                    "default": null
                },
                {
                    "name": "height"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5e97eed9-acf7-45af-838e-fae9bf85921c",
            "script": "{{1}}.data",
            "type": "array",
            "sockets": [
                {
                    "name": "imageData",
                    "type": "imagedata",
                    "default": null
                },
                {
                    "name": "as array"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7fa79655-4c85-45b3-be9e-a19aa038feae",
            "script": "(function(){var img = new Image(); img.src=\"{{1}}\";return img;})()",
            "type": "image",
            "sockets": [
                {
                    "name": "image from url",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a7e59ad2-47ab-4240-8801-5d66d8f57fc9",
            "script": "{{1}}.width",
            "type": "number",
            "sockets": [
                {
                    "name": "image",
                    "type": "image",
                    "default": null
                },
                {
                    "name": "width"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "d9c7d36e-d15f-48a9-9423-1a6497727221",
            "script": "{{1}}.height",
            "type": "number",
            "sockets": [
                {
                    "name": "image",
                    "type": "image",
                    "default": null
                },
                {
                    "name": "height"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8d90b1fa-2791-4381-add5-c3c5d238ac0d",
            "script": "{{1}}.width",
            "type": "string",
            "sockets": [
                {
                    "name": "image",
                    "type": "image",
                    "default": null
                },
                {
                    "name": "url"
                }
            ]
        }
    ]
}
);
/*end image.json*/

/*begin math.json*/
wb.menu({
    "name": "Math",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "406d4e12-7dbd-4f94-9b0e-e2a66d960b3c",
            "type": "number",
            "script": "({{1}} + {{2}})",
            "help": "sum of the two operands",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "+",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "d7082309-9f02-4cf9-bcd5-d0cac243bff9",
            "type": "number",
            "script": "({{1}} - {{2}})",
            "help": "difference of the two operands",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "-",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "bd3879e6-e440-49cb-b10b-52d744846341",
            "type": "number",
            "script": "({{1}} * {{2}})",
            "help": "product of the two operands",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "*",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7f51bf70-a48d-4fda-ab61-442a0766abc4",
            "type": "number",
            "script": "({{1}} / {{2}})",
            "help": "quotient of the two operands",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "/",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e3a5ea20-3ca9-42cf-ac02-77ff06836a7e",
            "type": "boolean",
            "script": "({{1}} === {{2}})",
            "help": "two operands are equal",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "=",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "d753757b-a7d4-4d84-99f1-cb9b8c7e62da",
            "type": "boolean",
            "script": "({{1}} < {{2}})",
            "help": "first operand is less than second operand",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "<",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5a1f5f68-d74b-4154-b376-6a0200f585ed",
            "type": "boolean",
            "script": "({{1}} > {{2}})",
            "help": "first operand is greater than second operand",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": ">",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a35fb291-e2fa-42bb-a5a6-2124bb33157d",
            "type": "number",
            "script": "randint({{1}}, {{2}})",
            "help": "random number between two numbers (inclusive)",
            "sockets": [
                {
                    "name": "pick random",
                    "type": "number",
                    "default": "1"
                },
                {
                    "name": "to",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a2647515-2f14-4d0f-84b1-a6e288823630",
            "type": "number",
            "script": "({{1}} % {{2}})",
            "help": "modulus of a number is the remainder after whole number division",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "mod",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "4f7803c0-24b1-4a0c-a461-d46acfe9ab25",
            "type": "number",
            "script": "Math.round({{1}})",
            "help": "rounds to the nearest whole number",
            "sockets": [
                {
                    "name": "round",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "c38383df-a765-422e-b215-7d1cfb7557a1",
            "type": "number",
            "script": "Math.abs({{1}})",
            "help": "converts a negative number to positive, leaves positive alone",
            "sockets": [
                {
                    "name": "absolute of",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "9bf66bb0-c182-42e5-b3a7-cf10de26b08c",
            "type": "number",
            "script": "rad2deg(Math.acos({{1}}))",
            "help": "inverse of cosine",
            "sockets": [
                {
                    "name": "arccosine degrees of",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "92f79a75-e3f4-4fc7-8f17-bf586aef180b",
            "type": "number",
            "script": "rad2deg(Math.asin({{1}}))",
            "help": "inverse of sine",
            "sockets": [
                {
                    "name": "arcsine degrees of",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "1f5ee069-148e-4e4a-a514-5179af86be15",
            "type": "number",
            "script": "rad2deg(Math.atan({{1}}))",
            "help": "inverse of tangent",
            "sockets": [
                {
                    "name": "arctangent degrees of",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "46bcac2d-eb76-417c-81af-cb894a54a86c",
            "type": "number",
            "script": "Math.ceil({{1}})",
            "help": "rounds up to nearest whole number",
            "sockets": [
                {
                    "name": "ceiling of",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "ce4bf2bc-a06a-47f4-ac05-df2213d087a5",
            "type": "number",
            "script": "Math.cos(deg2rad({{1}}))",
            "help": "ratio of the length of the adjacent side to the length of the hypotenuse",
            "sockets": [
                {
                    "name": "cosine of",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "1a8f6a28-14e9-4400-8e80-31217309ebc9",
            "type": "number",
            "script": "Math.sin(deg2rad({{1}}))",
            "help": "ratio of the length of the opposite side to the length of the hypotenuse",
            "sockets": [
                {
                    "name": "sine of",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "fcecb61b-7fd9-4a92-b6cb-77d0a2fc8541",
            "type": "number",
            "script": "Math.tan(deg2rad({{1}}))",
            "help": "ratio of the length of the opposite side to the length of the adjacent side",
            "sockets": [
                {
                    "name": "tangent of",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8a4a81d8-de25-46f0-b610-97d4f6fffbff",
            "type": "number",
            "script": "Math.pow({{1}}, {{2}})",
            "help": "multiply a number by itself the given number of times",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "to the power of",
                    "type": "number",
                    "default": "2"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "668798a3-f15e-4839-b4b3-da5db380aa5a",
            "type": "number",
            "script": "Math.sqrt({{1}})",
            "help": "the square root is the same as taking the to the power of 1/2",
            "sockets": [
                {
                    "name": "square root of",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a34c51d9-bfa0-49ad-8e7d-b653611836d3",
            "script": "Math.PI;",
            "type": "number",
            "help": "pi is the ratio of a circle's circumference to its diameter",
            "sockets": [
                {
                    "name": "pi"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "da2c8203-bf80-4617-a762-92dd4d7bfa27",
            "script": "Math.PI * 2",
            "type": "number",
            "help": "tau is 2 times pi, a generally more useful number",
            "sockets": [
                {
                    "name": "tau"
                }
            ]
        }
    ]
});
/*end math.json*/

/*begin object.json*/
wb.menu({
    "name": "Objects",
    "blocks": [
        {
            "blocktype": "step",
            "id": "26ee5e5c-5405-453f-8941-26ac6ea009ec",
            "script": "local.object## = {};",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "object##"
                        }
                    ],
                    "script": "local.object##",
                    "type": "object"
                }
            ],
            "help": "create a new, empty object",
            "sockets": [
                {
                    "name": "new object##"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "ee86bcd0-10e3-499f-9a81-6738374c0c1f",
            "script": "{{1}}[{{2}}] = {{3}};",
            "help": "set the key/value of an object",
            "sockets": [
                {
                    "name": "object",
                    "type": "object",
                    "default": null
                },
                {
                    "name": "key",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "= value",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7ca6df56-7c25-4c8c-98ef-8dfef90eff36",
            "script": "{{1}}[{{2}}]",
            "type": "any",
            "help": "return the value of the key in an object",
            "sockets": [
                {
                    "name": "object",
                    "type": "object",
                    "default": null
                },
                {
                    "name": "value at key",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "322da80d-d8e2-4261-bab7-6ff0ae89e5f4",
            "script": "Object.keys({{1}}).forEach(function(key){local.key = key; local.item = {{1}}[key]; [[1]] });",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "key"
                        }
                    ],
                    "script": "local.key",
                    "help": "key of current item in object",
                    "type": "string"
                },
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "item"
                        }
                    ],
                    "script": "local.item",
                    "help": "the current item in the iteration",
                    "type": "any"
                }
            ],
            "help": "run the blocks with each item of a object",
            "sockets": [
                {
                    "name": "for each item in",
                    "type": "object",
                    "default": null
                },
                {
                    "name": "do"
                }
            ]
        }
    ]
}
);
/*end object.json*/

/*begin string.json*/
wb.menu({
    "name": "Strings",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "cdf5fa88-0d87-45d1-bf02-9ee4ec4c5565",
            "script": "{{1}}.split({{2}})",
            "type": "array",
            "help": "create an array by splitting the named string on the given string",
            "sockets": [
                {
                    "name": "string",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "split on",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e1951d04-dc2f-459e-9d7a-4796f29169ea",
            "type": "string",
            "script": "({{1}} + {{2}})",
            "help": "returns a string by joining together two strings",
            "sockets": [
                {
                    "name": "concatenate",
                    "type": "string",
                    "default": "hello"
                },
                {
                    "name": "with",
                    "type": "string",
                    "default": "world"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e71d4b0b-f32e-4b02-aa9d-5cbe76a8abcb",
            "script": "{{1}}[{{2}}]",
            "type": "string",
            "help": "get the single character string at the given index of named string",
            "sockets": [
                {
                    "name": "string",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "character at",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "c1eda8ae-b77c-4f5f-9b9f-c11b65235765",
            "script": "{{1}}.length",
            "type": "number",
            "help": "get the length of named string",
            "sockets": [
                {
                    "name": "string",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "length"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "cc005f19-e1b9-4f74-8fd0-91faccedd370",
            "script": "{{1}}.indexOf({{2}})",
            "type": "number",
            "help": "get the index of the substring within the named string",
            "sockets": [
                {
                    "name": "string",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "indexOf",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8b536c13-4c56-471e-83ac-cf8648602df4",
            "script": "{{1}}.replace({{2}}, {{3}})",
            "type": "string",
            "help": "get a new string by replacing a substring with a new string",
            "sockets": [
                {
                    "name": "string",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "replace",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "with",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8eaacf8a-18eb-4f21-a1ab-a356326f7eae",
            "script": "{{1}}.toString()",
            "type": "string",
            "help": "convert any object to a string",
            "sockets": [
                {
                    "name": "to string",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "48bb8639-0092-4384-b5a0-3a772699dea9",
            "script": "// {{1}};\n",
            "help": "this is a comment and will not be run by the program",
            "sockets": [
                {
                    "name": "comment",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "2f178d61-e619-47d0-b9cf-fcb52625c2a3",
            "script": "window.alert({{1}});",
            "help": "pop up an alert window with string",
            "sockets": [
                {
                    "name": "alert",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "8496b7af-129f-48eb-b15b-8803b7617493",
            "script": "console.log({{1}});",
            "help": "Send any object as a message to the console",
            "sockets": [
                {
                    "name": "console log",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "8bfaf131-d169-4cf4-afe4-1d7f02a55341",
            "script": "var __a={{2}};__a.unshift({{1}});console.log.apply(console, __a);",
            "help": "send a message to the console with a format string and multiple objects",
            "sockets": [
                {
                    "name": "console log format",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "arguments",
                    "type": "array",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "06ddcfee-76b7-4be4-856d-44cda3fb109b",
            "script": "global.keys",
            "help": "for debugging",
            "type": "object",
            "sockets": [
                {
                    "name": "global keys object"
                }
            ]
        }
    ]
});
/*end string.json*/

/*begin path.json*/
wb.menu({
    "name": "Paths",
    "blocks": [
        {
            "blocktype": "context",
            "id": "5bd66c5d-1a66-4cbb-8984-a4361270c2c6",
            "script": "local.ctx.beginPath();[[1]];local.ctx.closePath();",
            "help": "create a path, run the contained steps, close the path",
            "sockets": [
                {
                    "name": "with path"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "f9c9328b-746c-468b-90fa-4d3da4cb1479",
            "script": "local.ctx.moveTo({{1}}.x,{{1}}.y);",
            "help": "move to...",
            "sockets": [
                {
                    "name": "move to point",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "1dec1d26-282b-4d14-b943-6c06ebdd5ceb",
            "script": "local.ctx.lineTo({{1}}.x,{{1}}.y);",
            "help": "line to...",
            "sockets": [
                {
                    "name": "line to point",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "e79ff085-fb9a-46cb-8e4f-f61c5563d73b",
            "script": "local.ctx.quadraticCurveTo({{2}}.x, {{2}}.y, {{1}}.x, {{1}}.y);",
            "help": "quad curve to ...",
            "sockets": [
                {
                    "name": "quadradic curve to point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with control point",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "f311980c-eb49-4e42-9e9b-a4bdf428d5b5",
            "script": "local.ctx.bezierCurveTo({{2}}.x,{{2}}.y,{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y);",
            "help": "bezier curve to...",
            "sockets": [
                {
                    "name": "bezier curve to point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with control points",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "and",
                    "type": "point",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "adf632ea-02e1-4087-8dfd-91e41ec520b1",
            "script": "local.ctx.arcTo({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y,{{3}});",
            "help": "I wish I understood this well enough to explain it better",
            "sockets": [
                {
                    "name": "arc to point1",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "point1",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "default": "1.0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "5b46a44d-6974-4eb9-ac35-ba1ec5a79304",
            "script": "local.ctx.arc({{1}}.x,{{1}}.y,{{2}},deg2rad({{3}}),deg2rad({{4}}),{{5}});",
            "help": "arc...",
            "sockets": [
                {
                    "name": "arc with origin",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "radius",
                    "type": "number",
                    "default": "1"
                },
                {
                    "name": "start angle",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "deg, end angle",
                    "type": "number",
                    "default": "45"
                },
                {
                    "name": "deg",
                    "type": "boolean",
                    "default": "true"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "236e2fb4-3705-4465-9aa8-d7128e1f1c7f",
            "script": "local.ctx.rect({{1}},{{1}},{{1}},{{1}});",
            "help": "rect...",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "e4198722-951c-4dd9-8396-a70813478152",
            "script": "local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);",
            "help": "circle...",
            "sockets": [
                {
                    "name": "circle at point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "db455432-c7dd-4cba-af80-1802e38446c2",
            "script": "local.ctx.clip();",
            "help": "adds current path to the clip area",
            "sockets": [
                {
                    "name": "clip"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5b0fd9a6-39e7-4a70-86f8-1e7dc1c7166f",
            "script": "local.ctx.isPointInPath({{1}}.x,{{1}}.y)",
            "type": "boolean",
            "help": "test a point against the current path",
            "sockets": [
                {
                    "name": "is point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "in path?"
                }
            ]
        }
    ]
});
/*end path.json*/

/*begin point.json*/
wb.menu({
    "name": "Points",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "71eb3271-6dc0-4a82-81cc-4c50d8acb9e7",
            "script": "{x: {{1}}, y: {{2}} }",
            "type": "point",
            "help": "create a new point",
            "sockets": [
                {
                    "name": "point at x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "efe5e679-8336-4e5a-ade0-4bd930826096",
            "type": "point",
            "script": "{x: {{1}}[0], y: {{1}}[1]}",
            "help": "convert array to point",
            "sockets": [
                {
                    "name": "point from array",
                    "type": "array",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "29803c49-5bd5-4473-bff7-b3cf66ab9711",
            "type": "point",
            "script": "{x: randint(0, global.stage_width), y: randint(0, global.stage_height)}",
            "help": "returns a point at a random location on the stage",
            "sockets": [
                {
                    "name": "random point"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "36f0eb56-9370-402d-83ef-99201a62c732",
            "script": "{{1}}.x",
            "type": "number",
            "help": "get the x value of a point",
            "sockets": [
                {
                    "name": "point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "x"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "90b42cf3-185d-4556-b7e8-d9682c187425",
            "script": "{{1}}.y",
            "type": "number",
            "help": "get the y value of a point",
            "sockets": [
                {
                    "name": "point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "y"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "743cba63-11d4-4a84-a3b6-a98480bdd731",
            "script": "[{{1}}.x, {{1}}.y]",
            "type": "array",
            "help": "convert a point to an array",
            "sockets": [
                {
                    "name": "point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "as array"
                }
            ]
        }
    ]
});
/*end point.json*/

/*begin rect.json*/
wb.menu({
    "name": "Rects",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "67924ef4-71eb-4793-9599-d8605b14320a",
            "script": "{x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}} }",
            "type": "rect",
            "sockets": [
                {
                    "name": "rect at x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "with width",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "height",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "24b44fea-7be1-472a-a203-2a0d97515311",
            "script": "{x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h}",
            "type": "rect",
            "sockets": [
                {
                    "name": "rect at point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with size",
                    "type": "size",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "68c9cfd0-d06b-41ae-9eac-d762126f6bd7",
            "script": "{x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] };",
            "type": "rect",
            "sockets": [
                {
                    "name": "rect from array",
                    "type": "array",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "aed385a0-7439-4b36-ad3e-fd07c562523a",
            "script": "{x: {{1}}.x, y: {{1}}.y}",
            "type": "point",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "position"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "453db037-c418-467b-8808-52d84c7a3273",
            "script": "{w: {{1}}.w, h: {{1}}.h}",
            "type": "size",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "size"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "599f6375-e26e-414c-9740-fa9fcfc8ff00",
            "script": "[{{1}}.x, {{1}}.y, {{1}}.w, {{1}}.h]",
            "type": "array",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "as array"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "c95a1658-e1ec-4500-8766-abab8f67f865",
            "script": "{{1}}.x",
            "type": "number",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "x"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7ee1fb57-7a16-4eff-9077-ade7fad60e86",
            "script": "{{1}}.y",
            "type": "number",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "y"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "79df9d07-6894-45bc-bcc8-fc565e66df0c",
            "script": "{{1}}.w",
            "type": "number",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "width"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8ae2a7ee-712d-4288-ac55-957a7e2b2b72",
            "script": "{{1}}.h",
            "type": "number",
            "sockets": [
                {
                    "name": "rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "height"
                }
            ]
        }
    ]
});
/*end rect.json*/

/*begin sensing.json*/
wb.menu({
    "name": "Sensing",
    "blocks": [
        {
            "blocktype": "step",
            "id": "916c79df-40f1-4280-a093-6d9dfe54d87e",
            "script": "local.answer## = prompt({{1}});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "answer##"
                        }
                    ],
                    "type": "string",
                    "script": "local.answer##"
                }
            ],
            "help": "Prompt the user for information",
            "sockets": [
                {
                    "name": "ask [string:What's your name?] and wait"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "2504cc6a-0053-4acc-8594-a00fa8a078cb",
            "type": "number",
            "script": "global.mouse_x",
            "help": "The current horizontal mouse position",
            "sockets": [
                {
                    "name": "mouse x"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "80600e66-f99e-4270-8c32-a2bb8d1dafe0",
            "type": "number",
            "script": "global.mouse_y",
            "help": "the current vertical mouse position",
            "sockets": [
                {
                    "name": "mouse y"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "ce1026a0-9acf-4d8f-a7c0-0759115af1ca",
            "type": "boolean",
            "script": "global.mouse_down",
            "help": "true if the mouse is down, false otherwise",
            "sockets": [
                {
                    "name": "mouse down"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "4321cef6-6365-4885-9a3c-1fd0db2b4eab",
            "type": "boolean",
            "script": "global.isKeyDown({{1}})",
            "help": "is the given key down when this block is run?",
            "sockets": [
                {
                    "name": "key",
                    "type": "choice",
                    "options": "keys",
                    "default": "choice"
                },
                {
                    "name": "pressed?"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "048218dd-0b8d-4bc9-b310-480e93232665",
            "type": "number",
            "script": "global.stage_width",
            "help": "width of the stage where scripts are run. This may change if the browser window changes",
            "sockets": [
                {
                    "name": "stage width"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "6f9031c6-579b-4e24-b5d1-f648aab6e0aa",
            "type": "number",
            "script": "global.stage_height",
            "help": "height of the stage where scripts are run. This may change if the browser window changes.",
            "sockets": [
                {
                    "name": "stage height"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "f85d3bfd-b58c-458f-b4a9-68538302aa12",
            "type": "number",
            "script": "global.stage_center_x",
            "help": "horizontal center of the stage",
            "sockets": [
                {
                    "name": "center x"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "083bee4f-ee36-4a35-98df-587ed586d623",
            "type": "number",
            "script": "global.stage_center_y",
            "help": "vertical center of the stage",
            "sockets": [
                {
                    "name": "center y"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "76184edb-ac2c-4809-899d-7b105776ba12",
            "type": "number",
            "script": "randint(0,global.stage_width)",
            "help": "return a number between 0 and the stage width",
            "sockets": [
                {
                    "name": "random x"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8e749092-327d-4921-a50e-c87acefe7102",
            "type": "number",
            "script": "randint(0, global.stage_height)",
            "help": "return a number between 0 and the stage height",
            "sockets": [
                {
                    "name": "random y"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "6b924f28-9bba-4257-a80b-2f2a591128a5",
            "script": "global.timer.reset();",
            "help": "set the global timer back to zero",
            "sockets": [
                {
                    "name": "reset timer"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "f04b0e0a-b591-4eaf-954d-dea412cbfd61",
            "type": "number",
            "script": "global.timer.value()",
            "help": "seconds since the script began running",
            "sockets": [
                {
                    "name": "timer"
                }
            ]
        }
    ]
}
);
/*end sensing.json*/

/*begin shape.json*/
wb.menu({
    "name": "Shapes",
    "blocks": [
        {
            "blocktype": "step",
            "script": "local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
            "help": "clear...",
            "id": "3d714bd6-8d02-49cb-8e56-ece642b295ad",
            "sockets": [
                {
                    "name": "clear rect",
                    "type": "rect",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();",
            "help": "circle...",
            "id": "3ae0e65c-1d1c-4976-8807-799b0408984b",
            "sockets": [
                {
                    "name": "fill circle at point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.fillStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.restore();",
            "id": "e399d950-4d91-49aa-ac42-bfc58299633c",
            "sockets": [
                {
                    "name": "fill circle at point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "and color",
                    "type": "color",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();",
            "help": "circle...",
            "id": "79133274-d53f-4ef4-8b17-9259fe25fb87",
            "sockets": [
                {
                    "name": "stroke circle at point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.strokeStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();local.ctx.restore();",
            "id": "8a091a21-1fa9-49b6-a622-696c38556a2e",
            "sockets": [
                {
                    "name": "stroke circle at point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "and color",
                    "type": "color",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.stroke();",
            "help": "circle...",
            "id": "094fa424-8b6f-4759-a9bc-f4dbf289f697",
            "sockets": [
                {
                    "name": "stroke and fill circle at point",
                    "type": "point",
                    "default": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "script": "var rect## = {{1}};local.ctx.fillRect(rect##.x,rect##.y,rect##.w,rect##.h);",
            "help": "fill...",
            "id": "bf909ec4-5387-4baf-ba43-f17df493f9bd",
            "sockets": [
                {
                    "name": "fill rect",
                    "type": "rect",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "7a342b2b-f169-4071-8771-34394cc07393",
            "script": "var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.fillStyle = color##; local.ctx.fillRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();",
            "sockets": [
                {
                    "name": "fill rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "with color",
                    "type": "color",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "9cf3a017-ab20-4987-875a-5d8436377bd0",
            "script": "var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.strokeStyle = color##; local.ctx.strokeRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();",
            "sockets": [
                {
                    "name": "stroke rect",
                    "type": "rect",
                    "default": null
                },
                {
                    "name": "with color",
                    "type": "color",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b28a6aeb-bbad-4828-8ff1-2f846e556e1a",
            "script": "var rect## = {{1}};local.ctx.strokeRect(rect##.x,rect##.y,rect##.w,rect##.h);",
            "help": "stroke...",
            "sockets": [
                {
                    "name": "stroke rect",
                    "type": "rect",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "ebe1b968-f117-468d-91cb-1e67c5776030",
            "script": "var local.ctx.fillRect({{1}},{{2}},{{3}},{{4}});local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}});",
            "help": "fill and stroke...",
            "sockets": [
                {
                    "name": "fill and stroke rect x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "width",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "height",
                    "type": "number",
                    "default": "10"
                }
            ]
        }
    ]
});
/*end shape.json*/

/*begin size.json*/
wb.menu({
    "name": "Sizes",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "d8e71067-afc2-46be-8bb5-3527b36474d7",
            "script": "{w: {{1}}, h: {{2}} }",
            "type": "size",
            "sockets": [
                {
                    "name": "size with width",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "height",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "404cb2f4-abe5-4c3b-a9da-9b44050e012d",
            "script": "{w: {{1}}[0], h: {{1}}[1]",
            "type": "size",
            "sockets": [
                {
                    "name": "size from array",
                    "type": "array",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "33f2a3b7-5d87-4481-ad1c-f2970915db51",
            "script": "{{1}}.w",
            "type": "number",
            "sockets": [
                {
                    "name": "size",
                    "type": "size",
                    "default": null
                },
                {
                    "name": "width"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "2d449e0e-cb18-473f-a574-614320b7ba22",
            "script": "{{1}}.h",
            "type": "number",
            "sockets": [
                {
                    "name": "size",
                    "type": "size",
                    "default": null
                },
                {
                    "name": "height"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7ca31ad7-946a-4587-a5c8-d6b8879dc4e2",
            "script": "[{{1}}.w, {{1}}.h]",
            "type": "array",
            "sockets": [
                {
                    "name": "size",
                    "type": "size",
                    "default": null
                },
                {
                    "name": "as array"
                }
            ]
        }
    ]
});
/*end size.json*/

/*begin social.json*/
wb.menu({
    "name": "Twitter",
    "blocks": [
        {
            "blocktype": "eventhandler",
            "id": "467848f3-3493-439a-9228-d6f83007e886",
            "script": "local.getTweet({{1}}, function(tweet){local.tweet## = tweet;[[1]]});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "last tweet##"
                        }
                    ],
                    "script": "local.tweet## || \"waiting…\"",
                    "type": "string"
                }
            ],
            "help": "asynchronous call to get the last tweet of the named account",
            "sockets": [
                {
                    "name": "get tweet for",
                    "type": "string",
                    "default": null
                }
            ]
        }
    ]
}
);
/*end social.json*/

/*begin fb.json*/
wb.menu({
    "name": "Facebook",
    "blocks": [
        {
            "blocktype": "step",
            "id": "4a2fd78c-4d0e-4c96-8ec3-52a96b2d6920",
            "script": "FB.api(\"/me/feed/\", \"post\", { message : {{1}} }, $.noop );",
            "sockets": [
                {
                    "name": "share",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "4f41013c-b053-439a-b284-769525f6df5d",
            "script": "fb.friends.data",
            "type": "array",
            "sockets": [
                {
                    "name": "all my friends"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "9f987bdb-87f4-4cf7-aea7-6d282bc0276e",
            "script": "fb.me",
            "type": "object",
            "sockets": [
                {
                    "name": "me"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "c290da4a-c84d-46ac-a6c8-20b367283ea1",
            "script": "{{1}}.name",
            "type": "string",
            "sockets": [
                {
                    "name": "name of",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "f0361c85-7ed9-4ecf-b5dc-c08da20034e1",
            "script": "(function(){var img = new Image(); img.src=\"https://graph.facebook.com/\" + {{1}}.id + \"/picture\"; return img;})",
            "type": "image",
            "sockets": [
                {
                    "name": "image of",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "6a4bbc09-5782-43b9-968b-4610c7664d29",
            "type": "string",
            "script": "\"https://graph.facebook.com/\" + {{1}}.id + \"/picture\"",
            "sockets": [
                {
                    "name": "images url of",
                    "type": "any",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "ac41fb9e-c0c6-4e41-b190-87ba3fdb258d",
            "script": "(function(){var correct = {id: \"\", name: \"\"}; $.each( fb.friends.data , function(i, user) { if( user.name.indexOf( {{1}} ) != -1 ) correct = user; } ); return correct;})()",
            "type": "object",
            "sockets": [
                {
                    "name": "friend with name like",
                    "type": "string",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "cc6fa7cf-fa7e-47fc-b97a-27f5c83d8d4b",
            "script": "FB.api( \"/search\", { \"type\" : \"place\", \"center\" : \"{{1}}.latitude,{{1}}.longitude\", \"distance\": \"1000\" }, function(r){ FB.api(\"/me/feed/\", \"post\", { place : r.data[0].id }, $.noop ); } );",
            "sockets": [
                {
                    "name": "checkin at",
                    "type": "location",
                    "default": null
                }
            ]
        }
    ]
});
/*end fb.json*/

/*begin text.json*/
wb.menu({
    "name": "Text",
    "blocks": [
        {
            "blocktype": "step",
            "id": "d16df0dc-f90a-4e21-967d-f054956c8135",
            "script": "local.ctx.font = {{1}}+{{2}}+\" \"+{{3}};",
            "help": "set the current font",
            "sockets": [
                {
                    "name": "font",
                    "type": "number",
                    "default": "10"
                },
                {
                    "name": "",
                    "type": "choice",
                    "options": "unit",
                    "default": "choice"
                },
                {
                    "name": "",
                    "type": "string",
                    "default": "sans-serif"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "7ea4ef80-8355-4987-8d3b-165367b97cc1",
            "script": "local.ctx.textAlign = {{1}};",
            "help": "how should the text align?",
            "sockets": [
                {
                    "name": "text align",
                    "type": "choice",
                    "options": "align",
                    "default": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "46345cbf-e095-4b34-9d37-c9dcc22da7db",
            "script": "local.ctx.textBaseline = {{1}};",
            "help": "set the text baseline",
            "sockets": [
                {
                    "name": "text baseline",
                    "type": "choice",
                    "options": "baseline",
                    "default": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "9f3fb819-f8a9-4929-87c8-6c6742b4cb2d",
            "script": "local.ctx.fillText({{1}},{{2}},{{3}});",
            "help": "basic text operation",
            "sockets": [
                {
                    "name": "fill text",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "742ee568-8a27-49d5-9dce-8b9151b30bef",
            "script": "local.ctx.fillText({{1}},{{2}},{{3}},{{4}});",
            "help": "basic text operation with optional max width",
            "sockets": [
                {
                    "name": "fill text",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "max width",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b9bfe426-3110-4b67-bc4e-5da48103e890",
            "script": "local.ctx.strokeText({{1}},{{2}},{{3}});",
            "help": "outline the text",
            "sockets": [
                {
                    "name": "stroke text",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "6d03d273-8c5d-4059-b525-641ceb7ed662",
            "script": "local.ctx.strokeText({{1}},{{2}},{{3}},{{4}});",
            "help": "outline the text with optional max width",
            "sockets": [
                {
                    "name": "stroke text",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "default": "0"
                },
                {
                    "name": "max width",
                    "type": "number",
                    "default": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7edfa688-bdbb-491b-9011-4cb866b7dc2e",
            "script": "local.ctx.measureText({{1}}).width",
            "type": "number",
            "sockets": [
                {
                    "name": "text",
                    "type": "string",
                    "default": null
                },
                {
                    "name": "width"
                }
            ]
        }
    ]
});
/*end text.json*/

/*begin matrix.json*/
wb.menu({
    "name": "Matrix",
    "blocks": [
        {
            "blocktype": "step",
            "id": "0f9e96f3-52d3-4ace-afdf-c598c1bd31ed",
            "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.transform.apply(local.ctx, {{1}});",
            "help": "transform by an arbitrary matrix [a,b,c,d,e,f]",
            "sockets": [
                {
                    "name": "transform by 6-matrix",
                    "type": "array",
                    "default": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "64e785e8-147a-4a9f-8439-cdba5f148ea1",
            "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.setTransform.apply(local.ctx, {{1}});",
            "help": "set transform to an arbitrary array [a,b,c,d,e,f]",
            "sockets": [
                {
                    "name": "set transform to 6-matrix",
                    "type": "array",
                    "default": null
                }
            ]
        }
    ]
});
/*end matrix.json*/

/*begin launch.js*/
switch(wb.view){
    case 'editor':
    case 'blocks':
    case 'result':
        switchMode(wb.view);
        break;
    default:
        switchMode('editor');
        break;
}

function switchMode(mode){
    document.querySelector('#block_menu_load').remove();
    document.body.className = mode;
    //wb.loadCurrentScripts(q);
    // remove next line once load/save is working
    wb.createWorkspace('Workspace');
}

/*end launch.js*/
