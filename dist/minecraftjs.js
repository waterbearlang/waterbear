
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

/*begin events.min.js*/
/*
|------------------------------------------------
| Events.js
|------------------------------------------------
|
| A super-awesome JavaScript event handler library.
|
| @author     James Brumond
| @version    0.2.3-beta
| @copyright  Copyright 2011 James Brumond
| @license    Dual licensed under MIT and GPL
|
*/
var Events=new function(){var a=this,b=[],c="0.2.3-beta",d=function(){var a=document.readyState==="complete";if(!a){function b(){a=!0}window.addEventListener?window.addEventListener("load",b,!1):window.attachEvent&&window.attachEvent("onload",b)}return function(){return a}}(),e={mouseenter:{attachesTo:"mouseover",eventTest:function(a){return!withinElement(a,a.originalTarget(),"fromElement")}},mouseleave:{attachesTo:"mouseout",eventTest:function(a){return!withinElement(a,a.originalTarget(),"toElement")}},hashchange:{bind:function(a,b){f.addEventListener(b)},unbind:function(a,b){f.removeEventListener(b)},invoke:function(a){f.dispatchEvent()}},keystroke:{attachesTo:"keydown",eventTest:function(a){return g.runTest(a,a.getNamespace().split(".")[0])}}},f=new function(){var b=this,c=25,d=[],e=function(){var a=(location+"").match(/^[^#]*(#.+)$/);return a?a[1]:""},f=function(a){a[0]!=="#"&&(a="#"+a),location.hash=a},g=function(){var a=!1;return function(b){typeof b=="boolean"&&(a=b);return a}}(),h=function(b,c){return a.buildEventObject("hashchange",{},merge({oldURL:b,newURL:location+""},c||{}))},i=function(a){var b;for(var c=0,e=d.length;c<e;c++)b=d[c].call(window,a);a.returnValue!=null&&(b=a.returnValue);return b},j=function(){var a=e(),d=location+"",f=!1,h=null;return{start:function(){f||(f=!0,h=window.setInterval(function(){var c=e();c!==a&&(a=c,g()||b.dispatchEvent(d),d=location+"")},c))},stop:function(){f&&(f=!1,window.clearInterval(h))}}}(),k=function(a){var a=a||window.event,b=a._isEmulated||!1;!g()&&!b&&(g(!0),j.stop());return i(a)};b.init=function(){attachListener(window,"hashchange",k),g()||j.start()},b.addEventListener=function(a){d.push(a)},b.removeEventListener=function(a){var b=[];for(var c=0,e=d.length;c<e;c++)d[c]!==a&&b.push(d[c]);d=b},b.dispatchEvent=function(a){return i(h(location+"",a))}},g=function(){var a={type:"keydown",propagate:!1,disable_in_input:!0,target:document,keycode:!1},b={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":":","'":'"',",":"<",".":">","/":"?","\\":"|"},c={esc:27,escape:27,tab:9,space:32,"return":13,enter:13,backspace:8,scrolllock:145,scroll_lock:145,scroll:145,capslock:20,caps_lock:20,caps:20,numlock:144,num_lock:144,num:144,pause:19,"break":19,insert:45,home:36,"delete":46,end:35,pageup:33,page_up:33,pu:33,pagedown:34,page_down:34,pd:34,left:37,up:38,right:39,down:40,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123},d=function(){return{shift:{wanted:!1,pressed:!1},ctrl:{wanted:!1,pressed:!1},alt:{wanted:!1,pressed:!1},meta:{wanted:!1,pressed:!1}}},e=function(a,e,f){var g,h,i,j,k,l;if(f.disable_in_input){i=a.currentTarget;if(i&&i.tagName&&(i.tagName.toLowerCase()==="input"||i.tagName.toLowerCase()==="textarea")&&i!==f.target)return}a.keyCode?k=a.keyCode:a.which&&(k=a.which),j=String.fromCharCode(k).toLowerCase(),k===188&&(j=","),k===190&&(j="."),g=e.split("+"),h=0,l=d(),a.ctrlKey&&(l.ctrl.pressed=!0),a.shiftKey&&(l.shift.pressed=!0),a.altKey&&(l.alt.pressed=!0),a.metaKey&&(l.meta.pressed=!0);for(var m=0;m<g.length;m++){var n=g[m];n==="ctrl"||n==="control"?(h++,l.ctrl.wanted=!0):n==="shift"?(h++,l.shift.wanted=!0):n==="alt"?(h++,l.alt.wanted=!0):n==="meta"?(h++,l.meta.wanted=!0):n.length>1?c[n]===k&&h++:f.keycode?f.keycode===k&&h++:j===n?h++:b[j]&&a.shiftKey&&(j=b[j],j===n&&h++)}return h===g.length&&l.ctrl.pressed===l.ctrl.wanted&&l.shift.pressed===l.shift.wanted&&l.alt.pressed===l.alt.wanted&&l.meta.pressed===l.meta.wanted};return{runTest:function(b,c,d){var d=d||{};for(var f in a)a.hasOwnProperty(f)&&d[f]===undefined&&(d[f]=a[f]);return e(b,c.toLowerCase(),d)},defaults:a}}(),h=function(){var a=function(a){if(typeof this=="undefined"||typeof a=="undefined"||typeof this[a]=="undefined")return!1;return this[a]!==this.constructor.prototype[a]};return function(b){try{b.prototype.hasOwnProperty=a;if(typeof b.hasOwnProperty!="function")throw 0}catch(c){b.hasOwnProperty=a}}}();EventController=function(a,b){var c=this,d=!1,a=a,b=b,e=null;typeof a.hasOwnProperty!="function"&&h(a),c.target=c.srcElement=b;for(var f in a)a.hasOwnProperty(f)&&typeof a[f]!="function"&&(c[f]=a[f]);c.getNamespace=function(){return e},c._setNamespace=function(a){e=a},c.mousePosition=function(){var b=0,c=0;if(a.pageX||a.pageY)b=a.pageX,c=a.pageY;else if(a.clientX||a.clientY)b=a.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,c=a.clientY+document.body.scrollTop+document.documentElement.scrollTop;return{x:b,y:c}},c.eventObject=function(){return a},c.originalTarget=function(){return b},c.stopPropagation=function(){typeof a.stopPropagation=="function"&&a.stopPropagation(),a.cancelBubble=!0},c.cancelDefault=function(){d||(d=!0,typeof a.preventDefault=="function"&&a.preventDefault(),a.returnValue=!1)},c.isDefaultCanceled=function(){return d}},EventFunction=function(a,b){var c=this,b=b;a=a||undefined;if(typeof a!="function")return undefined;c.call=function(b,c){return a.call(b,c)}},EventWrapper=function(a,b){var c=this,a=a||null,b=b||null,d={},f=!1,g=!1,h=function(a){var b=d;for(var c=0,e=a.length;c<e;c++){var f=a[c];typeof b[f]!="object"&&(b[f]={}),b=b[f]}typeof b["."]!="object"&&(b["."]=[]);return b};c.registerFunction=function(a,b){var d=h(b);d["."].push(new EventFunction(a,c))},c.removeNamespace=function(a){if(a&&a.length){var b=a.pop(),c=h(a);c[b]={}}else d={}},c.run=function(c,f){var f=f||new EventController(c,a),g=[],h=b in e&&e[b].eventTest?e[b].eventTest:function(){return!0},i=function(b){var c=null;for(var d in b)if(b.hasOwnProperty(d)){f._setNamespace(g.join("."));if(d==="."){if(h(f))for(var e=0,j=b[d].length;e<j;e++)c=b[d][e].call(a,f),c===!1&&f.cancelDefault()}else g.push(d),c=i(b[d]),g.pop()}return c},j=i(d);return f.isDefaultCanceled()?!1:j};if(b in e){var i=e[b],j=!!i.bind&&!!i.unbind,k=function(a){return c.run(a||window.event)};c.bindEvent=function(){g||(g=!0,j?i.bind(a,k):attachListener(a,i.attachesTo,k))},c.unbindEvent=function(){g&&(g=!1,j?i.unbind(a,k):detachListener(a,i.attachesTo,k))}}else{var k=function(a){return c.run(a||window.event)};c.bindEvent=function(){g||(g=!0,attachListener(a,b,k))},c.unbindEvent=function(){g&&(g=!1,detachListener(a,b,k))}}c.bindEvent()},EventHandler=function(a){var c=this,a=a||null,d={};b.push(c),c.getTarget=function(){return a},c.registerEvent=function(b,c){if(typeof b!="string"||typeof c!="function")return!1;var e=b.split("."),f;b=e.shift(),f=e,startsWithOn.test(b)&&(b=b.substring(2)),d[b]===undefined&&(d[b]=new EventWrapper(a,b)),d[b].registerFunction(c,f)},c.removeEvent=function(a){var a=a||!1,b;if(typeof a!="string")return!1;if(a==="*"){for(var c in d)d.hasOwnProperty(c)&&d[c].removeNamespace(!1);return!0}b=a.split("."),a=b.shift(),d[a].removeNamespace(b)}},startsWithOn=/^on/,startsWithDOM=/^DOM/,attachListener=function(a,b,c){if(a.addEventListener)startsWithOn.test(b)&&(b=b.substring(2)),a.addEventListener(b,c,!1);else if(a.attachEvent)!startsWithDOM.test(b)&&!startsWithOn.test(b)&&(b="on"+b),a.attachEvent(b,c);else throw new YourBrowserFailsError("Could not attach event listener")},detachListener=function(a,b,c){if(a.removeEventListener)startsWithOn.test(b)&&(b=b.substring(2)),a.removeEventListener(b,c,!1);else if(a.detachEvent)!startsWithDOM.test(b)&&!startsWithOn.test(b)&&(b="on"+b),a.detachEvent(b,c);else throw new YourBrowserFailsError("Could not detach event listener")},invokeListener=function(b,c,d){var e;if(b.dispatchEvent)startsWithOn.test(c)&&(c=c.substring(2)),e=a.buildEventObject(b,c,d),b.dispatchEvent(e);else if(b.fireEvent)!startsWithDOM.test(c)&&!startsWithOn.test(c)&&(c="on"+c),e=a.buildEventObject(b,c,d),b.fireEvent(c,e);else throw new YourBrowserFailsError("Could not invoke event listener")},getEventTarget=function(a,b){var c=!1;a.target?c=a.target:a.srcElement&&(c=a.srcElement),!c&&a.srcElement===null&&(c=b||window),c.nodeType==3&&(c=c.parentNode);return c},withinElement=function(a,b,c){var d=a.relatedTarget,e;d==null&&(d=a[c]||null);try{while(d&&d!==b)d=d.parentNode;e=d===b}catch(f){e=!1}return e},getHandlerByTarget=function(a){for(var c=0;c<b.length;c++)if(b[c].getTarget()===a)return b[c];return!1},getEventHandler=function(a){var b=getHandlerByTarget(a);return b?b:new EventHandler(a)},merge=function(){var a=Array.prototype.slice.call(arguments,0),b={};for(var c=0,d=a.length;c<d;c++)for(var e in a[c])a[c].hasOwnProperty(e)&&(b[e]=a[c][e]);return b},contains=function(a,b){for(var c=0,d=b.length;c<d;c++)if(b[c]===a)return!0;return!1},a.version=function(){return c},a.ready=function(){var a=[],b=!1;return function(c){d()?c():(a.push(c),b||Events.bind(window,"load",function(){for(var b=0,c=a.length;b<c;b++)a[b]()}))}}(),a.log=function(){var a=null,b=function(){a==null&&(typeof window.console!="undefined"?typeof window.console.log.apply=="function"?a=function(){window.console.log.apply(window.console,arguments)}:a=function(){window.console.log(arguments)}:typeof console!="undefined"?a=function(){console.log.apply(console,arguments)}:a=function(){});return a};return function(){var a=Array.prototype.slice.call(arguments,0);typeof a[0]=="string"&&(a[0]="["+Date()+"] - "+a[0]),b().apply(this,a)}}(),a.bind=function(a,b,c){var d=getEventHandler(a);return d.registerEvent(b,c)},a.unbind=function(a,b){var c=getEventHandler(a);return c.removeEvent(b)},a.specialEvents={exists:function(a){return e[a]!=null},add:function(a,b){e[a]==null&&(e[a]=b)},edit:function(a,b){if(e[a]!=null)for(var c in b)b.hasOwnProperty(c)&&(e[a][c]=b[c])},del:function(a){e[a]!=null&&(e[a]=null)}},a.invoke=function(a,b,c){return invokeListener(a,b,c)},a.buildEventObject=function(){var a={HTMLEvents:["abort","blur","change","error","focus","load","reset","resize","scroll","select","submit","unload","hashchange"],UIEvents:["DOMActivate","DOMFocusIn","DOMFocusOut"],KeyEvents:["keydown","keypress","keyup"],MouseEvents:["click","mousedown","mousemove","mouseout","mouseover","mouseup"],MutationEvents:["DOMAttrModified","DOMNodeInserted","DOMNodeRemoved","DOMCharacterDataModified","DOMNodeInsertedIntoDocument","DOMNodeRemovedFromDocument","DOMSubtreeModified"]},b=function(b){var c="Events";for(var d in a)if(a.hasOwnProperty(d)&&contains(b,a[d])){d==="KeyEvents"&&!window.KeyEvent&&(d="UIEvents");if(document.implementation.hasFeature(d,"2.0")||window[d.substring(0,d.length-1)])d="Events";c=d;break}return c},c={useDefaults:!1,bubbles:!0,cancelable:!1},d={winObj:window,detail:1},e={winObj:window,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:0,charCode:0},f={winObj:window,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,button:0,relatedTarget:null},g={relatedNode:null,prevValue:null,newValue:null,attrName:null,attrChange:null};return document.createEvent?function(a,h,i){var j=b(event),k=document.createEvent(j),l=h,h=h||{};if(typeof l!="object"||h.useDefaults)j="Events";switch(j){case"Events":case"HTMLEvents":h=merge(c,h),k.initEvent(a,h.bubbles,h.cancelable);break;case"UIEvents":h=merge(c,d,h),k.initUIEvent(a,h.bubbles,h.cancelable,h.winObj,h.detail);break;case"KeyEvents":h=merge(c,e,h),k.initKeyEvent(a,h.bubbles,h.cancelable,h.winObj,h.ctrlKey,h.altKey,h.shiftKey,h.metaKey,h.keyCode,h.charCode);break;case"MouseEvents":h=merge(c,f,h),k.initMouseEvent(a,h.bubbles,h.cancelable,h.winObj,h.screenX,h.screenY,h.clientX,h.clientY,h.ctrlKey,h.altKey,h.shiftKey,h.metaKey,h.button,h.relatedTarget);break;case"MutationEvents":h=merge(c,g,h),k.initMutationEvent(a,h.bubbles,h.cancelable,h.relatedNode,h.prevValue,h.newValue,h.attrName,h.attrChange)}for(var m in i)i.hasOwnProperty(m)&&(k[m]=i[m]);return k}:document.createEventObject?function(a,b,d){var e=document.createEventObject(),b=merge(c,b||{},d);for(var f in b)b.hasOwnProperty(f)&&(e[f]=b[f]);return e}:function(a,b,d){return merge({type:a,timeStamp:(new Date).getTime(),target:target,srcElement:target,currentTarget:target,defaultPrevented:!1},c,b||{},d||{},{bubbles:!1})}}(),f.init()};typeof window.YourBrowserFailsError=="undefined"&&(window.YourBrowserFailsError=function(a){if(!this instanceof YourBrowserFailsError)return new YourBrowserFailsError(a);var b=function(){var a;try{(0)()}catch(b){a=b}return a}();this.name="YourBrowserFailsError",this.message=a,this.stack=b.stack||b.stacktrace||"Could not get a stack. MORE FAILS!!"});
/*end events.min.js*/

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
        if (window.getComputedStyle(elem).display !== 'none') return;
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

    var on = function on(elem, eventname, selector, handler, onceOnly){
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
            listener = function listener(event){
                blend(event); // normalize between touch and mouse events
                // if (eventname === 'mousedown'){
                //     console.log(event);
                // }
                if (!event.wbValid){
                    // console.log('event is not valid');
                    return;
                }
                if (wb.matches(event.wbTarget, selector)){
                    handler(event);
                }else if (wb.matches(event.wbTarget, selector + ' *')){
                    event.wbTarget = wb.closest(event.wbTarget, selector);
                    handler(event);
                }
                if (onceOnly){
                    Event.off(elem, eventname, listener);
                }
            };
        }else{
            listener = function listener(event){
                blend(event);
                if (!event.wbValid){
                    return;
                }
                handler(event);
                if (onceOnly){
                    Event.off(elem, eventname, listener);
                }
            };
        }
        elem.addEventListener(eventname, listener, false);
        return listener;
    };

    var off = function(elem, eventname, handler){
        elem.removeEventListener(eventname, handler);
    }

    var once = function(elem, eventname, selector, handler){
        return Event.on(elem, eventname, selector, handler, true);
    }

    var trigger = function(elemOrSelector, eventname, data){
        var elem;
        if (elemOrSelector.nodeName){
            elem = elemOrSelector;
        }else{
            elem = document.querySelector(elem);
        }
        var evt = new CustomEvent(eventname, {bubbles: true, cancelable: true, detail: data});
        //console.log('dispatching %s for %o', eventname, elem);
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
    var scratchpad= document.querySelector('.scratchpad'); // <- WB
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
        blockMenu = document.querySelector('#block_menu');
	scratchpad= document.querySelector('.scratchpad');
        workspace = null;
        selectedSocket = null;
        _dropCursor = null;
        startParent = null;
        startSibling = null;
    }
    reset();



    function initDrag(event){
        console.log('initDrag(%o)', event);
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
                //console.log('target parent: %o', target.parentElement);
                target.dataset.isTemplateBlock = 'true';
                templateDrag = true;
            }
        	dragAction.target = target;
            // WB-Specific
            if (target.parentElement.classList.contains('locals')){
                //console.log('target parent: %o', target.parentElement);
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
        console.log('startDrag(%o)', event);
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
            wb.showWorkspace('block'); // not needed with new layout?
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
        document.body.appendChild(dragTarget);
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
        console.log(potentialDropTargets.length);
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
        console.log('drag(%o)', event);
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

    function endDrag(event){
        console.log('endDrag(%o) dragging: %s', event, dragging);
        if (!dragging) {return undefined;}
        clearTimeout(timer);
        timer = null;
        handleDrop(event,event.altKey || event.ctrlKey);
        reset();
        event.preventDefault();
        return false;
    }

    function handleDrop(event,copyBlock){
        console.log('handleDrop(%o)', copyBlock);
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        resetDragStyles(); // <- WB
        // WB-Specific
	if (wb.overlap(dragTarget, blockMenu)){
	    alert("Bye");
            // delete block if dragged back to menu
            Event.trigger(dragTarget, 'wb-delete');
            dragTarget.parentElement.removeChild(dragTarget);
            // Add history action if the source block was in the workspace
            if(!templateDrag) {
	        	// If we're dragging to the menu, there's no destination to track for undo/redo
    	    	dragAction.toParent = dragAction.toBefore = null;
        		wb.history.add(dragAction);
        	}
        }else if (wb.overlap(dragTarget, scratchpad)){ 
	    alert('Hi');

	    var scratchPadStyle = scratchpad.getBoundingClientRect();
	    var newOriginX = scratchPadStyle.left;
	    var newOriginY = scratchPadStyle.top;
    
	    var blockStyle = dragTarget.getComputedRect();
	    var oldX = blockStyle.left;
	    var oldY = blockStyle.top;

	    //dragTarget.style.position = "absolute";
	    dragTarget.style.left = oldX - newOriginX;
	    dragTarget.style.top = oldY - newOriginY;
	    scratchpad.appendChild(dragTarget);

            //when dragging from workspace to scratchpad, this keeps workspace from
	    //moving around when block in scratchpad is moved.
            dragTarget.parentElement.removeChild(dragTarget); 
            if(!templateDrag) {
	        	// If we're dragging to the menu, there's no destination to track for undo/redo
    	    	dragAction.toParent = dragAction.toBefore = null;
        		wb.history.add(dragAction);
        	}
	    return;
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
	    //Event.on('.scratchpad', '', null, endDragInScratchpad);
            Event.on(document.body, 'mouseup', null, endDrag);
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

    var resetSeqNum = function(){
        _nextSeqNum = 0;
        blockRegistry = {};
        wb.blockRegistry = blockRegistry;
    }

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
        //if (!obj.isTemplateBlock){
        //     console.log('instantiated block %o from description %o', block, obj);
        //}
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
        // A socket may also have a suffix, text after the value
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
        //      console.log('socket seq num: %s', blockdesc.seqNum);
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
            //console.log('socket seq num: %s', blockdesc.seqNum);
            var newBlock = null;
            if (desc.uBlock){
                // console.log('trying to instantiate %o', desc.uBlock);
                delete desc.uValue;
                newBlock = Block(desc.uBlock);
                //console.log('created instance: %o', newBlock);
            } else if (desc.block && ! desc.uValue){
                //console.log('desc.block');
                newBlock = cloneBlock(document.getElementById(desc.block));
            }else if (desc.block && desc.uValue){
                // for debugging only
                // console.log('block: %s, uValue: %s', desc.block, desc.uValue);                
            }
            if (newBlock){
                //console.log('appending new block');
                holder.appendChild(newBlock);
                addExpression({'wbTarget': newBlock});
            }
        }
        if (desc.suffix){
            socket.dataset.suffix = desc.suffix;
            socket.appendChild(elem('span', {'class': 'suffix'}, desc.suffix));
        }
        return socket;
    }


    function socketDesc(socket){
        var isTemplate = !!wb.closest(socket, '.block').dataset.isTemplateBlock;
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
        if (socket.dataset.suffix){
            desc.suffix = socket.dataset.suffix;
        }
        // User-specified settings
        if (isTemplate) return desc;
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name')
        
        if (desc.name !== uName){
            desc.uName = uName;
        }
        var holder = wb.findChild(socket, '.holder');
        if (holder){
            var input = wb.findChild(holder, 'input, select');
            // var block = wb.findChild(holder, '.block');
            if (wb.matches(holder.lastElementChild, '.block')){
                desc.uBlock = blockDesc(holder.lastElementChild);
            }else{
                desc.uValue = input.value;
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
        var input = elem('input', {type: type, value: value, 'data-oldvalue': value});

        //Only enable editing for the appropriate types
        if (!(type === "string" || type === "any" || type === 'regex' ||
              type === "url"    || type === "phone" ||
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
            if (type === 'string' || type === 'choice' || type === 'color' || type === 'url'){
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
    wb.resetSeqNum = resetSeqNum;
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
	    			"content": scriptsToString(title, '', title)
	    		},
	    	}
	    }), null, '    ');
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

	//Potential FIXME: I feel that title should be the filename, but uName || name
	//determines what is shown in the workspace.
	function scriptsToString(title, description, name){
		if (!title){ title = ''; }
		if (!description){ description = ''; }
		if (!name){ name = 'Workspace';}
		var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
		var json = {
			title: title,
			description: description,
			date: Date.now(),
			waterbearVersion: '2.0',
			blocks: blocks.map(wb.blockDesc)
		};

		if(json.blocks[0].sockets[0].name){
			json.blocks[0].sockets[0].name = name;
		}else if(json.blocks[0].sockets[0].uName){
			json.blocks[0].sockets[0].uName = name;
		}

		return JSON.stringify(json, null, '    ');
	}


	wb.createDownloadUrl = function createDownloadUrl(evt){
	    evt.preventDefault();
	    var name = prompt("Save file as: ");
		var URL = window.webkitURL || window.URL;
		var file = new Blob([scriptsToString('','',name)], {type: 'application/json'});
		var reader = new FileReader();
		var a = document.createElement('a');
		reader.onloadend = function(){
			a.href = reader.result;
			a.download = name + '.json';
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
			//console.log("Loading gist %s", queryParsed.gist);
			ajax.get("https://api.github.com/gists/"+queryParsed.gist, function(data){
				loadScriptsFromGist({data:JSON.parse(data)});
			});
		}else if (queryParsed.example){
			//console.log('loading example %s', queryParsed.example);
			loadScriptsFromExample(queryParsed.example);
		}else if (localStorage['__' + wb.language + '_current_scripts']){
			//console.log('loading current script from local storage');
			var fileObject = JSON.parse(localStorage['__' + wb.language + '_current_scripts']);
			if (fileObject){
				loadScriptsFromObject(fileObject);
			}
		}else{
			//console.log('no script to load, starting a new script');	
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
//begin short-cut implementation for redo and undo
Events.bind(document, 'keystroke.Ctrl+Z', undoLastAction);
Events.bind(document, 'keystroke.Ctrl+Y', redoLastAction);
//for mac user, cmd added 
Events.bind(document, 'keystroke.meta+Z', undoLastAction);
Events.bind(document, 'keystroke.meta+Y', redoLastAction);
//end short cut 
Event.on(document.body, 'wb-script-loaded', null, clearUndoStack);

})(wb);

/*end undo.js*/

/*begin ui.js*/
(function(wb){

// UI Chrome Section

// function tabSelect(event){
//     var target = event.wbTarget;
//     event.preventDefault();
//     document.querySelector('.tabbar .selected').classList.remove('selected');
//     target.classList.add('selected');
//     if (wb.matches(target, '.scripts_workspace_tab')){
//         showWorkspace('block');
//     }else if (wb.matches(target, '.scripts_text_view_tab')){
//         showWorkspace('text');
//         updateScriptsView();
//     }
// }

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
	return;
    // console.log('showWorkspace');
    // var workspace = document.querySelector('.workspace');
    // var scriptsWorkspace = document.querySelector('.scripts_workspace');
    // if (!scriptsWorkspace) return;
    // var scriptsTextView = document.querySelector('.scripts_text_view');
    // if (mode === 'block'){
	   //  scriptsWorkspace.style.display = '';
	   //  scriptsTextView.style.display = 'none';
    //     workspace.classList.remove('textview');
    //     workspace.classList.add('blockview');
    // }else if (mode === 'text'){
    // 	scriptsWorkspace.style.display = 'none';
    // 	scriptsTextView.style.display = '';
    //     workspace.classList.remove('blockview');
    //     workspace.classList.add('textview');
    // }
}
// Expose this to dragging and saving functionality
wb.showWorkspace = showWorkspace;

function updateScriptsView(){
    var blocks = wb.findAll(document.body, '.scripts_workspace');
    var view = wb.find(document.body, '.scripts_text_view');
    wb.writeScript(blocks, view);
}
wb.updateScriptsView = updateScriptsView; 


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

function deleteCommand(evt) {
	// console.log("Deleting a block!");
	action = {
		removed: this,
		// Storing parent and next sibling in case removing the node from the DOM clears them
		parent: this.parentNode,
		before: this.nextSibling,
		undo: function() {
			// console.log(this);
			if(wb.matches(this.removed,'.step')) {
				this.parent.insertBefore(this.removed, this.before);
			} else {
				this.parent.appendChild(this.removed);
			}
			Event.trigger(this.removed, 'wb-add');
		},
		redo: function() {
			Event.trigger(this.removed, 'wb-remove');
			this.removed.remove();
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
        delete: {name: 'Delete', callback: deleteCommand},
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

// functions to show various mobile views

function handleShowButton(button, newView){
	// stop result
	wb.clearStage();
	// enable previous button, disable current button
	var currentButton = document.querySelector('.current-button');
	if (currentButton){
		currentButton.classList.remove('current-button');
	}
	button.classList.add('current-button');
	//slide old view out, slide new view in
	var oldView = document.querySelector('.current-view');
	oldView.classList.remove('current-view');
	oldView.style.transitionDuration = '0.5s';
	oldView.style.left = '-100%';
	newView.classList.add('current-view');
	newView.style.transitionDuration = '0.5s';
	newView.style.left = '0';
	Event.once(document.body, 'transitionend', null, function(){
		// console.log('transitionend: %o', oldView);
		oldView.style.transitionDuration = '0s';
		oldView.style.left = '100%';
	});
}

function showFiles(evt){
	handleShowButton(evt.target, document.querySelector('.files'));
}

function showBlocks(evt){
	handleShowButton(evt.target, document.querySelector('#block_menu'));
}

function showScript(evt){
	handleShowButton(evt.target, document.querySelector('.workspace'));
}

function showResult(evt){
	handleShowButton(evt.target, document.querySelector('.results'));
	Event.once(document.body, 'transitionend', null, wb.runCurrentScripts);
}

Event.on(document.body, 'change', 'input', changeSocket);
Event.on('#block_menu', 'click', '.accordion-header', accordion);
// Event.on('.tabbar', 'click', '.chrome_tab', tabSelect);

if (document.body.clientWidth < 361){
	// console.log('mobile view');
	Event.on('.show-files', 'click', null, showFiles);
	Event.on('.show-blocks', 'click', null, showBlocks);
	Event.on('.show-script', 'click', null, showScript);
	Event.on('.show-result', 'click', null, showResult);
	document.querySelector('.show-script').classList.add('current-button');
	document.querySelector('.workspace').classList.add('current-view');
}
if (document.body.clientWidth > 360){
	// console.log('desktop view');
	Event.on(document.body, 'change', 'input', updateScriptsView);
	Event.on(document.body, 'wb-modified', null, updateScriptsView);
}

})(wb);


/*end ui.js*/

/*begin workspace.js*/
(function(wb){

	wb.language = location.pathname.match(/\/([^/.]*)\.html/)[1];

	wb.clearScripts = function clearScripts(event, force){
		if (force || confirm('Throw out the current script?')){
			var workspace = document.querySelector('.scripts_workspace')
			workspace.parentElement.removeChild(workspace);
			wb.scriptModified = false;
			wb.loaded = false;
			createWorkspace('Workspace');
			document.querySelector('.scripts_text_view').innerHTML = '';
			wb.history.clear();
			wb.resetSeqNum();
			delete localStorage['__' + wb.language + '_current_scripts'];
		}
	}
	Event.on('.clear_scripts', 'click', null, wb.clearScripts);
	Event.on('.edit-script', 'click', null, function(event){
		wb.historySwitchState('editor');
	});

	Event.on(document.body, 'click', '.load-example', function(evt){
		console.log('load example ' + evt.target.dataset.example);
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
	    	// This bothers me greatly: runs with the console.log, but not without it
	    	console.log('running current scripts');
	    	runFullSize();
	    }else{
	    	if (wb.view === 'result'){
		    	// console.log('we want to run current scripts, but cannot');
		    }else{
		    	runWithLayout();
		    	// console.log('we do not care about current scripts, so there');
		    }
	    }
	    if (wb.toggleState.scripts_text_view){
	    	wb.updateScriptsView();
	    }
	    if (wb.toggleState.stage){
	    	// console.log('run current scripts');
	    	wb.runCurrentScripts();
	    }else{
	    	wb.clearStage();
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
		//console.log('historySwitchState(%o, %s)', state, !!clearFiles);
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

	function runFullSize(){
		['#block_menu', '.workspace', '.scripts_text_view'].forEach(function(sel){
			wb.hide(wb.find(document.body, sel));
		});
		wb.show(wb.find(document.body, '.stage'));
	}

	function runWithLayout(){
		['#block_menu', '.workspace'].forEach(function(sel){
			wb.show(wb.find(document.body, sel));
		});
		['stage', 'scripts_text_view', 'tutorial', 'scratchpad', 'scripts_workspace'].forEach(function(name){
			toggleComponent({detail: {name: name, state: wb.toggleState[name]}});
		});
	}

	function toggleComponent(evt){
		var component = wb.find(document.body, '.' + evt.detail.name);
		evt.detail.state ? wb.show(component) : wb.hide(component);
		var results = wb.find(document.body, '.results');
		// Special cases
		switch(evt.detail.name){
			case 'stage':
				if (evt.detail.state){
					wb.show(results);
					wb.runCurrentScripts();
				}else{
					wb.clearStage();
					if (!wb.toggleState.scripts_text_view){
						wb.hide(results);
					}
				}
				break;
			case 'scripts_text_view':
				if (evt.detail.state){
					wb.show(results);
					wb.updateScriptsView();
				}else{
					if (!wb.toggleState.stage){
						wb.hide(results);
					}
				}
				break;
			case 'tutorial':
			case 'scratchpad':
			case 'scripts_workspace':
				if (! (wb.toggleState.tutorial || wb.toggleState.scratchpad || wb.toggleState.scripts_workspace)){
					wb.hide(wb.find(document.body, '.workspace'));
				}else{
					wb.show(wb.find(document.body, '.workspace'));
				}
			default:
				// do nothing
		}
	}

	Event.on(document.body, 'wb-toggle', null, toggleComponent);

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

/*begin menu.js*/
(function(wb, Event){

	var toggleState = {};
	if (localStorage.toggleState){
		toggleState = JSON.parse(localStorage.toggleState);
	}

	function handleToggle(evt){
		var button = evt.target;
		var name = button.dataset.target;
		var isOn = !getState(name);
		toggleState[name] = isOn;
		if (isOn){
			button.classList.remove('icon-unchecked');
			button.classList.add('icon-check');
		}else{
			button.classList.add('icon-unchecked');
			button.classList.remove('icon-check');
		}
		Event.trigger(document.body, 'wb-toggle', {name: name, state: isOn});
		localStorage.toggleState = JSON.stringify(toggleState);
	}

	Event.on(document.body, 'click', '.toggle', handleToggle);

	function getState(name){
		if (toggleState[name] === undefined){
			toggleState[name] = true;
		}
		return toggleState[name];
	}

	// initialize toggle states
	window.addEventListener('load', function(evt){
		wb.findAll(document.body, '.toggle').forEach(function(button){
			var name = button.dataset.target;
			var isOn = getState(name);
			if (isOn){
				button.classList.add('icon-check');
			}else{
				button.classList.add('icon-unchecked');
			}
			Event.trigger(document.body, 'wb-toggle', {name: name, state: isOn});
		});
	}, false);

	wb.toggleState = toggleState; // treat as read-only

})(wb, Event);
/*end menu.js*/

/*begin languages/minecraftjs/minecraftjs.js*/

/*
 *    MINECRAFTJS PLUGIN
 *
 *    Support for writing Javascript for Minecraft using Waterbear
 *
 */


// Add some utilities

/*

$('.run-scripts').click(function(){
     var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
     var code = blocks.prettyScript();
     var query = $.param({'code':code});
     
     $.ajax({
      url: '/run?',
      data: query,
      success: function(){alert("Code running on RPi");},
      error: function(){alert("Code failed / server not running on RPi");}
     });
     
     
});

// Add some utilities
jQuery.fn.extend({
    prettyScript: function(){
        var script = this.map(function(){
            return $(this).extract_script();
        }).get().join('');
        
        script = "var Minecraft = require('./minecraft-pi/lib/minecraft.js'); \n var client = new Minecraft('localhost', 4711, function() {\n"+script+"\n});";
        
        return js_beautify(script);
    },
    writeScript: function(view){
      view.html('<pre class="language-javascript">' + this.prettyScript() + '</pre>');
      hljs.highlightBlock(view.children()[0]);
    }
});

// End UI section
*/

wb.wrap = function(script){
    //return 'try{' + script + '}catch(e){console,log(e);}})()';
    return script;
}

function runCurrentScripts(event){
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        wb.runScript( wb.prettyScript(blocks) );        
}
Event.on('.run-scripts', 'click', null, runCurrentScripts);


wb.ajax = {
        jsonp: function(url, data, success, error){
            var callbackname = '_callback' + Math.round(Math.random() * 10000);
            window[callbackname] = function(result){
                delete window[callbackname];
                success(result);
            };
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4){
                    if (xhr.status === 200){
                        // this is particularly unsafe code
                        eval(xhr.responseText); // this should call window[callbackname]
                    }else{
                        delete window[callbackname];
                        error(xhr);
                    }
                }
            };
            xhr.open('GET', url + '?' + data + '&callback=' + callbackname, true);
            xhr.send();
        }
    };

wb.runScript = function(script){
  
    var params = {'code':script};
  
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
    var query = parts.join('&');
    
    var messagebox = document.querySelector('#messagebox');
    if(messagebox === null || messagebox.length === 0)
    {
        messagebox = wb.elem('div', {"id":"messagebox"});
        document.querySelector('.tabbar').appendChild(messagebox);
        messagebox = document.querySelector('#messagebox');
        
    }
    messagebox.innerHTML = "Sending Code to Raspberry Pi";
    
    
    
    wb.ajax.jsonp("../run", query, function(msg){messagebox.innerHTML = "Code running on RPi"; window.setTimeout(function(){messagebox.innerHTML="";}, 5000);console.log("success",msg);}, function(){ messagebox.innerHTML = "Code failed / server not running on RPi"; window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);console.log("error",msg);});
    
    //var runtimeUrl = location.protocol + '//' + location.host + '/dist/javascript_runtime.min.js';
    //console.log('trying to load library %s', runtimeUrl);
    //document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: //runtimeUrl, script: wb.wrap(script)}), '*');
}

function clearStage(event){
    document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
Event.on('.clear-stage', 'click', null, clearStage);
Event.on('.edit-script', 'click', null, clearStage);



wb.prettyScript = function(elements){
    var script = js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join(''));
    script = "var Minecraft = require('./minecraft-pi/lib/minecraft.js');\nrequire('./waterbear/dist/minecraftjs_runtime.js');\nvar client = new Minecraft('localhost', 4711, function() {\nvar zeros={x:0, y:0, z:0};\n"+script+"\n});";
    return script;
};

wb.writeScript = function(elements, view){
    view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
    hljs.highlightBlock(view.firstChild);
};

// End UI section

// expose these globally so the Block/Label methods can find them
wb.choiceLists = {
    boolean: ['true', 'false'],
    blocktypes: ['step', 'expression', 'context', 'eventhandler'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
};

// Hints for building blocks
//
//`
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


/*end languages/minecraftjs/minecraftjs.js*/

/*begin languages/minecraftjs/control.js*/

/*end languages/minecraftjs/control.js*/

/*begin languages/minecraftjs/game.js*/

/*end languages/minecraftjs/game.js*/

/*begin languages/minecraftjs/player.js*/

/*end languages/minecraftjs/player.js*/

/*begin languages/minecraftjs/position.js*/

wb.choiceLists.types = wb.choiceLists.types.concat(['position']);
wb.choiceLists.rettypes = wb.choiceLists.rettypes.concat(['position']);
/*end languages/minecraftjs/position.js*/

/*begin languages/minecraftjs/blocks.js*/

wb.choiceLists.blocks = ["AIR", "STONE", "GRASS", "DIRT", "COBBLESTONE", "WOOD_PLANKS", "SAPLING", "BEDROCK", "WATER_FLOWING", "WATER_STATIONARY", "LAVA_FLOWING", "LAVA_STATIONARY", "SAND", "GRAVEL", "GOLD_ORE", "IRON_ORE", "COAL_ORE", "WOOD", "LEAVES", "GLASS", "LAPIS_LAZULI_ORE", "LAPIS_LAZULI_BLOCK", "SANDSTONE", "BED", "COBWEB", "GRASS_TALL", "WOOL", "FLOWER_YELLOW", "FLOWER_CYAN", "MUSHROOM_BROWN", "MUSHROOM_RED", "GOLD_BLOCK", "IRON_BLOCK", "STONE_SLAB_DOUBLE", "STONE_SLAB", "BRICK_BLOCK", "TNT", "BOOKSHELF", "MOSS_STONE", "OBSIDIAN", "TORCH", "FIRE", "STAIRS_WOOD", "CHEST", "DIAMOND_ORE", "DIAMOND_BLOCK", "CRAFTING_TABLE", "FARMLAND", "FURNACE_INACTIVE", "FURNACE_ACTIVE", "DOOR_WOOD", "LADDER", "STAIRS_COBBLESTONE", "DOOR_IRON", "REDSTONE_ORE", "SNOW", "ICE", "SNOW_BLOCK", "CACTUS", "CLAY", "SUGAR_CANE", "FENCE", "GLOWSTONE_BLOCK", "BEDROCK_INVISIBLE", "GLASS_PANE", "MELON", "FENCE_GATE", "GLOWING_OBSIDIAN", "NETHER_REACTOR_CORE"];

wb.choiceLists.types = wb.choiceLists.types.concat(['block']);
wb.choiceLists.rettypes = wb.choiceLists.rettypes.concat(['block']);
/*end languages/minecraftjs/blocks.js*/

/*begin languages/minecraftjs/camera.js*/

wb.choiceLists.cameramode = ['normal','thirdPerson','fixed'];
/*end languages/minecraftjs/camera.js*/

/*begin languages/minecraftjs/array.js*/

/*end languages/minecraftjs/array.js*/

/*begin languages/minecraftjs/boolean.js*/

/*end languages/minecraftjs/boolean.js*/

/*begin languages/minecraftjs/math.js*/

/*end languages/minecraftjs/math.js*/

/*begin languages/minecraftjs/string.js*/

/*end languages/minecraftjs/string.js*/

/*begin languages/minecraftjs/control.json*/
wb.menu({
    "name": "Control",
    "blocks": [
        {
            "blocktype": "eventhandler",
            "id": "d36cd27a-98d9-4574-8e68-db267b7a2bb4",
            "script": "[[1]]",
            "help": "this trigger will run its scripts once when the program starts",
            "sockets": [
                {
                    "name": "when program runs"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "771a7f8f-ed82-4a92-b255-2f9c4b6fa614",
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
            "id": "9bcb76ff-0965-4bdb-9ead-fcad46bbbd1f",
            "script": "if( ! {{1}} ){ [[1]]} }",
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
            "id": "7972f6ee-f653-486c-aa99-81d8930a4d35",
            "script": "while(!({{1}})){[[1]]}",
            "help": "repeat forever until condition is true",
            "sockets": [
                {
                    "name": "repeat until",
                    "type": "boolean",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "c671ef3f-a7d0-4921-825d-c879e70999de",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "count##"
                        }
                    ],
                    "script": "count##",
                    "type": "number"
                }
            ],
            "script": "var count##=0;(function(){setInterval(function(){count##++;[[1]]},1000/{{1}})})();",
            "help": "this trigger will run the attached blocks periodically",
            "sockets": [
                {
                    "name": "repeat",
                    "type": "number",
                    "value": "2"
                },
                {
                    "name": "times a second"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "1a1cee1b-fd60-4c4f-87ca-09e394fe8f67",
            "script": "variable## = {{1}};",
            "locals": [
                {
                    "blocktype": "expression",
                    "script": "variable##",
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
                    "name": "variable",
                    "type": "any",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "ece22a99-cbf3-48d8-bab8-4d93ae8a6712",
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
            "blocktype": "context",
            "id": "9a148b21-c609-4f98-9ae3-19d2e4e1ddef",
            "script": "setTimeout(function(){[[1]]},1000*{{1}});",
            "help": "pause before running the following blocks",
            "sockets": [
                {
                    "name": "wait",
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
            "id": "2adb5300-2c32-41a2-907f-4cf7ecbf7eac",
            "script": "range({{1}}).forEach(function(count##, item){[[1]]});",
            "help": "repeat the contained blocks so many times",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "count##"
                        }
                    ],
                    "script": "count##",
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
            "blocktype": "context",
            "id": "c457444d-c599-4241-bead-5dc9d6e649a4",
            "script": "while({{1}}){[[1]]}",
            "help": "repeat until the condition is false",
            "sockets": [
                {
                    "name": "forever if",
                    "type": "boolean",
                    "value": "false"
                }
            ]
        }
    ]
});
/*end languages/minecraftjs/control.json*/

/*begin languages/minecraftjs/game.json*/
wb.menu({
    "name": "Game",
    "blocks": [
        {
            "blocktype": "step",
            "id": "9161dad6-2d90-4d70-b447-5cc61130350c",
            "sockets": [
                {
                    "name": "Say",
                    "type": "string",
                    "value": "hi"
                },
                {
                    "name": "in chat"
                }
                
            ],
            "script": "client.chat({{1}});",
            "help": "Send a message as chat"
        },
        
        {
            "blocktype": "step",
            "id": "de9bb25d-481d-43e8-88b1-c9f56160f85e",
            "sockets": [
                {
                    "name": "Save Checkpoint"
                }
            ],
            "script": "client.saveCheckpoint();",
            "help": "Save Checkpoint"
        },
        
        
        {
            "blocktype": "step",
            "id": "e5aa0ed8-035c-4349-bfdb-405ea9e72eec",
            "sockets": [
                {
                    "name": "Restore Checkpoint"
                }
            ],
            "script": "client.restoreCheckpoint();",
            "help": "Restore Last Checkpoint"
        }
    ]
}
);
/*end languages/minecraftjs/game.json*/

/*begin languages/minecraftjs/player.json*/
wb.menu({
    "name": "Player",
    "blocks": [
        {
            "blocktype": "context",
            "id": "fe8f0ff3-1f52-4866-bbf0-bc3c7a850e11",
            "sockets": [
                {
                    "name": "Get Player Tile Position"
                }
            ],
            "script": "client.getTile(function(data){console.log(\"data =\", data); var aData = data.toString().trim().split(\",\"); console.log(\"aData =\", aData); var playerposition = {x:parseInt(aData[0],10), y: parseInt(aData[1],10), z: parseInt(aData[2],10)}; [[1]]});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "Player Position"
                        }
                    ],
                    "script": "playerposition",
                    "type": "position"
                },
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "Player Position as text"
                        }
                    ],
                    "script": "\"x:\"+playerposition.x.toString()+\", y:\"+playerposition.y.toString()+\", z:\"+playerposition.z.toString()",
                    "type": "string"
                }
            ],
            "help": "Get the tile that the player is on"
        },
        {
            "blocktype": "expression",
            "id": "91db1ebb-a2c4-44b3-a897-72a8e9764ae9",
            "sockets": [
                {
                    "name": "Player Position"
                }
            ], 
            "type":"position",
            "script": "playerposition",
            "help": "position"
        }, 
        {
            "blocktype": "step",
            "id": "5474d53a-b671-4392-b299-d10339ad12af",
            "sockets": [
                {
                    "name": "Create Position## from",
                    "type": "position",
                    "block": "91db1ebb-a2c4-44b3-a897-72a8e9764ae9"
                },
                {   
                    "name": "offset by",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],
            "script": "var posA## = {{1}};var posB## = {{2}};var position## = {x:(posA##.x+posB##.x), y:(posA##.y+posB##.y) , z:(posA##.z+posB##.z)};",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "Position##"
                        }
                    ],
                    "script": "position##",
                    "type": "position"
                }
            ],
            "help": "Create new position relative to Player position"
        },
        {
            "blocktype": "step",
            "id": "0ff6e19b-74ee-415e-805a-c46cd2e6ee6e",
            "sockets": [
                {
                    "name": "Move Player to",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],
            "script": "client.setTile({{1}}.x, {{1}}.y, {{1}}.z);",
            "help": "Move Player to x, y, z of position"
        }
        
    
    ]
}
);
/*end languages/minecraftjs/player.json*/

/*begin languages/minecraftjs/position.json*/
wb.menu({
    "name": "Position",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "8bb6aab6-273d-4671-8caa-9c15b5c486a7",
            "sockets": [
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
                    "name": "z",
                    "type": "number",
                    "value": "0"
                }
            ], 
            "type":"position",
            "script": "{x:{{1}}, y:{{2}} , z:{{3}}}",
            "help": "A position: x is across, y is up and z is depth"
        },
        {
            "blocktype": "expression",
            "id": "590c8aef-a755-4df5-8930-b430db5a3c3d",
            "sockets": [
                {
                    "name": "Centre Position"
                }
            ], 
            "type":"position",
            "script": "zeros",
            "help": "position"
        },
        
        {
            "blocktype": "step",
            "id": "0ae2eba9-582e-4a3a-92b2-0f8484397e90",
            "sockets": [
                {
                    "name": "Create Position## from",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],  
            "script": "var posA## = {{1}}; var posB## = {{2}}; var position## = posA##;",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "Position##"
                        }
                    ],  
                    
                    "script": "position##",
                    "type": "position"
                }
            ],
            
            "help": "create new position"
        },
        {
            "blocktype": "expression",
            "id": "abe5ebe0-a169-4ca4-8048-80633f7f19f9",
            "sockets": [
                {
                    "name": "position",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                },
                {
                    "name": "equals position",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],  
            "script": "({{1}}.x === {{2}}.x && {{1}}.y === {{2}}.y && {{1}}.z === {{2}}.z);",
            "type": "boolean",
            "help": "are 2 positions the same"
        },
        {
            "blocktype": "step",
            "id": "5dfa6369-b4bc-4bb3-9b98-839015d5f9ee",
            "sockets": [
                {
                    "name": "Create Position## from",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                },
                {
                    "name": "offset by",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],  
            "script": "var posA## = {{1}}; var posB## = {{2}}; var position## = {x:(posA##.x+posB##.x), y:(posA##.y+posB##.y) , z:(posA##.z+posB##.z)};",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "Position##"
                        }
                    ],  
                    
                    "script": "position##",
                    "type": "position"
                }
            ],
            
            "help": "create new position by adding 2 others"
        },
        {
            "blocktype": "context",
            "id": "2ab7b0ea-b646-4672-a2fe-310542b924aa",
            "sockets": [
                {
                    "name": "Get ground position from",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],
            "script": "client.getHeight({{1}}.x, {{1}}.z, function(height##){var groundposition = {x:{{1}}.x, y:parseInt(height##,10) , z:{{1}}.z}; [[1]]});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "Ground Position"
                        }
                    ],
                    "script": "groundposition",
                    "type": "position"
                }
            ],
            "help": "get height of blocks at position"
        },
        {
            "blocktype": "expression",
            "id": "c95312f6-da99-4516-b43d-6f759c42b5c5",
            "sockets": [
                {
                    "name": "x from",                    
                    "type": "position",
                    "block":"8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],  
            "script": "{{1}}.x",
            "type": "number",
            "help": "the x (across) part of the postion"
        },
        {
            "blocktype": "expression",
            "id": "6facc3ac-a8d5-4503-89d9-0dff6ebc9fc6",
            "sockets": [
                {
                    "name": "y from",
                    "type": "position",
                    "block":"8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],  
            "script": "{{1}}.y",
            "type": "number",
            "help": "the y (up) part of the postion"
        },
        {
            "blocktype": "expression",
            "id": "96c32f90-7234-4463-b18d-d528271bf224",
            "sockets": [
                {
                    "name": "z from",
                    "type": "position",
                    "block":"8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                }
            ],  
            "script": "{{1}}.z",
            "type": "number",
            "help": "the z (depth) part of the postion"
        },
        {
            "blocktype": "expression",
            "id": "3fa57ab7-bfed-4d36-8307-0ba11eda25f0",
            "sockets": [
                {
                    "name": "position",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                },
                {
                    "name": "as text"
                }
            ],  
            "script": "\"x:\"+{{1}}.x.toString()+\", y:\"+{{1}}.y.toString()+\", z:\"+{{1}}.z.toString()",
            "type": "string",
            "help": "Position as text"
        }
    ]
}
);
/*end languages/minecraftjs/position.json*/

/*begin languages/minecraftjs/blocks.json*/
wb.menu({
    "name": "Blocks",
    "id": "63b8ffcc-9b51-4a5e-b687-634945bfb9b8",
    "blocks": [
        {
            "blocktype": "context",
            "id": "b8020f54-43d2-4207-8529-336eb035898c",
            "sockets": [
                    {
                        "name": "get Block Type at",
                        "type": "position",
                        "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                    }
                ],
            "script": "client.getBlock({{1}}.x, {{1}}.y, {{1}}.z, function(block##){[[1]]});",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                            {
                                "name": "block##"
                            }
                        ],
                    "script": "parseInt(block##)",
                    "type": "number"
                }
            ],
            "help": "get block type at x, y, z"
        },
        {
            "blocktype": "expression",
            "id": "a7c17404-8555-42be-877e-9d01d7647604",
            "sockets": [
                    {
                    "name": "block",
                    "type": "choice",
                    "options": "blocks",
                    "value": "choice"
                }
                ],
            "script": "{{1}}",
            "type": "number",
            "help": "a blocktype"
        },
        {
            "blocktype": "step",
            "id": "5ac8754e-6bbe-42a8-8504-707f1ca3848b",
            "sockets": [
                {
                    "name": "set Block at",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                },
                {
                    "name": "to",
                    "type": "choice",
                    "options": "blocks",
                    "value": "choice"
                }
            ],
            "script": "client.setBlock({{1}}.x, {{1}}.y, {{1}}.z, client.blocks[{{2}}]);",
            "help": "set block at position"
        },
        {
            "blocktype": "step",
            "id": "3969a128-5e8d-4320-9f91-73bebf81820f",
            "labels": ["set Blocks between [object] and [object] to [choice:blocks:STONE]"],
            "sockets": [
                {
                    "name": "set Blocks between",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                },
                {
                    "name": "and",
                    "type": "position",
                    "block": "8bb6aab6-273d-4671-8caa-9c15b5c486a7"
                },
                {
                    "name": "to",
                    "type": "choice",
                    "options": "blocks",
                    "value": "choice"
                }
            ],
            "script": "client.setBlocks({{1}}.x, {{1}}.y, {{1}}.z, {{2}}.x, {{2}}.y, {{2}}.z, client.blocks[{{3}}]);",
            "help": "set blocks in a 3D rectangle between the first and second postions to .."
        },
        {
            "blocktype": "expression",
            "id": "7ab673d1-832b-4a0b-9dc9-0ac47892893b",
            "sockets": [
                {
                    "name": "block type name",
                    "type": "number",
                    "value": "0"
                }
            ],
            "script": "Object.keys(client.blocks).filter(function(element){return (client.blocks[element] === {{1}});})",
            "type": "string",
            "help": "name of a blocktype by number"
        }
    ]
}
);
/*end languages/minecraftjs/blocks.json*/

/*begin languages/minecraftjs/camera.json*/
wb.menu({
    "name": "Camera",
    "blocks": [
      
      
        {
            "blocktype": "step",
            "id": "87a5c7ab-8381-4e9b-8038-fbb6e9b787a4",
            "sockets": [
                {
                    "name": "set camera mode to",
                    "type": "choice",
                    "options": "cameramode",
                    "value": "choice"
                }
                
            ],
            "script": "client.setCameraMode({{1}});",
            "help": "set camera mode"
        },
        {
            "blocktype": "step",
            "id": "aa7f5980-fe60-41cc-94e0-094eb7df7043",
            "sockets": [
                {
                    "name": "set camera position to",
                    "type": "position"
                }
            ],
            "script": "client.setCameraPosition({{1}}.x, {{1}}.y, {{1}}.z);",
            "help": "set camera position to a position"
        }
    ]
}
);
/*end languages/minecraftjs/camera.json*/

/*begin languages/minecraftjs/array.json*/
wb.menu({
    "name": "Arrays",
    "blocks": [
        {
            "blocktype": "step",
            "id": "555172b9-1077-4205-a403-3b301be14055",
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
            "id": "8e2d5fba-b674-4d1e-8137-db49da44acf2",
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
            "id": "9e8bf11e-4fe6-4028-932d-a7c3c4231060",
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
            "id": "df795450-aa4a-4acd-b96d-230617611f83",
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
            "id": "4f66c164-2873-4313-a54a-2771b6a04e92",
            "script": "{{1}}.push({{2}});",
            "help": "add any object to an array",
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
            "blocktype": "expression",
            "id": "c6f26489-46d8-481c-ba6d-07739ca7c267",
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
            "id": "ed5a1051-cc8e-47e0-aa9f-c0b852dda6fa",
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
            "id": "56a4997d-7a67-4b85-9983-9d7c64ac2bad",
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
            "id": "b9a43234-d090-4db9-9ebf-bc4e45dff90f",
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
            "id": "6d706cdf-9311-4034-8bd8-6ce0c2340e56",
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
            "id": "43415751-34cb-478b-952b-3954718cb0d3",
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
            "id": "2cf51b08-8c8a-44e8-8227-39a6f13da423",
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
});
/*end languages/minecraftjs/array.json*/

/*begin languages/minecraftjs/boolean.json*/
wb.menu({
    "name": "Boolean",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "2ef48097-a439-42aa-9fe3-be6fb14ef3a7",
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
            "id": "d10041ac-027e-4a11-b4f9-941d2e538aa7",
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
            "id": "d121063d-83c9-4fd6-b738-27b31c995323",
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
            "id": "4de248e4-e41f-44ca-a869-edd9b0a048b2",
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
        }
    ]
});
/*end languages/minecraftjs/boolean.json*/

/*begin languages/minecraftjs/math.json*/
wb.menu({
    "name": "Math",
    "blocks": [
        {
            "blocktype": "step",
            "id": "f51d2d51-d5b4-4fef-a79b-b750694bcc1a",
            "sockets": [
                {
                    "name": "Create Number## from",
                    "type": "number",
                    "value": "0"
                }
            ],
            "script": "var number## = {{1}};",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "Number##"
                        }
                    ],
                    "script": "number##",
                    "type": "number"
                }
            ],
            "help": "create a new named number"
        },
        {
            "blocktype": "expression",
            "type": "number",
            "id": "f08f2d43-23e8-47a9-8bf5-7904af9313da",
            "sockets": [
                {
                    "name": "new number",
                    "type": "number",
                    "value": "0"
                }
            ],
            "script": "{{1}}",
            "help": "create a new named number"
        },
        {
            "blocktype": "expression",
            "id": "15a39af7-940e-4f29-88ba-38b67913599f",
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
            "id": "3d74da37-7c18-47e3-bbdc-e4f7706c81f6",
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
            "id": "ded5d055-7ae1-465a-ad82-003f171b9dc7",
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
            "id": "0e68e0f3-c6f4-40b1-a2cb-431dd0cd574d",
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
            "id": "7d9bf923-baa2-4606-8c44-0247022c2408",
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
            "id": "74992263-4356-48ba-9afe-16e9323f4efa",
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
            "id": "44d41058-f20e-4c8d-9d35-95e1fcfb8121",
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
            "id": "fa03d3e2-0c28-4c35-a5e4-ed1b17d831a0",
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
            "id": "2e897518-31d8-4cc2-bd6e-2ede0b3136d0",
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
            "id": "5e341dc5-f328-4b81-bbb7-aed3ffc81e01",
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
            "id": "ca74d36c-1879-4b41-b04b-587ca56b9a77",
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
            "id": "802a9575-523b-4b6a-961d-e6aed148bdd4",
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
            "id": "441f5159-878a-4109-8030-8d8f9504977e",
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
            "id": "834c4446-6c32-444a-9c3d-cad449eff941",
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
            "id": "2ce4d35d-3c82-4f5e-9e27-894939291ad3",
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
            "id": "db690432-b321-434e-9044-b1188e581f99",
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
            "id": "9f89f604-2498-4149-9fc7-8bb19391e37d",
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
            "id": "d940a5b5-ba8a-49f0-b836-5e460e258a42",
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
            "id": "f2127de3-d601-49fa-9ebf-79ae34c576bd",
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
            "id": "df79282c-43bc-43dc-8d29-2dea29d33f00",
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
            "id": "4b357bdd-630c-4574-96e7-518fb7998702",
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
            "id": "bdbfe741-bfb9-44fc-873d-e0513b02b87a",
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
/*end languages/minecraftjs/math.json*/

/*begin languages/minecraftjs/string.json*/
wb.menu({
    "name": "Strings",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "453e26ad-8bcc-4b48-a173-2d5eb4b15af3",
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
            "id": "9c1110e8-6722-4baf-a1f2-8b5a1a9ccee2",
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
            "id": "fb943e76-3829-4819-8161-f5b5e829f227",
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
            "id": "e6ef4aef-5342-4ceb-b050-ad3554d77c45",
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
            "id": "88d791fe-a035-45ac-882f-bd96b30a73bf",
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
            "id": "93b4b160-e2e2-438a-a8f0-bf2ceb69aaf3",
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
            "id": "6377e5c8-4788-478b-96a6-6388bbed87ec",
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
            "id": "ddbb51d2-a627-406b-82ff-a7ff3d1d82ed",
            "script": "// {{1}};\n",
            "help": "this is a comment and will not be run by the program",
            "sockets": [
                {
                    "name": "comment",
                    "type": "string",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "5331ce50-0113-4595-b4d5-69e241f2019b",
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
            "id": "e01e82db-4849-4dcd-b82e-0c5f8e801ba8",
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
            "id": "27f62d38-a1a2-481f-b7ea-35aae955575b",
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
            "id": "efe8c097-a91f-42f7-a92f-50ad32a969db",
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
/*end languages/minecraftjs/string.json*/
