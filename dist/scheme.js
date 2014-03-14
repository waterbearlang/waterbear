
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

/*begin ajax.js*/
(function (global) {
    'use strict';
    function $(e) {
        if (typeof e == 'string') e = document.getElementById(e);
        return e
    };

    function collect(a, f) {
        var n = [];
        for (var i = 0; i < a.length; i++) {
            var v = f(a[i]);
            if (v != null) n.push(v)
        }
        return n
    };

    var ajax = {};
    ajax.x = function () {
        try {
            return new ActiveXObject('Msxml2.XMLHTTP')
        } catch (e) {
            try {
                return new ActiveXObject('Microsoft.XMLHTTP')
            } catch (e) {
                return new XMLHttpRequest()
            }
        }
    };
    ajax.serialize = function (f) {
        var g = function (n) {
            return f.getElementsByTagName(n)
        };
        var nv = function (e) {
            if (e.name) return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value);
            else return ''
        };
        var i = collect(g('input'), function (i) {
            if ((i.type != 'radio' && i.type != 'checkbox') || i.checked) return nv(i)
        });
        var s = collect(g('select'), nv);
        var t = collect(g('textarea'), nv);
        return i.concat(s).concat(t).join('&');
    };

    ajax.send = function (u, f, m, a, e) {
        var x = ajax.x();
        x.open(m, u, true);
        x.onreadystatechange = function () {
            if (x.readyState == 4 && x.status < 400) {
                var cType = x.getResponseHeader("Content-Type");
                f(x.responseText, cType);
            } else if (x.readyState == 4) {
                if (e == undefined) {
                    console.log(x.status + " (" + x.statusText + ") ");
                } else {
                    e(x.status, x);
                }
            }
        };
        if (m == 'POST')
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        x.send(a);
    };

    ajax.get = function (url, func, err) {
        ajax.send(url, func, 'GET', {}, err)
    };

    ajax.gets = function (url) {
        var x = ajax.x();
        x.open('GET', url, false);
        x.send(null);
        return x.responseText
    };

    ajax.post = function (url, func, args, err) {
        ajax.send(url, func, 'POST', args, err)
    };

    ajax.update = function (url, elm) {
        var e = $(elm);
        var f = function (r) {
            e.innerHTML = r
        };
        ajax.get(url, f)
    };
    ajax.submit = function (url, elm, frm) {
        var e = $(elm);
        var f = function (r) {
            e.innerHTML = r
        };
        ajax.post(url, f, ajax.serialize(frm))
    };
    global.ajax = ajax;
})(this);

/*end ajax.js*/

/*begin queryparams.js*/
// Sets up wb namespace (wb === waterbear). Global variable wb
// is initialized in the HTML before any javascript files are
// loaded (in template/template.html).
// Extracts parameters from URL, used to switch embed modes, load from gist, etc.
(function(global){
'use strict';
	// Source: http://stackoverflow.com/a/13984429
	function urlToQueryParams(url){
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

	function queryParamsToUrl(params){
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

	wb.urlToQueryParams = urlToQueryParams;
	wb.queryParamsToUrl = queryParamsToUrl;
	global.wb = wb;
})(this);

/*end queryparams.js*/

/*begin util.js*/
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(global){
    'use strict';
    //
    //
    // UTILITY FUNCTIONS
    //
    // A bunch of these are to avoid needing jQuery just for simple things like matches(selector) and closest(selector)
    //
    //
    // TODO
    // Make these methods on HTMLDocument, HTMLElement, NodeList prototypes

    function makeArray(arrayLike){
        return Array.prototype.slice.call(arrayLike);
    }

    function reposition(elem, position){
        // put an absolutely positioned element in the right place
        // May need to take into account offsets of container
        elem.style.top = position.top + 'px';
        elem.style.left = position.left + 'px';
    }

    function hide(elem){
        elem.classList.add('hidden');
    }

    function show(elem){
        elem.classList.remove('hidden');
    }

    var svgText = document.querySelector('.resize-tester');
    function resize(input){
        if (!input)
        {
            return;
        }
        if (input.wbTarget){
            input = input.wbTarget;
        }
        svgText.textContent = input.value || '';
        var textbox = svgText.getBBox();
        input.style.width = (textbox.width + 25) + 'px';
    }

    // wb.mag = function mag(p1, p2){
    //     return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
    // };

    function dist(p1, p2, m1, m2){
        return Math.sqrt(Math.pow(p1 - m1, 2) + Math.pow(p2 - m2, 2));
    }


    function overlapRect(r1, r2){ // determine area of overlap between two rects
        if (r1.left > r2.right){ return 0; }
        if (r1.right < r2.left){ return 0; }
        if (r1.top > r2.bottom){ return 0; }
        if (r1.bottom < r2.top){ return 0; }
        var max = Math.max, min = Math.min;
        return (max(r1.left, r2.left) - min(r1.right, r2.right)) * (max(r1.top, r2.top) - min(r1.bottom, r2.bottom));
    }

    function rect(elem){
        return elem.getBoundingClientRect();
    }

    function overlap(elem1, elem2){
        return wb.overlapRect(wb.rect(elem1), wb.rect(elem2));
    }

    function area(elem){
        return elem.clientWidth * elem.clientHeight;
    }

    function containedBy(target, container){
        var targetArea = Math.min(wb.area(target), wb.area(container) * 0.90);
        return target.overlap(container) >= targetArea;
    }

    function closest(elem, selector){
        if (elem.jquery){
            elem = elem[0];
        }
        while(elem){
            if (wb.matches(elem, selector)){
                return elem;
            }
            if (!elem.parentElement){
                throw new Error('Element has no parent, is it in the tree? %o', elem);
                //return null;
            }
            elem = elem.parentElement;
        }
        return null;
    }

    function indexOf(elem){
        var idx = 0;
        while(elem.previousSiblingElement){
            elem = elem.previousSiblingElement;
            idx++;
        }
        return idx;
    }

    function find(elem, selector){
        if (typeof(elem) === 'string'){
            selector = elem;
            elem = document.body;
        }
        return elem.querySelector(selector);
    }

    function findAll(elem, selector){
        if (typeof(elem) === 'string'){
            selector = elem;
            elem = document.body;
        }
        return wb.makeArray(elem.querySelectorAll(selector));
    }

    function findChildren(elem, selector){
        return wb.makeArray(elem.children).filter(function(item){
            return wb.matches(item, selector);
        });
    }

    function findChild(elem, selector){
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
    }

   function elem(name, attributes, children){
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
                if (attributes[key] === null || attributes[key] === undefined)
                {
                    return;
                }
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
        if (children !== null && children !== undefined){
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
    }


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

    wb.makeArray = makeArray;
    wb.reposition = reposition;
    wb.hide = hide;
    wb.show = show;
    wb.resize = resize;
    wb.dist = dist;
    wb.overlapRect = overlapRect;
    wb.rect = rect;
    wb.overlap = overlap;
    wb.area = area;
    wb.containedBy = containedBy;
    wb.closest = closest;
    wb.indexOf = indexOf;
    wb.find = find;
    wb.findAll = findAll;
    wb.findChildren = findChildren;
    wb.findChild = findChild;
    wb.elem = elem;

})(this);

/*end util.js*/

/*begin event.js*/
// Bare-bones Event library
// Adds support for event delegation on top of normal DOM events (like jQuery "live" events)
// Minimal support for non-DOM (custom) events
// Normalized between mouse and touch events
// Waterbear specific: events have wb-target which is always a block element
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(global){
    "use strict";

    function isDomObject(e){
        if (e === window) return true;
        if (e === document) return true;
        if (e.tagName) return true;
        return false;
    }

    function on(elem, eventname, selector, handler, onceOnly){
        if (typeof elem === 'string'){
            return wb.makeArray(document.querySelectorAll(elem)).map(function(e){
                return on(e, eventname, selector, handler);
            });
        }
        if (!isDomObject(elem)){ 
            console.error('first argument must be element, document, or window: %o', elem);
            throw new Error('first argument must be element');
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
                if (onceOnly){
                    Event.off(elem, eventname, listener);
                }
                if (wb.matches(event.wbTarget, selector)){
                    handler(event);
                }else if (wb.matches(event.wbTarget, selector + ' *')){
                    event.wbTarget = wb.closest(event.wbTarget, selector);
                    handler(event);
                }
            };
        }else{
            listener = function listener(event){
                blend(event);
                if (!event.wbValid){
                    return;
                }
                if (onceOnly){
                    Event.off(elem, eventname, listener);
                }
                handler(event);
            };
        }
        elem.addEventListener(eventname, listener, false);
        return listener;
    };

    function off(elem, eventname, handler){
        elem.removeEventListener(eventname, handler);
    }

    var once = function(elem, eventname, selector, handler){
        return Event.on(elem, eventname, selector, handler, true);
    }

    function trigger(elemOrSelector, eventname, data){
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
    function isMouseEvent(event){
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
    function isTouchEvent(event){
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

    function isPointerEvent(event){
        return isTouchEvent(event) || isMouseEvent(event);
    };

    // Treat mouse events and single-finger touch events similarly
    function blend(event){
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
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(global){
'use strict';
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
    var dropRects;
    var dragging;
    var currentPosition;
    var scope;
    var workspace; // <- WB. The Workspace block is created with the function
           // createWorkspace() in the workspace.js file.
    var blockMenu = document.querySelector('#block_menu'); // <- WB
    var scratchpad= document.querySelector('.scratchpad'); // <- WB
    var potentialDropTargets;
    var selectedSocket; // <- WB
    var dragAction = {};
    var templateDrag, localDrag; // <- WB
    var startPosition;
    var pointerDown;
    var cloned;
    
    var _dropCursor; // <- WB
    
    // WB-specific
    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.drop-cursor');
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
        pointerDown = false;
        cloned = false; // <- WB
        scope = null; // <- WB
        templateDrag = false; // <- WB
        localDrag = false; // <- WB
        blockMenu = document.querySelector('#block_menu');
        var scratchpad= document.querySelector('.scratchpad'); // <- WB
        workspace = null;
        selectedSocket = null;
        _dropCursor = null;
        startParent = null;
        startSibling = null;
    }
    reset();
    
    function initDrag(event){
        // console.log('initDrag(%o)', event);
        
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        pointerDown = true;
        var eT = event.wbTarget; // <- WB
        //Check whether the original target was an input ....
        // WB-specific
        if (wb.matches(event.target, 'input, select, option, .disclosure, .contained')  && !wb.matches(eT, '#block_menu *')) {
            console.log('not a drag handle');
            return undefined;
        }
        
        var target = null;
        if (eT.classList.contains('scratchpad')) {
            var clickedBlock = getClickedBlock(scratchpad, event);
            if (clickedBlock != false) {
                console.log("The event has block");
                target = clickedBlock;
            } else {
                return undefined;
            }
        } else {
            target = wb.closest(eT, '.block'); // <- WB
        }
        //This throws an error when block is in scratchpad
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
        if (!pointerDown) {return undefined;}
        // console.log('startDrag(%o)', event);
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
        dragTarget.style.pointerEvents = 'none'; // FIXME, this should be in CSS
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
        // console.log('drag(%o)', event);
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
        pointerDown = false;
        // console.log('endDrag(%o) dragging: %s', event, dragging);
        if (!dragging) {return undefined;}
        clearTimeout(timer);
        timer = null;
        handleDrop(event,event.altKey || event.ctrlKey);
        reset();
        event.preventDefault();
        return false;
    }

    function handleDrop(event,copyBlock){
        // console.log('handleDrop(%o)', copyBlock);
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
        } else if (wb.overlap(dragTarget, scratchpad)) {
            var scratchPadStyle = scratchpad.getBoundingClientRect();
            var newOriginX = scratchPadStyle.left;
            var newOriginY = scratchPadStyle.top;

            var blockStyle = dragTarget.getBoundingClientRect();
            var oldX = blockStyle.left;
            var oldY = blockStyle.top;

            dragTarget.style.position = "absolute";
            dragTarget.style.left = (oldX - newOriginX) + "px";
            dragTarget.style.top = (oldY - newOriginY) + "px";
            scratchpad.appendChild(dragTarget);

            //when dragging from workspace to scratchpad, this keeps workspace from
            //moving around when block in scratchpad is moved.
            //dragTarget.parentElement.removeChild(dragTarget); 
            Event.trigger(dragTarget, 'wb-add');
            return;
        }
        
        else if (dropTarget){
            //moving around when dragged block is moved in scratchpad
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
            // console.log('no drop targets found');
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
    
    function registerScratchSpace() {
        var workspace = document.querySelector('.workspace');
        var mainWorkspace = document.querySelector('scripts_workspace');
        var id = "23423443";
        var sBlock = wb.Block({
                group: 'scripts_scratchspace',
                id: id,
                scriptId: id,
                scopeId: id,
                blocktype: 'context',
                sockets: [
                ],
                script: '[[1]]',
                isTemplateBlock: false,
                help: 'Place script blocks here for quick access'
            });
    
        workspace.insertBefore(sBlock, mainWorkspace);
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
    
    function getClickedBlock(element, event) {
        var children = element.childNodes;
        //console.log(children);
        var x = event.clientX;
        var y = event.clientY;
    
        for (var i = 0; i < children.length; i++){
            if (children[i].nodeType != 3) {
                var r = children[i].getBoundingClientRect();
                if (r.bottom > y && r.top < y && r.left < x && r.right > x) {
                    return children[i];
                }
            }
        }
        return false;
    }
    
    function moveToScratchPad(event){
	cloneBlock = wb.cloneBlock(event.target);
	//Add child to scratchpad
    }
    
    
    //This function arranges the blocks into a grid. Future functions could
    //sort the blocks by type, frequency of use, or other such metrics
    function arrangeScratchPad() {
	console.log("ARRANGING SCRATCH PAD");
	var PADDING = 8;
	
	var scratchPadRect = scratchpad.getBoundingClientRect();
	console.log(scratchPadRect);
	var width = scratchPadRect.width;
	var xOrigin = 5;
	var yOrigin = 5;
	
	var x = xOrigin;
	var y = yOrigin;
	
	var children = scratchpad.childNodes;
	var maxHeight = 0;
	
	for (var i = 0; i < children.length; i++) {
	    if (children[i].nodeType != 3) {
		var r = children[i];
		
		var rBounding = r.getBoundingClientRect();
		if (rBounding.height > maxHeight) {
		    maxHeight = rBounding.height;
		}
		r.style.top = y + "px";
		r.style.left = x + "px";
		console.log("X " + x);
		console.log("Y " + y);
		x += rBounding.width + PADDING;
		
		if (x >= width - 25) {
		    //We are going into a new row.
		    x = xOrigin;
		    y += maxHeight + PADDING;
		    maxHeight = 0;
		}
	    }
	}
	
	
    }

    // Initialize event handlers
    wb.initializeDragHandlers = function(){
        // console.log('initializeDragHandlers');
        Event.on('.content', 'touchstart', '.block', initDrag);
        Event.on('.content', 'touchmove', null, drag);
        Event.on('.content', 'touchend', null, endDrag);
        // TODO: A way to cancel touch drag?
    Event.on('.content', 'mousedown', '.scratchpad', initDrag);
    Event.on('.content', 'dblclick', null, arrangeScratchPad);
    Event.on('.content', 'dblclick', '.block', moveToScratchPad);
        Event.on('.content', 'mousedown', '.block', initDrag);
        Event.on('.content', 'mousemove', null, drag);
        Event.on(document.body, 'mouseup', null, endDrag);
        Event.on(document.body, 'keyup', null, cancelDrag);
    };
})(this);


/*end drag.js*/

/*begin uuid.js*/
// This returns a Version 4 (random) UUID
// See: https://en.wikipedia.org/wiki/Universally_unique_identifier for more info

(function(global){
  'use strict';
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

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
    var elem = wb.elem;

    var nextSeqNum = 0;
    var blockRegistry = {}; /* populated in function "registerBlock", which is
                               called by the Block() function below*/

    function newSeqNum(){
        nextSeqNum++;
        return nextSeqNum;
    }

    function registerSeqNum(seqNum){
        // When reifying saved blocks, call this for each block to make sure we start new blocks
        // that do not overlap with old ones.
        if (!seqNum)
        {
            return;
        }
        nextSeqNum = Math.max(parseInt(seqNum, 10), nextSeqNum);
    }

    function resetSeqNum(){
        nextSeqNum = 0;
        blockRegistry = {};
        wb.blockRegistry = blockRegistry;
    }

    function registerBlock(blockdesc){
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

    function getHelp(id){
        return blockRegistry[id] ? blockRegistry[id].help : '';
    }

    function getScript(id){
        try{
            return blockRegistry[id].script;
        }catch(e){
            console.error('Error: could not get script for %o', id);
            console.error('Hey look: %o', document.getElementById(id));
            return '';
        }
    }

    function getSockets(block){
        return wb.findChildren(wb.findChild(block, '.label'), '.socket');
    }

    function getSocketValue (socket){
        return socketValue(wb.findChild(socket, '.holder'));
    }

    function createSockets(obj){
        return obj.sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj);
        });
    }

    var Block = function(obj){
        registerBlock(obj);
        // if (!obj.isTemplateBlock){
        //     console.log('block seq num: %s', obj.seqNum);
        // }
        if (!obj.isTemplateBlock){
            updateFromTemplateBlock(obj);
        }
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
    };

    // Block Event Handlers

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
                    // if (!spec.seqNum){
                        spec.seqNum = block.dataset.seqNum;
                    // }
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
            socket.appendChild(holder);
        }
        if (desc.block){
            socket.dataset.block = desc.block;
        }
        socket.dataset.seqNum = blockdesc.seqNum;
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
    };


    function socketDesc(socket){
        var parentBlock = wb.closest(socket, '.block');
        var isTemplate = !!parentBlock.dataset.isTemplateBlock;
        var desc = {
            name: socket.dataset.name
        };
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
        if (isTemplate) 
        {
            return desc;
        }
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name');
        
        if (desc.name.replace(/##/, ' ' + socket.dataset.seqNum) !== uName){
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

    function updateFromTemplateBlock(obj){
        // Retrieve the things we don't need to duplicate in every instance block description
        var tB = blockRegistry[obj.scriptId];
        if (!tB){
            console.error('Error: could not get template block for  for %o', obj);
            return obj;
        }
        obj.blocktype = tB.blocktype;
        obj.group = tB.group;
        obj.help = tB.help;
        obj.type = tB.type;
    }

    function blockDesc(block){
        var label = wb.findChild(block, '.label');
        var sockets = wb.findChildren(label, '.socket');
        var desc = {
            id: block.id,
            scopeId: block.dataset.scopeId,
            scriptId: block.dataset.scriptId,
            sockets: sockets.map(socketDesc)
        };

        if (block.dataset.group === 'scripts_workspace'){
            desc.blocktype = block.dataset.blocktype;
            desc.group = block.dataset.group;
            desc.help = block.dataset.help;
            desc.type = block.dataset.type;            
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
        // UPDATE:
        // No, it was because we want cloned blocks (and the locals they create) to get 
        // new sequence numbers. But, if the block being clones is an instance of a local then we
        // don't want to get a new sequence number.
        // /////////////////
        if (!block.dataset.localSource){
            delete blockdesc.seqNum;
        }
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
        
        if(type === 'boolean')
        {
            obj.options = 'boolean';
        }
        
        if(typeof obj.options !== 'undefined')
        {
            // DONE : #24
            // DONE : #227
            var choice = elem('select');
            var list = wb.choiceLists[obj.options];
            
            if(Array.isArray(list))
            {
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    var value = obj.uValue || obj.value;
                    
                    if (value !== undefined && value !== null && value == opt){
                        option.setAttribute('selected', 'selected');
                    }
                    
                    choice.appendChild(option);
                });
            }
            else
            {
                var values = Object.keys(list);
                
                values.forEach(function(val){
                    var option = elem('option', {"value":val}, list[val]);
                    var value = obj.uValue || obj.value;
                    
                    if (value !== undefined && value !== null && value == val){
                        option.setAttribute('selected', 'selected');
                    }
                    
                    choice.appendChild(option);
                });
            }
            
            return choice;
        
        }
        
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
    };

    function socketValue(holder){
        if (holder.children.length > 1){
            return codeFromBlock(wb.findChild(holder, '.block'));
        }else{
            var value = wb.findChild(holder, 'input, select').value;
            var type = holder.parentElement.dataset.type;

            // DONE : #227
            if (type === 'string' || type === 'color' || type === 'url'){
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

    function codeFromBlock(block){
        var scriptTemplate = getScript(block.dataset.scriptId).replace(/##/g, '_' + block.dataset.seqNum);
        if (!scriptTemplate){
            // If there is no scriptTemplate, things have gone horribly wrong, probably from 
            // a block being removed from the language rather than hidden
            wb.findAll('.block[data-script-id="' + block.dataset.scriptId + '"]').forEach(function(elem){
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
    }

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
                wb.find(elem, '.socket').dataset.name = newName;
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
            }
        };
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
            input.blur();
        }else if(event.keyCode === 0x0D /* return or enter */ || event.keyCode === 0x09 /* tab */){
            event.preventDefault();
            input.blur();
        }
    }

    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-add', '.block', addBlock);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

    wb.blockRegistry = blockRegistry;

    // Export methods
    wb.Block = Block;
    wb.blockDesc = blockDesc;
    wb.socketDesc = socketDesc;
    wb.registerSeqNum = registerSeqNum;
    wb.resetSeqNum = resetSeqNum;
    wb.cloneBlock = cloneBlock;
    wb.codeFromBlock = codeFromBlock;
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
/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
	function saveCurrentScripts(){
		if (!wb.scriptModified){
			// console.log('nothing to save');
			// nothing to save
			return;
		}
		document.querySelector('#block_menu').scrollIntoView();
		localStorage['__' + wb.language + '_current_scripts'] = scriptsToString();
	};

	// Save script to gist;
	function saveCurrentScriptsToGist(event){
	    event.preventDefault();
		// console.log("Saving to Gist");
		var title = prompt("Save to an anonymous Gist titled: ");
		if ( !title ) return;
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
	    }), function(statusCode, x){
            alert("Can't save to Gist:\n" + statusCode + " (" + x.statusText + ") ");
        });
	};
	//populate the gist submenu with recent gists
	function loadRecentGists() {
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


	function createDownloadUrl(evt){
	    evt.preventDefault();
	    var name = prompt("Save file as: ");
	    if( !name ) return;
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

	function loadScriptsFromGistId(id){
		//we may get an event passed to this function so make sure we have a valid id or ask for one
		var gistID = isNaN(parseInt(id)) ? prompt("What Gist would you like to load? Please enter the ID of the Gist: ")  : id;
		// console.log("Loading gist " + id);
		if( !gistID ) return;
		ajax.get("https://api.github.com/gists/"+gistID, function(data){
			loadScriptsFromGist({data:JSON.parse(data)});
	    }, function(statusCode, x){
            alert("Can't load from Gist:\n" + statusCode + " (" + x.statusText + ") ");
		});
        var path = location.href.split('?')[0];
        path += "?gist=" + gistID;
        history.pushState(null, '', path);
	};

	function loadScriptsFromFilesystem(event){
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
		ajax.get('examples/' + wb.language + '/' + name + '.json?b=' + Math.random(), function(exampleJson){
			loadScriptsFromObject(JSON.parse(exampleJson));
		}, function(statusCode, xhr){
			console.error(statusCode + xhr);
		});
	}

	function loadCurrentScripts(queryParsed){
		// console.log('loadCurrentScripts(%s)', JSON.stringify(queryParsed));
		if (wb.loaded) return;
		wb.scriptLoaded = false;
		if (queryParsed.gist){
			//console.log("Loading gist %s", queryParsed.gist);
			ajax.get("https://api.github.com/gists/"+queryParsed.gist, function(data){
				loadScriptsFromGist({data:JSON.parse(data)});
	        }, function(statusCode, x){
              alert("Can't save to gist:\n" + statusCode + " (" + x.statusText + ") ");
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
			wb.scriptLoaded = true;
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

	function getFiles(evt){
		evt.stopPropagation();
		evt.preventDefault();
		var files = evt.dataTransfer.files;
		if ( files.length > 0 ){
	        // we only support dropping one file for now
	        var file = files[0];
	        loadScriptsFromFile(file);
	    }
	}

	wb.saveCurrentScripts = saveCurrentScripts;
	wb.saveCurrentScriptsToGist = saveCurrentScriptsToGist;
	wb.loadRecentGists = loadRecentGists;
	wb.createDownloadUrl = createDownloadUrl;
	wb.loadScriptsFromGistId = loadScriptsFromGistId;
	wb.loadScriptsFromFilesystem = loadScriptsFromFilesystem;
	wb.loadCurrentScripts = loadCurrentScripts;
	wb.getFiles = getFiles;

})(wb);

/*end file.js*/

/*begin undo.js*/
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
	'use strict';
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
		document.querySelector('.undoAction').classList.add('disabled');
		document.querySelector('.redoAction').classList.add('disabled');
	}catch(e){
		// don't worry if undo ui is not available yet
	}
}

function undoLastAction() {
	if(currentAction <= 0) return; // No action to undo!
	currentAction--;
	undoActions[currentAction].undo();
	if(currentAction <= 0) {
		document.querySelector('.undoAction').classList.add('disabled');
	}
	document.querySelector('.redoAction').classList.remove('disabled');
}

try{
	document.querySelector('.undoAction').classList.add('disabled');
}catch(e){
	return; // some languages do not yet support undo/redo
}

function redoLastAction() {
	if(currentAction >= undoActions.length) return; // No action to redo!
	undoActions[currentAction].redo();
	currentAction++;
	if(currentAction >= undoActions.length) {
		document.querySelector('.redoAction').classList.add('disabled');
	}
	document.querySelector('.undoAction').classList.remove('disabled');
}

try{
	document.querySelector('.redoAction').classList.add('disabled');
}catch(e){
	return; // some languages do not yet support undo/redo
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
	document.querySelector('.undoAction').classList.remove('disabled');
	document.querySelector('.redoAction').classList.add('disabled');
	// console.log('undo stack: %s', undoActions.length);
}

wb.history = {
	add: addUndoAction,
	undo: undoLastAction,
	redo: redoLastAction,
	clear: clearUndoStack
}

Event.on('.undoAction', 'click', ':not(.disabled)', undoLastAction);
Event.on('.redoAction', 'click', ':not(.disabled)', redoLastAction);
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
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
// UI Chrome Section


function accordion(event){
    event.preventDefault();
    var open = document.querySelector('#block_menu .open');
    if (open){
        open.classList.remove('open');
    }
    if (open && open === event.wbTarget.nextSibling) return;
    event.wbTarget.nextSibling.classList.add('open');
}


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
		into: cmenuTarget.parentNode,
		before: cmenuTarget.nextSibling,
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
				cmenuTarget.appendChild(this.pasted);
			}
			Event.trigger(this.pasted, 'wb-add');
		},
	}
	wb.history.add(action);
	action.redo();
}

function canPaste() {
	if(!pasteboard) return false;
	if(wb.matches(pasteboard,'.step') && !wb.matches(cmenuTarget,'.holder')) {
		return true;
	}
	if(wb.matches(pasteboard,'.expression') && wb.matches(cmenuTarget,'.holder')) {
		return true;
	}
	return false;
}

var pasteboard = null;
var cmenuCurrent = null;
var showContext = false;
var cmenuDisabled = false;
var cmenuTarget = null;

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
	//if(!showContext) return;
	// console.log(evt.clientX, evt.clientY);
	// console.log(evt.wbTarget);
	if(cmenuDisabled || wb.matches(evt.wbTarget, '.block-menu *')) return;
	else if(false);
	else if(wb.matches(evt.wbTarget, '.block:not(.scripts_workspace) *')) {
		setContextMenuTarget(evt.wbTarget);
		buildContextMenu(block_cmenu);
	} else return;
	showContextMenu(evt.clientX, evt.clientY);
	evt.preventDefault();
}

function setContextMenuTarget(target) {
	cmenuTarget = target;
	while(!wb.matches(cmenuTarget, '.block') && !wb.matches(cmenuTarget, '.holder')) {
		// console.log(cmenuTarget);
		cmenuTarget = cmenuTarget.parentNode;
		if(cmenuTarget.tagName == 'BODY') {
			console.error("Something went wrong with determining the context menu target!");
			cmenuTarget = null;
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
		// console.log(cmenuTarget);
		fcn.call(cmenuTarget,evt);
		var contextDiv = document.getElementById('context_menu');
		contextDiv.style.display = 'none';
		evt.preventDefault();
	};
}

function disableContextMenu(evt) {
	cmenuDisabled = true;
	var enableBtn = document.querySelector('.cmenuEnable');
	enableBtn.style.display = '';
	var contextDiv = document.getElementById('context_menu');
	contextDiv.style.display = 'none';
}

function enableContextMenu(evt) {
	cmenuDisabled = false;
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
function menu(blockspec){
    var title = blockspec.name.replace(/\W/g, '');
    var specs = blockspec.blocks;
    var help = blockspec.help !== undefined ? blockspec.help : '';
    return edit_menu(title, specs, help);
};

function edit_menu(title, specs, help, show){
    var group = title.toLowerCase().split(/\s+/).join('');
    var submenu = document.querySelector('.' + group + '+ .submenu');
    if (!submenu){
        var header = wb.elem('h3', {'class': group + ' accordion-header', 'id': 'group_'+group}, title);
        var submenu = wb.elem('div', {'class': 'submenu block-menu accordion-body'});
        var description = wb.elem('p', {'class': 'accordion-description'}, help);
        var blockmenu = document.querySelector('#block_menu');
        blockmenu.appendChild(header);
        blockmenu.appendChild(submenu);
        submenu.appendChild(description);
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

wb.menu = menu;

})(wb);


/*end ui.js*/

/*begin workspace.js*/
//The Workspace block is created with the function createWorkspace() in
//this file. The createWorkspace() function is called in file.js

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
	'use strict';

	function clearScripts(event, force){
		if (force || confirm('Throw out the current script?')){
			var workspace = document.querySelector('.scripts_workspace')
            var path = location.href.split('?')[0];
            history.pushState(null, '', path);
			workspace.parentElement.removeChild(workspace);
			wb.scriptModified = false;
			wb.scriptLoaded = false;
			wb.loaded = false;
			wb.clearStage();
			createWorkspace('Workspace');
			document.querySelector('.scripts_text_view').innerHTML = '';
			wb.history.clear();
			wb.resetSeqNum();
			delete localStorage['__' + wb.language + '_current_scripts'];
		}
	}
	
	function loadExample(event){
		var path = location.href.split('?')[0];
		path += "?example=" + event.target.dataset.example;
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
	}

	function handleStateChange(event){
		// hide loading spinner if needed
		console.log('handleStateChange');
		hideLoader();
		var viewButtons = document.querySelectorAll('.views + .sub-menu .toggle');
		wb.queryParams = wb.urlToQueryParams(location.href);
		if (wb.queryParams.view === 'result'){
			document.body.classList.add('result');
			document.body.classList.remove('editor');
			for(var i = 0; i < viewButtons.length; i++) {
				viewButtons[i].classList.add('disabled');
			}
			wb.view = 'result';
		}else{
			document.body.classList.remove('result');
			document.body.classList.add('editor');
			for(var i = 0; i < viewButtons.length; i++) {
				viewButtons[i].classList.remove('disabled');
			}
			wb.view = 'editor';
		}
		if (wb.queryParams.embedded === 'true'){
			document.body.classList.add('embedded');
		}else{
			document.body.classList.remove('embedded');
		}
		// handle loading example, gist, currentScript, etc. if needed
	    wb.loadCurrentScripts(wb.queryParams);
	    // If we go to the result and can run the result inline, do it
	    // if (wb.view === 'result' && wb.runCurrentScripts){
	    // 	// This bothers me greatly: runs with the console.log, but not without it
	    // 	console.log('running current scripts');
	    // 	runFullSize();
	    // }else{
	    // 	if (wb.view === 'result'){
		   //  	// console.log('we want to run current scripts, but cannot');
		   //  }else{
		   //  	runWithLayout();
		   //  	// console.log('we do not care about current scripts, so there');
		   //  }
	    // }
	    if (wb.toggleState.scripts_text_view){
	    	wb.updateScriptsView();
	    }
	    if (wb.toggleState.stage || wb.view === 'result'){
	    	// console.log('run current scripts');
	    	wb.runCurrentScripts();
	    }else{
	    	wb.clearStage();
	    }
	}

	function hideLoader(){
	    var loader = document.querySelector('#block_menu_load');
	    if (loader){
	        loader.parentElement.removeChild(loader);
	    }		
	}

	function historySwitchState(state, clearFiles){
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

	// Allow saved scripts to be dropped in
	function createWorkspace(name){
	    console.log('createWorkspace');
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
	
	function wireUpWorkspace(workspace){
		workspace.addEventListener('drop', wb.getFiles, false);
		workspace.addEventListener('dragover', function(event){event.preventDefault();}, false);
		wb.findAll(document, '.scripts_workspace').forEach(function(ws){
	        ws.parentElement.removeChild(ws); // remove any pre-existing workspaces
	    });
		document.querySelector('.workspace').appendChild(workspace);
		workspace.querySelector('.contained').appendChild(wb.elem('div', {'class': 'drop-cursor'}));
		// wb.initializeDragHandlers();
		Event.trigger(document.body, 'wb-workspace-initialized');
	};


	function handleDragover(evt){
	    // Stop Firefox from grabbing the file prematurely
	    event.stopPropagation();
	    event.preventDefault();
	    event.dataTransfer.dropEffect = 'copy';
	}

	function disclosure(event){
		var block = wb.closest(event.wbTarget, '.block');
		if (block.dataset.closed){
			delete block.dataset.closed;
		}else{
			block.dataset.closed = true;
		}
	}

	function handleScriptLoad(event){
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
	}

	function handleScriptModify(event){
		// still need modified events for changing input values
		if (!wb.scriptLoaded) return;
		if (!wb.scriptModified){
			wb.scriptModified = true;
			wb.historySwitchState(wb.view, true);
		}
	}

	// function runFullSize(){
	// 	['#block_menu', '.workspace', '.scripts_text_view'].forEach(function(sel){
	// 		wb.hide(wb.find(document.body, sel));
	// 	});
	// 	wb.show(wb.find(document.body, '.stage'));
	// }

	// function runWithLayout(){
	// 	['#block_menu', '.workspace'].forEach(function(sel){
	// 		wb.show(wb.find(document.body, sel));
	// 	});
	// 	['stage', 'scripts_text_view', 'tutorial', 'scratchpad', 'scripts_workspace'].forEach(function(name){
	// 		toggleComponent({detail: {name: name, state: wb.toggleState[name]}});
	// 	});
	// }

	function toggleComponent(evt){
		var component = wb.find(document.body, '.' + evt.detail.name);
		if (!component) return;
		evt.detail.state ? wb.show(component) : wb.hide(component);
		var results = wb.find(document.body, '.results');
		// Special cases
		switch(evt.detail.name){
			case 'stage':
				if (evt.detail.state){
					wb.show(results);
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
				break;
		}
		if (wb.toggleState.stage){
			// restart script on any toggle
			// so it runs at the new size
			wb.runCurrentScripts();
		}

	}

	Event.on(document.body, 'wb-toggle', null, toggleComponent);

	window.addEventListener('popstate', function(evt){
		console.log('popstate event');
		Event.trigger(document.body, 'wb-state-change');
	}, false);

	window.addEventListener('load', function(evt){
		console.log('load event');
		Event.trigger(document.body, 'wb-state-change');
	})

	// Kick off some initialization work
	Event.once(document.body, 'wb-workspace-initialized', null, function initHistory(){
		console.log('workspace ready');
		wb.windowLoaded = true;
		wb.workspaceInitialized = true;
		Event.trigger(document.body, 'wb-state-change');
	}, false);
	Event.once(document.body, 'wb-workspace-initialized', null, wb.initializeDragHandlers);

	Event.on('.clear_scripts', 'click', null, clearScripts);
	Event.on('.edit-script', 'click', null, function(event){
		wb.historySwitchState('editor');
	});
	Event.on(document.body, 'click', '.load-example', loadExample);
	Event.on(document.body, 'wb-state-change', null, handleStateChange);
	Event.on('.save_scripts', 'click', null, wb.saveCurrentScriptsToGist);
	Event.on('.download_scripts', 'click', null, wb.createDownloadUrl);
	Event.on('.load_from_gist', 'click', null, wb.loadScriptsFromGistId);
	Event.on('.restore_scripts', 'click', null, wb.loadScriptsFromFilesystem);
	Event.on('.workspace', 'click', '.disclosure', disclosure);
	Event.on('.workspace', 'dblclick', '.locals .name', wb.changeName);
	Event.on('.workspace', 'keypress', 'input', wb.resize);
	Event.on('.workspace', 'change', 'input, select', function(event){
		Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'valueChanged'});
	});
	Event.on(document.body, 'wb-script-loaded', null, handleScriptLoad);
	Event.on(document.body, 'wb-modified', null, handleScriptModify);
	Event.on('.run-scripts', 'click', null, function(){
        wb.historySwitchState('result');
    });
    Event.on('.show-ide', 'click', null, function(){
    	wb.historySwitchState('ide');
    });
    Event.on('.escape-embed', 'click', null, function(){
    	// open this in a new window without embedded in the url
    	var params = wb.urlToQueryParams(location.href);
    	delete params.embedded;
    	var url = wb.queryParamsToUrl(params);
    	var a = wb.elem('a', {href: url, target: '_blank'});
    	a.click();
    });
    // autorun buttons
    Event.on('.run-script', 'click', null, function(){
    	document.body.classList.add('running');
    	wb.runCurrentScripts(true);
    });
    Event.on('.stop-script', 'click', null, function(){
    	document.body.classList.remove('running');
    	wb.clearStage();
    });
    Event.on('.autorun-script-on', 'click', null, function(){
    	// turn it off
    	document.body.classList.add('no-autorun');
    	wb.autorun = false;
    	wb.clearStage();
    });
    Event.on('.autorun-script-off', 'click', null, function(){
    	document.body.classList.remove('no-autorun');
    	wb.autorun = true;
    	wb.runCurrentScripts(true);
    });

	wb.language = location.pathname.match(/\/([^/.]*)\.html/)[1];
	wb.loaded = false;
	wb.clearScripts = clearScripts;
	wb.historySwitchState = historySwitchState;
	wb.createWorkspace = createWorkspace;
	wb.wireUpWorkspace = wireUpWorkspace;
})(wb);

/*end workspace.js*/

/*begin blockprefs.js*/
// User block preferences
//
// Allows the user to hide groups of blocks within the interface
// Settings are stored in LocalStorage and retreived each
// time the page is loaded.
/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
	//save the state of the settings link
	var closed = true;
	var language = wb.language;
	var settingsLink;
	//add a link to show the show/hide block link
	function addSettingsLink(callback) {
		// console.log("adding settings link");
		var block_menu = document.querySelector('#block_menu');
		var settingsLink = document.createElement('a');
		settingsLink.href = '#';
		settingsLink.style.float = 'right';
		settingsLink.appendChild(document.createTextNode('Show/Hide blocks'));
		settingsLink.addEventListener('click', toggleCheckboxDisplay);
		block_menu.appendChild(settingsLink);
		return settingsLink;
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
			settingsLink.innerHTML = 'Save';
		} else {
			//save was clicked
			closed = true;
			display = 'none'
			settingsLink.innerHTML = 'Show/Hide blocks';
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
		Object.keys(hiddenBlocks).forEach(function(key){
			if(!hiddenBlocks[key]){
				var h3 = document.getElementById(key);
				if(h3 != null){
					var check = h3.querySelector('input[type="checkbox"]');
					check.checked = false;
					h3.classList.add('hidden');
				}
			}
		});
	}

	//after initliazation, create the settings and checkboxes
	function load(){
		settingsLink = addSettingsLink();
		createCheckboxes();
		loadSettings();
	}

	//onload initialize the blockmanager
	window.onload = load;
})(wb);

/*end blockprefs.js*/

/*begin menu.js*/
/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
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

	Event.on(document.body, 'click', '.toggle:not(.disabled)', handleToggle);

	function getState(name){
		if (toggleState[name] === undefined){
			toggleState[name] = true;
		}
		return toggleState[name];
	}

	// initialize toggle states

	function initializeToggleStates(evt){
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
	}

	Event.once(document.body, 'wb-workspace-initialized', null, initializeToggleStates);

	wb.toggleState = toggleState; // treat as read-only

})(wb, Event);
/*end menu.js*/

/*begin languages/scheme/boolean.json*/
wb.menu({
    "name": "Boolean",
    "help": "Booleans are true or false and expressions which evaluate to true or false",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "770756e8-3a10-4993-b02e-3d1333c98958",
            "type": "boolean",
            "script": "(&& {{1}} {{2}})",
            "help": "both operands are true",
            "sockets": [
                {
                    "name": "",
                    "type": "boolean"
                },
                {
                    "name": "and",
                    "type": "boolean"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a56c0d03-5c5c-4459-9aaf-cbbea6eb3abf",
            "type": "boolean",
            "script": "(|| {{1}} {{2}})",
            "help": "either or both operands are true",
            "sockets": [
                {
                    "name": "",
                    "type": "boolean"
                },
                {
                    "name": "or",
                    "type": "boolean"
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
                    "type": "boolean"
                },
                {
                    "name": "xor",
                    "type": "boolean"
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
                    "type": "boolean"
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
                    "value": 2,
                    "suffix": "is even"
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
                    "value": 1,
                    "suffix": "is odd"
                }
            ]
        }

    ]
}
);
/*end languages/scheme/boolean.json*/
