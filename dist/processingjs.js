
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

/*begin processing-1.4.1.js*/
/***

    P R O C E S S I N G . J S - 1.4.1
    a port of the Processing visualization language

    Processing.js is licensed under the MIT License, see LICENSE.
    For a list of copyright holders, please refer to AUTHORS.

    http://processingjs.org

***/

(function(window, document, Math, undef) {
  var nop = function() {};
  var debug = function() {
    if ("console" in window) return function(msg) {
      window.console.log("Processing.js: " + msg)
    };
    return nop
  }();
  var ajax = function(url) {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    if (xhr.overrideMimeType) xhr.overrideMimeType("text/plain");
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
    xhr.send(null);
    if (xhr.status !== 200 && xhr.status !== 0) throw "XMLHttpRequest failed, status code " + xhr.status;
    return xhr.responseText
  };
  var isDOMPresent = "document" in this && !("fake" in this.document);
  document.head = document.head || document.getElementsByTagName("head")[0];

  function setupTypedArray(name, fallback) {
    if (name in window) return window[name];
    if (typeof window[fallback] === "function") return window[fallback];
    return function(obj) {
      if (obj instanceof Array) return obj;
      if (typeof obj === "number") {
        var arr = [];
        arr.length = obj;
        return arr
      }
    }
  }
  if (document.documentMode >= 9 && !document.doctype) throw "The doctype directive is missing. The recommended doctype in Internet Explorer is the HTML5 doctype: <!DOCTYPE html>";
  var Float32Array = setupTypedArray("Float32Array", "WebGLFloatArray"),
    Int32Array = setupTypedArray("Int32Array", "WebGLIntArray"),
    Uint16Array = setupTypedArray("Uint16Array", "WebGLUnsignedShortArray"),
    Uint8Array = setupTypedArray("Uint8Array", "WebGLUnsignedByteArray");
  var PConstants = {
    X: 0,
    Y: 1,
    Z: 2,
    R: 3,
    G: 4,
    B: 5,
    A: 6,
    U: 7,
    V: 8,
    NX: 9,
    NY: 10,
    NZ: 11,
    EDGE: 12,
    SR: 13,
    SG: 14,
    SB: 15,
    SA: 16,
    SW: 17,
    TX: 18,
    TY: 19,
    TZ: 20,
    VX: 21,
    VY: 22,
    VZ: 23,
    VW: 24,
    AR: 25,
    AG: 26,
    AB: 27,
    DR: 3,
    DG: 4,
    DB: 5,
    DA: 6,
    SPR: 28,
    SPG: 29,
    SPB: 30,
    SHINE: 31,
    ER: 32,
    EG: 33,
    EB: 34,
    BEEN_LIT: 35,
    VERTEX_FIELD_COUNT: 36,
    P2D: 1,
    JAVA2D: 1,
    WEBGL: 2,
    P3D: 2,
    OPENGL: 2,
    PDF: 0,
    DXF: 0,
    OTHER: 0,
    WINDOWS: 1,
    MAXOSX: 2,
    LINUX: 3,
    EPSILON: 1.0E-4,
    MAX_FLOAT: 3.4028235E38,
    MIN_FLOAT: -3.4028235E38,
    MAX_INT: 2147483647,
    MIN_INT: -2147483648,
    PI: Math.PI,
    TWO_PI: 2 * Math.PI,
    HALF_PI: Math.PI / 2,
    THIRD_PI: Math.PI / 3,
    QUARTER_PI: Math.PI / 4,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    WHITESPACE: " \t\n\r\u000c\u00a0",
    RGB: 1,
    ARGB: 2,
    HSB: 3,
    ALPHA: 4,
    CMYK: 5,
    TIFF: 0,
    TARGA: 1,
    JPEG: 2,
    GIF: 3,
    BLUR: 11,
    GRAY: 12,
    INVERT: 13,
    OPAQUE: 14,
    POSTERIZE: 15,
    THRESHOLD: 16,
    ERODE: 17,
    DILATE: 18,
    REPLACE: 0,
    BLEND: 1 << 0,
    ADD: 1 << 1,
    SUBTRACT: 1 << 2,
    LIGHTEST: 1 << 3,
    DARKEST: 1 << 4,
    DIFFERENCE: 1 << 5,
    EXCLUSION: 1 << 6,
    MULTIPLY: 1 << 7,
    SCREEN: 1 << 8,
    OVERLAY: 1 << 9,
    HARD_LIGHT: 1 << 10,
    SOFT_LIGHT: 1 << 11,
    DODGE: 1 << 12,
    BURN: 1 << 13,
    ALPHA_MASK: 4278190080,
    RED_MASK: 16711680,
    GREEN_MASK: 65280,
    BLUE_MASK: 255,
    CUSTOM: 0,
    ORTHOGRAPHIC: 2,
    PERSPECTIVE: 3,
    POINT: 2,
    POINTS: 2,
    LINE: 4,
    LINES: 4,
    TRIANGLE: 8,
    TRIANGLES: 9,
    TRIANGLE_STRIP: 10,
    TRIANGLE_FAN: 11,
    QUAD: 16,
    QUADS: 16,
    QUAD_STRIP: 17,
    POLYGON: 20,
    PATH: 21,
    RECT: 30,
    ELLIPSE: 31,
    ARC: 32,
    SPHERE: 40,
    BOX: 41,
    GROUP: 0,
    PRIMITIVE: 1,
    GEOMETRY: 3,
    VERTEX: 0,
    BEZIER_VERTEX: 1,
    CURVE_VERTEX: 2,
    BREAK: 3,
    CLOSESHAPE: 4,
    OPEN: 1,
    CLOSE: 2,
    CORNER: 0,
    CORNERS: 1,
    RADIUS: 2,
    CENTER_RADIUS: 2,
    CENTER: 3,
    DIAMETER: 3,
    CENTER_DIAMETER: 3,
    BASELINE: 0,
    TOP: 101,
    BOTTOM: 102,
    NORMAL: 1,
    NORMALIZED: 1,
    IMAGE: 2,
    MODEL: 4,
    SHAPE: 5,
    SQUARE: "butt",
    ROUND: "round",
    PROJECT: "square",
    MITER: "miter",
    BEVEL: "bevel",
    AMBIENT: 0,
    DIRECTIONAL: 1,
    SPOT: 3,
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 10,
    RETURN: 13,
    ESC: 27,
    DELETE: 127,
    CODED: 65535,
    SHIFT: 16,
    CONTROL: 17,
    ALT: 18,
    CAPSLK: 20,
    PGUP: 33,
    PGDN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUMLK: 144,
    META: 157,
    INSERT: 155,
    ARROW: "default",
    CROSS: "crosshair",
    HAND: "pointer",
    MOVE: "move",
    TEXT: "text",
    WAIT: "wait",
    NOCURSOR: "url('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), auto",
    DISABLE_OPENGL_2X_SMOOTH: 1,
    ENABLE_OPENGL_2X_SMOOTH: -1,
    ENABLE_OPENGL_4X_SMOOTH: 2,
    ENABLE_NATIVE_FONTS: 3,
    DISABLE_DEPTH_TEST: 4,
    ENABLE_DEPTH_TEST: -4,
    ENABLE_DEPTH_SORT: 5,
    DISABLE_DEPTH_SORT: -5,
    DISABLE_OPENGL_ERROR_REPORT: 6,
    ENABLE_OPENGL_ERROR_REPORT: -6,
    ENABLE_ACCURATE_TEXTURES: 7,
    DISABLE_ACCURATE_TEXTURES: -7,
    HINT_COUNT: 10,
    SINCOS_LENGTH: 720,
    PRECISIONB: 15,
    PRECISIONF: 1 << 15,
    PREC_MAXVAL: (1 << 15) - 1,
    PREC_ALPHA_SHIFT: 24 - 15,
    PREC_RED_SHIFT: 16 - 15,
    NORMAL_MODE_AUTO: 0,
    NORMAL_MODE_SHAPE: 1,
    NORMAL_MODE_VERTEX: 2,
    MAX_LIGHTS: 8
  };

  function virtHashCode(obj) {
    if (typeof obj === "string") {
      var hash = 0;
      for (var i = 0; i < obj.length; ++i) hash = hash * 31 + obj.charCodeAt(i) & 4294967295;
      return hash
    }
    if (typeof obj !== "object") return obj & 4294967295;
    if (obj.hashCode instanceof Function) return obj.hashCode();
    if (obj.$id === undef) obj.$id = Math.floor(Math.random() * 65536) - 32768 << 16 | Math.floor(Math.random() * 65536);
    return obj.$id
  }
  function virtEquals(obj, other) {
    if (obj === null || other === null) return obj === null && other === null;
    if (typeof obj === "string") return obj === other;
    if (typeof obj !== "object") return obj === other;
    if (obj.equals instanceof Function) return obj.equals(other);
    return obj === other
  }
  var ObjectIterator = function(obj) {
    if (obj.iterator instanceof
    Function) return obj.iterator();
    if (obj instanceof Array) {
      var index = -1;
      this.hasNext = function() {
        return ++index < obj.length
      };
      this.next = function() {
        return obj[index]
      }
    } else throw "Unable to iterate: " + obj;
  };
  var ArrayList = function() {
    function Iterator(array) {
      var index = 0;
      this.hasNext = function() {
        return index < array.length
      };
      this.next = function() {
        return array[index++]
      };
      this.remove = function() {
        array.splice(index, 1)
      }
    }
    function ArrayList(a) {
      var array;
      if (a instanceof ArrayList) array = a.toArray();
      else {
        array = [];
        if (typeof a === "number") array.length = a > 0 ? a : 0
      }
      this.get = function(i) {
        return array[i]
      };
      this.contains = function(item) {
        return this.indexOf(item) > -1
      };
      this.indexOf = function(item) {
        for (var i = 0, len = array.length; i < len; ++i) if (virtEquals(item, array[i])) return i;
        return -1
      };
      this.lastIndexOf = function(item) {
        for (var i = array.length - 1; i >= 0; --i) if (virtEquals(item, array[i])) return i;
        return -1
      };
      this.add = function() {
        if (arguments.length === 1) array.push(arguments[0]);
        else if (arguments.length === 2) {
          var arg0 = arguments[0];
          if (typeof arg0 === "number") if (arg0 >= 0 && arg0 <= array.length) array.splice(arg0, 0, arguments[1]);
          else throw arg0 + " is not a valid index";
          else throw typeof arg0 + " is not a number";
        } else throw "Please use the proper number of parameters.";
      };
      this.addAll = function(arg1, arg2) {
        var it;
        if (typeof arg1 === "number") {
          if (arg1 < 0 || arg1 > array.length) throw "Index out of bounds for addAll: " + arg1 + " greater or equal than " + array.length;
          it = new ObjectIterator(arg2);
          while (it.hasNext()) array.splice(arg1++, 0, it.next())
        } else {
          it = new ObjectIterator(arg1);
          while (it.hasNext()) array.push(it.next())
        }
      };
      this.set = function() {
        if (arguments.length === 2) {
          var arg0 = arguments[0];
          if (typeof arg0 === "number") if (arg0 >= 0 && arg0 < array.length) array.splice(arg0, 1, arguments[1]);
          else throw arg0 + " is not a valid index.";
          else throw typeof arg0 + " is not a number";
        } else throw "Please use the proper number of parameters.";
      };
      this.size = function() {
        return array.length
      };
      this.clear = function() {
        array.length = 0
      };
      this.remove = function(item) {
        if (typeof item === "number") return array.splice(item, 1)[0];
        item = this.indexOf(item);
        if (item > -1) {
          array.splice(item, 1);
          return true
        }
        return false
      };
      this.removeAll = function(c) {
        var i, x, item, newList = new ArrayList;
        newList.addAll(this);
        this.clear();
        for (i = 0, x = 0; i < newList.size(); i++) {
          item = newList.get(i);
          if (!c.contains(item)) this.add(x++, item)
        }
        if (this.size() < newList.size()) return true;
        return false
      };
      this.isEmpty = function() {
        return !array.length
      };
      this.clone = function() {
        return new ArrayList(this)
      };
      this.toArray = function() {
        return array.slice(0)
      };
      this.iterator = function() {
        return new Iterator(array)
      }
    }
    return ArrayList
  }();
  var HashMap = function() {
    function HashMap() {
      if (arguments.length === 1 && arguments[0] instanceof HashMap) return arguments[0].clone();
      var initialCapacity = arguments.length > 0 ? arguments[0] : 16;
      var loadFactor = arguments.length > 1 ? arguments[1] : 0.75;
      var buckets = [];
      buckets.length = initialCapacity;
      var count = 0;
      var hashMap = this;

      function getBucketIndex(key) {
        var index = virtHashCode(key) % buckets.length;
        return index < 0 ? buckets.length + index : index
      }
      function ensureLoad() {
        if (count <= loadFactor * buckets.length) return;
        var allEntries = [];
        for (var i = 0; i < buckets.length; ++i) if (buckets[i] !== undef) allEntries = allEntries.concat(buckets[i]);
        var newBucketsLength = buckets.length * 2;
        buckets = [];
        buckets.length = newBucketsLength;
        for (var j = 0; j < allEntries.length; ++j) {
          var index = getBucketIndex(allEntries[j].key);
          var bucket = buckets[index];
          if (bucket === undef) buckets[index] = bucket = [];
          bucket.push(allEntries[j])
        }
      }
      function Iterator(conversion, removeItem) {
        var bucketIndex = 0;
        var itemIndex = -1;
        var endOfBuckets = false;
        var currentItem;

        function findNext() {
          while (!endOfBuckets) {
            ++itemIndex;
            if (bucketIndex >= buckets.length) endOfBuckets = true;
            else if (buckets[bucketIndex] === undef || itemIndex >= buckets[bucketIndex].length) {
              itemIndex = -1;
              ++bucketIndex
            } else return
          }
        }
        this.hasNext = function() {
          return !endOfBuckets
        };
        this.next = function() {
          currentItem = conversion(buckets[bucketIndex][itemIndex]);
          findNext();
          return currentItem
        };
        this.remove = function() {
          if (currentItem !== undef) {
            removeItem(currentItem);
            --itemIndex;
            findNext()
          }
        };
        findNext()
      }
      function Set(conversion, isIn, removeItem) {
        this.clear = function() {
          hashMap.clear()
        };
        this.contains = function(o) {
          return isIn(o)
        };
        this.containsAll = function(o) {
          var it = o.iterator();
          while (it.hasNext()) if (!this.contains(it.next())) return false;
          return true
        };
        this.isEmpty = function() {
          return hashMap.isEmpty()
        };
        this.iterator = function() {
          return new Iterator(conversion, removeItem)
        };
        this.remove = function(o) {
          if (this.contains(o)) {
            removeItem(o);
            return true
          }
          return false
        };
        this.removeAll = function(c) {
          var it = c.iterator();
          var changed = false;
          while (it.hasNext()) {
            var item = it.next();
            if (this.contains(item)) {
              removeItem(item);
              changed = true
            }
          }
          return true
        };
        this.retainAll = function(c) {
          var it = this.iterator();
          var toRemove = [];
          while (it.hasNext()) {
            var entry = it.next();
            if (!c.contains(entry)) toRemove.push(entry)
          }
          for (var i = 0; i < toRemove.length; ++i) removeItem(toRemove[i]);
          return toRemove.length > 0
        };
        this.size = function() {
          return hashMap.size()
        };
        this.toArray = function() {
          var result = [];
          var it = this.iterator();
          while (it.hasNext()) result.push(it.next());
          return result
        }
      }
      function Entry(pair) {
        this._isIn = function(map) {
          return map === hashMap && pair.removed === undef
        };
        this.equals = function(o) {
          return virtEquals(pair.key, o.getKey())
        };
        this.getKey = function() {
          return pair.key
        };
        this.getValue = function() {
          return pair.value
        };
        this.hashCode = function(o) {
          return virtHashCode(pair.key)
        };
        this.setValue = function(value) {
          var old = pair.value;
          pair.value = value;
          return old
        }
      }
      this.clear = function() {
        count = 0;
        buckets = [];
        buckets.length = initialCapacity
      };
      this.clone = function() {
        var map = new HashMap;
        map.putAll(this);
        return map
      };
      this.containsKey = function(key) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) return false;
        for (var i = 0; i < bucket.length; ++i) if (virtEquals(bucket[i].key, key)) return true;
        return false
      };
      this.containsValue = function(value) {
        for (var i = 0; i < buckets.length; ++i) {
          var bucket = buckets[i];
          if (bucket === undef) continue;
          for (var j = 0; j < bucket.length; ++j) if (virtEquals(bucket[j].value, value)) return true
        }
        return false
      };
      this.entrySet = function() {
        return new Set(function(pair) {
          return new Entry(pair)
        },


        function(pair) {
          return pair instanceof Entry && pair._isIn(hashMap)
        },


        function(pair) {
          return hashMap.remove(pair.getKey())
        })
      };
      this.get = function(key) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) return null;
        for (var i = 0; i < bucket.length; ++i) if (virtEquals(bucket[i].key, key)) return bucket[i].value;
        return null
      };
      this.isEmpty = function() {
        return count === 0
      };
      this.keySet = function() {
        return new Set(function(pair) {
          return pair.key
        },


        function(key) {
          return hashMap.containsKey(key)
        },


        function(key) {
          return hashMap.remove(key)
        })
      };
      this.values = function() {
        return new Set(function(pair) {
          return pair.value
        },


        function(value) {
          return hashMap.containsValue(value)
        },

        function(value) {
          return hashMap.removeByValue(value)
        })
      };
      this.put = function(key, value) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) {
          ++count;
          buckets[index] = [{
            key: key,
            value: value
          }];
          ensureLoad();
          return null
        }
        for (var i = 0; i < bucket.length; ++i) if (virtEquals(bucket[i].key, key)) {
          var previous = bucket[i].value;
          bucket[i].value = value;
          return previous
        }++count;
        bucket.push({
          key: key,
          value: value
        });
        ensureLoad();
        return null
      };
      this.putAll = function(m) {
        var it = m.entrySet().iterator();
        while (it.hasNext()) {
          var entry = it.next();
          this.put(entry.getKey(), entry.getValue())
        }
      };
      this.remove = function(key) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) return null;
        for (var i = 0; i < bucket.length; ++i) if (virtEquals(bucket[i].key, key)) {
          --count;
          var previous = bucket[i].value;
          bucket[i].removed = true;
          if (bucket.length > 1) bucket.splice(i, 1);
          else buckets[index] = undef;
          return previous
        }
        return null
      };
      this.removeByValue = function(value) {
        var bucket, i, ilen, pair;
        for (bucket in buckets) if (buckets.hasOwnProperty(bucket)) for (i = 0, ilen = buckets[bucket].length; i < ilen; i++) {
          pair = buckets[bucket][i];
          if (pair.value === value) {
            buckets[bucket].splice(i, 1);
            return true
          }
        }
        return false
      };
      this.size = function() {
        return count
      }
    }
    return HashMap
  }();
  var PVector = function() {
    function PVector(x, y, z) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0
    }
    PVector.dist = function(v1, v2) {
      return v1.dist(v2)
    };
    PVector.dot = function(v1, v2) {
      return v1.dot(v2)
    };
    PVector.cross = function(v1, v2) {
      return v1.cross(v2)
    };
    PVector.angleBetween = function(v1, v2) {
      return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()))
    };
    PVector.prototype = {
      set: function(v, y, z) {
        if (arguments.length === 1) this.set(v.x || v[0] || 0, v.y || v[1] || 0, v.z || v[2] || 0);
        else {
          this.x = v;
          this.y = y;
          this.z = z
        }
      },
      get: function() {
        return new PVector(this.x, this.y, this.z)
      },
      mag: function() {
        var x = this.x,
          y = this.y,
          z = this.z;
        return Math.sqrt(x * x + y * y + z * z)
      },
      add: function(v, y, z) {
        if (arguments.length === 1) {
          this.x += v.x;
          this.y += v.y;
          this.z += v.z
        } else {
          this.x += v;
          this.y += y;
          this.z += z
        }
      },
      sub: function(v, y, z) {
        if (arguments.length === 1) {
          this.x -= v.x;
          this.y -= v.y;
          this.z -= v.z
        } else {
          this.x -= v;
          this.y -= y;
          this.z -= z
        }
      },
      mult: function(v) {
        if (typeof v === "number") {
          this.x *= v;
          this.y *= v;
          this.z *= v
        } else {
          this.x *= v.x;
          this.y *= v.y;
          this.z *= v.z
        }
      },
      div: function(v) {
        if (typeof v === "number") {
          this.x /= v;
          this.y /= v;
          this.z /= v
        } else {
          this.x /= v.x;
          this.y /= v.y;
          this.z /= v.z
        }
      },
      dist: function(v) {
        var dx = this.x - v.x,
          dy = this.y - v.y,
          dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
      },
      dot: function(v, y, z) {
        if (arguments.length === 1) return this.x * v.x + this.y * v.y + this.z * v.z;
        return this.x * v + this.y * y + this.z * z
      },
      cross: function(v) {
        var x = this.x,
          y = this.y,
          z = this.z;
        return new PVector(y * v.z - v.y * z, z * v.x - v.z * x, x * v.y - v.x * y)
      },
      normalize: function() {
        var m = this.mag();
        if (m > 0) this.div(m)
      },
      limit: function(high) {
        if (this.mag() > high) {
          this.normalize();
          this.mult(high)
        }
      },
      heading2D: function() {
        return -Math.atan2(-this.y, this.x)
      },
      toString: function() {
        return "[" + this.x + ", " + this.y + ", " + this.z + "]"
      },
      array: function() {
        return [this.x, this.y, this.z]
      }
    };

    function createPVectorMethod(method) {
      return function(v1, v2) {
        var v = v1.get();
        v[method](v2);
        return v
      }
    }
    for (var method in PVector.prototype) if (PVector.prototype.hasOwnProperty(method) && !PVector.hasOwnProperty(method)) PVector[method] = createPVectorMethod(method);
    return PVector
  }();

  function DefaultScope() {}
  DefaultScope.prototype = PConstants;
  var defaultScope = new DefaultScope;
  defaultScope.ArrayList = ArrayList;
  defaultScope.HashMap = HashMap;
  defaultScope.PVector = PVector;
  defaultScope.ObjectIterator = ObjectIterator;
  defaultScope.PConstants = PConstants;
  defaultScope.defineProperty = function(obj, name, desc) {
    if ("defineProperty" in Object) Object.defineProperty(obj, name, desc);
    else {
      if (desc.hasOwnProperty("get")) obj.__defineGetter__(name, desc.get);
      if (desc.hasOwnProperty("set")) obj.__defineSetter__(name, desc.set)
    }
  };

  function overloadBaseClassFunction(object, name, basefn) {
    if (!object.hasOwnProperty(name) || typeof object[name] !== "function") {
      object[name] = basefn;
      return
    }
    var fn = object[name];
    if ("$overloads" in fn) {
      fn.$defaultOverload = basefn;
      return
    }
    if (! ("$overloads" in basefn) && fn.length === basefn.length) return;
    var overloads, defaultOverload;
    if ("$overloads" in basefn) {
      overloads = basefn.$overloads.slice(0);
      overloads[fn.length] = fn;
      defaultOverload = basefn.$defaultOverload
    } else {
      overloads = [];
      overloads[basefn.length] = basefn;
      overloads[fn.length] = fn;
      defaultOverload = fn
    }
    var hubfn = function() {
      var fn = hubfn.$overloads[arguments.length] || ("$methodArgsIndex" in hubfn && arguments.length > hubfn.$methodArgsIndex ? hubfn.$overloads[hubfn.$methodArgsIndex] : null) || hubfn.$defaultOverload;
      return fn.apply(this, arguments)
    };
    hubfn.$overloads = overloads;
    if ("$methodArgsIndex" in basefn) hubfn.$methodArgsIndex = basefn.$methodArgsIndex;
    hubfn.$defaultOverload = defaultOverload;
    hubfn.name = name;
    object[name] = hubfn
  }
  function extendClass(subClass, baseClass) {
    function extendGetterSetter(propertyName) {
      defaultScope.defineProperty(subClass, propertyName, {
        get: function() {
          return baseClass[propertyName]
        },
        set: function(v) {
          baseClass[propertyName] = v
        },
        enumerable: true
      })
    }
    var properties = [];
    for (var propertyName in baseClass) if (typeof baseClass[propertyName] === "function") overloadBaseClassFunction(subClass, propertyName, baseClass[propertyName]);
    else if (propertyName.charAt(0) !== "$" && !(propertyName in subClass)) properties.push(propertyName);
    while (properties.length > 0) extendGetterSetter(properties.shift());
    subClass.$super = baseClass
  }
  defaultScope.extendClassChain = function(base) {
    var path = [base];
    for (var self = base.$upcast; self; self = self.$upcast) {
      extendClass(self, base);
      path.push(self);
      base = self
    }
    while (path.length > 0) path.pop().$self = base
  };
  defaultScope.extendStaticMembers = function(derived, base) {
    extendClass(derived, base)
  };
  defaultScope.extendInterfaceMembers = function(derived, base) {
    extendClass(derived, base)
  };
  defaultScope.addMethod = function(object, name, fn, hasMethodArgs) {
    var existingfn = object[name];
    if (existingfn || hasMethodArgs) {
      var args = fn.length;
      if ("$overloads" in existingfn) existingfn.$overloads[args] = fn;
      else {
        var hubfn = function() {
          var fn = hubfn.$overloads[arguments.length] || ("$methodArgsIndex" in hubfn && arguments.length > hubfn.$methodArgsIndex ? hubfn.$overloads[hubfn.$methodArgsIndex] : null) || hubfn.$defaultOverload;
          return fn.apply(this, arguments)
        };
        var overloads = [];
        if (existingfn) overloads[existingfn.length] = existingfn;
        overloads[args] = fn;
        hubfn.$overloads = overloads;
        hubfn.$defaultOverload = existingfn || fn;
        if (hasMethodArgs) hubfn.$methodArgsIndex = args;
        hubfn.name = name;
        object[name] = hubfn
      }
    } else object[name] = fn
  };

  function isNumericalJavaType(type) {
    if (typeof type !== "string") return false;
    return ["byte", "int", "char", "color", "float", "long", "double"].indexOf(type) !== -1
  }
  defaultScope.createJavaArray = function(type, bounds) {
    var result = null,
      defaultValue = null;
    if (typeof type === "string") if (type === "boolean") defaultValue = false;
    else if (isNumericalJavaType(type)) defaultValue = 0;
    if (typeof bounds[0] === "number") {
      var itemsCount = 0 | bounds[0];
      if (bounds.length <= 1) {
        result = [];
        result.length = itemsCount;
        for (var i = 0; i < itemsCount; ++i) result[i] = defaultValue
      } else {
        result = [];
        var newBounds = bounds.slice(1);
        for (var j = 0; j < itemsCount; ++j) result.push(defaultScope.createJavaArray(type, newBounds))
      }
    }
    return result
  };
  var colors = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  };
  (function(Processing) {
    var unsupportedP5 = ("open() createOutput() createInput() BufferedReader selectFolder() " + "dataPath() createWriter() selectOutput() beginRecord() " + "saveStream() endRecord() selectInput() saveBytes() createReader() " + "beginRaw() endRaw() PrintWriter delay()").split(" "),
      count = unsupportedP5.length,
      prettyName, p5Name;

    function createUnsupportedFunc(n) {
      return function() {
        throw "Processing.js does not support " + n + ".";
      }
    }
    while (count--) {
      prettyName = unsupportedP5[count];
      p5Name = prettyName.replace("()", "");
      Processing[p5Name] = createUnsupportedFunc(prettyName)
    }
  })(defaultScope);
  defaultScope.defineProperty(defaultScope, "screenWidth", {
    get: function() {
      return window.innerWidth
    }
  });
  defaultScope.defineProperty(defaultScope, "screenHeight", {
    get: function() {
      return window.innerHeight
    }
  });
  defaultScope.defineProperty(defaultScope, "online", {
    get: function() {
      return true
    }
  });
  var processingInstances = [];
  var processingInstanceIds = {};
  var removeInstance = function(id) {
    processingInstances.splice(processingInstanceIds[id], 1);
    delete processingInstanceIds[id]
  };
  var addInstance = function(processing) {
    if (processing.externals.canvas.id === undef || !processing.externals.canvas.id.length) processing.externals.canvas.id = "__processing" + processingInstances.length;
    processingInstanceIds[processing.externals.canvas.id] = processingInstances.length;
    processingInstances.push(processing)
  };

  function computeFontMetrics(pfont) {
    var emQuad = 250,
      correctionFactor = pfont.size / emQuad,
      canvas = document.createElement("canvas");
    canvas.width = 2 * emQuad;
    canvas.height = 2 * emQuad;
    canvas.style.opacity = 0;
    var cfmFont = pfont.getCSSDefinition(emQuad + "px", "normal"),
      ctx = canvas.getContext("2d");
    ctx.font = cfmFont;
    var protrusions = "dbflkhyjqpg";
    canvas.width = ctx.measureText(protrusions).width;
    ctx.font = cfmFont;
    var leadDiv = document.createElement("div");
    leadDiv.style.position = "absolute";
    leadDiv.style.opacity = 0;
    leadDiv.style.fontFamily = '"' + pfont.name + '"';
    leadDiv.style.fontSize = emQuad + "px";
    leadDiv.innerHTML = protrusions + "<br/>" + protrusions;
    document.body.appendChild(leadDiv);
    var w = canvas.width,
      h = canvas.height,
      baseline = h / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "black";
    ctx.fillText(protrusions, 0, baseline);
    var pixelData = ctx.getImageData(0, 0, w, h).data;
    var i = 0,
      w4 = w * 4,
      len = pixelData.length;
    while (++i < len && pixelData[i] === 255) nop();
    var ascent = Math.round(i / w4);
    i = len - 1;
    while (--i > 0 && pixelData[i] === 255) nop();
    var descent = Math.round(i / w4);
    pfont.ascent = correctionFactor * (baseline - ascent);
    pfont.descent = correctionFactor * (descent - baseline);
    if (document.defaultView.getComputedStyle) {
      var leadDivHeight = document.defaultView.getComputedStyle(leadDiv, null).getPropertyValue("height");
      leadDivHeight = correctionFactor * leadDivHeight.replace("px", "");
      if (leadDivHeight >= pfont.size * 2) pfont.leading = Math.round(leadDivHeight / 2)
    }
    document.body.removeChild(leadDiv);
    if (pfont.caching) return ctx
  }
  function PFont(name, size) {
    if (name === undef) name = "";
    this.name = name;
    if (size === undef) size = 0;
    this.size = size;
    this.glyph = false;
    this.ascent = 0;
    this.descent = 0;
    this.leading = 1.2 * size;
    var illegalIndicator = name.indexOf(" Italic Bold");
    if (illegalIndicator !== -1) name = name.substring(0, illegalIndicator);
    this.style = "normal";
    var italicsIndicator = name.indexOf(" Italic");
    if (italicsIndicator !== -1) {
      name = name.substring(0, italicsIndicator);
      this.style = "italic"
    }
    this.weight = "normal";
    var boldIndicator = name.indexOf(" Bold");
    if (boldIndicator !== -1) {
      name = name.substring(0, boldIndicator);
      this.weight = "bold"
    }
    this.family = "sans-serif";
    if (name !== undef) switch (name) {
    case "sans-serif":
    case "serif":
    case "monospace":
    case "fantasy":
    case "cursive":
      this.family = name;
      break;
    default:
      this.family = '"' + name + '", sans-serif';
      break
    }
    this.context2d = computeFontMetrics(this);
    this.css = this.getCSSDefinition();
    if (this.context2d) this.context2d.font = this.css
  }
  PFont.prototype.caching = true;
  PFont.prototype.getCSSDefinition = function(fontSize, lineHeight) {
    if (fontSize === undef) fontSize = this.size + "px";
    if (lineHeight === undef) lineHeight = this.leading + "px";
    var components = [this.style, "normal", this.weight, fontSize + "/" + lineHeight, this.family];
    return components.join(" ")
  };
  PFont.prototype.measureTextWidth = function(string) {
    return this.context2d.measureText(string).width
  };
  PFont.prototype.measureTextWidthFallback = function(string) {
    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");
    ctx.font = this.css;
    return ctx.measureText(string).width
  };
  PFont.PFontCache = {
    length: 0
  };
  PFont.get = function(fontName, fontSize) {
    fontSize = (fontSize * 10 + 0.5 | 0) / 10;
    var cache = PFont.PFontCache,
      idx = fontName + "/" + fontSize;
    if (!cache[idx]) {
      cache[idx] = new PFont(fontName, fontSize);
      cache.length++;
      if (cache.length === 50) {
        PFont.prototype.measureTextWidth = PFont.prototype.measureTextWidthFallback;
        PFont.prototype.caching = false;
        var entry;
        for (entry in cache) if (entry !== "length") cache[entry].context2d = null;
        return new PFont(fontName, fontSize)
      }
      if (cache.length === 400) {
        PFont.PFontCache = {};
        PFont.get = PFont.getFallback;
        return new PFont(fontName, fontSize)
      }
    }
    return cache[idx]
  };
  PFont.getFallback = function(fontName, fontSize) {
    return new PFont(fontName, fontSize)
  };
  PFont.list = function() {
    return ["sans-serif", "serif", "monospace", "fantasy", "cursive"]
  };
  PFont.preloading = {
    template: {},
    initialized: false,
    initialize: function() {
      var generateTinyFont = function() {
        var encoded = "#E3KAI2wAgT1MvMg7Eo3VmNtYX7ABi3CxnbHlm" + "7Abw3kaGVhZ7ACs3OGhoZWE7A53CRobXR47AY3" + "AGbG9jYQ7G03Bm1heH7ABC3CBuYW1l7Ae3AgcG" + "9zd7AI3AE#B3AQ2kgTY18PPPUACwAg3ALSRoo3" + "#yld0xg32QAB77#E777773B#E3C#I#Q77773E#" + "Q7777777772CMAIw7AB77732B#M#Q3wAB#g3B#" + "E#E2BB//82BB////w#B7#gAEg3E77x2B32B#E#" + "Q#MTcBAQ32gAe#M#QQJ#E32M#QQJ#I#g32Q77#";
        var expand = function(input) {
          return "AAAAAAAA".substr(~~input ? 7 - input : 6)
        };
        return encoded.replace(/[#237]/g, expand)
      };
      var fontface = document.createElement("style");
      fontface.setAttribute("type", "text/css");
      fontface.innerHTML = "@font-face {\n" + '  font-family: "PjsEmptyFont";' + "\n" + "  src: url('data:application/x-font-ttf;base64," + generateTinyFont() + "')\n" + "       format('truetype');\n" + "}";
      document.head.appendChild(fontface);
      var element = document.createElement("span");
      element.style.cssText = 'position: absolute; top: 0; left: 0; opacity: 0; font-family: "PjsEmptyFont", fantasy;';
      element.innerHTML = "AAAAAAAA";
      document.body.appendChild(element);
      this.template = element;
      this.initialized = true
    },
    getElementWidth: function(element) {
      return document.defaultView.getComputedStyle(element, "").getPropertyValue("width")
    },
    timeAttempted: 0,
    pending: function(intervallength) {
      if (!this.initialized) this.initialize();
      var element, computedWidthFont, computedWidthRef = this.getElementWidth(this.template);
      for (var i = 0; i < this.fontList.length; i++) {
        element = this.fontList[i];
        computedWidthFont = this.getElementWidth(element);
        if (this.timeAttempted < 4E3 && computedWidthFont === computedWidthRef) {
          this.timeAttempted += intervallength;
          return true
        } else {
          document.body.removeChild(element);
          this.fontList.splice(i--, 1);
          this.timeAttempted = 0
        }
      }
      if (this.fontList.length === 0) return false;
      return true
    },
    fontList: [],
    addedList: {},
    add: function(fontSrc) {
      if (!this.initialized) this.initialize();
      var fontName = typeof fontSrc === "object" ? fontSrc.fontFace : fontSrc,
      fontUrl = typeof fontSrc === "object" ? fontSrc.url : fontSrc;
      if (this.addedList[fontName]) return;
      var style = document.createElement("style");
      style.setAttribute("type", "text/css");
      style.innerHTML = "@font-face{\n  font-family: '" + fontName + "';\n  src:  url('" + fontUrl + "');\n}\n";
      document.head.appendChild(style);
      this.addedList[fontName] = true;
      var element = document.createElement("span");
      element.style.cssText = "position: absolute; top: 0; left: 0; opacity: 0;";
      element.style.fontFamily = '"' + fontName + '", "PjsEmptyFont", fantasy';
      element.innerHTML = "AAAAAAAA";
      document.body.appendChild(element);
      this.fontList.push(element)
    }
  };
  defaultScope.PFont = PFont;
  var Processing = this.Processing = function(aCanvas, aCode) {
    if (! (this instanceof
    Processing)) throw "called Processing constructor as if it were a function: missing 'new'.";
    var curElement, pgraphicsMode = aCanvas === undef && aCode === undef;
    if (pgraphicsMode) curElement = document.createElement("canvas");
    else curElement = typeof aCanvas === "string" ? document.getElementById(aCanvas) : aCanvas;
    if (! (curElement instanceof HTMLCanvasElement)) throw "called Processing constructor without passing canvas element reference or id.";

    function unimplemented(s) {
      Processing.debug("Unimplemented - " + s)
    }
    var p = this;
    p.externals = {
      canvas: curElement,
      context: undef,
      sketch: undef
    };
    p.name = "Processing.js Instance";
    p.use3DContext = false;
    p.focused = false;
    p.breakShape = false;
    p.glyphTable = {};
    p.pmouseX = 0;
    p.pmouseY = 0;
    p.mouseX = 0;
    p.mouseY = 0;
    p.mouseButton = 0;
    p.mouseScroll = 0;
    p.mouseClicked = undef;
    p.mouseDragged = undef;
    p.mouseMoved = undef;
    p.mousePressed = undef;
    p.mouseReleased = undef;
    p.mouseScrolled = undef;
    p.mouseOver = undef;
    p.mouseOut = undef;
    p.touchStart = undef;
    p.touchEnd = undef;
    p.touchMove = undef;
    p.touchCancel = undef;
    p.key = undef;
    p.keyCode = undef;
    p.keyPressed = nop;
    p.keyReleased = nop;
    p.keyTyped = nop;
    p.draw = undef;
    p.setup = undef;
    p.__mousePressed = false;
    p.__keyPressed = false;
    p.__frameRate = 60;
    p.frameCount = 0;
    p.width = 100;
    p.height = 100;
    var curContext, curSketch, drawing, online = true,
      doFill = true,
      fillStyle = [1, 1, 1, 1],
      currentFillColor = 4294967295,
      isFillDirty = true,
      doStroke = true,
      strokeStyle = [0, 0, 0, 1],
      currentStrokeColor = 4278190080,
      isStrokeDirty = true,
      lineWidth = 1,
      loopStarted = false,
      renderSmooth = false,
      doLoop = true,
      looping = 0,
      curRectMode = 0,
      curEllipseMode = 3,
      normalX = 0,
      normalY = 0,
      normalZ = 0,
      normalMode = 0,
      curFrameRate = 60,
      curMsPerFrame = 1E3 / curFrameRate,
      curCursor = 'default',
      oldCursor = curElement.style.cursor,
      curShape = 20,
      curShapeCount = 0,
      curvePoints = [],
      curTightness = 0,
      curveDet = 20,
      curveInited = false,
      backgroundObj = -3355444,
      bezDetail = 20,
      colorModeA = 255,
      colorModeX = 255,
      colorModeY = 255,
      colorModeZ = 255,
      pathOpen = false,
      mouseDragging = false,
      pmouseXLastFrame = 0,
      pmouseYLastFrame = 0,
      curColorMode = 1,
      curTint = null,
      curTint3d = null,
      getLoaded = false,
      start = Date.now(),
      timeSinceLastFPS = start,
      framesSinceLastFPS = 0,
      textcanvas, curveBasisMatrix, curveToBezierMatrix, curveDrawMatrix, bezierDrawMatrix, bezierBasisInverse, bezierBasisMatrix, curContextCache = {
      attributes: {},
      locations: {}
    },
      programObject3D, programObject2D, programObjectUnlitShape, boxBuffer, boxNormBuffer, boxOutlineBuffer, rectBuffer, rectNormBuffer, sphereBuffer, lineBuffer, fillBuffer, fillColorBuffer, strokeColorBuffer, pointBuffer, shapeTexVBO, canTex, textTex, curTexture = {
      width: 0,
      height: 0
    },
      curTextureMode = 2,
      usingTexture = false,
      textBuffer, textureBuffer, indexBuffer, horizontalTextAlignment = 37,
      verticalTextAlignment = 0,
      textMode = 4,
      curFontName = "Arial",
      curTextSize = 12,
      curTextAscent = 9,
      curTextDescent = 2,
      curTextLeading = 14,
      curTextFont = PFont.get(curFontName, curTextSize),
      originalContext, proxyContext = null,
      isContextReplaced = false,
      setPixelsCached, maxPixelsCached = 1E3,
      pressedKeysMap = [],
      lastPressedKeyCode = null,
      codedKeys = [16,
      17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 144, 155, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 157];
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
      stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingLeft"], 10) || 0;
      stylePaddingTop = parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingTop"], 10) || 0;
      styleBorderLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)["borderLeftWidth"], 10) || 0;
      styleBorderTop = parseInt(document.defaultView.getComputedStyle(curElement, null)["borderTopWidth"], 10) || 0
    }
    var lightCount = 0;
    var sphereDetailV = 0,
      sphereDetailU = 0,
      sphereX = [],
      sphereY = [],
      sphereZ = [],
      sinLUT = new Float32Array(720),
      cosLUT = new Float32Array(720),
      sphereVerts, sphereNorms;
    var cam, cameraInv, modelView, modelViewInv, userMatrixStack, userReverseMatrixStack, inverseCopy, projection, manipulatingCamera = false,
      frustumMode = false,
      cameraFOV = 60 * (Math.PI / 180),
      cameraX = p.width / 2,
      cameraY = p.height / 2,
      cameraZ = cameraY / Math.tan(cameraFOV / 2),
      cameraNear = cameraZ / 10,
      cameraFar = cameraZ * 10,
      cameraAspect = p.width / p.height;
    var vertArray = [],
      curveVertArray = [],
      curveVertCount = 0,
      isCurve = false,
      isBezier = false,
      firstVert = true;
    var curShapeMode = 0;
    var styleArray = [];
    var boxVerts = new Float32Array([0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5,
      0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    var boxOutlineVerts = new Float32Array([0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5]);
    var boxNorms = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0,
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
    var rectVerts = new Float32Array([0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0]);
    var rectNorms = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
    var vertexShaderSrcUnlitShape = "varying vec4 vFrontColor;" + "attribute vec3 aVertex;" + "attribute vec4 aColor;" + "uniform mat4 uView;" + "uniform mat4 uProjection;" + "uniform float uPointSize;" + "void main(void) {" + "  vFrontColor = aColor;" + "  gl_PointSize = uPointSize;" + "  gl_Position = uProjection * uView * vec4(aVertex, 1.0);" + "}";
    var fragmentShaderSrcUnlitShape = "#ifdef GL_ES\n" + "precision highp float;\n" + "#endif\n" + "varying vec4 vFrontColor;" + "uniform bool uSmooth;" + "void main(void){" + "  if(uSmooth == true){" + "    float dist = distance(gl_PointCoord, vec2(0.5));" + "    if(dist > 0.5){" + "      discard;" + "    }" + "  }" + "  gl_FragColor = vFrontColor;" + "}";
    var vertexShaderSrc2D = "varying vec4 vFrontColor;" + "attribute vec3 aVertex;" + "attribute vec2 aTextureCoord;" + "uniform vec4 uColor;" + "uniform mat4 uModel;" + "uniform mat4 uView;" + "uniform mat4 uProjection;" + "uniform float uPointSize;" + "varying vec2 vTextureCoord;" + "void main(void) {" + "  gl_PointSize = uPointSize;" + "  vFrontColor = uColor;" + "  gl_Position = uProjection * uView * uModel * vec4(aVertex, 1.0);" + "  vTextureCoord = aTextureCoord;" + "}";
    var fragmentShaderSrc2D = "#ifdef GL_ES\n" + "precision highp float;\n" + "#endif\n" + "varying vec4 vFrontColor;" + "varying vec2 vTextureCoord;" + "uniform sampler2D uSampler;" + "uniform int uIsDrawingText;" + "uniform bool uSmooth;" + "void main(void){" + "  if(uSmooth == true){" + "    float dist = distance(gl_PointCoord, vec2(0.5));" + "    if(dist > 0.5){" + "      discard;" + "    }" + "  }" + "  if(uIsDrawingText == 1){" + "    float alpha = texture2D(uSampler, vTextureCoord).a;" + "    gl_FragColor = vec4(vFrontColor.rgb * alpha, alpha);" + "  }" + "  else{" + "    gl_FragColor = vFrontColor;" + "  }" + "}";
    var webglMaxTempsWorkaround = /Windows/.test(navigator.userAgent);
    var vertexShaderSrc3D = "varying vec4 vFrontColor;" + "attribute vec3 aVertex;" + "attribute vec3 aNormal;" + "attribute vec4 aColor;" + "attribute vec2 aTexture;" + "varying   vec2 vTexture;" + "uniform vec4 uColor;" + "uniform bool uUsingMat;" + "uniform vec3 uSpecular;" + "uniform vec3 uMaterialEmissive;" + "uniform vec3 uMaterialAmbient;" + "uniform vec3 uMaterialSpecular;" + "uniform float uShininess;" + "uniform mat4 uModel;" + "uniform mat4 uView;" + "uniform mat4 uProjection;" + "uniform mat4 uNormalTransform;" + "uniform int uLightCount;" + "uniform vec3 uFalloff;" + "struct Light {" + "  int type;" + "  vec3 color;" + "  vec3 position;" + "  vec3 direction;" + "  float angle;" + "  vec3 halfVector;" + "  float concentration;" + "};" + "uniform Light uLights0;" + "uniform Light uLights1;" + "uniform Light uLights2;" + "uniform Light uLights3;" + "uniform Light uLights4;" + "uniform Light uLights5;" + "uniform Light uLights6;" + "uniform Light uLights7;" + "Light getLight(int index){" + "  if(index == 0) return uLights0;" + "  if(index == 1) return uLights1;" + "  if(index == 2) return uLights2;" + "  if(index == 3) return uLights3;" + "  if(index == 4) return uLights4;" + "  if(index == 5) return uLights5;" + "  if(index == 6) return uLights6;" + "  return uLights7;" + "}" + "void AmbientLight( inout vec3 totalAmbient, in vec3 ecPos, in Light light ) {" + "  float d = length( light.position - ecPos );" + "  float attenuation = 1.0 / ( uFalloff[0] + ( uFalloff[1] * d ) + ( uFalloff[2] * d * d ));" + "  totalAmbient += light.color * attenuation;" + "}" + "void DirectionalLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" + "  float powerFactor = 0.0;" + "  float nDotVP = max(0.0, dot( vertNormal, normalize(-light.position) ));" + "  float nDotVH = max(0.0, dot( vertNormal, normalize(-light.position-normalize(ecPos) )));" + "  if( nDotVP != 0.0 ){" + "    powerFactor = pow( nDotVH, uShininess );" + "  }" + "  col += light.color * nDotVP;" + "  spec += uSpecular * powerFactor;" + "}" + "void PointLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" + "  float powerFactor;" + "   vec3 VP = light.position - ecPos;" + "  float d = length( VP ); " + "  VP = normalize( VP );" + "  float attenuation = 1.0 / ( uFalloff[0] + ( uFalloff[1] * d ) + ( uFalloff[2] * d * d ));" + "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" + "  vec3 halfVector = normalize( VP - normalize(ecPos) );" + "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" + "  if( nDotVP == 0.0 ) {" + "    powerFactor = 0.0;" + "  }" + "  else {" + "    powerFactor = pow( nDotHV, uShininess );" + "  }" + "  spec += uSpecular * powerFactor * attenuation;" + "  col += light.color * nDotVP * attenuation;" + "}" + "void SpotLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" + "  float spotAttenuation;" + "  float powerFactor = 0.0;" + "  vec3 VP = light.position - ecPos;" + "  vec3 ldir = normalize( -light.direction );" + "  float d = length( VP );" + "  VP = normalize( VP );" + "  float attenuation = 1.0 / ( uFalloff[0] + ( uFalloff[1] * d ) + ( uFalloff[2] * d * d ) );" + "  float spotDot = dot( VP, ldir );" + (webglMaxTempsWorkaround ? "  spotAttenuation = 1.0; " : "  if( spotDot > cos( light.angle ) ) {" + "    spotAttenuation = pow( spotDot, light.concentration );" + "  }" + "  else{" + "    spotAttenuation = 0.0;" + "  }" + "  attenuation *= spotAttenuation;" + "") + "  float nDotVP = max( 0.0, dot( vertNormal, VP ) );" + "  vec3 halfVector = normalize( VP - normalize(ecPos) );" + "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ) );" + "  if( nDotVP != 0.0 ) {" + "    powerFactor = pow( nDotHV, uShininess );" + "  }" + "  spec += uSpecular * powerFactor * attenuation;" + "  col += light.color * nDotVP * attenuation;" + "}" + "void main(void) {" + "  vec3 finalAmbient = vec3( 0.0 );" + "  vec3 finalDiffuse = vec3( 0.0 );" + "  vec3 finalSpecular = vec3( 0.0 );" + "  vec4 col = uColor;" + "  if ( uColor[0] == -1.0 ){" + "    col = aColor;" + "  }" + "  vec3 norm = normalize(vec3( uNormalTransform * vec4( aNormal, 0.0 ) ));" + "  vec4 ecPos4 = uView * uModel * vec4(aVertex, 1.0);" + "  vec3 ecPos = (vec3(ecPos4))/ecPos4.w;" + "  if( uLightCount == 0 ) {" + "    vFrontColor = col + vec4(uMaterialSpecular, 1.0);" + "  }" + "  else {" + "    for( int i = 0; i < 8; i++ ) {" + "      Light l = getLight(i);" + "      if( i >= uLightCount ){" + "        break;" + "      }" + "      if( l.type == 0 ) {" + "        AmbientLight( finalAmbient, ecPos, l );" + "      }" + "      else if( l.type == 1 ) {" + "        DirectionalLight( finalDiffuse, finalSpecular, norm, ecPos, l );" + "      }" + "      else if( l.type == 2 ) {" + "        PointLight( finalDiffuse, finalSpecular, norm, ecPos, l );" + "      }" + "      else {" + "        SpotLight( finalDiffuse, finalSpecular, norm, ecPos, l );" + "      }" + "    }" + "   if( uUsingMat == false ) {" + "     vFrontColor = vec4(" + "       vec3( col ) * finalAmbient +" + "       vec3( col ) * finalDiffuse +" + "       vec3( col ) * finalSpecular," + "       col[3] );" + "   }" + "   else{" + "     vFrontColor = vec4( " + "       uMaterialEmissive + " + "       (vec3(col) * uMaterialAmbient * finalAmbient ) + " + "       (vec3(col) * finalDiffuse) + " + "       (uMaterialSpecular * finalSpecular), " + "       col[3] );" + "    }" + "  }" + "  vTexture.xy = aTexture.xy;" + "  gl_Position = uProjection * uView * uModel * vec4( aVertex, 1.0 );" + "}";
    var fragmentShaderSrc3D = "#ifdef GL_ES\n" + "precision highp float;\n" + "#endif\n" + "varying vec4 vFrontColor;" + "uniform sampler2D uSampler;" + "uniform bool uUsingTexture;" + "varying vec2 vTexture;" + "void main(void){" + "  if( uUsingTexture ){" + "    gl_FragColor = vec4(texture2D(uSampler, vTexture.xy)) * vFrontColor;" + "  }" + "  else{" + "    gl_FragColor = vFrontColor;" + "  }" + "}";

    function uniformf(cacheId, programObj, varName, varValue) {
      var varLocation = curContextCache.locations[cacheId];
      if (varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation
      }
      if (varLocation !== null) if (varValue.length === 4) curContext.uniform4fv(varLocation, varValue);
      else if (varValue.length === 3) curContext.uniform3fv(varLocation, varValue);
      else if (varValue.length === 2) curContext.uniform2fv(varLocation, varValue);
      else curContext.uniform1f(varLocation, varValue)
    }
    function uniformi(cacheId, programObj, varName, varValue) {
      var varLocation = curContextCache.locations[cacheId];
      if (varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation
      }
      if (varLocation !== null) if (varValue.length === 4) curContext.uniform4iv(varLocation, varValue);
      else if (varValue.length === 3) curContext.uniform3iv(varLocation, varValue);
      else if (varValue.length === 2) curContext.uniform2iv(varLocation, varValue);
      else curContext.uniform1i(varLocation, varValue)
    }
    function uniformMatrix(cacheId, programObj, varName, transpose, matrix) {
      var varLocation = curContextCache.locations[cacheId];
      if (varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation
      }
      if (varLocation !== -1) if (matrix.length === 16) curContext.uniformMatrix4fv(varLocation, transpose, matrix);
      else if (matrix.length === 9) curContext.uniformMatrix3fv(varLocation, transpose, matrix);
      else curContext.uniformMatrix2fv(varLocation, transpose, matrix)
    }
    function vertexAttribPointer(cacheId, programObj, varName, size, VBO) {
      var varLocation = curContextCache.attributes[cacheId];
      if (varLocation === undef) {
        varLocation = curContext.getAttribLocation(programObj, varName);
        curContextCache.attributes[cacheId] = varLocation
      }
      if (varLocation !== -1) {
        curContext.bindBuffer(curContext.ARRAY_BUFFER, VBO);
        curContext.vertexAttribPointer(varLocation, size, curContext.FLOAT, false, 0, 0);
        curContext.enableVertexAttribArray(varLocation)
      }
    }
    function disableVertexAttribPointer(cacheId, programObj, varName) {
      var varLocation = curContextCache.attributes[cacheId];
      if (varLocation === undef) {
        varLocation = curContext.getAttribLocation(programObj, varName);
        curContextCache.attributes[cacheId] = varLocation
      }
      if (varLocation !== -1) curContext.disableVertexAttribArray(varLocation)
    }
    var createProgramObject = function(curContext, vetexShaderSource, fragmentShaderSource) {
      var vertexShaderObject = curContext.createShader(curContext.VERTEX_SHADER);
      curContext.shaderSource(vertexShaderObject, vetexShaderSource);
      curContext.compileShader(vertexShaderObject);
      if (!curContext.getShaderParameter(vertexShaderObject, curContext.COMPILE_STATUS)) throw curContext.getShaderInfoLog(vertexShaderObject);
      var fragmentShaderObject = curContext.createShader(curContext.FRAGMENT_SHADER);
      curContext.shaderSource(fragmentShaderObject, fragmentShaderSource);
      curContext.compileShader(fragmentShaderObject);
      if (!curContext.getShaderParameter(fragmentShaderObject, curContext.COMPILE_STATUS)) throw curContext.getShaderInfoLog(fragmentShaderObject);
      var programObject = curContext.createProgram();
      curContext.attachShader(programObject, vertexShaderObject);
      curContext.attachShader(programObject, fragmentShaderObject);
      curContext.linkProgram(programObject);
      if (!curContext.getProgramParameter(programObject, curContext.LINK_STATUS)) throw "Error linking shaders.";
      return programObject
    };
    var imageModeCorner = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: w,
        h: h
      }
    };
    var imageModeConvert = imageModeCorner;
    var imageModeCorners = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: whAreSizes ? w : w - x,
        h: whAreSizes ? h : h - y
      }
    };
    var imageModeCenter = function(x, y, w, h, whAreSizes) {
      return {
        x: x - w / 2,
        y: y - h / 2,
        w: w,
        h: h
      }
    };
    var DrawingShared = function() {};
    var Drawing2D = function() {};
    var Drawing3D = function() {};
    var DrawingPre = function() {};
    Drawing2D.prototype = new DrawingShared;
    Drawing2D.prototype.constructor = Drawing2D;
    Drawing3D.prototype = new DrawingShared;
    Drawing3D.prototype.constructor = Drawing3D;
    DrawingPre.prototype = new DrawingShared;
    DrawingPre.prototype.constructor = DrawingPre;
    DrawingShared.prototype.a3DOnlyFunction = nop;
    var charMap = {};
    var Char = p.Character = function(chr) {
      if (typeof chr === "string" && chr.length === 1) this.code = chr.charCodeAt(0);
      else if (typeof chr === "number") this.code = chr;
      else if (chr instanceof Char) this.code = chr;
      else this.code = NaN;
      return charMap[this.code] === undef ? charMap[this.code] = this : charMap[this.code]
    };
    Char.prototype.toString = function() {
      return String.fromCharCode(this.code)
    };
    Char.prototype.valueOf = function() {
      return this.code
    };
    var PShape = p.PShape = function(family) {
      this.family = family || 0;
      this.visible = true;
      this.style = true;
      this.children = [];
      this.nameTable = [];
      this.params = [];
      this.name = "";
      this.image = null;
      this.matrix = null;
      this.kind = null;
      this.close = null;
      this.width = null;
      this.height = null;
      this.parent = null
    };
    PShape.prototype = {
      isVisible: function() {
        return this.visible
      },
      setVisible: function(visible) {
        this.visible = visible
      },
      disableStyle: function() {
        this.style = false;
        for (var i = 0, j = this.children.length; i < j; i++) this.children[i].disableStyle()
      },
      enableStyle: function() {
        this.style = true;
        for (var i = 0, j = this.children.length; i < j; i++) this.children[i].enableStyle()
      },
      getFamily: function() {
        return this.family
      },
      getWidth: function() {
        return this.width
      },
      getHeight: function() {
        return this.height
      },
      setName: function(name) {
        this.name = name
      },
      getName: function() {
        return this.name
      },
      draw: function(renderContext) {
        renderContext = renderContext || p;
        if (this.visible) {
          this.pre(renderContext);
          this.drawImpl(renderContext);
          this.post(renderContext)
        }
      },
      drawImpl: function(renderContext) {
        if (this.family === 0) this.drawGroup(renderContext);
        else if (this.family === 1) this.drawPrimitive(renderContext);
        else if (this.family === 3) this.drawGeometry(renderContext);
        else if (this.family === 21) this.drawPath(renderContext)
      },
      drawPath: function(renderContext) {
        var i, j;
        if (this.vertices.length === 0) return;
        renderContext.beginShape();
        if (this.vertexCodes.length === 0) if (this.vertices[0].length === 2) for (i = 0, j = this.vertices.length; i < j; i++) renderContext.vertex(this.vertices[i][0], this.vertices[i][1]);
        else for (i = 0, j = this.vertices.length; i < j; i++) renderContext.vertex(this.vertices[i][0], this.vertices[i][1], this.vertices[i][2]);
        else {
          var index = 0;
          if (this.vertices[0].length === 2) for (i = 0, j = this.vertexCodes.length; i < j; i++) if (this.vertexCodes[i] === 0) {
            renderContext.vertex(this.vertices[index][0], this.vertices[index][1], this.vertices[index]["moveTo"]);
            renderContext.breakShape = false;
            index++
          } else if (this.vertexCodes[i] === 1) {
            renderContext.bezierVertex(this.vertices[index + 0][0], this.vertices[index + 0][1], this.vertices[index + 1][0], this.vertices[index + 1][1], this.vertices[index + 2][0], this.vertices[index + 2][1]);
            index += 3
          } else if (this.vertexCodes[i] === 2) {
            renderContext.curveVertex(this.vertices[index][0], this.vertices[index][1]);
            index++
          } else {
            if (this.vertexCodes[i] === 3) renderContext.breakShape = true
          } else for (i = 0, j = this.vertexCodes.length; i < j; i++) if (this.vertexCodes[i] === 0) {
            renderContext.vertex(this.vertices[index][0], this.vertices[index][1], this.vertices[index][2]);
            if (this.vertices[index]["moveTo"] === true) vertArray[vertArray.length - 1]["moveTo"] = true;
            else if (this.vertices[index]["moveTo"] === false) vertArray[vertArray.length - 1]["moveTo"] = false;
            renderContext.breakShape = false
          } else if (this.vertexCodes[i] === 1) {
            renderContext.bezierVertex(this.vertices[index + 0][0], this.vertices[index + 0][1], this.vertices[index + 0][2], this.vertices[index + 1][0], this.vertices[index + 1][1], this.vertices[index + 1][2], this.vertices[index + 2][0], this.vertices[index + 2][1], this.vertices[index + 2][2]);
            index += 3
          } else if (this.vertexCodes[i] === 2) {
            renderContext.curveVertex(this.vertices[index][0], this.vertices[index][1], this.vertices[index][2]);
            index++
          } else if (this.vertexCodes[i] === 3) renderContext.breakShape = true
        }
        renderContext.endShape(this.close ? 2 : 1)
      },
      drawGeometry: function(renderContext) {
        var i, j;
        renderContext.beginShape(this.kind);
        if (this.style) for (i = 0, j = this.vertices.length; i < j; i++) renderContext.vertex(this.vertices[i]);
        else for (i = 0, j = this.vertices.length; i < j; i++) {
          var vert = this.vertices[i];
          if (vert[2] === 0) renderContext.vertex(vert[0], vert[1]);
          else renderContext.vertex(vert[0], vert[1], vert[2])
        }
        renderContext.endShape()
      },
      drawGroup: function(renderContext) {
        for (var i = 0, j = this.children.length; i < j; i++) this.children[i].draw(renderContext)
      },
      drawPrimitive: function(renderContext) {
        if (this.kind === 2) renderContext.point(this.params[0], this.params[1]);
        else if (this.kind === 4) if (this.params.length === 4) renderContext.line(this.params[0], this.params[1], this.params[2], this.params[3]);
        else renderContext.line(this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5]);
        else if (this.kind === 8) renderContext.triangle(this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5]);
        else if (this.kind === 16) renderContext.quad(this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5], this.params[6], this.params[7]);
        else if (this.kind === 30) if (this.image !== null) {
          var imMode = imageModeConvert;
          renderContext.imageMode(0);
          renderContext.image(this.image, this.params[0], this.params[1], this.params[2], this.params[3]);
          imageModeConvert = imMode
        } else {
          var rcMode = curRectMode;
          renderContext.rectMode(0);
          renderContext.rect(this.params[0], this.params[1], this.params[2], this.params[3]);
          curRectMode = rcMode
        } else if (this.kind === 31) {
          var elMode = curEllipseMode;
          renderContext.ellipseMode(0);
          renderContext.ellipse(this.params[0], this.params[1], this.params[2], this.params[3]);
          curEllipseMode = elMode
        } else if (this.kind === 32) {
          var eMode = curEllipseMode;
          renderContext.ellipseMode(0);
          renderContext.arc(this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5]);
          curEllipseMode = eMode
        } else if (this.kind === 41) if (this.params.length === 1) renderContext.box(this.params[0]);
        else renderContext.box(this.params[0], this.params[1], this.params[2]);
        else if (this.kind === 40) renderContext.sphere(this.params[0])
      },
      pre: function(renderContext) {
        if (this.matrix) {
          renderContext.pushMatrix();
          renderContext.transform(this.matrix)
        }
        if (this.style) {
          renderContext.pushStyle();
          this.styles(renderContext)
        }
      },
      post: function(renderContext) {
        if (this.matrix) renderContext.popMatrix();
        if (this.style) renderContext.popStyle()
      },
      styles: function(renderContext) {
        if (this.stroke) {
          renderContext.stroke(this.strokeColor);
          renderContext.strokeWeight(this.strokeWeight);
          renderContext.strokeCap(this.strokeCap);
          renderContext.strokeJoin(this.strokeJoin)
        } else renderContext.noStroke();
        if (this.fill) renderContext.fill(this.fillColor);
        else renderContext.noFill()
      },
      getChild: function(child) {
        var i, j;
        if (typeof child === "number") return this.children[child];
        var found;
        if (child === "" || this.name === child) return this;
        if (this.nameTable.length > 0) {
          for (i = 0, j = this.nameTable.length; i < j || found; i++) if (this.nameTable[i].getName === child) {
            found = this.nameTable[i];
            break
          }
          if (found) return found
        }
        for (i = 0, j = this.children.length; i < j; i++) {
          found = this.children[i].getChild(child);
          if (found) return found
        }
        return null
      },
      getChildCount: function() {
        return this.children.length
      },
      addChild: function(child) {
        this.children.push(child);
        child.parent = this;
        if (child.getName() !== null) this.addName(child.getName(), child)
      },
      addName: function(name, shape) {
        if (this.parent !== null) this.parent.addName(name, shape);
        else this.nameTable.push([name, shape])
      },
      translate: function() {
        if (arguments.length === 2) {
          this.checkMatrix(2);
          this.matrix.translate(arguments[0], arguments[1])
        } else {
          this.checkMatrix(3);
          this.matrix.translate(arguments[0], arguments[1], 0)
        }
      },
      checkMatrix: function(dimensions) {
        if (this.matrix === null) if (dimensions === 2) this.matrix = new p.PMatrix2D;
        else this.matrix = new p.PMatrix3D;
        else if (dimensions === 3 && this.matrix instanceof p.PMatrix2D) this.matrix = new p.PMatrix3D
      },
      rotateX: function(angle) {
        this.rotate(angle, 1, 0, 0)
      },
      rotateY: function(angle) {
        this.rotate(angle, 0, 1, 0)
      },
      rotateZ: function(angle) {
        this.rotate(angle, 0, 0, 1)
      },
      rotate: function() {
        if (arguments.length === 1) {
          this.checkMatrix(2);
          this.matrix.rotate(arguments[0])
        } else {
          this.checkMatrix(3);
          this.matrix.rotate(arguments[0], arguments[1], arguments[2], arguments[3])
        }
      },
      scale: function() {
        if (arguments.length === 2) {
          this.checkMatrix(2);
          this.matrix.scale(arguments[0], arguments[1])
        } else if (arguments.length === 3) {
          this.checkMatrix(2);
          this.matrix.scale(arguments[0], arguments[1], arguments[2])
        } else {
          this.checkMatrix(2);
          this.matrix.scale(arguments[0])
        }
      },
      resetMatrix: function() {
        this.checkMatrix(2);
        this.matrix.reset()
      },
      applyMatrix: function(matrix) {
        if (arguments.length === 1) this.applyMatrix(matrix.elements[0], matrix.elements[1], 0, matrix.elements[2], matrix.elements[3], matrix.elements[4], 0, matrix.elements[5], 0, 0, 1, 0, 0, 0, 0, 1);
        else if (arguments.length === 6) {
          this.checkMatrix(2);
          this.matrix.apply(arguments[0], arguments[1], arguments[2], 0, arguments[3], arguments[4], arguments[5], 0, 0, 0, 1, 0, 0, 0, 0, 1)
        } else if (arguments.length === 16) {
          this.checkMatrix(3);
          this.matrix.apply(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15])
        }
      }
    };
    var PShapeSVG = p.PShapeSVG = function() {
      p.PShape.call(this);
      if (arguments.length === 1) {
        this.element = arguments[0];
        this.vertexCodes = [];
        this.vertices = [];
        this.opacity = 1;
        this.stroke = false;
        this.strokeColor = 4278190080;
        this.strokeWeight = 1;
        this.strokeCap = 'butt';
        this.strokeJoin = 'miter';
        this.strokeGradient = null;
        this.strokeGradientPaint = null;
        this.strokeName = null;
        this.strokeOpacity = 1;
        this.fill = true;
        this.fillColor = 4278190080;
        this.fillGradient = null;
        this.fillGradientPaint = null;
        this.fillName = null;
        this.fillOpacity = 1;
        if (this.element.getName() !== "svg") throw "root is not <svg>, it's <" + this.element.getName() + ">";
      } else if (arguments.length === 2) if (typeof arguments[1] === "string") {
        if (arguments[1].indexOf(".svg") > -1) {
          this.element = new p.XMLElement(p, arguments[1]);
          this.vertexCodes = [];
          this.vertices = [];
          this.opacity = 1;
          this.stroke = false;
          this.strokeColor = 4278190080;
          this.strokeWeight = 1;
          this.strokeCap = 'butt';
          this.strokeJoin = 'miter';
          this.strokeGradient = "";
          this.strokeGradientPaint = "";
          this.strokeName = "";
          this.strokeOpacity = 1;
          this.fill = true;
          this.fillColor = 4278190080;
          this.fillGradient = null;
          this.fillGradientPaint = null;
          this.fillOpacity = 1
        }
      } else if (arguments[0]) {
        this.element = arguments[1];
        this.vertexCodes = arguments[0].vertexCodes.slice();
        this.vertices = arguments[0].vertices.slice();
        this.stroke = arguments[0].stroke;
        this.strokeColor = arguments[0].strokeColor;
        this.strokeWeight = arguments[0].strokeWeight;
        this.strokeCap = arguments[0].strokeCap;
        this.strokeJoin = arguments[0].strokeJoin;
        this.strokeGradient = arguments[0].strokeGradient;
        this.strokeGradientPaint = arguments[0].strokeGradientPaint;
        this.strokeName = arguments[0].strokeName;
        this.fill = arguments[0].fill;
        this.fillColor = arguments[0].fillColor;
        this.fillGradient = arguments[0].fillGradient;
        this.fillGradientPaint = arguments[0].fillGradientPaint;
        this.fillName = arguments[0].fillName;
        this.strokeOpacity = arguments[0].strokeOpacity;
        this.fillOpacity = arguments[0].fillOpacity;
        this.opacity = arguments[0].opacity
      }
      this.name = this.element.getStringAttribute("id");
      var displayStr = this.element.getStringAttribute("display", "inline");
      this.visible = displayStr !== "none";
      var str = this.element.getAttribute("transform");
      if (str) this.matrix = this.parseMatrix(str);
      var viewBoxStr = this.element.getStringAttribute("viewBox");
      if (viewBoxStr !== null) {
        var viewBox = viewBoxStr.split(" ");
        this.width = viewBox[2];
        this.height = viewBox[3]
      }
      var unitWidth = this.element.getStringAttribute("width");
      var unitHeight = this.element.getStringAttribute("height");
      if (unitWidth !== null) {
        this.width = this.parseUnitSize(unitWidth);
        this.height = this.parseUnitSize(unitHeight)
      } else if (this.width === 0 || this.height === 0) {
        this.width = 1;
        this.height = 1;
        throw "The width and/or height is not " + "readable in the <svg> tag of this file.";
      }
      this.parseColors(this.element);
      this.parseChildren(this.element)
    };
    PShapeSVG.prototype = new PShape;
    PShapeSVG.prototype.parseMatrix = function() {
      function getCoords(s) {
        var m = [];
        s.replace(/\((.*?)\)/, function() {
          return function(all, params) {
            m = params.replace(/,+/g, " ").split(/\s+/)
          }
        }());
        return m
      }
      return function(str) {
        this.checkMatrix(2);
        var pieces = [];
        str.replace(/\s*(\w+)\((.*?)\)/g, function(all) {
          pieces.push(p.trim(all))
        });
        if (pieces.length === 0) return null;
        for (var i = 0, j = pieces.length; i < j; i++) {
          var m = getCoords(pieces[i]);
          if (pieces[i].indexOf("matrix") !== -1) this.matrix.set(m[0], m[2], m[4], m[1], m[3], m[5]);
          else if (pieces[i].indexOf("translate") !== -1) {
            var tx = m[0];
            var ty = m.length === 2 ? m[1] : 0;
            this.matrix.translate(tx, ty)
          } else if (pieces[i].indexOf("scale") !== -1) {
            var sx = m[0];
            var sy = m.length === 2 ? m[1] : m[0];
            this.matrix.scale(sx, sy)
          } else if (pieces[i].indexOf("rotate") !== -1) {
            var angle = m[0];
            if (m.length === 1) this.matrix.rotate(p.radians(angle));
            else if (m.length === 3) {
              this.matrix.translate(m[1], m[2]);
              this.matrix.rotate(p.radians(m[0]));
              this.matrix.translate(-m[1], -m[2])
            }
          } else if (pieces[i].indexOf("skewX") !== -1) this.matrix.skewX(parseFloat(m[0]));
          else if (pieces[i].indexOf("skewY") !== -1) this.matrix.skewY(m[0]);
          else if (pieces[i].indexOf("shearX") !== -1) this.matrix.shearX(m[0]);
          else if (pieces[i].indexOf("shearY") !== -1) this.matrix.shearY(m[0])
        }
        return this.matrix
      }
    }();
    PShapeSVG.prototype.parseChildren = function(element) {
      var newelement = element.getChildren();
      var children = new p.PShape;
      for (var i = 0, j = newelement.length; i < j; i++) {
        var kid = this.parseChild(newelement[i]);
        if (kid) children.addChild(kid)
      }
      this.children.push(children)
    };
    PShapeSVG.prototype.getName = function() {
      return this.name
    };
    PShapeSVG.prototype.parseChild = function(elem) {
      var name = elem.getName();
      var shape;
      if (name === "g") shape = new PShapeSVG(this, elem);
      else if (name === "defs") shape = new PShapeSVG(this, elem);
      else if (name === "line") {
        shape = new PShapeSVG(this, elem);
        shape.parseLine()
      } else if (name === "circle") {
        shape = new PShapeSVG(this, elem);
        shape.parseEllipse(true)
      } else if (name === "ellipse") {
        shape = new PShapeSVG(this, elem);
        shape.parseEllipse(false)
      } else if (name === "rect") {
        shape = new PShapeSVG(this, elem);
        shape.parseRect()
      } else if (name === "polygon") {
        shape = new PShapeSVG(this, elem);
        shape.parsePoly(true)
      } else if (name === "polyline") {
        shape = new PShapeSVG(this, elem);
        shape.parsePoly(false)
      } else if (name === "path") {
        shape = new PShapeSVG(this, elem);
        shape.parsePath()
      } else if (name === "radialGradient") unimplemented("PShapeSVG.prototype.parseChild, name = radialGradient");
      else if (name === "linearGradient") unimplemented("PShapeSVG.prototype.parseChild, name = linearGradient");
      else if (name === "text") unimplemented("PShapeSVG.prototype.parseChild, name = text");
      else if (name === "filter") unimplemented("PShapeSVG.prototype.parseChild, name = filter");
      else if (name === "mask") unimplemented("PShapeSVG.prototype.parseChild, name = mask");
      else nop();
      return shape
    };
    PShapeSVG.prototype.parsePath = function() {
      this.family = 21;
      this.kind = 0;
      var pathDataChars = [];
      var c;
      var pathData = p.trim(this.element.getStringAttribute("d").replace(/[\s,]+/g, " "));
      if (pathData === null) return;
      pathData = p.__toCharArray(pathData);
      var cx = 0,
        cy = 0,
        ctrlX = 0,
        ctrlY = 0,
        ctrlX1 = 0,
        ctrlX2 = 0,
        ctrlY1 = 0,
        ctrlY2 = 0,
        endX = 0,
        endY = 0,
        ppx = 0,
        ppy = 0,
        px = 0,
        py = 0,
        i = 0,
        valOf = 0;
      var str = "";
      var tmpArray = [];
      var flag = false;
      var lastInstruction;
      var command;
      var j, k;
      while (i < pathData.length) {
        valOf = pathData[i].valueOf();
        if (valOf >= 65 && valOf <= 90 || valOf >= 97 && valOf <= 122) {
          j = i;
          i++;
          if (i < pathData.length) {
            tmpArray = [];
            valOf = pathData[i].valueOf();
            while (! (valOf >= 65 && valOf <= 90 || valOf >= 97 && valOf <= 100 || valOf >= 102 && valOf <= 122) && flag === false) {
              if (valOf === 32) {
                if (str !== "") {
                  tmpArray.push(parseFloat(str));
                  str = ""
                }
                i++
              } else if (valOf === 45) if (pathData[i - 1].valueOf() === 101) {
                str += pathData[i].toString();
                i++
              } else {
                if (str !== "") tmpArray.push(parseFloat(str));
                str = pathData[i].toString();
                i++
              } else {
                str += pathData[i].toString();
                i++
              }
              if (i === pathData.length) flag = true;
              else valOf = pathData[i].valueOf()
            }
          }
          if (str !== "") {
            tmpArray.push(parseFloat(str));
            str = ""
          }
          command = pathData[j];
          valOf = command.valueOf();
          if (valOf === 77) {
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
              cx = tmpArray[0];
              cy = tmpArray[1];
              this.parsePathMoveto(cx, cy);
              if (tmpArray.length > 2) for (j = 2, k = tmpArray.length; j < k; j += 2) {
                cx = tmpArray[j];
                cy = tmpArray[j + 1];
                this.parsePathLineto(cx, cy)
              }
            }
          } else if (valOf === 109) {
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
              cx += tmpArray[0];
              cy += tmpArray[1];
              this.parsePathMoveto(cx, cy);
              if (tmpArray.length > 2) for (j = 2, k = tmpArray.length; j < k; j += 2) {
                cx += tmpArray[j];
                cy += tmpArray[j + 1];
                this.parsePathLineto(cx, cy)
              }
            }
          } else if (valOf === 76) {
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) for (j = 0, k = tmpArray.length; j < k; j += 2) {
              cx = tmpArray[j];
              cy = tmpArray[j + 1];
              this.parsePathLineto(cx, cy)
            }
          } else if (valOf === 108) {
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) for (j = 0, k = tmpArray.length; j < k; j += 2) {
              cx += tmpArray[j];
              cy += tmpArray[j + 1];
              this.parsePathLineto(cx, cy)
            }
          } else if (valOf === 72) for (j = 0, k = tmpArray.length; j < k; j++) {
            cx = tmpArray[j];
            this.parsePathLineto(cx, cy)
          } else if (valOf === 104) for (j = 0, k = tmpArray.length; j < k; j++) {
            cx += tmpArray[j];
            this.parsePathLineto(cx, cy)
          } else if (valOf === 86) for (j = 0, k = tmpArray.length; j < k; j++) {
            cy = tmpArray[j];
            this.parsePathLineto(cx, cy)
          } else if (valOf === 118) for (j = 0, k = tmpArray.length; j < k; j++) {
            cy += tmpArray[j];
            this.parsePathLineto(cx, cy)
          } else if (valOf === 67) {
            if (tmpArray.length >= 6 && tmpArray.length % 6 === 0) for (j = 0, k = tmpArray.length; j < k; j += 6) {
              ctrlX1 = tmpArray[j];
              ctrlY1 = tmpArray[j + 1];
              ctrlX2 = tmpArray[j + 2];
              ctrlY2 = tmpArray[j + 3];
              endX = tmpArray[j + 4];
              endY = tmpArray[j + 5];
              this.parsePathCurveto(ctrlX1, ctrlY1, ctrlX2, ctrlY2, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 99) {
            if (tmpArray.length >= 6 && tmpArray.length % 6 === 0) for (j = 0, k = tmpArray.length; j < k; j += 6) {
              ctrlX1 = cx + tmpArray[j];
              ctrlY1 = cy + tmpArray[j + 1];
              ctrlX2 = cx + tmpArray[j + 2];
              ctrlY2 = cy + tmpArray[j + 3];
              endX = cx + tmpArray[j + 4];
              endY = cy + tmpArray[j + 5];
              this.parsePathCurveto(ctrlX1, ctrlY1, ctrlX2, ctrlY2, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 83) {
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) for (j = 0, k = tmpArray.length; j < k; j += 4) {
              if (lastInstruction.toLowerCase() === "c" || lastInstruction.toLowerCase() === "s") {
                ppx = this.vertices[this.vertices.length - 2][0];
                ppy = this.vertices[this.vertices.length - 2][1];
                px = this.vertices[this.vertices.length - 1][0];
                py = this.vertices[this.vertices.length - 1][1];
                ctrlX1 = px + (px - ppx);
                ctrlY1 = py + (py - ppy)
              } else {
                ctrlX1 = this.vertices[this.vertices.length - 1][0];
                ctrlY1 = this.vertices[this.vertices.length - 1][1]
              }
              ctrlX2 = tmpArray[j];
              ctrlY2 = tmpArray[j + 1];
              endX = tmpArray[j + 2];
              endY = tmpArray[j + 3];
              this.parsePathCurveto(ctrlX1, ctrlY1, ctrlX2, ctrlY2, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 115) {
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) for (j = 0, k = tmpArray.length; j < k; j += 4) {
              if (lastInstruction.toLowerCase() === "c" || lastInstruction.toLowerCase() === "s") {
                ppx = this.vertices[this.vertices.length - 2][0];
                ppy = this.vertices[this.vertices.length - 2][1];
                px = this.vertices[this.vertices.length - 1][0];
                py = this.vertices[this.vertices.length - 1][1];
                ctrlX1 = px + (px - ppx);
                ctrlY1 = py + (py - ppy)
              } else {
                ctrlX1 = this.vertices[this.vertices.length - 1][0];
                ctrlY1 = this.vertices[this.vertices.length - 1][1]
              }
              ctrlX2 = cx + tmpArray[j];
              ctrlY2 = cy + tmpArray[j + 1];
              endX = cx + tmpArray[j + 2];
              endY = cy + tmpArray[j + 3];
              this.parsePathCurveto(ctrlX1, ctrlY1, ctrlX2, ctrlY2, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 81) {
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) for (j = 0, k = tmpArray.length; j < k; j += 4) {
              ctrlX = tmpArray[j];
              ctrlY = tmpArray[j + 1];
              endX = tmpArray[j + 2];
              endY = tmpArray[j + 3];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 113) {
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) for (j = 0, k = tmpArray.length; j < k; j += 4) {
              ctrlX = cx + tmpArray[j];
              ctrlY = cy + tmpArray[j + 1];
              endX = cx + tmpArray[j + 2];
              endY = cy + tmpArray[j + 3];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 84) {
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) for (j = 0, k = tmpArray.length; j < k; j += 2) {
              if (lastInstruction.toLowerCase() === "q" || lastInstruction.toLowerCase() === "t") {
                ppx = this.vertices[this.vertices.length - 2][0];
                ppy = this.vertices[this.vertices.length - 2][1];
                px = this.vertices[this.vertices.length - 1][0];
                py = this.vertices[this.vertices.length - 1][1];
                ctrlX = px + (px - ppx);
                ctrlY = py + (py - ppy)
              } else {
                ctrlX = cx;
                ctrlY = cy
              }
              endX = tmpArray[j];
              endY = tmpArray[j + 1];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 116) {
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) for (j = 0, k = tmpArray.length; j < k; j += 2) {
              if (lastInstruction.toLowerCase() === "q" || lastInstruction.toLowerCase() === "t") {
                ppx = this.vertices[this.vertices.length - 2][0];
                ppy = this.vertices[this.vertices.length - 2][1];
                px = this.vertices[this.vertices.length - 1][0];
                py = this.vertices[this.vertices.length - 1][1];
                ctrlX = px + (px - ppx);
                ctrlY = py + (py - ppy)
              } else {
                ctrlX = cx;
                ctrlY = cy
              }
              endX = cx + tmpArray[j];
              endY = cy + tmpArray[j + 1];
              this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
              cx = endX;
              cy = endY
            }
          } else if (valOf === 90 || valOf === 122) this.close = true;
          lastInstruction = command.toString()
        } else i++
      }
    };
    PShapeSVG.prototype.parsePathQuadto = function(x1, y1, cx, cy, x2, y2) {
      if (this.vertices.length > 0) {
        this.parsePathCode(1);
        this.parsePathVertex(x1 + (cx - x1) * 2 / 3, y1 + (cy - y1) * 2 / 3);
        this.parsePathVertex(x2 + (cx - x2) * 2 / 3, y2 + (cy - y2) * 2 / 3);
        this.parsePathVertex(x2, y2)
      } else throw "Path must start with M/m";
    };
    PShapeSVG.prototype.parsePathCurveto = function(x1, y1, x2, y2, x3, y3) {
      if (this.vertices.length > 0) {
        this.parsePathCode(1);
        this.parsePathVertex(x1, y1);
        this.parsePathVertex(x2, y2);
        this.parsePathVertex(x3, y3)
      } else throw "Path must start with M/m";
    };
    PShapeSVG.prototype.parsePathLineto = function(px, py) {
      if (this.vertices.length > 0) {
        this.parsePathCode(0);
        this.parsePathVertex(px, py);
        this.vertices[this.vertices.length - 1]["moveTo"] = false
      } else throw "Path must start with M/m";
    };
    PShapeSVG.prototype.parsePathMoveto = function(px, py) {
      if (this.vertices.length > 0) this.parsePathCode(3);
      this.parsePathCode(0);
      this.parsePathVertex(px, py);
      this.vertices[this.vertices.length - 1]["moveTo"] = true
    };
    PShapeSVG.prototype.parsePathVertex = function(x, y) {
      var verts = [];
      verts[0] = x;
      verts[1] = y;
      this.vertices.push(verts)
    };
    PShapeSVG.prototype.parsePathCode = function(what) {
      this.vertexCodes.push(what)
    };
    PShapeSVG.prototype.parsePoly = function(val) {
      this.family = 21;
      this.close = val;
      var pointsAttr = p.trim(this.element.getStringAttribute("points").replace(/[,\s]+/g, " "));
      if (pointsAttr !== null) {
        var pointsBuffer = pointsAttr.split(" ");
        if (pointsBuffer.length % 2 === 0) for (var i = 0, j = pointsBuffer.length; i < j; i++) {
          var verts = [];
          verts[0] = pointsBuffer[i];
          verts[1] = pointsBuffer[++i];
          this.vertices.push(verts)
        } else throw "Error parsing polygon points: odd number of coordinates provided";
      }
    };
    PShapeSVG.prototype.parseRect = function() {
      this.kind = 30;
      this.family = 1;
      this.params = [];
      this.params[0] = this.element.getFloatAttribute("x");
      this.params[1] = this.element.getFloatAttribute("y");
      this.params[2] = this.element.getFloatAttribute("width");
      this.params[3] = this.element.getFloatAttribute("height");
      if (this.params[2] < 0 || this.params[3] < 0) throw "svg error: negative width or height found while parsing <rect>";
    };
    PShapeSVG.prototype.parseEllipse = function(val) {
      this.kind = 31;
      this.family = 1;
      this.params = [];
      this.params[0] = this.element.getFloatAttribute("cx") | 0;
      this.params[1] = this.element.getFloatAttribute("cy") | 0;
      var rx, ry;
      if (val) {
        rx = ry = this.element.getFloatAttribute("r");
        if (rx < 0) throw "svg error: negative radius found while parsing <circle>";
      } else {
        rx = this.element.getFloatAttribute("rx");
        ry = this.element.getFloatAttribute("ry");
        if (rx < 0 || ry < 0) throw "svg error: negative x-axis radius or y-axis radius found while parsing <ellipse>";
      }
      this.params[0] -= rx;
      this.params[1] -= ry;
      this.params[2] = rx * 2;
      this.params[3] = ry * 2
    };
    PShapeSVG.prototype.parseLine = function() {
      this.kind = 4;
      this.family = 1;
      this.params = [];
      this.params[0] = this.element.getFloatAttribute("x1");
      this.params[1] = this.element.getFloatAttribute("y1");
      this.params[2] = this.element.getFloatAttribute("x2");
      this.params[3] = this.element.getFloatAttribute("y2")
    };
    PShapeSVG.prototype.parseColors = function(element) {
      if (element.hasAttribute("opacity")) this.setOpacity(element.getAttribute("opacity"));
      if (element.hasAttribute("stroke")) this.setStroke(element.getAttribute("stroke"));
      if (element.hasAttribute("stroke-width")) this.setStrokeWeight(element.getAttribute("stroke-width"));
      if (element.hasAttribute("stroke-linejoin")) this.setStrokeJoin(element.getAttribute("stroke-linejoin"));
      if (element.hasAttribute("stroke-linecap")) this.setStrokeCap(element.getStringAttribute("stroke-linecap"));
      if (element.hasAttribute("fill")) this.setFill(element.getStringAttribute("fill"));
      if (element.hasAttribute("style")) {
        var styleText = element.getStringAttribute("style");
        var styleTokens = styleText.toString().split(";");
        for (var i = 0, j = styleTokens.length; i < j; i++) {
          var tokens = p.trim(styleTokens[i].split(":"));
          if (tokens[0] === "fill") this.setFill(tokens[1]);
          else if (tokens[0] === "fill-opacity") this.setFillOpacity(tokens[1]);
          else if (tokens[0] === "stroke") this.setStroke(tokens[1]);
          else if (tokens[0] === "stroke-width") this.setStrokeWeight(tokens[1]);
          else if (tokens[0] === "stroke-linecap") this.setStrokeCap(tokens[1]);
          else if (tokens[0] === "stroke-linejoin") this.setStrokeJoin(tokens[1]);
          else if (tokens[0] === "stroke-opacity") this.setStrokeOpacity(tokens[1]);
          else if (tokens[0] === "opacity") this.setOpacity(tokens[1])
        }
      }
    };
    PShapeSVG.prototype.setFillOpacity = function(opacityText) {
      this.fillOpacity = parseFloat(opacityText);
      this.fillColor = this.fillOpacity * 255 << 24 | this.fillColor & 16777215
    };
    PShapeSVG.prototype.setFill = function(fillText) {
      var opacityMask = this.fillColor & 4278190080;
      if (fillText === "none") this.fill = false;
      else if (fillText.indexOf("#") === 0) {
        this.fill = true;
        if (fillText.length === 4) fillText = fillText.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3");
        this.fillColor = opacityMask | parseInt(fillText.substring(1), 16) & 16777215
      } else if (fillText.indexOf("rgb") === 0) {
        this.fill = true;
        this.fillColor = opacityMask | this.parseRGB(fillText)
      } else if (fillText.indexOf("url(#") === 0) this.fillName = fillText.substring(5, fillText.length - 1);
      else if (colors[fillText]) {
        this.fill = true;
        this.fillColor = opacityMask | parseInt(colors[fillText].substring(1), 16) & 16777215
      }
    };
    PShapeSVG.prototype.setOpacity = function(opacity) {
      this.strokeColor = parseFloat(opacity) * 255 << 24 | this.strokeColor & 16777215;
      this.fillColor = parseFloat(opacity) * 255 << 24 | this.fillColor & 16777215
    };
    PShapeSVG.prototype.setStroke = function(strokeText) {
      var opacityMask = this.strokeColor & 4278190080;
      if (strokeText === "none") this.stroke = false;
      else if (strokeText.charAt(0) === "#") {
        this.stroke = true;
        if (strokeText.length === 4) strokeText = strokeText.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3");
        this.strokeColor = opacityMask | parseInt(strokeText.substring(1), 16) & 16777215
      } else if (strokeText.indexOf("rgb") === 0) {
        this.stroke = true;
        this.strokeColor = opacityMask | this.parseRGB(strokeText)
      } else if (strokeText.indexOf("url(#") === 0) this.strokeName = strokeText.substring(5, strokeText.length - 1);
      else if (colors[strokeText]) {
        this.stroke = true;
        this.strokeColor = opacityMask | parseInt(colors[strokeText].substring(1), 16) & 16777215
      }
    };
    PShapeSVG.prototype.setStrokeWeight = function(weight) {
      this.strokeWeight = this.parseUnitSize(weight)
    };
    PShapeSVG.prototype.setStrokeJoin = function(linejoin) {
      if (linejoin === "miter") this.strokeJoin = 'miter';
      else if (linejoin === "round") this.strokeJoin = 'round';
      else if (linejoin === "bevel") this.strokeJoin = 'bevel'
    };
    PShapeSVG.prototype.setStrokeCap = function(linecap) {
      if (linecap === "butt") this.strokeCap = 'butt';
      else if (linecap === "round") this.strokeCap = 'round';
      else if (linecap === "square") this.strokeCap = 'square'
    };
    PShapeSVG.prototype.setStrokeOpacity = function(opacityText) {
      this.strokeOpacity = parseFloat(opacityText);
      this.strokeColor = this.strokeOpacity * 255 << 24 | this.strokeColor & 16777215
    };
    PShapeSVG.prototype.parseRGB = function(color) {
      var sub = color.substring(color.indexOf("(") + 1, color.indexOf(")"));
      var values = sub.split(", ");
      return values[0] << 16 | values[1] << 8 | values[2]
    };
    PShapeSVG.prototype.parseUnitSize = function(text) {
      var len = text.length - 2;
      if (len < 0) return text;
      if (text.indexOf("pt") === len) return parseFloat(text.substring(0, len)) * 1.25;
      if (text.indexOf("pc") === len) return parseFloat(text.substring(0, len)) * 15;
      if (text.indexOf("mm") === len) return parseFloat(text.substring(0, len)) * 3.543307;
      if (text.indexOf("cm") === len) return parseFloat(text.substring(0, len)) * 35.43307;
      if (text.indexOf("in") === len) return parseFloat(text.substring(0, len)) * 90;
      if (text.indexOf("px") === len) return parseFloat(text.substring(0, len));
      return parseFloat(text)
    };
    p.shape = function(shape, x, y, width, height) {
      if (arguments.length >= 1 && arguments[0] !== null) if (shape.isVisible()) {
        p.pushMatrix();
        if (curShapeMode === 3) if (arguments.length === 5) {
          p.translate(x - width / 2, y - height / 2);
          p.scale(width / shape.getWidth(), height / shape.getHeight())
        } else if (arguments.length === 3) p.translate(x - shape.getWidth() / 2, -shape.getHeight() / 2);
        else p.translate(-shape.getWidth() / 2, -shape.getHeight() / 2);
        else if (curShapeMode === 0) if (arguments.length === 5) {
          p.translate(x, y);
          p.scale(width / shape.getWidth(), height / shape.getHeight())
        } else {
          if (arguments.length === 3) p.translate(x, y)
        } else if (curShapeMode === 1) if (arguments.length === 5) {
          width -= x;
          height -= y;
          p.translate(x, y);
          p.scale(width / shape.getWidth(), height / shape.getHeight())
        } else if (arguments.length === 3) p.translate(x, y);
        shape.draw(p);
        if (arguments.length === 1 && curShapeMode === 3 || arguments.length > 1) p.popMatrix()
      }
    };
    p.shapeMode = function(mode) {
      curShapeMode = mode
    };
    p.loadShape = function(filename) {
      if (arguments.length === 1) if (filename.indexOf(".svg") > -1) return new PShapeSVG(null, filename);
      return null
    };
    var XMLAttribute = function(fname, n, nameSpace, v, t) {
      this.fullName = fname || "";
      this.name = n || "";
      this.namespace = nameSpace || "";
      this.value = v;
      this.type = t
    };
    XMLAttribute.prototype = {
      getName: function() {
        return this.name
      },
      getFullName: function() {
        return this.fullName
      },
      getNamespace: function() {
        return this.namespace
      },
      getValue: function() {
        return this.value
      },
      getType: function() {
        return this.type
      },
      setValue: function(newval) {
        this.value = newval
      }
    };
    var XMLElement = p.XMLElement = function(selector, uri, sysid, line) {
      this.attributes = [];
      this.children = [];
      this.fullName = null;
      this.name = null;
      this.namespace = "";
      this.content = null;
      this.parent = null;
      this.lineNr = "";
      this.systemID = "";
      this.type = "ELEMENT";
      if (selector) if (typeof selector === "string") if (uri === undef && selector.indexOf("<") > -1) this.parse(selector);
      else {
        this.fullName = selector;
        this.namespace = uri;
        this.systemId = sysid;
        this.lineNr = line
      } else this.parse(uri)
    };
    XMLElement.prototype = {
      parse: function(textstring) {
        var xmlDoc;
        try {
          var extension = textstring.substring(textstring.length - 4);
          if (extension === ".xml" || extension === ".svg") textstring = ajax(textstring);
          xmlDoc = (new DOMParser).parseFromString(textstring, "text/xml");
          var elements = xmlDoc.documentElement;
          if (elements) this.parseChildrenRecursive(null, elements);
          else throw "Error loading document";
          return this
        } catch(e) {
          throw e;
        }
      },
      parseChildrenRecursive: function(parent, elementpath) {
        var xmlelement, xmlattribute, tmpattrib, l, m, child;
        if (!parent) {
          this.fullName = elementpath.localName;
          this.name = elementpath.nodeName;
          xmlelement = this
        } else {
          xmlelement = new XMLElement(elementpath.nodeName);
          xmlelement.parent = parent
        }
        if (elementpath.nodeType === 3 && elementpath.textContent !== "") return this.createPCDataElement(elementpath.textContent);
        if (elementpath.nodeType === 4) return this.createCDataElement(elementpath.textContent);
        if (elementpath.attributes) for (l = 0, m = elementpath.attributes.length; l < m; l++) {
          tmpattrib = elementpath.attributes[l];
          xmlattribute = new XMLAttribute(tmpattrib.getname, tmpattrib.nodeName, tmpattrib.namespaceURI, tmpattrib.nodeValue, tmpattrib.nodeType);
          xmlelement.attributes.push(xmlattribute)
        }
        if (elementpath.childNodes) for (l = 0, m = elementpath.childNodes.length; l < m; l++) {
          var node = elementpath.childNodes[l];
          child = xmlelement.parseChildrenRecursive(xmlelement, node);
          if (child !== null) xmlelement.children.push(child)
        }
        return xmlelement
      },
      createElement: function(fullname, namespaceuri, sysid, line) {
        if (sysid === undef) return new XMLElement(fullname, namespaceuri);
        return new XMLElement(fullname, namespaceuri, sysid, line)
      },
      createPCDataElement: function(content, isCDATA) {
        if (content.replace(/^\s+$/g, "") === "") return null;
        var pcdata = new XMLElement;
        pcdata.type = "TEXT";
        pcdata.content = content;
        return pcdata
      },
      createCDataElement: function(content) {
        var cdata = this.createPCDataElement(content);
        if (cdata === null) return null;
        cdata.type = "CDATA";
        var htmlentities = {
          "<": "&lt;",
          ">": "&gt;",
          "'": "&apos;",
          '"': "&quot;"
        },
          entity;
        for (entity in htmlentities) if (!Object.hasOwnProperty(htmlentities, entity)) content = content.replace(new RegExp(entity, "g"), htmlentities[entity]);
        cdata.cdata = content;
        return cdata
      },
      hasAttribute: function() {
        if (arguments.length === 1) return this.getAttribute(arguments[0]) !== null;
        if (arguments.length === 2) return this.getAttribute(arguments[0], arguments[1]) !== null
      },
      equals: function(other) {
        if (! (other instanceof XMLElement)) return false;
        var i, j;
        if (this.fullName !== other.fullName) return false;
        if (this.attributes.length !== other.getAttributeCount()) return false;
        if (this.attributes.length !== other.attributes.length) return false;
        var attr_name, attr_ns, attr_value, attr_type, attr_other;
        for (i = 0, j = this.attributes.length; i < j; i++) {
          attr_name = this.attributes[i].getName();
          attr_ns = this.attributes[i].getNamespace();
          attr_other = other.findAttribute(attr_name, attr_ns);
          if (attr_other === null) return false;
          if (this.attributes[i].getValue() !== attr_other.getValue()) return false;
          if (this.attributes[i].getType() !== attr_other.getType()) return false
        }
        if (this.children.length !== other.getChildCount()) return false;
        if (this.children.length > 0) {
          var child1, child2;
          for (i = 0, j = this.children.length; i < j; i++) {
            child1 = this.getChild(i);
            child2 = other.getChild(i);
            if (!child1.equals(child2)) return false
          }
          return true
        }
        return this.content === other.content
      },
      getContent: function() {
        if (this.type === "TEXT" || this.type === "CDATA") return this.content;
        var children = this.children;
        if (children.length === 1 && (children[0].type === "TEXT" || children[0].type === "CDATA")) return children[0].content;
        return null
      },
      getAttribute: function() {
        var attribute;
        if (arguments.length === 2) {
          attribute = this.findAttribute(arguments[0]);
          if (attribute) return attribute.getValue();
          return arguments[1]
        } else if (arguments.length === 1) {
          attribute = this.findAttribute(arguments[0]);
          if (attribute) return attribute.getValue();
          return null
        } else if (arguments.length === 3) {
          attribute = this.findAttribute(arguments[0], arguments[1]);
          if (attribute) return attribute.getValue();
          return arguments[2]
        }
      },
      getStringAttribute: function() {
        if (arguments.length === 1) return this.getAttribute(arguments[0]);
        if (arguments.length === 2) return this.getAttribute(arguments[0], arguments[1]);
        return this.getAttribute(arguments[0], arguments[1], arguments[2])
      },
      getString: function(attributeName) {
        return this.getStringAttribute(attributeName)
      },
      getFloatAttribute: function() {
        if (arguments.length === 1) return parseFloat(this.getAttribute(arguments[0], 0));
        if (arguments.length === 2) return this.getAttribute(arguments[0], arguments[1]);
        return this.getAttribute(arguments[0], arguments[1], arguments[2])
      },
      getFloat: function(attributeName) {
        return this.getFloatAttribute(attributeName)
      },
      getIntAttribute: function() {
        if (arguments.length === 1) return this.getAttribute(arguments[0], 0);
        if (arguments.length === 2) return this.getAttribute(arguments[0], arguments[1]);
        return this.getAttribute(arguments[0], arguments[1], arguments[2])
      },
      getInt: function(attributeName) {
        return this.getIntAttribute(attributeName)
      },
      hasChildren: function() {
        return this.children.length > 0
      },
      addChild: function(child) {
        if (child !== null) {
          child.parent = this;
          this.children.push(child)
        }
      },
      insertChild: function(child, index) {
        if (child) {
          if (child.getLocalName() === null && !this.hasChildren()) {
            var lastChild = this.children[this.children.length - 1];
            if (lastChild.getLocalName() === null) {
              lastChild.setContent(lastChild.getContent() + child.getContent());
              return
            }
          }
          child.parent = this;
          this.children.splice(index, 0, child)
        }
      },
      getChild: function(selector) {
        if (typeof selector === "number") return this.children[selector];
        if (selector.indexOf("/") !== -1) return this.getChildRecursive(selector.split("/"), 0);
        var kid, kidName;
        for (var i = 0, j = this.getChildCount(); i < j; i++) {
          kid = this.getChild(i);
          kidName = kid.getName();
          if (kidName !== null && kidName === selector) return kid
        }
        return null
      },
      getChildren: function() {
        if (arguments.length === 1) {
          if (typeof arguments[0] === "number") return this.getChild(arguments[0]);
          if (arguments[0].indexOf("/") !== -1) return this.getChildrenRecursive(arguments[0].split("/"), 0);
          var matches = [];
          var kid, kidName;
          for (var i = 0, j = this.getChildCount(); i < j; i++) {
            kid = this.getChild(i);
            kidName = kid.getName();
            if (kidName !== null && kidName === arguments[0]) matches.push(kid)
          }
          return matches
        }
        return this.children
      },
      getChildCount: function() {
        return this.children.length
      },
      getChildRecursive: function(items, offset) {
        if (offset === items.length) return this;
        var kid, kidName, matchName = items[offset];
        for (var i = 0, j = this.getChildCount(); i < j; i++) {
          kid = this.getChild(i);
          kidName = kid.getName();
          if (kidName !== null && kidName === matchName) return kid.getChildRecursive(items, offset + 1)
        }
        return null
      },
      getChildrenRecursive: function(items, offset) {
        if (offset === items.length - 1) return this.getChildren(items[offset]);
        var matches = this.getChildren(items[offset]);
        var kidMatches = [];
        for (var i = 0; i < matches.length; i++) kidMatches = kidMatches.concat(matches[i].getChildrenRecursive(items, offset + 1));
        return kidMatches
      },
      isLeaf: function() {
        return !this.hasChildren()
      },
      listChildren: function() {
        var arr = [];
        for (var i = 0, j = this.children.length; i < j; i++) arr.push(this.getChild(i).getName());
        return arr
      },
      removeAttribute: function(name, namespace) {
        this.namespace = namespace || "";
        for (var i = 0, j = this.attributes.length; i < j; i++) if (this.attributes[i].getName() === name && this.attributes[i].getNamespace() === this.namespace) {
          this.attributes.splice(i, 1);
          break
        }
      },
      removeChild: function(child) {
        if (child) for (var i = 0, j = this.children.length; i < j; i++) if (this.children[i].equals(child)) {
          this.children.splice(i, 1);
          break
        }
      },
      removeChildAtIndex: function(index) {
        if (this.children.length > index) this.children.splice(index, 1)
      },
      findAttribute: function(name, namespace) {
        this.namespace = namespace || "";
        for (var i = 0, j = this.attributes.length; i < j; i++) if (this.attributes[i].getName() === name && this.attributes[i].getNamespace() === this.namespace) return this.attributes[i];
        return null
      },
      setAttribute: function() {
        var attr;
        if (arguments.length === 3) {
          var index = arguments[0].indexOf(":");
          var name = arguments[0].substring(index + 1);
          attr = this.findAttribute(name, arguments[1]);
          if (attr) attr.setValue(arguments[2]);
          else {
            attr = new XMLAttribute(arguments[0], name, arguments[1], arguments[2], "CDATA");
            this.attributes.push(attr)
          }
        } else {
          attr = this.findAttribute(arguments[0]);
          if (attr) attr.setValue(arguments[1]);
          else {
            attr = new XMLAttribute(arguments[0], arguments[0], null, arguments[1], "CDATA");
            this.attributes.push(attr)
          }
        }
      },
      setString: function(attribute, value) {
        this.setAttribute(attribute, value)
      },
      setInt: function(attribute, value) {
        this.setAttribute(attribute, value)
      },
      setFloat: function(attribute, value) {
        this.setAttribute(attribute, value)
      },
      setContent: function(content) {
        if (this.children.length > 0) Processing.debug("Tried to set content for XMLElement with children");
        this.content = content
      },
      setName: function() {
        if (arguments.length === 1) {
          this.name = arguments[0];
          this.fullName = arguments[0];
          this.namespace = null
        } else {
          var index = arguments[0].indexOf(":");
          if (arguments[1] === null || index < 0) this.name = arguments[0];
          else this.name = arguments[0].substring(index + 1);
          this.fullName = arguments[0];
          this.namespace = arguments[1]
        }
      },
      getName: function() {
        return this.fullName
      },
      getLocalName: function() {
        return this.name
      },
      getAttributeCount: function() {
        return this.attributes.length
      },
      toString: function() {
        if (this.type === "TEXT") return this.content;
        if (this.type === "CDATA") return this.cdata;
        var tagstring = this.fullName;
        var xmlstring = "<" + tagstring;
        var a, c;
        for (a = 0; a < this.attributes.length; a++) {
          var attr = this.attributes[a];
          xmlstring += " " + attr.getName() + "=" + '"' + attr.getValue() + '"'
        }
        if (this.children.length === 0) if (this.content === "") xmlstring += "/>";
        else xmlstring += ">" + this.content + "</" + tagstring + ">";
        else {
          xmlstring += ">";
          for (c = 0; c < this.children.length; c++) xmlstring += this.children[c].toString();
          xmlstring += "</" + tagstring + ">"
        }
        return xmlstring
      }
    };
    XMLElement.parse = function(xmlstring) {
      var element = new XMLElement;
      element.parse(xmlstring);
      return element
    };
    var XML = p.XML = p.XMLElement;
    p.loadXML = function(uri) {
      return new XML(p, uri)
    };
    var printMatrixHelper = function(elements) {
      var big = 0;
      for (var i = 0; i < elements.length; i++) if (i !== 0) big = Math.max(big, Math.abs(elements[i]));
      else big = Math.abs(elements[i]);
      var digits = (big + "").indexOf(".");
      if (digits === 0) digits = 1;
      else if (digits === -1) digits = (big + "").length;
      return digits
    };
    var PMatrix2D = p.PMatrix2D = function() {
      if (arguments.length === 0) this.reset();
      else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) this.set(arguments[0].array());
      else if (arguments.length === 6) this.set(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
    };
    PMatrix2D.prototype = {
      set: function() {
        if (arguments.length === 6) {
          var a = arguments;
          this.set([a[0], a[1], a[2], a[3], a[4], a[5]])
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) this.elements = arguments[0].array();
        else if (arguments.length === 1 && arguments[0] instanceof Array) this.elements = arguments[0].slice()
      },
      get: function() {
        var outgoing = new PMatrix2D;
        outgoing.set(this.elements);
        return outgoing
      },
      reset: function() {
        this.set([1, 0, 0, 0, 1, 0])
      },
      array: function array() {
        return this.elements.slice()
      },
      translate: function(tx, ty) {
        this.elements[2] = tx * this.elements[0] + ty * this.elements[1] + this.elements[2];
        this.elements[5] = tx * this.elements[3] + ty * this.elements[4] + this.elements[5]
      },
      invTranslate: function(tx, ty) {
        this.translate(-tx, -ty)
      },
      transpose: function() {},
      mult: function(source, target) {
        var x, y;
        if (source instanceof
        PVector) {
          x = source.x;
          y = source.y;
          if (!target) target = new PVector
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          if (!target) target = []
        }
        if (target instanceof Array) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target[1] = this.elements[3] * x + this.elements[4] * y + this.elements[5]
        } else if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target.y = this.elements[3] * x + this.elements[4] * y + this.elements[5];
          target.z = 0
        }
        return target
      },
      multX: function(x, y) {
        return x * this.elements[0] + y * this.elements[1] + this.elements[2]
      },
      multY: function(x, y) {
        return x * this.elements[3] + y * this.elements[4] + this.elements[5]
      },
      skewX: function(angle) {
        this.apply(1, 0, 1, angle, 0, 0)
      },
      skewY: function(angle) {
        this.apply(1, 0, 1, 0, angle, 0)
      },
      shearX: function(angle) {
        this.apply(1, 0, 1, Math.tan(angle), 0, 0)
      },
      shearY: function(angle) {
        this.apply(1, 0, 1, 0, Math.tan(angle), 0)
      },
      determinant: function() {
        return this.elements[0] * this.elements[4] - this.elements[1] * this.elements[3]
      },
      invert: function() {
        var d = this.determinant();
        if (Math.abs(d) > -2147483648) {
          var old00 = this.elements[0];
          var old01 = this.elements[1];
          var old02 = this.elements[2];
          var old10 = this.elements[3];
          var old11 = this.elements[4];
          var old12 = this.elements[5];
          this.elements[0] = old11 / d;
          this.elements[3] = -old10 / d;
          this.elements[1] = -old01 / d;
          this.elements[4] = old00 / d;
          this.elements[2] = (old01 * old12 - old11 * old02) / d;
          this.elements[5] = (old10 * old02 - old00 * old12) / d;
          return true
        }
        return false
      },
      scale: function(sx, sy) {
        if (sx && !sy) sy = sx;
        if (sx && sy) {
          this.elements[0] *= sx;
          this.elements[1] *= sy;
          this.elements[3] *= sx;
          this.elements[4] *= sy
        }
      },
      invScale: function(sx, sy) {
        if (sx && !sy) sy = sx;
        this.scale(1 / sx, 1 / sy)
      },
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) source = arguments[0].array();
        else if (arguments.length === 6) source = Array.prototype.slice.call(arguments);
        else if (arguments.length === 1 && arguments[0] instanceof Array) source = arguments[0];
        var result = [0, 0, this.elements[2], 0, 0, this.elements[5]];
        var e = 0;
        for (var row = 0; row < 2; row++) for (var col = 0; col < 3; col++, e++) result[e] += this.elements[row * 3 + 0] * source[col + 0] + this.elements[row * 3 + 1] * source[col + 3];
        this.elements = result.slice()
      },
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) source = arguments[0].array();
        else if (arguments.length === 6) source = Array.prototype.slice.call(arguments);
        else if (arguments.length === 1 && arguments[0] instanceof Array) source = arguments[0];
        var result = [0, 0, source[2], 0, 0, source[5]];
        result[2] = source[2] + this.elements[2] * source[0] + this.elements[5] * source[1];
        result[5] = source[5] + this.elements[2] * source[3] + this.elements[5] * source[4];
        result[0] = this.elements[0] * source[0] + this.elements[3] * source[1];
        result[3] = this.elements[0] * source[3] + this.elements[3] * source[4];
        result[1] = this.elements[1] * source[0] + this.elements[4] * source[1];
        result[4] = this.elements[1] * source[3] + this.elements[4] * source[4];
        this.elements = result.slice()
      },
      rotate: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var temp1 = this.elements[0];
        var temp2 = this.elements[1];
        this.elements[0] = c * temp1 + s * temp2;
        this.elements[1] = -s * temp1 + c * temp2;
        temp1 = this.elements[3];
        temp2 = this.elements[4];
        this.elements[3] = c * temp1 + s * temp2;
        this.elements[4] = -s * temp1 + c * temp2
      },
      rotateZ: function(angle) {
        this.rotate(angle)
      },
      invRotateZ: function(angle) {
        this.rotateZ(angle - Math.PI)
      },
      print: function() {
        var digits = printMatrixHelper(this.elements);
        var output = "" + p.nfs(this.elements[0], digits, 4) + " " + p.nfs(this.elements[1], digits, 4) + " " + p.nfs(this.elements[2], digits, 4) + "\n" + p.nfs(this.elements[3], digits, 4) + " " + p.nfs(this.elements[4], digits, 4) + " " + p.nfs(this.elements[5], digits, 4) + "\n\n";
        p.println(output)
      }
    };
    var PMatrix3D = p.PMatrix3D = function() {
      this.reset()
    };
    PMatrix3D.prototype = {
      set: function() {
        if (arguments.length === 16) this.elements = Array.prototype.slice.call(arguments);
        else if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) this.elements = arguments[0].array();
        else if (arguments.length === 1 && arguments[0] instanceof Array) this.elements = arguments[0].slice()
      },
      get: function() {
        var outgoing = new PMatrix3D;
        outgoing.set(this.elements);
        return outgoing
      },
      reset: function() {
        this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
      },
      array: function array() {
        return this.elements.slice()
      },
      translate: function(tx, ty, tz) {
        if (tz === undef) tz = 0;
        this.elements[3] += tx * this.elements[0] + ty * this.elements[1] + tz * this.elements[2];
        this.elements[7] += tx * this.elements[4] + ty * this.elements[5] + tz * this.elements[6];
        this.elements[11] += tx * this.elements[8] + ty * this.elements[9] + tz * this.elements[10];
        this.elements[15] += tx * this.elements[12] + ty * this.elements[13] + tz * this.elements[14]
      },
      transpose: function() {
        var temp = this.elements[4];
        this.elements[4] = this.elements[1];
        this.elements[1] = temp;
        temp = this.elements[8];
        this.elements[8] = this.elements[2];
        this.elements[2] = temp;
        temp = this.elements[6];
        this.elements[6] = this.elements[9];
        this.elements[9] = temp;
        temp = this.elements[3];
        this.elements[3] = this.elements[12];
        this.elements[12] = temp;
        temp = this.elements[7];
        this.elements[7] = this.elements[13];
        this.elements[13] = temp;
        temp = this.elements[11];
        this.elements[11] = this.elements[14];
        this.elements[14] = temp
      },
      mult: function(source, target) {
        var x, y, z, w;
        if (source instanceof
        PVector) {
          x = source.x;
          y = source.y;
          z = source.z;
          w = 1;
          if (!target) target = new PVector
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          z = source[2];
          w = source[3] || 1;
          if (!target || target.length !== 3 && target.length !== 4) target = [0, 0, 0]
        }
        if (target instanceof Array) if (target.length === 3) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
          target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
          target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11]
        } else if (target.length === 4) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
          target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
          target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
          target[3] = this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w
        }
        if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
          target.y = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
          target.z = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11]
        }
        return target
      },
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) source = arguments[0].array();
        else if (arguments.length === 16) source = Array.prototype.slice.call(arguments);
        else if (arguments.length === 1 && arguments[0] instanceof Array) source = arguments[0];
        var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) for (var col = 0; col < 4; col++, e++) result[e] += this.elements[col + 0] * source[row * 4 + 0] + this.elements[col + 4] * source[row * 4 + 1] + this.elements[col + 8] * source[row * 4 + 2] + this.elements[col + 12] * source[row * 4 + 3];
        this.elements = result.slice()
      },
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) source = arguments[0].array();
        else if (arguments.length === 16) source = Array.prototype.slice.call(arguments);
        else if (arguments.length === 1 && arguments[0] instanceof Array) source = arguments[0];
        var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) for (var col = 0; col < 4; col++, e++) result[e] += this.elements[row * 4 + 0] * source[col + 0] + this.elements[row * 4 + 1] * source[col + 4] + this.elements[row * 4 + 2] * source[col + 8] + this.elements[row * 4 + 3] * source[col + 12];
        this.elements = result.slice()
      },
      rotate: function(angle, v0, v1, v2) {
        if (!v1) this.rotateZ(angle);
        else {
          var c = p.cos(angle);
          var s = p.sin(angle);
          var t = 1 - c;
          this.apply(t * v0 * v0 + c, t * v0 * v1 - s * v2, t * v0 * v2 + s * v1, 0, t * v0 * v1 + s * v2, t * v1 * v1 + c, t * v1 * v2 - s * v0, 0, t * v0 * v2 - s * v1, t * v1 * v2 + s * v0, t * v2 * v2 + c, 0, 0, 0, 0, 1)
        }
      },
      invApply: function() {
        if (inverseCopy === undef) inverseCopy = new PMatrix3D;
        var a = arguments;
        inverseCopy.set(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
        if (!inverseCopy.invert()) return false;
        this.preApply(inverseCopy);
        return true
      },
      rotateX: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1])
      },
      rotateY: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([c,
          0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1])
      },
      rotateZ: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        this.apply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      },
      scale: function(sx, sy, sz) {
        if (sx && !sy && !sz) sy = sz = sx;
        else if (sx && sy && !sz) sz = 1;
        if (sx && sy && sz) {
          this.elements[0] *= sx;
          this.elements[1] *= sy;
          this.elements[2] *= sz;
          this.elements[4] *= sx;
          this.elements[5] *= sy;
          this.elements[6] *= sz;
          this.elements[8] *= sx;
          this.elements[9] *= sy;
          this.elements[10] *= sz;
          this.elements[12] *= sx;
          this.elements[13] *= sy;
          this.elements[14] *= sz
        }
      },
      skewX: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      },
      skewY: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      },
      shearX: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      },
      shearY: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      },
      multX: function(x, y, z, w) {
        if (!z) return this.elements[0] * x + this.elements[1] * y + this.elements[3];
        if (!w) return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
        return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w
      },
      multY: function(x, y, z, w) {
        if (!z) return this.elements[4] * x + this.elements[5] * y + this.elements[7];
        if (!w) return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
        return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w
      },
      multZ: function(x, y, z, w) {
        if (!w) return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w
      },
      multW: function(x, y, z, w) {
        if (!w) return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15];
        return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w
      },
      invert: function() {
        var fA0 = this.elements[0] * this.elements[5] - this.elements[1] * this.elements[4];
        var fA1 = this.elements[0] * this.elements[6] - this.elements[2] * this.elements[4];
        var fA2 = this.elements[0] * this.elements[7] - this.elements[3] * this.elements[4];
        var fA3 = this.elements[1] * this.elements[6] - this.elements[2] * this.elements[5];
        var fA4 = this.elements[1] * this.elements[7] - this.elements[3] * this.elements[5];
        var fA5 = this.elements[2] * this.elements[7] - this.elements[3] * this.elements[6];
        var fB0 = this.elements[8] * this.elements[13] - this.elements[9] * this.elements[12];
        var fB1 = this.elements[8] * this.elements[14] - this.elements[10] * this.elements[12];
        var fB2 = this.elements[8] * this.elements[15] - this.elements[11] * this.elements[12];
        var fB3 = this.elements[9] * this.elements[14] - this.elements[10] * this.elements[13];
        var fB4 = this.elements[9] * this.elements[15] - this.elements[11] * this.elements[13];
        var fB5 = this.elements[10] * this.elements[15] - this.elements[11] * this.elements[14];
        var fDet = fA0 * fB5 - fA1 * fB4 + fA2 * fB3 + fA3 * fB2 - fA4 * fB1 + fA5 * fB0;
        if (Math.abs(fDet) <= 1.0E-9) return false;
        var kInv = [];
        kInv[0] = +this.elements[5] * fB5 - this.elements[6] * fB4 + this.elements[7] * fB3;
        kInv[4] = -this.elements[4] * fB5 + this.elements[6] * fB2 - this.elements[7] * fB1;
        kInv[8] = +this.elements[4] * fB4 - this.elements[5] * fB2 + this.elements[7] * fB0;
        kInv[12] = -this.elements[4] * fB3 + this.elements[5] * fB1 - this.elements[6] * fB0;
        kInv[1] = -this.elements[1] * fB5 + this.elements[2] * fB4 - this.elements[3] * fB3;
        kInv[5] = +this.elements[0] * fB5 - this.elements[2] * fB2 + this.elements[3] * fB1;
        kInv[9] = -this.elements[0] * fB4 + this.elements[1] * fB2 - this.elements[3] * fB0;
        kInv[13] = +this.elements[0] * fB3 - this.elements[1] * fB1 + this.elements[2] * fB0;
        kInv[2] = +this.elements[13] * fA5 - this.elements[14] * fA4 + this.elements[15] * fA3;
        kInv[6] = -this.elements[12] * fA5 + this.elements[14] * fA2 - this.elements[15] * fA1;
        kInv[10] = +this.elements[12] * fA4 - this.elements[13] * fA2 + this.elements[15] * fA0;
        kInv[14] = -this.elements[12] * fA3 + this.elements[13] * fA1 - this.elements[14] * fA0;
        kInv[3] = -this.elements[9] * fA5 + this.elements[10] * fA4 - this.elements[11] * fA3;
        kInv[7] = +this.elements[8] * fA5 - this.elements[10] * fA2 + this.elements[11] * fA1;
        kInv[11] = -this.elements[8] * fA4 + this.elements[9] * fA2 - this.elements[11] * fA0;
        kInv[15] = +this.elements[8] * fA3 - this.elements[9] * fA1 + this.elements[10] * fA0;
        var fInvDet = 1 / fDet;
        kInv[0] *= fInvDet;
        kInv[1] *= fInvDet;
        kInv[2] *= fInvDet;
        kInv[3] *= fInvDet;
        kInv[4] *= fInvDet;
        kInv[5] *= fInvDet;
        kInv[6] *= fInvDet;
        kInv[7] *= fInvDet;
        kInv[8] *= fInvDet;
        kInv[9] *= fInvDet;
        kInv[10] *= fInvDet;
        kInv[11] *= fInvDet;
        kInv[12] *= fInvDet;
        kInv[13] *= fInvDet;
        kInv[14] *= fInvDet;
        kInv[15] *= fInvDet;
        this.elements = kInv.slice();
        return true
      },
      toString: function() {
        var str = "";
        for (var i = 0; i < 15; i++) str += this.elements[i] + ", ";
        str += this.elements[15];
        return str
      },
      print: function() {
        var digits = printMatrixHelper(this.elements);
        var output = "" + p.nfs(this.elements[0], digits, 4) + " " + p.nfs(this.elements[1], digits, 4) + " " + p.nfs(this.elements[2], digits, 4) + " " + p.nfs(this.elements[3], digits, 4) + "\n" + p.nfs(this.elements[4], digits, 4) + " " + p.nfs(this.elements[5], digits, 4) + " " + p.nfs(this.elements[6], digits, 4) + " " + p.nfs(this.elements[7], digits, 4) + "\n" + p.nfs(this.elements[8], digits, 4) + " " + p.nfs(this.elements[9], digits, 4) + " " + p.nfs(this.elements[10], digits, 4) + " " + p.nfs(this.elements[11], digits, 4) + "\n" + p.nfs(this.elements[12], digits, 4) + " " + p.nfs(this.elements[13], digits, 4) + " " + p.nfs(this.elements[14], digits, 4) + " " + p.nfs(this.elements[15], digits, 4) + "\n\n";
        p.println(output)
      },
      invTranslate: function(tx, ty, tz) {
        this.preApply(1, 0, 0, -tx, 0, 1, 0, -ty, 0, 0, 1, -tz, 0, 0, 0, 1)
      },
      invRotateX: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1])
      },
      invRotateY: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1])
      },
      invRotateZ: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      },
      invScale: function(x, y, z) {
        this.preApply([1 / x, 0, 0, 0, 0, 1 / y, 0, 0, 0, 0, 1 / z, 0, 0, 0, 0, 1])
      }
    };
    var PMatrixStack = p.PMatrixStack = function() {
      this.matrixStack = []
    };
    PMatrixStack.prototype.load = function() {
      var tmpMatrix = drawing.$newPMatrix();
      if (arguments.length === 1) tmpMatrix.set(arguments[0]);
      else tmpMatrix.set(arguments);
      this.matrixStack.push(tmpMatrix)
    };
    Drawing2D.prototype.$newPMatrix = function() {
      return new PMatrix2D
    };
    Drawing3D.prototype.$newPMatrix = function() {
      return new PMatrix3D
    };
    PMatrixStack.prototype.push = function() {
      this.matrixStack.push(this.peek())
    };
    PMatrixStack.prototype.pop = function() {
      return this.matrixStack.pop()
    };
    PMatrixStack.prototype.peek = function() {
      var tmpMatrix = drawing.$newPMatrix();
      tmpMatrix.set(this.matrixStack[this.matrixStack.length - 1]);
      return tmpMatrix
    };
    PMatrixStack.prototype.mult = function(matrix) {
      this.matrixStack[this.matrixStack.length - 1].apply(matrix)
    };
    p.split = function(str, delim) {
      return str.split(delim)
    };
    p.splitTokens = function(str, tokens) {
      if (tokens === undef) return str.split(/\s+/g);
      var chars = tokens.split(/()/g),
        buffer = "",
        len = str.length,
        i, c, tokenized = [];
      for (i = 0; i < len; i++) {
        c = str[i];
        if (chars.indexOf(c) > -1) {
          if (buffer !== "") tokenized.push(buffer);
          buffer = ""
        } else buffer += c
      }
      if (buffer !== "") tokenized.push(buffer);
      return tokenized
    };
    p.append = function(array, element) {
      array[array.length] = element;
      return array
    };
    p.concat = function(array1, array2) {
      return array1.concat(array2)
    };
    p.sort = function(array, numElem) {
      var ret = [];
      if (array.length > 0) {
        var elemsToCopy = numElem > 0 ? numElem : array.length;
        for (var i = 0; i < elemsToCopy; i++) ret.push(array[i]);
        if (typeof array[0] === "string") ret.sort();
        else ret.sort(function(a, b) {
          return a - b
        });
        if (numElem > 0) for (var j = ret.length; j < array.length; j++) ret.push(array[j])
      }
      return ret
    };
    p.splice = function(array, value, index) {
      if (value.length === 0) return array;
      if (value instanceof Array) for (var i = 0, j = index; i < value.length; j++, i++) array.splice(j, 0, value[i]);
      else array.splice(index, 0, value);
      return array
    };
    p.subset = function(array, offset, length) {
      var end = length !== undef ? offset + length : array.length;
      return array.slice(offset, end)
    };
    p.join = function(array, seperator) {
      return array.join(seperator)
    };
    p.shorten = function(ary) {
      var newary = [];
      var len = ary.length;
      for (var i = 0; i < len; i++) newary[i] = ary[i];
      newary.pop();
      return newary
    };
    p.expand = function(ary, targetSize) {
      var temp = ary.slice(0),
        newSize = targetSize || ary.length * 2;
      temp.length = newSize;
      return temp
    };
    p.arrayCopy = function() {
      var src, srcPos = 0,
        dest, destPos = 0,
        length;
      if (arguments.length === 2) {
        src = arguments[0];
        dest = arguments[1];
        length = src.length
      } else if (arguments.length === 3) {
        src = arguments[0];
        dest = arguments[1];
        length = arguments[2]
      } else if (arguments.length === 5) {
        src = arguments[0];
        srcPos = arguments[1];
        dest = arguments[2];
        destPos = arguments[3];
        length = arguments[4]
      }
      for (var i = srcPos, j = destPos; i < length + srcPos; i++, j++) if (dest[j] !== undef) dest[j] = src[i];
      else throw "array index out of bounds exception";
    };
    p.reverse = function(array) {
      return array.reverse()
    };
    p.mix = function(a, b, f) {
      return a + ((b - a) * f >> 8)
    };
    p.peg = function(n) {
      return n < 0 ? 0 : n > 255 ? 255 : n
    };
    p.modes = function() {
      var ALPHA_MASK = 4278190080,
        RED_MASK = 16711680,
        GREEN_MASK = 65280,
        BLUE_MASK = 255,
        min = Math.min,
        max = Math.max;

      function applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) {
        var a = min(((c1 & 4278190080) >>> 24) + f, 255) << 24;
        var r = ar + ((cr - ar) * f >> 8);
        r = (r < 0 ? 0 : r > 255 ? 255 : r) << 16;
        var g = ag + ((cg - ag) * f >> 8);
        g = (g < 0 ? 0 : g > 255 ? 255 : g) << 8;
        var b = ab + ((cb - ab) * f >> 8);
        b = b < 0 ? 0 : b > 255 ? 255 : b;
        return a | r | g | b
      }
      return {
        replace: function(c1, c2) {
          return c2
        },
        blend: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = c1 & RED_MASK,
            ag = c1 & GREEN_MASK,
            ab = c1 & BLUE_MASK,
            br = c2 & RED_MASK,
            bg = c2 & GREEN_MASK,
            bb = c2 & BLUE_MASK;
          return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | ar + ((br - ar) * f >> 8) & RED_MASK | ag + ((bg - ag) * f >> 8) & GREEN_MASK | ab + ((bb - ab) * f >> 8) & BLUE_MASK
        },
        add: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | min((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f, RED_MASK) & RED_MASK | min((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f, GREEN_MASK) & GREEN_MASK | min((c1 & BLUE_MASK) + ((c2 & BLUE_MASK) * f >> 8), BLUE_MASK)
        },
        subtract: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | max((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f, GREEN_MASK) & RED_MASK | max((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f, BLUE_MASK) & GREEN_MASK | max((c1 & BLUE_MASK) - ((c2 & BLUE_MASK) * f >> 8), 0)
        },
        lightest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK | max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK | max(c1 & BLUE_MASK, (c2 & BLUE_MASK) * f >> 8)
        },
        darkest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = c1 & RED_MASK,
            ag = c1 & GREEN_MASK,
            ab = c1 & BLUE_MASK,
            br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f),
            bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f),
            bb = min(c1 & BLUE_MASK, (c2 & BLUE_MASK) * f >> 8);
          return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | ar + ((br - ar) * f >> 8) & RED_MASK | ag + ((bg - ag) * f >> 8) & GREEN_MASK | ab + ((bb - ab) * f >> 8) & BLUE_MASK
        },
        difference: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK,
            cr = ar > br ? ar - br : br - ar,
          cg = ag > bg ? ag - bg : bg - ag,
          cb = ab > bb ? ab - bb : bb - ab;
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        exclusion: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK,
            cr = ar + br - (ar * br >> 7),
            cg = ag + bg - (ag * bg >> 7),
            cb = ab + bb - (ab * bb >> 7);
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        multiply: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK,
            cr = ar * br >> 8,
            cg = ag * bg >> 8,
            cb = ab * bb >> 8;
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        screen: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK,
            cr = 255 - ((255 - ar) * (255 - br) >> 8),
            cg = 255 - ((255 - ag) * (255 - bg) >> 8),
            cb = 255 - ((255 - ab) * (255 - bb) >> 8);
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        hard_light: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK,
            cr = br < 128 ? ar * br >> 7 : 255 - ((255 - ar) * (255 - br) >> 7),
          cg = bg < 128 ? ag * bg >> 7 : 255 - ((255 - ag) * (255 - bg) >> 7),
          cb = bb < 128 ? ab * bb >> 7 : 255 - ((255 - ab) * (255 - bb) >> 7);
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        soft_light: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK,
            cr = (ar * br >> 7) + (ar * ar >> 8) - (ar * ar * br >> 15),
            cg = (ag * bg >> 7) + (ag * ag >> 8) - (ag * ag * bg >> 15),
            cb = (ab * bb >> 7) + (ab * ab >> 8) - (ab * ab * bb >> 15);
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        overlay: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK,
            cr = ar < 128 ? ar * br >> 7 : 255 - ((255 - ar) * (255 - br) >> 7),
          cg = ag < 128 ? ag * bg >> 7 : 255 - ((255 - ag) * (255 - bg) >> 7),
          cb = ab < 128 ? ab * bb >> 7 : 255 - ((255 - ab) * (255 - bb) >> 7);
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        dodge: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK;
          var cr = 255;
          if (br !== 255) {
            cr = (ar << 8) / (255 - br);
            cr = cr < 0 ? 0 : cr > 255 ? 255 : cr
          }
          var cg = 255;
          if (bg !== 255) {
            cg = (ag << 8) / (255 - bg);
            cg = cg < 0 ? 0 : cg > 255 ? 255 : cg
          }
          var cb = 255;
          if (bb !== 255) {
            cb = (ab << 8) / (255 - bb);
            cb = cb < 0 ? 0 : cb > 255 ? 255 : cb
          }
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        },
        burn: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = c1 & BLUE_MASK,
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = c2 & BLUE_MASK;
          var cr = 0;
          if (br !== 0) {
            cr = (255 - ar << 8) / br;
            cr = 255 - (cr < 0 ? 0 : cr > 255 ? 255 : cr)
          }
          var cg = 0;
          if (bg !== 0) {
            cg = (255 - ag << 8) / bg;
            cg = 255 - (cg < 0 ? 0 : cg > 255 ? 255 : cg)
          }
          var cb = 0;
          if (bb !== 0) {
            cb = (255 - ab << 8) / bb;
            cb = 255 - (cb < 0 ? 0 : cb > 255 ? 255 : cb)
          }
          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
        }
      }
    }();

    function color$4(aValue1, aValue2, aValue3, aValue4) {
      var r, g, b, a;
      if (curColorMode === 3) {
        var rgb = p.color.toRGB(aValue1, aValue2, aValue3);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2]
      } else {
        r = Math.round(255 * (aValue1 / colorModeX));
        g = Math.round(255 * (aValue2 / colorModeY));
        b = Math.round(255 * (aValue3 / colorModeZ))
      }
      a = Math.round(255 * (aValue4 / colorModeA));
      r = r < 0 ? 0 : r;
      g = g < 0 ? 0 : g;
      b = b < 0 ? 0 : b;
      a = a < 0 ? 0 : a;
      r = r > 255 ? 255 : r;
      g = g > 255 ? 255 : g;
      b = b > 255 ? 255 : b;
      a = a > 255 ? 255 : a;
      return a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255
    }
    function color$2(aValue1, aValue2) {
      var a;
      if (aValue1 & 4278190080) {
        a = Math.round(255 * (aValue2 / colorModeA));
        a = a > 255 ? 255 : a;
        a = a < 0 ? 0 : a;
        return aValue1 - (aValue1 & 4278190080) + (a << 24 & 4278190080)
      }
      if (curColorMode === 1) return color$4(aValue1, aValue1, aValue1, aValue2);
      if (curColorMode === 3) return color$4(0, 0, aValue1 / colorModeX * colorModeZ, aValue2)
    }
    function color$1(aValue1) {
      if (aValue1 <= colorModeX && aValue1 >= 0) {
        if (curColorMode === 1) return color$4(aValue1, aValue1, aValue1, colorModeA);
        if (curColorMode === 3) return color$4(0, 0, aValue1 / colorModeX * colorModeZ, colorModeA)
      }
      if (aValue1) {
        if (aValue1 > 2147483647) aValue1 -= 4294967296;
        return aValue1
      }
    }
    p.color = function(aValue1, aValue2, aValue3, aValue4) {
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef && aValue4 !== undef) return color$4(aValue1, aValue2, aValue3, aValue4);
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef) return color$4(aValue1, aValue2, aValue3, colorModeA);
      if (aValue1 !== undef && aValue2 !== undef) return color$2(aValue1, aValue2);
      if (typeof aValue1 === "number") return color$1(aValue1);
      return color$4(colorModeX, colorModeY, colorModeZ, colorModeA)
    };
    p.color.toString = function(colorInt) {
      return "rgba(" + ((colorInt >> 16) & 255) + "," + ((colorInt >> 8) & 255) + "," + (colorInt & 255) + "," + ((colorInt >> 24) & 255) / 255 + ")"
    };
    p.color.toInt = function(r, g, b, a) {
      return a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255
    };
    p.color.toArray = function(colorInt) {
      return [(colorInt >> 16) & 255, (colorInt >> 8) & 255, colorInt & 255, (colorInt >> 24) & 255]
    };
    p.color.toGLArray = function(colorInt) {
      return [((colorInt & 16711680) >>> 16) / 255, ((colorInt >> 8) & 255) / 255, (colorInt & 255) / 255, ((colorInt >> 24) & 255) / 255]
    };
    p.color.toRGB = function(h, s, b) {
      h = h > colorModeX ? colorModeX : h;
      s = s > colorModeY ? colorModeY : s;
      b = b > colorModeZ ? colorModeZ : b;
      h = h / colorModeX * 360;
      s = s / colorModeY * 100;
      b = b / colorModeZ * 100;
      var br = Math.round(b / 100 * 255);
      if (s === 0) return [br, br, br];
      var hue = h % 360;
      var f = hue % 60;
      var p = Math.round(b * (100 - s) / 1E4 * 255);
      var q = Math.round(b * (6E3 - s * f) / 6E5 * 255);
      var t = Math.round(b * (6E3 - s * (60 - f)) / 6E5 * 255);
      switch (Math.floor(hue / 60)) {
      case 0:
        return [br, t, p];
      case 1:
        return [q, br, p];
      case 2:
        return [p, br, t];
      case 3:
        return [p, q, br];
      case 4:
        return [t, p, br];
      case 5:
        return [br, p, q]
      }
    };

    function colorToHSB(colorInt) {
      var red, green, blue;
      red = ((colorInt >> 16) & 255) / 255;
      green = ((colorInt >> 8) & 255) / 255;
      blue = (colorInt & 255) / 255;
      var max = p.max(p.max(red, green), blue),
        min = p.min(p.min(red, green), blue),
        hue, saturation;
      if (min === max) return [0, 0, max * colorModeZ];
      saturation = (max - min) / max;
      if (red === max) hue = (green - blue) / (max - min);
      else if (green === max) hue = 2 + (blue - red) / (max - min);
      else hue = 4 + (red - green) / (max - min);
      hue /= 6;
      if (hue < 0) hue += 1;
      else if (hue > 1) hue -= 1;
      return [hue * colorModeX, saturation * colorModeY, max * colorModeZ]
    }
    p.brightness = function(colInt) {
      return colorToHSB(colInt)[2]
    };
    p.saturation = function(colInt) {
      return colorToHSB(colInt)[1]
    };
    p.hue = function(colInt) {
      return colorToHSB(colInt)[0]
    };
    p.red = function(aColor) {
      return ((aColor >> 16) & 255) / 255 * colorModeX
    };
    p.green = function(aColor) {
      return ((aColor & 65280) >>> 8) / 255 * colorModeY
    };
    p.blue = function(aColor) {
      return (aColor & 255) / 255 * colorModeZ
    };
    p.alpha = function(aColor) {
      return ((aColor >> 24) & 255) / 255 * colorModeA
    };
    p.lerpColor = function(c1, c2, amt) {
      var r, g, b, a, r1, g1, b1, a1, r2, g2, b2, a2;
      var hsb1, hsb2, rgb, h, s;
      var colorBits1 = p.color(c1);
      var colorBits2 = p.color(c2);
      if (curColorMode === 3) {
        hsb1 = colorToHSB(colorBits1);
        a1 = ((colorBits1 >> 24) & 255) / colorModeA;
        hsb2 = colorToHSB(colorBits2);
        a2 = ((colorBits2 & 4278190080) >>> 24) / colorModeA;
        h = p.lerp(hsb1[0], hsb2[0], amt);
        s = p.lerp(hsb1[1], hsb2[1], amt);
        b = p.lerp(hsb1[2], hsb2[2], amt);
        rgb = p.color.toRGB(h, s, b);
        a = p.lerp(a1, a2, amt) * colorModeA;
        return a << 24 & 4278190080 | (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255
      }
      r1 = (colorBits1 >> 16) & 255;
      g1 = (colorBits1 >> 8) & 255;
      b1 = colorBits1 & 255;
      a1 = ((colorBits1 >> 24) & 255) / colorModeA;
      r2 = (colorBits2 & 16711680) >>> 16;
      g2 = (colorBits2 >> 8) & 255;
      b2 = colorBits2 & 255;
      a2 = ((colorBits2 >> 24) & 255) / colorModeA;
      r = p.lerp(r1, r2, amt) | 0;
      g = p.lerp(g1, g2, amt) | 0;
      b = p.lerp(b1, b2, amt) | 0;
      a = p.lerp(a1, a2, amt) * colorModeA;
      return a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255
    };
    p.colorMode = function() {
      curColorMode = arguments[0];
      if (arguments.length > 1) {
        colorModeX = arguments[1];
        colorModeY = arguments[2] || arguments[1];
        colorModeZ = arguments[3] || arguments[1];
        colorModeA = arguments[4] || arguments[1]
      }
    };
    p.blendColor = function(c1, c2, mode) {
      if (mode === 0) return p.modes.replace(c1, c2);
      else if (mode === 1) return p.modes.blend(c1, c2);
      else if (mode === 2) return p.modes.add(c1, c2);
      else if (mode === 4) return p.modes.subtract(c1, c2);
      else if (mode === 8) return p.modes.lightest(c1, c2);
      else if (mode === 16) return p.modes.darkest(c1, c2);
      else if (mode === 32) return p.modes.difference(c1, c2);
      else if (mode === 64) return p.modes.exclusion(c1, c2);
      else if (mode === 128) return p.modes.multiply(c1, c2);
      else if (mode === 256) return p.modes.screen(c1, c2);
      else if (mode === 1024) return p.modes.hard_light(c1, c2);
      else if (mode === 2048) return p.modes.soft_light(c1, c2);
      else if (mode === 512) return p.modes.overlay(c1, c2);
      else if (mode === 4096) return p.modes.dodge(c1, c2);
      else if (mode === 8192) return p.modes.burn(c1, c2)
    };

    function saveContext() {
      curContext.save()
    }
    function restoreContext() {
      curContext.restore();
      isStrokeDirty = true;
      isFillDirty = true
    }
    p.printMatrix = function() {
      modelView.print()
    };
    Drawing2D.prototype.translate = function(x, y) {
      modelView.translate(x, y);
      modelViewInv.invTranslate(x, y);
      curContext.translate(x, y)
    };
    Drawing3D.prototype.translate = function(x, y, z) {
      modelView.translate(x, y, z);
      modelViewInv.invTranslate(x, y, z)
    };
    Drawing2D.prototype.scale = function(x, y) {
      modelView.scale(x, y);
      modelViewInv.invScale(x, y);
      curContext.scale(x, y || x)
    };
    Drawing3D.prototype.scale = function(x, y, z) {
      modelView.scale(x, y, z);
      modelViewInv.invScale(x, y, z)
    };
    Drawing2D.prototype.transform = function(pmatrix) {
      var e = pmatrix.array();
      curContext.transform(e[0], e[3], e[1], e[4], e[2], e[5])
    };
    Drawing3D.prototype.transformm = function(pmatrix3d) {
      throw "p.transform is currently not supported in 3D mode";
    };
    Drawing2D.prototype.pushMatrix = function() {
      userMatrixStack.load(modelView);
      userReverseMatrixStack.load(modelViewInv);
      saveContext()
    };
    Drawing3D.prototype.pushMatrix = function() {
      userMatrixStack.load(modelView);
      userReverseMatrixStack.load(modelViewInv)
    };
    Drawing2D.prototype.popMatrix = function() {
      modelView.set(userMatrixStack.pop());
      modelViewInv.set(userReverseMatrixStack.pop());
      restoreContext()
    };
    Drawing3D.prototype.popMatrix = function() {
      modelView.set(userMatrixStack.pop());
      modelViewInv.set(userReverseMatrixStack.pop())
    };
    Drawing2D.prototype.resetMatrix = function() {
      modelView.reset();
      modelViewInv.reset();
      curContext.setTransform(1, 0, 0, 1, 0, 0)
    };
    Drawing3D.prototype.resetMatrix = function() {
      modelView.reset();
      modelViewInv.reset()
    };
    DrawingShared.prototype.applyMatrix = function() {
      var a = arguments;
      modelView.apply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
      modelViewInv.invApply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15])
    };
    Drawing2D.prototype.applyMatrix = function() {
      var a = arguments;
      for (var cnt = a.length; cnt < 16; cnt++) a[cnt] = 0;
      a[10] = a[15] = 1;
      DrawingShared.prototype.applyMatrix.apply(this, a)
    };
    p.rotateX = function(angleInRadians) {
      modelView.rotateX(angleInRadians);
      modelViewInv.invRotateX(angleInRadians)
    };
    Drawing2D.prototype.rotateZ = function() {
      throw "rotateZ() is not supported in 2D mode. Use rotate(float) instead.";
    };
    Drawing3D.prototype.rotateZ = function(angleInRadians) {
      modelView.rotateZ(angleInRadians);
      modelViewInv.invRotateZ(angleInRadians)
    };
    p.rotateY = function(angleInRadians) {
      modelView.rotateY(angleInRadians);
      modelViewInv.invRotateY(angleInRadians)
    };
    Drawing2D.prototype.rotate = function(angleInRadians) {
      modelView.rotateZ(angleInRadians);
      modelViewInv.invRotateZ(angleInRadians);
      curContext.rotate(angleInRadians)
    };
    Drawing3D.prototype.rotate = function(angleInRadians) {
      p.rotateZ(angleInRadians)
    };
    Drawing2D.prototype.shearX = function(angleInRadians) {
      modelView.shearX(angleInRadians);
      curContext.transform(1, 0, angleInRadians, 1, 0, 0)
    };
    Drawing3D.prototype.shearX = function(angleInRadians) {
      modelView.shearX(angleInRadians)
    };
    Drawing2D.prototype.shearY = function(angleInRadians) {
      modelView.shearY(angleInRadians);
      curContext.transform(1, angleInRadians, 0, 1, 0, 0)
    };
    Drawing3D.prototype.shearY = function(angleInRadians) {
      modelView.shearY(angleInRadians)
    };
    p.pushStyle = function() {
      saveContext();
      p.pushMatrix();
      var newState = {
        "doFill": doFill,
        "currentFillColor": currentFillColor,
        "doStroke": doStroke,
        "currentStrokeColor": currentStrokeColor,
        "curTint": curTint,
        "curRectMode": curRectMode,
        "curColorMode": curColorMode,
        "colorModeX": colorModeX,
        "colorModeZ": colorModeZ,
        "colorModeY": colorModeY,
        "colorModeA": colorModeA,
        "curTextFont": curTextFont,
        "horizontalTextAlignment": horizontalTextAlignment,
        "verticalTextAlignment": verticalTextAlignment,
        "textMode": textMode,
        "curFontName": curFontName,
        "curTextSize": curTextSize,
        "curTextAscent": curTextAscent,
        "curTextDescent": curTextDescent,
        "curTextLeading": curTextLeading
      };
      styleArray.push(newState)
    };
    p.popStyle = function() {
      var oldState = styleArray.pop();
      if (oldState) {
        restoreContext();
        p.popMatrix();
        doFill = oldState.doFill;
        currentFillColor = oldState.currentFillColor;
        doStroke = oldState.doStroke;
        currentStrokeColor = oldState.currentStrokeColor;
        curTint = oldState.curTint;
        curRectMode = oldState.curRectMode;
        curColorMode = oldState.curColorMode;
        colorModeX = oldState.colorModeX;
        colorModeZ = oldState.colorModeZ;
        colorModeY = oldState.colorModeY;
        colorModeA = oldState.colorModeA;
        curTextFont = oldState.curTextFont;
        curFontName = oldState.curFontName;
        curTextSize = oldState.curTextSize;
        horizontalTextAlignment = oldState.horizontalTextAlignment;
        verticalTextAlignment = oldState.verticalTextAlignment;
        textMode = oldState.textMode;
        curTextAscent = oldState.curTextAscent;
        curTextDescent = oldState.curTextDescent;
        curTextLeading = oldState.curTextLeading
      } else throw "Too many popStyle() without enough pushStyle()";
    };
    p.year = function() {
      return (new Date).getFullYear()
    };
    p.month = function() {
      return (new Date).getMonth() + 1
    };
    p.day = function() {
      return (new Date).getDate()
    };
    p.hour = function() {
      return (new Date).getHours()
    };
    p.minute = function() {
      return (new Date).getMinutes()
    };
    p.second = function() {
      return (new Date).getSeconds()
    };
    p.millis = function() {
      return Date.now() - start
    };

    function redrawHelper() {
      var sec = (Date.now() - timeSinceLastFPS) / 1E3;
      framesSinceLastFPS++;
      var fps = framesSinceLastFPS / sec;
      if (sec > 0.5) {
        timeSinceLastFPS = Date.now();
        framesSinceLastFPS = 0;
        p.__frameRate = fps
      }
      p.frameCount++
    }
    Drawing2D.prototype.redraw = function() {
      redrawHelper();
      curContext.lineWidth = lineWidth;
      var pmouseXLastEvent = p.pmouseX,
        pmouseYLastEvent = p.pmouseY;
      p.pmouseX = pmouseXLastFrame;
      p.pmouseY = pmouseYLastFrame;
      saveContext();
      p.draw();
      restoreContext();
      pmouseXLastFrame = p.mouseX;
      pmouseYLastFrame = p.mouseY;
      p.pmouseX = pmouseXLastEvent;
      p.pmouseY = pmouseYLastEvent
    };
    Drawing3D.prototype.redraw = function() {
      redrawHelper();
      var pmouseXLastEvent = p.pmouseX,
        pmouseYLastEvent = p.pmouseY;
      p.pmouseX = pmouseXLastFrame;
      p.pmouseY = pmouseYLastFrame;
      curContext.clear(curContext.DEPTH_BUFFER_BIT);
      curContextCache = {
        attributes: {},
        locations: {}
      };
      p.noLights();
      p.lightFalloff(1, 0, 0);
      p.shininess(1);
      p.ambient(255, 255, 255);
      p.specular(0, 0, 0);
      p.emissive(0, 0, 0);
      p.camera();
      p.draw();
      pmouseXLastFrame = p.mouseX;
      pmouseYLastFrame = p.mouseY;
      p.pmouseX = pmouseXLastEvent;
      p.pmouseY = pmouseYLastEvent
    };
    p.noLoop = function() {
      doLoop = false;
      loopStarted = false;
      clearInterval(looping);
      curSketch.onPause()
    };
    p.loop = function() {
      if (loopStarted) return;
      timeSinceLastFPS = Date.now();
      framesSinceLastFPS = 0;
      looping = window.setInterval(function() {
        try {
          curSketch.onFrameStart();
          p.redraw();
          curSketch.onFrameEnd()
        } catch(e_loop) {
          window.clearInterval(looping);
          throw e_loop;
        }
      },
      curMsPerFrame);
      doLoop = true;
      loopStarted = true;
      curSketch.onLoop()
    };
    p.frameRate = function(aRate) {
      curFrameRate = aRate;
      curMsPerFrame = 1E3 / curFrameRate;
      if (doLoop) {
        p.noLoop();
        p.loop()
      }
    };
    var eventHandlers = [];

    function attachEventHandler(elem, type, fn) {
      if (elem.addEventListener) elem.addEventListener(type, fn, false);
      else elem.attachEvent("on" + type, fn);
      eventHandlers.push({
        elem: elem,
        type: type,
        fn: fn
      })
    }
    function detachEventHandler(eventHandler) {
      var elem = eventHandler.elem,
        type = eventHandler.type,
        fn = eventHandler.fn;
      if (elem.removeEventListener) elem.removeEventListener(type, fn, false);
      else if (elem.detachEvent) elem.detachEvent("on" + type, fn)
    }
    p.exit = function() {
      window.clearInterval(looping);
      removeInstance(p.externals.canvas.id);
      delete curElement.onmousedown;
      for (var lib in Processing.lib) if (Processing.lib.hasOwnProperty(lib)) if (Processing.lib[lib].hasOwnProperty("detach")) Processing.lib[lib].detach(p);
      var i = eventHandlers.length;
      while (i--) detachEventHandler(eventHandlers[i]);
      curSketch.onExit()
    };
    p.cursor = function() {
      if (arguments.length > 1 || arguments.length === 1 && arguments[0] instanceof p.PImage) {
        var image = arguments[0],
          x, y;
        if (arguments.length >= 3) {
          x = arguments[1];
          y = arguments[2];
          if (x < 0 || y < 0 || y >= image.height || x >= image.width) throw "x and y must be non-negative and less than the dimensions of the image";
        } else {
          x = image.width >>> 1;
          y = image.height >>> 1
        }
        var imageDataURL = image.toDataURL();
        var style = 'url("' + imageDataURL + '") ' + x + " " + y + ", default";
        curCursor = curElement.style.cursor = style
      } else if (arguments.length === 1) {
        var mode = arguments[0];
        curCursor = curElement.style.cursor = mode
      } else curCursor = curElement.style.cursor = oldCursor
    };
    p.noCursor = function() {
      curCursor = curElement.style.cursor = PConstants.NOCURSOR
    };
    p.link = function(href, target) {
      if (target !== undef) window.open(href, target);
      else window.location = href
    };
    p.beginDraw = nop;
    p.endDraw = nop;
    Drawing2D.prototype.toImageData = function(x, y, w, h) {
      x = x !== undef ? x : 0;
      y = y !== undef ? y : 0;
      w = w !== undef ? w : p.width;
      h = h !== undef ? h : p.height;
      return curContext.getImageData(x, y, w, h)
    };
    Drawing3D.prototype.toImageData = function(x, y, w, h) {
      x = x !== undef ? x : 0;
      y = y !== undef ? y : 0;
      w = w !== undef ? w : p.width;
      h = h !== undef ? h : p.height;
      var c = document.createElement("canvas"),
        ctx = c.getContext("2d"),
        obj = ctx.createImageData(w, h),
        uBuff = new Uint8Array(w * h * 4);
      curContext.readPixels(x, y, w, h, curContext.RGBA, curContext.UNSIGNED_BYTE, uBuff);
      for (var i = 0, ul = uBuff.length, obj_data = obj.data; i < ul; i++) obj_data[i] = uBuff[(h - 1 - Math.floor(i / 4 / w)) * w * 4 + i % (w * 4)];
      return obj
    };
    p.status = function(text) {
      window.status = text
    };
    p.binary = function(num, numBits) {
      var bit;
      if (numBits > 0) bit = numBits;
      else if (num instanceof Char) {
        bit = 16;
        num |= 0
      } else {
        bit = 32;
        while (bit > 1 && !(num >>> bit - 1 & 1)) bit--
      }
      var result = "";
      while (bit > 0) result += num >>> --bit & 1 ? "1" : "0";
      return result
    };
    p.unbinary = function(binaryString) {
      var i = binaryString.length - 1,
        mask = 1,
        result = 0;
      while (i >= 0) {
        var ch = binaryString[i--];
        if (ch !== "0" && ch !== "1") throw "the value passed into unbinary was not an 8 bit binary number";
        if (ch === "1") result += mask;
        mask <<= 1
      }
      return result
    };

    function nfCoreScalar(value, plus, minus, leftDigits, rightDigits, group) {
      var sign = value < 0 ? minus : plus;
      var autoDetectDecimals = rightDigits === 0;
      var rightDigitsOfDefault = rightDigits === undef || rightDigits < 0 ? 0 : rightDigits;
      var absValue = Math.abs(value);
      if (autoDetectDecimals) {
        rightDigitsOfDefault = 1;
        absValue *= 10;
        while (Math.abs(Math.round(absValue) - absValue) > 1.0E-6 && rightDigitsOfDefault < 7) {
          ++rightDigitsOfDefault;
          absValue *= 10
        }
      } else if (rightDigitsOfDefault !== 0) absValue *= Math.pow(10, rightDigitsOfDefault);
      var number, doubled = absValue * 2;
      if (Math.floor(absValue) === absValue) number = absValue;
      else if (Math.floor(doubled) === doubled) {
        var floored = Math.floor(absValue);
        number = floored + floored % 2
      } else number = Math.round(absValue);
      var buffer = "";
      var totalDigits = leftDigits + rightDigitsOfDefault;
      while (totalDigits > 0 || number > 0) {
        totalDigits--;
        buffer = "" + number % 10 + buffer;
        number = Math.floor(number / 10)
      }
      if (group !== undef) {
        var i = buffer.length - 3 - rightDigitsOfDefault;
        while (i > 0) {
          buffer = buffer.substring(0, i) + group + buffer.substring(i);
          i -= 3
        }
      }
      if (rightDigitsOfDefault > 0) return sign + buffer.substring(0, buffer.length - rightDigitsOfDefault) + "." + buffer.substring(buffer.length - rightDigitsOfDefault, buffer.length);
      return sign + buffer
    }
    function nfCore(value, plus, minus, leftDigits, rightDigits, group) {
      if (value instanceof Array) {
        var arr = [];
        for (var i = 0, len = value.length; i < len; i++) arr.push(nfCoreScalar(value[i], plus, minus, leftDigits, rightDigits, group));
        return arr
      }
      return nfCoreScalar(value, plus, minus, leftDigits, rightDigits, group)
    }
    p.nf = function(value, leftDigits, rightDigits) {
      return nfCore(value, "", "-", leftDigits, rightDigits)
    };
    p.nfs = function(value, leftDigits, rightDigits) {
      return nfCore(value, " ", "-", leftDigits, rightDigits)
    };
    p.nfp = function(value, leftDigits, rightDigits) {
      return nfCore(value, "+", "-", leftDigits, rightDigits)
    };
    p.nfc = function(value, leftDigits, rightDigits) {
      return nfCore(value, "", "-", leftDigits, rightDigits, ",")
    };
    var decimalToHex = function(d, padding) {
      padding = padding === undef || padding === null ? padding = 8 : padding;
      if (d < 0) d = 4294967295 + d + 1;
      var hex = Number(d).toString(16).toUpperCase();
      while (hex.length < padding) hex = "0" + hex;
      if (hex.length >= padding) hex = hex.substring(hex.length - padding, hex.length);
      return hex
    };
    p.hex = function(value, len) {
      if (arguments.length === 1) if (value instanceof Char) len = 4;
      else len = 8;
      return decimalToHex(value, len)
    };

    function unhexScalar(hex) {
      var value = parseInt("0x" + hex, 16);
      if (value > 2147483647) value -= 4294967296;
      return value
    }
    p.unhex = function(hex) {
      if (hex instanceof Array) {
        var arr = [];
        for (var i = 0; i < hex.length; i++) arr.push(unhexScalar(hex[i]));
        return arr
      }
      return unhexScalar(hex)
    };
    p.loadStrings = function(filename) {
      if (localStorage[filename]) return localStorage[filename].split("\n");
      var filecontent = ajax(filename);
      if (typeof filecontent !== "string" || filecontent === "") return [];
      filecontent = filecontent.replace(/(\r\n?)/g, "\n").replace(/\n$/, "");
      return filecontent.split("\n")
    };
    p.saveStrings = function(filename, strings) {
      localStorage[filename] = strings.join("\n")
    };
    p.loadBytes = function(url) {
      var string = ajax(url);
      var ret = [];
      for (var i = 0; i < string.length; i++) ret.push(string.charCodeAt(i));
      return ret
    };

    function removeFirstArgument(args) {
      return Array.prototype.slice.call(args, 1)
    }
    p.matchAll = function(aString, aRegExp) {
      var results = [],
        latest;
      var regexp = new RegExp(aRegExp, "g");
      while ((latest = regexp.exec(aString)) !== null) {
        results.push(latest);
        if (latest[0].length === 0)++regexp.lastIndex
      }
      return results.length > 0 ? results : null
    };
    p.__contains = function(subject, subStr) {
      if (typeof subject !== "string") return subject.contains.apply(subject, removeFirstArgument(arguments));
      return subject !== null && subStr !== null && typeof subStr === "string" && subject.indexOf(subStr) > -1
    };
    p.__replaceAll = function(subject, regex, replacement) {
      if (typeof subject !== "string") return subject.replaceAll.apply(subject, removeFirstArgument(arguments));
      return subject.replace(new RegExp(regex, "g"), replacement)
    };
    p.__replaceFirst = function(subject, regex, replacement) {
      if (typeof subject !== "string") return subject.replaceFirst.apply(subject, removeFirstArgument(arguments));
      return subject.replace(new RegExp(regex, ""), replacement)
    };
    p.__replace = function(subject, what, replacement) {
      if (typeof subject !== "string") return subject.replace.apply(subject, removeFirstArgument(arguments));
      if (what instanceof RegExp) return subject.replace(what, replacement);
      if (typeof what !== "string") what = what.toString();
      if (what === "") return subject;
      var i = subject.indexOf(what);
      if (i < 0) return subject;
      var j = 0,
        result = "";
      do {
        result += subject.substring(j, i) + replacement;
        j = i + what.length
      } while ((i = subject.indexOf(what, j)) >= 0);
      return result + subject.substring(j)
    };
    p.__equals = function(subject, other) {
      if (subject.equals instanceof
      Function) return subject.equals.apply(subject, removeFirstArgument(arguments));
      return subject.valueOf() === other.valueOf()
    };
    p.__equalsIgnoreCase = function(subject, other) {
      if (typeof subject !== "string") return subject.equalsIgnoreCase.apply(subject, removeFirstArgument(arguments));
      return subject.toLowerCase() === other.toLowerCase()
    };
    p.__toCharArray = function(subject) {
      if (typeof subject !== "string") return subject.toCharArray.apply(subject, removeFirstArgument(arguments));
      var chars = [];
      for (var i = 0, len = subject.length; i < len; ++i) chars[i] = new Char(subject.charAt(i));
      return chars
    };
    p.__split = function(subject, regex, limit) {
      if (typeof subject !== "string") return subject.split.apply(subject, removeFirstArgument(arguments));
      var pattern = new RegExp(regex);
      if (limit === undef || limit < 1) return subject.split(pattern);
      var result = [],
        currSubject = subject,
        pos;
      while ((pos = currSubject.search(pattern)) !== -1 && result.length < limit - 1) {
        var match = pattern.exec(currSubject).toString();
        result.push(currSubject.substring(0, pos));
        currSubject = currSubject.substring(pos + match.length)
      }
      if (pos !== -1 || currSubject !== "") result.push(currSubject);
      return result
    };
    p.__codePointAt = function(subject, idx) {
      var code = subject.charCodeAt(idx),
        hi, low;
      if (55296 <= code && code <= 56319) {
        hi = code;
        low = subject.charCodeAt(idx + 1);
        return (hi - 55296) * 1024 + (low - 56320) + 65536
      }
      return code
    };
    p.match = function(str, regexp) {
      return str.match(regexp)
    };
    p.__matches = function(str, regexp) {
      return (new RegExp(regexp)).test(str)
    };
    p.__startsWith = function(subject, prefix, toffset) {
      if (typeof subject !== "string") return subject.startsWith.apply(subject, removeFirstArgument(arguments));
      toffset = toffset || 0;
      if (toffset < 0 || toffset > subject.length) return false;
      return prefix === "" || prefix === subject ? true : subject.indexOf(prefix) === toffset
    };
    p.__endsWith = function(subject, suffix) {
      if (typeof subject !== "string") return subject.endsWith.apply(subject, removeFirstArgument(arguments));
      var suffixLen = suffix ? suffix.length : 0;
      return suffix === "" || suffix === subject ? true : subject.indexOf(suffix) === subject.length - suffixLen
    };
    p.__hashCode = function(subject) {
      if (subject.hashCode instanceof
      Function) return subject.hashCode.apply(subject, removeFirstArgument(arguments));
      return virtHashCode(subject)
    };
    p.__printStackTrace = function(subject) {
      p.println("Exception: " + subject.toString())
    };
    var logBuffer = [];
    p.println = function(message) {
      var bufferLen = logBuffer.length;
      if (bufferLen) {
        Processing.logger.log(logBuffer.join(""));
        logBuffer.length = 0
      }
      if (arguments.length === 0 && bufferLen === 0) Processing.logger.log("");
      else if (arguments.length !== 0) Processing.logger.log(message)
    };
    p.print = function(message) {
      logBuffer.push(message)
    };
    p.str = function(val) {
      if (val instanceof Array) {
        var arr = [];
        for (var i = 0; i < val.length; i++) arr.push(val[i].toString() + "");
        return arr
      }
      return val.toString() + ""
    };
    p.trim = function(str) {
      if (str instanceof Array) {
        var arr = [];
        for (var i = 0; i < str.length; i++) arr.push(str[i].replace(/^\s*/, "").replace(/\s*$/, "").replace(/\r*$/, ""));
        return arr
      }
      return str.replace(/^\s*/, "").replace(/\s*$/, "").replace(/\r*$/, "")
    };

    function booleanScalar(val) {
      if (typeof val === "number") return val !== 0;
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val.toLowerCase() === "true";
      if (val instanceof Char) return val.code === 49 || val.code === 84 || val.code === 116
    }
    p.parseBoolean = function(val) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) ret.push(booleanScalar(val[i]));
        return ret
      }
      return booleanScalar(val)
    };
    p.parseByte = function(what) {
      if (what instanceof Array) {
        var bytes = [];
        for (var i = 0; i < what.length; i++) bytes.push(0 - (what[i] & 128) | what[i] & 127);
        return bytes
      }
      return 0 - (what & 128) | what & 127
    };
    p.parseChar = function(key) {
      if (typeof key === "number") return new Char(String.fromCharCode(key & 65535));
      if (key instanceof Array) {
        var ret = [];
        for (var i = 0; i < key.length; i++) ret.push(new Char(String.fromCharCode(key[i] & 65535)));
        return ret
      }
      throw "char() may receive only one argument of type int, byte, int[], or byte[].";
    };

    function floatScalar(val) {
      if (typeof val === "number") return val;
      if (typeof val === "boolean") return val ? 1 : 0;
      if (typeof val === "string") return parseFloat(val);
      if (val instanceof Char) return val.code
    }
    p.parseFloat = function(val) {
      if (val instanceof
      Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) ret.push(floatScalar(val[i]));
        return ret
      }
      return floatScalar(val)
    };

    function intScalar(val, radix) {
      if (typeof val === "number") return val & 4294967295;
      if (typeof val === "boolean") return val ? 1 : 0;
      if (typeof val === "string") {
        var number = parseInt(val, radix || 10);
        return number & 4294967295
      }
      if (val instanceof Char) return val.code
    }
    p.parseInt = function(val, radix) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) if (typeof val[i] === "string" && !/^\s*[+\-]?\d+\s*$/.test(val[i])) ret.push(0);
        else ret.push(intScalar(val[i], radix));
        return ret
      }
      return intScalar(val, radix)
    };
    p.__int_cast = function(val) {
      return 0 | val
    };
    p.__instanceof = function(obj, type) {
      if (typeof type !== "function") throw "Function is expected as type argument for instanceof operator";
      if (typeof obj === "string") return type === Object || type === String;
      if (obj instanceof type) return true;
      if (typeof obj !== "object" || obj === null) return false;
      var objType = obj.constructor;
      if (type.$isInterface) {
        var interfaces = [];
        while (objType) {
          if (objType.$interfaces) interfaces = interfaces.concat(objType.$interfaces);
          objType = objType.$base
        }
        while (interfaces.length > 0) {
          var i = interfaces.shift();
          if (i === type) return true;
          if (i.$interfaces) interfaces = interfaces.concat(i.$interfaces)
        }
        return false
      }
      while (objType.hasOwnProperty("$base")) {
        objType = objType.$base;
        if (objType === type) return true
      }
      return false
    };
    p.abs = Math.abs;
    p.ceil = Math.ceil;
    p.constrain = function(aNumber, aMin, aMax) {
      return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber
    };
    p.dist = function() {
      var dx, dy, dz;
      if (arguments.length === 4) {
        dx = arguments[0] - arguments[2];
        dy = arguments[1] - arguments[3];
        return Math.sqrt(dx * dx + dy * dy)
      }
      if (arguments.length === 6) {
        dx = arguments[0] - arguments[3];
        dy = arguments[1] - arguments[4];
        dz = arguments[2] - arguments[5];
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
      }
    };
    p.exp = Math.exp;
    p.floor = Math.floor;
    p.lerp = function(value1, value2, amt) {
      return (value2 - value1) * amt + value1
    };
    p.log = Math.log;
    p.mag = function(a, b, c) {
      if (c) return Math.sqrt(a * a + b * b + c * c);
      return Math.sqrt(a * a + b * b)
    };
    p.map = function(value, istart, istop, ostart, ostop) {
      return ostart + (ostop - ostart) * ((value - istart) / (istop - istart))
    };
    p.max = function() {
      if (arguments.length === 2) return arguments[0] < arguments[1] ? arguments[1] : arguments[0];
      var numbers = arguments.length === 1 ? arguments[0] : arguments;
      if (! ("length" in numbers && numbers.length > 0)) throw "Non-empty array is expected";
      var max = numbers[0],
        count = numbers.length;
      for (var i = 1; i < count; ++i) if (max < numbers[i]) max = numbers[i];
      return max
    };
    p.min = function() {
      if (arguments.length === 2) return arguments[0] < arguments[1] ? arguments[0] : arguments[1];
      var numbers = arguments.length === 1 ? arguments[0] : arguments;
      if (! ("length" in numbers && numbers.length > 0)) throw "Non-empty array is expected";
      var min = numbers[0],
        count = numbers.length;
      for (var i = 1; i < count; ++i) if (min > numbers[i]) min = numbers[i];
      return min
    };
    p.norm = function(aNumber, low, high) {
      return (aNumber - low) / (high - low)
    };
    p.pow = Math.pow;
    p.round = Math.round;
    p.sq = function(aNumber) {
      return aNumber * aNumber
    };
    p.sqrt = Math.sqrt;
    p.acos = Math.acos;
    p.asin = Math.asin;
    p.atan = Math.atan;
    p.atan2 = Math.atan2;
    p.cos = Math.cos;
    p.degrees = function(aAngle) {
      return aAngle * 180 / Math.PI
    };
    p.radians = function(aAngle) {
      return aAngle / 180 * Math.PI
    };
    p.sin = Math.sin;
    p.tan = Math.tan;
    var currentRandom = Math.random;
    p.random = function() {
      if (arguments.length === 0) return currentRandom();
      if (arguments.length === 1) return currentRandom() * arguments[0];
      var aMin = arguments[0],
        aMax = arguments[1];
      return currentRandom() * (aMax - aMin) + aMin
    };

    function Marsaglia(i1, i2) {
      var z = i1 || 362436069,
        w = i2 || 521288629;
      var nextInt = function() {
        z = 36969 * (z & 65535) + (z >>> 16) & 4294967295;
        w = 18E3 * (w & 65535) + (w >>> 16) & 4294967295;
        return ((z & 65535) << 16 | w & 65535) & 4294967295
      };
      this.nextDouble = function() {
        var i = nextInt() / 4294967296;
        return i < 0 ? 1 + i : i
      };
      this.nextInt = nextInt
    }
    Marsaglia.createRandomized = function() {
      var now = new Date;
      return new Marsaglia(now / 6E4 & 4294967295, now & 4294967295)
    };
    p.randomSeed = function(seed) {
      currentRandom = (new Marsaglia(seed)).nextDouble
    };
    p.Random = function(seed) {
      var haveNextNextGaussian = false,
        nextNextGaussian, random;
      this.nextGaussian = function() {
        if (haveNextNextGaussian) {
          haveNextNextGaussian = false;
          return nextNextGaussian
        }
        var v1, v2, s;
        do {
          v1 = 2 * random() - 1;
          v2 = 2 * random() - 1;
          s = v1 * v1 + v2 * v2
        } while (s >= 1 || s === 0);
        var multiplier = Math.sqrt(-2 * Math.log(s) / s);
        nextNextGaussian = v2 * multiplier;
        haveNextNextGaussian = true;
        return v1 * multiplier
      };
      random = seed === undef ? Math.random : (new Marsaglia(seed)).nextDouble
    };

    function PerlinNoise(seed) {
      var rnd = seed !== undef ? new Marsaglia(seed) : Marsaglia.createRandomized();
      var i, j;
      var perm = new Uint8Array(512);
      for (i = 0; i < 256; ++i) perm[i] = i;
      for (i = 0; i < 256; ++i) {
        var t = perm[j = rnd.nextInt() & 255];
        perm[j] = perm[i];
        perm[i] = t
      }
      for (i = 0; i < 256; ++i) perm[i + 256] = perm[i];

      function grad3d(i, x, y, z) {
        var h = i & 15;
        var u = h < 8 ? x : y,
        v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
      }
      function grad2d(i, x, y) {
        var v = (i & 1) === 0 ? x : y;
        return (i & 2) === 0 ? -v : v
      }
      function grad1d(i, x) {
        return (i & 1) === 0 ? -x : x
      }
      function lerp(t, a, b) {
        return a + t * (b - a)
      }
      this.noise3d = function(x, y, z) {
        var X = Math.floor(x) & 255,
          Y = Math.floor(y) & 255,
          Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        var fx = (3 - 2 * x) * x * x,
          fy = (3 - 2 * y) * y * y,
          fz = (3 - 2 * z) * z * z;
        var p0 = perm[X] + Y,
          p00 = perm[p0] + Z,
          p01 = perm[p0 + 1] + Z,
          p1 = perm[X + 1] + Y,
          p10 = perm[p1] + Z,
          p11 = perm[p1 + 1] + Z;
        return lerp(fz, lerp(fy, lerp(fx, grad3d(perm[p00], x, y, z), grad3d(perm[p10], x - 1, y, z)), lerp(fx, grad3d(perm[p01], x, y - 1, z), grad3d(perm[p11], x - 1, y - 1, z))), lerp(fy, lerp(fx, grad3d(perm[p00 + 1], x, y, z - 1), grad3d(perm[p10 + 1], x - 1, y, z - 1)), lerp(fx, grad3d(perm[p01 + 1], x, y - 1, z - 1), grad3d(perm[p11 + 1], x - 1, y - 1, z - 1))))
      };
      this.noise2d = function(x, y) {
        var X = Math.floor(x) & 255,
          Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        var fx = (3 - 2 * x) * x * x,
          fy = (3 - 2 * y) * y * y;
        var p0 = perm[X] + Y,
          p1 = perm[X + 1] + Y;
        return lerp(fy, lerp(fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x - 1, y)), lerp(fx, grad2d(perm[p0 + 1], x, y - 1), grad2d(perm[p1 + 1], x - 1, y - 1)))
      };
      this.noise1d = function(x) {
        var X = Math.floor(x) & 255;
        x -= Math.floor(x);
        var fx = (3 - 2 * x) * x * x;
        return lerp(fx, grad1d(perm[X], x), grad1d(perm[X + 1], x - 1))
      }
    }
    var noiseProfile = {
      generator: undef,
      octaves: 4,
      fallout: 0.5,
      seed: undef
    };
    p.noise = function(x, y, z) {
      if (noiseProfile.generator === undef) noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
      var generator = noiseProfile.generator;
      var effect = 1,
        k = 1,
        sum = 0;
      for (var i = 0; i < noiseProfile.octaves; ++i) {
        effect *= noiseProfile.fallout;
        switch (arguments.length) {
        case 1:
          sum += effect * (1 + generator.noise1d(k * x)) / 2;
          break;
        case 2:
          sum += effect * (1 + generator.noise2d(k * x, k * y)) / 2;
          break;
        case 3:
          sum += effect * (1 + generator.noise3d(k * x, k * y, k * z)) / 2;
          break
        }
        k *= 2
      }
      return sum
    };
    p.noiseDetail = function(octaves, fallout) {
      noiseProfile.octaves = octaves;
      if (fallout !== undef) noiseProfile.fallout = fallout
    };
    p.noiseSeed = function(seed) {
      noiseProfile.seed = seed;
      noiseProfile.generator = undef
    };
    DrawingShared.prototype.size = function(aWidth, aHeight, aMode) {
      if (doStroke) p.stroke(0);
      if (doFill) p.fill(255);
      var savedProperties = {
        fillStyle: curContext.fillStyle,
        strokeStyle: curContext.strokeStyle,
        lineCap: curContext.lineCap,
        lineJoin: curContext.lineJoin
      };
      if (curElement.style.length > 0) {
        curElement.style.removeProperty("width");
        curElement.style.removeProperty("height")
      }
      curElement.width = p.width = aWidth || 100;
      curElement.height = p.height = aHeight || 100;
      for (var prop in savedProperties) if (savedProperties.hasOwnProperty(prop)) curContext[prop] = savedProperties[prop];
      p.textFont(curTextFont);
      p.background();
      maxPixelsCached = Math.max(1E3, aWidth * aHeight * 0.05);
      p.externals.context = curContext;
      for (var i = 0; i < 720; i++) {
        sinLUT[i] = p.sin(i * (Math.PI / 180) * 0.5);
        cosLUT[i] = p.cos(i * (Math.PI / 180) * 0.5)
      }
    };
    Drawing2D.prototype.size = function(aWidth, aHeight, aMode) {
      if (curContext === undef) {
        curContext = curElement.getContext("2d");
        userMatrixStack = new PMatrixStack;
        userReverseMatrixStack = new PMatrixStack;
        modelView = new PMatrix2D;
        modelViewInv = new PMatrix2D
      }
      DrawingShared.prototype.size.apply(this, arguments)
    };
    Drawing3D.prototype.size = function() {
      var size3DCalled = false;
      return function size(aWidth, aHeight, aMode) {
        if (size3DCalled) throw "Multiple calls to size() for 3D renders are not allowed.";
        size3DCalled = true;

        function getGLContext(canvas) {
          var ctxNames = ["experimental-webgl", "webgl", "webkit-3d"],
            gl;
          for (var i = 0, l = ctxNames.length; i < l; i++) {
            gl = canvas.getContext(ctxNames[i], {
              antialias: false,
              preserveDrawingBuffer: true
            });
            if (gl) break
          }
          return gl
        }
        try {
          curElement.width = p.width = aWidth || 100;
          curElement.height = p.height = aHeight || 100;
          curContext = getGLContext(curElement);
          canTex = curContext.createTexture();
          textTex = curContext.createTexture()
        } catch(e_size) {
          Processing.debug(e_size)
        }
        if (!curContext) throw "WebGL context is not supported on this browser.";
        curContext.viewport(0, 0, curElement.width, curElement.height);
        curContext.enable(curContext.DEPTH_TEST);
        curContext.enable(curContext.BLEND);
        curContext.blendFunc(curContext.SRC_ALPHA, curContext.ONE_MINUS_SRC_ALPHA);
        programObject2D = createProgramObject(curContext, vertexShaderSrc2D, fragmentShaderSrc2D);
        programObjectUnlitShape = createProgramObject(curContext, vertexShaderSrcUnlitShape, fragmentShaderSrcUnlitShape);
        p.strokeWeight(1);
        programObject3D = createProgramObject(curContext, vertexShaderSrc3D, fragmentShaderSrc3D);
        curContext.useProgram(programObject3D);
        uniformi("usingTexture3d", programObject3D, "usingTexture", usingTexture);
        p.lightFalloff(1, 0, 0);
        p.shininess(1);
        p.ambient(255, 255, 255);
        p.specular(0, 0, 0);
        p.emissive(0, 0, 0);
        boxBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, boxBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, boxVerts, curContext.STATIC_DRAW);
        boxNormBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, boxNormBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, boxNorms, curContext.STATIC_DRAW);
        boxOutlineBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, boxOutlineBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, boxOutlineVerts, curContext.STATIC_DRAW);
        rectBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, rectBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, rectVerts, curContext.STATIC_DRAW);
        rectNormBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, rectNormBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, rectNorms, curContext.STATIC_DRAW);
        sphereBuffer = curContext.createBuffer();
        lineBuffer = curContext.createBuffer();
        fillBuffer = curContext.createBuffer();
        fillColorBuffer = curContext.createBuffer();
        strokeColorBuffer = curContext.createBuffer();
        shapeTexVBO = curContext.createBuffer();
        pointBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, pointBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array([0, 0, 0]), curContext.STATIC_DRAW);
        textBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, textBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array([1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0]), curContext.STATIC_DRAW);
        textureBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ARRAY_BUFFER, textureBuffer);
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), curContext.STATIC_DRAW);
        indexBuffer = curContext.createBuffer();
        curContext.bindBuffer(curContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
        curContext.bufferData(curContext.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 2, 3, 0]), curContext.STATIC_DRAW);
        cam = new PMatrix3D;
        cameraInv = new PMatrix3D;
        modelView = new PMatrix3D;
        modelViewInv = new PMatrix3D;
        projection = new PMatrix3D;
        p.camera();
        p.perspective();
        userMatrixStack = new PMatrixStack;
        userReverseMatrixStack = new PMatrixStack;
        curveBasisMatrix = new PMatrix3D;
        curveToBezierMatrix = new PMatrix3D;
        curveDrawMatrix = new PMatrix3D;
        bezierDrawMatrix = new PMatrix3D;
        bezierBasisInverse = new PMatrix3D;
        bezierBasisMatrix = new PMatrix3D;
        bezierBasisMatrix.set(-1, 3, -3, 1, 3, -6, 3, 0, -3, 3, 0, 0, 1, 0, 0, 0);
        DrawingShared.prototype.size.apply(this, arguments)
      }
    }();
    Drawing2D.prototype.ambientLight = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.ambientLight = function(r, g, b, x, y, z) {
      if (lightCount === 8) throw "can only create " + 8 + " lights";
      var pos = new PVector(x, y, z);
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.mult(pos, pos);
      var col = color$4(r, g, b, 0);
      var normalizedCol = [((col >> 16) & 255) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255];
      curContext.useProgram(programObject3D);
      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", pos.array());
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 0);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount)
    };
    Drawing2D.prototype.directionalLight = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.directionalLight = function(r, g, b, nx, ny, nz) {
      if (lightCount === 8) throw "can only create " + 8 + " lights";
      curContext.useProgram(programObject3D);
      var mvm = new PMatrix3D;
      mvm.scale(1, -1, 1);
      mvm.apply(modelView.array());
      mvm = mvm.array();
      var dir = [mvm[0] * nx + mvm[4] * ny + mvm[8] * nz, mvm[1] * nx + mvm[5] * ny + mvm[9] * nz, mvm[2] * nx + mvm[6] * ny + mvm[10] * nz];
      var col = color$4(r, g, b, 0);
      var normalizedCol = [((col >> 16) & 255) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255];
      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", dir);
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 1);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount)
    };
    Drawing2D.prototype.lightFalloff = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.lightFalloff = function(constant, linear, quadratic) {
      curContext.useProgram(programObject3D);
      uniformf("uFalloff3d", programObject3D, "uFalloff", [constant, linear, quadratic])
    };
    Drawing2D.prototype.lightSpecular = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.lightSpecular = function(r, g, b) {
      var col = color$4(r, g, b, 0);
      var normalizedCol = [((col >> 16) & 255) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255];
      curContext.useProgram(programObject3D);
      uniformf("uSpecular3d", programObject3D, "uSpecular", normalizedCol)
    };
    p.lights = function() {
      p.ambientLight(128, 128, 128);
      p.directionalLight(128, 128, 128, 0, 0, -1);
      p.lightFalloff(1, 0, 0);
      p.lightSpecular(0, 0, 0)
    };
    Drawing2D.prototype.pointLight = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.pointLight = function(r, g, b, x, y, z) {
      if (lightCount === 8) throw "can only create " + 8 + " lights";
      var pos = new PVector(x, y, z);
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.mult(pos, pos);
      var col = color$4(r, g, b, 0);
      var normalizedCol = [((col >> 16) & 255) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255];
      curContext.useProgram(programObject3D);
      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", pos.array());
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 2);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount)
    };
    Drawing2D.prototype.noLights = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.noLights = function() {
      lightCount = 0;
      curContext.useProgram(programObject3D);
      uniformi("uLightCount3d", programObject3D, "uLightCount", lightCount)
    };
    Drawing2D.prototype.spotLight = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.spotLight = function(r, g, b, x, y, z, nx, ny, nz, angle, concentration) {
      if (lightCount === 8) throw "can only create " + 8 + " lights";
      curContext.useProgram(programObject3D);
      var pos = new PVector(x, y, z);
      var mvm = new PMatrix3D;
      mvm.scale(1, -1, 1);
      mvm.apply(modelView.array());
      mvm.mult(pos, pos);
      mvm = mvm.array();
      var dir = [mvm[0] * nx + mvm[4] * ny + mvm[8] * nz, mvm[1] *
        nx + mvm[5] * ny + mvm[9] * nz, mvm[2] * nx + mvm[6] * ny + mvm[10] * nz];
      var col = color$4(r, g, b, 0);
      var normalizedCol = [((col >> 16) & 255) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255];
      uniformf("uLights.color.3d." + lightCount, programObject3D, "uLights" + lightCount + ".color", normalizedCol);
      uniformf("uLights.position.3d." + lightCount, programObject3D, "uLights" + lightCount + ".position", pos.array());
      uniformf("uLights.direction.3d." + lightCount, programObject3D, "uLights" + lightCount + ".direction", dir);
      uniformf("uLights.concentration.3d." + lightCount, programObject3D, "uLights" + lightCount + ".concentration", concentration);
      uniformf("uLights.angle.3d." + lightCount, programObject3D, "uLights" + lightCount + ".angle", angle);
      uniformi("uLights.type.3d." + lightCount, programObject3D, "uLights" + lightCount + ".type", 3);
      uniformi("uLightCount3d", programObject3D, "uLightCount", ++lightCount)
    };
    Drawing2D.prototype.beginCamera = function() {
      throw "beginCamera() is not available in 2D mode";
    };
    Drawing3D.prototype.beginCamera = function() {
      if (manipulatingCamera) throw "You cannot call beginCamera() again before calling endCamera()";
      manipulatingCamera = true;
      modelView = cameraInv;
      modelViewInv = cam
    };
    Drawing2D.prototype.endCamera = function() {
      throw "endCamera() is not available in 2D mode";
    };
    Drawing3D.prototype.endCamera = function() {
      if (!manipulatingCamera) throw "You cannot call endCamera() before calling beginCamera()";
      modelView.set(cam);
      modelViewInv.set(cameraInv);
      manipulatingCamera = false
    };
    p.camera = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
      if (eyeX === undef) {
        cameraX = p.width / 2;
        cameraY = p.height / 2;
        cameraZ = cameraY / Math.tan(cameraFOV / 2);
        eyeX = cameraX;
        eyeY = cameraY;
        eyeZ = cameraZ;
        centerX = cameraX;
        centerY = cameraY;
        centerZ = 0;
        upX = 0;
        upY = 1;
        upZ = 0
      }
      var z = new PVector(eyeX - centerX, eyeY - centerY, eyeZ - centerZ);
      var y = new PVector(upX, upY, upZ);
      z.normalize();
      var x = PVector.cross(y, z);
      y = PVector.cross(z, x);
      x.normalize();
      y.normalize();
      var xX = x.x,
        xY = x.y,
        xZ = x.z;
      var yX = y.x,
        yY = y.y,
        yZ = y.z;
      var zX = z.x,
        zY = z.y,
        zZ = z.z;
      cam.set(xX, xY, xZ, 0, yX, yY, yZ, 0, zX, zY, zZ, 0, 0, 0, 0, 1);
      cam.translate(-eyeX, -eyeY, -eyeZ);
      cameraInv.reset();
      cameraInv.invApply(xX, xY, xZ, 0, yX, yY, yZ, 0, zX, zY, zZ, 0, 0, 0, 0, 1);
      cameraInv.translate(eyeX, eyeY, eyeZ);
      modelView.set(cam);
      modelViewInv.set(cameraInv)
    };
    p.perspective = function(fov, aspect, near, far) {
      if (arguments.length === 0) {
        cameraY = curElement.height / 2;
        cameraZ = cameraY / Math.tan(cameraFOV / 2);
        cameraNear = cameraZ / 10;
        cameraFar = cameraZ * 10;
        cameraAspect = p.width / p.height;
        fov = cameraFOV;
        aspect = cameraAspect;
        near = cameraNear;
        far = cameraFar
      }
      var yMax, yMin, xMax, xMin;
      yMax = near * Math.tan(fov / 2);
      yMin = -yMax;
      xMax = yMax * aspect;
      xMin = yMin * aspect;
      p.frustum(xMin, xMax, yMin, yMax, near, far)
    };
    Drawing2D.prototype.frustum = function() {
      throw "Processing.js: frustum() is not supported in 2D mode";
    };
    Drawing3D.prototype.frustum = function(left, right, bottom, top, near, far) {
      frustumMode = true;
      projection = new PMatrix3D;
      projection.set(2 * near / (right - left), 0, (right + left) / (right - left), 0, 0, 2 * near / (top - bottom), (top + bottom) / (top - bottom), 0, 0, 0, -(far + near) / (far - near), -(2 * far * near) / (far - near), 0, 0, -1, 0);
      var proj = new PMatrix3D;
      proj.set(projection);
      proj.transpose();
      curContext.useProgram(programObject2D);
      uniformMatrix("projection2d", programObject2D, "uProjection", false, proj.array());
      curContext.useProgram(programObject3D);
      uniformMatrix("projection3d", programObject3D, "uProjection", false, proj.array());
      curContext.useProgram(programObjectUnlitShape);
      uniformMatrix("uProjectionUS", programObjectUnlitShape, "uProjection", false, proj.array())
    };
    p.ortho = function(left, right, bottom, top, near, far) {
      if (arguments.length === 0) {
        left = 0;
        right = p.width;
        bottom = 0;
        top = p.height;
        near = -10;
        far = 10
      }
      var x = 2 / (right - left);
      var y = 2 / (top - bottom);
      var z = -2 / (far - near);
      var tx = -(right + left) / (right - left);
      var ty = -(top + bottom) / (top - bottom);
      var tz = -(far + near) / (far - near);
      projection = new PMatrix3D;
      projection.set(x, 0, 0, tx, 0, y, 0, ty, 0, 0, z, tz, 0, 0, 0, 1);
      var proj = new PMatrix3D;
      proj.set(projection);
      proj.transpose();
      curContext.useProgram(programObject2D);
      uniformMatrix("projection2d", programObject2D, "uProjection", false, proj.array());
      curContext.useProgram(programObject3D);
      uniformMatrix("projection3d", programObject3D, "uProjection", false, proj.array());
      curContext.useProgram(programObjectUnlitShape);
      uniformMatrix("uProjectionUS", programObjectUnlitShape, "uProjection", false, proj.array());
      frustumMode = false
    };
    p.printProjection = function() {
      projection.print()
    };
    p.printCamera = function() {
      cam.print()
    };
    Drawing2D.prototype.box = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.box = function(w, h, d) {
      if (!h || !d) h = d = w;
      var model = new PMatrix3D;
      model.scale(w, h, d);
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      if (doFill) {
        curContext.useProgram(programObject3D);
        uniformMatrix("model3d", programObject3D, "uModel", false, model.array());
        uniformMatrix("view3d", programObject3D, "uView", false, view.array());
        curContext.enable(curContext.POLYGON_OFFSET_FILL);
        curContext.polygonOffset(1, 1);
        uniformf("color3d", programObject3D, "uColor", fillStyle);
        if (lightCount > 0) {
          var v = new PMatrix3D;
          v.set(view);
          var m = new PMatrix3D;
          m.set(model);
          v.mult(m);
          var normalMatrix = new PMatrix3D;
          normalMatrix.set(v);
          normalMatrix.invert();
          normalMatrix.transpose();
          uniformMatrix("uNormalTransform3d", programObject3D, "uNormalTransform", false, normalMatrix.array());
          vertexAttribPointer("aNormal3d", programObject3D, "aNormal", 3, boxNormBuffer)
        } else disableVertexAttribPointer("aNormal3d", programObject3D, "aNormal");
        vertexAttribPointer("aVertex3d", programObject3D, "aVertex", 3, boxBuffer);
        disableVertexAttribPointer("aColor3d", programObject3D, "aColor");
        disableVertexAttribPointer("aTexture3d", programObject3D, "aTexture");
        curContext.drawArrays(curContext.TRIANGLES, 0, boxVerts.length / 3);
        curContext.disable(curContext.POLYGON_OFFSET_FILL)
      }
      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);
        uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", false);
        vertexAttribPointer("vertex2d", programObject2D, "aVertex", 3, boxOutlineBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        curContext.drawArrays(curContext.LINES, 0, boxOutlineVerts.length / 3)
      }
    };
    var initSphere = function() {
      var i;
      sphereVerts = [];
      for (i = 0; i < sphereDetailU; i++) {
        sphereVerts.push(0);
        sphereVerts.push(-1);
        sphereVerts.push(0);
        sphereVerts.push(sphereX[i]);
        sphereVerts.push(sphereY[i]);
        sphereVerts.push(sphereZ[i])
      }
      sphereVerts.push(0);
      sphereVerts.push(-1);
      sphereVerts.push(0);
      sphereVerts.push(sphereX[0]);
      sphereVerts.push(sphereY[0]);
      sphereVerts.push(sphereZ[0]);
      var v1, v11, v2;
      var voff = 0;
      for (i = 2; i < sphereDetailV; i++) {
        v1 = v11 = voff;
        voff += sphereDetailU;
        v2 = voff;
        for (var j = 0; j < sphereDetailU; j++) {
          sphereVerts.push(sphereX[v1]);
          sphereVerts.push(sphereY[v1]);
          sphereVerts.push(sphereZ[v1++]);
          sphereVerts.push(sphereX[v2]);
          sphereVerts.push(sphereY[v2]);
          sphereVerts.push(sphereZ[v2++])
        }
        v1 = v11;
        v2 = voff;
        sphereVerts.push(sphereX[v1]);
        sphereVerts.push(sphereY[v1]);
        sphereVerts.push(sphereZ[v1]);
        sphereVerts.push(sphereX[v2]);
        sphereVerts.push(sphereY[v2]);
        sphereVerts.push(sphereZ[v2])
      }
      for (i = 0; i < sphereDetailU; i++) {
        v2 = voff + i;
        sphereVerts.push(sphereX[v2]);
        sphereVerts.push(sphereY[v2]);
        sphereVerts.push(sphereZ[v2]);
        sphereVerts.push(0);
        sphereVerts.push(1);
        sphereVerts.push(0)
      }
      sphereVerts.push(sphereX[voff]);
      sphereVerts.push(sphereY[voff]);
      sphereVerts.push(sphereZ[voff]);
      sphereVerts.push(0);
      sphereVerts.push(1);
      sphereVerts.push(0);
      curContext.bindBuffer(curContext.ARRAY_BUFFER, sphereBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(sphereVerts), curContext.STATIC_DRAW)
    };
    p.sphereDetail = function(ures, vres) {
      var i;
      if (arguments.length === 1) ures = vres = arguments[0];
      if (ures < 3) ures = 3;
      if (vres < 2) vres = 2;
      if (ures === sphereDetailU && vres === sphereDetailV) return;
      var delta = 720 / ures;
      var cx = new Float32Array(ures);
      var cz = new Float32Array(ures);
      for (i = 0; i < ures; i++) {
        cx[i] = cosLUT[i * delta % 720 | 0];
        cz[i] = sinLUT[i * delta % 720 | 0]
      }
      var vertCount = ures * (vres - 1) + 2;
      var currVert = 0;
      sphereX = new Float32Array(vertCount);
      sphereY = new Float32Array(vertCount);
      sphereZ = new Float32Array(vertCount);
      var angle_step = 720 * 0.5 / vres;
      var angle = angle_step;
      for (i = 1; i < vres; i++) {
        var curradius = sinLUT[angle % 720 | 0];
        var currY = -cosLUT[angle % 720 | 0];
        for (var j = 0; j < ures; j++) {
          sphereX[currVert] = cx[j] * curradius;
          sphereY[currVert] = currY;
          sphereZ[currVert++] = cz[j] * curradius
        }
        angle += angle_step
      }
      sphereDetailU = ures;
      sphereDetailV = vres;
      initSphere()
    };
    Drawing2D.prototype.sphere = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.sphere = function() {
      var sRad = arguments[0];
      if (sphereDetailU < 3 || sphereDetailV < 2) p.sphereDetail(30);
      var model = new PMatrix3D;
      model.scale(sRad, sRad, sRad);
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      if (doFill) {
        if (lightCount > 0) {
          var v = new PMatrix3D;
          v.set(view);
          var m = new PMatrix3D;
          m.set(model);
          v.mult(m);
          var normalMatrix = new PMatrix3D;
          normalMatrix.set(v);
          normalMatrix.invert();
          normalMatrix.transpose();
          uniformMatrix("uNormalTransform3d", programObject3D, "uNormalTransform", false, normalMatrix.array());
          vertexAttribPointer("aNormal3d", programObject3D, "aNormal", 3, sphereBuffer)
        } else disableVertexAttribPointer("aNormal3d", programObject3D, "aNormal");
        curContext.useProgram(programObject3D);
        disableVertexAttribPointer("aTexture3d", programObject3D, "aTexture");
        uniformMatrix("uModel3d", programObject3D, "uModel", false, model.array());
        uniformMatrix("uView3d", programObject3D, "uView", false, view.array());
        vertexAttribPointer("aVertex3d", programObject3D, "aVertex", 3, sphereBuffer);
        disableVertexAttribPointer("aColor3d", programObject3D, "aColor");
        curContext.enable(curContext.POLYGON_OFFSET_FILL);
        curContext.polygonOffset(1, 1);
        uniformf("uColor3d", programObject3D, "uColor", fillStyle);
        curContext.drawArrays(curContext.TRIANGLE_STRIP, 0, sphereVerts.length / 3);
        curContext.disable(curContext.POLYGON_OFFSET_FILL)
      }
      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);
        uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, sphereBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText", programObject2D, "uIsDrawingText", false);
        curContext.drawArrays(curContext.LINE_STRIP, 0, sphereVerts.length / 3)
      }
    };
    p.modelX = function(x, y, z) {
      var mv = modelView.array();
      var ci = cameraInv.array();
      var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
      var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
      var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
      var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];
      var ox = ci[0] * ax + ci[1] * ay + ci[2] * az + ci[3] * aw;
      var ow = ci[12] * ax + ci[13] * ay + ci[14] * az + ci[15] * aw;
      return ow !== 0 ? ox / ow : ox
    };
    p.modelY = function(x, y, z) {
      var mv = modelView.array();
      var ci = cameraInv.array();
      var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
      var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
      var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
      var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];
      var oy = ci[4] * ax + ci[5] * ay + ci[6] * az + ci[7] * aw;
      var ow = ci[12] * ax + ci[13] * ay + ci[14] * az + ci[15] * aw;
      return ow !== 0 ? oy / ow : oy
    };
    p.modelZ = function(x, y, z) {
      var mv = modelView.array();
      var ci = cameraInv.array();
      var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
      var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
      var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
      var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];
      var oz = ci[8] * ax + ci[9] * ay + ci[10] * az + ci[11] * aw;
      var ow = ci[12] * ax + ci[13] * ay + ci[14] * az + ci[15] * aw;
      return ow !== 0 ? oz / ow : oz
    };
    Drawing2D.prototype.ambient = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.ambient = function(v1, v2, v3) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      var col = p.color(v1, v2, v3);
      uniformf("uMaterialAmbient3d", programObject3D, "uMaterialAmbient", p.color.toGLArray(col).slice(0, 3))
    };
    Drawing2D.prototype.emissive = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.emissive = function(v1, v2, v3) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      var col = p.color(v1, v2, v3);
      uniformf("uMaterialEmissive3d", programObject3D, "uMaterialEmissive", p.color.toGLArray(col).slice(0, 3))
    };
    Drawing2D.prototype.shininess = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.shininess = function(shine) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      uniformf("uShininess3d", programObject3D, "uShininess", shine)
    };
    Drawing2D.prototype.specular = DrawingShared.prototype.a3DOnlyFunction;
    Drawing3D.prototype.specular = function(v1, v2, v3) {
      curContext.useProgram(programObject3D);
      uniformi("uUsingMat3d", programObject3D, "uUsingMat", true);
      var col = p.color(v1, v2, v3);
      uniformf("uMaterialSpecular3d", programObject3D, "uMaterialSpecular", p.color.toGLArray(col).slice(0, 3))
    };
    p.screenX = function(x, y, z) {
      var mv = modelView.array();
      if (mv.length === 16) {
        var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
        var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
        var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
        var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];
        var pj = projection.array();
        var ox = pj[0] * ax + pj[1] * ay + pj[2] * az + pj[3] * aw;
        var ow = pj[12] * ax + pj[13] * ay + pj[14] * az + pj[15] * aw;
        if (ow !== 0) ox /= ow;
        return p.width * (1 + ox) / 2
      }
      return modelView.multX(x, y)
    };
    p.screenY = function screenY(x, y, z) {
      var mv = modelView.array();
      if (mv.length === 16) {
        var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
        var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
        var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
        var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];
        var pj = projection.array();
        var oy = pj[4] * ax + pj[5] * ay + pj[6] * az + pj[7] * aw;
        var ow = pj[12] * ax + pj[13] * ay + pj[14] * az + pj[15] * aw;
        if (ow !== 0) oy /= ow;
        return p.height * (1 + oy) / 2
      }
      return modelView.multY(x, y)
    };
    p.screenZ = function screenZ(x, y, z) {
      var mv = modelView.array();
      if (mv.length !== 16) return 0;
      var pj = projection.array();
      var ax = mv[0] * x + mv[1] * y + mv[2] * z + mv[3];
      var ay = mv[4] * x + mv[5] * y + mv[6] * z + mv[7];
      var az = mv[8] * x + mv[9] * y + mv[10] * z + mv[11];
      var aw = mv[12] * x + mv[13] * y + mv[14] * z + mv[15];
      var oz = pj[8] * ax + pj[9] * ay + pj[10] * az + pj[11] * aw;
      var ow = pj[12] * ax + pj[13] * ay + pj[14] * az + pj[15] * aw;
      if (ow !== 0) oz /= ow;
      return (oz + 1) / 2
    };
    DrawingShared.prototype.fill = function() {
      var color = p.color(arguments[0], arguments[1], arguments[2], arguments[3]);
      if (color === currentFillColor && doFill) return;
      doFill = true;
      currentFillColor = color
    };
    Drawing2D.prototype.fill = function() {
      DrawingShared.prototype.fill.apply(this, arguments);
      isFillDirty = true
    };
    Drawing3D.prototype.fill = function() {
      DrawingShared.prototype.fill.apply(this, arguments);
      fillStyle = p.color.toGLArray(currentFillColor)
    };

    function executeContextFill() {
      if (doFill) {
        if (isFillDirty) {
          curContext.fillStyle = p.color.toString(currentFillColor);
          isFillDirty = false
        }
        curContext.fill()
      }
    }
    p.noFill = function() {
      doFill = false
    };
    DrawingShared.prototype.stroke = function() {
      var color = p.color(arguments[0], arguments[1], arguments[2], arguments[3]);
      if (color === currentStrokeColor && doStroke) return;
      doStroke = true;
      currentStrokeColor = color
    };
    Drawing2D.prototype.stroke = function() {
      DrawingShared.prototype.stroke.apply(this, arguments);
      isStrokeDirty = true
    };
    Drawing3D.prototype.stroke = function() {
      DrawingShared.prototype.stroke.apply(this, arguments);
      strokeStyle = p.color.toGLArray(currentStrokeColor)
    };

    function executeContextStroke() {
      if (doStroke) {
        if (isStrokeDirty) {
          curContext.strokeStyle = p.color.toString(currentStrokeColor);
          isStrokeDirty = false
        }
        curContext.stroke()
      }
    }
    p.noStroke = function() {
      doStroke = false
    };
    DrawingShared.prototype.strokeWeight = function(w) {
      lineWidth = w
    };
    Drawing2D.prototype.strokeWeight = function(w) {
      DrawingShared.prototype.strokeWeight.apply(this, arguments);
      curContext.lineWidth = w
    };
    Drawing3D.prototype.strokeWeight = function(w) {
      DrawingShared.prototype.strokeWeight.apply(this, arguments);
      curContext.useProgram(programObject2D);
      uniformf("pointSize2d", programObject2D, "uPointSize", w);
      curContext.useProgram(programObjectUnlitShape);
      uniformf("pointSizeUnlitShape", programObjectUnlitShape, "uPointSize", w);
      curContext.lineWidth(w)
    };
    p.strokeCap = function(value) {
      drawing.$ensureContext().lineCap = value
    };
    p.strokeJoin = function(value) {
      drawing.$ensureContext().lineJoin = value
    };
    Drawing2D.prototype.smooth = function() {
      renderSmooth = true;
      var style = curElement.style;
      style.setProperty("image-rendering", "optimizeQuality", "important");
      style.setProperty("-ms-interpolation-mode", "bicubic", "important");
      if (curContext.hasOwnProperty("mozImageSmoothingEnabled")) curContext.mozImageSmoothingEnabled = true
    };
    Drawing3D.prototype.smooth = function() {
      renderSmooth = true
    };
    Drawing2D.prototype.noSmooth = function() {
      renderSmooth = false;
      var style = curElement.style;
      style.setProperty("image-rendering", "optimizeSpeed", "important");
      style.setProperty("image-rendering", "-moz-crisp-edges", "important");
      style.setProperty("image-rendering", "-webkit-optimize-contrast", "important");
      style.setProperty("image-rendering", "optimize-contrast", "important");
      style.setProperty("-ms-interpolation-mode", "nearest-neighbor", "important");
      if (curContext.hasOwnProperty("mozImageSmoothingEnabled")) curContext.mozImageSmoothingEnabled = false
    };
    Drawing3D.prototype.noSmooth = function() {
      renderSmooth = false
    };
    Drawing2D.prototype.point = function(x, y) {
      if (!doStroke) return;
      x = Math.round(x);
      y = Math.round(y);
      curContext.fillStyle = p.color.toString(currentStrokeColor);
      isFillDirty = true;
      if (lineWidth > 1) {
        curContext.beginPath();
        curContext.arc(x, y, lineWidth / 2, 0, 6.283185307179586, false);
        curContext.fill()
      } else curContext.fillRect(x, y, 1, 1)
    };
    Drawing3D.prototype.point = function(x, y, z) {
      var model = new PMatrix3D;
      model.translate(x, y, z || 0);
      model.transpose();
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      curContext.useProgram(programObject2D);
      uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
      uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
      if (lineWidth > 0 && doStroke) {
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", false);
        uniformi("uSmooth2d", programObject2D, "uSmooth", renderSmooth);
        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, pointBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        curContext.drawArrays(curContext.POINTS, 0, 1)
      }
    };
    p.beginShape = function(type) {
      curShape = type;
      curvePoints = [];
      vertArray = []
    };
    Drawing2D.prototype.vertex = function(x, y, moveTo) {
      var vert = [];
      if (firstVert) firstVert = false;
      vert["isVert"] = true;
      vert[0] = x;
      vert[1] = y;
      vert[2] = 0;
      vert[3] = 0;
      vert[4] = 0;
      vert[5] = currentFillColor;
      vert[6] = currentStrokeColor;
      vertArray.push(vert);
      if (moveTo) vertArray[vertArray.length - 1]["moveTo"] = moveTo
    };
    Drawing3D.prototype.vertex = function(x, y, z, u, v) {
      var vert = [];
      if (firstVert) firstVert = false;
      vert["isVert"] = true;
      if (v === undef && usingTexture) {
        v = u;
        u = z;
        z = 0
      }
      if (u !== undef && v !== undef) {
        if (curTextureMode === 2) {
          u /= curTexture.width;
          v /= curTexture.height
        }
        u = u > 1 ? 1 : u;
        u = u < 0 ? 0 : u;
        v = v > 1 ? 1 : v;
        v = v < 0 ? 0 : v
      }
      vert[0] = x;
      vert[1] = y;
      vert[2] = z || 0;
      vert[3] = u || 0;
      vert[4] = v || 0;
      vert[5] = fillStyle[0];
      vert[6] = fillStyle[1];
      vert[7] = fillStyle[2];
      vert[8] = fillStyle[3];
      vert[9] = strokeStyle[0];
      vert[10] = strokeStyle[1];
      vert[11] = strokeStyle[2];
      vert[12] = strokeStyle[3];
      vert[13] = normalX;
      vert[14] = normalY;
      vert[15] = normalZ;
      vertArray.push(vert)
    };
    var point3D = function(vArray, cArray) {
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      curContext.useProgram(programObjectUnlitShape);
      uniformMatrix("uViewUS", programObjectUnlitShape, "uView", false, view.array());
      uniformi("uSmoothUS", programObjectUnlitShape, "uSmooth", renderSmooth);
      vertexAttribPointer("aVertexUS", programObjectUnlitShape, "aVertex", 3, pointBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(vArray), curContext.STREAM_DRAW);
      vertexAttribPointer("aColorUS", programObjectUnlitShape, "aColor", 4, fillColorBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(cArray), curContext.STREAM_DRAW);
      curContext.drawArrays(curContext.POINTS, 0, vArray.length / 3)
    };
    var line3D = function(vArray, mode, cArray) {
      var ctxMode;
      if (mode === "LINES") ctxMode = curContext.LINES;
      else if (mode === "LINE_LOOP") ctxMode = curContext.LINE_LOOP;
      else ctxMode = curContext.LINE_STRIP;
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      curContext.useProgram(programObjectUnlitShape);
      uniformMatrix("uViewUS", programObjectUnlitShape, "uView", false, view.array());
      vertexAttribPointer("aVertexUS", programObjectUnlitShape, "aVertex", 3, lineBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(vArray), curContext.STREAM_DRAW);
      vertexAttribPointer("aColorUS", programObjectUnlitShape, "aColor", 4, strokeColorBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(cArray), curContext.STREAM_DRAW);
      curContext.drawArrays(ctxMode, 0, vArray.length / 3)
    };
    var fill3D = function(vArray, mode, cArray, tArray) {
      var ctxMode;
      if (mode === "TRIANGLES") ctxMode = curContext.TRIANGLES;
      else if (mode === "TRIANGLE_FAN") ctxMode = curContext.TRIANGLE_FAN;
      else ctxMode = curContext.TRIANGLE_STRIP;
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      curContext.useProgram(programObject3D);
      uniformMatrix("model3d", programObject3D, "uModel", false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      uniformMatrix("view3d", programObject3D, "uView", false, view.array());
      curContext.enable(curContext.POLYGON_OFFSET_FILL);
      curContext.polygonOffset(1, 1);
      uniformf("color3d", programObject3D, "uColor", [-1, 0, 0, 0]);
      vertexAttribPointer("vertex3d", programObject3D, "aVertex", 3, fillBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(vArray), curContext.STREAM_DRAW);
      if (usingTexture && curTint !== null) curTint3d(cArray);
      vertexAttribPointer("aColor3d", programObject3D, "aColor", 4, fillColorBuffer);
      curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(cArray), curContext.STREAM_DRAW);
      disableVertexAttribPointer("aNormal3d", programObject3D, "aNormal");
      if (usingTexture) {
        uniformi("uUsingTexture3d", programObject3D, "uUsingTexture", usingTexture);
        vertexAttribPointer("aTexture3d", programObject3D, "aTexture", 2, shapeTexVBO);
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(tArray), curContext.STREAM_DRAW)
      }
      curContext.drawArrays(ctxMode, 0, vArray.length / 3);
      curContext.disable(curContext.POLYGON_OFFSET_FILL)
    };

    function fillStrokeClose() {
      executeContextFill();
      executeContextStroke();
      curContext.closePath()
    }
    Drawing2D.prototype.endShape = function(mode) {
      if (vertArray.length === 0) return;
      var closeShape = mode === 2;
      if (closeShape) vertArray.push(vertArray[0]);
      var lineVertArray = [];
      var fillVertArray = [];
      var colorVertArray = [];
      var strokeVertArray = [];
      var texVertArray = [];
      var cachedVertArray;
      firstVert = true;
      var i, j, k;
      var vertArrayLength = vertArray.length;
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 0; j < 3; j++) fillVertArray.push(cachedVertArray[j])
      }
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 5; j < 9; j++) colorVertArray.push(cachedVertArray[j])
      }
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 9; j < 13; j++) strokeVertArray.push(cachedVertArray[j])
      }
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        texVertArray.push(cachedVertArray[3]);
        texVertArray.push(cachedVertArray[4])
      }
      if (isCurve && (curShape === 20 || curShape === undef)) {
        if (vertArrayLength > 3) {
          var b = [],
            s = 1 - curTightness;
          curContext.beginPath();
          curContext.moveTo(vertArray[1][0], vertArray[1][1]);
          for (i = 1; i + 2 < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            b[0] = [cachedVertArray[0], cachedVertArray[1]];
            b[1] = [cachedVertArray[0] + (s * vertArray[i + 1][0] - s * vertArray[i - 1][0]) / 6, cachedVertArray[1] + (s * vertArray[i + 1][1] - s * vertArray[i - 1][1]) / 6];
            b[2] = [vertArray[i + 1][0] + (s * vertArray[i][0] - s * vertArray[i + 2][0]) / 6, vertArray[i + 1][1] + (s * vertArray[i][1] - s * vertArray[i + 2][1]) / 6];
            b[3] = [vertArray[i + 1][0], vertArray[i + 1][1]];
            curContext.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1])
          }
          fillStrokeClose()
        }
      } else if (isBezier && (curShape === 20 || curShape === undef)) {
        curContext.beginPath();
        for (i = 0; i < vertArrayLength; i++) {
          cachedVertArray = vertArray[i];
          if (vertArray[i]["isVert"]) if (vertArray[i]["moveTo"]) curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
          else curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
          else curContext.bezierCurveTo(vertArray[i][0], vertArray[i][1], vertArray[i][2], vertArray[i][3], vertArray[i][4], vertArray[i][5])
        }
        fillStrokeClose()
      } else if (curShape === 2) for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        if (doStroke) p.stroke(cachedVertArray[6]);
        p.point(cachedVertArray[0], cachedVertArray[1])
      } else if (curShape === 4) for (i = 0; i + 1 < vertArrayLength; i += 2) {
        cachedVertArray = vertArray[i];
        if (doStroke) p.stroke(vertArray[i + 1][6]);
        p.line(cachedVertArray[0], cachedVertArray[1], vertArray[i + 1][0], vertArray[i + 1][1])
      } else if (curShape === 9) for (i = 0; i + 2 < vertArrayLength; i += 3) {
        cachedVertArray = vertArray[i];
        curContext.beginPath();
        curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
        curContext.lineTo(vertArray[i + 1][0], vertArray[i + 1][1]);
        curContext.lineTo(vertArray[i + 2][0], vertArray[i + 2][1]);
        curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
        if (doFill) {
          p.fill(vertArray[i + 2][5]);
          executeContextFill()
        }
        if (doStroke) {
          p.stroke(vertArray[i + 2][6]);
          executeContextStroke()
        }
        curContext.closePath()
      } else if (curShape === 10) for (i = 0; i + 1 < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        curContext.beginPath();
        curContext.moveTo(vertArray[i + 1][0], vertArray[i + 1][1]);
        curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
        if (doStroke) p.stroke(vertArray[i + 1][6]);
        if (doFill) p.fill(vertArray[i + 1][5]);
        if (i + 2 < vertArrayLength) {
          curContext.lineTo(vertArray[i + 2][0], vertArray[i + 2][1]);
          if (doStroke) p.stroke(vertArray[i + 2][6]);
          if (doFill) p.fill(vertArray[i + 2][5])
        }
        fillStrokeClose()
      } else if (curShape === 11) {
        if (vertArrayLength > 2) {
          curContext.beginPath();
          curContext.moveTo(vertArray[0][0], vertArray[0][1]);
          curContext.lineTo(vertArray[1][0], vertArray[1][1]);
          curContext.lineTo(vertArray[2][0], vertArray[2][1]);
          if (doFill) {
            p.fill(vertArray[2][5]);
            executeContextFill()
          }
          if (doStroke) {
            p.stroke(vertArray[2][6]);
            executeContextStroke()
          }
          curContext.closePath();
          for (i = 3; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            curContext.beginPath();
            curContext.moveTo(vertArray[0][0], vertArray[0][1]);
            curContext.lineTo(vertArray[i - 1][0], vertArray[i - 1][1]);
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
            if (doFill) {
              p.fill(cachedVertArray[5]);
              executeContextFill()
            }
            if (doStroke) {
              p.stroke(cachedVertArray[6]);
              executeContextStroke()
            }
            curContext.closePath()
          }
        }
      } else if (curShape === 16) for (i = 0; i + 3 < vertArrayLength; i += 4) {
        cachedVertArray = vertArray[i];
        curContext.beginPath();
        curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
        for (j = 1; j < 4; j++) curContext.lineTo(vertArray[i + j][0], vertArray[i + j][1]);
        curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
        if (doFill) {
          p.fill(vertArray[i + 3][5]);
          executeContextFill()
        }
        if (doStroke) {
          p.stroke(vertArray[i + 3][6]);
          executeContextStroke()
        }
        curContext.closePath()
      } else if (curShape === 17) {
        if (vertArrayLength > 3) for (i = 0; i + 1 < vertArrayLength; i += 2) {
          cachedVertArray = vertArray[i];
          curContext.beginPath();
          if (i + 3 < vertArrayLength) {
            curContext.moveTo(vertArray[i + 2][0], vertArray[i + 2][1]);
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
            curContext.lineTo(vertArray[i + 1][0], vertArray[i + 1][1]);
            curContext.lineTo(vertArray[i + 3][0], vertArray[i + 3][1]);
            if (doFill) p.fill(vertArray[i + 3][5]);
            if (doStroke) p.stroke(vertArray[i + 3][6])
          } else {
            curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
            curContext.lineTo(vertArray[i + 1][0], vertArray[i + 1][1])
          }
          fillStrokeClose()
        }
      } else {
        curContext.beginPath();
        curContext.moveTo(vertArray[0][0], vertArray[0][1]);
        for (i = 1; i < vertArrayLength; i++) {
          cachedVertArray = vertArray[i];
          if (cachedVertArray["isVert"]) if (cachedVertArray["moveTo"]) curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
          else curContext.lineTo(cachedVertArray[0], cachedVertArray[1])
        }
        fillStrokeClose()
      }
      isCurve = false;
      isBezier = false;
      curveVertArray = [];
      curveVertCount = 0;
      if (closeShape) vertArray.pop()
    };
    Drawing3D.prototype.endShape = function(mode) {
      if (vertArray.length === 0) return;
      var closeShape = mode === 2;
      var lineVertArray = [];
      var fillVertArray = [];
      var colorVertArray = [];
      var strokeVertArray = [];
      var texVertArray = [];
      var cachedVertArray;
      firstVert = true;
      var i, j, k;
      var vertArrayLength = vertArray.length;
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 0; j < 3; j++) fillVertArray.push(cachedVertArray[j])
      }
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 5; j < 9; j++) colorVertArray.push(cachedVertArray[j])
      }
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 9; j < 13; j++) strokeVertArray.push(cachedVertArray[j])
      }
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        texVertArray.push(cachedVertArray[3]);
        texVertArray.push(cachedVertArray[4])
      }
      if (closeShape) {
        fillVertArray.push(vertArray[0][0]);
        fillVertArray.push(vertArray[0][1]);
        fillVertArray.push(vertArray[0][2]);
        for (i = 5; i < 9; i++) colorVertArray.push(vertArray[0][i]);
        for (i = 9; i < 13; i++) strokeVertArray.push(vertArray[0][i]);
        texVertArray.push(vertArray[0][3]);
        texVertArray.push(vertArray[0][4])
      }
      if (isCurve && (curShape === 20 || curShape === undef)) {
        lineVertArray = fillVertArray;
        if (doStroke) line3D(lineVertArray, null, strokeVertArray);
        if (doFill) fill3D(fillVertArray, null, colorVertArray)
      } else if (isBezier && (curShape === 20 || curShape === undef)) {
        lineVertArray = fillVertArray;
        lineVertArray.splice(lineVertArray.length - 3);
        strokeVertArray.splice(strokeVertArray.length - 4);
        if (doStroke) line3D(lineVertArray, null, strokeVertArray);
        if (doFill) fill3D(fillVertArray, "TRIANGLES", colorVertArray)
      } else {
        if (curShape === 2) {
          for (i = 0; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            for (j = 0; j < 3; j++) lineVertArray.push(cachedVertArray[j])
          }
          point3D(lineVertArray, strokeVertArray)
        } else if (curShape === 4) {
          for (i = 0; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            for (j = 0; j < 3; j++) lineVertArray.push(cachedVertArray[j])
          }
          for (i = 0; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            for (j = 5; j < 9; j++) colorVertArray.push(cachedVertArray[j])
          }
          line3D(lineVertArray, "LINES", strokeVertArray)
        } else if (curShape === 9) {
          if (vertArrayLength > 2) for (i = 0; i + 2 < vertArrayLength; i += 3) {
            fillVertArray = [];
            texVertArray = [];
            lineVertArray = [];
            colorVertArray = [];
            strokeVertArray = [];
            for (j = 0; j < 3; j++) for (k = 0; k < 3; k++) {
              lineVertArray.push(vertArray[i + j][k]);
              fillVertArray.push(vertArray[i + j][k])
            }
            for (j = 0; j < 3; j++) for (k = 3; k < 5; k++) texVertArray.push(vertArray[i + j][k]);
            for (j = 0; j < 3; j++) for (k = 5; k < 9; k++) {
              colorVertArray.push(vertArray[i + j][k]);
              strokeVertArray.push(vertArray[i + j][k + 4])
            }
            if (doStroke) line3D(lineVertArray, "LINE_LOOP", strokeVertArray);
            if (doFill || usingTexture) fill3D(fillVertArray, "TRIANGLES", colorVertArray, texVertArray)
          }
        } else if (curShape === 10) {
          if (vertArrayLength > 2) for (i = 0; i + 2 < vertArrayLength; i++) {
            lineVertArray = [];
            fillVertArray = [];
            strokeVertArray = [];
            colorVertArray = [];
            texVertArray = [];
            for (j = 0; j < 3; j++) for (k = 0; k < 3; k++) {
              lineVertArray.push(vertArray[i + j][k]);
              fillVertArray.push(vertArray[i + j][k])
            }
            for (j = 0; j < 3; j++) for (k = 3; k < 5; k++) texVertArray.push(vertArray[i + j][k]);
            for (j = 0; j < 3; j++) for (k = 5; k < 9; k++) {
              strokeVertArray.push(vertArray[i + j][k + 4]);
              colorVertArray.push(vertArray[i + j][k])
            }
            if (doFill || usingTexture) fill3D(fillVertArray, "TRIANGLE_STRIP", colorVertArray, texVertArray);
            if (doStroke) line3D(lineVertArray, "LINE_LOOP", strokeVertArray)
          }
        } else if (curShape === 11) {
          if (vertArrayLength > 2) {
            for (i = 0; i < 3; i++) {
              cachedVertArray = vertArray[i];
              for (j = 0; j < 3; j++) lineVertArray.push(cachedVertArray[j])
            }
            for (i = 0; i < 3; i++) {
              cachedVertArray = vertArray[i];
              for (j = 9; j < 13; j++) strokeVertArray.push(cachedVertArray[j])
            }
            if (doStroke) line3D(lineVertArray, "LINE_LOOP", strokeVertArray);
            for (i = 2; i + 1 < vertArrayLength; i++) {
              lineVertArray = [];
              strokeVertArray = [];
              lineVertArray.push(vertArray[0][0]);
              lineVertArray.push(vertArray[0][1]);
              lineVertArray.push(vertArray[0][2]);
              strokeVertArray.push(vertArray[0][9]);
              strokeVertArray.push(vertArray[0][10]);
              strokeVertArray.push(vertArray[0][11]);
              strokeVertArray.push(vertArray[0][12]);
              for (j = 0; j < 2; j++) for (k = 0; k < 3; k++) lineVertArray.push(vertArray[i + j][k]);
              for (j = 0; j < 2; j++) for (k = 9; k < 13; k++) strokeVertArray.push(vertArray[i + j][k]);
              if (doStroke) line3D(lineVertArray, "LINE_STRIP", strokeVertArray)
            }
            if (doFill || usingTexture) fill3D(fillVertArray, "TRIANGLE_FAN", colorVertArray, texVertArray)
          }
        } else if (curShape === 16) for (i = 0; i + 3 < vertArrayLength; i += 4) {
          lineVertArray = [];
          for (j = 0; j < 4; j++) {
            cachedVertArray = vertArray[i + j];
            for (k = 0; k < 3; k++) lineVertArray.push(cachedVertArray[k])
          }
          if (doStroke) line3D(lineVertArray, "LINE_LOOP", strokeVertArray);
          if (doFill) {
            fillVertArray = [];
            colorVertArray = [];
            texVertArray = [];
            for (j = 0; j < 3; j++) fillVertArray.push(vertArray[i][j]);
            for (j = 5; j < 9; j++) colorVertArray.push(vertArray[i][j]);
            for (j = 0; j < 3; j++) fillVertArray.push(vertArray[i + 1][j]);
            for (j = 5; j < 9; j++) colorVertArray.push(vertArray[i + 1][j]);
            for (j = 0; j < 3; j++) fillVertArray.push(vertArray[i + 3][j]);
            for (j = 5; j < 9; j++) colorVertArray.push(vertArray[i + 3][j]);
            for (j = 0; j < 3; j++) fillVertArray.push(vertArray[i + 2][j]);
            for (j = 5; j < 9; j++) colorVertArray.push(vertArray[i + 2][j]);
            if (usingTexture) {
              texVertArray.push(vertArray[i + 0][3]);
              texVertArray.push(vertArray[i + 0][4]);
              texVertArray.push(vertArray[i + 1][3]);
              texVertArray.push(vertArray[i + 1][4]);
              texVertArray.push(vertArray[i + 3][3]);
              texVertArray.push(vertArray[i + 3][4]);
              texVertArray.push(vertArray[i + 2][3]);
              texVertArray.push(vertArray[i + 2][4])
            }
            fill3D(fillVertArray, "TRIANGLE_STRIP", colorVertArray, texVertArray)
          }
        } else if (curShape === 17) {
          var tempArray = [];
          if (vertArrayLength > 3) {
            for (i = 0; i < 2; i++) {
              cachedVertArray = vertArray[i];
              for (j = 0; j < 3; j++) lineVertArray.push(cachedVertArray[j])
            }
            for (i = 0; i < 2; i++) {
              cachedVertArray = vertArray[i];
              for (j = 9; j < 13; j++) strokeVertArray.push(cachedVertArray[j])
            }
            line3D(lineVertArray, "LINE_STRIP", strokeVertArray);
            if (vertArrayLength > 4 && vertArrayLength % 2 > 0) {
              tempArray = fillVertArray.splice(fillVertArray.length - 3);
              vertArray.pop()
            }
            for (i = 0; i + 3 < vertArrayLength; i += 2) {
              lineVertArray = [];
              strokeVertArray = [];
              for (j = 0; j < 3; j++) lineVertArray.push(vertArray[i + 1][j]);
              for (j = 0; j < 3; j++) lineVertArray.push(vertArray[i + 3][j]);
              for (j = 0; j < 3; j++) lineVertArray.push(vertArray[i + 2][j]);
              for (j = 0; j < 3; j++) lineVertArray.push(vertArray[i + 0][j]);
              for (j = 9; j < 13; j++) strokeVertArray.push(vertArray[i + 1][j]);
              for (j = 9; j < 13; j++) strokeVertArray.push(vertArray[i + 3][j]);
              for (j = 9; j < 13; j++) strokeVertArray.push(vertArray[i + 2][j]);
              for (j = 9; j < 13; j++) strokeVertArray.push(vertArray[i + 0][j]);
              if (doStroke) line3D(lineVertArray, "LINE_STRIP", strokeVertArray)
            }
            if (doFill || usingTexture) fill3D(fillVertArray, "TRIANGLE_LIST", colorVertArray, texVertArray)
          }
        } else if (vertArrayLength === 1) {
          for (j = 0; j < 3; j++) lineVertArray.push(vertArray[0][j]);
          for (j = 9; j < 13; j++) strokeVertArray.push(vertArray[0][j]);
          point3D(lineVertArray, strokeVertArray)
        } else {
          for (i = 0; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            for (j = 0; j < 3; j++) lineVertArray.push(cachedVertArray[j]);
            for (j = 5; j < 9; j++) strokeVertArray.push(cachedVertArray[j])
          }
          if (doStroke && closeShape) line3D(lineVertArray, "LINE_LOOP", strokeVertArray);
          else if (doStroke && !closeShape) line3D(lineVertArray, "LINE_STRIP", strokeVertArray);
          if (doFill || usingTexture) fill3D(fillVertArray, "TRIANGLE_FAN", colorVertArray, texVertArray)
        }
        usingTexture = false;
        curContext.useProgram(programObject3D);
        uniformi("usingTexture3d", programObject3D, "uUsingTexture", usingTexture)
      }
      isCurve = false;
      isBezier = false;
      curveVertArray = [];
      curveVertCount = 0
    };
    var splineForward = function(segments, matrix) {
      var f = 1 / segments;
      var ff = f * f;
      var fff = ff * f;
      matrix.set(0, 0, 0, 1, fff, ff, f, 0, 6 * fff, 2 * ff, 0, 0, 6 * fff, 0, 0, 0)
    };
    var curveInit = function() {
      if (!curveDrawMatrix) {
        curveBasisMatrix = new PMatrix3D;
        curveDrawMatrix = new PMatrix3D;
        curveInited = true
      }
      var s = curTightness;
      curveBasisMatrix.set((s - 1) / 2, (s + 3) / 2, (-3 - s) / 2, (1 - s) / 2, 1 - s, (-5 - s) / 2, s + 2, (s - 1) / 2, (s - 1) / 2, 0, (1 - s) / 2, 0, 0, 1, 0, 0);
      splineForward(curveDet, curveDrawMatrix);
      if (!bezierBasisInverse) curveToBezierMatrix = new PMatrix3D;
      curveToBezierMatrix.set(curveBasisMatrix);
      curveToBezierMatrix.preApply(bezierBasisInverse);
      curveDrawMatrix.apply(curveBasisMatrix)
    };
    Drawing2D.prototype.bezierVertex = function() {
      isBezier = true;
      var vert = [];
      if (firstVert) throw "vertex() must be used at least once before calling bezierVertex()";
      for (var i = 0; i < arguments.length; i++) vert[i] = arguments[i];
      vertArray.push(vert);
      vertArray[vertArray.length - 1]["isVert"] = false
    };
    Drawing3D.prototype.bezierVertex = function() {
      isBezier = true;
      var vert = [];
      if (firstVert) throw "vertex() must be used at least once before calling bezierVertex()";
      if (arguments.length === 9) {
        if (bezierDrawMatrix === undef) bezierDrawMatrix = new PMatrix3D;
        var lastPoint = vertArray.length - 1;
        splineForward(bezDetail, bezierDrawMatrix);
        bezierDrawMatrix.apply(bezierBasisMatrix);
        var draw = bezierDrawMatrix.array();
        var x1 = vertArray[lastPoint][0],
          y1 = vertArray[lastPoint][1],
          z1 = vertArray[lastPoint][2];
        var xplot1 = draw[4] * x1 + draw[5] * arguments[0] + draw[6] * arguments[3] + draw[7] * arguments[6];
        var xplot2 = draw[8] * x1 + draw[9] * arguments[0] + draw[10] * arguments[3] + draw[11] * arguments[6];
        var xplot3 = draw[12] * x1 + draw[13] * arguments[0] + draw[14] * arguments[3] + draw[15] * arguments[6];
        var yplot1 = draw[4] * y1 + draw[5] * arguments[1] + draw[6] * arguments[4] + draw[7] * arguments[7];
        var yplot2 = draw[8] * y1 + draw[9] * arguments[1] + draw[10] * arguments[4] + draw[11] * arguments[7];
        var yplot3 = draw[12] * y1 + draw[13] * arguments[1] + draw[14] * arguments[4] + draw[15] * arguments[7];
        var zplot1 = draw[4] * z1 + draw[5] * arguments[2] + draw[6] * arguments[5] + draw[7] * arguments[8];
        var zplot2 = draw[8] * z1 + draw[9] * arguments[2] + draw[10] * arguments[5] + draw[11] * arguments[8];
        var zplot3 = draw[12] * z1 + draw[13] * arguments[2] + draw[14] * arguments[5] + draw[15] * arguments[8];
        for (var j = 0; j < bezDetail; j++) {
          x1 += xplot1;
          xplot1 += xplot2;
          xplot2 += xplot3;
          y1 += yplot1;
          yplot1 += yplot2;
          yplot2 += yplot3;
          z1 += zplot1;
          zplot1 += zplot2;
          zplot2 += zplot3;
          p.vertex(x1, y1, z1)
        }
        p.vertex(arguments[6], arguments[7], arguments[8])
      }
    };
    p.texture = function(pimage) {
      var curContext = drawing.$ensureContext();
      if (pimage.__texture) curContext.bindTexture(curContext.TEXTURE_2D, pimage.__texture);
      else if (pimage.localName === "canvas") {
        curContext.bindTexture(curContext.TEXTURE_2D, canTex);
        curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, pimage);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR);
        curContext.generateMipmap(curContext.TEXTURE_2D);
        curTexture.width = pimage.width;
        curTexture.height = pimage.height
      } else {
        var texture = curContext.createTexture(),
          cvs = document.createElement("canvas"),
          cvsTextureCtx = cvs.getContext("2d"),
          pot;
        if (pimage.width & pimage.width - 1 === 0) cvs.width = pimage.width;
        else {
          pot = 1;
          while (pot < pimage.width) pot *= 2;
          cvs.width = pot
        }
        if (pimage.height & pimage.height - 1 === 0) cvs.height = pimage.height;
        else {
          pot = 1;
          while (pot < pimage.height) pot *= 2;
          cvs.height = pot
        }
        cvsTextureCtx.drawImage(pimage.sourceImg, 0, 0, pimage.width, pimage.height, 0, 0, cvs.width, cvs.height);
        curContext.bindTexture(curContext.TEXTURE_2D, texture);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR_MIPMAP_LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_T, curContext.CLAMP_TO_EDGE);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_S, curContext.CLAMP_TO_EDGE);
        curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, cvs);
        curContext.generateMipmap(curContext.TEXTURE_2D);
        pimage.__texture = texture;
        curTexture.width = pimage.width;
        curTexture.height = pimage.height
      }
      usingTexture = true;
      curContext.useProgram(programObject3D);
      uniformi("usingTexture3d", programObject3D, "uUsingTexture", usingTexture)
    };
    p.textureMode = function(mode) {
      curTextureMode = mode
    };
    var curveVertexSegment = function(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
      var x0 = x2;
      var y0 = y2;
      var z0 = z2;
      var draw = curveDrawMatrix.array();
      var xplot1 = draw[4] * x1 + draw[5] * x2 + draw[6] * x3 + draw[7] * x4;
      var xplot2 = draw[8] * x1 + draw[9] * x2 + draw[10] * x3 + draw[11] * x4;
      var xplot3 = draw[12] * x1 + draw[13] * x2 + draw[14] * x3 + draw[15] * x4;
      var yplot1 = draw[4] * y1 + draw[5] * y2 + draw[6] * y3 + draw[7] * y4;
      var yplot2 = draw[8] * y1 + draw[9] * y2 + draw[10] * y3 + draw[11] * y4;
      var yplot3 = draw[12] * y1 + draw[13] * y2 + draw[14] * y3 + draw[15] * y4;
      var zplot1 = draw[4] * z1 + draw[5] * z2 + draw[6] * z3 + draw[7] * z4;
      var zplot2 = draw[8] * z1 + draw[9] * z2 + draw[10] * z3 + draw[11] * z4;
      var zplot3 = draw[12] * z1 + draw[13] * z2 + draw[14] * z3 + draw[15] * z4;
      p.vertex(x0, y0, z0);
      for (var j = 0; j < curveDet; j++) {
        x0 += xplot1;
        xplot1 += xplot2;
        xplot2 += xplot3;
        y0 += yplot1;
        yplot1 += yplot2;
        yplot2 += yplot3;
        z0 += zplot1;
        zplot1 += zplot2;
        zplot2 += zplot3;
        p.vertex(x0, y0, z0)
      }
    };
    Drawing2D.prototype.curveVertex = function(x, y) {
      isCurve = true;
      p.vertex(x, y)
    };
    Drawing3D.prototype.curveVertex = function(x, y, z) {
      isCurve = true;
      if (!curveInited) curveInit();
      var vert = [];
      vert[0] = x;
      vert[1] = y;
      vert[2] = z;
      curveVertArray.push(vert);
      curveVertCount++;
      if (curveVertCount > 3) curveVertexSegment(curveVertArray[curveVertCount - 4][0], curveVertArray[curveVertCount - 4][1], curveVertArray[curveVertCount - 4][2], curveVertArray[curveVertCount - 3][0], curveVertArray[curveVertCount - 3][1], curveVertArray[curveVertCount - 3][2], curveVertArray[curveVertCount - 2][0], curveVertArray[curveVertCount - 2][1], curveVertArray[curveVertCount - 2][2], curveVertArray[curveVertCount - 1][0], curveVertArray[curveVertCount - 1][1], curveVertArray[curveVertCount - 1][2])
    };
    Drawing2D.prototype.curve = function(x1, y1, x2, y2, x3, y3, x4, y4) {
      p.beginShape();
      p.curveVertex(x1, y1);
      p.curveVertex(x2, y2);
      p.curveVertex(x3, y3);
      p.curveVertex(x4, y4);
      p.endShape()
    };
    Drawing3D.prototype.curve = function(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
      if (z4 !== undef) {
        p.beginShape();
        p.curveVertex(x1, y1, z1);
        p.curveVertex(x2, y2, z2);
        p.curveVertex(x3, y3, z3);
        p.curveVertex(x4, y4, z4);
        p.endShape();
        return
      }
      p.beginShape();
      p.curveVertex(x1, y1);
      p.curveVertex(z1, x2);
      p.curveVertex(y2, z2);
      p.curveVertex(x3, y3);
      p.endShape()
    };
    p.curveTightness = function(tightness) {
      curTightness = tightness
    };
    p.curveDetail = function(detail) {
      curveDet = detail;
      curveInit()
    };
    p.rectMode = function(aRectMode) {
      curRectMode = aRectMode
    };
    p.imageMode = function(mode) {
      switch (mode) {
      case 0:
        imageModeConvert = imageModeCorner;
        break;
      case 1:
        imageModeConvert = imageModeCorners;
        break;
      case 3:
        imageModeConvert = imageModeCenter;
        break;
      default:
        throw "Invalid imageMode";
      }
    };
    p.ellipseMode = function(aEllipseMode) {
      curEllipseMode = aEllipseMode
    };
    p.arc = function(x, y, width, height, start, stop) {
      if (width <= 0 || stop < start) return;
      if (curEllipseMode === 1) {
        width = width - x;
        height = height - y
      } else if (curEllipseMode === 2) {
        x = x - width;
        y = y - height;
        width = width * 2;
        height = height * 2
      } else if (curEllipseMode === 3) {
        x = x - width / 2;
        y = y - height / 2
      }
      while (start < 0) {
        start += 6.283185307179586;
        stop += 6.283185307179586
      }
      if (stop - start > 6.283185307179586) {
        start = 0;
        stop = 6.283185307179586
      }
      var hr = width / 2,
        vr = height / 2,
        centerX = x + hr,
        centerY = y + vr,
        startLUT = 0 | 0.5 + start * p.RAD_TO_DEG * 2,
        stopLUT = 0 | 0.5 + stop * p.RAD_TO_DEG * 2,
        i, j;
      if (doFill) {
        var savedStroke = doStroke;
        doStroke = false;
        p.beginShape();
        p.vertex(centerX, centerY);
        for (i = startLUT; i <= stopLUT; i++) {
          j = i % 720;
          p.vertex(centerX + cosLUT[j] * hr, centerY + sinLUT[j] * vr)
        }
        p.endShape(2);
        doStroke = savedStroke
      }
      if (doStroke) {
        var savedFill = doFill;
        doFill = false;
        p.beginShape();
        for (i = startLUT; i <= stopLUT; i++) {
          j = i % 720;
          p.vertex(centerX + cosLUT[j] * hr, centerY + sinLUT[j] * vr)
        }
        p.endShape();
        doFill = savedFill
      }
    };
    Drawing2D.prototype.line = function(x1, y1, x2, y2) {
      if (!doStroke) return;
      x1 = Math.round(x1);
      x2 = Math.round(x2);
      y1 = Math.round(y1);
      y2 = Math.round(y2);
      if (x1 === x2 && y1 === y2) {
        p.point(x1, y1);
        return
      }
      var swap = undef,
        lineCap = undef,
        drawCrisp = true,
        currentModelView = modelView.array(),
        identityMatrix = [1, 0, 0, 0, 1, 0];
      for (var i = 0; i < 6 && drawCrisp; i++) drawCrisp = currentModelView[i] === identityMatrix[i];
      if (drawCrisp) {
        if (x1 === x2) {
          if (y1 > y2) {
            swap = y1;
            y1 = y2;
            y2 = swap
          }
          y2++;
          if (lineWidth % 2 === 1) curContext.translate(0.5, 0)
        } else if (y1 === y2) {
          if (x1 > x2) {
            swap = x1;
            x1 = x2;
            x2 = swap
          }
          x2++;
          if (lineWidth % 2 === 1) curContext.translate(0, 0.5)
        }
        if (lineWidth === 1) {
          lineCap = curContext.lineCap;
          curContext.lineCap = "butt"
        }
      }
      curContext.beginPath();
      curContext.moveTo(x1 || 0, y1 || 0);
      curContext.lineTo(x2 || 0, y2 || 0);
      executeContextStroke();
      if (drawCrisp) {
        if (x1 === x2 && lineWidth % 2 === 1) curContext.translate(-0.5, 0);
        else if (y1 === y2 && lineWidth % 2 === 1) curContext.translate(0, -0.5);
        if (lineWidth === 1) curContext.lineCap = lineCap
      }
    };
    Drawing3D.prototype.line = function(x1, y1, z1, x2, y2, z2) {
      if (y2 === undef || z2 === undef) {
        z2 = 0;
        y2 = x2;
        x2 = z1;
        z1 = 0
      }
      if (x1 === x2 && y1 === y2 && z1 === z2) {
        p.point(x1, y1, z1);
        return
      }
      var lineVerts = [x1, y1, z1, x2, y2, z2];
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);
        uniformMatrix("uModel2d", programObject2D, "uModel", false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText", programObject2D, "uIsDrawingText", false);
        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, lineBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        curContext.bufferData(curContext.ARRAY_BUFFER, new Float32Array(lineVerts), curContext.STREAM_DRAW);
        curContext.drawArrays(curContext.LINES, 0, 2)
      }
    };
    Drawing2D.prototype.bezier = function() {
      if (arguments.length !== 8) throw "You must use 8 parameters for bezier() in 2D mode";
      p.beginShape();
      p.vertex(arguments[0], arguments[1]);
      p.bezierVertex(arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
      p.endShape()
    };
    Drawing3D.prototype.bezier = function() {
      if (arguments.length !== 12) throw "You must use 12 parameters for bezier() in 3D mode";
      p.beginShape();
      p.vertex(arguments[0], arguments[1], arguments[2]);
      p.bezierVertex(arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11]);
      p.endShape()
    };
    p.bezierDetail = function(detail) {
      bezDetail = detail
    };
    p.bezierPoint = function(a, b, c, d, t) {
      return (1 - t) * (1 - t) * (1 - t) * a + 3 * (1 - t) * (1 - t) * t * b + 3 * (1 - t) * t * t * c + t * t * t * d
    };
    p.bezierTangent = function(a, b, c, d, t) {
      return 3 * t * t * (-a + 3 * b - 3 * c + d) + 6 * t * (a - 2 * b + c) + 3 * (-a + b)
    };
    p.curvePoint = function(a, b, c, d, t) {
      return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
    };
    p.curveTangent = function(a, b, c, d, t) {
      return 0.5 * (-a + c + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (-a + 3 * b - 3 * c + d) * t * t)
    };
    p.triangle = function(x1, y1, x2, y2, x3, y3) {
      p.beginShape(9);
      p.vertex(x1, y1, 0);
      p.vertex(x2, y2, 0);
      p.vertex(x3, y3, 0);
      p.endShape()
    };
    p.quad = function(x1, y1, x2, y2, x3, y3, x4, y4) {
      p.beginShape(16);
      p.vertex(x1, y1, 0);
      p.vertex(x2, y2, 0);
      p.vertex(x3, y3, 0);
      p.vertex(x4, y4, 0);
      p.endShape()
    };
    var roundedRect$2d = function(x, y, width, height, tl, tr, br, bl) {
      if (bl === undef) {
        tr = tl;
        br = tl;
        bl = tl
      }
      var halfWidth = width / 2,
        halfHeight = height / 2;
      if (tl > halfWidth || tl > halfHeight) tl = Math.min(halfWidth, halfHeight);
      if (tr > halfWidth || tr > halfHeight) tr = Math.min(halfWidth, halfHeight);
      if (br > halfWidth || br > halfHeight) br = Math.min(halfWidth, halfHeight);
      if (bl > halfWidth || bl > halfHeight) bl = Math.min(halfWidth, halfHeight);
      if (!doFill || doStroke) curContext.translate(0.5, 0.5);
      curContext.beginPath();
      curContext.moveTo(x + tl, y);
      curContext.lineTo(x + width - tr, y);
      curContext.quadraticCurveTo(x + width, y, x + width, y + tr);
      curContext.lineTo(x + width, y + height - br);
      curContext.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
      curContext.lineTo(x + bl, y + height);
      curContext.quadraticCurveTo(x, y + height, x, y + height - bl);
      curContext.lineTo(x, y + tl);
      curContext.quadraticCurveTo(x, y, x + tl, y);
      if (!doFill || doStroke) curContext.translate(-0.5, -0.5);
      executeContextFill();
      executeContextStroke()
    };
    Drawing2D.prototype.rect = function(x, y, width, height, tl, tr, br, bl) {
      if (!width && !height) return;
      if (curRectMode === 1) {
        width -= x;
        height -= y
      } else if (curRectMode === 2) {
        width *= 2;
        height *= 2;
        x -= width / 2;
        y -= height / 2
      } else if (curRectMode === 3) {
        x -= width / 2;
        y -= height / 2
      }
      x = Math.round(x);
      y = Math.round(y);
      width = Math.round(width);
      height = Math.round(height);
      if (tl !== undef) {
        roundedRect$2d(x, y, width, height, tl, tr, br, bl);
        return
      }
      if (doStroke && lineWidth % 2 === 1) curContext.translate(0.5, 0.5);
      curContext.beginPath();
      curContext.rect(x, y, width, height);
      executeContextFill();
      executeContextStroke();
      if (doStroke && lineWidth % 2 === 1) curContext.translate(-0.5, -0.5)
    };
    Drawing3D.prototype.rect = function(x, y, width, height, tl, tr, br, bl) {
      if (tl !== undef) throw "rect() with rounded corners is not supported in 3D mode";
      if (curRectMode === 1) {
        width -= x;
        height -= y
      } else if (curRectMode === 2) {
        width *= 2;
        height *= 2;
        x -= width / 2;
        y -= height / 2
      } else if (curRectMode === 3) {
        x -= width / 2;
        y -= height / 2
      }
      var model = new PMatrix3D;
      model.translate(x, y, 0);
      model.scale(width, height, 1);
      model.transpose();
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      if (lineWidth > 0 && doStroke) {
        curContext.useProgram(programObject2D);
        uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
        uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
        uniformf("uColor2d", programObject2D, "uColor", strokeStyle);
        uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", false);
        vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, rectBuffer);
        disableVertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord");
        curContext.drawArrays(curContext.LINE_LOOP, 0, rectVerts.length / 3)
      }
      if (doFill) {
        curContext.useProgram(programObject3D);
        uniformMatrix("uModel3d", programObject3D, "uModel", false, model.array());
        uniformMatrix("uView3d", programObject3D, "uView", false, view.array());
        curContext.enable(curContext.POLYGON_OFFSET_FILL);
        curContext.polygonOffset(1, 1);
        uniformf("color3d", programObject3D, "uColor", fillStyle);
        if (lightCount > 0) {
          var v = new PMatrix3D;
          v.set(view);
          var m = new PMatrix3D;
          m.set(model);
          v.mult(m);
          var normalMatrix = new PMatrix3D;
          normalMatrix.set(v);
          normalMatrix.invert();
          normalMatrix.transpose();
          uniformMatrix("uNormalTransform3d", programObject3D, "uNormalTransform", false, normalMatrix.array());
          vertexAttribPointer("aNormal3d", programObject3D, "aNormal", 3, rectNormBuffer)
        } else disableVertexAttribPointer("normal3d", programObject3D, "aNormal");
        vertexAttribPointer("vertex3d", programObject3D, "aVertex", 3, rectBuffer);
        curContext.drawArrays(curContext.TRIANGLE_FAN, 0, rectVerts.length / 3);
        curContext.disable(curContext.POLYGON_OFFSET_FILL)
      }
    };
    Drawing2D.prototype.ellipse = function(x, y, width, height) {
      x = x || 0;
      y = y || 0;
      if (width <= 0 && height <= 0) return;
      if (curEllipseMode === 2) {
        width *= 2;
        height *= 2
      } else if (curEllipseMode === 1) {
        width = width - x;
        height = height - y;
        x += width / 2;
        y += height / 2
      } else if (curEllipseMode === 0) {
        x += width / 2;
        y += height / 2
      }
      if (width === height) {
        curContext.beginPath();
        curContext.arc(x, y, width / 2, 0, 6.283185307179586, false);
        executeContextFill();
        executeContextStroke()
      } else {
        var w = width / 2,
          h = height / 2,
          C = 0.5522847498307933,
          c_x = C * w,
          c_y = C * h;
        p.beginShape();
        p.vertex(x + w, y);
        p.bezierVertex(x + w, y - c_y, x + c_x, y - h, x, y - h);
        p.bezierVertex(x - c_x, y - h, x - w, y - c_y, x - w, y);
        p.bezierVertex(x - w, y + c_y, x - c_x, y + h, x, y + h);
        p.bezierVertex(x + c_x, y + h, x + w, y + c_y, x + w, y);
        p.endShape()
      }
    };
    Drawing3D.prototype.ellipse = function(x, y, width, height) {
      x = x || 0;
      y = y || 0;
      if (width <= 0 && height <= 0) return;
      if (curEllipseMode === 2) {
        width *= 2;
        height *= 2
      } else if (curEllipseMode === 1) {
        width = width - x;
        height = height - y;
        x += width / 2;
        y += height / 2
      } else if (curEllipseMode === 0) {
        x += width / 2;
        y += height / 2
      }
      var w = width / 2,
        h = height / 2,
        C = 0.5522847498307933,
        c_x = C * w,
        c_y = C * h;
      p.beginShape();
      p.vertex(x + w, y);
      p.bezierVertex(x + w, y - c_y, 0, x + c_x, y - h, 0, x, y - h, 0);
      p.bezierVertex(x - c_x, y - h, 0, x - w, y - c_y, 0, x - w, y, 0);
      p.bezierVertex(x - w, y + c_y, 0, x - c_x, y + h, 0, x, y + h, 0);
      p.bezierVertex(x + c_x, y + h, 0, x + w, y + c_y, 0, x + w, y, 0);
      p.endShape();
      if (doFill) {
        var xAv = 0,
          yAv = 0,
          i, j;
        for (i = 0; i < vertArray.length; i++) {
          xAv += vertArray[i][0];
          yAv += vertArray[i][1]
        }
        xAv /= vertArray.length;
        yAv /= vertArray.length;
        var vert = [],
          fillVertArray = [],
          colorVertArray = [];
        vert[0] = xAv;
        vert[1] = yAv;
        vert[2] = 0;
        vert[3] = 0;
        vert[4] = 0;
        vert[5] = fillStyle[0];
        vert[6] = fillStyle[1];
        vert[7] = fillStyle[2];
        vert[8] = fillStyle[3];
        vert[9] = strokeStyle[0];
        vert[10] = strokeStyle[1];
        vert[11] = strokeStyle[2];
        vert[12] = strokeStyle[3];
        vert[13] = normalX;
        vert[14] = normalY;
        vert[15] = normalZ;
        vertArray.unshift(vert);
        for (i = 0; i < vertArray.length; i++) {
          for (j = 0; j < 3; j++) fillVertArray.push(vertArray[i][j]);
          for (j = 5; j < 9; j++) colorVertArray.push(vertArray[i][j])
        }
        fill3D(fillVertArray, "TRIANGLE_FAN", colorVertArray)
      }
    };
    p.normal = function(nx, ny, nz) {
      if (arguments.length !== 3 || !(typeof nx === "number" && typeof ny === "number" && typeof nz === "number")) throw "normal() requires three numeric arguments.";
      normalX = nx;
      normalY = ny;
      normalZ = nz;
      if (curShape !== 0) if (normalMode === 0) normalMode = 1;
      else if (normalMode === 1) normalMode = 2
    };
    p.save = function(file, img) {
      if (img !== undef) return window.open(img.toDataURL(), "_blank");
      return window.open(p.externals.canvas.toDataURL(), "_blank")
    };
    var saveNumber = 0;
    p.saveFrame = function(file) {
      if (file === undef) file = "screen-####.png";
      var frameFilename = file.replace(/#+/, function(all) {
        var s = "" + saveNumber++;
        while (s.length < all.length) s = "0" + s;
        return s
      });
      p.save(frameFilename)
    };
    var utilityContext2d = document.createElement("canvas").getContext("2d");
    var canvasDataCache = [undef, undef, undef];

    function getCanvasData(obj, w, h) {
      var canvasData = canvasDataCache.shift();
      if (canvasData === undef) {
        canvasData = {};
        canvasData.canvas = document.createElement("canvas");
        canvasData.context = canvasData.canvas.getContext("2d")
      }
      canvasDataCache.push(canvasData);
      var canvas = canvasData.canvas,
        context = canvasData.context,
        width = w || obj.width,
        height = h || obj.height;
      canvas.width = width;
      canvas.height = height;
      if (!obj) context.clearRect(0, 0, width, height);
      else if ("data" in obj) context.putImageData(obj, 0, 0);
      else {
        context.clearRect(0, 0, width, height);
        context.drawImage(obj, 0, 0, width, height)
      }
      return canvasData
    }
    function buildPixelsObject(pImage) {
      return {
        getLength: function(aImg) {
          return function() {
            if (aImg.isRemote) throw "Image is loaded remotely. Cannot get length.";
            else return aImg.imageData.data.length ? aImg.imageData.data.length / 4 : 0
          }
        }(pImage),
        getPixel: function(aImg) {
          return function(i) {
            var offset = i * 4,
              data = aImg.imageData.data;
            if (aImg.isRemote) throw "Image is loaded remotely. Cannot get pixels.";
            return (data[offset + 3] & 255) << 24 | (data[offset] & 255) << 16 | (data[offset + 1] & 255) << 8 | data[offset + 2] & 255
          }
        }(pImage),
        setPixel: function(aImg) {
          return function(i, c) {
            var offset = i * 4,
              data = aImg.imageData.data;
            if (aImg.isRemote) throw "Image is loaded remotely. Cannot set pixel.";
            data[offset + 0] = (c >> 16) & 255;
            data[offset + 1] = (c >> 8) & 255;
            data[offset + 2] = c & 255;
            data[offset + 3] = (c >> 24) & 255;
            aImg.__isDirty = true
          }
        }(pImage),
        toArray: function(aImg) {
          return function() {
            var arr = [],
              data = aImg.imageData.data,
              length = aImg.width * aImg.height;
            if (aImg.isRemote) throw "Image is loaded remotely. Cannot get pixels.";
            for (var i = 0, offset = 0; i < length; i++, offset += 4) arr.push((data[offset + 3] & 255) << 24 | (data[offset] & 255) << 16 | (data[offset + 1] & 255) << 8 | data[offset + 2] & 255);
            return arr
          }
        }(pImage),
        set: function(aImg) {
          return function(arr) {
            var offset, data, c;
            if (this.isRemote) throw "Image is loaded remotely. Cannot set pixels.";
            data = aImg.imageData.data;
            for (var i = 0, aL = arr.length; i < aL; i++) {
              c = arr[i];
              offset = i * 4;
              data[offset + 0] = (c >> 16) & 255;
              data[offset + 1] = (c >> 8) & 255;
              data[offset + 2] = c & 255;
              data[offset + 3] = (c >> 24) & 255
            }
            aImg.__isDirty = true
          }
        }(pImage)
      }
    }
    var PImage = function(aWidth, aHeight, aFormat) {
      this.__isDirty = false;
      if (aWidth instanceof HTMLImageElement) this.fromHTMLImageData(aWidth);
      else if (aHeight || aFormat) {
        this.width = aWidth || 1;
        this.height = aHeight || 1;
        var canvas = this.sourceImg = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var imageData = this.imageData = canvas.getContext("2d").createImageData(this.width, this.height);
        this.format = aFormat === 2 || aFormat === 4 ? aFormat : 1;
        if (this.format === 1) for (var i = 3, data = this.imageData.data, len = data.length; i < len; i += 4) data[i] = 255;
        this.__isDirty = true;
        this.updatePixels()
      } else {
        this.width = 0;
        this.height = 0;
        this.imageData = utilityContext2d.createImageData(1, 1);
        this.format = 2
      }
      this.pixels = buildPixelsObject(this)
    };
    PImage.prototype = {
      __isPImage: true,
      updatePixels: function() {
        var canvas = this.sourceImg;
        if (canvas && canvas instanceof HTMLCanvasElement && this.__isDirty) canvas.getContext("2d").putImageData(this.imageData, 0, 0);
        this.__isDirty = false
      },
      fromHTMLImageData: function(htmlImg) {
        var canvasData = getCanvasData(htmlImg);
        try {
          var imageData = canvasData.context.getImageData(0, 0, htmlImg.width, htmlImg.height);
          this.fromImageData(imageData)
        } catch(e) {
          if (htmlImg.width && htmlImg.height) {
            this.isRemote = true;
            this.width = htmlImg.width;
            this.height = htmlImg.height
          }
        }
        this.sourceImg = htmlImg
      },
      "get": function(x, y, w, h) {
        if (!arguments.length) return p.get(this);
        if (arguments.length === 2) return p.get(x, y, this);
        if (arguments.length === 4) return p.get(x, y, w, h, this)
      },
      "set": function(x, y, c) {
        p.set(x, y, c, this);
        this.__isDirty = true
      },
      blend: function(srcImg, x, y, width, height, dx, dy, dwidth, dheight, MODE) {
        if (arguments.length === 9) p.blend(this, srcImg, x, y, width, height, dx, dy, dwidth, dheight, this);
        else if (arguments.length === 10) p.blend(srcImg, x, y, width, height, dx, dy, dwidth, dheight, MODE, this);
        delete this.sourceImg
      },
      copy: function(srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, dheight) {
        if (arguments.length === 8) p.blend(this, srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, 0, this);
        else if (arguments.length === 9) p.blend(srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, dheight, 0, this);
        delete this.sourceImg
      },
      filter: function(mode, param) {
        if (arguments.length === 2) p.filter(mode, param, this);
        else if (arguments.length === 1) p.filter(mode, null, this);
        delete this.sourceImg
      },
      save: function(file) {
        p.save(file, this)
      },
      resize: function(w, h) {
        if (this.isRemote) throw "Image is loaded remotely. Cannot resize.";
        if (this.width !== 0 || this.height !== 0) {
          if (w === 0 && h !== 0) w = Math.floor(this.width / this.height * h);
          else if (h === 0 && w !== 0) h = Math.floor(this.height / this.width * w);
          var canvas = getCanvasData(this.imageData).canvas;
          var imageData = getCanvasData(canvas, w, h).context.getImageData(0, 0, w, h);
          this.fromImageData(imageData)
        }
      },
      mask: function(mask) {
        var obj = this.toImageData(),
          i, size;
        if (mask instanceof PImage || mask.__isPImage) if (mask.width === this.width && mask.height === this.height) {
          mask = mask.toImageData();
          for (i = 2, size = this.width * this.height * 4; i < size; i += 4) obj.data[i + 1] = mask.data[i]
        } else throw "mask must have the same dimensions as PImage.";
        else if (mask instanceof
        Array) if (this.width * this.height === mask.length) for (i = 0, size = mask.length; i < size; ++i) obj.data[i * 4 + 3] = mask[i];
        else throw "mask array must be the same length as PImage pixels array.";
        this.fromImageData(obj)
      },
      loadPixels: nop,
      toImageData: function() {
        if (this.isRemote) return this.sourceImg;
        if (!this.__isDirty) return this.imageData;
        var canvasData = getCanvasData(this.sourceImg);
        return canvasData.context.getImageData(0, 0, this.width, this.height)
      },
      toDataURL: function() {
        if (this.isRemote) throw "Image is loaded remotely. Cannot create dataURI.";
        var canvasData = getCanvasData(this.imageData);
        return canvasData.canvas.toDataURL()
      },
      fromImageData: function(canvasImg) {
        var w = canvasImg.width,
          h = canvasImg.height,
          canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d");
        this.width = canvas.width = w;
        this.height = canvas.height = h;
        ctx.putImageData(canvasImg, 0, 0);
        this.format = 2;
        this.imageData = canvasImg;
        this.sourceImg = canvas
      }
    };
    p.PImage = PImage;
    p.createImage = function(w, h, mode) {
      return new PImage(w, h, mode)
    };
    p.loadImage = function(file, type, callback) {
      if (type) file = file + "." + type;
      var pimg;
      if (curSketch.imageCache.images[file]) {
        pimg = new PImage(curSketch.imageCache.images[file]);
        pimg.loaded = true;
        return pimg
      }
      pimg = new PImage;
      var img = document.createElement("img");
      pimg.sourceImg = img;
      img.onload = function(aImage, aPImage, aCallback) {
        var image = aImage;
        var pimg = aPImage;
        var callback = aCallback;
        return function() {
          pimg.fromHTMLImageData(image);
          pimg.loaded = true;
          if (callback) callback()
        }
      }(img, pimg, callback);
      img.src = file;
      return pimg
    };
    p.requestImage = p.loadImage;

    function get$2(x, y) {
      var data;
      if (x >= p.width || x < 0 || y < 0 || y >= p.height) return 0;
      if (isContextReplaced) {
        var offset = ((0 | x) + p.width * (0 | y)) * 4;
        data = p.imageData.data;
        return (data[offset + 3] & 255) << 24 | (data[offset] & 255) << 16 | (data[offset + 1] & 255) << 8 | data[offset + 2] & 255
      }
      data = p.toImageData(0 | x, 0 | y, 1, 1).data;
      return (data[3] & 255) << 24 | (data[0] & 255) << 16 | (data[1] & 255) << 8 | data[2] & 255
    }
    function get$3(x, y, img) {
      if (img.isRemote) throw "Image is loaded remotely. Cannot get x,y.";
      var offset = y * img.width * 4 + x * 4,
        data = img.imageData.data;
      return (data[offset + 3] & 255) << 24 | (data[offset] & 255) << 16 | (data[offset + 1] & 255) << 8 | data[offset + 2] & 255
    }
    function get$4(x, y, w, h) {
      var c = new PImage(w, h, 2);
      c.fromImageData(p.toImageData(x, y, w, h));
      return c
    }
    function get$5(x, y, w, h, img) {
      if (img.isRemote) throw "Image is loaded remotely. Cannot get x,y,w,h.";
      var c = new PImage(w, h, 2),
        cData = c.imageData.data,
        imgWidth = img.width,
        imgHeight = img.height,
        imgData = img.imageData.data;
      var startRow = Math.max(0, -y),
        startColumn = Math.max(0, -x),
        stopRow = Math.min(h, imgHeight - y),
        stopColumn = Math.min(w, imgWidth - x);
      for (var i = startRow; i < stopRow; ++i) {
        var sourceOffset = ((y + i) * imgWidth + (x + startColumn)) * 4;
        var targetOffset = (i * w + startColumn) * 4;
        for (var j = startColumn; j < stopColumn; ++j) {
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++]
        }
      }
      c.__isDirty = true;
      return c
    }
    p.get = function(x, y, w, h, img) {
      if (img !== undefined) return get$5(x, y, w, h, img);
      if (h !== undefined) return get$4(x, y, w, h);
      if (w !== undefined) return get$3(x, y, w);
      if (y !== undefined) return get$2(x, y);
      if (x !== undefined) return get$5(0, 0, x.width, x.height, x);
      return get$4(0, 0, p.width, p.height)
    };
    p.createGraphics = function(w, h, render) {
      var pg = new Processing;
      pg.size(w, h, render);
      pg.background(0, 0);
      return pg
    };

    function resetContext() {
      if (isContextReplaced) {
        curContext = originalContext;
        isContextReplaced = false;
        p.updatePixels()
      }
    }

    function SetPixelContextWrapper() {
      function wrapFunction(newContext, name) {
        function wrapper() {
          resetContext();
          curContext[name].apply(curContext, arguments)
        }
        newContext[name] = wrapper
      }
      function wrapProperty(newContext, name) {
        function getter() {
          resetContext();
          return curContext[name]
        }
        function setter(value) {
          resetContext();
          curContext[name] = value
        }
        p.defineProperty(newContext, name, {
          get: getter,
          set: setter
        })
      }
      for (var n in curContext) if (typeof curContext[n] === "function") wrapFunction(this, n);
      else wrapProperty(this, n)
    }
    function replaceContext() {
      if (isContextReplaced) return;
      p.loadPixels();
      if (proxyContext === null) {
        originalContext = curContext;
        proxyContext = new SetPixelContextWrapper
      }
      isContextReplaced = true;
      curContext = proxyContext;
      setPixelsCached = 0
    }
    function set$3(x, y, c) {
      if (x < p.width && x >= 0 && y >= 0 && y < p.height) {
        replaceContext();
        p.pixels.setPixel((0 | x) + p.width * (0 | y), c);
        if (++setPixelsCached > maxPixelsCached) resetContext()
      }
    }
    function set$4(x, y, obj, img) {
      if (img.isRemote) throw "Image is loaded remotely. Cannot set x,y.";
      var c = p.color.toArray(obj);
      var offset = y * img.width * 4 + x * 4;
      var data = img.imageData.data;
      data[offset] = c[0];
      data[offset + 1] = c[1];
      data[offset + 2] = c[2];
      data[offset + 3] = c[3]
    }
    p.set = function(x, y, obj, img) {
      var color, oldFill;
      if (arguments.length === 3) if (typeof obj === "number") set$3(x, y, obj);
      else {
        if (obj instanceof PImage || obj.__isPImage) p.image(obj, x, y)
      } else if (arguments.length === 4) set$4(x, y, obj, img)
    };
    p.imageData = {};
    p.pixels = {
      getLength: function() {
        return p.imageData.data.length ? p.imageData.data.length / 4 : 0
      },
      getPixel: function(i) {
        var offset = i * 4,
          data = p.imageData.data;
        return data[offset + 3] << 24 & 4278190080 | data[offset + 0] << 16 & 16711680 | data[offset + 1] << 8 & 65280 | data[offset + 2] & 255
      },
      setPixel: function(i, c) {
        var offset = i * 4,
          data = p.imageData.data;
        data[offset + 0] = (c & 16711680) >>> 16;
        data[offset + 1] = (c & 65280) >>> 8;
        data[offset + 2] = c & 255;
        data[offset + 3] = (c & 4278190080) >>> 24
      },
      toArray: function() {
        var arr = [],
          length = p.imageData.width * p.imageData.height,
          data = p.imageData.data;
        for (var i = 0, offset = 0; i < length; i++, offset += 4) arr.push(data[offset + 3] << 24 & 4278190080 | data[offset + 0] << 16 & 16711680 | data[offset + 1] << 8 & 65280 | data[offset + 2] & 255);
        return arr
      },
      set: function(arr) {
        for (var i = 0, aL = arr.length; i < aL; i++) this.setPixel(i, arr[i])
      }
    };
    p.loadPixels = function() {
      p.imageData = drawing.$ensureContext().getImageData(0, 0, p.width, p.height)
    };
    p.updatePixels = function() {
      if (p.imageData) drawing.$ensureContext().putImageData(p.imageData, 0, 0)
    };
    p.hint = function(which) {
      var curContext = drawing.$ensureContext();
      if (which === 4) {
        curContext.disable(curContext.DEPTH_TEST);
        curContext.depthMask(false);
        curContext.clear(curContext.DEPTH_BUFFER_BIT)
      } else if (which === -4) {
        curContext.enable(curContext.DEPTH_TEST);
        curContext.depthMask(true)
      } else if (which === -1 || which === 2) renderSmooth = true;
      else if (which === 1) renderSmooth = false
    };
    var backgroundHelper = function(arg1, arg2, arg3, arg4) {
      var obj;
      if (arg1 instanceof PImage || arg1.__isPImage) {
        obj = arg1;
        if (!obj.loaded) throw "Error using image in background(): PImage not loaded.";
        if (obj.width !== p.width || obj.height !== p.height) throw "Background image must be the same dimensions as the canvas.";
      } else obj = p.color(arg1, arg2, arg3, arg4);
      backgroundObj = obj
    };
    Drawing2D.prototype.background = function(arg1, arg2, arg3, arg4) {
      if (arg1 !== undef) backgroundHelper(arg1, arg2, arg3, arg4);
      if (backgroundObj instanceof PImage || backgroundObj.__isPImage) {
        saveContext();
        curContext.setTransform(1, 0, 0, 1, 0, 0);
        p.image(backgroundObj, 0, 0);
        restoreContext()
      } else {
        saveContext();
        curContext.setTransform(1, 0, 0, 1, 0, 0);
        if (p.alpha(backgroundObj) !== colorModeA) curContext.clearRect(0, 0, p.width, p.height);
        curContext.fillStyle = p.color.toString(backgroundObj);
        curContext.fillRect(0, 0, p.width, p.height);
        isFillDirty = true;
        restoreContext()
      }
    };
    Drawing3D.prototype.background = function(arg1, arg2, arg3, arg4) {
      if (arguments.length > 0) backgroundHelper(arg1, arg2, arg3, arg4);
      var c = p.color.toGLArray(backgroundObj);
      curContext.clearColor(c[0], c[1], c[2], c[3]);
      curContext.clear(curContext.COLOR_BUFFER_BIT | curContext.DEPTH_BUFFER_BIT)
    };
    Drawing2D.prototype.image = function(img, x, y, w, h) {
      x = Math.round(x);
      y = Math.round(y);
      if (img.width > 0) {
        var wid = w || img.width;
        var hgt = h || img.height;
        var bounds = imageModeConvert(x || 0, y || 0, w || img.width, h || img.height, arguments.length < 4);
        var fastImage = !!img.sourceImg && curTint === null;
        if (fastImage) {
          var htmlElement = img.sourceImg;
          if (img.__isDirty) img.updatePixels();
          curContext.drawImage(htmlElement, 0, 0, htmlElement.width, htmlElement.height, bounds.x, bounds.y, bounds.w, bounds.h)
        } else {
          var obj = img.toImageData();
          if (curTint !== null) {
            curTint(obj);
            img.__isDirty = true
          }
          curContext.drawImage(getCanvasData(obj).canvas, 0, 0, img.width, img.height, bounds.x, bounds.y, bounds.w, bounds.h)
        }
      }
    };
    Drawing3D.prototype.image = function(img, x, y, w, h) {
      if (img.width > 0) {
        x = Math.round(x);
        y = Math.round(y);
        w = w || img.width;
        h = h || img.height;
        p.beginShape(p.QUADS);
        p.texture(img);
        p.vertex(x, y, 0, 0, 0);
        p.vertex(x, y + h, 0, 0, h);
        p.vertex(x + w, y + h, 0, w, h);
        p.vertex(x + w, y, 0, w, 0);
        p.endShape()
      }
    };
    p.tint = function(a1, a2, a3, a4) {
      var tintColor = p.color(a1, a2, a3, a4);
      var r = p.red(tintColor) / colorModeX;
      var g = p.green(tintColor) / colorModeY;
      var b = p.blue(tintColor) / colorModeZ;
      var a = p.alpha(tintColor) / colorModeA;
      curTint = function(obj) {
        var data = obj.data,
          length = 4 * obj.width * obj.height;
        for (var i = 0; i < length;) {
          data[i++] *= r;
          data[i++] *= g;
          data[i++] *= b;
          data[i++] *= a
        }
      };
      curTint3d = function(data) {
        for (var i = 0; i < data.length;) {
          data[i++] = r;
          data[i++] = g;
          data[i++] = b;
          data[i++] = a
        }
      }
    };
    p.noTint = function() {
      curTint = null;
      curTint3d = null
    };
    p.copy = function(src, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (dh === undef) {
        dh = dw;
        dw = dy;
        dy = dx;
        dx = sh;
        sh = sw;
        sw = sy;
        sy = sx;
        sx = src;
        src = p
      }
      p.blend(src, sx, sy, sw, sh, dx, dy, dw, dh, 0)
    };
    p.blend = function(src, sx, sy, sw, sh, dx, dy, dw, dh, mode, pimgdest) {
      if (src.isRemote) throw "Image is loaded remotely. Cannot blend image.";
      if (mode === undef) {
        mode = dh;
        dh = dw;
        dw = dy;
        dy = dx;
        dx = sh;
        sh = sw;
        sw = sy;
        sy = sx;
        sx = src;
        src = p
      }
      var sx2 = sx + sw,
        sy2 = sy + sh,
        dx2 = dx + dw,
        dy2 = dy + dh,
        dest = pimgdest || p;
      if (pimgdest === undef || mode === undef) p.loadPixels();
      src.loadPixels();
      if (src === p && p.intersect(sx, sy, sx2, sy2, dx, dy, dx2, dy2)) p.blit_resize(p.get(sx, sy, sx2 - sx, sy2 - sy), 0, 0, sx2 - sx - 1, sy2 - sy - 1, dest.imageData.data, dest.width, dest.height, dx, dy, dx2, dy2, mode);
      else p.blit_resize(src, sx, sy, sx2, sy2, dest.imageData.data, dest.width, dest.height, dx, dy, dx2, dy2, mode);
      if (pimgdest === undef) p.updatePixels()
    };
    var buildBlurKernel = function(r) {
      var radius = p.floor(r * 3.5),
        i, radiusi;
      radius = radius < 1 ? 1 : radius < 248 ? radius : 248;
      if (p.shared.blurRadius !== radius) {
        p.shared.blurRadius = radius;
        p.shared.blurKernelSize = 1 + (p.shared.blurRadius << 1);
        p.shared.blurKernel = new Float32Array(p.shared.blurKernelSize);
        var sharedBlurKernal = p.shared.blurKernel;
        var sharedBlurKernelSize = p.shared.blurKernelSize;
        var sharedBlurRadius = p.shared.blurRadius;
        for (i = 0; i < sharedBlurKernelSize; i++) sharedBlurKernal[i] = 0;
        var radiusiSquared = (radius - 1) * (radius - 1);
        for (i = 1; i < radius; i++) sharedBlurKernal[radius + i] = sharedBlurKernal[radiusi] = radiusiSquared;
        sharedBlurKernal[radius] = radius * radius
      }
    };
    var blurARGB = function(r, aImg) {
      var sum, cr, cg, cb, ca, c, m;
      var read, ri, ym, ymi, bk0;
      var wh = aImg.pixels.getLength();
      var r2 = new Float32Array(wh);
      var g2 = new Float32Array(wh);
      var b2 = new Float32Array(wh);
      var a2 = new Float32Array(wh);
      var yi = 0;
      var x, y, i, offset;
      buildBlurKernel(r);
      var aImgHeight = aImg.height;
      var aImgWidth = aImg.width;
      var sharedBlurKernelSize = p.shared.blurKernelSize;
      var sharedBlurRadius = p.shared.blurRadius;
      var sharedBlurKernal = p.shared.blurKernel;
      var pix = aImg.imageData.data;
      for (y = 0; y < aImgHeight; y++) {
        for (x = 0; x < aImgWidth; x++) {
          cb = cg = cr = ca = sum = 0;
          read = x - sharedBlurRadius;
          if (read < 0) {
            bk0 = -read;
            read = 0
          } else {
            if (read >= aImgWidth) break;
            bk0 = 0
          }
          for (i = bk0; i < sharedBlurKernelSize; i++) {
            if (read >= aImgWidth) break;
            offset = (read + yi) * 4;
            m = sharedBlurKernal[i];
            ca += m * pix[offset + 3];
            cr += m * pix[offset];
            cg += m * pix[offset + 1];
            cb += m * pix[offset + 2];
            sum += m;
            read++
          }
          ri = yi + x;
          a2[ri] = ca / sum;
          r2[ri] = cr / sum;
          g2[ri] = cg / sum;
          b2[ri] = cb / sum
        }
        yi += aImgWidth
      }
      yi = 0;
      ym = -sharedBlurRadius;
      ymi = ym * aImgWidth;
      for (y = 0; y < aImgHeight; y++) {
        for (x = 0; x < aImgWidth; x++) {
          cb = cg = cr = ca = sum = 0;
          if (ym < 0) {
            bk0 = ri = -ym;
            read = x
          } else {
            if (ym >= aImgHeight) break;
            bk0 = 0;
            ri = ym;
            read = x + ymi
          }
          for (i = bk0; i < sharedBlurKernelSize; i++) {
            if (ri >= aImgHeight) break;
            m = sharedBlurKernal[i];
            ca += m * a2[read];
            cr += m * r2[read];
            cg += m * g2[read];
            cb += m * b2[read];
            sum += m;
            ri++;
            read += aImgWidth
          }
          offset = (x + yi) * 4;
          pix[offset] = cr / sum;
          pix[offset + 1] = cg / sum;
          pix[offset + 2] = cb / sum;
          pix[offset + 3] = ca / sum
        }
        yi += aImgWidth;
        ymi += aImgWidth;
        ym++
      }
    };
    var dilate = function(isInverted, aImg) {
      var currIdx = 0;
      var maxIdx = aImg.pixels.getLength();
      var out = new Int32Array(maxIdx);
      var currRowIdx, maxRowIdx, colOrig, colOut, currLum;
      var idxRight, idxLeft, idxUp, idxDown, colRight, colLeft, colUp, colDown, lumRight, lumLeft, lumUp, lumDown;
      if (!isInverted) while (currIdx < maxIdx) {
        currRowIdx = currIdx;
        maxRowIdx = currIdx + aImg.width;
        while (currIdx < maxRowIdx) {
          colOrig = colOut = aImg.pixels.getPixel(currIdx);
          idxLeft = currIdx - 1;
          idxRight = currIdx + 1;
          idxUp = currIdx - aImg.width;
          idxDown = currIdx + aImg.width;
          if (idxLeft < currRowIdx) idxLeft = currIdx;
          if (idxRight >= maxRowIdx) idxRight = currIdx;
          if (idxUp < 0) idxUp = 0;
          if (idxDown >= maxIdx) idxDown = currIdx;
          colUp = aImg.pixels.getPixel(idxUp);
          colLeft = aImg.pixels.getPixel(idxLeft);
          colDown = aImg.pixels.getPixel(idxDown);
          colRight = aImg.pixels.getPixel(idxRight);
          currLum = 77 * (colOrig >> 16 & 255) + 151 * (colOrig >> 8 & 255) + 28 * (colOrig & 255);
          lumLeft = 77 * (colLeft >> 16 & 255) + 151 * (colLeft >> 8 & 255) + 28 * (colLeft & 255);
          lumRight = 77 * (colRight >> 16 & 255) + 151 * (colRight >> 8 & 255) + 28 * (colRight & 255);
          lumUp = 77 * (colUp >> 16 & 255) + 151 * (colUp >> 8 & 255) + 28 * (colUp & 255);
          lumDown = 77 * (colDown >> 16 & 255) + 151 * (colDown >> 8 & 255) + 28 * (colDown & 255);
          if (lumLeft > currLum) {
            colOut = colLeft;
            currLum = lumLeft
          }
          if (lumRight > currLum) {
            colOut = colRight;
            currLum = lumRight
          }
          if (lumUp > currLum) {
            colOut = colUp;
            currLum = lumUp
          }
          if (lumDown > currLum) {
            colOut = colDown;
            currLum = lumDown
          }
          out[currIdx++] = colOut
        }
      } else while (currIdx < maxIdx) {
        currRowIdx = currIdx;
        maxRowIdx = currIdx + aImg.width;
        while (currIdx < maxRowIdx) {
          colOrig = colOut = aImg.pixels.getPixel(currIdx);
          idxLeft = currIdx - 1;
          idxRight = currIdx + 1;
          idxUp = currIdx - aImg.width;
          idxDown = currIdx + aImg.width;
          if (idxLeft < currRowIdx) idxLeft = currIdx;
          if (idxRight >= maxRowIdx) idxRight = currIdx;
          if (idxUp < 0) idxUp = 0;
          if (idxDown >= maxIdx) idxDown = currIdx;
          colUp = aImg.pixels.getPixel(idxUp);
          colLeft = aImg.pixels.getPixel(idxLeft);
          colDown = aImg.pixels.getPixel(idxDown);
          colRight = aImg.pixels.getPixel(idxRight);
          currLum = 77 * (colOrig >> 16 & 255) + 151 * (colOrig >> 8 & 255) + 28 * (colOrig & 255);
          lumLeft = 77 * (colLeft >> 16 & 255) + 151 * (colLeft >> 8 & 255) + 28 * (colLeft & 255);
          lumRight = 77 * (colRight >> 16 & 255) + 151 * (colRight >> 8 & 255) + 28 * (colRight & 255);
          lumUp = 77 * (colUp >> 16 & 255) + 151 * (colUp >> 8 & 255) + 28 * (colUp & 255);
          lumDown = 77 * (colDown >> 16 & 255) + 151 * (colDown >> 8 & 255) + 28 * (colDown & 255);
          if (lumLeft < currLum) {
            colOut = colLeft;
            currLum = lumLeft
          }
          if (lumRight < currLum) {
            colOut = colRight;
            currLum = lumRight
          }
          if (lumUp < currLum) {
            colOut = colUp;
            currLum = lumUp
          }
          if (lumDown < currLum) {
            colOut = colDown;
            currLum = lumDown
          }
          out[currIdx++] = colOut
        }
      }
      aImg.pixels.set(out)
    };
    p.filter = function(kind, param, aImg) {
      var img, col, lum, i;
      if (arguments.length === 3) {
        aImg.loadPixels();
        img = aImg
      } else {
        p.loadPixels();
        img = p
      }
      if (param === undef) param = null;
      if (img.isRemote) throw "Image is loaded remotely. Cannot filter image.";
      var imglen = img.pixels.getLength();
      switch (kind) {
      case 11:
        var radius = param || 1;
        blurARGB(radius, img);
        break;
      case 12:
        if (img.format === 4) {
          for (i = 0; i < imglen; i++) {
            col = 255 - img.pixels.getPixel(i);
            img.pixels.setPixel(i, 4278190080 | col << 16 | col << 8 | col)
          }
          img.format = 1
        } else for (i = 0; i < imglen; i++) {
          col = img.pixels.getPixel(i);
          lum = 77 * (col >> 16 & 255) + 151 * (col >> 8 & 255) + 28 * (col & 255) >> 8;
          img.pixels.setPixel(i, col & 4278190080 | lum << 16 | lum << 8 | lum)
        }
        break;
      case 13:
        for (i = 0; i < imglen; i++) img.pixels.setPixel(i, img.pixels.getPixel(i) ^ 16777215);
        break;
      case 15:
        if (param === null) throw "Use filter(POSTERIZE, int levels) instead of filter(POSTERIZE)";
        var levels = p.floor(param);
        if (levels < 2 || levels > 255) throw "Levels must be between 2 and 255 for filter(POSTERIZE, levels)";
        var levels1 = levels - 1;
        for (i = 0; i < imglen; i++) {
          var rlevel = img.pixels.getPixel(i) >> 16 & 255;
          var glevel = img.pixels.getPixel(i) >> 8 & 255;
          var blevel = img.pixels.getPixel(i) & 255;
          rlevel = (rlevel * levels >> 8) * 255 / levels1;
          glevel = (glevel * levels >> 8) * 255 / levels1;
          blevel = (blevel * levels >> 8) * 255 / levels1;
          img.pixels.setPixel(i, 4278190080 & img.pixels.getPixel(i) | rlevel << 16 | glevel << 8 | blevel)
        }
        break;
      case 14:
        for (i = 0; i < imglen; i++) img.pixels.setPixel(i, img.pixels.getPixel(i) | 4278190080);
        img.format = 1;
        break;
      case 16:
        if (param === null) param = 0.5;
        if (param < 0 || param > 1) throw "Level must be between 0 and 1 for filter(THRESHOLD, level)";
        var thresh = p.floor(param * 255);
        for (i = 0; i < imglen; i++) {
          var max = p.max((img.pixels.getPixel(i) & 16711680) >> 16, p.max((img.pixels.getPixel(i) & 65280) >> 8, img.pixels.getPixel(i) & 255));
          img.pixels.setPixel(i, img.pixels.getPixel(i) & 4278190080 | (max < thresh ? 0 : 16777215))
        }
        break;
      case 17:
        dilate(true, img);
        break;
      case 18:
        dilate(false, img);
        break
      }
      img.updatePixels()
    };
    p.shared = {
      fracU: 0,
      ifU: 0,
      fracV: 0,
      ifV: 0,
      u1: 0,
      u2: 0,
      v1: 0,
      v2: 0,
      sX: 0,
      sY: 0,
      iw: 0,
      iw1: 0,
      ih1: 0,
      ul: 0,
      ll: 0,
      ur: 0,
      lr: 0,
      cUL: 0,
      cLL: 0,
      cUR: 0,
      cLR: 0,
      srcXOffset: 0,
      srcYOffset: 0,
      r: 0,
      g: 0,
      b: 0,
      a: 0,
      srcBuffer: null,
      blurRadius: 0,
      blurKernelSize: 0,
      blurKernel: null
    };
    p.intersect = function(sx1, sy1, sx2, sy2, dx1, dy1, dx2, dy2) {
      var sw = sx2 - sx1 + 1;
      var sh = sy2 - sy1 + 1;
      var dw = dx2 - dx1 + 1;
      var dh = dy2 - dy1 + 1;
      if (dx1 < sx1) {
        dw += dx1 - sx1;
        if (dw > sw) dw = sw
      } else {
        var w = sw + sx1 - dx1;
        if (dw > w) dw = w
      }
      if (dy1 < sy1) {
        dh += dy1 - sy1;
        if (dh > sh) dh = sh
      } else {
        var h = sh + sy1 - dy1;
        if (dh > h) dh = h
      }
      return ! (dw <= 0 || dh <= 0)
    };
    var blendFuncs = {};
    blendFuncs[1] = p.modes.blend;
    blendFuncs[2] = p.modes.add;
    blendFuncs[4] = p.modes.subtract;
    blendFuncs[8] = p.modes.lightest;
    blendFuncs[16] = p.modes.darkest;
    blendFuncs[0] = p.modes.replace;
    blendFuncs[32] = p.modes.difference;
    blendFuncs[64] = p.modes.exclusion;
    blendFuncs[128] = p.modes.multiply;
    blendFuncs[256] = p.modes.screen;
    blendFuncs[512] = p.modes.overlay;
    blendFuncs[1024] = p.modes.hard_light;
    blendFuncs[2048] = p.modes.soft_light;
    blendFuncs[4096] = p.modes.dodge;
    blendFuncs[8192] = p.modes.burn;
    p.blit_resize = function(img, srcX1, srcY1, srcX2, srcY2, destPixels, screenW, screenH, destX1, destY1, destX2, destY2, mode) {
      var x, y;
      if (srcX1 < 0) srcX1 = 0;
      if (srcY1 < 0) srcY1 = 0;
      if (srcX2 >= img.width) srcX2 = img.width - 1;
      if (srcY2 >= img.height) srcY2 = img.height - 1;
      var srcW = srcX2 - srcX1;
      var srcH = srcY2 - srcY1;
      var destW = destX2 - destX1;
      var destH = destY2 - destY1;
      if (destW <= 0 || destH <= 0 || srcW <= 0 || srcH <= 0 || destX1 >= screenW || destY1 >= screenH || srcX1 >= img.width || srcY1 >= img.height) return;
      var dx = Math.floor(srcW / destW * 32768);
      var dy = Math.floor(srcH / destH * 32768);
      var pshared = p.shared;
      pshared.srcXOffset = Math.floor(destX1 < 0 ? -destX1 * dx : srcX1 * 32768);
      pshared.srcYOffset = Math.floor(destY1 < 0 ? -destY1 * dy : srcY1 * 32768);
      if (destX1 < 0) {
        destW += destX1;
        destX1 = 0
      }
      if (destY1 < 0) {
        destH += destY1;
        destY1 = 0
      }
      destW = Math.min(destW, screenW - destX1);
      destH = Math.min(destH, screenH - destY1);
      var destOffset = destY1 * screenW + destX1;
      var destColor;
      pshared.srcBuffer = img.imageData.data;
      pshared.iw = img.width;
      pshared.iw1 = img.width - 1;
      pshared.ih1 = img.height - 1;
      var filterBilinear = p.filter_bilinear,
        filterNewScanline = p.filter_new_scanline,
        blendFunc = blendFuncs[mode],
        blendedColor, idx, cULoffset, cURoffset, cLLoffset, cLRoffset, ALPHA_MASK = 4278190080,
        RED_MASK = 16711680,
        GREEN_MASK = 65280,
        BLUE_MASK = 255,
        PREC_MAXVAL = 32767,
        PRECISIONB = 15,
        PREC_RED_SHIFT = 1,
        PREC_ALPHA_SHIFT = 9,
        srcBuffer = pshared.srcBuffer,
        min = Math.min;
      for (y = 0; y < destH; y++) {
        pshared.sX = pshared.srcXOffset;
        pshared.fracV = pshared.srcYOffset & PREC_MAXVAL;
        pshared.ifV = PREC_MAXVAL - pshared.fracV;
        pshared.v1 = (pshared.srcYOffset >> PRECISIONB) * pshared.iw;
        pshared.v2 = min((pshared.srcYOffset >> PRECISIONB) + 1, pshared.ih1) * pshared.iw;
        for (x = 0; x < destW; x++) {
          idx = (destOffset + x) * 4;
          destColor = destPixels[idx + 3] << 24 & ALPHA_MASK | destPixels[idx] << 16 & RED_MASK | destPixels[idx + 1] << 8 & GREEN_MASK | destPixels[idx + 2] & BLUE_MASK;
          pshared.fracU = pshared.sX & PREC_MAXVAL;
          pshared.ifU = PREC_MAXVAL - pshared.fracU;
          pshared.ul = pshared.ifU * pshared.ifV >> PRECISIONB;
          pshared.ll = pshared.ifU * pshared.fracV >> PRECISIONB;
          pshared.ur = pshared.fracU * pshared.ifV >> PRECISIONB;
          pshared.lr = pshared.fracU * pshared.fracV >> PRECISIONB;
          pshared.u1 = pshared.sX >> PRECISIONB;
          pshared.u2 = min(pshared.u1 + 1, pshared.iw1);
          cULoffset = (pshared.v1 + pshared.u1) * 4;
          cURoffset = (pshared.v1 + pshared.u2) * 4;
          cLLoffset = (pshared.v2 + pshared.u1) * 4;
          cLRoffset = (pshared.v2 + pshared.u2) * 4;
          pshared.cUL = srcBuffer[cULoffset + 3] << 24 & ALPHA_MASK | srcBuffer[cULoffset] << 16 & RED_MASK | srcBuffer[cULoffset + 1] << 8 & GREEN_MASK | srcBuffer[cULoffset + 2] & BLUE_MASK;
          pshared.cUR = srcBuffer[cURoffset + 3] << 24 & ALPHA_MASK | srcBuffer[cURoffset] << 16 & RED_MASK | srcBuffer[cURoffset + 1] << 8 & GREEN_MASK | srcBuffer[cURoffset + 2] & BLUE_MASK;
          pshared.cLL = srcBuffer[cLLoffset + 3] << 24 & ALPHA_MASK | srcBuffer[cLLoffset] << 16 & RED_MASK | srcBuffer[cLLoffset + 1] << 8 & GREEN_MASK | srcBuffer[cLLoffset + 2] & BLUE_MASK;
          pshared.cLR = srcBuffer[cLRoffset + 3] << 24 & ALPHA_MASK | srcBuffer[cLRoffset] << 16 & RED_MASK | srcBuffer[cLRoffset + 1] << 8 & GREEN_MASK | srcBuffer[cLRoffset + 2] & BLUE_MASK;
          pshared.r = pshared.ul * ((pshared.cUL & RED_MASK) >> 16) + pshared.ll * ((pshared.cLL & RED_MASK) >> 16) + pshared.ur * ((pshared.cUR & RED_MASK) >> 16) + pshared.lr * ((pshared.cLR & RED_MASK) >> 16) << PREC_RED_SHIFT & RED_MASK;
          pshared.g = pshared.ul * (pshared.cUL & GREEN_MASK) + pshared.ll * (pshared.cLL & GREEN_MASK) + pshared.ur * (pshared.cUR & GREEN_MASK) + pshared.lr * (pshared.cLR & GREEN_MASK) >>> PRECISIONB & GREEN_MASK;
          pshared.b = pshared.ul * (pshared.cUL & BLUE_MASK) + pshared.ll * (pshared.cLL & BLUE_MASK) + pshared.ur * (pshared.cUR & BLUE_MASK) + pshared.lr * (pshared.cLR & BLUE_MASK) >>> PRECISIONB;
          pshared.a = pshared.ul * ((pshared.cUL & ALPHA_MASK) >>> 24) + pshared.ll * ((pshared.cLL & ALPHA_MASK) >>> 24) + pshared.ur * ((pshared.cUR & ALPHA_MASK) >>> 24) + pshared.lr * ((pshared.cLR & ALPHA_MASK) >>> 24) << PREC_ALPHA_SHIFT & ALPHA_MASK;
          blendedColor = blendFunc(destColor, pshared.a | pshared.r | pshared.g | pshared.b);
          destPixels[idx] = (blendedColor & RED_MASK) >>> 16;
          destPixels[idx + 1] = (blendedColor & GREEN_MASK) >>> 8;
          destPixels[idx + 2] = blendedColor & BLUE_MASK;
          destPixels[idx + 3] = (blendedColor & ALPHA_MASK) >>> 24;
          pshared.sX += dx
        }
        destOffset += screenW;
        pshared.srcYOffset += dy
      }
    };
    p.loadFont = function(name, size) {
      if (name === undef) throw "font name required in loadFont.";
      if (name.indexOf(".svg") === -1) {
        if (size === undef) size = curTextFont.size;
        return PFont.get(name, size)
      }
      var font = p.loadGlyphs(name);
      return {
        name: name,
        css: "12px sans-serif",
        glyph: true,
        units_per_em: font.units_per_em,
        horiz_adv_x: 1 / font.units_per_em * font.horiz_adv_x,
        ascent: font.ascent,
        descent: font.descent,
        width: function(str) {
          var width = 0;
          var len = str.length;
          for (var i = 0; i < len; i++) try {
            width += parseFloat(p.glyphLook(p.glyphTable[name], str[i]).horiz_adv_x)
          } catch(e) {
            Processing.debug(e)
          }
          return width / p.glyphTable[name].units_per_em
        }
      }
    };
    p.createFont = function(name, size) {
      return p.loadFont(name, size)
    };
    p.textFont = function(pfont, size) {
      if (size !== undef) {
        if (!pfont.glyph) pfont = PFont.get(pfont.name, size);
        curTextSize = size
      }
      curTextFont = pfont;
      curFontName = curTextFont.name;
      curTextAscent = curTextFont.ascent;
      curTextDescent = curTextFont.descent;
      curTextLeading = curTextFont.leading;
      var curContext = drawing.$ensureContext();
      curContext.font = curTextFont.css
    };
    p.textSize = function(size) {
      curTextFont = PFont.get(curFontName, size);
      curTextSize = size;
      curTextAscent = curTextFont.ascent;
      curTextDescent = curTextFont.descent;
      curTextLeading = curTextFont.leading;
      var curContext = drawing.$ensureContext();
      curContext.font = curTextFont.css
    };
    p.textAscent = function() {
      return curTextAscent
    };
    p.textDescent = function() {
      return curTextDescent
    };
    p.textLeading = function(leading) {
      curTextLeading = leading
    };
    p.textAlign = function(xalign, yalign) {
      horizontalTextAlignment = xalign;
      verticalTextAlignment = yalign || 0
    };

    function toP5String(obj) {
      if (obj instanceof String) return obj;
      if (typeof obj === "number") {
        if (obj === (0 | obj)) return obj.toString();
        return p.nf(obj, 0, 3)
      }
      if (obj === null || obj === undef) return "";
      return obj.toString()
    }
    Drawing2D.prototype.textWidth = function(str) {
      var lines = toP5String(str).split(/\r?\n/g),
        width = 0;
      var i, linesCount = lines.length;
      curContext.font = curTextFont.css;
      for (i = 0; i < linesCount; ++i) width = Math.max(width, curTextFont.measureTextWidth(lines[i]));
      return width | 0
    };
    Drawing3D.prototype.textWidth = function(str) {
      var lines = toP5String(str).split(/\r?\n/g),
        width = 0;
      var i, linesCount = lines.length;
      if (textcanvas === undef) textcanvas = document.createElement("canvas");
      var textContext = textcanvas.getContext("2d");
      textContext.font = curTextFont.css;
      for (i = 0; i < linesCount; ++i) width = Math.max(width, textContext.measureText(lines[i]).width);
      return width | 0
    };
    p.glyphLook = function(font, chr) {
      try {
        switch (chr) {
        case "1":
          return font.one;
        case "2":
          return font.two;
        case "3":
          return font.three;
        case "4":
          return font.four;
        case "5":
          return font.five;
        case "6":
          return font.six;
        case "7":
          return font.seven;
        case "8":
          return font.eight;
        case "9":
          return font.nine;
        case "0":
          return font.zero;
        case " ":
          return font.space;
        case "$":
          return font.dollar;
        case "!":
          return font.exclam;
        case '"':
          return font.quotedbl;
        case "#":
          return font.numbersign;
        case "%":
          return font.percent;
        case "&":
          return font.ampersand;
        case "'":
          return font.quotesingle;
        case "(":
          return font.parenleft;
        case ")":
          return font.parenright;
        case "*":
          return font.asterisk;
        case "+":
          return font.plus;
        case ",":
          return font.comma;
        case "-":
          return font.hyphen;
        case ".":
          return font.period;
        case "/":
          return font.slash;
        case "_":
          return font.underscore;
        case ":":
          return font.colon;
        case ";":
          return font.semicolon;
        case "<":
          return font.less;
        case "=":
          return font.equal;
        case ">":
          return font.greater;
        case "?":
          return font.question;
        case "@":
          return font.at;
        case "[":
          return font.bracketleft;
        case "\\":
          return font.backslash;
        case "]":
          return font.bracketright;
        case "^":
          return font.asciicircum;
        case "`":
          return font.grave;
        case "{":
          return font.braceleft;
        case "|":
          return font.bar;
        case "}":
          return font.braceright;
        case "~":
          return font.asciitilde;
        default:
          return font[chr]
        }
      } catch(e) {
        Processing.debug(e)
      }
    };
    Drawing2D.prototype.text$line = function(str, x, y, z, align) {
      var textWidth = 0,
        xOffset = 0;
      if (!curTextFont.glyph) {
        if (str && "fillText" in curContext) {
          if (isFillDirty) {
            curContext.fillStyle = p.color.toString(currentFillColor);
            isFillDirty = false
          }
          if (align === 39 || align === 3) {
            textWidth = curTextFont.measureTextWidth(str);
            if (align === 39) xOffset = -textWidth;
            else xOffset = -textWidth / 2
          }
          curContext.fillText(str, x + xOffset, y)
        }
      } else {
        var font = p.glyphTable[curFontName];
        saveContext();
        curContext.translate(x, y + curTextSize);
        if (align === 39 || align === 3) {
          textWidth = font.width(str);
          if (align === 39) xOffset = -textWidth;
          else xOffset = -textWidth / 2
        }
        var upem = font.units_per_em,
          newScale = 1 / upem * curTextSize;
        curContext.scale(newScale, newScale);
        for (var i = 0, len = str.length; i < len; i++) try {
          p.glyphLook(font, str[i]).draw()
        } catch(e) {
          Processing.debug(e)
        }
        restoreContext()
      }
    };
    Drawing3D.prototype.text$line = function(str, x, y, z, align) {
      if (textcanvas === undef) textcanvas = document.createElement("canvas");
      var oldContext = curContext;
      curContext = textcanvas.getContext("2d");
      curContext.font = curTextFont.css;
      var textWidth = curTextFont.measureTextWidth(str);
      textcanvas.width = textWidth;
      textcanvas.height = curTextSize;
      curContext = textcanvas.getContext("2d");
      curContext.font = curTextFont.css;
      curContext.textBaseline = "top";
      Drawing2D.prototype.text$line(str, 0, 0, 0, 37);
      var aspect = textcanvas.width / textcanvas.height;
      curContext = oldContext;
      curContext.bindTexture(curContext.TEXTURE_2D, textTex);
      curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, textcanvas);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_T, curContext.CLAMP_TO_EDGE);
      curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_S, curContext.CLAMP_TO_EDGE);
      var xOffset = 0;
      if (align === 39) xOffset = -textWidth;
      else if (align === 3) xOffset = -textWidth / 2;
      var model = new PMatrix3D;
      var scalefactor = curTextSize * 0.5;
      model.translate(x + xOffset - scalefactor / 2, y - scalefactor, z);
      model.scale(-aspect * scalefactor, -scalefactor, scalefactor);
      model.translate(-1, -1, -1);
      model.transpose();
      var view = new PMatrix3D;
      view.scale(1, -1, 1);
      view.apply(modelView.array());
      view.transpose();
      curContext.useProgram(programObject2D);
      vertexAttribPointer("aVertex2d", programObject2D, "aVertex", 3, textBuffer);
      vertexAttribPointer("aTextureCoord2d", programObject2D, "aTextureCoord", 2, textureBuffer);
      uniformi("uSampler2d", programObject2D, "uSampler", [0]);
      uniformi("uIsDrawingText2d", programObject2D, "uIsDrawingText", true);
      uniformMatrix("uModel2d", programObject2D, "uModel", false, model.array());
      uniformMatrix("uView2d", programObject2D, "uView", false, view.array());
      uniformf("uColor2d", programObject2D, "uColor", fillStyle);
      curContext.bindBuffer(curContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
      curContext.drawElements(curContext.TRIANGLES, 6, curContext.UNSIGNED_SHORT, 0)
    };

    function text$4(str, x, y, z) {
      var lines, linesCount;
      if (str.indexOf("\n") < 0) {
        lines = [str];
        linesCount = 1
      } else {
        lines = str.split(/\r?\n/g);
        linesCount = lines.length
      }
      var yOffset = 0;
      if (verticalTextAlignment === 101) yOffset = curTextAscent + curTextDescent;
      else if (verticalTextAlignment === 3) yOffset = curTextAscent / 2 - (linesCount - 1) * curTextLeading / 2;
      else if (verticalTextAlignment === 102) yOffset = -(curTextDescent + (linesCount - 1) * curTextLeading);
      for (var i = 0; i < linesCount; ++i) {
        var line = lines[i];
        drawing.text$line(line, x, y + yOffset, z, horizontalTextAlignment);
        yOffset += curTextLeading
      }
    }
    function text$6(str, x, y, width, height, z) {
      if (str.length === 0 || width === 0 || height === 0) return;
      if (curTextSize > height) return;
      var spaceMark = -1;
      var start = 0;
      var lineWidth = 0;
      var drawCommands = [];
      for (var charPos = 0, len = str.length; charPos < len; charPos++) {
        var currentChar = str[charPos];
        var spaceChar = currentChar === " ";
        var letterWidth = curTextFont.measureTextWidth(currentChar);
        if (currentChar !== "\n" && lineWidth + letterWidth <= width) {
          if (spaceChar) spaceMark = charPos;
          lineWidth += letterWidth
        } else {
          if (spaceMark + 1 === start) if (charPos > 0) spaceMark = charPos;
          else return;
          if (currentChar === "\n") {
            drawCommands.push({
              text: str.substring(start, charPos),
              width: lineWidth
            });
            start = charPos + 1
          } else {
            drawCommands.push({
              text: str.substring(start, spaceMark + 1),
              width: lineWidth
            });
            start = spaceMark + 1
          }
          lineWidth = 0;
          charPos = start - 1
        }
      }
      if (start < len) drawCommands.push({
        text: str.substring(start),
        width: lineWidth
      });
      var xOffset = 1,
        yOffset = curTextAscent;
      if (horizontalTextAlignment === 3) xOffset = width / 2;
      else if (horizontalTextAlignment === 39) xOffset = width;
      var linesCount = drawCommands.length,
        visibleLines = Math.min(linesCount, Math.floor(height / curTextLeading));
      if (verticalTextAlignment === 101) yOffset = curTextAscent + curTextDescent;
      else if (verticalTextAlignment === 3) yOffset = height / 2 - curTextLeading * (visibleLines / 2 - 1);
      else if (verticalTextAlignment === 102) yOffset = curTextDescent + curTextLeading;
      var command, drawCommand, leading;
      for (command = 0; command < linesCount; command++) {
        leading = command * curTextLeading;
        if (yOffset + leading > height - curTextDescent) break;
        drawCommand = drawCommands[command];
        drawing.text$line(drawCommand.text, x + xOffset, y + yOffset + leading, z, horizontalTextAlignment)
      }
    }
    p.text = function() {
      if (textMode === 5) return;
      if (arguments.length === 3) text$4(toP5String(arguments[0]), arguments[1], arguments[2], 0);
      else if (arguments.length === 4) text$4(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3]);
      else if (arguments.length === 5) text$6(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3], arguments[4], 0);
      else if (arguments.length === 6) text$6(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
    };
    p.textMode = function(mode) {
      textMode = mode
    };
    p.loadGlyphs = function(url) {
      var x, y, cx, cy, nx, ny, d, a, lastCom, lenC, horiz_adv_x, getXY = "[0-9\\-]+",
        path;
      var regex = function(needle, hay) {
        var i = 0,
          results = [],
          latest, regexp = new RegExp(needle, "g");
        latest = results[i] = regexp.exec(hay);
        while (latest) {
          i++;
          latest = results[i] = regexp.exec(hay)
        }
        return results
      };
      var buildPath = function(d) {
        var c = regex("[A-Za-z][0-9\\- ]+|Z", d);
        var beforePathDraw = function() {
          saveContext();
          return drawing.$ensureContext()
        };
        var afterPathDraw = function() {
          executeContextFill();
          executeContextStroke();
          restoreContext()
        };
        path = "return {draw:function(){var curContext=beforePathDraw();curContext.beginPath();";
        x = 0;
        y = 0;
        cx = 0;
        cy = 0;
        nx = 0;
        ny = 0;
        d = 0;
        a = 0;
        lastCom = "";
        lenC = c.length - 1;
        for (var j = 0; j < lenC; j++) {
          var com = c[j][0],
            xy = regex(getXY, com);
          switch (com[0]) {
          case "M":
            x = parseFloat(xy[0][0]);
            y = parseFloat(xy[1][0]);
            path += "curContext.moveTo(" + x + "," + -y + ");";
            break;
          case "L":
            x = parseFloat(xy[0][0]);
            y = parseFloat(xy[1][0]);
            path += "curContext.lineTo(" + x + "," + -y + ");";
            break;
          case "H":
            x = parseFloat(xy[0][0]);
            path += "curContext.lineTo(" + x + "," + -y + ");";
            break;
          case "V":
            y = parseFloat(xy[0][0]);
            path += "curContext.lineTo(" + x + "," + -y + ");";
            break;
          case "T":
            nx = parseFloat(xy[0][0]);
            ny = parseFloat(xy[1][0]);
            if (lastCom === "Q" || lastCom === "T") {
              d = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(cy - y, 2));
              a = Math.PI + Math.atan2(cx - x, cy - y);
              cx = x + Math.sin(a) * d;
              cy = y + Math.cos(a) * d
            } else {
              cx = x;
              cy = y
            }
            path += "curContext.quadraticCurveTo(" + cx + "," + -cy + "," + nx + "," + -ny + ");";
            x = nx;
            y = ny;
            break;
          case "Q":
            cx = parseFloat(xy[0][0]);
            cy = parseFloat(xy[1][0]);
            nx = parseFloat(xy[2][0]);
            ny = parseFloat(xy[3][0]);
            path += "curContext.quadraticCurveTo(" + cx + "," + -cy + "," + nx + "," + -ny + ");";
            x = nx;
            y = ny;
            break;
          case "Z":
            path += "curContext.closePath();";
            break
          }
          lastCom = com[0]
        }
        path += "afterPathDraw();";
        path += "curContext.translate(" + horiz_adv_x + ",0);";
        path += "}}";
        return (new Function("beforePathDraw", "afterPathDraw", path))(beforePathDraw, afterPathDraw)
      };
      var parseSVGFont = function(svg) {
        var font = svg.getElementsByTagName("font");
        p.glyphTable[url].horiz_adv_x = font[0].getAttribute("horiz-adv-x");
        var font_face = svg.getElementsByTagName("font-face")[0];
        p.glyphTable[url].units_per_em = parseFloat(font_face.getAttribute("units-per-em"));
        p.glyphTable[url].ascent = parseFloat(font_face.getAttribute("ascent"));
        p.glyphTable[url].descent = parseFloat(font_face.getAttribute("descent"));
        var glyph = svg.getElementsByTagName("glyph"),
          len = glyph.length;
        for (var i = 0; i < len; i++) {
          var unicode = glyph[i].getAttribute("unicode");
          var name = glyph[i].getAttribute("glyph-name");
          horiz_adv_x = glyph[i].getAttribute("horiz-adv-x");
          if (horiz_adv_x === null) horiz_adv_x = p.glyphTable[url].horiz_adv_x;
          d = glyph[i].getAttribute("d");
          if (d !== undef) {
            path = buildPath(d);
            p.glyphTable[url][name] = {
              name: name,
              unicode: unicode,
              horiz_adv_x: horiz_adv_x,
              draw: path.draw
            }
          }
        }
      };
      var loadXML = function() {
        var xmlDoc;
        try {
          xmlDoc = document.implementation.createDocument("", "", null)
        } catch(e_fx_op) {
          Processing.debug(e_fx_op.message);
          return
        }
        try {
          xmlDoc.async = false;
          xmlDoc.load(url);
          parseSVGFont(xmlDoc.getElementsByTagName("svg")[0])
        } catch(e_sf_ch) {
          Processing.debug(e_sf_ch);
          try {
            var xmlhttp = new window.XMLHttpRequest;
            xmlhttp.open("GET", url, false);
            xmlhttp.send(null);
            parseSVGFont(xmlhttp.responseXML.documentElement)
          } catch(e) {
            Processing.debug(e_sf_ch)
          }
        }
      };
      p.glyphTable[url] = {};
      loadXML(url);
      return p.glyphTable[url]
    };
    p.param = function(name) {
      var attributeName = "data-processing-" + name;
      if (curElement.hasAttribute(attributeName)) return curElement.getAttribute(attributeName);
      for (var i = 0, len = curElement.childNodes.length; i < len; ++i) {
        var item = curElement.childNodes.item(i);
        if (item.nodeType !== 1 || item.tagName.toLowerCase() !== "param") continue;
        if (item.getAttribute("name") === name) return item.getAttribute("value")
      }
      if (curSketch.params.hasOwnProperty(name)) return curSketch.params[name];
      return null
    };

    function wireDimensionalFunctions(mode) {
      if (mode === "3D") drawing = new Drawing3D;
      else if (mode === "2D") drawing = new Drawing2D;
      else drawing = new DrawingPre;
      for (var i in DrawingPre.prototype) if (DrawingPre.prototype.hasOwnProperty(i) && i.indexOf("$") < 0) p[i] = drawing[i];
      drawing.$init()
    }
    function createDrawingPreFunction(name) {
      return function() {
        wireDimensionalFunctions("2D");
        return drawing[name].apply(this, arguments)
      }
    }
    DrawingPre.prototype.translate = createDrawingPreFunction("translate");
    DrawingPre.prototype.transform = createDrawingPreFunction("transform");
    DrawingPre.prototype.scale = createDrawingPreFunction("scale");
    DrawingPre.prototype.pushMatrix = createDrawingPreFunction("pushMatrix");
    DrawingPre.prototype.popMatrix = createDrawingPreFunction("popMatrix");
    DrawingPre.prototype.resetMatrix = createDrawingPreFunction("resetMatrix");
    DrawingPre.prototype.applyMatrix = createDrawingPreFunction("applyMatrix");
    DrawingPre.prototype.rotate = createDrawingPreFunction("rotate");
    DrawingPre.prototype.rotateZ = createDrawingPreFunction("rotateZ");
    DrawingPre.prototype.shearX = createDrawingPreFunction("shearX");
    DrawingPre.prototype.shearY = createDrawingPreFunction("shearY");
    DrawingPre.prototype.redraw = createDrawingPreFunction("redraw");
    DrawingPre.prototype.toImageData = createDrawingPreFunction("toImageData");
    DrawingPre.prototype.ambientLight = createDrawingPreFunction("ambientLight");
    DrawingPre.prototype.directionalLight = createDrawingPreFunction("directionalLight");
    DrawingPre.prototype.lightFalloff = createDrawingPreFunction("lightFalloff");
    DrawingPre.prototype.lightSpecular = createDrawingPreFunction("lightSpecular");
    DrawingPre.prototype.pointLight = createDrawingPreFunction("pointLight");
    DrawingPre.prototype.noLights = createDrawingPreFunction("noLights");
    DrawingPre.prototype.spotLight = createDrawingPreFunction("spotLight");
    DrawingPre.prototype.beginCamera = createDrawingPreFunction("beginCamera");
    DrawingPre.prototype.endCamera = createDrawingPreFunction("endCamera");
    DrawingPre.prototype.frustum = createDrawingPreFunction("frustum");
    DrawingPre.prototype.box = createDrawingPreFunction("box");
    DrawingPre.prototype.sphere = createDrawingPreFunction("sphere");
    DrawingPre.prototype.ambient = createDrawingPreFunction("ambient");
    DrawingPre.prototype.emissive = createDrawingPreFunction("emissive");
    DrawingPre.prototype.shininess = createDrawingPreFunction("shininess");
    DrawingPre.prototype.specular = createDrawingPreFunction("specular");
    DrawingPre.prototype.fill = createDrawingPreFunction("fill");
    DrawingPre.prototype.stroke = createDrawingPreFunction("stroke");
    DrawingPre.prototype.strokeWeight = createDrawingPreFunction("strokeWeight");
    DrawingPre.prototype.smooth = createDrawingPreFunction("smooth");
    DrawingPre.prototype.noSmooth = createDrawingPreFunction("noSmooth");
    DrawingPre.prototype.point = createDrawingPreFunction("point");
    DrawingPre.prototype.vertex = createDrawingPreFunction("vertex");
    DrawingPre.prototype.endShape = createDrawingPreFunction("endShape");
    DrawingPre.prototype.bezierVertex = createDrawingPreFunction("bezierVertex");
    DrawingPre.prototype.curveVertex = createDrawingPreFunction("curveVertex");
    DrawingPre.prototype.curve = createDrawingPreFunction("curve");
    DrawingPre.prototype.line = createDrawingPreFunction("line");
    DrawingPre.prototype.bezier = createDrawingPreFunction("bezier");
    DrawingPre.prototype.rect = createDrawingPreFunction("rect");
    DrawingPre.prototype.ellipse = createDrawingPreFunction("ellipse");
    DrawingPre.prototype.background = createDrawingPreFunction("background");
    DrawingPre.prototype.image = createDrawingPreFunction("image");
    DrawingPre.prototype.textWidth = createDrawingPreFunction("textWidth");
    DrawingPre.prototype.text$line = createDrawingPreFunction("text$line");
    DrawingPre.prototype.$ensureContext = createDrawingPreFunction("$ensureContext");
    DrawingPre.prototype.$newPMatrix = createDrawingPreFunction("$newPMatrix");
    DrawingPre.prototype.size = function(aWidth, aHeight, aMode) {
      wireDimensionalFunctions(aMode === 2 ? "3D" : "2D");
      p.size(aWidth, aHeight, aMode)
    };
    DrawingPre.prototype.$init = nop;
    Drawing2D.prototype.$init = function() {
      p.size(p.width, p.height);
      curContext.lineCap = "round";
      p.noSmooth();
      p.disableContextMenu()
    };
    Drawing3D.prototype.$init = function() {
      p.use3DContext = true;
      p.disableContextMenu()
    };
    DrawingShared.prototype.$ensureContext = function() {
      return curContext
    };

    function calculateOffset(curElement, event) {
      var element = curElement,
        offsetX = 0,
        offsetY = 0;
      p.pmouseX = p.mouseX;
      p.pmouseY = p.mouseY;
      if (element.offsetParent) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop
        } while ( !! (element = element.offsetParent))
      }
      element = curElement;
      do {
        offsetX -= element.scrollLeft || 0;
        offsetY -= element.scrollTop || 0
      } while ( !! (element = element.parentNode));
      offsetX += stylePaddingLeft;
      offsetY += stylePaddingTop;
      offsetX += styleBorderLeft;
      offsetY += styleBorderTop;
      offsetX += window.pageXOffset;
      offsetY += window.pageYOffset;
      return {
        "X": offsetX,
        "Y": offsetY
      }
    }
    function updateMousePosition(curElement, event) {
      var offset = calculateOffset(curElement, event);
      p.mouseX = event.pageX - offset.X;
      p.mouseY = event.pageY - offset.Y
    }
    function addTouchEventOffset(t) {
      var offset = calculateOffset(t.changedTouches[0].target, t.changedTouches[0]),
        i;
      for (i = 0; i < t.touches.length; i++) {
        var touch = t.touches[i];
        touch.offsetX = touch.pageX - offset.X;
        touch.offsetY = touch.pageY - offset.Y
      }
      for (i = 0; i < t.targetTouches.length; i++) {
        var targetTouch = t.targetTouches[i];
        targetTouch.offsetX = targetTouch.pageX - offset.X;
        targetTouch.offsetY = targetTouch.pageY - offset.Y
      }
      for (i = 0; i < t.changedTouches.length; i++) {
        var changedTouch = t.changedTouches[i];
        changedTouch.offsetX = changedTouch.pageX - offset.X;
        changedTouch.offsetY = changedTouch.pageY - offset.Y
      }
      return t
    }
    attachEventHandler(curElement, "touchstart", function(t) {
      curElement.setAttribute("style", "-webkit-user-select: none");
      curElement.setAttribute("onclick", "void(0)");
      curElement.setAttribute("style", "-webkit-tap-highlight-color:rgba(0,0,0,0)");
      for (var i = 0, ehl = eventHandlers.length; i < ehl; i++) {
        var type = eventHandlers[i].type;
        if (type === "mouseout" || type === "mousemove" || type === "mousedown" || type === "mouseup" || type === "DOMMouseScroll" || type === "mousewheel" || type === "touchstart") detachEventHandler(eventHandlers[i])
      }
      if (p.touchStart !== undef || p.touchMove !== undef || p.touchEnd !== undef || p.touchCancel !== undef) {
        attachEventHandler(curElement, "touchstart", function(t) {
          if (p.touchStart !== undef) {
            t = addTouchEventOffset(t);
            p.touchStart(t)
          }
        });
        attachEventHandler(curElement, "touchmove", function(t) {
          if (p.touchMove !== undef) {
            t.preventDefault();
            t = addTouchEventOffset(t);
            p.touchMove(t)
          }
        });
        attachEventHandler(curElement, "touchend", function(t) {
          if (p.touchEnd !== undef) {
            t = addTouchEventOffset(t);
            p.touchEnd(t)
          }
        });
        attachEventHandler(curElement, "touchcancel", function(t) {
          if (p.touchCancel !== undef) {
            t = addTouchEventOffset(t);
            p.touchCancel(t)
          }
        })
      } else {
        attachEventHandler(curElement, "touchstart", function(e) {
          updateMousePosition(curElement, e.touches[0]);
          p.__mousePressed = true;
          p.mouseDragging = false;
          p.mouseButton = 37;
          if (typeof p.mousePressed === "function") p.mousePressed()
        });
        attachEventHandler(curElement, "touchmove", function(e) {
          e.preventDefault();
          updateMousePosition(curElement, e.touches[0]);
          if (typeof p.mouseMoved === "function" && !p.__mousePressed) p.mouseMoved();
          if (typeof p.mouseDragged === "function" && p.__mousePressed) {
            p.mouseDragged();
            p.mouseDragging = true
          }
        });
        attachEventHandler(curElement, "touchend", function(e) {
          p.__mousePressed = false;
          if (typeof p.mouseClicked === "function" && !p.mouseDragging) p.mouseClicked();
          if (typeof p.mouseReleased === "function") p.mouseReleased()
        })
      }
      curElement.dispatchEvent(t)
    });
    (function() {
      var enabled = true,
        contextMenu = function(e) {
        e.preventDefault();
        e.stopPropagation()
      };
      p.disableContextMenu = function() {
        if (!enabled) return;
        attachEventHandler(curElement, "contextmenu", contextMenu);
        enabled = false
      };
      p.enableContextMenu = function() {
        if (enabled) return;
        detachEventHandler({
          elem: curElement,
          type: "contextmenu",
          fn: contextMenu
        });
        enabled = true
      }
    })();
    attachEventHandler(curElement, "mousemove", function(e) {
      updateMousePosition(curElement, e);
      if (typeof p.mouseMoved === "function" && !p.__mousePressed) p.mouseMoved();
      if (typeof p.mouseDragged === "function" && p.__mousePressed) {
        p.mouseDragged();
        p.mouseDragging = true
      }
    });
    attachEventHandler(curElement, "mouseout", function(e) {
      if (typeof p.mouseOut === "function") p.mouseOut()
    });
    attachEventHandler(curElement, "mouseover", function(e) {
      updateMousePosition(curElement, e);
      if (typeof p.mouseOver === "function") p.mouseOver()
    });
    curElement.onmousedown = function() {
      curElement.focus();
      return false
    };
    attachEventHandler(curElement, "mousedown", function(e) {
      p.__mousePressed = true;
      p.mouseDragging = false;
      switch (e.which) {
      case 1:
        p.mouseButton = 37;
        break;
      case 2:
        p.mouseButton = 3;
        break;
      case 3:
        p.mouseButton = 39;
        break
      }
      if (typeof p.mousePressed === "function") p.mousePressed()
    });
    attachEventHandler(curElement, "mouseup", function(e) {
      p.__mousePressed = false;
      if (typeof p.mouseClicked === "function" && !p.mouseDragging) p.mouseClicked();
      if (typeof p.mouseReleased === "function") p.mouseReleased()
    });
    var mouseWheelHandler = function(e) {
      var delta = 0;
      if (e.wheelDelta) {
        delta = e.wheelDelta / 120;
        if (window.opera) delta = -delta
      } else if (e.detail) delta = -e.detail / 3;
      p.mouseScroll = delta;
      if (delta && typeof p.mouseScrolled === "function") p.mouseScrolled()
    };
    attachEventHandler(document, "DOMMouseScroll", mouseWheelHandler);
    attachEventHandler(document, "mousewheel", mouseWheelHandler);
    if (!curElement.getAttribute("tabindex")) curElement.setAttribute("tabindex", 0);

    function getKeyCode(e) {
      var code = e.which || e.keyCode;
      switch (code) {
      case 13:
        return 10;
      case 91:
      case 93:
      case 224:
        return 157;
      case 57392:
        return 17;
      case 46:
        return 127;
      case 45:
        return 155
      }
      return code
    }
    function getKeyChar(e) {
      var c = e.which || e.keyCode;
      var anyShiftPressed = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
      switch (c) {
      case 13:
        c = anyShiftPressed ? 13 : 10;
        break;
      case 8:
        c = anyShiftPressed ? 127 : 8;
        break
      }
      return new Char(c)
    }
    function suppressKeyEvent(e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      else if (typeof e.stopPropagation === "function") e.stopPropagation();
      return false
    }
    function updateKeyPressed() {
      var ch;
      for (ch in pressedKeysMap) if (pressedKeysMap.hasOwnProperty(ch)) {
        p.__keyPressed = true;
        return
      }
      p.__keyPressed = false
    }
    function resetKeyPressed() {
      p.__keyPressed = false;
      pressedKeysMap = [];
      lastPressedKeyCode = null
    }
    function simulateKeyTyped(code, c) {
      pressedKeysMap[code] = c;
      lastPressedKeyCode = null;
      p.key = c;
      p.keyCode = code;
      p.keyPressed();
      p.keyCode = 0;
      p.keyTyped();
      updateKeyPressed()
    }
    function handleKeydown(e) {
      var code = getKeyCode(e);
      if (code === 127) {
        simulateKeyTyped(code, new Char(127));
        return
      }
      if (codedKeys.indexOf(code) < 0) {
        lastPressedKeyCode = code;
        return
      }
      var c = new Char(65535);
      p.key = c;
      p.keyCode = code;
      pressedKeysMap[code] = c;
      p.keyPressed();
      lastPressedKeyCode = null;
      updateKeyPressed();
      return suppressKeyEvent(e)
    }
    function handleKeypress(e) {
      if (lastPressedKeyCode === null) return;
      var code = lastPressedKeyCode,
        c = getKeyChar(e);
      simulateKeyTyped(code, c);
      return suppressKeyEvent(e)
    }
    function handleKeyup(e) {
      var code = getKeyCode(e),
        c = pressedKeysMap[code];
      if (c === undef) return;
      p.key = c;
      p.keyCode = code;
      p.keyReleased();
      delete pressedKeysMap[code];
      updateKeyPressed()
    }
    if (!pgraphicsMode) {
      if (aCode instanceof Processing.Sketch) curSketch = aCode;
      else if (typeof aCode === "function") curSketch = new Processing.Sketch(aCode);
      else if (!aCode) curSketch = new Processing.Sketch(function() {});
      else curSketch = Processing.compile(aCode);
      p.externals.sketch = curSketch;
      wireDimensionalFunctions();
      curElement.onfocus = function() {
        p.focused = true
      };
      curElement.onblur = function() {
        p.focused = false;
        if (!curSketch.options.globalKeyEvents) resetKeyPressed()
      };
      if (curSketch.options.pauseOnBlur) {
        attachEventHandler(window, "focus", function() {
          if (doLoop) p.loop()
        });
        attachEventHandler(window, "blur", function() {
          if (doLoop && loopStarted) {
            p.noLoop();
            doLoop = true
          }
          resetKeyPressed()
        })
      }
      var keyTrigger = curSketch.options.globalKeyEvents ? window : curElement;
      attachEventHandler(keyTrigger, "keydown", handleKeydown);
      attachEventHandler(keyTrigger, "keypress", handleKeypress);
      attachEventHandler(keyTrigger, "keyup", handleKeyup);
      for (var i in Processing.lib) if (Processing.lib.hasOwnProperty(i)) if (Processing.lib[i].hasOwnProperty("attach")) Processing.lib[i].attach(p);
      else if (Processing.lib[i] instanceof Function) Processing.lib[i].call(this);
      var retryInterval = 100;
      var executeSketch = function(processing) {
        if (! (curSketch.imageCache.pending || PFont.preloading.pending(retryInterval))) {
          if (window.opera) {
            var link, element, operaCache = curSketch.imageCache.operaCache;
            for (link in operaCache) if (operaCache.hasOwnProperty(link)) {
              element = operaCache[link];
              if (element !== null) document.body.removeChild(element);
              delete operaCache[link]
            }
          }
          curSketch.attach(processing, defaultScope);
          curSketch.onLoad(processing);
          if (processing.setup) {
            processing.setup();
            processing.resetMatrix();
            curSketch.onSetup()
          }
          resetContext();
          if (processing.draw) if (!doLoop) processing.redraw();
          else processing.loop()
        } else window.setTimeout(function() {
          executeSketch(processing)
        },
        retryInterval)
      };
      addInstance(this);
      executeSketch(p)
    } else {
      curSketch = new Processing.Sketch;
      wireDimensionalFunctions();
      p.size = function(w, h, render) {
        if (render && render === 2) wireDimensionalFunctions("3D");
        else wireDimensionalFunctions("2D");
        p.size(w, h, render)
      }
    }
  };
  Processing.debug = debug;
  Processing.prototype = defaultScope;

  function getGlobalMembers() {
    var names = ["abs", "acos", "alpha", "ambient", "ambientLight", "append",
      "applyMatrix", "arc", "arrayCopy", "asin", "atan", "atan2", "background", "beginCamera", "beginDraw", "beginShape", "bezier", "bezierDetail", "bezierPoint", "bezierTangent", "bezierVertex", "binary", "blend", "blendColor", "blit_resize", "blue", "box", "breakShape", "brightness", "camera", "ceil", "Character", "color", "colorMode", "concat", "constrain", "copy", "cos", "createFont", "createGraphics", "createImage", "cursor", "curve", "curveDetail", "curvePoint", "curveTangent", "curveTightness", "curveVertex", "day", "degrees", "directionalLight",
      "disableContextMenu", "dist", "draw", "ellipse", "ellipseMode", "emissive", "enableContextMenu", "endCamera", "endDraw", "endShape", "exit", "exp", "expand", "externals", "fill", "filter", "floor", "focused", "frameCount", "frameRate", "frustum", "get", "glyphLook", "glyphTable", "green", "height", "hex", "hint", "hour", "hue", "image", "imageMode", "intersect", "join", "key", "keyCode", "keyPressed", "keyReleased", "keyTyped", "lerp", "lerpColor", "lightFalloff", "lights", "lightSpecular", "line", "link", "loadBytes", "loadFont", "loadGlyphs",
      "loadImage", "loadPixels", "loadShape", "loadXML", "loadStrings", "log", "loop", "mag", "map", "match", "matchAll", "max", "millis", "min", "minute", "mix", "modelX", "modelY", "modelZ", "modes", "month", "mouseButton", "mouseClicked", "mouseDragged", "mouseMoved", "mouseOut", "mouseOver", "mousePressed", "mouseReleased", "mouseScroll", "mouseScrolled", "mouseX", "mouseY", "name", "nf", "nfc", "nfp", "nfs", "noCursor", "noFill", "noise", "noiseDetail", "noiseSeed", "noLights", "noLoop", "norm", "normal", "noSmooth", "noStroke", "noTint", "ortho",
      "param", "parseBoolean", "parseByte", "parseChar", "parseFloat", "parseInt", "peg", "perspective", "PImage", "pixels", "PMatrix2D", "PMatrix3D", "PMatrixStack", "pmouseX", "pmouseY", "point", "pointLight", "popMatrix", "popStyle", "pow", "print", "printCamera", "println", "printMatrix", "printProjection", "PShape", "PShapeSVG", "pushMatrix", "pushStyle", "quad", "radians", "random", "Random", "randomSeed", "rect", "rectMode", "red", "redraw", "requestImage", "resetMatrix", "reverse", "rotate", "rotateX", "rotateY", "rotateZ", "round", "saturation",
      "save", "saveFrame", "saveStrings", "scale", "screenX", "screenY", "screenZ", "second", "set", "setup", "shape", "shapeMode", "shared", "shearX", "shearY", "shininess", "shorten", "sin", "size", "smooth", "sort", "specular", "sphere", "sphereDetail", "splice", "split", "splitTokens", "spotLight", "sq", "sqrt", "status", "str", "stroke", "strokeCap", "strokeJoin", "strokeWeight", "subset", "tan", "text", "textAlign", "textAscent", "textDescent", "textFont", "textLeading", "textMode", "textSize", "texture", "textureMode", "textWidth", "tint", "toImageData",
      "touchCancel", "touchEnd", "touchMove", "touchStart", "translate", "transform", "triangle", "trim", "unbinary", "unhex", "updatePixels", "use3DContext", "vertex", "width", "XMLElement", "XML", "year", "__contains", "__equals", "__equalsIgnoreCase", "__frameRate", "__hashCode", "__int_cast", "__instanceof", "__keyPressed", "__mousePressed", "__printStackTrace", "__replace", "__replaceAll", "__replaceFirst", "__toCharArray", "__split", "__codePointAt", "__startsWith", "__endsWith", "__matches"];
    var members = {};
    var i, l;
    for (i = 0, l = names.length; i < l; ++i) members[names[i]] = null;
    for (var lib in Processing.lib) if (Processing.lib.hasOwnProperty(lib)) if (Processing.lib[lib].exports) {
      var exportedNames = Processing.lib[lib].exports;
      for (i = 0, l = exportedNames.length; i < l; ++i) members[exportedNames[i]] = null
    }
    return members
  }
  function parseProcessing(code) {
    var globalMembers = getGlobalMembers();

    function splitToAtoms(code) {
      var atoms = [];
      var items = code.split(/([\{\[\(\)\]\}])/);
      var result = items[0];
      var stack = [];
      for (var i = 1; i < items.length; i += 2) {
        var item = items[i];
        if (item === "[" || item === "{" || item === "(") {
          stack.push(result);
          result = item
        } else if (item === "]" || item === "}" || item === ")") {
          var kind = item === "}" ? "A" : item === ")" ? "B" : "C";
          var index = atoms.length;
          atoms.push(result + item);
          result = stack.pop() + '"' + kind + (index + 1) + '"'
        }
        result += items[i + 1]
      }
      atoms.unshift(result);
      return atoms
    }
    function injectStrings(code, strings) {
      return code.replace(/'(\d+)'/g, function(all, index) {
        var val = strings[index];
        if (val.charAt(0) === "/") return val;
        return /^'((?:[^'\\\n])|(?:\\.[0-9A-Fa-f]*))'$/.test(val) ? "(new $p.Character(" + val + "))" : val
      })
    }
    function trimSpaces(string) {
      var m1 = /^\s*/.exec(string),
        result;
      if (m1[0].length === string.length) result = {
        left: m1[0],
        middle: "",
        right: ""
      };
      else {
        var m2 = /\s*$/.exec(string);
        result = {
          left: m1[0],
          middle: string.substring(m1[0].length, m2.index),
          right: m2[0]
        }
      }
      result.untrim = function(t) {
        return this.left + t + this.right
      };
      return result
    }
    function trim(string) {
      return string.replace(/^\s+/, "").replace(/\s+$/, "")
    }
    function appendToLookupTable(table, array) {
      for (var i = 0, l = array.length; i < l; ++i) table[array[i]] = null;
      return table
    }
    function isLookupTableEmpty(table) {
      for (var i in table) if (table.hasOwnProperty(i)) return false;
      return true
    }
    function getAtomIndex(templ) {
      return templ.substring(2, templ.length - 1)
    }
    var codeWoExtraCr = code.replace(/\r\n?|\n\r/g, "\n");
    var strings = [];
    var codeWoStrings = codeWoExtraCr.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(([\[\(=|&!\^:?]\s*)(\/(?![*\/])(?:[^\/\\\n]|\\.)*\/[gim]*)\b)|(\/\/[^\n]*\n)|(\/\*(?:(?!\*\/)(?:.|\n))*\*\/)/g, function(all, quoted, aposed, regexCtx, prefix, regex, singleComment, comment) {
      var index;
      if (quoted || aposed) {
        index = strings.length;
        strings.push(all);
        return "'" + index + "'"
      }
      if (regexCtx) {
        index = strings.length;
        strings.push(regex);
        return prefix + "'" + index + "'"
      }
      return comment !== "" ? " " : "\n"
    });
    codeWoStrings = codeWoStrings.replace(/__x([0-9A-F]{4})/g, function(all, hexCode) {
      return "__x005F_x" + hexCode
    });
    codeWoStrings = codeWoStrings.replace(/\$/g, "__x0024");
    var genericsWereRemoved;
    var codeWoGenerics = codeWoStrings;
    var replaceFunc = function(all, before, types, after) {
      if ( !! before || !!after) return all;
      genericsWereRemoved = true;
      return ""
    };
    do {
      genericsWereRemoved = false;
      codeWoGenerics = codeWoGenerics.replace(/([<]?)<\s*((?:\?|[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)(?:\[\])*(?:\s+(?:extends|super)\s+[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)?(?:\s*,\s*(?:\?|[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)(?:\[\])*(?:\s+(?:extends|super)\s+[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)?)*)\s*>([=]?)/g, replaceFunc)
    } while (genericsWereRemoved);
    var atoms = splitToAtoms(codeWoGenerics);
    var replaceContext;
    var declaredClasses = {},
      currentClassId, classIdSeed = 0;

    function addAtom(text, type) {
      var lastIndex = atoms.length;
      atoms.push(text);
      return '"' + type + lastIndex + '"'
    }
    function generateClassId() {
      return "class" + ++classIdSeed
    }
    function appendClass(class_, classId, scopeId) {
      class_.classId = classId;
      class_.scopeId = scopeId;
      declaredClasses[classId] = class_
    }
    var transformClassBody, transformInterfaceBody, transformStatementsBlock, transformStatements, transformMain, transformExpression;
    var classesRegex = /\b((?:(?:public|private|final|protected|static|abstract)\s+)*)(class|interface)\s+([A-Za-z_$][\w$]*\b)(\s+extends\s+[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*(?:\s*,\s*[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*\b)*)?(\s+implements\s+[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*(?:\s*,\s*[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*\b)*)?\s*("A\d+")/g;
    var methodsRegex = /\b((?:(?:public|private|final|protected|static|abstract|synchronized)\s+)*)((?!(?:else|new|return|throw|function|public|private|protected)\b)[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*(?:\s*"C\d+")*)\s*([A-Za-z_$][\w$]*\b)\s*("B\d+")(\s*throws\s+[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*(?:\s*,\s*[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)*)?\s*("A\d+"|;)/g;
    var fieldTest = /^((?:(?:public|private|final|protected|static)\s+)*)((?!(?:else|new|return|throw)\b)[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*(?:\s*"C\d+")*)\s*([A-Za-z_$][\w$]*\b)\s*(?:"C\d+"\s*)*([=,]|$)/;
    var cstrsRegex = /\b((?:(?:public|private|final|protected|static|abstract)\s+)*)((?!(?:new|return|throw)\b)[A-Za-z_$][\w$]*\b)\s*("B\d+")(\s*throws\s+[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*(?:\s*,\s*[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)*)?\s*("A\d+")/g;
    var attrAndTypeRegex = /^((?:(?:public|private|final|protected|static)\s+)*)((?!(?:new|return|throw)\b)[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*(?:\s*"C\d+")*)\s*/;
    var functionsRegex = /\bfunction(?:\s+([A-Za-z_$][\w$]*))?\s*("B\d+")\s*("A\d+")/g;

    function extractClassesAndMethods(code) {
      var s = code;
      s = s.replace(classesRegex, function(all) {
        return addAtom(all, "E")
      });
      s = s.replace(methodsRegex, function(all) {
        return addAtom(all, "D")
      });
      s = s.replace(functionsRegex, function(all) {
        return addAtom(all, "H")
      });
      return s
    }
    function extractConstructors(code, className) {
      var result = code.replace(cstrsRegex, function(all, attr, name, params, throws_, body) {
        if (name !== className) return all;
        return addAtom(all, "G")
      });
      return result
    }
    function AstParam(name) {
      this.name = name
    }
    AstParam.prototype.toString = function() {
      return this.name
    };

    function AstParams(params, methodArgsParam) {
      this.params = params;
      this.methodArgsParam = methodArgsParam
    }
    AstParams.prototype.getNames = function() {
      var names = [];
      for (var i = 0, l = this.params.length; i < l; ++i) names.push(this.params[i].name);
      return names
    };
    AstParams.prototype.prependMethodArgs = function(body) {
      if (!this.methodArgsParam) return body;
      return "{\nvar " + this.methodArgsParam.name + " = Array.prototype.slice.call(arguments, " + this.params.length + ");\n" + body.substring(1)
    };
    AstParams.prototype.toString = function() {
      if (this.params.length === 0) return "()";
      var result = "(";
      for (var i = 0, l = this.params.length; i < l; ++i) result += this.params[i] + ", ";
      return result.substring(0, result.length - 2) + ")"
    };

    function transformParams(params) {
      var paramsWoPars = trim(params.substring(1, params.length - 1));
      var result = [],
        methodArgsParam = null;
      if (paramsWoPars !== "") {
        var paramList = paramsWoPars.split(",");
        for (var i = 0; i < paramList.length; ++i) {
          var param = /\b([A-Za-z_$][\w$]*\b)(\s*"[ABC][\d]*")*\s*$/.exec(paramList[i]);
          if (i === paramList.length - 1 && paramList[i].indexOf("...") >= 0) {
            methodArgsParam = new AstParam(param[1]);
            break
          }
          result.push(new AstParam(param[1]))
        }
      }
      return new AstParams(result, methodArgsParam)
    }
    function preExpressionTransform(expr) {
      var s = expr;
      s = s.replace(/\bnew\s+([A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)(?:\s*"C\d+")+\s*("A\d+")/g, function(all, type, init) {
        return init
      });
      s = s.replace(/\bnew\s+([A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)(?:\s*"B\d+")\s*("A\d+")/g, function(all, type, init) {
        return addAtom(all, "F")
      });
      s = s.replace(functionsRegex, function(all) {
        return addAtom(all, "H")
      });
      s = s.replace(/\bnew\s+([A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)\s*("C\d+"(?:\s*"C\d+")*)/g, function(all, type, index) {
        var args = index.replace(/"C(\d+)"/g, function(all, j) {
          return atoms[j]
        }).replace(/\[\s*\]/g, "[null]").replace(/\s*\]\s*\[\s*/g, ", ");
        var arrayInitializer = "{" + args.substring(1, args.length - 1) + "}";
        var createArrayArgs = "('" + type + "', " + addAtom(arrayInitializer, "A") + ")";
        return "$p.createJavaArray" + addAtom(createArrayArgs, "B")
      });
      s = s.replace(/(\.\s*length)\s*"B\d+"/g, "$1");
      s = s.replace(/#([0-9A-Fa-f]{6})\b/g, function(all, digits) {
        return "0xFF" + digits
      });
      s = s.replace(/"B(\d+)"(\s*(?:[\w$']|"B))/g, function(all, index, next) {
        var atom = atoms[index];
        if (!/^\(\s*[A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*\s*(?:"C\d+"\s*)*\)$/.test(atom)) return all;
        if (/^\(\s*int\s*\)$/.test(atom)) return "(int)" + next;
        var indexParts = atom.split(/"C(\d+)"/g);
        if (indexParts.length > 1) if (!/^\[\s*\]$/.test(atoms[indexParts[1]])) return all;
        return "" + next
      });
      s = s.replace(/\(int\)([^,\]\)\}\?\:\*\+\-\/\^\|\%\&\~<\>\=]+)/g, function(all, arg) {
        var trimmed = trimSpaces(arg);
        return trimmed.untrim("__int_cast(" + trimmed.middle + ")")
      });
      s = s.replace(/\bsuper(\s*"B\d+")/g, "$$superCstr$1").replace(/\bsuper(\s*\.)/g, "$$super$1");
      s = s.replace(/\b0+((\d*)(?:\.[\d*])?(?:[eE][\-\+]?\d+)?[fF]?)\b/, function(all, numberWo0, intPart) {
        if (numberWo0 === intPart) return all;
        return intPart === "" ? "0" + numberWo0 : numberWo0
      });
      s = s.replace(/\b(\.?\d+\.?)[fF]\b/g, "$1");
      s = s.replace(/([^\s])%([^=\s])/g, "$1 % $2");
      s = s.replace(/\b(frameRate|keyPressed|mousePressed)\b(?!\s*"B)/g, "__$1");
      s = s.replace(/\b(boolean|byte|char|float|int)\s*"B/g, function(all, name) {
        return "parse" + name.substring(0, 1).toUpperCase() + name.substring(1) + '"B'
      });
      s = s.replace(/\bpixels\b\s*(("C(\d+)")|\.length)?(\s*=(?!=)([^,\]\)\}]+))?/g, function(all, indexOrLength, index, atomIndex, equalsPart, rightSide) {
        if (index) {
          var atom = atoms[atomIndex];
          if (equalsPart) return "pixels.setPixel" + addAtom("(" + atom.substring(1, atom.length - 1) + "," + rightSide + ")", "B");
          return "pixels.getPixel" + addAtom("(" + atom.substring(1, atom.length - 1) + ")", "B")
        }
        if (indexOrLength) return "pixels.getLength" + addAtom("()", "B");
        if (equalsPart) return "pixels.set" + addAtom("(" + rightSide + ")", "B");
        return "pixels.toArray" + addAtom("()", "B")
      });
      var repeatJavaReplacement;

      function replacePrototypeMethods(all, subject, method, atomIndex) {
        var atom = atoms[atomIndex];
        repeatJavaReplacement = true;
        var trimmed = trimSpaces(atom.substring(1, atom.length - 1));
        return "__" + method + (trimmed.middle === "" ? addAtom("(" + subject.replace(/\.\s*$/, "") + ")", "B") : addAtom("(" + subject.replace(/\.\s*$/, "") + "," + trimmed.middle + ")", "B"))
      }
      do {
        repeatJavaReplacement = false;
        s = s.replace(/((?:'\d+'|\b[A-Za-z_$][\w$]*\s*(?:"[BC]\d+")*)\s*\.\s*(?:[A-Za-z_$][\w$]*\s*(?:"[BC]\d+"\s*)*\.\s*)*)(replace|replaceAll|replaceFirst|contains|equals|equalsIgnoreCase|hashCode|toCharArray|printStackTrace|split|startsWith|endsWith|codePointAt|matches)\s*"B(\d+)"/g, replacePrototypeMethods)
      } while (repeatJavaReplacement);

      function replaceInstanceof(all, subject, type) {
        repeatJavaReplacement = true;
        return "__instanceof" + addAtom("(" + subject + ", " + type + ")", "B")
      }
      do {
        repeatJavaReplacement = false;
        s = s.replace(/((?:'\d+'|\b[A-Za-z_$][\w$]*\s*(?:"[BC]\d+")*)\s*(?:\.\s*[A-Za-z_$][\w$]*\s*(?:"[BC]\d+"\s*)*)*)instanceof\s+([A-Za-z_$][\w$]*\s*(?:\.\s*[A-Za-z_$][\w$]*)*)/g, replaceInstanceof)
      } while (repeatJavaReplacement);
      s = s.replace(/\bthis(\s*"B\d+")/g, "$$constr$1");
      return s
    }
    function AstInlineClass(baseInterfaceName, body) {
      this.baseInterfaceName = baseInterfaceName;
      this.body = body;
      body.owner = this
    }
    AstInlineClass.prototype.toString = function() {
      return "new (" + this.body + ")"
    };

    function transformInlineClass(class_) {
      var m = (new RegExp(/\bnew\s*([A-Za-z_$][\w$]*\s*(?:\.\s*[A-Za-z_$][\w$]*)*)\s*"B\d+"\s*"A(\d+)"/)).exec(class_);
      var oldClassId = currentClassId,
        newClassId = generateClassId();
      currentClassId = newClassId;
      var uniqueClassName = m[1] + "$" + newClassId;
      var inlineClass = new AstInlineClass(uniqueClassName, transformClassBody(atoms[m[2]], uniqueClassName, "", "implements " + m[1]));
      appendClass(inlineClass, newClassId, oldClassId);
      currentClassId = oldClassId;
      return inlineClass
    }

    function AstFunction(name, params, body) {
      this.name = name;
      this.params = params;
      this.body = body
    }
    AstFunction.prototype.toString = function() {
      var oldContext = replaceContext;
      var names = appendToLookupTable({
        "this": null
      },
      this.params.getNames());
      replaceContext = function(subject) {
        return names.hasOwnProperty(subject.name) ? subject.name : oldContext(subject)
      };
      var result = "function";
      if (this.name) result += " " + this.name;
      var body = this.params.prependMethodArgs(this.body.toString());
      result += this.params + " " + body;
      replaceContext = oldContext;
      return result
    };

    function transformFunction(class_) {
      var m = (new RegExp(/\b([A-Za-z_$][\w$]*)\s*"B(\d+)"\s*"A(\d+)"/)).exec(class_);
      return new AstFunction(m[1] !== "function" ? m[1] : null, transformParams(atoms[m[2]]), transformStatementsBlock(atoms[m[3]]))
    }
    function AstInlineObject(members) {
      this.members = members
    }
    AstInlineObject.prototype.toString = function() {
      var oldContext = replaceContext;
      replaceContext = function(subject) {
        return subject.name === "this" ? "this" : oldContext(subject)
      };
      var result = "";
      for (var i = 0, l = this.members.length; i < l; ++i) {
        if (this.members[i].label) result += this.members[i].label + ": ";
        result += this.members[i].value.toString() + ", "
      }
      replaceContext = oldContext;
      return result.substring(0, result.length - 2)
    };

    function transformInlineObject(obj) {
      var members = obj.split(",");
      for (var i = 0; i < members.length; ++i) {
        var label = members[i].indexOf(":");
        if (label < 0) members[i] = {
          value: transformExpression(members[i])
        };
        else members[i] = {
          label: trim(members[i].substring(0, label)),
          value: transformExpression(trim(members[i].substring(label + 1)))
        }
      }
      return new AstInlineObject(members)
    }

    function expandExpression(expr) {
      if (expr.charAt(0) === "(" || expr.charAt(0) === "[") return expr.charAt(0) + expandExpression(expr.substring(1, expr.length - 1)) + expr.charAt(expr.length - 1);
      if (expr.charAt(0) === "{") {
        if (/^\{\s*(?:[A-Za-z_$][\w$]*|'\d+')\s*:/.test(expr)) return "{" + addAtom(expr.substring(1, expr.length - 1), "I") + "}";
        return "[" + expandExpression(expr.substring(1, expr.length - 1)) + "]"
      }
      var trimmed = trimSpaces(expr);
      var result = preExpressionTransform(trimmed.middle);
      result = result.replace(/"[ABC](\d+)"/g, function(all, index) {
        return expandExpression(atoms[index])
      });
      return trimmed.untrim(result)
    }
    function replaceContextInVars(expr) {
      return expr.replace(/(\.\s*)?((?:\b[A-Za-z_]|\$)[\w$]*)(\s*\.\s*([A-Za-z_$][\w$]*)(\s*\()?)?/g, function(all, memberAccessSign, identifier, suffix, subMember, callSign) {
        if (memberAccessSign) return all;
        var subject = {
          name: identifier,
          member: subMember,
          callSign: !!callSign
        };
        return replaceContext(subject) + (suffix === undef ? "" : suffix)
      })
    }
    function AstExpression(expr, transforms) {
      this.expr = expr;
      this.transforms = transforms
    }
    AstExpression.prototype.toString = function() {
      var transforms = this.transforms;
      var expr = replaceContextInVars(this.expr);
      return expr.replace(/"!(\d+)"/g, function(all, index) {
        return transforms[index].toString()
      })
    };
    transformExpression = function(expr) {
      var transforms = [];
      var s = expandExpression(expr);
      s = s.replace(/"H(\d+)"/g, function(all, index) {
        transforms.push(transformFunction(atoms[index]));
        return '"!' + (transforms.length - 1) + '"'
      });
      s = s.replace(/"F(\d+)"/g, function(all, index) {
        transforms.push(transformInlineClass(atoms[index]));
        return '"!' + (transforms.length - 1) + '"'
      });
      s = s.replace(/"I(\d+)"/g, function(all, index) {
        transforms.push(transformInlineObject(atoms[index]));
        return '"!' + (transforms.length - 1) + '"'
      });
      return new AstExpression(s, transforms)
    };

    function AstVarDefinition(name, value, isDefault) {
      this.name = name;
      this.value = value;
      this.isDefault = isDefault
    }
    AstVarDefinition.prototype.toString = function() {
      return this.name + " = " + this.value
    };

    function transformVarDefinition(def, defaultTypeValue) {
      var eqIndex = def.indexOf("=");
      var name, value, isDefault;
      if (eqIndex < 0) {
        name = def;
        value = defaultTypeValue;
        isDefault = true
      } else {
        name = def.substring(0, eqIndex);
        value = transformExpression(def.substring(eqIndex + 1));
        isDefault = false
      }
      return new AstVarDefinition(trim(name.replace(/(\s*"C\d+")+/g, "")), value, isDefault)
    }
    function getDefaultValueForType(type) {
      if (type === "int" || type === "float") return "0";
      if (type === "boolean") return "false";
      if (type === "color") return "0x00000000";
      return "null"
    }
    function AstVar(definitions, varType) {
      this.definitions = definitions;
      this.varType = varType
    }
    AstVar.prototype.getNames = function() {
      var names = [];
      for (var i = 0, l = this.definitions.length; i < l; ++i) names.push(this.definitions[i].name);
      return names
    };
    AstVar.prototype.toString = function() {
      return "var " + this.definitions.join(",")
    };

    function AstStatement(expression) {
      this.expression = expression
    }
    AstStatement.prototype.toString = function() {
      return this.expression.toString()
    };

    function transformStatement(statement) {
      if (fieldTest.test(statement)) {
        var attrAndType = attrAndTypeRegex.exec(statement);
        var definitions = statement.substring(attrAndType[0].length).split(",");
        var defaultTypeValue = getDefaultValueForType(attrAndType[2]);
        for (var i = 0; i < definitions.length; ++i) definitions[i] = transformVarDefinition(definitions[i], defaultTypeValue);
        return new AstVar(definitions, attrAndType[2])
      }
      return new AstStatement(transformExpression(statement))
    }
    function AstForExpression(initStatement, condition, step) {
      this.initStatement = initStatement;
      this.condition = condition;
      this.step = step
    }
    AstForExpression.prototype.toString = function() {
      return "(" + this.initStatement + "; " + this.condition + "; " + this.step + ")"
    };

    function AstForInExpression(initStatement, container) {
      this.initStatement = initStatement;
      this.container = container
    }
    AstForInExpression.prototype.toString = function() {
      var init = this.initStatement.toString();
      if (init.indexOf("=") >= 0) init = init.substring(0, init.indexOf("="));
      return "(" + init + " in " + this.container + ")"
    };

    function AstForEachExpression(initStatement, container) {
      this.initStatement = initStatement;
      this.container = container
    }
    AstForEachExpression.iteratorId = 0;
    AstForEachExpression.prototype.toString = function() {
      var init = this.initStatement.toString();
      var iterator = "$it" + AstForEachExpression.iteratorId++;
      var variableName = init.replace(/^\s*var\s*/, "").split("=")[0];
      var initIteratorAndVariable = "var " + iterator + " = new $p.ObjectIterator(" + this.container + "), " + variableName + " = void(0)";
      var nextIterationCondition = iterator + ".hasNext() && ((" + variableName + " = " + iterator + ".next()) || true)";
      return "(" + initIteratorAndVariable + "; " + nextIterationCondition + ";)"
    };

    function transformForExpression(expr) {
      var content;
      if (/\bin\b/.test(expr)) {
        content = expr.substring(1, expr.length - 1).split(/\bin\b/g);
        return new AstForInExpression(transformStatement(trim(content[0])), transformExpression(content[1]))
      }
      if (expr.indexOf(":") >= 0 && expr.indexOf(";") < 0) {
        content = expr.substring(1, expr.length - 1).split(":");
        return new AstForEachExpression(transformStatement(trim(content[0])), transformExpression(content[1]))
      }
      content = expr.substring(1, expr.length - 1).split(";");
      return new AstForExpression(transformStatement(trim(content[0])), transformExpression(content[1]), transformExpression(content[2]))
    }

    function sortByWeight(array) {
      array.sort(function(a, b) {
        return b.weight - a.weight
      })
    }
    function AstInnerInterface(name, body, isStatic) {
      this.name = name;
      this.body = body;
      this.isStatic = isStatic;
      body.owner = this
    }
    AstInnerInterface.prototype.toString = function() {
      return "" + this.body
    };

    function AstInnerClass(name, body, isStatic) {
      this.name = name;
      this.body = body;
      this.isStatic = isStatic;
      body.owner = this
    }
    AstInnerClass.prototype.toString = function() {
      return "" + this.body
    };

    function transformInnerClass(class_) {
      var m = classesRegex.exec(class_);
      classesRegex.lastIndex = 0;
      var isStatic = m[1].indexOf("static") >= 0;
      var body = atoms[getAtomIndex(m[6])],
        innerClass;
      var oldClassId = currentClassId,
        newClassId = generateClassId();
      currentClassId = newClassId;
      if (m[2] === "interface") innerClass = new AstInnerInterface(m[3], transformInterfaceBody(body, m[3], m[4]), isStatic);
      else innerClass = new AstInnerClass(m[3], transformClassBody(body, m[3], m[4], m[5]), isStatic);
      appendClass(innerClass, newClassId, oldClassId);
      currentClassId = oldClassId;
      return innerClass
    }
    function AstClassMethod(name, params, body, isStatic) {
      this.name = name;
      this.params = params;
      this.body = body;
      this.isStatic = isStatic
    }
    AstClassMethod.prototype.toString = function() {
      var paramNames = appendToLookupTable({},
      this.params.getNames());
      var oldContext = replaceContext;
      replaceContext = function(subject) {
        return paramNames.hasOwnProperty(subject.name) ? subject.name : oldContext(subject)
      };
      var body = this.params.prependMethodArgs(this.body.toString());
      var result = "function " + this.methodId + this.params + " " + body + "\n";
      replaceContext = oldContext;
      return result
    };

    function transformClassMethod(method) {
      var m = methodsRegex.exec(method);
      methodsRegex.lastIndex = 0;
      var isStatic = m[1].indexOf("static") >= 0;
      var body = m[6] !== ";" ? atoms[getAtomIndex(m[6])] : "{}";
      return new AstClassMethod(m[3], transformParams(atoms[getAtomIndex(m[4])]), transformStatementsBlock(body), isStatic)
    }
    function AstClassField(definitions, fieldType, isStatic) {
      this.definitions = definitions;
      this.fieldType = fieldType;
      this.isStatic = isStatic
    }
    AstClassField.prototype.getNames = function() {
      var names = [];
      for (var i = 0, l = this.definitions.length; i < l; ++i) names.push(this.definitions[i].name);
      return names
    };
    AstClassField.prototype.toString = function() {
      var thisPrefix = replaceContext({
        name: "[this]"
      });
      if (this.isStatic) {
        var className = this.owner.name;
        var staticDeclarations = [];
        for (var i = 0, l = this.definitions.length; i < l; ++i) {
          var definition = this.definitions[i];
          var name = definition.name,
            staticName = className + "." + name;
          var declaration = "if(" + staticName + " === void(0)) {\n" + " " + staticName + " = " + definition.value + "; }\n" + "$p.defineProperty(" + thisPrefix + ", " + "'" + name + "', { get: function(){return " + staticName + ";}, " + "set: function(val){" + staticName + " = val;} });\n";
          staticDeclarations.push(declaration)
        }
        return staticDeclarations.join("")
      }
      return thisPrefix + "." + this.definitions.join("; " + thisPrefix + ".")
    };

    function transformClassField(statement) {
      var attrAndType = attrAndTypeRegex.exec(statement);
      var isStatic = attrAndType[1].indexOf("static") >= 0;
      var definitions = statement.substring(attrAndType[0].length).split(/,\s*/g);
      var defaultTypeValue = getDefaultValueForType(attrAndType[2]);
      for (var i = 0; i < definitions.length; ++i) definitions[i] = transformVarDefinition(definitions[i], defaultTypeValue);
      return new AstClassField(definitions, attrAndType[2], isStatic)
    }
    function AstConstructor(params, body) {
      this.params = params;
      this.body = body
    }
    AstConstructor.prototype.toString = function() {
      var paramNames = appendToLookupTable({},
      this.params.getNames());
      var oldContext = replaceContext;
      replaceContext = function(subject) {
        return paramNames.hasOwnProperty(subject.name) ? subject.name : oldContext(subject)
      };
      var prefix = "function $constr_" + this.params.params.length + this.params.toString();
      var body = this.params.prependMethodArgs(this.body.toString());
      if (!/\$(superCstr|constr)\b/.test(body)) body = "{\n$superCstr();\n" + body.substring(1);
      replaceContext = oldContext;
      return prefix + body + "\n"
    };

    function transformConstructor(cstr) {
      var m = (new RegExp(/"B(\d+)"\s*"A(\d+)"/)).exec(cstr);
      var params = transformParams(atoms[m[1]]);
      return new AstConstructor(params, transformStatementsBlock(atoms[m[2]]))
    }
    function AstInterfaceBody(name, interfacesNames, methodsNames, fields, innerClasses, misc) {
      var i, l;
      this.name = name;
      this.interfacesNames = interfacesNames;
      this.methodsNames = methodsNames;
      this.fields = fields;
      this.innerClasses = innerClasses;
      this.misc = misc;
      for (i = 0, l = fields.length; i < l; ++i) fields[i].owner = this
    }
    AstInterfaceBody.prototype.getMembers = function(classFields, classMethods, classInners) {
      if (this.owner.base) this.owner.base.body.getMembers(classFields, classMethods, classInners);
      var i, j, l, m;
      for (i = 0, l = this.fields.length; i < l; ++i) {
        var fieldNames = this.fields[i].getNames();
        for (j = 0, m = fieldNames.length; j < m; ++j) classFields[fieldNames[j]] = this.fields[i]
      }
      for (i = 0, l = this.methodsNames.length; i < l; ++i) {
        var methodName = this.methodsNames[i];
        classMethods[methodName] = true
      }
      for (i = 0, l = this.innerClasses.length; i < l; ++i) {
        var innerClass = this.innerClasses[i];
        classInners[innerClass.name] = innerClass
      }
    };
    AstInterfaceBody.prototype.toString = function() {
      function getScopeLevel(p) {
        var i = 0;
        while (p) {
          ++i;
          p = p.scope
        }
        return i
      }
      var scopeLevel = getScopeLevel(this.owner);
      var className = this.name;
      var staticDefinitions = "";
      var metadata = "";
      var thisClassFields = {},
        thisClassMethods = {},
        thisClassInners = {};
      this.getMembers(thisClassFields, thisClassMethods, thisClassInners);
      var i, l, j, m;
      if (this.owner.interfaces) {
        var resolvedInterfaces = [],
          resolvedInterface;
        for (i = 0, l = this.interfacesNames.length; i < l; ++i) {
          if (!this.owner.interfaces[i]) continue;
          resolvedInterface = replaceContext({
            name: this.interfacesNames[i]
          });
          resolvedInterfaces.push(resolvedInterface);
          staticDefinitions += "$p.extendInterfaceMembers(" + className + ", " + resolvedInterface + ");\n"
        }
        metadata += className + ".$interfaces = [" + resolvedInterfaces.join(", ") + "];\n"
      }
      metadata += className + ".$isInterface = true;\n";
      metadata += className + ".$methods = ['" + this.methodsNames.join("', '") + "'];\n";
      sortByWeight(this.innerClasses);
      for (i = 0, l = this.innerClasses.length; i < l; ++i) {
        var innerClass = this.innerClasses[i];
        if (innerClass.isStatic) staticDefinitions += className + "." + innerClass.name + " = " + innerClass + ";\n"
      }
      for (i = 0, l = this.fields.length; i < l; ++i) {
        var field = this.fields[i];
        if (field.isStatic) staticDefinitions += className + "." + field.definitions.join(";\n" + className + ".") + ";\n"
      }
      return "(function() {\n" + "function " + className + "() { throw 'Unable to create the interface'; }\n" + staticDefinitions + metadata + "return " + className + ";\n" + "})()"
    };
    transformInterfaceBody = function(body, name, baseInterfaces) {
      var declarations = body.substring(1, body.length - 1);
      declarations = extractClassesAndMethods(declarations);
      declarations = extractConstructors(declarations, name);
      var methodsNames = [],
        classes = [];
      declarations = declarations.replace(/"([DE])(\d+)"/g, function(all, type, index) {
        if (type === "D") methodsNames.push(index);
        else if (type === "E") classes.push(index);
        return ""
      });
      var fields = declarations.split(/;(?:\s*;)*/g);
      var baseInterfaceNames;
      var i, l;
      if (baseInterfaces !== undef) baseInterfaceNames = baseInterfaces.replace(/^\s*extends\s+(.+?)\s*$/g, "$1").split(/\s*,\s*/g);
      for (i = 0, l = methodsNames.length; i < l; ++i) {
        var method = transformClassMethod(atoms[methodsNames[i]]);
        methodsNames[i] = method.name
      }
      for (i = 0, l = fields.length - 1; i < l; ++i) {
        var field = trimSpaces(fields[i]);
        fields[i] = transformClassField(field.middle)
      }
      var tail = fields.pop();
      for (i = 0, l = classes.length; i < l; ++i) classes[i] = transformInnerClass(atoms[classes[i]]);
      return new AstInterfaceBody(name, baseInterfaceNames, methodsNames, fields, classes, {
        tail: tail
      })
    };

    function AstClassBody(name, baseClassName, interfacesNames, functions, methods, fields, cstrs, innerClasses, misc) {
      var i, l;
      this.name = name;
      this.baseClassName = baseClassName;
      this.interfacesNames = interfacesNames;
      this.functions = functions;
      this.methods = methods;
      this.fields = fields;
      this.cstrs = cstrs;
      this.innerClasses = innerClasses;
      this.misc = misc;
      for (i = 0, l = fields.length; i < l; ++i) fields[i].owner = this
    }
    AstClassBody.prototype.getMembers = function(classFields, classMethods, classInners) {
      if (this.owner.base) this.owner.base.body.getMembers(classFields, classMethods, classInners);
      var i, j, l, m;
      for (i = 0, l = this.fields.length; i < l; ++i) {
        var fieldNames = this.fields[i].getNames();
        for (j = 0, m = fieldNames.length; j < m; ++j) classFields[fieldNames[j]] = this.fields[i]
      }
      for (i = 0, l = this.methods.length; i < l; ++i) {
        var method = this.methods[i];
        classMethods[method.name] = method
      }
      for (i = 0, l = this.innerClasses.length; i < l; ++i) {
        var innerClass = this.innerClasses[i];
        classInners[innerClass.name] = innerClass
      }
    };
    AstClassBody.prototype.toString = function() {
      function getScopeLevel(p) {
        var i = 0;
        while (p) {
          ++i;
          p = p.scope
        }
        return i
      }
      var scopeLevel = getScopeLevel(this.owner);
      var selfId = "$this_" + scopeLevel;
      var className = this.name;
      var result = "var " + selfId + " = this;\n";
      var staticDefinitions = "";
      var metadata = "";
      var thisClassFields = {},
        thisClassMethods = {},
        thisClassInners = {};
      this.getMembers(thisClassFields, thisClassMethods, thisClassInners);
      var oldContext = replaceContext;
      replaceContext = function(subject) {
        var name = subject.name;
        if (name === "this") return subject.callSign || !subject.member ? selfId + ".$self" : selfId;
        if (thisClassFields.hasOwnProperty(name)) return thisClassFields[name].isStatic ? className + "." + name : selfId + "." + name;
        if (thisClassInners.hasOwnProperty(name)) return selfId + "." + name;
        if (thisClassMethods.hasOwnProperty(name)) return thisClassMethods[name].isStatic ? className + "." + name : selfId + ".$self." + name;
        return oldContext(subject)
      };
      var resolvedBaseClassName;
      if (this.baseClassName) {
        resolvedBaseClassName = oldContext({
          name: this.baseClassName
        });
        result += "var $super = { $upcast: " + selfId + " };\n";
        result += "function $superCstr(){" + resolvedBaseClassName + ".apply($super,arguments);if(!('$self' in $super)) $p.extendClassChain($super)}\n";
        metadata += className + ".$base = " + resolvedBaseClassName + ";\n"
      } else result += "function $superCstr(){$p.extendClassChain(" + selfId + ")}\n";
      if (this.owner.base) staticDefinitions += "$p.extendStaticMembers(" + className + ", " + resolvedBaseClassName + ");\n";
      var i, l, j, m;
      if (this.owner.interfaces) {
        var resolvedInterfaces = [],
          resolvedInterface;
        for (i = 0, l = this.interfacesNames.length; i < l; ++i) {
          if (!this.owner.interfaces[i]) continue;
          resolvedInterface = oldContext({
            name: this.interfacesNames[i]
          });
          resolvedInterfaces.push(resolvedInterface);
          staticDefinitions += "$p.extendInterfaceMembers(" + className + ", " + resolvedInterface + ");\n"
        }
        metadata += className + ".$interfaces = [" + resolvedInterfaces.join(", ") + "];\n"
      }
      if (this.functions.length > 0) result += this.functions.join("\n") + "\n";
      sortByWeight(this.innerClasses);
      for (i = 0, l = this.innerClasses.length; i < l; ++i) {
        var innerClass = this.innerClasses[i];
        if (innerClass.isStatic) {
          staticDefinitions += className + "." + innerClass.name + " = " + innerClass + ";\n";
          result += selfId + "." + innerClass.name + " = " + className + "." + innerClass.name + ";\n"
        } else result += selfId + "." + innerClass.name + " = " + innerClass + ";\n"
      }
      for (i = 0, l = this.fields.length; i < l; ++i) {
        var field = this.fields[i];
        if (field.isStatic) {
          staticDefinitions += className + "." + field.definitions.join(";\n" + className + ".") + ";\n";
          for (j = 0, m = field.definitions.length; j < m; ++j) {
            var fieldName = field.definitions[j].name,
              staticName = className + "." + fieldName;
            result += "$p.defineProperty(" + selfId + ", '" + fieldName + "', {" + "get: function(){return " + staticName + "}, " + "set: function(val){" + staticName + " = val}});\n"
          }
        } else result += selfId + "." + field.definitions.join(";\n" + selfId + ".") + ";\n"
      }
      var methodOverloads = {};
      for (i = 0, l = this.methods.length; i < l; ++i) {
        var method = this.methods[i];
        var overload = methodOverloads[method.name];
        var methodId = method.name + "$" + method.params.params.length;
        var hasMethodArgs = !!method.params.methodArgsParam;
        if (overload) {
          ++overload;
          methodId += "_" + overload
        } else overload = 1;
        method.methodId = methodId;
        methodOverloads[method.name] = overload;
        if (method.isStatic) {
          staticDefinitions += method;
          staticDefinitions += "$p.addMethod(" + className + ", '" + method.name + "', " + methodId + ", " + hasMethodArgs + ");\n";
          result += "$p.addMethod(" + selfId + ", '" + method.name + "', " + methodId + ", " + hasMethodArgs + ");\n"
        } else {
          result += method;
          result += "$p.addMethod(" + selfId + ", '" + method.name + "', " + methodId + ", " + hasMethodArgs + ");\n"
        }
      }
      result += trim(this.misc.tail);
      if (this.cstrs.length > 0) result += this.cstrs.join("\n") + "\n";
      result += "function $constr() {\n";
      var cstrsIfs = [];
      for (i = 0, l = this.cstrs.length; i < l; ++i) {
        var paramsLength = this.cstrs[i].params.params.length;
        var methodArgsPresent = !!this.cstrs[i].params.methodArgsParam;
        cstrsIfs.push("if(arguments.length " + (methodArgsPresent ? ">=" : "===") + " " + paramsLength + ") { " + "$constr_" + paramsLength + ".apply(" + selfId + ", arguments); }")
      }
      if (cstrsIfs.length > 0) result += cstrsIfs.join(" else ") + " else ";
      result += "$superCstr();\n}\n";
      result += "$constr.apply(null, arguments);\n";
      replaceContext = oldContext;
      return "(function() {\n" + "function " + className + "() {\n" + result + "}\n" + staticDefinitions + metadata + "return " + className + ";\n" + "})()"
    };
    transformClassBody = function(body, name, baseName, interfaces) {
      var declarations = body.substring(1, body.length - 1);
      declarations = extractClassesAndMethods(declarations);
      declarations = extractConstructors(declarations, name);
      var methods = [],
        classes = [],
        cstrs = [],
        functions = [];
      declarations = declarations.replace(/"([DEGH])(\d+)"/g, function(all, type, index) {
        if (type === "D") methods.push(index);
        else if (type === "E") classes.push(index);
        else if (type === "H") functions.push(index);
        else cstrs.push(index);
        return ""
      });
      var fields = declarations.replace(/^(?:\s*;)+/, "").split(/;(?:\s*;)*/g);
      var baseClassName, interfacesNames;
      var i;
      if (baseName !== undef) baseClassName = baseName.replace(/^\s*extends\s+([A-Za-z_$][\w$]*\b(?:\s*\.\s*[A-Za-z_$][\w$]*\b)*)\s*$/g, "$1");
      if (interfaces !== undef) interfacesNames = interfaces.replace(/^\s*implements\s+(.+?)\s*$/g, "$1").split(/\s*,\s*/g);
      for (i = 0; i < functions.length; ++i) functions[i] = transformFunction(atoms[functions[i]]);
      for (i = 0; i < methods.length; ++i) methods[i] = transformClassMethod(atoms[methods[i]]);
      for (i = 0; i < fields.length - 1; ++i) {
        var field = trimSpaces(fields[i]);
        fields[i] = transformClassField(field.middle)
      }
      var tail = fields.pop();
      for (i = 0; i < cstrs.length; ++i) cstrs[i] = transformConstructor(atoms[cstrs[i]]);
      for (i = 0; i < classes.length; ++i) classes[i] = transformInnerClass(atoms[classes[i]]);
      return new AstClassBody(name, baseClassName, interfacesNames, functions, methods, fields, cstrs, classes, {
        tail: tail
      })
    };

    function AstInterface(name, body) {
      this.name = name;
      this.body = body;
      body.owner = this
    }
    AstInterface.prototype.toString = function() {
      return "var " + this.name + " = " + this.body + ";\n" + "$p." + this.name + " = " + this.name + ";\n"
    };

    function AstClass(name, body) {
      this.name = name;
      this.body = body;
      body.owner = this
    }
    AstClass.prototype.toString = function() {
      return "var " + this.name + " = " + this.body + ";\n" + "$p." + this.name + " = " + this.name + ";\n"
    };

    function transformGlobalClass(class_) {
      var m = classesRegex.exec(class_);
      classesRegex.lastIndex = 0;
      var body = atoms[getAtomIndex(m[6])];
      var oldClassId = currentClassId,
        newClassId = generateClassId();
      currentClassId = newClassId;
      var globalClass;
      if (m[2] === "interface") globalClass = new AstInterface(m[3], transformInterfaceBody(body, m[3], m[4]));
      else globalClass = new AstClass(m[3], transformClassBody(body, m[3], m[4], m[5]));
      appendClass(globalClass, newClassId, oldClassId);
      currentClassId = oldClassId;
      return globalClass
    }
    function AstMethod(name, params, body) {
      this.name = name;
      this.params = params;
      this.body = body
    }
    AstMethod.prototype.toString = function() {
      var paramNames = appendToLookupTable({},
      this.params.getNames());
      var oldContext = replaceContext;
      replaceContext = function(subject) {
        return paramNames.hasOwnProperty(subject.name) ? subject.name : oldContext(subject)
      };
      var body = this.params.prependMethodArgs(this.body.toString());
      var result = "function " + this.name + this.params + " " + body + "\n" + "$p." + this.name + " = " + this.name + ";";
      replaceContext = oldContext;
      return result
    };

    function transformGlobalMethod(method) {
      var m = methodsRegex.exec(method);
      var result = methodsRegex.lastIndex = 0;
      return new AstMethod(m[3], transformParams(atoms[getAtomIndex(m[4])]), transformStatementsBlock(atoms[getAtomIndex(m[6])]))
    }
    function preStatementsTransform(statements) {
      var s = statements;
      s = s.replace(/\b(catch\s*"B\d+"\s*"A\d+")(\s*catch\s*"B\d+"\s*"A\d+")+/g, "$1");
      return s
    }
    function AstForStatement(argument, misc) {
      this.argument = argument;
      this.misc = misc
    }
    AstForStatement.prototype.toString = function() {
      return this.misc.prefix + this.argument.toString()
    };

    function AstCatchStatement(argument, misc) {
      this.argument = argument;
      this.misc = misc
    }
    AstCatchStatement.prototype.toString = function() {
      return this.misc.prefix + this.argument.toString()
    };

    function AstPrefixStatement(name, argument, misc) {
      this.name = name;
      this.argument = argument;
      this.misc = misc
    }
    AstPrefixStatement.prototype.toString = function() {
      var result = this.misc.prefix;
      if (this.argument !== undef) result += this.argument.toString();
      return result
    };

    function AstSwitchCase(expr) {
      this.expr = expr
    }
    AstSwitchCase.prototype.toString = function() {
      return "case " + this.expr + ":"
    };

    function AstLabel(label) {
      this.label = label
    }
    AstLabel.prototype.toString = function() {
      return this.label
    };
    transformStatements = function(statements, transformMethod, transformClass) {
      var nextStatement = new RegExp(/\b(catch|for|if|switch|while|with)\s*"B(\d+)"|\b(do|else|finally|return|throw|try|break|continue)\b|("[ADEH](\d+)")|\b(case)\s+([^:]+):|\b([A-Za-z_$][\w$]*\s*:)|(;)/g);
      var res = [];
      statements = preStatementsTransform(statements);
      var lastIndex = 0,
        m, space;
      while ((m = nextStatement.exec(statements)) !== null) {
        if (m[1] !== undef) {
          var i = statements.lastIndexOf('"B', nextStatement.lastIndex);
          var statementsPrefix = statements.substring(lastIndex, i);
          if (m[1] === "for") res.push(new AstForStatement(transformForExpression(atoms[m[2]]), {
            prefix: statementsPrefix
          }));
          else if (m[1] === "catch") res.push(new AstCatchStatement(transformParams(atoms[m[2]]), {
            prefix: statementsPrefix
          }));
          else res.push(new AstPrefixStatement(m[1], transformExpression(atoms[m[2]]), {
            prefix: statementsPrefix
          }))
        } else if (m[3] !== undef) res.push(new AstPrefixStatement(m[3], undef, {
          prefix: statements.substring(lastIndex, nextStatement.lastIndex)
        }));
        else if (m[4] !== undef) {
          space = statements.substring(lastIndex, nextStatement.lastIndex - m[4].length);
          if (trim(space).length !== 0) continue;
          res.push(space);
          var kind = m[4].charAt(1),
            atomIndex = m[5];
          if (kind === "D") res.push(transformMethod(atoms[atomIndex]));
          else if (kind === "E") res.push(transformClass(atoms[atomIndex]));
          else if (kind === "H") res.push(transformFunction(atoms[atomIndex]));
          else res.push(transformStatementsBlock(atoms[atomIndex]))
        } else if (m[6] !== undef) res.push(new AstSwitchCase(transformExpression(trim(m[7]))));
        else if (m[8] !== undef) {
          space = statements.substring(lastIndex, nextStatement.lastIndex - m[8].length);
          if (trim(space).length !== 0) continue;
          res.push(new AstLabel(statements.substring(lastIndex, nextStatement.lastIndex)))
        } else {
          var statement = trimSpaces(statements.substring(lastIndex, nextStatement.lastIndex - 1));
          res.push(statement.left);
          res.push(transformStatement(statement.middle));
          res.push(statement.right + ";")
        }
        lastIndex = nextStatement.lastIndex
      }
      var statementsTail = trimSpaces(statements.substring(lastIndex));
      res.push(statementsTail.left);
      if (statementsTail.middle !== "") {
        res.push(transformStatement(statementsTail.middle));
        res.push(";" + statementsTail.right)
      }
      return res
    };

    function getLocalNames(statements) {
      var localNames = [];
      for (var i = 0, l = statements.length; i < l; ++i) {
        var statement = statements[i];
        if (statement instanceof AstVar) localNames = localNames.concat(statement.getNames());
        else if (statement instanceof AstForStatement && statement.argument.initStatement instanceof AstVar) localNames = localNames.concat(statement.argument.initStatement.getNames());
        else if (statement instanceof AstInnerInterface || statement instanceof AstInnerClass || statement instanceof AstInterface || statement instanceof AstClass || statement instanceof AstMethod || statement instanceof AstFunction) localNames.push(statement.name)
      }
      return appendToLookupTable({},
      localNames)
    }
    function AstStatementsBlock(statements) {
      this.statements = statements
    }
    AstStatementsBlock.prototype.toString = function() {
      var localNames = getLocalNames(this.statements);
      var oldContext = replaceContext;
      if (!isLookupTableEmpty(localNames)) replaceContext = function(subject) {
        return localNames.hasOwnProperty(subject.name) ? subject.name : oldContext(subject)
      };
      var result = "{\n" + this.statements.join("") + "\n}";
      replaceContext = oldContext;
      return result
    };
    transformStatementsBlock = function(block) {
      var content = trimSpaces(block.substring(1, block.length - 1));
      return new AstStatementsBlock(transformStatements(content.middle))
    };

    function AstRoot(statements) {
      this.statements = statements
    }
    AstRoot.prototype.toString = function() {
      var classes = [],
        otherStatements = [],
        statement;
      for (var i = 0, len = this.statements.length; i < len; ++i) {
        statement = this.statements[i];
        if (statement instanceof AstClass || statement instanceof AstInterface) classes.push(statement);
        else otherStatements.push(statement)
      }
      sortByWeight(classes);
      var localNames = getLocalNames(this.statements);
      replaceContext = function(subject) {
        var name = subject.name;
        if (localNames.hasOwnProperty(name)) return name;
        if (globalMembers.hasOwnProperty(name) || PConstants.hasOwnProperty(name) || defaultScope.hasOwnProperty(name)) return "$p." + name;
        return name
      };
      var result = "// this code was autogenerated from PJS\n" + "(function($p) {\n" + classes.join("") + "\n" + otherStatements.join("") + "\n})";
      replaceContext = null;
      return result
    };
    transformMain = function() {
      var statements = extractClassesAndMethods(atoms[0]);
      statements = statements.replace(/\bimport\s+[^;]+;/g, "");
      return new AstRoot(transformStatements(statements, transformGlobalMethod, transformGlobalClass))
    };

    function generateMetadata(ast) {
      var globalScope = {};
      var id, class_;
      for (id in declaredClasses) if (declaredClasses.hasOwnProperty(id)) {
        class_ = declaredClasses[id];
        var scopeId = class_.scopeId,
          name = class_.name;
        if (scopeId) {
          var scope = declaredClasses[scopeId];
          class_.scope = scope;
          if (scope.inScope === undef) scope.inScope = {};
          scope.inScope[name] = class_
        } else globalScope[name] = class_
      }
      function findInScopes(class_, name) {
        var parts = name.split(".");
        var currentScope = class_.scope,
          found;
        while (currentScope) {
          if (currentScope.hasOwnProperty(parts[0])) {
            found = currentScope[parts[0]];
            break
          }
          currentScope = currentScope.scope
        }
        if (found === undef) found = globalScope[parts[0]];
        for (var i = 1, l = parts.length; i < l && found; ++i) found = found.inScope[parts[i]];
        return found
      }
      for (id in declaredClasses) if (declaredClasses.hasOwnProperty(id)) {
        class_ = declaredClasses[id];
        var baseClassName = class_.body.baseClassName;
        if (baseClassName) {
          var parent = findInScopes(class_, baseClassName);
          if (parent) {
            class_.base = parent;
            if (!parent.derived) parent.derived = [];
            parent.derived.push(class_)
          }
        }
        var interfacesNames = class_.body.interfacesNames,
          interfaces = [],
          i, l;
        if (interfacesNames && interfacesNames.length > 0) {
          for (i = 0, l = interfacesNames.length; i < l; ++i) {
            var interface_ = findInScopes(class_, interfacesNames[i]);
            interfaces.push(interface_);
            if (!interface_) continue;
            if (!interface_.derived) interface_.derived = [];
            interface_.derived.push(class_)
          }
          if (interfaces.length > 0) class_.interfaces = interfaces
        }
      }
    }
    function setWeight(ast) {
      var queue = [],
        tocheck = {};
      var id, scopeId, class_;
      for (id in declaredClasses) if (declaredClasses.hasOwnProperty(id)) {
        class_ = declaredClasses[id];
        if (!class_.inScope && !class_.derived) {
          queue.push(id);
          class_.weight = 0
        } else {
          var dependsOn = [];
          if (class_.inScope) for (scopeId in class_.inScope) if (class_.inScope.hasOwnProperty(scopeId)) dependsOn.push(class_.inScope[scopeId]);
          if (class_.derived) dependsOn = dependsOn.concat(class_.derived);
          tocheck[id] = dependsOn
        }
      }
      function removeDependentAndCheck(targetId, from) {
        var dependsOn = tocheck[targetId];
        if (!dependsOn) return false;
        var i = dependsOn.indexOf(from);
        if (i < 0) return false;
        dependsOn.splice(i, 1);
        if (dependsOn.length > 0) return false;
        delete tocheck[targetId];
        return true
      }
      while (queue.length > 0) {
        id = queue.shift();
        class_ = declaredClasses[id];
        if (class_.scopeId && removeDependentAndCheck(class_.scopeId, class_)) {
          queue.push(class_.scopeId);
          declaredClasses[class_.scopeId].weight = class_.weight + 1
        }
        if (class_.base && removeDependentAndCheck(class_.base.classId, class_)) {
          queue.push(class_.base.classId);
          class_.base.weight = class_.weight + 1
        }
        if (class_.interfaces) {
          var i, l;
          for (i = 0, l = class_.interfaces.length; i < l; ++i) {
            if (!class_.interfaces[i] || !removeDependentAndCheck(class_.interfaces[i].classId, class_)) continue;
            queue.push(class_.interfaces[i].classId);
            class_.interfaces[i].weight = class_.weight + 1
          }
        }
      }
    }
    var transformed = transformMain();
    generateMetadata(transformed);
    setWeight(transformed);
    var redendered = transformed.toString();
    redendered = redendered.replace(/\s*\n(?:[\t ]*\n)+/g, "\n\n");
    redendered = redendered.replace(/__x([0-9A-F]{4})/g, function(all, hexCode) {
      return String.fromCharCode(parseInt(hexCode, 16))
    });
    return injectStrings(redendered, strings)
  }

  function preprocessCode(aCode, sketch) {
    var dm = (new RegExp(/\/\*\s*@pjs\s+((?:[^\*]|\*+[^\*\/])*)\*\//g)).exec(aCode);
    if (dm && dm.length === 2) {
      var jsonItems = [],
        directives = dm.splice(1, 2)[0].replace(/\{([\s\S]*?)\}/g, function() {
        return function(all, item) {
          jsonItems.push(item);
          return "{" + (jsonItems.length - 1) + "}"
        }
      }()).replace("\n", "").replace("\r", "").split(";");
      var clean = function(s) {
        return s.replace(/^\s*["']?/, "").replace(/["']?\s*$/, "")
      };
      for (var i = 0, dl = directives.length; i < dl; i++) {
        var pair = directives[i].split("=");
        if (pair && pair.length === 2) {
          var key = clean(pair[0]),
            value = clean(pair[1]),
            list = [];
          if (key === "preload") {
            list = value.split(",");
            for (var j = 0, jl = list.length; j < jl; j++) {
              var imageName = clean(list[j]);
              sketch.imageCache.add(imageName)
            }
          } else if (key === "font") {
            list = value.split(",");
            for (var x = 0, xl = list.length; x < xl; x++) {
              var fontName = clean(list[x]),
                index = /^\{(\d*?)\}$/.exec(fontName);
              PFont.preloading.add(index ? JSON.parse("{" + jsonItems[index[1]] + "}") : fontName)
            }
          } else if (key === "pauseOnBlur") sketch.options.pauseOnBlur = value === "true";
          else if (key === "globalKeyEvents") sketch.options.globalKeyEvents = value === "true";
          else if (key.substring(0, 6) === "param-") sketch.params[key.substring(6)] = value;
          else sketch.options[key] = value
        }
      }
    }
    return aCode
  }
  Processing.compile = function(pdeCode) {
    var sketch = new Processing.Sketch;
    var code = preprocessCode(pdeCode, sketch);
    var compiledPde = parseProcessing(code);
    sketch.sourceCode = compiledPde;
    return sketch
  };
  var tinylogLite = function() {
    var tinylogLite = {},
      undef = "undefined",
      func = "function",
      False = !1,
      True = !0,
      logLimit = 512,
      log = "log";
    if (typeof tinylog !== undef && typeof tinylog[log] === func) tinylogLite[log] = tinylog[log];
    else if (typeof document !== undef && !document.fake)(function() {
      var doc = document,
        $div = "div",
        $style = "style",
        $title = "title",
        containerStyles = {
        zIndex: 1E4,
        position: "fixed",
        bottom: "0px",
        width: "100%",
        height: "15%",
        fontFamily: "sans-serif",
        color: "#ccc",
        backgroundColor: "black"
      },
        outputStyles = {
        position: "relative",
        fontFamily: "monospace",
        overflow: "auto",
        height: "100%",
        paddingTop: "5px"
      },
        resizerStyles = {
        height: "5px",
        marginTop: "-5px",
        cursor: "n-resize",
        backgroundColor: "darkgrey"
      },
        closeButtonStyles = {
        position: "absolute",
        top: "5px",
        right: "20px",
        color: "#111",
        MozBorderRadius: "4px",
        webkitBorderRadius: "4px",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "normal",
        textAlign: "center",
        padding: "3px 5px",
        backgroundColor: "#333",
        fontSize: "12px"
      },
        entryStyles = {
        minHeight: "16px"
      },
        entryTextStyles = {
        fontSize: "12px",
        margin: "0 8px 0 8px",
        maxWidth: "100%",
        whiteSpace: "pre-wrap",
        overflow: "auto"
      },
        view = doc.defaultView,
        docElem = doc.documentElement,
        docElemStyle = docElem[$style],
        setStyles = function() {
        var i = arguments.length,
          elemStyle, styles, style;
        while (i--) {
          styles = arguments[i--];
          elemStyle = arguments[i][$style];
          for (style in styles) if (styles.hasOwnProperty(style)) elemStyle[style] = styles[style]
        }
      },
        observer = function(obj, event, handler) {
        if (obj.addEventListener) obj.addEventListener(event, handler, False);
        else if (obj.attachEvent) obj.attachEvent("on" + event, handler);
        return [obj, event, handler]
      },
        unobserve = function(obj, event, handler) {
        if (obj.removeEventListener) obj.removeEventListener(event, handler, False);
        else if (obj.detachEvent) obj.detachEvent("on" + event, handler)
      },
        clearChildren = function(node) {
        var children = node.childNodes,
          child = children.length;
        while (child--) node.removeChild(children.item(0))
      },
        append = function(to, elem) {
        return to.appendChild(elem)
      },
        createElement = function(localName) {
        return doc.createElement(localName)
      },
        createTextNode = function(text) {
        return doc.createTextNode(text)
      },
        createLog = tinylogLite[log] = function(message) {
        var uninit, originalPadding = docElemStyle.paddingBottom,
          container = createElement($div),
          containerStyle = container[$style],
          resizer = append(container, createElement($div)),
          output = append(container, createElement($div)),
          closeButton = append(container, createElement($div)),
          resizingLog = False,
          previousHeight = False,
          previousScrollTop = False,
          messages = 0,
          updateSafetyMargin = function() {
          docElemStyle.paddingBottom = container.clientHeight + "px"
        },
          setContainerHeight = function(height) {
          var viewHeight = view.innerHeight,
            resizerHeight = resizer.clientHeight;
          if (height < 0) height = 0;
          else if (height + resizerHeight > viewHeight) height = viewHeight - resizerHeight;
          containerStyle.height = height / viewHeight * 100 + "%";
          updateSafetyMargin()
        },
          observers = [observer(doc, "mousemove", function(evt) {
          if (resizingLog) {
            setContainerHeight(view.innerHeight - evt.clientY);
            output.scrollTop = previousScrollTop
          }
        }), observer(doc, "mouseup", function() {
          if (resizingLog) resizingLog = previousScrollTop = False
        }), observer(resizer, "dblclick", function(evt) {
          evt.preventDefault();
          if (previousHeight) {
            setContainerHeight(previousHeight);
            previousHeight = False
          } else {
            previousHeight = container.clientHeight;
            containerStyle.height = "0px"
          }
        }), observer(resizer, "mousedown", function(evt) {
          evt.preventDefault();
          resizingLog = True;
          previousScrollTop = output.scrollTop
        }), observer(resizer, "contextmenu", function() {
          resizingLog = False
        }), observer(closeButton, "click", function() {
          uninit()
        })];
        uninit = function() {
          var i = observers.length;
          while (i--) unobserve.apply(tinylogLite, observers[i]);
          docElem.removeChild(container);
          docElemStyle.paddingBottom = originalPadding;
          clearChildren(output);
          clearChildren(container);
          tinylogLite[log] = createLog
        };
        setStyles(container, containerStyles, output, outputStyles, resizer, resizerStyles, closeButton, closeButtonStyles);
        closeButton[$title] = "Close Log";
        append(closeButton, createTextNode("\u2716"));
        resizer[$title] = "Double-click to toggle log minimization";
        docElem.insertBefore(container, docElem.firstChild);
        tinylogLite[log] = function(message) {
          if (messages === logLimit) output.removeChild(output.firstChild);
          else messages++;
          var entry = append(output, createElement($div)),
            entryText = append(entry, createElement($div));
          entry[$title] = (new Date).toLocaleTimeString();
          setStyles(entry, entryStyles, entryText, entryTextStyles);
          append(entryText, createTextNode(message));
          output.scrollTop = output.scrollHeight
        };
        tinylogLite[log](message);
        updateSafetyMargin()
      }
    })();
    else if (typeof print === func) tinylogLite[log] = print;
    return tinylogLite
  }();
  Processing.logger = tinylogLite;
  Processing.version = "1.4.1";
  Processing.lib = {};
  Processing.registerLibrary = function(name, desc) {
    Processing.lib[name] = desc;
    if (desc.hasOwnProperty("init")) desc.init(defaultScope)
  };
  Processing.instances = processingInstances;
  Processing.getInstanceById = function(name) {
    return processingInstances[processingInstanceIds[name]]
  };
  Processing.Sketch = function(attachFunction) {
    this.attachFunction = attachFunction;
    this.options = {
      pauseOnBlur: false,
      globalKeyEvents: false
    };
    this.onLoad = nop;
    this.onSetup = nop;
    this.onPause = nop;
    this.onLoop = nop;
    this.onFrameStart = nop;
    this.onFrameEnd = nop;
    this.onExit = nop;
    this.params = {};
    this.imageCache = {
      pending: 0,
      images: {},
      operaCache: {},
      add: function(href, img) {
        if (this.images[href]) return;
        if (!isDOMPresent) this.images[href] = null;
        if (!img) {
          img = new Image;
          img.onload = function(owner) {
            return function() {
              owner.pending--
            }
          }(this);
          this.pending++;
          img.src = href
        }
        this.images[href] = img;
        if (window.opera) {
          var div = document.createElement("div");
          div.appendChild(img);
          div.style.position = "absolute";
          div.style.opacity = 0;
          div.style.width = "1px";
          div.style.height = "1px";
          if (!this.operaCache[href]) {
            document.body.appendChild(div);
            this.operaCache[href] = div
          }
        }
      }
    };
    this.sourceCode = undefined;
    this.attach = function(processing) {
      if (typeof this.attachFunction === "function") this.attachFunction(processing);
      else if (this.sourceCode) {
        var func = (new Function("return (" + this.sourceCode + ");"))();
        func(processing);
        this.attachFunction = func
      } else throw "Unable to attach sketch to the processing instance";
    };
    this.toString = function() {
      var i;
      var code = "((function(Sketch) {\n";
      code += "var sketch = new Sketch(\n" + this.sourceCode + ");\n";
      for (i in this.options) if (this.options.hasOwnProperty(i)) {
        var value = this.options[i];
        code += "sketch.options." + i + " = " + (typeof value === "string" ? '"' + value + '"' : "" + value) + ";\n"
      }
      for (i in this.imageCache) if (this.options.hasOwnProperty(i)) code += 'sketch.imageCache.add("' + i + '");\n';
      code += "return sketch;\n})(Processing.Sketch))";
      return code
    }
  };
  var loadSketchFromSources = function(canvas, sources) {
    var code = [],
      errors = [],
      sourcesCount = sources.length,
      loaded = 0;

    function ajaxAsync(url, callback) {
      var xhr = new XMLHttpRequest;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          var error;
          if (xhr.status !== 200 && xhr.status !== 0) error = "Invalid XHR status " + xhr.status;
          else if (xhr.responseText === "") if ("withCredentials" in new XMLHttpRequest && (new XMLHttpRequest).withCredentials === false && window.location.protocol === "file:") error = "XMLHttpRequest failure, possibly due to a same-origin policy violation. You can try loading this page in another browser, or load it from http://localhost using a local webserver. See the Processing.js README for a more detailed explanation of this problem and solutions.";
          else error = "File is empty.";
          callback(xhr.responseText, error)
        }
      };
      xhr.open("GET", url, true);
      if (xhr.overrideMimeType) xhr.overrideMimeType("application/json");
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
      xhr.send(null)
    }
    function loadBlock(index, filename) {
      function callback(block, error) {
        code[index] = block;
        ++loaded;
        if (error) errors.push(filename + " ==> " + error);
        if (loaded === sourcesCount) if (errors.length === 0) try {
          return new Processing(canvas, code.join("\n"))
        } catch(e) {
          throw "Processing.js: Unable to execute pjs sketch: " + e;
        } else throw "Processing.js: Unable to load pjs sketch files: " + errors.join("\n");
      }
      if (filename.charAt(0) === "#") {
        var scriptElement = document.getElementById(filename.substring(1));
        if (scriptElement) callback(scriptElement.text || scriptElement.textContent);
        else callback("", "Unable to load pjs sketch: element with id '" + filename.substring(1) + "' was not found");
        return
      }
      ajaxAsync(filename, callback)
    }
    for (var i = 0; i < sourcesCount; ++i) loadBlock(i, sources[i])
  };
  var init = function() {
    document.removeEventListener("DOMContentLoaded", init, false);
    processingInstances = [];
    var canvas = document.getElementsByTagName("canvas"),
      filenames;
    for (var i = 0, l = canvas.length; i < l; i++) {
      var processingSources = canvas[i].getAttribute("data-processing-sources");
      if (processingSources === null) {
        processingSources = canvas[i].getAttribute("data-src");
        if (processingSources === null) processingSources = canvas[i].getAttribute("datasrc")
      }
      if (processingSources) {
        filenames = processingSources.split(/\s+/g);
        for (var j = 0; j < filenames.length;) if (filenames[j]) j++;
        else filenames.splice(j, 1);
        loadSketchFromSources(canvas[i], filenames)
      }
    }
    var s, last, source, instance, nodelist = document.getElementsByTagName("script"),
      scripts = [];
    for (s = nodelist.length - 1; s >= 0; s--) scripts.push(nodelist[s]);
    for (s = 0, last = scripts.length; s < last; s++) {
      var script = scripts[s];
      if (!script.getAttribute) continue;
      var type = script.getAttribute("type");
      if (type && (type.toLowerCase() === "text/processing" || type.toLowerCase() === "application/processing")) {
        var target = script.getAttribute("data-processing-target");
        canvas = undef;
        if (target) canvas = document.getElementById(target);
        else {
          var nextSibling = script.nextSibling;
          while (nextSibling && nextSibling.nodeType !== 1) nextSibling = nextSibling.nextSibling;
          if (nextSibling && nextSibling.nodeName.toLowerCase() === "canvas") canvas = nextSibling
        }
        if (canvas) {
          if (script.getAttribute("src")) {
            filenames = script.getAttribute("src").split(/\s+/);
            loadSketchFromSources(canvas, filenames);
            continue
          }
          source = script.textContent || script.text;
          instance = new Processing(canvas, source)
        }
      }
    }
  };
  Processing.reload = function() {
    if (processingInstances.length > 0) for (var i = processingInstances.length - 1; i >= 0; i--) if (processingInstances[i]) processingInstances[i].exit();
    init()
  };
  Processing.loadSketchFromSources = loadSketchFromSources;
  Processing.disableInit = function() {
    if (isDOMPresent) document.removeEventListener("DOMContentLoaded", init, false)
  };
  if (isDOMPresent) {
    window["Processing"] = Processing;
    document.addEventListener("DOMContentLoaded", init, false)
  } else this.Processing = Processing
})(window, window.document, Math);


/*end processing-1.4.1.js*/

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
	var wb = {
		scriptModified: true
	};

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
        input.style.width = (textbox.width*0.7 + 25) + 'px';
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
    var startSibling;
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
    var dragAction = {};
    var templateDrag, localDrag;

    var _dropCursor;

    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.dropCursor');
        }
        return _dropCursor;
    }

    function reset(){
        // console.log('reset dragTarget to null');
        dragTarget = null;
        dragAction = {undo: undoDrag, redo: redoDrag};
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        dragging = false;
        cloned = false;
        scope = null;
        templateDrag = false;
        localDrag = false;
    }
    reset();



    function initDrag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        var eT = event.wbTarget;
        //Check whther the original target was an input ....
        if (wb.matches(event.target, 'input, select, option, .disclosure, .contained')  && !wb.matches(eT, '#block_menu *')) {
            // console.log('not a drag handle');
            return undefined;
        }
        // console.log('initDrag');
        var target = wb.closest(eT, '.block');
        if (target){
            if (wb.matches(target, '.scripts_workspace')){
                // don't start drag on workspace block
                return undefined;
            }
            // console.log('got a drag target: %o', target);
            dragTarget = target;
            if (target.parentElement.classList.contains('block-menu')){
                target.dataset.isTemplateBlock = 'true';
                templateDrag = true;
            }
        	dragAction.target = target;
            if (target.parentElement.classList.contains('locals')){
                target.dataset.isLocal = 'true';
                localDrag = true;
            }
            //dragTarget.classList.add("dragIndication");
            startPosition = wb.rect(target);
            if (! wb.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            startSibling = target.nextElementSibling;
            if(startSibling && !wb.matches(startSibling, '.block')) {
            	// Sometimes the "next sibling" ends up being the cursor
            	startSibling = startSibling.nextElementSibling;
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
        // if (wb.matches(dragTarget, '.expression')){
        //     wb.hide(dropCursor());
        // }
        dragTarget.classList.add("dragIndication");
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
		// Track source for undo/redo
		dragAction.target = dragTarget;
		dragAction.fromParent = startParent;
		dragAction.fromBefore = startSibling;
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
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
            Event.trigger(dragTarget, 'wb-remove');
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
        if (cloned){
            // call this here so it can bubble to document.body
            Event.trigger(dragTarget, 'wb-clone');
        }
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
        // Scoll workspace as needed
        if (workspace){
            var container = workspace.parentElement;
            var offset = wb.rect(container);
            // console.log('scrollTop: %s, scrollHeight: %s', container.scrollTop, container.scrollHeight);
            // console.log('top: %s, bottom: %s', currPos.top, currPos.bottom);
            // console.log('offset top: %s, offset bottom: %s', offset.top, offset.bottom);
            if (currPos.top < offset.top){
                container.scrollTop -= Math.min(container.scrollTop, offset.top - currPos.top);
            }else if (currPos.bottom > offset.bottom){
                var maxVerticalScroll = container.scrollHeight - offset.height - container.scrollTop;
                container.scrollTop += Math.min(maxVerticalScroll, currPos.bottom - offset.bottom);
            }
            // console.log('scrollLeft: %s, scrollWidth: %s', container.scrollLeft, container.scrollWidth);
            // console.log('left: %s, right: %s', currPos.left, currPos.right);
            // console.log('offset left: %s, offset right: %s', offset.left, offset.width);
            if (currPos.left < offset.left){
                container.scrollLeft -= Math.min(container.scrollLeft, offset.left - currPos.left);
            }else if(currPos.right > offset.right){
                var maxHorizontalScroll = container.scrollWidth - offset.width - container.scrollLeft;
                // console.log('maxHorizontalScroll: %s', maxHorizontalScroll);
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
        resetDragStyles();
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
    		Event.trigger(this.target, 'wb-remove');
    		this.target.remove();
    	}
    	if(this.fromParent != null) {
    		// Put back the removed block
    		this.target.removeAttribute('style');
    		if(wb.matches(this.target,'.step')) {
    			this.fromParent.insertBefore(this.target, this.fromBefore);
    		} else {
    			this.fromParent.appendChild(this.target);
    		}
			Event.trigger(this.target, 'wb-add');
    	}
    }
    
    function redoDrag() {
    	if(this.toParent != null) {
    		if(wb.matches(this.target,'.step')) {
    			this.toParent.insertBefore(this.target, this.toBefore);
    		} else {
    			this.toParent.appendChild(this.target);
    		}
			Event.trigger(this.target, 'wb-add');
    	}
    	if(this.fromParent != null) {
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
		evt.preventDefault();
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
		if (wb.view === 'result'){
			// console.log('run script because we are awesome');
			// window.addEventListener('load', function(){
			// 	// console.log('in window load, starting script: %s', !!wb.runCurrentScripts);
			// 	wb.runCurrentScripts();
			// }, false);
		// }else{
		// 	console.log('do not run script for some odd reason: %s', wb.view);
		}
		// clear undo/redo stack
		wb.scriptLoaded = true;
		// console.log('script loaded');
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
		// console.log('window loaded');
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

/*begin languages/processingjs/processingjs.js*/
/*
 *    PROCESSINGJS PLUGIN
 *
 *    Support for writing ProcessingJS using Waterbear
 *
 */

(function(wb, Event){

    // Add some utilities
    wb.wrap = function(script){
        return [
            'var canvas = document.createElement("canvas");',
            'document.querySelector(".stage").appendChild(canvas);',
            'var processing = new Processing(canvas,',
                Processing.compile(script).sourceCode,
            ');'
        ].join('\n');
    }

    function runCurrentScripts(){
        // console.log('runCurrentScripts');
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        wb.runScript( wb.prettyScript(blocks) );
    }
    wb.runCurrentScripts = runCurrentScripts;

    window.addEventListener('load', function(event){
        console.log('iframe ready');
        wb.iframeready = true;
        if (wb.iframewaiting){
            wb.iframewaiting();
        }
        wb.iframewaiting = null;
    }, false);

    wb.runScript = function(script){
        var run = function(){
            wb.script = script;
            // console.log(wb.wrap(script));
            var path = location.pathname.slice(0,location.pathname.lastIndexOf('/'));
            var runtimeUrl = location.protocol + '//' + location.host + path + '/dist/processingjs_runtime.js';
            // console.log('trying to load library %s from outer window', runtimeUrl);
            document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: runtimeUrl, script: wb.wrap(script)}), '*');
            document.querySelector('.stageframe').focus();
        };
        if (wb.iframeready){
            run();
        }else{
            wb.iframewaiting = run;
        }
    }

    Event.on('.run-scripts', 'click', null, function(){
        wb.historySwitchState('result');
    });



    function clearStage(event){
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
    }
    Event.on('.clear_canvas', 'click', null, clearStage);
    Event.on('.editScript', 'click', null, clearStage);


    wb.prettyScript = function(elements){
        return js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join(''));
    };

    wb.writeScript = function(elements, view){
        view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
        hljs.highlightBlock(view.firstChild);
    };

    //<script type="text/processing" data-processing-target="processing-canvas">
    //void setup() {
    //  size(200, 200);
    //  background(100);
    //  stroke(255);
    //  ellipse(50, 50, 25, 25);
    //  println('hello web!');
    //}
    //</script>
    //<canvas id="processing-canvas"> </canvas>

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

    Event.on('.socket input', 'click', null, function(event){
        event.wbTarget.focus();
        event.wbTarget.select();
    });

})(wb, Event);
/*end languages/processingjs/processingjs.js*/

/*begin languages/processingjs/colors.js*/
// expose these globally so the Block/Label methods can find them
wb.choiceLists.mode = ['RGB', 'HSB'];

/*end languages/processingjs/colors.js*/

/*begin languages/processingjs/math.js*/

/*end languages/processingjs/math.js*/

/*begin languages/processingjs/structure.json*/
wb.menu({
    "name": "Structure",
    "blocks": [
        {
            "blocktype": "eventhandler",
            "id": "1cf8132a-4996-45db-b482-4e3302003c1",
            "script": "void setup(){[[1]]}",
            "help": "Setup the Processing Canvas",
            "sockets": [
                {
                    "name": "setup"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1cf8132a-4996-45db-b482-4336198e3ca",
            "script": "void draw(){[[1]]}",
            "help": "Main draw loop",
            "sockets": [
                {
                    "name": "draw"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "71eb3271-6dc0-4a82-81cc-4c50d2ac19e7",
            "script": "size({{1}}, {{2}});",
            "help": "Set canvas size",
            "sockets": [
                {
                    "name": "size X",
                    "type": "number",
                    "value": "800"
                },
                {
                    "name": "Y",
                    "type": "number",
                    "value": "500"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "06723171-6d20-4a32-814c-2c50d8wcb9e7",
            "script": "noLoop();",
            "help": "Stops Processing from continuously executing the code within draw()",
            "sockets": [
                {
                    "name": "noLoop"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "06723171-6d20-4a32-814c-225038w4b9e7",
            "script": "loop();",
            "help": "Causes Processing to continuously execute the code within draw()",
            "sockets": [
                {
                    "name": "loop"
                }
            ]
        }
    ]
}

);
/*end languages/processingjs/structure.json*/

/*begin languages/processingjs/environment.json*/
wb.menu({
    "name": "Environment",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "da2c8203-bf80-4647-a762-928d477b5a27",
            "script": "height",
            "type": "number",
            "help": "System variable which stores the height of the display window",
            "sockets": [
                {
                    "name": "height"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "nadc82i3-bf70-4617-a732-920d497b5a27",
            "script": "width",
            "type": "number",
            "help": "System variable which stores the width of the display window",
            "sockets": [
                {
                    "name": "width"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "25pc82i3-bf70-4617-a732-920c4n7bya2",
            "script": "frameCount",
            "type": "number",
            "help": "The system variable frameCount contains the number of frames displayed since the program started",
            "sockets": [
                {
                    "name": "frame count"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "71eb3271-6de0-4122-82cc-4c5077ac19e7",
            "script": "frameRate({{1}});",
            "help": "Set frame rate",
            "sockets": [
                {
                    "name": "frame rate",
                    "type": "number",
                    "value": "60"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "916c79df-40f1-4280-a0p3-6d0df954d87e",
            "script": "alert(\"{{1}} value =\"+ {{1}});",
            "help": "Alert the user some information",
            "sockets": [
                {
                    "name": "print",
                    "type": "any",
                    "value": null
                }
            ]
        }
    ]
}

);
/*end languages/processingjs/environment.json*/

/*begin languages/processingjs/controls.json*/
wb.menu({
    "name": "Control",
    "blocks": [
        {
            "blocktype": "step",
            "id": "079b2b89-41c2-4d00-8n21-rcf62146960",
            "script": "int variable## = {{1}};",
            "locals": [
                {
                    "blocktype": "expression",
                    "script": "variable##",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "variable##"
                        }
                    ]
                }
            ],
            "help": "Create a integer variable reference to re-use",
            "sockets": [
                {
                    "name": "int variable value",
                    "type": "number",
                    "value": 0
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "079b2b89-41c2-4d00-8e21-bcd62f4bm90",
            "script": "char variable## = {{1}};",
            "locals": [
                {
                    "blocktype": "expression",
                    "script": "variable##",
                    "type": "string",
                    "sockets": [
                        {
                            "name": "variable##"
                        }
                    ]
                }
            ],
            "help": "Create a char variable reference to re-use",
            "sockets": [
                {
                    "name": "char variable value",
                    "type": "string",
                    "value": "string"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b4036693-8645-4852-a4de-9e96565f92ec",
            "script": "{{1}} = {{2}};",
            "help": "First argument must be a variable",
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
            "id": "9AED48C9-A90B-49FB-9C1A-FD632F0313F5",
            "script": "{{1}} += {{2}};",
            "help": "First argument must be a variable",
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
            "blocktype": "expression",
            "id": "9AED48C9-A90B-49FB-9C1b-3r63eFs313F",
            "script": "{{1}} += {{2}};",
            "type": "number",
            "help": "First argument must be a variable",
            "sockets": [
                {
                    "name": "update variable",
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
            "id": "20ba3e08-74c0-42de-b6f2-938409e63ce0",
            "script": "if({{1}}){[[2]]}",
            "help": "Allows the program to make a decision about which code to execute",
            "sockets": [
                {
                    "name": "if",
                    "type": "any",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "l0k23e48-74cp-420e-b6m2-n379po6lce0",
            "script": "else {[[2]]}",
            "help": "It specifies a block of code to execute when the expression in if() is false",
            "sockets": [
                {
                    "name": "else"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "l0k23e48-74n0-42ge-b61h-cjk456x3ce0",
            "script": "else if({{1}}){[[2]]}",
            "help": "It specifies a block of code to execute when the expression in if() is false",
            "sockets": [
                {
                    "name": "else if",
                    "type": "any",
                    "value": null
                }
            ]
        },

        {
            "blocktype": "context",
            "id": "1cf8132a-4996-45db-b482-4lkshre13c1",
            "script": "for( {{1}}; {{2}}; {{3}}) { [[4]] }",
            "help": "Controls a sequence of repetitions",
            "sockets": [
                {
                    "name": "for init",
                    "type": "any",
                    "value": null
                },
                {
                    "name": "test",
                    "type": "any",
                    "value": null
                },
                {
                    "name": "update",
                    "type": "any",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "1cf8132a-49y6-455b-b432-3posh2e13c1",
            "script": "while( {{1}} ) { [[2]] }",
            "help": "Controls a sequence of repetitions",
            "sockets": [
                {
                    "name": "while",
                    "type": "any",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e3a5ea20-3ca9-42cf-ac02-77ff32836a7e",
            "type": "boolean",
            "script": "({{1}} == {{2}})",
            "help": "Determines if two values are equivalent",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "==",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "d753757b-a7d4-4d84-99f1-cb9b567e62da",
            "type": "boolean",
            "script": "({{1}} < {{2}})",
            "help": "Tests if the value on the left is smaller than the value on the right",
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
            "id": "d753757b-a7d4-4d84-99f1-cb9bou7e62da",
            "type": "boolean",
            "script": "({{1}} <= {{2}})",
            "help": "Tests if the value on the left is less than the value on the right or if the values are equivalent",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "<=",
                    "type": "number",
                    "value": "0"
                }
            ]
        },        {
            "blocktype": "expression",
            "id": "5a1f5f68-d74b-4154-b376-6a0209f585ed",
            "type": "boolean",
            "script": "({{1}} > {{2}})",
            "help": "Tests if the value on the left is larger than the value on the right",
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
            "id": "5a1f5f58-d76b-4184-b376-5a32rff585ed",
            "type": "boolean",
            "script": "({{1}} >= {{2}})",
            "help": "Tests if the value on the left is larger than the value on the right or if the values are equivalent",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": ">=",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5a1f5f58-d76b-4184-b376-098245f4854d",
            "type": "boolean",
            "script": "({{1}} != {{2}})",
            "help": "Determines if one expression is not equivalent to another",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "!=",
                    "type": "number",
                    "value": "0"
                }
            ]
        }
    ]
}

);
/*end languages/processingjs/controls.json*/

/*begin languages/processingjs/shapes.json*/
wb.menu({
    "name": "Shape",
    "blocks": [
        {
            "blocktype": "step",
            "id": "71eb32s1-6cc0-4322-82sc-mh50di3jns2",
            "script": "strokeWeight({{1}});",
            "help": "Draws a point, a coordinate in space at the dimension of one pixel",
            "sockets": [
                {
                    "name": "stroke weight",
                    "type": "number",
                    "value": "12"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "71eb32s1-6cc0-4322-82sc-4c50779c57e7",
            "script": "point({{1}}, {{2}});",
            "help": "Draws a point, a coordinate in space at the dimension of one pixel",
            "sockets": [
                {
                    "name": "point x",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "20"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "71e73171-6dc0-4122-82cc-4253748618e0",
            "script": "line({{1}}, {{2}}, {{3}}, {{4}});",
            "help": "Draws a line (a direct path between two points)",
            "sockets": [
                {
                    "name": "line x1",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "y1",
                    "type": "number",
                    "value": "20"
                },
                {
                    "name": "x2",
                    "type": "number",
                    "value": "85"
                },
                {
                    "name": "y2",
                    "type": "number",
                    "value": "20"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "82eb3271-6dc0-4a82-81cc-4cf0d94c11e7",
            "script": "ellipse({{1}}, {{2}}, {{3}}, {{4}});",
            "help": "Create ellipse",
            "sockets": [
                {
                    "name": "ellipse X",
                    "type": "number",
                    "value": "200"
                },
                {
                    "name": "Y",
                    "type": "number",
                    "value": "200"
                },
                {
                    "name": "radius",
                    "type": "number",
                    "value": "200"
                },
                {
                    "name": "radius",
                    "type": "number",
                    "value": "200"
                }

            ]
        },
       {
            "blocktype": "step",
            "id": "715e83281-6c20-4362-824c-4c5277ac19ez",
            "script": "rect({{1}}, {{2}}, {{3}}, {{4}});",
            "help": "Draws a rectangle",
            "sockets": [
                {
                    "name": "rect x",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "20"
                },
                {
                    "name": "width",
                    "type": "number",
                    "value": "20"
                },
                {
                    "name": "height",
                    "type": "number",
                    "value": "20"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "018e83781-2c40-4162-824c-09ijek3os91",
            "script": "triangle({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}});",
            "help": "A triangle is a plane created by connecting three points",
            "sockets": [
                {
                    "name": "triangle x1",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "y1",
                    "type": "number",
                    "value": "75"
                },
                {
                    "name": "x2",
                    "type": "number",
                    "value": "58"
                },
                {
                    "name": "y2",
                    "type": "number",
                    "value": "20"
                },
                {
                    "name": "x3",
                    "type": "number",
                    "value": "86"
                },
                {
                    "name": "y3",
                    "type": "number",
                    "value": "75"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "91e73171-6ec0-4122-82cc-4c5074axc0e7",
            "script": "quad({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}}, {{7}}, {{8}});",
            "help": "A quad is a quadrilateral, a four sided polygon",
            "sockets": [
                {
                    "name": "quad x1",
                    "type": "number",
                    "value": "38"
                },
                {
                    "name": "y1",
                    "type": "number",
                    "value": "31"
                },
                {
                    "name": "x2",
                    "type": "number",
                    "value": "86"
                },
                {
                    "name": "y2",
                    "type": "number",
                    "value": "20"
                },
                {
                    "name": "x3",
                    "type": "number",
                    "value": "69"
                },
                {
                    "name": "y3",
                    "type": "number",
                    "value": "63"
                },
                {
                    "name": "x4",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "y4",
                    "type": "number",
                    "value": "76"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "018e83781-2c40-4162-824c-4c5277ac19e7",
            "script": "arc({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}});",
            "help": "Draws an arc",
            "sockets": [
                {
                    "name": "arc x",
                    "type": "number",
                    "value": "50"
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": "55"
                },
                {
                    "name": "width",
                    "type": "number",
                    "value": "50"
                },
                {
                    "name": "height",
                    "type": "number",
                    "value": "50"
                },
                {
                    "name": "start",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "stop",
                    "type": "number",
                    "value": "PI/2"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "018e83781-2c40-4g62-820c-4852p7ak19e7",
            "script": "bezier({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}}, {{7}}, {{8}});",
            "help": "Draws a Bezier curve",
            "sockets": [
                {
                    "name": "bezier x1",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "y1",
                    "type": "number",
                    "value": "20"
                },
                {
                    "name": "cx1",
                    "type": "number",
                    "value": "80"
                },
                {
                    "name": "cy1",
                    "type": "number",
                    "value": "5"
                },
                {
                    "name": "cx2",
                    "type": "number",
                    "value": "80"
                },
                {
                    "name": "cy2",
                    "type": "number",
                    "value": "75"
                },
                {
                    "name": "x2",
                    "type": "number",
                    "value": "30"
                },
                {
                    "name": "y2",
                    "type": "number",
                    "value": "75"
                }
            ]
        }
    ]
}

);
/*end languages/processingjs/shapes.json*/

/*begin languages/processingjs/input.json*/
wb.menu({
    "name": "Input",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "01124271-6dc0-4j82-81kc-4si0i88c3907",
            "script": "mouseButton",
            "type": "boolean",
            "help": "Tracks if the mouse button is pressed and which button is pressed",
            "sockets": [
                {
                    "name": "mouse button"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "01124271-6dc0-4482-813c-4320331c3f07",
            "script": "mousePressed",
            "type": "boolean",
            "help": "Variable storing if a mouse button is pressed",
            "sockets": [
                {
                    "name": "mousePressed"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "01124271-6dc0-4a82-81cc-4050308c3907",
            "script": "mouseX",
            "type": "number",
            "help": "Contains the current horizontal coordinate of the mouse",
            "sockets": [
                {
                    "name": "mouseX"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "01124271-6dc0-4a82-81cc-47h737lc39p7",
            "script": "mouseY",
            "type": "number",
            "help": "Contains the current vertical coordinate of the mouse",
            "sockets": [
                {
                    "name": "mouseY"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "11134251-6dc0-4a82-81cc-4s5938893997",
            "script": "pmouseX",
            "type": "number",
            "help": "Contains the previous horizontal coordinate of the mouse",
            "sockets": [
                {
                    "name": "pmouseX"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "21124231-64c0-4a82-81cc-9s50358c3508",
            "script": "pmouseY",
            "type": "number",
            "help": "Contains the previous vertical coordinate of the mouse",
            "sockets": [
                {
                    "name": "pmouseY"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1c4813ra-4v96-45ds-ee82-3e132200e3c8",
            "script": "void mouseClicked(){[[1]]}",
            "help": "Called once after a mouse button has been pressed and then released",
            "sockets": [
                {
                    "name": "mouse clicked"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1c4813ra-4v96-45ds-ee82-6e6372048340",
            "script": "void mouseDragged(){[[1]]}",
            "help": "Called once every time the mouse moves and a mouse button is pressed",
            "sockets": [
                {
                    "name": "mouse dragged"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1248334a-4v56-453s-ee82-4e654203e32a",
            "script": "void mouseMoved(){[[1]]}",
            "help": "Called every time the mouse moves and a mouse button is not pressed",
            "sockets": [
                {
                    "name": "mouse moved"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1244384a-4v86-473s-e582-34135207e38a",
            "script": "void mouseOut(){[[1]]}",
            "help": "Called when the mouse pointer leaves a sketch",
            "sockets": [
                {
                    "name": "mouse out"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1244384a-4v86-473s-e582-0e939e44s34x",
            "script": "void mouseOver(){[[1]]}",
            "help": "Called when the mouse pointer moves over the sketch",
            "sockets": [
                {
                    "name": "mouse over"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1244384a-4v86-473s-e582-t9r62ei934a",
            "script": "void mousePressed(){[[1]]}",
            "help": "Called once after every time a mouse button is pressed",
            "sockets": [
                {
                    "name": "mouse pressed"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1244384a-4v86-473s-e582-2e2634id39a",
            "script": "void mouseReleased(){[[1]]}",
            "help": "Called every time a mouse button is released",
            "sockets": [
                {
                    "name": "mouse released"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "01124271-6dc0-4a82-81cc-4swb3a8v39e7",
            "script": "key",
            "type": "string",
            "help": "Contains the value of the most recently pressed key on the keyboard",
            "sockets": [
                {
                    "name": "key"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "81926274-63cn-4d82-e1cc-4s533a8v39e7",
            "script": "keyCode",
            "type": "number",
            "help": "Used to detect special keys ",
            "sockets": [
                {
                    "name": "key code"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8192ib74-63an-4de2-e1gc-4m5b3l8vcpe0",
            "script": "keyPressed",
            "type": "boolean",
            "help": "True if any key is pressed and false if no keys are pressed",
            "sockets": [
                {
                    "name": "key pressed"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1j4538ja-4vf6-473s-er82-2r2f31ids9a",
            "script": "void keyPressed(){[[1]]}",
            "help": "Called once every time a key is pressed",
            "sockets": [
                {
                    "name": "key pressed"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1s45h8ja-4vf6-473s-er82-9rkf3pidsgi",
            "script": "void keyReleased(){[[1]]}",
            "help": "Called once every time a key is released",
            "sockets": [
                {
                    "name": "key released"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1s45h8ja-4vf6-473s-er82-2r2fd5igsg9p",
            "script": "void keyTyped(){[[1]]}",
            "help": "Called once every time a key is pressed",
            "sockets": [
                {
                    "name": "key typed"
                }
            ]
        }
    ]
}

);
/*end languages/processingjs/input.json*/

/*begin languages/processingjs/colors.json*/
wb.menu({
    "name": "Colors",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "da9a266b-8ec0-4b97-bd79-b8pc0s4996f",
            "type": "color",
            "script": "color(random(0,255), random(0,255), random(0,255), random(0,255))",
            "help": "Returns a random RBG color",
            "sockets": [
                {
                    "name": "random color"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "01123271-3dc0-6a82-01cc-mc50dlwcb9e7",
            "script": "background(color({{1}}));",
            "help": "Set background color",
            "sockets": [
                {
                    "name": "background color",
                    "type": "color",
                    "value": "#0000000"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "21543271-6dc0-4a82-818c-4556d712b90",
            "script": "fill(color({{1}}));",
            "help": "Sets the color used to fill shapes",
            "sockets": [
                {
                    "name": "fill color",
                    "type": "color",
                    "value": "#0000000"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "01983271-6dc0-wa82-81cc-4c50d88cb0e",
            "script": "stroke(color({{1}}));",
            "help": "Sets the color used to draw lines and borders around shapes",
            "sockets": [
                {
                    "name": "stroke color",
                    "type": "color",
                    "value": "#0000000"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "06723171-6d20-4a32-814c-2c50d92b29ew",
            "script": "noFill();",
            "help": "Disables filling geometry",
            "sockets": [
                {
                    "name": "noFill"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "16723171-6d20-4a32-814c-2c50d94b296w",
            "script": "noStroke();",
            "help": "Disables drawing the stroke (outline)",
            "sockets": [
                {
                    "name": "noStroke"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "0237b5ab-d22a-45f9-af38-4a64bc98dbc3",
            "script": "colorMode({{1}}, {{2}});",
            "help": "Changes the way Processing interprets color data",
            "sockets": [
                {
                    "name": "color mode",
                    "type": "choice",
                    "options": "mode",
                    "value": "choice"
                },
                {
                    "name": "range",
                    "type": "number",
                    "value": "255"
                }
            ]
        }
    ]
}

);
/*end languages/processingjs/colors.json*/

/*begin languages/processingjs/math.json*/
wb.menu({
    "name": "Math",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "0ee12a6a-51a5-46b0-b1f6-db3731d99fc5",
            "type": "number",
            "script": "({{1}} + {{2}})",
            "help": "Adds two values",
            "sockets": [
                {
                    "name": "addition",
                    "type": "number",
                    "value": 0
                },
                {
                    "name": "+",
                    "type": "number",
                    "value": 0
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "406d4e12-7dhd-4fg4-9bpe-0a69d968b3c",
            "script": "{{1}} += {{2}};",
            "help": "Combines addition with assignment. First argument must be a variable",
            "sockets": [
                {
                    "name": "add assign",
                    "type": "any",
                    "value": null
                },
                {
                    "name": "+=",
                    "type": "any",
                    "value": 1
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "406d4e12-7db0-4fn4-9bne-9b86bd94be3c",
            "type": "string",
            "script": "({{1}} + {{2}})",
            "help": "Concatenates string values",
            "sockets": [
                {
                    "name": "concatena",
                    "type": "string",
                    "value": null
                },
                {
                    "name": "+",
                    "type": "string",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "eff1fb37-b0f5-4dac-9964-11e32dc8572a",
            "type": "number",
            "script": "({{1}} - {{2}})",
            "help": "Subtracts one value from another and may also be used to negate a value",
            "sockets": [
                {
                    "name": "minus",
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
            "id": "78147ed0-78d2-4ff1-a7bb-079921a00768",
            "type": "any",
            "script": "({{1}} * {{2}})",
            "help": "Multiplies the values of the two parameters",
            "sockets": [
                {
                    "name": "multiply",
                    "type": "any",
                    "value": "0"
                },
                {
                    "name": "*",
                    "type": "any",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "07ebe81b-64a7-44e8-9d6f-7a4980fb2588",
            "type": "number",
            "script": "({{1}} / {{2}})",
            "help": "Divides the value of the second parameter by the value of the first parameter",
            "sockets": [
                {
                    "name": "divide",
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
            "id": "a2647515-2f14-4d0f-84b1-p0e288823630",
            "type": "number",
            "script": "({{1}} % {{2}})",
            "help": "Calculates the remainer when one number is divided by another",
            "sockets": [
                {
                    "name": "modulo",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "%",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "247888a8-47a1-42a1-9018-55e307fd6a4e",
            "type": "number",
            "script": "random({{1}}, {{2}})",
            "help": "Generates random numbers",
            "sockets": [
                {
                    "name": "random",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7a20f5d9-86dc-40cf-86a0-63ba565d78c1",
            "type": "number",
            "script": "round({{1}})",
            "help": "Calculates the integer closest to the value parameter",
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
            "id": "004040ab-5954-40ec-9dac-0918ef1d5d42",
            "type": "number",
            "script": "abs({{1}})",
            "help": "Calculates the absolute value (magnitude) of a number",
            "sockets": [
                {
                    "name": "absolute",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7864b7f4-b6fb-46ff-ba8f-6c29160b141e",
            "type": "number",
            "script": "pow({{1}}, {{2}})",
            "help": "Facilitates exponential expressions",
            "sockets": [
                {
                    "name": "pow",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "^",
                    "type": "number",
                    "value": "2"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "b64d1ea4-f3c9-4499-8104-9d0acf85a7a5",
            "type": "number",
            "script": "sqrt({{1}})",
            "help": "Calculates the square root of a number",
            "sockets": [
                {
                    "name": "square root",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "fa7d53e9-2cf9-4acc-9d04-f941f98ff2b1",
            "type": "number",
            "script": "floor({{1}})",
            "help": "Calculates the closest int value that is less than or equal to the value of the parameter",
            "sockets": [
                {
                    "name": "floor",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7fb957cb-4cb2-462e-8aa5-66a03ff4a35c",
            "type": "number",
            "script": "ceil({{1}})",
            "help": "Calculates the closest int value that is greater than or equal to the value of the parameter",
            "sockets": [
                {
                    "name": "ceiling",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e2c9f20d-c17c-4fdb-bffc-561e7c373665",
            "type": "number",
            "script": "cos(radians({{1}}))",
            "help": "Calculates the cosine of an angle",
            "sockets": [
                {
                    "name": "cosine",
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
            "id": "28887223-5e67-4332-98d4-8e0ee53f037d",
            "type": "number",
            "script": "sin(radians({{1}}))",
            "help": "Calculates the sine of an angle",
            "sockets": [
                {
                    "name": "sine",
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
            "id": "194d6757-e04e-48d6-9cc1-d9071be47007",
            "type": "number",
            "script": "tan(radians({{1}}))",
            "help": "Calculates the ratio of the sine and cosine of an angle",
            "sockets": [
                {
                    "name": "tangent",
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
            "id": "42a91ce7-184b-4853-9653-32f6f28e5e0f",
            "type": "number",
            "script": "degrees(acos({{1}}))",
            "help": "The inverse of cos(), returns the arc cosine of a value",
            "sockets": [
                {
                    "name": "arccosine degrees",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "655b85f4-9090-4590-9c64-3887d29272d2",
            "type": "number",
            "script": "degrees(asin({{1}}))",
            "help": "The inverse of sin(), returns the arc sine of a value",
            "sockets": [
                {
                    "name": "arcsine degrees",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "0p5eeo69-148e-4e4a-a514-5179af86b615",
            "type": "number",
            "script": "degrees(atan({{1}}))",
            "help": "The inverse of tan(), returns the arc tangent of a value",
            "sockets": [
                {
                    "name": "arctangent degrees",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "1f53e062-118e-4e4a-a514-5f79a8874e15",
            "type": "number",
            "script": "degrees({{1}})",
            "help": "Converts a radian measurement to its corresponding value in degrees",
            "sockets": [
                {
                    "name": "degrees",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "1f5ee064-148e-4e4a-a514-179a886keqw",
            "type": "number",
            "script": "radians({{1}})",
            "help": "Converts a degree measurement to its corresponding value in radians",
            "sockets": [
                {
                    "name": "radians",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "b30761f4-b43c-4714-8ace-e6d1fe204da4",
            "script": "PI;",
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
            "id": "350e69fc-950b-4a9e-8d00-f598262cb6c6",
            "script": "TWO_PI",
            "type": "number",
            "help": "Two pi (tau) is 2 times pi, a generally more useful number",
            "sockets": [
                {
                    "name": "two pi"
                }
            ]
        }
    ]
});
/*end languages/processingjs/math.json*/

/*begin languages/processingjs/transform.json*/
wb.menu({
    "name": "Transform",
    "blocks": [
        {
            "blocktype": "step",
            "id": "01124271-6dc0-4j82-81kc-098ehudtcb1",
            "script": "pushMatrix();",
            "help": "Pushes the current transformation matrix onto the matrix stack",
            "sockets": [
                {
                    "name": "push matrix"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "01124271-6dc0-4j82-81kc-5637dy738ue",
            "script": "popMatrix();",
            "help": "Pops the current transformation matrix off the matrix stack",
            "sockets": [
                {
                    "name": "pop matrix"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "e3d6a995-4ae9-495b-bdd6-ee907d0c7915",
            "script": "rotate({{1}});",
            "help": "Rotates an object the amount specified by the angle parameter",
            "sockets": [
                {
                    "name": "rotate",
                    "type": "number",
                    "value": 30
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "916c79df-40f1-4280-a0p3-a08dh2ikzps",
            "script": "translate({{1}}, {{2}});",
            "help": "Specifies an amount to displace objects within the display window",
            "sockets": [
                {
                    "name": "translate x",
                    "type": "number",
                    "value": 30
                },
                {
                    "name": "y",
                    "type": "number",
                    "value": 20
                }
            ]
        }
    ]
});
/*end languages/processingjs/transform.json*/
