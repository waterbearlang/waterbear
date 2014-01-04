
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

/*begin ajax.js*/
(function(global){
function $(e){if(typeof e=='string')e=document.getElementById(e);return e};
function collect(a,f){var n=[];for(var i=0;i<a.length;i++){var v=f(a[i]);if(v!=null)n.push(v)}return n};

ajax={};
ajax.x=function(){try{return new ActiveXObject('Msxml2.XMLHTTP')}catch(e){try{return new ActiveXObject('Microsoft.XMLHTTP')}catch(e){return new XMLHttpRequest()}}};
ajax.serialize=function(f){var g=function(n){return f.getElementsByTagName(n)};var nv=function(e){if(e.name)return encodeURIComponent(e.name)+'='+encodeURIComponent(e.value);else return ''};var i=collect(g('input'),function(i){if((i.type!='radio'&&i.type!='checkbox')||i.checked)return nv(i)});var s=collect(g('select'),nv);var t=collect(g('textarea'),nv);return i.concat(s).concat(t).join('&');};
ajax.send=function(u,f,m,a){var x=ajax.x();x.open(m,u,true);x.onreadystatechange=function(){if(x.readyState==4)f(x.responseText)};if(m=='POST')x.setRequestHeader('Content-type','application/x-www-form-urlencoded');x.send(a)};
ajax.get=function(url,func){ajax.send(url,func,'GET')};
ajax.gets=function(url){var x=ajax.x();x.open('GET',url,false);x.send(null);return x.responseText};
ajax.post=function(url,func,args){ajax.send(url,func,'POST',args)};
ajax.update=function(url,elm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.get(url,f)};
ajax.submit=function(url,elm,frm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.post(url,f,ajax.serialize(frm))};
global.ajax = ajax;
})(this);
/*end ajax.js*/

/*begin queryparams.js*/
// Sets up wb namespace (wb === waterbear)
// Extracts parameters from URL, used to switch embed modes, load from gist, etc.
(function(global){

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
	                           decodeURIComponent(qpart[1] || '').split('#')[0];
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
		if (!parts.length){
			return base;
		}
		return base + '?' + parts.join('&');
	}
	global.wb = wb;
})(this);

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

    var svgtext = document.querySelector('svg text');
    wb.resize = function(input){
        if (!input) return;
        if (input.wbTarget){
            input = input.wbTarget;
        }
        svgtext.textContent = input.value || '';
        var textbox = svgtext.getBBox();
        input.style.width = (textbox.width + 25) + 'px';
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
    };

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

    wb.findChild = function(elem, selector){
        if (arguments.length !== 2){
            throw new Exception('This is the culprit');
        }
        var children = elem.children;
        for(var i = 0; i < children.length; i++){
            var child = children[i];
            if (wb.matches(child, selector)){
                return child;
            }
        }
        return null;
    };

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
                if (attributes[key] === null || attributes[key] === undefined) return;
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
                        console.error('DEPRECATED array arg to elem: use sub-elem instead');
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
            // remove jsonp 
            var script = document.getElementById(id);
            script.parentElement.removeChild(script);
            // remove self
            delete window[id];
            callback(data);
        };
        window[id] = handler;
        document.head.appendChild(wb.elem('script', {src: url + '?callback=' + id, id: id, language: 'text/json'}));
    };

    /* adapted from code here: http://javascriptexample.net/ajax01.php */
    wb.ajax = function(url, success, failure){
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var cType;
            if (req.readyState === 4) {
                if (req.status === 200) {
                    cType = this.getResponseHeader("Content-Type");
                    success(this.responseText, cType);
                }else{
                    if (failure){
                        failure(this.status, this);
                    }
                }
            }
        };
        req.open('GET', url, true);
        req.send(null);
    };


})(this);

/*end util.js*/

/*begin event.js*/
// Bare-bones Event library
// Adds support for event delegation on top of normal DOM events (like jQuery "live" events)
// Minimal support for non-DOM (custom) events
// Normalized between mouse and touch events
// Waterbear specific: events have wb-target which is always a block element

(function(global){
    "use strict";

    var on = function on(elem, eventname, selector, handler){
        if (typeof elem === 'string'){
            return wb.makeArray(document.querySelectorAll(elem)).map(function(e){
                return on(e, eventname, selector, handler);
            });
        }
        if (!elem.tagName){ 
            console.error('first argument must be element: %o', elem); 
            debugger;
        }
        if (typeof eventname !== 'string'){ console.error('second argument must be eventname'); }
        if (selector && typeof selector !== 'string'){ console.log('third argument must be selector or null'); }
        if (typeof handler !== 'function'){ console.log('fourth argument must be handler'); }
        var listener;
        if (selector){
            listener = function(event){
                blend(event); // normalize between touch and mouse events
                // if (eventname === 'mousedown'){
                //     console.log(event);
                // }
                if (!event.wbValid){
                    // console.log('event %s is not valid', eventname);
                    return;
                }
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
                if (!event.wbValid){
                    return;
                }
                handler(event);
            };
        }
        elem.addEventListener(eventname, listener, false);
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
        var evt = new CustomEvent(eventname, {bubbles: true, cancelable: true, detail: data});
        // console.log('dispatching %s for %o', eventname, elem);
        elem.dispatchEvent(evt);
    };

    // Are touch events supported?
    var isTouch = ('ontouchstart' in global);
    var isMouseEvent = function isMouseEvent(event){
        switch(event.type){
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
            case 'click':
                return true;
            default:
                return false;
        }
    };
    var isTouchEvent = function isTouchEvent(event){
        switch(event.type){
            case 'touchstart':
            case 'touchmove':
            case 'touchend':
            case 'tap':
                return true;
            default:
                return false;
        }
    };

    var isPointerEvent = function isPointerEvent(event){
        return isTouchEvent(event) || isMouseEvent(event);
    };

    // Treat mouse events and single-finger touch events similarly
    var blend = function(event){
        if (isPointerEvent(event)){
            if (isTouchEvent(event)){
                var touch = null;
                if (event.touches.length === 1){
                    touch = event.touches[0];
                }else if (event.changedTouches.length === 1){
                    touch = event.changedTouches[0];
                }else{
                    return event;
                }
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
        }else{
            event.wbTarget = event.target;
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

    // After trying to find a decent drag-and-drop library which could handle
    // snapping tabs to slots *and* dropping expressions in sockets *and*
    // work on both touch devices and with mouse/trackpad *and* could prevent dragging
    // expressions to sockets of the wrong type, ended up writing a custom one for
    // Waterbear which does what we need. The last piece makes it waterbear-specific
    // but could potentially be factored out if another library supported all of the
    // rest (and didn't introduce new dependencies such as jQuery)

    // FIXME: Remove references to waterbear
    // FIXME: Include mousetouch in garden


// Goals:
//
// Drag any block from block menu to script canvas: clone and add to script canvas
// Drag any block from anywhere besides menu to menu: delete block and contained blocks
// Drag any attached block to canvas: detach and add to script canvas
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

// Key to touch is the timer function for handling movement and hit testing

    var dragTimeout = 20;
    var snapDist = 25; //In pixels
    var startParent;
    var startSibling;
    var timer;
    var dragTarget;
    var dropTarget;
    var dragging;
    var currentPosition;
    var scope;
    var workspace; // <- WB
    var blockMenu = document.querySelector('#block_menu'); // <- WB
    var potentialDropTargets;
    var selectedSocket; // <- WB
    var dragAction = {};
    var templateDrag, localDrag; // <- WB

    var _dropCursor; // <- WB

    // WB-specific
    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.dropCursor');
        }
        return _dropCursor;
    }

    function reset(){
        // console.log('reset dragTarget to null');
        dragTarget = null;
        dragAction = {undo: undoDrag, redo: redoDrag}; // <- WB
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        dragging = false;
        cloned = false; // <- WB
        scope = null; // <- WB
        templateDrag = false; // <- WB
        localDrag = false; // <- WB
    }
    reset();



    function initDrag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        var eT = event.wbTarget; // <- WB
        //Check whether the original target was an input ....
        // WB-specific
        if (wb.matches(event.target, 'input, select, option, .disclosure, .contained')  && !wb.matches(eT, '#block_menu *')) {
            // console.log('not a drag handle');
            return undefined;
        }
        var target = wb.closest(eT, '.block'); // <- WB
        if (target){
            // WB-Specific
            if (wb.matches(target, '.scripts_workspace')){
                // don't start drag on workspace block
                return undefined;
            }
            dragTarget = target;
            // WB-Specific
            if (target.parentElement.classList.contains('block-menu')){
                target.dataset.isTemplateBlock = 'true';
                templateDrag = true;
            }
        	dragAction.target = target;
            // WB-Specific
            if (target.parentElement.classList.contains('locals')){
                // console.log('target parent: %o', target.parentElement);
                target.dataset.isLocal = 'true';
                localDrag = true;
            }
            //dragTarget.classList.add("dragIndication");
            startPosition = wb.rect(target); // <- WB
            // WB-Specific
            if (! wb.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            startSibling = target.nextElementSibling;
            // WB-Specific
            if(startSibling && !wb.matches(startSibling, '.block')) {
            	// Sometimes the "next sibling" ends up being the cursor
            	startSibling = startSibling.nextElementSibling;
            }
        }else{
            console.warn('not a valid drag target');
            dragTarget = null;
        }
        return false;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {return undefined;}
        dragTarget.classList.add("dragIndication");
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
		// Track source for undo/redo
		dragAction.target = dragTarget;
		dragAction.fromParent = startParent;
		dragAction.fromBefore = startSibling;
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
        // WB-Specific
        if (dragTarget.dataset.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            // console.log('set drag target to clone of old drag target');
            dragTarget = wb.cloneBlock(dragTarget); // clones dataset and children, yay
            dragAction.target = dragTarget;
			// If we're dragging from the menu, there's no source to track for undo/redo
			dragAction.fromParent = dragAction.fromBefore = null;
            // Event.trigger(dragTarget, 'wb-clone'); // not in document, won't bubble to document.body
            dragTarget.classList.add('dragIndication');
            if (localDrag){
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
            // WB-Specific
            Event.trigger(dragTarget, 'wb-remove');
        }
        dragging = true;
        // get position and append target to .content, adjust offsets
        // set last offset
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
        // WB-Specific
        document.querySelector('.content.editor').appendChild(dragTarget);
        // WB-Specific
        if (cloned){
            // call this here so it can bubble to document.body
            Event.trigger(dragTarget, 'wb-clone');
        }
        // WB-Specific
        wb.reposition(dragTarget, startPosition);
        // WB-Specific ???
        potentialDropTargets = getPotentialDropTargets(dragTarget);
        // WB-Specific
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
        var nextPosition = {left: event.wbPageX, top: event.wbPageY}; // <- WB
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget); // <- WB
        // WB-Specific
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        // Scoll workspace as needed
        // WB-Specific
        if (workspace){
            // FIXME: is this why scroll-wheel doesn't work?
            // FIXME: is this why scrolling down works poorly?
            var container = workspace.parentElement;
            var offset = wb.rect(container);
            if (currPos.top < offset.top){
                container.scrollTop -= Math.min(container.scrollTop, offset.top - currPos.top);
            }else if (currPos.bottom > offset.bottom){
                var maxVerticalScroll = container.scrollHeight - offset.height - container.scrollTop;
                container.scrollTop += Math.min(maxVerticalScroll, currPos.bottom - offset.bottom);
            }
            if (currPos.left < offset.left){
                container.scrollLeft -= Math.min(container.scrollLeft, offset.left - currPos.left);
            }else if(currPos.right > offset.right){
                var maxHorizontalScroll = container.scrollWidth - offset.width - container.scrollLeft;
                container.scrollLeft += Math.min(maxHorizontalScroll, currPos.right - offset.right);
            }
        }
        currentPosition = nextPosition;
        return false;
    }

    function endDrag(end){
        clearTimeout(timer);
        timer = null;
        if (!dragging) {return undefined;}
        handleDrop(end.altKey || end.ctrlKey);
        reset();
        return false;
    }

    function handleDrop(copyBlock){
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        resetDragStyles(); // <- WB
        // WB-Specific
        if (wb.overlap(dragTarget, blockMenu)){
            // delete block if dragged back to menu
            Event.trigger(dragTarget, 'wb-delete');
            dragTarget.parentElement.removeChild(dragTarget);
            // Add history action if the source block was in the workspace
            if(!templateDrag) {
	        	// If we're dragging to the menu, there's no destination to track for undo/redo
    	    	dragAction.toParent = dragAction.toBefore = null;
        		wb.history.add(dragAction);
        	}
        }else if (dropTarget){
            dropTarget.classList.remove('dropActive');
            if (wb.matches(dragTarget, '.step')){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                if(copyBlock && !templateDrag) {
                    // FIXME: This results in two blocks if you copy-drag back to the starting socket
                	revertDrop();
                    // console.log('clone dragTarget block to dragTarget');
                	dragTarget = wb.cloneBlock(dragTarget);
                }
                dropTarget.insertBefore(dragTarget, dropCursor());
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }else{
                // Insert a value block into a socket
                if(copyBlock && !templateDrag) {
                	revertDrop();
                    // console.log('clone dragTarget value to dragTarget');
                	dragTarget = wb.cloneBlock(dragTarget);
                }
                dropTarget.appendChild(dragTarget);
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }
            dragAction.toParent = dragTarget.parentNode;
            dragAction.toBefore = dragTarget.nextElementSibling;
            if(dragAction.toBefore && !wb.matches(dragAction.toBefore, '.block')) {
            	// Sometimes the "next sibling" ends up being the cursor
            	dragAction.toBefore = dragAction.toBefore.nextElementSibling;
            }
            wb.history.add(dragAction);
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
            	revertDrop();
            }
        }
    }
    
    /* There's basically four types of drag actions
- Drag-in – dragging a block from the menu to the workspace
 	If fromParent is null, this is the type of drag that occurred.
 	- To undo: remove the block from the workspace
 	- To redo: re-insert the block into the workspace
- Drag-around - dragging a block from one position to another in the workspace
	Indicated by neither of fromParent and toParent being null.
	- To undo: remove the block from the old position and re-insert it at the new position.
	- To redo: remove the block from the old position and re-insert it at the new position.
- Drag-out - dragging a block from the workspace to the menu (thus deleting it)
	If toParent is null, this is the type of drag that occurred.
	- To undo: re-insert the block into the workspace.
	- To redo: remove the block from the workspace.
- Drag-copy - dragging a block from one position to another in the workspace and duplicating it
	At the undo/redo level, no distinction from drag-in is required.
	- To undo: remove the block from the new location.
	- To redo: re-insert the block at the new location.
	
	Note: If toBefore or fromBefore is null, that just means the location refers to the last
	possible position (ie, the block was added to or removed from the end of a sequence). Thus,
	we don't check those to determine what action to undo/redo.
 	*/
    
    function undoDrag() {
    	if(this.toParent != null) {
    		// Remove the inserted block
            // WB-Specific
    		Event.trigger(this.target, 'wb-remove');
    		this.target.remove();
    	}
    	if(this.fromParent != null) {
    		// Put back the removed block
    		this.target.removeAttribute('style');
            // WB-Specific
    		if(wb.matches(this.target,'.step')) {
    			this.fromParent.insertBefore(this.target, this.fromBefore);
    		} else {
    			this.fromParent.appendChild(this.target);
    		}
            // WB-Specific
			Event.trigger(this.target, 'wb-add');
    	}
    }
    
    function redoDrag() {
    	if(this.toParent != null) {
            // WB-Specific
    		if(wb.matches(this.target,'.step')) {
    			this.toParent.insertBefore(this.target, this.toBefore);
    		} else {
    			this.toParent.appendChild(this.target);
    		}
			Event.trigger(this.target, 'wb-add');
    	}
    	if(this.fromParent != null) {
            // WB-Specific
    		Event.trigger(this.target, 'wb-remove');
    		this.target.remove();
    	}
    }

    function resetDragStyles() {
        if (dragTarget){
            dragTarget.classList.remove('dragActive');
            dragTarget.classList.remove('dragIndication');
        }
        potentialDropTargets.forEach(function(elem){
            elem.classList.remove('dropTarget');
        });
    }
    
    function revertDrop() {
		// Put blocks back where we got them from
		if (startParent){
			if (wb.matches(startParent, '.socket')){
				// wb.findChildren(startParent, 'input').forEach(function(elem){
				//     elem.hide();
				// });
			}
			if(startSibling) {
				startParent.insertBefore(dragTarget, startSibling);
			} else {
				startParent.appendChild(dragTarget);
			}
			dragTarget.removeAttribute('style');
			startParent = null;
		}else{
			workspace.appendChild(dragTarget); // FIXME: We'll need an index into the canvas array
			wb.reposition(dragTarget, startPosition);
		}
        Event.trigger(dragTarget, 'wb-add');
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
        var dragRect = wb.rect(wb.findChild(dragTarget, '.label'));
        var cy = dragRect.top + dragRect.height / 2; // vertical centre of drag element
        // get only the .contains which cx is contained by
        var overlapping = potentialDropTargets.filter(function(item){
            var r = wb.rect(item);
            if (cy < r.top) return false;
            if (cy > r.bottom) return false;
            return true;
        });
        overlapping.sort(function(a, b){
            return wb.rect(b).left - wb.rect(a).left; // sort by depth, innermost first
        });
        if (!overlapping.length){
            workspace.appendChild(dropCursor());
            dropTarget = workspace;
            return;
        }
        dropTarget = overlapping[0];
        var position, middle;
        var siblings = wb.findChildren(dropTarget, '.step');
        if (siblings.length){
            for (var sIdx = 0; sIdx < siblings.length; sIdx++){
                var sibling = siblings[sIdx];
                position = wb.rect(sibling);
                if (cy < (position.top -4) || cy > (position.bottom + 4)) continue;
                middle = position.top + (position.height / 2);
                if (cy < middle){
                    dropTarget.insertBefore(dropCursor(), sibling);
                    return;
                }else{
                    dropTarget.insertBefore(dropCursor(), sibling.nextSibling);
                    return;
                }
            }
            dropTarget.appendChild(dropCursor()); // if we get here somehow, add it anyway
        }else{
            dropTarget.appendChild(dropCursor());
            return;
        }
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
        return !wb.findChild(elem, '.block');
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
            case 'asset':
            case 'expression':
                var selector = expressionDropTypes(view.dataset.type).map(dataSelector).join(',');
                if (!selector || !selector.length){
                    selector = '.socket > .holder'; // can drop an any anywhere
                }
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
    
    function cancelDrag(event) {
    	// Cancel if escape key pressed
        // console.log('cancel drag of %o', dragTarget);
    	if(event.keyCode == 27) {
    		resetDragStyles();
	    	revertDrop();
			clearTimeout(timer);
			timer = null;
			reset();
			return false;
	    }
    }

    // Initialize event handlers
    wb.initializeDragHandlers = function(){
        // console.log('initializeDragHandlers');
        if (Event.isTouch){
            Event.on('.content', 'touchstart', '.block', initDrag);
            Event.on('.content', 'touchmove', null, drag);
            Event.on('.content', 'touchend', null, endDrag);
            // TODO: A way to cancel the drag?
            // Event.on('.scripts_workspace', 'tap', '.socket', selectSocket);
        }else{
            Event.on('.content', 'mousedown', '.block', initDrag);
            Event.on('.content', 'mousemove', null, drag);
            Event.on('.content', 'mouseup', null, endDrag);
            Event.on(document.body, 'keyup', null, cancelDrag);
            // Event.on('.scripts_workspace', 'click', '.socket', selectSocket);
        }
    };



})(this);


/*end drag.js*/

/*begin uuid.js*/
// This returns a Version 4 (random) UUID
// See: https://en.wikipedia.org/wiki/Universally_unique_identifier for more info

(function(global){
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
  var UUID_TEST = /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{11}[a-zA-Z0-9]?/;

  function isUuid(value){
    if (!value) return false;
    return UUID_TEST.test(value);
  }

  // Public interface
  function uuid(){
    return hex(8) + '-' + hex(4) + '-4' + hex(3) + '-' + variant() + hex(3) + '-' + hex(12);
  }

  global.uuid = uuid;
  global.isUuid = isUuid;

})(this);

/*end uuid.js*/

/*begin block.js*/
// Revised Block handling.
//
// Nearly all the block is defined in the HTML and DOM
// This file helps to initialize the block DOM, and provide
// support routines
//
// The idea here is that rather than try to maintain a separate "model" to capture
// the block state, which mirros the DOM and has to be kept in sync with it,
// just keep that state in the DOM itself using attributes (and data- attributes)
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
        _nextSeqNum = Math.max(parseInt(seqNum, 10), _nextSeqNum);
    }

    var blockRegistry = {};
    wb.blockRegistry = blockRegistry;

    var registerBlock = function(blockdesc){
        if (blockdesc.seqNum){
            registerSeqNum(blockdesc.seqNum);
        }else if (!blockdesc.isTemplateBlock){
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
        try{
            return blockRegistry[id].script;
        }catch(e){
            console.error('Error: could not get script for %o', id);
            console.error('Hey look: %o', document.getElementById(id));
            return '';
        }
    }

    var getSockets = function(block){
        return wb.findChildren(wb.findChild(block, '.label'), '.socket');
    }

    var getSocketValue = function(socket){
        return socketValue(wb.findChild(socket, '.holder'));
    }

    var createSockets = function(obj){
        return obj.sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj);
        });
    }

    var Block = function(obj){
        // FIXME:
        // Handle customized names (sockets)
        registerBlock(obj);
        // if (!obj.isTemplateBlock){
        //     console.log('block seq num: %s', obj.seqNum);
        // }
        var block = elem(
            'div',
            {
                'class': function(){
                    var names = ['block', obj.group, obj.blocktype];
                    if(obj.blocktype === "expression"){
                        names.push(obj.type);
                        names.push(obj.type+'s'); // FIXME, this is a horrible hack for CSS
                    }else if (obj.blocktype === 'context'){
                        names.push('step');
                    }else if (obj.blocktype === 'eventhandler'){
                        names.push('step');
                        names.push('context');
                    }else if (obj.blocktype === 'asset'){
                        names.push('expression');
                    }
                    return names.join(' ');
                },
                'data-blocktype': obj.blocktype,
                'data-group': obj.group,
                'id': obj.id,
                'data-scope-id': obj.scopeId || 0,
                'data-script-id': obj.scriptId || obj.id,
                'data-local-source': obj.localSource || null, // help trace locals back to their origin
                'data-sockets': JSON.stringify(obj.sockets),
                'data-locals': JSON.stringify(obj.locals),
                'title': obj.help || getHelp(obj.scriptId || obj.id)
            },
            elem('div', {'class': 'label'}, createSockets(obj))
        );
        if (obj.seqNum){
            block.dataset.seqNum = obj.seqNum;
        }
        if (obj.type){
            block.dataset.type = obj.type; // capture type of expression blocks
        }
        if (obj.script){
            block.dataset.script = obj.script;
        }
        if (obj.isLocal){
            block.dataset.isLocal = obj.isLocal;
        }
        if (obj.isTemplateBlock){
            block.dataset.isTemplateBlock = obj.isTemplateBlock;
        }
        if (obj.closed){
            block.dataset.closed = true;
        }
        if (obj.blocktype === 'context' || obj.blocktype === 'eventhandler'){
            block.appendChild(elem('div', {'class': 'locals block-menu'}));
            var contained = elem('div', {'class': 'contained'});
            block.appendChild(contained);
            if (obj.contained){
                obj.contained.map(function(childdesc){
                    var child = Block(childdesc);
                    contained.appendChild(child);
                    addStep({wbTarget: child}); // simulate event
                });
            }
            if (! wb.matches(block, '.scripts_workspace')){
                var label = wb.findChild(block, '.label');
                label.insertBefore(elem('div', {'class': 'disclosure'}), label.firstElementChild);
            }
        }
        // if (!obj.isTemplateBlock){
        //     console.log('instantiated block %o from description %o', block, obj);
        // }
        return block;
    }

    // Block Event Handlers

    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-add', '.block', addBlock);
    Event.on(document.body, 'wb-clone', '.block', onClone);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

    function removeBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            removeExpression(event);
        }else{
            removeStep(event);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'removed'});
    }

    function addBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            addExpression(event);
        }else{
            addStep(event);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'added'});
    }

    function removeStep(event){
        // About to remove a block from a block container, but it still exists and can be re-added
        // Remove instances of locals
        var block = event.wbTarget;
        // console.log('remove block: %o', block);
        if (block.classList.contains('step') && !block.classList.contains('context')){
            var parent = wb.closest(block, '.context'); // valid since we haven't actually removed the block from the DOM yet
            if (block.dataset.locals && block.dataset.locals.length){
                // remove locals
                var locals = wb.findAll(parent, '[data-local-source="' + block.id + '"]');
                locals.forEach(function(local){
                    if (!local.isTemplateBlock){
                        Event.trigger(local, 'wb-remove');
                    }
                    local.parentElement.removeChild(local);
                });
                delete block.dataset.localsAdded;
            }
        }
    }

    function removeExpression(event){
        // Remove an expression from an expression holder, say for dragging
        // Revert socket to default
        var block = event.wbTarget;
        //  ('remove expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.removeAttribute('style');
        });
    }

    function addStep(event){
        // Add a block to a block container
        var block = event.wbTarget;
        // console.log('add block %o', block);
        if (block.dataset.locals && block.dataset.locals.length && !block.dataset.localsAdded){
            var parent = wb.closest(block, '.context');
            var locals = wb.findChild(parent, '.locals');
            var parsedLocals = [];
            JSON.parse(block.dataset.locals).forEach(
                function(spec){
                    spec.isTemplateBlock = true;
                    spec.isLocal = true;
                    spec.group = block.dataset.group;
                    if (!spec.seqNum){
                        spec.seqNum = block.dataset.seqNum;
                    }
                    // add scopeid to local blocks
                    spec.scopeId = parent.id;
                    if(!spec.id){
                        spec.id = spec.scriptId = uuid();
                    }
                    // add localSource so we can trace a local back to its origin
                    spec.localSource = block.id;
                    block.dataset.localsAdded = true;
                    locals.appendChild(Block(spec));
                    parsedLocals.push(spec);
                }
            );
            block.dataset.locals = JSON.stringify(parsedLocals);
        }
    }

    function addExpression(event){
        // add an expression to an expression holder
        // hide or remove default block
        var block = event.wbTarget;
        // console.log('add expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.style.display = 'none';
        });
        if (event.stopPropagation){
            event.stopPropagation();
        }
    }

    function onClone(event){
        // a block has been cloned. Praise The Loa!
        var block = event.wbTarget;
        // console.log('block cloned %o', block);
    }

    var Socket = function(desc, blockdesc){
        // desc is a socket descriptor object, block is the owner block descriptor
        // Sockets are described by text, type, and (default) value
        // type and value are optional, but if you have one you must have the other
        // If the type is choice it must also have a options for the list of values
        // that can be found in the wb.choiceLists
        // A socket may also have a block, the id of a default block
        // A socket may also have a uValue, if it has been set by the user, over-rides value
        // A socket may also have a uName if it has been set by the user, over-rides name
        // A socket may also have a uBlock descriptor, if it has been set by the user, this over-rides the block
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
        // if (!blockdesc.isTemplateBlock){
        //     console.log('socket seq num: %s', blockdesc.seqNum);
        // }
        socket.firstElementChild.innerHTML = socket.firstElementChild.innerHTML.replace(/##/, ' <span class="seq-num">' + (blockdesc.seqNum || '##') + '</span>');
        if (desc.type){
            socket.dataset.type = desc.type;
            var holder = elem('div', {'class': 'holder'}, [Default(desc)]);
            socket.appendChild(holder)
        }
        if (desc.block){
            socket.dataset.block = desc.block;
        }
        if (!blockdesc.isTemplateBlock){
            var newBlock = null;
            if (desc.uBlock){
                // console.log('trying to instantiate %o', desc.uBlock);
                newBlock = Block(desc.uBlock);
                // console.log('created instance: %o', newBlock);
            }else if (desc.block){
                newBlock = cloneBlock(document.getElementById(desc.block));
            }
            if (newBlock){
                holder.appendChild(newBlock);
                addExpression({'wbTarget': newBlock});
            }
        }
        return socket;
    }


    function socketDesc(socket){
        var desc = {
            name: socket.dataset.name,
        }
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
        // User-specified settings
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name')
        
        if (desc.name !== uName){
            desc.uName = uName;
        }
        var holder = wb.findChild(socket, '.holder');
        if (holder){
            var input = wb.findChild(holder, 'input, select');
            desc.uValue = input.value;
            var block = wb.findChild(holder, '.block');
            if (wb.matches(holder.lastElementChild, '.block')){
                desc.uBlock = blockDesc(holder.lastElementChild);
            }
        }
        return desc;
    }

    function blockDesc(block){
        var label = wb.findChild(block, '.label');
        var sockets = wb.findChildren(label, '.socket');
        var desc = {
            blocktype: block.dataset.blocktype,
            group: block.dataset.group,
            id: block.id,
            help: block.title,
            scopeId: block.dataset.scopeId,
            scriptId: block.dataset.scriptId,
            sockets: sockets.map(socketDesc)
        }
        if (block.dataset.seqNum){
            desc.seqNum  = block.dataset.seqNum;
        }
        if (block.dataset.script){
            desc.script = block.dataset.script;
        }
        if (block.dataset.isTemplateBlock){
            desc.isTemplateBlock = true;
        }
        if (block.dataset.isLocal){
            desc.isLocal = true;
        }
        if (block.dataset.localSource){
            desc.localSource = block.dataset.localSource;
        }
        if (block.dataset.type){
            desc.type = block.dataset.type;
        }
        if (block.dataset.locals){
            desc.locals = JSON.parse(block.dataset.locals);
        }
        if (block.dataset.closed){
            desc.closed = true;
        }
        var contained = wb.findChild(block, '.contained');
        if (contained && contained.children.length){
            desc.contained = wb.findChildren(contained, '.block').map(blockDesc);
        }
        return desc;
    }

    function cloneBlock(block){
        // Clone a template (or other) block
        var blockdesc = blockDesc(block);
        delete blockdesc.id;
        ////////////////////
        // Why were we deleting seqNum here?
        // I think it was from back when menu template blocks had sequence numbers
        // /////////////////
        // if (!blockdesc.isLocal){
        //     delete blockdesc.seqNum;
        // }
        if (blockdesc.isTemplateBlock){
            blockdesc.scriptId = block.id;            
        }
        delete blockdesc.isTemplateBlock;
        delete blockdesc.isLocal;        
        return Block(blockdesc);
    }

    function deleteBlock(event){
        // delete a block from the script entirely
        // remove from registry
        var block = event.wbTarget;
        // console.log('block deleted %o', block);
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
                value = obj.uValue || obj.value || ''; break;
            case 'number':
                value = obj.uValue || obj.value || 0; break;
            case 'string':
                value = obj.uValue || obj.value || ''; break;
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
            case 'image':
                value = obj.uValue || obj.value || ''; break;
            case 'phone':
                value = obj.uValue || obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.uValue || obj.value || 'waterbear@waterbearlang.com'; break;
            case 'boolean':
                obj.options = 'boolean';
            case 'choice':
                var choice = elem('select');
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    var value = obj.uValue || obj.value;
                    if (value && value === opt){
                        option.setAttribute('selected', 'selected');
                    }
                    choice.appendChild(option);
                });
                return choice;
            default:
                value = obj.uValue || obj.value || '';
        }
        var input = elem('input', {type: type, value: value});

        //Only enable editing for the appropriate types
        if (!(type === "string" || type === "any" || 
              type === "number" || type === "color")) {
            input.readOnly = true;
        }

        wb.resize(input);
        return input;
    }

    var socketValue = function(holder){
        if (holder.children.length > 1){
            return codeFromBlock(wb.findChild(holder, '.block'));
        }else{
            var value = wb.findChild(holder, 'input, select').value;
            var type = holder.parentElement.dataset.type;
            if (type === 'string' || type === 'choice' || type === 'color'){
                if (value[0] === '"'){value = value.slice(1);}
                if (value[value.length-1] === '"'){value = value.slice(0,-1);}
                value = value.replace(/"/g, '\\"');
                value = '"' + value + '"';
            }
            return value;
        }
    }

    var codeFromBlock = function(block){
        var scriptTemplate = getScript(block.dataset.scriptId).replace(/##/g, '_' + block.dataset.seqNum);
        if (!scriptTemplate){
            // If there is no scriptTemplate, things have gone horribly wrong, probably from 
            // a block being removed from the language rather than hidden
            wb.findAll('.block[data-scriptId=' + block.dataset.scriptId).forEach(function(elem){
                elem.style.backgroundColor = 'red';
            });
        }
        var childValues = [];
        var label = wb.findChild(block, '.label');
        var expressionValues = wb.findChildren(label, '.socket')
            .map(function(socket){ return wb.findChild(socket, '.holder'); }) // get holders, if any
            .filter(function(holder){ return holder; }) // remove undefineds
            .map(socketValue); // get value
        if (wb.matches(block, '.context')){
            var childValues = wb.findChildren(wb.findChild(block, '.contained'), '.block').map(codeFromBlock).join('');
        }
        // Now intertwingle the values with the template and return the result
        function replace_values(match, offset, s){
            var idx = parseInt(match.slice(2, -2), 10) - 1;
            if (match[0] === '{'){
                return expressionValues[idx] || 'null';
            }else{
                return childValues || '/* do nothing */';
            }
        }
        var _code = scriptTemplate.replace(/\{\{\d\}\}/g, replace_values);
        var _code2 = _code.replace(/\[\[\d\]\]/g, replace_values);
        return _code2;
    };

    function changeName(event){
        var nameSpan = event.wbTarget;
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
        var input = event.wbTarget;
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
			});

			//Change name of parent
			var parent = document.getElementById(source.dataset.localSource);
			var nameTemplate = JSON.parse(parent.dataset.sockets)[0].name;
			nameTemplate = nameTemplate.replace(/[^' ']*##/g, newName);

			//Change locals name of parent
			var parentLocals = JSON.parse(parent.dataset.locals);
			var localSocket = parentLocals[0].sockets[0];
			localSocket.name = newName;
			parent.dataset.locals = JSON.stringify(parentLocals);

			wb.find(parent, '.name').textContent = nameTemplate;
    	    Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'nameChanged'});
		}
		var action = {
			undo: function() {
				propagateChange(oldName);
			},
			redo: function() {
				propagateChange(newName);
			},
		}
		wb.history.add(action);
		action.redo();
    }

    function cancelUpdateName(event){
        var input = event.wbTarget;
        var nameSpan = input.previousSibling;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
    }

    function maybeUpdateName(event){
        var input = event.wbTarget;
        if (event.keyCode === 0x1B /* escape */ ){
            event.preventDefault();
            input.value = input.previousSibling.textContent;
            input.blur()
        }else if(event.keyCode === 0x0D /* return or enter */ || event.keyCode === 0x09 /* tab */){
            event.preventDefault();
            input.blur();
        }
    }


    // Export methods
    wb.Block = Block;
    wb.blockDesc = blockDesc;
    wb.registerSeqNum = registerSeqNum;
    wb.cloneBlock = cloneBlock;
    wb.codeFromBlock = codeFromBlock;
    wb.addBlockHandler = addBlock;
    wb.changeName = changeName;
    wb.getSockets = getSockets;
    wb.getSocketValue = getSocketValue;
})(wb);


/*end block.js*/

/*begin file.js*/
// All File-like I/O functions, including:
//
// * Loading and saving to Gists
// * Loading and saving to MakeAPI (not implemented yet)
// * Loading and saving to Filesystem
// * Loading and saving to LocalStorage (including currentScript)
// * Loading examples
// * etc.

(function(wb){

	wb.saveCurrentScripts = function saveCurrentScripts(){
		if (!wb.scriptModified){
			// console.log('nothing to save');
			// nothing to save
			return;
		}
		wb.showWorkspace('block');
		document.querySelector('#block_menu').scrollIntoView();
		localStorage['__' + wb.language + '_current_scripts'] = scriptsToString();
	};

	// Save script to gist;
	wb.saveCurrentScriptsToGist = function saveCurrentScriptsToGist(event){
	    event.preventDefault();
		// console.log("Saving to Gist");
		var title = prompt("Save to an anonymous Gist titled: ");

		ajax.post("https://api.github.com/gists", function(data){
	        //var raw_url = JSON.parse(data).files["script.json"].raw_url;
	        var gistID = JSON.parse(data).url.split("/").pop();
	        prompt("This is your Gist ID. Copy to clipboard: Ctrl+C, Enter", gistID);

	        //save gist id to local storage
	        var localGists = localStorage['__' + wb.language + '_recent_gists'];
	        var gistArray = localGists == undefined ? [] : JSON.parse(localGists);
	        gistArray.push(gistID);
	        localStorage['__' + wb.language + '_recent_gists'] = JSON.stringify(gistArray);

	    }, JSON.stringify({
	    	"description": title,
	    	"public": true,
	    	"files": {
	    		"script.json": {
	    			"content": scriptsToString(title)
	    		},
	    	}
	    }));
	};
	//populate the gist submenu with recent gists
	wb.loadRecentGists = function loadRecentGists() {
		var localGists = localStorage['__' + wb.language + '_recent_gists'];
		var gistArray = localGists == undefined ? [] : JSON.parse(localGists);
		var gistContainer = document.querySelector("#recent_gists");
		gistContainer.innerHTML = '';

		for (var i = 0; i < gistArray.length; i++) {
			//add a new button to the gist sub-menu
			var gist = gistArray[i];
			var node = document.createElement("li");
			var button = document.createElement('button');
			var buttonText = document.createTextNode("#" + gist);

			button.appendChild(buttonText);
			button.classList.add('load-gist');
			button.dataset.href = wb.language + ".html?gist=" + gist;
			button.dataset.gist = gist;

			node.appendChild(button);
			gistContainer.appendChild(node);

			button.addEventListener('click', function(){
				wb.loadScriptsFromGistId(this.dataset.gist);
			});
		}
	};


	function scriptsToString(title, description){
		if (!title){ title = ''; }
		if (!description){ description = ''; }
		var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
		return JSON.stringify({
			title: title,
			description: description,
			date: Date.now(),
			waterbearVersion: '2.0',
			blocks: blocks.map(wb.blockDesc)
		});
	}


	wb.createDownloadUrl = function createDownloadUrl(evt){
	    evt.preventDefault();
	    var title = prompt("Save file as: ");
		var URL = window.webkitURL || window.URL;
		var file = new Blob([scriptsToString()], {type: 'application/json'});
		var reader = new FileReader();
		var a = document.createElement('a');
		reader.onloadend = function(){
			a.href = reader.result;
			a.download = title + '.json';
			a.target = '_blank';
			document.body.appendChild(a);
			a.click();
		};
		reader.readAsDataURL(file);
	};

	wb.loadScriptsFromGistId = function loadScriptsFromGistId(id){
		//we may get an event passed to this function so make sure we have a valid id or ask for one
		var gistID = isNaN(parseInt(id)) ? prompt("What Gist would you like to load? Please enter the ID of the Gist: ")  : id;
		// console.log("Loading gist " + id);
		ajax.get("https://api.github.com/gists/"+gistID, function(data){
			loadScriptsFromGist({data:JSON.parse(data)});
		});
	};

	wb.loadScriptsFromFilesystem = function loadScriptsFromFilesystem(event){
		var input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'application/json');
		input.addEventListener('change', function(evt){
			var file = input.files[0];
			loadScriptsFromFile(file);
		});
		input.click();
	};

	function loadScriptsFromObject(fileObject){
	    // console.info('file format version: %s', fileObject.waterbearVersion);
	    // console.info('restoring to workspace %s', fileObject.workspace);
	    if (!fileObject) return wb.createWorkspace();
	    var blocks = fileObject.blocks.map(wb.Block);
	    if (!blocks.length){
	    	return wb.createWorkspace();
	    }
	    if (blocks.length > 1){
	    	console.error('not really expecting multiple blocks here right now');
	    	console.error(blocks);
	    }
	    blocks.forEach(function(block){
	    	wb.wireUpWorkspace(block);
	    	Event.trigger(block, 'wb-add');
	    });
	    wb.loaded = true;
	    Event.trigger(document.body, 'wb-script-loaded');
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
			console.error('no json file found in gist: %o', gist);
			return;
		}
		loadScriptsFromObject(JSON.parse(file));
	}

	function loadScriptsFromExample(name){
		wb.ajax('examples/' + wb.language + '/' + name + '.json', function(exampleJson){
			loadScriptsFromObject(JSON.parse(exampleJson));
		}, function(xhr, status){
			console.error('Error in wb.ajax:', status);
		});
	}

	wb.loadCurrentScripts = function(queryParsed){
		// console.log('loadCurrentScripts(%s)', JSON.stringify(queryParsed));
		if (wb.loaded) return;
		if (queryParsed.gist){
			// console.log("Loading gist %s", queryParsed.gist);
			ajax.get("https://api.github.com/gists/"+queryParsed.gist, function(data){
				loadScriptsFromGist({data:JSON.parse(data)});
			});
		}else if (queryParsed.example){
			// console.log('loading example %s', queryParsed.example);
			loadScriptsFromExample(queryParsed.example);
		}else if (localStorage['__' + wb.language + '_current_scripts']){
			// console.log('loading current script from local storage');
			var fileObject = JSON.parse(localStorage['__' + wb.language + '_current_scripts']);
			if (fileObject){
				loadScriptsFromObject(fileObject);
			}
		}else{
			// console.log('no script to load, starting a new script');
			wb.createWorkspace('Workspace');
		}
		wb.loaded = true;
		Event.trigger(document.body, 'wb-loaded');
	};

	function loadScriptsFromFile(file){
		fileName = file.name;
		if (fileName.indexOf('.json', fileName.length - 5) === -1) {
			console.error("File not a JSON file");
			return;
		}
		var reader = new FileReader();
		reader.readAsText( file );
		reader.onload = function (evt){
			wb.clearScripts(null, true);
			var saved = JSON.parse(evt.target.result);
			wb.loaded = true;
			loadScriptsFromObject(saved);
			wb.scriptModified = true;
		};
	}

	wb.getFiles = function getFiles(evt){
		evt.stopPropagation();
		evt.preventDefault();
		var files = evt.dataTransfer.files;
		if ( files.length > 0 ){
	        // we only support dropping one file for now
	        var file = files[0];
	        loadScriptsFromFile(file);
	    }
	}


})(wb);

/*end file.js*/

/*begin undo.js*/
(function(wb){
// Undo list

// Undo actions must support two methods:
// - undo() which reverses the effect of the action
// - redo() which reapplies the effect of the action, assuming it has been redone.
// These methods may safely assume that no other actions have been performed.

// This is the maximum number of actions that will be stored in the undo list.
// There's no reason why it needs to be constant; there could be an interface to alter it.
// (Of course, that'd require making it public first.)
var MAX_UNDO = 30;
var undoActions = [];
// When currentAction == undoActions.length, there are no actions available to redo
var currentAction = 0;

function clearUndoStack(){
	undoActions.length = 0;
	currentAction = 0;
	try{
		document.querySelector('.undoAction').style.display = 'none';
		document.querySelector('.redoAction').style.display = 'none';
	}catch(e){
		// don't worry if undo ui is not available yet
	}
}

function undoLastAction() {
	if(currentAction <= 0) return; // No action to undo!
	currentAction--;
	undoActions[currentAction].undo();
	if(currentAction <= 0) {
		document.querySelector('.undoAction').style.display = 'none';
	}
	document.querySelector('.redoAction').style.display = '';
}

try{
	document.querySelector('.undoAction').style.display = 'none';
}catch(e){
	// some languages do not yet support undo/redo
}

function redoLastAction() {
	if(currentAction >= undoActions.length) return; // No action to redo!
	undoActions[currentAction].redo();
	currentAction++;
	if(currentAction >= undoActions.length) {
		document.querySelector('.redoAction').style.display = 'none';
	}
	document.querySelector('.undoAction').style.display = '';
}

try{
	document.querySelector('.redoAction').style.display = 'none';
}catch(e){
	// some languages do not yet support undo/redo
}

function addUndoAction(action) {
	if(!action.hasOwnProperty('redo') || !action.hasOwnProperty('undo')) {
		console.error("Tried to add invalid action!");
		return;
	}
	if(currentAction < undoActions.length) {
		// Truncate any actions available to be redone
		undoActions.length = currentAction;
	} else if(currentAction >= MAX_UNDO) {
		// Drop the oldest action
		currentAction--;
		undoActions.shift();
	}
	undoActions[currentAction] = action;
	currentAction++;
	document.querySelector('.undoAction').style.display = '';
	document.querySelector('.redoAction').style.display = 'none';
	// console.log('undo stack: %s', undoActions.length);
}

wb.history = {
	add: addUndoAction,
	undo: undoLastAction,
	redo: redoLastAction,
	clear: clearUndoStack
}

Event.on('.undoAction', 'click', null, undoLastAction);
Event.on('.redoAction', 'click', null, redoLastAction);
Event.on(document.body, 'wb-script-loaded', null, clearUndoStack);

})(wb);
/*end undo.js*/

/*begin ui.js*/
(function(wb){

// UI Chrome Section

function tabSelect(event){
    var target = event.wbTarget;
    event.preventDefault();
    document.querySelector('.tabbar .selected').classList.remove('selected');
    target.classList.add('selected');
    if (wb.matches(target, '.scripts_workspace_tab')){
        showWorkspace('block');
    }else if (wb.matches(target, '.scripts_text_view_tab')){
        showWorkspace('text');
        updateScriptsView();
    }
}

function accordion(event){
    event.preventDefault();
    var open = document.querySelector('#block_menu .open');
    if (open){
        open.classList.remove('open');
    }
    if (open && open === event.wbTarget.nextSibling) return;
    event.wbTarget.nextSibling.classList.add('open');
}


function showWorkspace(mode){
    // console.log('showWorkspace');
    var workspace = document.querySelector('.workspace');
    var scriptsWorkspace = document.querySelector('.scripts_workspace');
    if (!scriptsWorkspace) return;
    var scriptsTextView = document.querySelector('.scripts_text_view');
    if (mode === 'block'){
	    scriptsWorkspace.style.display = '';
	    scriptsTextView.style.display = 'none';
        workspace.classList.remove('textview');
        workspace.classList.add('blockview');
    }else if (mode === 'text'){
    	scriptsWorkspace.style.display = 'none';
    	scriptsTextView.style.display = '';
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


function changeSocket(event) {
	// console.log("Changed a socket!");
	var oldValue = event.target.getAttribute('data-oldvalue');
	var newValue = event.target.value;
	if(oldValue == undefined) oldValue = event.target.defaultValue;
	// console.log("New value:", newValue);
	// console.log("Old value:", oldValue);
	event.target.setAttribute('data-oldvalue', newValue);
	var action = {
		undo: function() {
			event.target.value = oldValue;
			event.target.setAttribute('data-oldvalue', oldValue);
		},
		redo: function() {
			event.target.value = newValue;
			event.target.setAttribute('data-oldvalue', newValue);
		}
	}
	wb.history.add(action);
}


/* TODO list of undoable actions:
 -  Moving a step from position A to position B
 -  Adding a new block at position X
 -  Moving an expression from slot A to slot B
 -  Adding a new expression to slot X
 -  Editing the value in slot X (eg, using the colour picker, typing in a string, etc)
 -  Renaming a local expression/variable
 -  Deleting a step from position X
 -  Deleting an expression from slot X
 Break them down:
1. Replacing the block in the clipboard with a new block
2. Editing the literal value in slot X
3. Inserting a step at position X
4. Removing a step at position X
5. Inserting an expression into slot X
6. Removing an expression from slot X
 More detail:
 - Copy is 1
 - Cut is 1 and 4 or 1 and 6
 - Paste is 3 or 5
 - Drag-in is 3 or 5
 - Drag-around is 4 and 3 or 6 and 5
 - Drag-out is 4 or 6
 - Drag-copy is 3 or 5
*/

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

function copyCommand(evt) {
	// console.log("Copying a block in ui.js!");
	// console.log(this);
	action = {
		copied: this,
		oldPasteboard: pasteboard,
		undo: function() {
			pasteboard = this.oldPasteboard;
		},
		redo: function() {
			pasteboard = this.copied;
		},
	}
	wb.history.add(action);
	action.redo();
}

function cutCommand(evt) {
	// console.log("Cutting a block!");
	action = {
		removed: this,
		// Storing parent and next sibling in case removing the node from the DOM clears them
		parent: this.parentNode,
		before: this.nextSibling,
		oldPasteboard: pasteboard,
		undo: function() {
			// console.log(this);
			if(wb.matches(this.removed,'.step')) {
				this.parent.insertBefore(this.removed, this.before);
			} else {
				this.parent.appendChild(this.removed);
			}
			Event.trigger(this.removed, 'wb-add');
			pasteboard = this.oldPasteboard;
		},
		redo: function() {
			Event.trigger(this.removed, 'wb-remove');
			this.removed.remove();
			pasteboard = this.removed;
		},
	}
	wb.history.add(action);
	action.redo();
}

function pasteCommand(evt) {
	// console.log(pasteboard);
	action = {
		pasted: wb.cloneBlock(pasteboard),
		into: cmenu_target.parentNode,
		before: cmenu_target.nextSibling,
		undo: function() {
			Event.trigger(this.pasted, 'wb-remove');
			this.pasted.remove();
		},
		redo: function() {
			if(wb.matches(pasteboard,'.step')) {
				// console.log("Pasting a step!");
				this.into.insertBefore(this.pasted,this.before);
			} else {
				// console.log("Pasting an expression!");
				cmenu_target.appendChild(this.pasted);
			}
			Event.trigger(this.pasted, 'wb-add');
		},
	}
	wb.history.add(action);
	action.redo();
}

function canPaste() {
	if(!pasteboard) return false;
	if(wb.matches(pasteboard,'.step') && !wb.matches(cmenu_target,'.holder')) {
		return true;
	}
	if(wb.matches(pasteboard,'.expression') && wb.matches(cmenu_target,'.holder')) {
		return true;
	}
	return false;
}

var pasteboard = null;
var current_cmenu = null;
var show_context = false;
var cmenu_disabled = false;
var cmenu_target = null;

function cmenuitem_enabled(menuitem) {
	if(menuitem.enabled) {
		if(typeof(menuitem.enabled) == 'function') {
			return menuitem.enabled();
		} else return menuitem.enabled;
	}
	return true;
}


function buildContextMenu(options) {
	// console.log('building context menu');
	// console.log(options);
	var contextDiv = document.getElementById('context_menu');
	contextDiv.innerHTML = '';
	var menu = document.createElement('ul');
	menu.classList.add('cmenu');
	for(var key in options) {
		if(options.hasOwnProperty(key) && options[key]) {
			var item = document.createElement('li');
			if(cmenuitem_enabled(options[key])) {
				Event.on(item, "click", null, cmenuCallback(options[key].callback));
			} else {
				item.classList.add('disabled');
			}
			if(options[key].startGroup) {
				item.classList.add('topSep');
			}
			item.innerHTML = options[key].name;
			menu.appendChild(item);
		}
	}
	var item = document.createElement('li');
	item.onclick = function(evt) {};
	item.innerHTML = 'Disable this menu';
	item.classList.add('topSep');
	Event.on(item, 'click', null, disableContextMenu);
	menu.appendChild(item);
	contextDiv.appendChild(menu);
}

function stackTrace() {
	var e = new Error('stack trace');
	var stack = e.stack.replace(/@.*\//gm, '@')
		.split('\n');
	// console.log(stack);
}

function closeContextMenu(evt) {
	var contextDiv = document.getElementById('context_menu');
	if(!wb.matches(evt.wbTarget, '#context_menu *')) {
		contextDiv.style.display = 'none';
	}
}

function handleContextMenu(evt) {
	// console.log('handling context menu');
	stackTrace();
	//if(!show_context) return;
	// console.log(evt.clientX, evt.clientY);
	// console.log(evt.wbTarget);
	if(cmenu_disabled || wb.matches(evt.wbTarget, '.block-menu *')) return;
	else if(false);
	else if(wb.matches(evt.wbTarget, '.block:not(.scripts_workspace) *')) {
		setContextMenuTarget(evt.wbTarget);
		buildContextMenu(block_cmenu);
	} else return;
	showContextMenu(evt.clientX, evt.clientY);
	evt.preventDefault();
}

function setContextMenuTarget(target) {
	cmenu_target = target;
	while(!wb.matches(cmenu_target, '.block') && !wb.matches(cmenu_target, '.holder')) {
		// console.log(cmenu_target);
		cmenu_target = cmenu_target.parentNode;
		if(cmenu_target.tagName == 'BODY') {
			console.error("Something went wrong with determining the context menu target!");
			cmenu_target = null;
			contextDiv.style.display = 'none';
		}
	}
}

function showContextMenu(atX, atY) {
	// console.log('showing context menu');
	var contextDiv = document.getElementById('context_menu');
	contextDiv.style.display = 'block';
	contextDiv.style.left = atX + 'px';
	contextDiv.style.top = atY + 'px';
}

function cmenuCallback(fcn) {
	return function(evt) {
		// console.log(cmenu_target);
		fcn.call(cmenu_target,evt);
		var contextDiv = document.getElementById('context_menu');
		contextDiv.style.display = 'none';
		evt.preventDefault();
	};
}

function disableContextMenu(evt) {
	cmenu_disabled = true;
	var enableBtn = document.querySelector('.cmenuEnable');
	enableBtn.style.display = '';
	var contextDiv = document.getElementById('context_menu');
	contextDiv.style.display = 'none';
}

function enableContextMenu(evt) {
	cmenu_disabled = false;
	var enableBtn = document.querySelector('.cmenuEnable');
	enableBtn.style.display = 'none';
}

var block_cmenu = {
	//expand: {name: 'Expand All', callback: dummyCallback},
	//collapse: {name: 'Collapse All', callback: dummyCallback},
	cut: {name: 'Cut', callback: cutCommand},
	copy: {name: 'Copy', callback: copyCommand},
	//copySubscript: {name: 'Copy Subscript', callback: dummyCallback},
	paste: {name: 'Paste', callback: pasteCommand, enabled: canPaste},
	//cancel: {name: 'Cancel', callback: dummyCallback},
}

// Test drawn from modernizr
function is_touch_device() {
  return !!('ontouchstart' in window);
}

initContextMenus();

// Build the Blocks menu, this is a public method
wb.menu = function(blockspec){
    var title = blockspec.name.replace(/\W/g, '');
    var specs = blockspec.blocks;
    return edit_menu(title, specs);
};

function edit_menu(title, specs, show){
	menu_built = true;
    var group = title.toLowerCase().split(/\s+/).join('');
    var submenu = document.querySelector('.' + group + '+ .submenu');
    if (!submenu){
        var header = wb.elem('h3', {'class': group + ' accordion-header', 'id': 'group_'+group}, title);
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

function initContextMenus() {
	Event.on(document.body, 'contextmenu', null, handleContextMenu);
	Event.on(document.body, 'mouseup', null, closeContextMenu);
	Event.on('.cmenuEnable', 'click', null, enableContextMenu);
	document.querySelector('.cmenuEnable').style.display = 'none';
}


Event.on(document.body, 'change', 'input', changeSocket);
Event.on('#block_menu', 'click', '.accordion-header', accordion);
Event.on('.tabbar', 'click', '.chrome_tab', tabSelect);


})(wb);


/*end ui.js*/

/*begin workspace.js*/
(function(wb){

	wb.language = location.pathname.match(/\/([^/.]*)\.html/)[1];

	wb.clearScripts = function clearScripts(event, force){
		if (force || confirm('Throw out the current script?')){
			var workspace = document.querySelector('.workspace > .scripts_workspace')
			workspace.parentElement.removeChild(workspace);
			wb.scriptModified = false;
			wb.loaded = false;
			createWorkspace('Workspace');
			document.querySelector('.workspace > .scripts_text_view').innerHTML = '';
			wb.history.clear();
			delete localStorage['__' + wb.language + '_current_scripts'];
			// FIXME: I'm not sure why clearing the script breaks dropping into the workspace
			// For now will resort to the horrible hack of refreshing the page
			location.reload();
		}
	}
	Event.on('.clear_scripts', 'click', null, wb.clearScripts);
	Event.on('.edit-script', 'click', null, function(event){
		wb.historySwitchState('editor');
	});

	Event.on('.content', 'click', '.load-example', function(evt){
		var path = location.href.split('?')[0];
		path += "?example=" + evt.target.dataset.example;
		if (wb.scriptModified){
			if (confirm('Throw out the current script?')){
				wb.scriptModified = false;
				wb.loaded = false;
				history.pushState(null, '', path);
				Event.trigger(document.body, 'wb-state-change');
			}
		}else{
			wb.scriptModified = false;
			wb.loaded = false;
			history.pushState(null, '', path);
			Event.trigger(document.body, 'wb-state-change');
		}
	});

	var handleStateChange = function handleStateChange(evt){
		// hide loading spinner if needed
		console.log('handleStateChange');
		hideLoader();
		wb.queryParams = wb.urlToQueryParams(location.href);
		if (wb.queryParams.view === 'result'){
			document.body.className = 'result';
			wb.view = 'result';
		}else{
			document.body.className = 'editor';
			wb.view = 'editor';
		}
		// handle loading example, gist, currentScript, etc. if needed
	    wb.loadCurrentScripts(wb.queryParams);
	    // If we go to the result and can run the result inline, do it
	    if (wb.view === 'result' && wb.runCurrentScripts){
	    	// console.log('running current scripts');
	    	wb.runCurrentScripts();
	    }else{
	    	if (wb.view === 'result'){
		    	// console.log('we want to run current scripts, but cannot');
		    }else{
		    	// console.log('we do not care about current scripts, so there');
		    }
	    }
	}
	Event.on(document.body, 'wb-state-change', null, handleStateChange);

	var hideLoader = function hideLoader(){
	    var loader = document.querySelector('#block_menu_load');
	    if (loader){
	        loader.parentElement.removeChild(loader);
	    }		
	}


	// Load and Save Section

	wb.historySwitchState = function historySwitchState(state, clearFiles){
		// console.log('historySwitchState(%o, %s)', state, !!clearFiles);
		var params = wb.urlToQueryParams(location.href);
		if (state !== 'result'){
			delete params['view'];
		}else{
			params.view = state;
		}
		if (clearFiles){
			delete params['gist'];
			delete params['example'];
		}
		history.pushState(null, '', wb.queryParamsToUrl(params));
		Event.trigger(document.body, 'wb-state-change');
	}

	window.addEventListener('unload', wb.saveCurrentScripts, false);
	window.addEventListener('load', wb.loadRecentGists, false);

	Event.on('.save_scripts', 'click', null, wb.saveCurrentScriptsToGist);
	Event.on('.download_scripts', 'click', null, wb.createDownloadUrl);
	Event.on('.load_from_gist', 'click', null, wb.loadScriptsFromGistId);
	Event.on('.restore_scripts', 'click', null, wb.loadScriptsFromFilesystem);


	wb.loaded = false;


	// Allow saved scripts to be dropped in
	function createWorkspace(name){
	    // console.log('createWorkspace');
		var id = uuid();
		var workspace = wb.Block({
			group: 'scripts_workspace',
			id: id,
			scriptId: id,
			scopeId: id,
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
		wb.wireUpWorkspace(workspace);
	}
	wb.createWorkspace = createWorkspace;

	wb.wireUpWorkspace = function wireUpWorkspace(workspace){
		workspace.addEventListener('drop', wb.getFiles, false);
		workspace.addEventListener('dragover', function(evt){evt.preventDefault();}, false);
		wb.findAll(document, '.scripts_workspace').forEach(function(ws){
	        ws.parentElement.removeChild(ws); // remove any pre-existing workspaces
	    });
		document.querySelector('.workspace').appendChild(workspace);
		workspace.querySelector('.contained').appendChild(wb.elem('div', {'class': 'dropCursor'}));
		wb.initializeDragHandlers();
	};

	function handleDragover(evt){
	    // Stop Firefox from grabbing the file prematurely
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy';
	}



	Event.on('.workspace', 'click', '.disclosure', function(evt){
		var block = wb.closest(evt.wbTarget, '.block');
		if (block.dataset.closed){
			delete block.dataset.closed;
		}else{
			block.dataset.closed = true;
		}
	});

	Event.on('.workspace', 'dblclick', '.locals .name', wb.changeName);
	Event.on('.workspace', 'keypress', 'input', wb.resize);
	Event.on('.workspace', 'change', 'input, select', function(evt){
		Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'valueChanged'});

	});
	// Event.on(document.body, 'wb-loaded', null, function(evt){
	// 	console.log('menu loaded');
	// });
	Event.on(document.body, 'wb-script-loaded', null, function(evt){
		wb.scriptModified = false;
		wb.scriptLoaded = true;
		if (wb.view === 'result'){
			// console.log('run script because we are awesome');
			if (wb.windowLoaded){
				// console.log('run scripts directly');
				wb.runCurrentScripts();
			}else{
				// console.log('run scripts when the iframe is ready');
				window.addEventListener('load', function(){
				// 	// console.log('in window load, starting script: %s', !!wb.runCurrentScripts);
				 	wb.runCurrentScripts();
				 }, false);
			}
		// }else{
		// 	console.log('do not run script for some odd reason: %s', wb.view);
		}
		// clear undo/redo stack
		console.log('script loaded');
	});

	Event.on(document.body, 'wb-modified', null, function(evt){
		// still need modified events for changing input values
		if (!wb.scriptLoaded) return;
		if (!wb.scriptModified){
			wb.scriptModified = true;
			wb.historySwitchState(wb.view, true);
		}
	});

	window.addEventListener('popstate', function(evt){
		// console.log('popstate event');
		Event.trigger(document.body, 'wb-state-change');
	}, false);

	// Kick off some initialization work
	window.addEventListener('load', function(){
		console.log('window loaded');
		wb.windowLoaded = true;
		Event.trigger(document.body, 'wb-state-change');
	}, false);
})(wb);

/*end workspace.js*/

/*begin blockprefs.js*/
// User block preferences
//
// Allows the user to hide groups of blocks within the interface
// Settings are stored in LocalStorage and retreived each
// time the page is loaded.

(function(wb){

	//save the state of the settings link
	var closed = true;
	var language = wb.language;
	var settings_link;
	//add a link to show the show/hide block link
	function addSettingsLink(callback) {
		// console.log("adding settings link");
		var block_menu = document.querySelector('#block_menu');
		var settings_link = document.createElement('a');
		settings_link.href = '#';
		settings_link.style.float = 'right';
		settings_link.appendChild(document.createTextNode('Show/Hide blocks'));
		settings_link.addEventListener('click', toggleCheckboxDisplay);
		block_menu.appendChild(settings_link);
		return settings_link;
	}

	//create the checkboxes next to the headers
	function createCheckboxes() {
		var block_headers = document.querySelectorAll('.accordion-header');
		[].forEach.call(block_headers, function (el) {
			var checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = '1';
			checkbox.style.float = 'right';
			checkbox.style.display = 'none';
			checkbox.checked = 'true';
			checkbox.addEventListener('click', hideBlocks);
			el.appendChild(checkbox);
		});
	};

	//settings link has been clicked
	function toggleCheckboxDisplay() {
		// console.log('toggle checkboxes called');
		var checkboxes = document.querySelectorAll('.accordion-header input[type="checkbox"]');
		var block_menu = document.querySelector('#block_menu');
		var display;
		block_menu.classList.toggle("settings");
		if (closed) {
			closed = false;
			display = 'inline';
			settings_link.innerHTML = 'Save';
		} else {
			//save was clicked
			closed = true;
			display = 'none'
			settings_link.innerHTML = 'Show/Hide blocks';
			//save the settings
			saveSettings();
		}
		[].forEach.call(checkboxes, function (el) {
			el.style.display = display;
		});
	};

	//checkbox has been clicked
	function hideBlocks(e) {
		var parent = this.parentNode;
		if (this.checked) {
			parent.classList.remove('hidden');
		} else {
			parent.classList.add('hidden');
		}
		//save the settings
		saveSettings();
		e.stopPropagation();
	};

	//save the block preferences to local storage
	function saveSettings(){
		var checkboxes = document.querySelectorAll('.accordion-header input[type="checkbox"]');
		var toSave = {};
		[].forEach.call(checkboxes,	function (el) {
			var id = el.parentNode.id;
			var checked = el.checked;
			toSave[id] = checked;
		});
		// console.log("Saving block preferences", toSave);
		localStorage['__' + language + '_hidden_blocks'] = JSON.stringify(toSave);
	};

	//load block display from local storage
	function loadSettings(){
		var storedData = localStorage['__' + language + '_hidden_blocks'];
		var hiddenBlocks = storedData == undefined ? [] : JSON.parse(storedData);
		window.hbl = hiddenBlocks;
		// console.log("Loading block preferences", hiddenBlocks);
		for (key in hiddenBlocks) {
			if(!hiddenBlocks[key]){
				var h3 = document.getElementById(key);
				if(h3 != null){
					var check = h3.querySelector('input[type="checkbox"]');
					check.checked = false;
					h3.classList.add('hidden');
				}
			}
		}
	};

	//after initliazation, create the settings and checkboxes
	function load(){
		settings_link = addSettingsLink();
		createCheckboxes();
		loadSettings();
	}

	//onload initialize the blockmanager
	window.onload = load;
})(wb);

/*end blockprefs.js*/

/*begin languages/javascript/javascript.js*/
/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */
(function(wb,Event){
    // Add some utilities
    wb.wrap = function(script){
        return [
            '(function(){', 
                // 'try{',
                    'local.canvas = document.createElement("canvas");',
                    'local.canvas.setAttribute("width", global.stage_width);',
                    'local.canvas.setAttribute("height", global.stage_height);',
                    'global.stage.appendChild(local.canvas);',
                    'local.canvas.focus()',
                    'local.ctx = local.canvas.getContext("2d");',
                    'local.ctx.textAlign = "center";',
                    'var main = function(){',
                        script,
                    '}',
                    'global.preloadAssets(' + assetUrls() + ', main);',
                // '}catch(e){',
                    // 'alert(e);',
                // '}',
            '})()'
        ].join('\n');
    }

    function assetUrls(){
        return '[' + wb.findAll(document.body, '.workspace .block-menu .asset').map(function(asset){
            // tricky and a bit hacky, since asset URLs aren't defined on asset blocks
            var source = document.getElementById(asset.dataset.localSource);
            return wb.getSocketValue(wb.getSockets(source)[0]);
        }).join(',') + ']';
    }

    function runCurrentScripts(){
        // console.log('runCurrentScripts');
        if (!wb.scriptLoaded){
            console.log('not ready to run script yet, waiting');
            Event.on(document.body, 'wb-script-loaded', null, wb.runCurrentScripts);
            return;
        }else{
            console.log('ready to run script, let us proceed to the running of said script');
        }
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        wb.runScript( wb.prettyScript(blocks) );
    }
    wb.runCurrentScripts = runCurrentScripts;

    Event.on('.run-scripts', 'click', null, function(){
        wb.historySwitchState('result');
    });

    if (!wb.iframeReady){
        document.querySelector('.stageframe').addEventListener('load', function(event){
            console.log('iframe ready, waiting: %s', !!wb.iframewaiting);
            if (wb.iframewaiting){
                wb.iframewaiting();
            }
            wb.iframewaiting = null;
        }, false);
    }

    wb.runScript = function(script){
        // console.log('script: %s', script);
        var run = function(){
            wb.script = script;
            var path = location.pathname.slice(0,location.pathname.lastIndexOf('/'));
            var runtimeUrl = location.protocol + '//' + location.host + path + '/dist/javascript_runtime.js';
            // console.log('trying to load library %s', runtimeUrl);
            document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: runtimeUrl, script: wb.wrap(script)}), '*');
            document.querySelector('.stageframe').focus();
        };
        if (wb.iframeReady){
            run();
        }else{
            wb.iframewaiting = run;
        }
    }

    function clearStage(event){
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
    }
    Event.on('.clear-stage', 'click', null, clearStage);
    Event.on('.edit-script', 'click', null, clearStage);



    wb.prettyScript = function(elements){
        return js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
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
        blocktypes: ['step', 'expression', 'context', 'eventhandler', 'asset'],
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

})(wb, Event);


/*end languages/javascript/javascript.js*/

/*begin languages/javascript/asset.js*/

/*end languages/javascript/asset.js*/

/*begin languages/javascript/control.js*/

/*end languages/javascript/control.js*/

/*begin languages/javascript/sprite.js*/
/*
 *    Sprite Plugin
 *
 *    Support for building games using Waterbear
 *
 */


wb.choiceLists.types.push('sprite');
wb.choiceLists.rettypes.push('sprite');


/*end languages/javascript/sprite.js*/

/*begin languages/javascript/voice.js*/
/*
 *    Music Plugin
 *
 *    Support for playing music/sounds using Waterbear
 *
 */

// Based on an 88-key piano
wb.choiceLists.notes = [
	// Octave 0
	'A0','A♯0/B♭0','B0',
	// Octave 1
	'C1','C♯1/D♭1','D1','D♯1/E♭1','E1',
	'F1','F♯1/G♭1','G1','G♯1/A♭1','A1','A♯1/B♭1','B1',
	// Octave 2
	'C2','C♯2/D♭2','D2','D♯2/E♭2','E2',
	'F2','F♯2/G♭2','G2','G♯2/A♭2','A2','A♯2/B♭2','B2',
	// Octave 3
	'C3','C♯3/D♭3','D3','D♯3/E♭3','E3',
	'F3','F♯3/G♭3','G3','G♯3/A♭3','A3','A♯3/B♭3','B3',
	// Octave 4
	'C4 (Middle C)','C♯4/D♭4','D4','D♯4/E♭4','E4',
	'F4','F♯4/G♭4','G4','G♯4/A♭4','A4','A♯4/B♭4','B4',
	// Octave 5
	'C5','C♯5/D♭5','D5','D♯5/E♭5','E5',
	'F5','F♯5/G♭5','G5','G♯5/A♭5','A5','A♯5/B♭5','B5',
	// Octave 6
	'C6','C♯6/D♭6','D6','D♯6/E♭6','E6',
	'F6','F♯6/G♭6','G6','G♯6/A♭6','A6','A♯6/B♭6','B6',
	// Octave 7
	'C7','C♯7/D♭7','D7','D♯7/E♭7','E7',
	'F7','F♯7/G♭7','G7','G♯7/A♭7','A7','A♯7/B♭7','B7',
	// Octave 8
	'C8'
];
wb.choiceLists.durations = [
	'double whole note', 'whole note', 'half note', 'quarter note', 'eighth note',
	'sixteenth note', 'thirty-second note', 'sixty-fourth note'
];
wb.choiceLists.types.push('voice');
wb.choiceLists.rettypes.push('voice');


/*end languages/javascript/voice.js*/

/*begin languages/javascript/sound.js*/
wb.choiceLists.types.push('sound');
wb.choiceLists.rettypes.push('sound');
/*end languages/javascript/sound.js*/

/*begin languages/javascript/array.js*/

/*end languages/javascript/array.js*/

/*begin languages/javascript/boolean.js*/

/*end languages/javascript/boolean.js*/

/*begin languages/javascript/canvas.js*/
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



/*end languages/javascript/canvas.js*/

/*begin languages/javascript/color.js*/

/*end languages/javascript/color.js*/

/*begin languages/javascript/image.js*/

/*end languages/javascript/image.js*/

/*begin languages/javascript/math.js*/

/*end languages/javascript/math.js*/

/*begin languages/javascript/vector.js*/
/*
 *    Vector Plugin
 *
 *    Support for vector math in Waterbear
 *
 */


wb.choiceLists.types.push('vector');
wb.choiceLists.rettypes.push('vector');


/*end languages/javascript/vector.js*/

/*begin languages/javascript/object.js*/

/*end languages/javascript/object.js*/

/*begin languages/javascript/string.js*/

/*end languages/javascript/string.js*/

/*begin languages/javascript/path.js*/

/*end languages/javascript/path.js*/

/*begin languages/javascript/point.js*/

/*end languages/javascript/point.js*/

/*begin languages/javascript/rect.js*/

/*end languages/javascript/rect.js*/

/*begin languages/javascript/sensing.js*/

/*end languages/javascript/sensing.js*/

/*begin languages/javascript/motion.js*/
// set up choices
wb.choiceLists.directions = ["upright", "downright", "downleft", "upleft", "up", "down", "right", "left"];
wb.choiceLists.types.push('motion');
wb.choiceLists.rettypes.push('motion');
/*end languages/javascript/motion.js*/

/*begin languages/javascript/shape.js*/

/*end languages/javascript/shape.js*/

/*begin languages/javascript/geolocation.js*/

/*end languages/javascript/geolocation.js*/

/*begin languages/javascript/size.js*/

/*end languages/javascript/size.js*/

/*begin languages/javascript/text.js*/

/*end languages/javascript/text.js*/

/*begin languages/javascript/matrix.js*/

/*end languages/javascript/matrix.js*/

/*begin languages/javascript/control.json*/
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
            "script": "document.addEventListener('keydown', function(event){ if (global.keyForEvent(event) === {{1}}){[[1]];}});",
            "help": "this trigger will run the attached blocks every time this key is pressed",
            "sockets": [
                {
                    "name": "when",
                    "type": "choice",
                    "options": "keys",
                    "value": "choice"
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
            "script": "(function(){local.count##=0;requestAnimationFrame(function eachFrame(){local.count##++;[[1]];requestAnimationFrame(eachFrame);})})();",
            "help": "this trigger will run the attached blocks periodically",
            "sockets": [
                {
                    "name": "each frame"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "47AA31E2-5A90-4AF1-8F98-5FDD437561B6",
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
            "script": "(function(){local.count##=0;local.timerid##=setInterval(function(){local.count##++;if({{2}}){clearInterval(local.timerid##);return;}[[1]]},1000/{{1}});})();",
            "help": "this trigger will run the attached blocks periodically",
            "sockets": [
                {
                    "name": "repeat",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "times a second until",
                    "type": "boolean",
                    "value": "true"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "079b2b89-41c2-4d00-8e21-bcb86574bf80",
            "script": "local.variable## = {{1}};",
            "locals": [
                {
                    "blocktype": "expression",
                    "script": "local.variable##",
                    "type": "any",
                    "sockets": [
                        {
                            "name": "variable##"
                        }
                    ]
                }
            ],
            "help": "create a reference to re-use the any",
            "sockets": [
                {
                    "name": "variable variable##",
                    "type": "any",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b4036693-8645-4852-a4de-9e96565f9aec",
            "script": "{{1}} = {{2}};",
            "help": "first argument must be a variable",
            "sockets": [
                {
                    "name": "set variable",
                    "type": "any",
                    "value": null
                },
                {
                    "name": "to",
                    "type": "any",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "9AED48C9-A90B-49FB-9C1A-FD632F0388F5",
            "script": "{{1}} += {{2}};",
            "help": "first argument must be a variable",
            "sockets": [
                {
                    "name": "increment variable",
                    "type": "any",
                    "value": null
                },
                {
                    "name": "by",
                    "type": "any",
                    "value": 1
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
                    "name": "schedule in",
                    "type": "number",
                    "value": "1"
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
                    "value": "10"
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
                    "value": "ack"
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
                    "value": "ping"
                },
                {
                    "name": "message with data",
                    "type": "any",
                    "value": null
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
                    "value": "ack"
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
                    "value": "ping"
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
                    "value": "false"
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
                    "value": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "6dddaf61-caf0-4976-a3f1-9d9c3bbbf5a4",
            "script": "if( ! {{1}} ){ [[1]] }",
            "help": "run the  blocks if the condition is not true",
            "sockets": [
                {
                    "name": "if not",
                    "type": "boolean",
                    "value": null
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
                    "value": null
                }
            ]
        }
    ]
}
);
/*end languages/javascript/control.json*/

/*begin languages/javascript/sprite.json*/
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
                    "block": "13236aef-cccd-42b3-a041-e26528174323"
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
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "eb889480-c381-4cfa-a6ee-7c6928c08817",
            "script": "local.sprite## = createRectSprite({{1}}, {{2}}, {{3}});",
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
                    "block": "d8e71067-afc2-46be-8bb5-3527b36474d7"
                },
                {
                    "name": "big at",
                    "type": "point",
                    "block": "29803c49-5bd5-4473-bff7-b3cf66ab9711"
                },
                {
                    "name": "with color",
                    "type": "color",
                    "block": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f"
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
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "468e4180-2221-11e3-8224-0800200c9a66",
            "script": "{{1}}.setFacingDirectionBy({{2}});",
            "help": "Rotate the sprites facing direction absolutely",
            "sockets": [
                {
                    "name": "Turn sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "by",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "69998440-22f4-11e3-8224-0800200c9a66",
            "script": "{{1}}.setFacingDirection({{2}});",
            "help": "Rotate the sprites facing direction",
            "sockets": [
                {
                    "name": "Turn sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "to",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "71c09d20-22f4-11e3-8224-0800200c9a66",
            "script": "{{1}}.setMovementDirectionBy({{2}});",
            "help": "Rotate the sprites movement direction",
            "sockets": [
                {
                    "name": "Steer sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "by",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "7ecb947f-28ac-4418-bc44-cd797be697c9",
            "script": "{{1}}.setMovementDirection({{2}});",
            "help": "Rotate the sprites movement direction",
            "sockets": [
                {
                    "name": "Steer sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "to",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "7381ea40-22f6-11e3-8224-0800200c9a66",
            "script": "{{1}}.autosteer = ({{2}});",
            "help": "Set the sprite to sync facing and movement directions",
            "sockets": [
                {
                    "name": "Autosteer sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "",
                    "type": "boolean",
                    "value": 0
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
                    "value": null
                },
                {
                    "name": "collides with sprite",
                    "type": "sprite",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "aaa2f728-cae3-4368-b241-e80f94c360d3",
            "script": "{{1}}.bounceOff({{2}});",
            "help": "Bounce the sprite off of the passed in sprite",
            "sockets": [
                {
                    "name": "bounce sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "off of sprite",
                    "type": "sprite",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "d1521a30-c7bd-4f42-b21d-6330a2a73631",
            "script": "{{1}}.moveRelative({{2}},{{3}});",
            "help": "move a sprite relatively",
            "sockets": [
                {
                    "name": "move",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "by x",
                    "type": "number",
                    "value": null
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "372de8c1-5f72-49cb-a2bd-faf66c36e318",
            "help": "move a sprite by its own speed and direction",
            "script": "{{1}}.move();",
            "sockets": [
                {
                    "name": "move",
                    "type": "sprite",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "4d7d6b10-222b-11e3-8224-0800200c9a66",
            "help": "set the speed of a sprite",
            "script": "{{1}}.setSpeed({{2}});",
            "sockets": [
                {
                    "name": "set sprite",
                    "type": "sprite"
                },
                {
                    "name": "speed",
                    "type": "number",
                    "value": 3
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "30d3103b-6657-4233-bd57-47bd5050704b",
            "help": "set the movement vector of a sprite (speed and steer)",
            "script": "{{1}}.movementDirection = {{2}};",
            "sockets": [
                {
                    "name": "set sprite",
                    "type": "sprite"
                },
                {
                    "name": "movement vector",
                    "type": "vector"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "a110b9d4-34bc-4d3f-a7b1-dbc7885eb977",
            "help": "bounce in the x and/or y direction if the stage is exceeded",
            "script": "{{1}}.stageBounce(global.stage_width, global.stage_height);",
            "sockets": [
                {
                    "name": "bounce",
                    "type": "sprite"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "039a62e2-fbde-4fd0-9fa6-1e5383434698",
            "help": "if the sprite moves to the edge of the screen, stop it at the edge",
            "script": "{{1}}.edgeStop(global.stage_width, global.stage_height);",
            "sockets": [
                {
                    "name": "stop sprite ",
                    "type": "sprite"
                },
                {
                    "name": "at edge of stage"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "a4caaf13-514a-499a-a406-f88bfc9ddccd",
            "help": "if the sprite moves to the edge of the screen, slide it along the edge",
            "script": "{{1}}.edgeSlide(global.stage_width, global.stage_height);",
            "sockets": [
                {
                    "name": "slide sprite ",
                    "type": "sprite"
                },
                {
                    "name": "at edge of stage"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "45f73aca-bf93-4249-9da4-1c089d6c8537",
            "help": "if the sprite moves to the edge of the screen, wrap it around to the other side",
            "script": "{{1}}.edgeWrap(global.stage_width, global.stage_height);",
            "sockets": [
                {
                    "name": "wrap sprite ",
                    "type": "sprite"
                },
                {
                    "name": "around edge of stage"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "88c75c2b-18f1-4195-92bc-a90d99743551",
            "script": "{{1}}.moveAbsolute({{2}}.x, {{2}}.y);",
            "help": "move a sprite absolutely",
            "sockets": [
                {
                    "name": "move",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "to",
                    "type": "point",
                    "value": null
                }
            ]
        },
    {
            "blocktype": "step",
            "id": "badee0b6-8f7c-4cbd-9173-f450c765045d",
            "script": "{{1}}.color = {{2}};",
            "help": "Recolor a sprite",
            "sockets": [
                {
                    "name": "Color sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "to color",
                    "type": "color",
                    "block": "13236aef-cccd-42b3-a041-e26528174323"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "36DD3165-1168-4345-9198-E9B230FF84A3",
            "script": "{{1}}.facingDirection",
            "type": "vector",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "facing direction"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "495336f3-68ed-4bc7-a145-11756803876b",
            "script": "{{1}}.movementDirection",
            "type": "vector",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "movement direction"
                }
            ]
        },
         {
            "blocktype": "expression",
            "id": "86aa39be-5419-4abb-9765-e63f824608f0",
            "script": "{{1}}.polygon.average",
            "type": "point",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "center"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "DF9E52B5-CE65-477A-BE10-95DF88C53FD0",
            "script": "{{1}}.speed",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "speed"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8D0880EA-1722-435A-989D-06E8A9B62FB0",
            "script": "{{1}}.movementDirection.x",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "horizontal speed"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "21A7A835-9647-4DC2-80AE-AE9B06346706",
            "script": "{{1}}.movementDirection.y",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "vertical speed"
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
                    "value": null
                },
                {
                    "name": "left"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "23b4ffd1-3812-4372-8873-8a1b3107bdac",
            "script": "({{1}}.x + {{1}}.w)",
            "help": "get x+w (right) position of sprite",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "top"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8c73e3fd-7c53-4c92-be1d-286db5357cbb",
            "script": "({{1}}.y + {{1}}.h)",
            "type": "number",
            "sockets": [
                {
                    "name": "sprite",
                    "type": "sprite",
                    "value": null
                },
                {
                    "name": "bottom"
                }
            ]
        }
    ]
});
/*end languages/javascript/sprite.json*/

/*begin languages/javascript/voice.json*/
wb.menu({
    "name": "Music",
    "blocks": [
        {
            "blocktype": "step",
            "id": "ac1d8b1a-013c-46e0-b5e7-f241c594a7c7",
            "script": "local.voice## = new Voice();",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "voice##"
                        }
                    ],
                    "script": "local.voice##",
                    "type": "voice"
                }
            ],
            "help": "create a simple voice to play tones",
            "sockets": [
                {
                    "name": "voice##"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "ee91b7ec-d52b-45ff-bd13-ff8a8e5e50fb",
            "help": "set the frequency of the voice",
            "script": "(function(voice, freq){voice.frequency = freq; voice.updateTone();})({{1}}, {{2}});",
            "sockets": [
                {
                    "name": "set voice",
                    "type": "voice"
                },
                {
                    "name": "tone",
                    "type": "number",
                    "value": 440
                },
                {
                    "name": "Hz"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "60984C26-0854-4075-994B-9573B3F48E95",
            "help": "set the note of the voice",
            "script": "(function(voice, note){voice.setNote(note); voice.updateTone();})({{1}}, {{2}});",
            "sockets": [
                {
                    "name": "set voice",
                    "type": "voice"
                },
                {
                    "name": "note",
                    "type": "choice",
                    "options": "notes",
                    "value": "A4"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "a133f0ad-27e6-444c-898a-66410c447a07",
            "help": "set the volume of the voice",
            "script": "(function(voice, vol){voice.volume = vol; voice.updateTone();})({{1}}, {{2}});",
            "sockets": [
                {
                    "name": "set voice",
                    "type": "voice"
                },
                {
                    "name": "volume",
                    "type": "number",
                    "value": 1
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "A64A4BC7-4E93-47B4-910B-F185BC42E366",
            "help": "set the tempo of the voice, for determining the length of a quarter note",
            "script": "(function(voice, tempo){voice.tempo = tempo; voice.updateTone();})({{1}}, {{2}});",
            "sockets": [
                {
                    "name": "set voice",
                    "type": "voice"
                },
                {
                    "name": "tempo quarter note =",
                    "type": "number",
                    "value": 120
                },
                {
                	"name": "beats per minute"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "c1ce82b2-9810-41e0-b96e-44702982372b",
            "script": "{{1}}.frequency",
            "help": "get frequency of a voice",
            "type": "number",
            "sockets": [
                {
                    "name": "voice",
                    "type": "voice",
                    "value": null
                },
                {
                    "name": "Hz"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "e4a4949f-1010-4026-a070-2555dbf3be0e",
            "script": "{{1}}.startOsc();",
            "help": "turn the voice on",
            "sockets": [
                {
                    "name": "turn voice",
                    "type": "voice"
                },
                {
                    "name": "on"
                }
            ]
        },
                {
            "blocktype": "step",
            "id": "c471bc07-fe25-4c6d-a5ef-4ee7f3076561",
            "script": "{{1}}.stopOsc();",
            "help": "turn the voice off",
            "sockets": [
                {
                    "name": "turn voice",
                    "type": "voice"
                },
                {
                    "name": "off"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "2003f5ae-0bef-4517-aad4-7baf4457a823",
            "script": "(function(voice, sec){voice.startOsc();setTimeout(function() {voice.stopOsc();}, 1000 * sec);})({{1}},{{2}});",
            "help": "play the voice for a number of seconds",
            "sockets": [
                {
                    "name": "play voice",
                    "type": "voice"
                },
                {
                    "name": "for ",
                    "type": "number",
                    "value": 2
                },
                {
                    "name": "seconds"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "1F98BD7B-8E13-4334-854B-6B9C1B31C99D",
            "script": "(function(voice, note, len, dots){voice.push(note,len,dots);})({{1}},{{2}},{{3}},{{4}});",
            "help": "schedule a note to be played as part of a song",
            "sockets": [
                {
                    "name": "schedule voice",
                    "type": "voice"
                },
                {
                    "name": "to play note",
                    "type": "choice",
                    "options": "notes",
                    "value": "A4"
                },
                {
                    "name": "as ",
                    "type": "choice",
                    "options": "durations",
                    "value": "quarter note"
                },
                {
                    "name": "dotted",
                    "type": "number",
                    "value": 0
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "24875971-7CB4-46A6-8A53-D966424A3E70",
            "script": "(function(voice, note, len, dots){voice.push(note,len,dots);})({{1}},'none',{{2}},{{3}});",
            "help": "schedule a note to be played as part of a song",
            "sockets": [
                {
                    "name": "schedule voice",
                    "type": "voice"
                },
                {
                    "name": "to rest for a ",
                    "type": "choice",
                    "options": "durations",
                    "value": "quarter note"
                },
                {
                    "name": "dotted",
                    "type": "number",
                    "value": 0
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "34788069-BF4F-46DB-88DC-FC437F484A80",
            "script": "(function(voice){voice.play();})({{1}});",
            "help": "play the scheduled song",
            "sockets": [
                {
                    "name": "play voice",
                    "type": "voice"
                },
                {
                    "name": "stored song"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "112ffdd3-7832-43df-85a5-85587e951295",
            "script": "{{1}}.on",
            "help": "get whether the voice is turned on or off",
            "type": "boolean",
            "sockets": [
                {
                    "name": "voice",
                    "type": "voice",
                    "value": null
                },
                {
                    "name": "is on?"
                }
            ]
        }
    ]
});
/*end languages/javascript/voice.json*/

/*begin languages/javascript/sound.json*/
wb.menu({
    "name": "Sound",
    "blocks": [
        {
            "blocktype": "step",
            "id": "59f338b4-0f2f-489a-b4bd-b458fcb48e37",
            "script": "global.preloadAudio('##', {{1}});",
            "sockets": [
                {
                    "name": "load audio## from url",
                    "type": "string",
                    "value": null
                }
            ],
            "locals": [
                {
                    "blocktype": "asset",
                    "sockets": [
                        {
                            "name": "audio ##"
                        }
                    ],
                    "script": "global.audio[\"##\"]",
                    "type": "sound"
                }
            ],
            "help": "Load a sound for playback"
        },
        {
        	"blocktype": "step",
        	"id": "4deb2817-6dfc-44e9-a885-7f4b350cc81f",
        	"script": "{{1}}.currentTime=0;{{1}}.play();",
        	"sockets": [
        		{
        			"name": "play sound",
        			"type": "sound"
        		}
        	],
        	"help": "play a sound"
        },
        {
        	"blocktype": "step",
        	"id": "eb715a54-c1f2-4677-819a-9427537bad72",
        	"script": "{{1}}.pause();",
        	"sockets": [
        		{
        			"name": "pause sound",
        			"type": "sound"
        		}
        	]
        },
        {
        	"blocktype": "step",
        	"id": "79f14360-3a3b-48de-83ae-240977cf343b",
        	"script": "{{1}}.loop={{2}};",
        	"sockets": [
        		{
        			"name": "set sound",
        			"type": "sound"
        		},
        		{
        			"name": "looping to",
        			"type": "boolean"
        		}

        	]
        }
    ]
}
);
/*end languages/javascript/sound.json*/

/*begin languages/javascript/array.json*/
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "item",
                    "type": "number",
                    "value": "0"
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
                    "value": null
                },
                {
                    "name": "join with",
                    "type": "string",
                    "value": ", "
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "3fab2b88-430a-401e-88b2-2703d614780a",
            "script": "{{1}}.push({{2}});",
            "help": "add any object to the end of an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "value": null
                },
                {
                    "name": "append",
                    "type": "any",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "77edf0e9-e5df-4294-81ef-bfa363cda3ee",
            "script": "{{1}}.unshift({{2}});",
            "help": "add any object to the beginning of an array",
            "sockets": [
                {
                    "name": "array",
                    "type": "array",
                    "value": null
                },
                {
                    "name": "prepend",
                    "type": "any",
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "remove item",
                    "type": "number",
                    "value": "0"
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "concat",
                    "type": "array",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "for each"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/array.json*/

/*begin languages/javascript/boolean.json*/
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
                    "value": null
                },
                {
                    "name": "and",
                    "type": "boolean",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "or",
                    "type": "boolean",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "xor",
                    "type": "boolean",
                    "value": null
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
                    "value": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "de9f5ebd-2408-4c72-9705-786b1eec2b14",
            "type": "boolean",
            "script": "!({{1}}%2)",
            "help": "true when the parameter is even",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": 2
                },
                {
                    "name": "is even"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "0ac50ac9-2af6-4073-83cf-4f79b4bde163",
            "type": "boolean",
            "script": "!!({{1}}%2)",
            "help": "true when the parameter is odd",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": 1
                },
                {
                    "name": "is odd"
                }
            ]
        }

    ]
}
);
/*end languages/javascript/boolean.json*/

/*begin languages/javascript/canvas.json*/
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
                    "value": "1.0"
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
                    "value": "choice"
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
                    "value": "1.0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "1.0"
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
                    "value": "0"
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
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
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
                    "value": "1"
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
                    "value": "choice"
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
                    "value": "choice"
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
                    "value": "10"
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
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "278b0b41-895c-4786-9c09-d745ae5501af",
            "script": "local.ctx.shadowBlur = {{1}};",
            "help": "set the shadow blur radius",
            "sockets": [
                {
                    "name": "shadow blur",
                    "type": "number",
                    "value": "0"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/canvas.json*/

/*begin languages/javascript/color.json*/
wb.menu({
    "name": "Color",
    "blocks": [
        {
            "blocktype": "step",
            "id": "01e39af1-679d-4b4d-b30e-a093a2687063",
            "script": "local.ctx.shadowColor = {{1}};",
            "help": "set the shadow color",
            "sockets": [
                {
                    "name": "shadow color",
                    "type": "color",
                    "value": null
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
                    "value": "#000"
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
                    "value": "#000"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "271c8b4c-b045-4ff9-8ad5-9608ea204b09",
            "script": "\"rgb(\" + {{1}} + \",\" + {{2}} + \",\" + {{3}} + \")\"",
            "type": "color",
            "help": "returns a color",
            "sockets": [
                {
                    "name": "color with red",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "green",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "blue",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "13236aef-cccd-42b3-a041-e26528174323",
            "script": "\"rgba(\" + {{1}} + \",\" + {{2}} + \",\" + {{3}} + \",\" + {{4}} + \")\"",
            "type": "color",
            "help": "returns a semi-opaque color",
            "sockets": [
                {
                    "name": "color with red",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "green",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "blue",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "alpha",
                    "type": "number",
                    "value": "0.1"
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
                    "value": "0"
                },
                {
                    "name": "saturation",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "brightness",
                    "type": "number",
                    "value": "0]"
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "radius1",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "to point2",
                    "type": "point",
                    "value": null
                },
                {
                    "name": "radius2",
                    "type": "number",
                    "value": "0"
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
                    "value": null
                },
                {
                    "name": "to point2",
                    "type": "point",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "at offset",
                    "type": "number",
                    "value": "0.5"
                },
                {
                    "name": "with color",
                    "type": "color",
                    "value": "#F00"
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
                    "value": null
                },
                {
                    "name": "repeats",
                    "type": "choice",
                    "options": "repetition",
                    "value": "choice"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/color.json*/

/*begin languages/javascript/image.json*/
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
                    "value": null
                },
                {
                    "name": "at point",
                    "type": "point",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "in rect",
                    "type": "rect",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "from image",
                    "type": "image",
                    "value": null
                },
                {
                    "name": "to rect",
                    "type": "rect",
                    "value": null
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
                    "name": "create ImageData ImageData## with size",
                    "type": "size",
                    "value": null
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
                    "name": "create ImageData ImageData## from imageData",
                    "type": "imageData",
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "at point",
                    "type": "point",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "from imageData",
                    "type": "imagedata",
                    "value": null
                },
                {
                    "name": "at point",
                    "type": "point",
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "as array"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "7fa79655-4c85-45b3-be9e-a19aa038feae",
            "script": "global.preloadImage('##', {{1}});",
            "sockets": [
                {
                    "name": "create ImageData image## from url",
                    "type": "string",
                    "value": null
                }
            ],
            "locals": [
                {
                    "blocktype": "asset",
                    "sockets": [
                        {
                            "name": "image ##"
                        }
                    ],
                    "script": "global.images[\"##\"]",
                    "type": "image"
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "url"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/image.json*/

/*begin languages/javascript/math.json*/
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
                    "value": "0"
                },
                {
                    "name": "+",
                    "type": "number",
                    "value": "0"
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
                    "value": "0"
                },
                {
                    "name": "-",
                    "type": "number",
                    "value": "0"
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
                    "value": "0"
                },
                {
                    "name": "*",
                    "type": "number",
                    "value": "0"
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
                    "value": "0"
                },
                {
                    "name": "/",
                    "type": "number",
                    "value": "0"
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
                    "value": "0"
                },
                {
                    "name": "=",
                    "type": "number",
                    "value": "0"
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
                    "value": "0"
                },
                {
                    "name": "<",
                    "type": "number",
                    "value": "0"
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
                    "value": "0"
                },
                {
                    "name": ">",
                    "type": "number",
                    "value": "0"
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
                    "value": "1"
                },
                {
                    "name": "to",
                    "type": "number",
                    "value": "10"
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
                    "value": "0"
                },
                {
                    "name": "mod",
                    "type": "number",
                    "value": "0"
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
                    "value": "0"
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
                    "value": "10"
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
                    "value": "10"
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
                    "value": "10"
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
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "46bcac2d-eb76-417c-81af-cb894a54a86c",
            "type": "number",
            "script": "Math.floor({{1}})",
            "help": "rounds down to nearest whole number",
            "sockets": [
                {
                    "name": "floor of",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "4945df27-f4f3-490b-94ae-67c7081f744b",
            "type": "number",
            "script": "Math.ceil({{1}})",
            "help": "rounds up to nearest whole number",
            "sockets": [
                {
                    "name": "ceiling of",
                    "type": "number",
                    "value": "10"
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
                    "value": "10"
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
                    "value": "10"
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
                    "value": "10"
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
                    "value": "10"
                },
                {
                    "name": "to the power of",
                    "type": "number",
                    "value": "2"
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
                    "value": "10"
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
}
);
/*end languages/javascript/math.json*/

/*begin languages/javascript/vector.json*/
wb.menu({
    "name": "Vectors",
    "blocks": [
        {
            "blocktype": "step",
            "id": "874f1097-2aa2-4056-8a8f-de88f73f39e2",
            "script": "local.vector## = new SAT.Vector({{1}}, {{2}});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "vector##"
                        }
                    ],
                    "script": "local.vector##",
                    "type": "vector"
                }
            ],
            "help": "create a vector",
            "sockets": [
                {
                    "name": "vector##",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "x, ",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "y"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "61d265c9-7314-45c9-89cd-16e5ae26b258",
            "script": "{{1}}.add({{2}});",
            "help": "Add a second vector to this vector",
            "sockets": [
                {
                    "name": "Vector",
                    "type": "vector"
                },
                {
                    "name": "add vector",
                    "type": "vector"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "e82c5f05-ba59-4267-b817-f1e44b4d31c4",
            "script": "{{1}}.sub({{2}});",
            "help": "Subtract a second vector from this vector",
            "sockets": [
                {
                    "name": "Vector",
                    "type": "vector"
                },
                {
                    "name": "subtract vector",
                    "type": "vector"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "c6edb126-6306-44e4-a5f9-44728ae1cbb4",
            "script": "{{1}}.dot({{2}})",
            "type": "number",
            "help": "Get the dot product of two vectors",
            "sockets": [
                {
                    "name": "Dot product of vector",
                    "type": "vector"
                },
                {
                    "name": "and vector",
                    "type": "vector"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "d6204ed1-3b28-41af-8574-fac393df75f1",
            "script": "{{1}}.reverse();",
            "help": "Reverse the vector",
            "sockets": [
                {
                    "name": "Reverse vector",
                    "type": "vector"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "D7374103-3C03-40E8-A215-45BEFF97F0BC",
            "script": "{{1}}.normalize();",
            "help": "Normalize the vector",
            "sockets": [
                {
                    "name": "Normalize vector",
                    "type": "vector"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "612C4569-9715-48E6-ADA0-C978386D9922",
            "script": "{{1}}.scale({{2}},{{3}});",
            "help": "Scale the vector by the x and y",
            "sockets": [
                {
                    "name": "Scale vector",
                    "type": "vector"
                },
                {
                    "name": "by x",
                    "type": "number",
                    "value": 1
                },
                {
                    "name": "and y",
                    "type": "number",
                    "value": 1
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "f7937709-f449-4480-927d-3bcfe33d2f65",
            "script": "{{2}}.project({{1}});",
            "help": "Project the first vector onto the second",
            "sockets": [
                {
                    "name": "Vector",
                    "type": "vector"
                },
                {
                    "name": "project onto vector",
                    "type": "vector"
                }
            ]
        }
    ]
});
/*end languages/javascript/vector.json*/

/*begin languages/javascript/object.json*/
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
                    "type": "any",
                    "value": null
                },
                {
                    "name": "key",
                    "type": "string",
                    "value": null
                },
                {
                    "name": "= value",
                    "type": "any",
                    "value": null
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
                    "type": "any",
                    "value": null
                },
                {
                    "name": "value at key",
                    "type": "string",
                    "value": null
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
                    "type": "any",
                    "value": null
                },
                {
                    "name": "do"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/object.json*/

/*begin languages/javascript/string.json*/
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
                    "value": null
                },
                {
                    "name": "split on",
                    "type": "string",
                    "value": null
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
                    "value": "hello"
                },
                {
                    "name": "with",
                    "type": "string",
                    "value": "world"
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
                    "value": null
                },
                {
                    "name": "character at",
                    "type": "number",
                    "value": "0"
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "indexOf",
                    "type": "string",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "replace",
                    "type": "string",
                    "value": null
                },
                {
                    "name": "with",
                    "type": "string",
                    "value": null
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
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "48bb8639-0092-4384-b5a0-3a772699dea9",
            "script": "/* {{1}}; */",
            "help": "this is a comment and will not be run by the program",
            "sockets": [
                {
                    "name": "comment",
                    "type": "any",
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "arguments",
                    "type": "array",
                    "value": null
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
}
);
/*end languages/javascript/string.json*/

/*begin languages/javascript/path.json*/
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "with control point",
                    "type": "point",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "with control points",
                    "type": "point",
                    "value": null
                },
                {
                    "name": "and",
                    "type": "point",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "point1",
                    "type": "point",
                    "value": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "value": "1.0"
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
                    "value": null
                },
                {
                    "name": "radius",
                    "type": "number",
                    "value": "1"
                },
                {
                    "name": "start angle",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "deg, end angle",
                    "type": "number",
                    "value": "45"
                },
                {
                    "name": "deg",
                    "type": "boolean",
                    "value": "true"
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "value": "10"
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
                    "value": null
                },
                {
                    "name": "in path?"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/path.json*/

/*begin languages/javascript/point.json*/
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
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "as array"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/point.json*/

/*begin languages/javascript/rect.json*/
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
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "with width",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "height",
                    "type": "number",
                    "value": "10"
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
                    "value": null
                },
                {
                    "name": "with size",
                    "type": "size",
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "height"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/rect.json*/

/*begin languages/javascript/sensing.json*/
wb.menu({
    "name": "Sensing",
    "blocks": [
        {
            "blocktype": "step",
            "id": "916c79df-40f1-4280-a093-6d9dfe54d87e",
            "script": "prompt({{1}})",
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
                    "name": "ask",
                    "type": "string",
                    "value": "What's your name?"
                },
                {
                    "name": "and wait"
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
                    "value": "choice"
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
/*end languages/javascript/sensing.json*/

/*begin languages/javascript/motion.json*/
wb.menu({
    "name": "Motion",
    "blocks": [
    	{
    		"blocktype": "expression",
    		"id": "f1a792df-9508-4ad5-90f8-aa9cd60d46bc",
    		"type": "string",
    		"script": "global.accelerometer.direction",
    		"help": "which way is the device moving?",
    		"sockets": [
    			{
	    			"name": "tilt direction"
	    		}
    		]
    	},
    	{
    		"blocktype": "eventhandler",
    		"id": "74f8f7c0-f2f9-4ea4-9888-49110785b26d",
    		"script": "global.accelerometer.whenTurned({{1}}, function(){[[1]]});",
    		"help": "handler for accelerometer events",
    		"sockets": [
    			{
    				"name": "when device turned",
    				"type": "choice",
    				"options": "directions"
    			}
    		]
    	}
    ]
}

);
/*end languages/javascript/motion.json*/

/*begin languages/javascript/shape.json*/
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "value": "10"
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
                    "block": "29803c49-5bd5-4473-bff7-b3cf66ab9711"
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "and color",
                    "type": "color",
                    "block": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f"
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
                    "value": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "value": "10"
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
                    "value": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "and color",
                    "type": "color",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "with radius",
                    "type": "number",
                    "value": "10"
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "with color",
                    "type": "color",
                    "value": null
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
                    "value": null
                },
                {
                    "name": "with color",
                    "type": "color",
                    "value": null
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
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "ebe1b968-f117-468d-91cb-1e67c5776030",
            "script": "local.ctx.fillRect({{1}},{{2}},{{3}},{{4}});local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}});",
            "help": "fill and stroke...",
            "sockets": [
                {
                    "name": "fill and stroke rect x",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "width",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "height",
                    "type": "number",
                    "value": "10"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/shape.json*/

/*begin languages/javascript/geolocation.json*/
wb.menu({
    "name": "Geolocation",
    "blocks": [
        {
            "blocktype": "eventhandler",
            "id": "0da815af-6010-48b6-838d-f7dd0999b07d",
            "script": "global.location.watchPosition(function(){[[1]]});",
            "help": "called every time current location is updated",
            "sockets": [
                {
                    "name": "track my location"
                }
            ],
            "locals": [
                {
                    "blocktype": "expression",
                    "type": "location",
                    "script": "global.location.currentLocation",
                    "help": "current location",
                    "sockets": [
                        {
                            "name": "my location"
                        }
                    ]
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "a7b25224-a030-4cf5-8f30-026a379d958b",
            "script": "global.location.whenWithinXOf({{1}},{{2}},function(){[[1]]});",
            "help": "script to call when the distance from a position is less than specified distance",
            "sockets": [
                {
                    "name": "when within",
                    "type": "number",
                    "value": 1
                },
                {
                    "name": "km of",
                    "type": "location"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e3bcf430-979b-4fff-a856-d10071c63708",
            "script": "global.location.distance({{1}},{{2}})",
            "type": "number",
            "help": "return distance in kilometers between two locations",
            "sockets": [
                {
                    "name": "distance between",
                    "type": "location"
                },
                {
                    "name": "and",
                    "type": "location"
                },
                {
                    "name": "in km"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "84583276-c54c-4db0-b703-e0a7bdc81e71",
            "script": "{{1}}.latitude",
            "type": "number",
            "help": "returns the latitude of a location",
            "sockets": [
                {
                    "name": "latitude",
                    "type": "location"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "0afffda9-ef4f-40dc-8ac7-96354417030e",
            "script": "{{1}}.longitude",
            "type": "number",
            "help": "returns the longitude of a location",
            "sockets": [
                {
                    "name": "longitude",
                    "type": "location"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "36d3af40-e1ae-4e72-9d7e-26c64938c6ba",
            "script": "{{1}}.altitude",
            "type": "number",
            "help": "returns the altitude of a location, or null if not available",
            "sockets": [
                {
                    "name": "altitude (m)",
                    "type": "location"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "86c429bf-2d8d-45fc-8869-7d93f3821032",
            "script": "{{1}}.heading",
            "type": "number",
            "help": "returns the heading of a location update, if moving",
            "sockets": [
                {
                    "name": "heading (degrees from north)",
                    "type": "location"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5454a36d-ed35-4c7e-880a-31849d6bbe98",
            "script": "{{1}}.speed",
            "type": "number",
            "help": "returns the speed of a location update, if moving",
            "sockets": [
                {
                    "name": "speed (m/s)",
                    "type": "location"
                }
            ]
        }
    ]
});
/*end languages/javascript/geolocation.json*/

/*begin languages/javascript/size.json*/
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
                    "value": "32"
                },
                {
                    "name": "height",
                    "type": "number",
                    "value": "32"
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
                    "value": null
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
                    "value": null
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
                    "value": null
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
                    "value": null
                },
                {
                    "name": "as array"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/size.json*/

/*begin languages/javascript/text.json*/
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
                    "value": "10"
                },
                {
                    "name": "",
                    "type": "choice",
                    "options": "unit",
                    "value": "choice"
                },
                {
                    "name": "",
                    "type": "string",
                    "value": "sans-serif"
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
                    "value": "choice"
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
                    "value": "choice"
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
                    "value": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
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
                    "value": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "max width",
                    "type": "number",
                    "value": "10"
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
                    "value": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
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
                    "value": null
                },
                {
                    "name": "x",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "max width",
                    "type": "number",
                    "value": "10"
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
                    "value": null
                },
                {
                    "name": "width"
                }
            ]
        }
    ]
}
);
/*end languages/javascript/text.json*/

/*begin languages/javascript/matrix.json*/
wb.menu({
    "name": "Matrix",
    "blocks": [
        {
            "blocktype": "step",
            "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.transform.apply(local.ctx, {{1}});",
            "help": "transform by an arbitrary matrix [a,b,c,d,e,f]",
            "sockets": [
                {
                    "name": "transform by 6-matrix",
                    "type": "array",
                    "value": null
                }
            ],
            "id": "b65e02c5-b990-4ceb-ab18-2593337103d9"
        },
        {
            "blocktype": "step",
            "id": "e4787583-77ce-4d45-a863-50dcb4e87af0",
            "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.setTransform.apply(local.ctx, {{1}});",
            "help": "set transform to an arbitrary array [a,b,c,d,e,f]",
            "sockets": [
                {
                    "name": "set transform to 6-matrix",
                    "type": "array",
                    "value": null
                }
            ]
        }
    ]
});
/*end languages/javascript/matrix.json*/
