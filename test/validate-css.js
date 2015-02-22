/**
 * Validates the main CSS file.
 */

var fs = require('fs');
var validateCss = require('css-validator');

if (process.argv.length !== 3) {
    console.error('Must provide one filename to validate.');
    process.exit(-1);
}

var filename = process.argv[2];

var fileContents = fs.readFileSync(filename, {encoding: 'utf8'});

validateCss({text: fileContents, profile: 'css3'}, function (err, data) {
    if (data.warnings.length > 0) {
        console.error('\x1b[1mWarnings in', filename + '\x1b[m');
        console.error('\x1b[33m' + JSON.stringify(data.errors, null, 2) +
                      '\x1b[m');
    }
    if (data.errors.length > 0) {
        console.error('\x1b[1;31mErrors in', filename + '\x1b[m');
        console.error('\x1b[31m' + JSON.stringify(data.errors, null, 2) +
                      '\x1b[m');
    }

    /* Exit with an error status only if there are errors. */
    process.exit(data.validity ? 0 : 1);
});
