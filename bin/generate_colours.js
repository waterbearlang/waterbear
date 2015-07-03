// generate_colors
// Node program to maintain the vast supply of colour rules needed
// to defeat CSS cascading in Waterbear
//
// Used to generate the file $/css/block_colors.css
//
// Use sparingly. Void where prohibited.

var namespaces = [
    "control",
    "sprite",
    "music",
    "sound",
    "array",
    "boolean",
    "canvas",
    "color",
    "image",
    "math",
    "random",
    "vector",
    "object",
    "string",
    "path",
    "point",
    "rect",
    "input",
    "motion",
    "shape",
    "geolocation",
    "size",
    "text"
];

var typeToNamespace = {
    "number": "math",
    "color": "color",
    "text": "text",
    "boolean": "boolean",
    "sprite": "sprite",
    "any": "control",
    "sound": "sound",
    "array": "array",
    "wb-image": "image",
    "shape": "shape",
    "vector": "vector",
    "object": "object",
    "path": "path",
    "pathset": "path",
    "point": "point",
    "rect": "rect",
    "string": "string",
    "geolocation": "geolocation",
    "size": "size",
    "motion": "motion"
}

/* For 23 namespaces we want to scatter them across the hsl wheel

   Dividing the 23 namespaces by 7 gives us roughly thirds
   Dividing the wheel by 13-15 gives us nice segments without repeating
   Let's try 13 * 7 for jumps so the colours don't line up in rainbow order
*/

var hsljump = 15 * 7
var hues = {};
/* medium was found through trial and error. Light and dark are guesses for now */

var light = [63, 66];
var medium = [53, 56];
var dark = [43, 46];
var borderLight = [63,50];
var borderMedium = [53,40];
var borderDark = [43,30];

for (var i = 0; i < namespaces.length; i++){
    hues[namespaces[i]] = i * hsljump % 360;
}
/* Block templates by namespace */
/* light: applied when a block is selected, unless user is dragging */
var nsTemplateLight = '[ns="${ns}"].selected-block{background-color: hsl(${hue}, ${backgroundSat}%, ${backgroundLight}%); border-color: hsl(${hue}, ${borderSat}%, ${borderLight}%); }';
/* medium: default, also highlight while dragging for drop-targets */
var nsTemplateMedium = '[ns="${ns}"], .block-dragging [ns="${ns}"].drop-target{ background-color: hsl(${hue}, ${backgroundSat}%, ${backgroundLight}%); border-color: hsl(${hue}, ${borderSat}%, ${borderLight}%); }';
/* dark: all script blocks while dragging, including selected, except for drop targets */
var nsTemplateDark = '.block-dragging [ns="${ns}"],.block-dragging [ns="${ns}"].selected-block{background-color: hsl(${hue}, ${backgroundSat}%, ${backgroundLight}%); border-color: hsl(${hue}, ${borderSat}%, ${borderLight}%); }';

/* Block templates by return type */
/* light: applied when a block is selected, unless user is dragging */
var rtTemplateLight = 'wb-expression[type="${type}"].selected-block{ background-color: hsl(${hue}, ${backgroundSat}%, ${backgroundLight}%); border-color: hsl(${hue}, ${borderSat}%, ${borderLight}%); }'
/* medium: default, also highlight while dragging for drop-targets */
var rtTemplateMedium = 'wb-expression[type="${type}"], .block-dragging wb-expression[type="${type}"].drop-target{background-color: hsl(${hue}, ${backgroundSat}%, ${backgroundLight}%); border-color: hsl(${hue}, ${borderSat}%, ${borderLight}%); }'
/* dark: all script blocks while dragging, including selected, except for drop targets */
var rtTemplateDark = '.block-dragging wb-expression[type="${type}"], .block-dragging wb-expression[type="${type}"].selected-block{background-color: hsl(${hue}, ${backgroundSat}%, ${backgroundLight}%); border-color: hsl(${hue}, ${borderSat}%, ${borderLight}%); }'


function template(t, values){
    var keys = Object.keys(values);
    var output = t;
    for (var i = 0; i < keys.length; i++){
        var key = keys[i];
        var value = values[key];
        var replaceKey = '${' + key + '}';
        while(output.indexOf(replaceKey) > -1){
            output = output.replace(replaceKey, value);
        }
    }
    return output;
}

function applyAllNamespaceTemplates(namespace){
    console.log(template(nsTemplateLight, {hue: hues[namespace], ns: namespace, backgroundSat: light[0], backgroundLight: light[1], borderSat: borderLight[0], 'borderLight': borderLight[1]}));
    console.log(template(nsTemplateMedium, {hue: hues[namespace], ns: namespace, backgroundSat: medium[0], backgroundLight: medium[1], borderSat: borderMedium[0], borderLight: borderMedium[1]}));
    console.log(template(nsTemplateDark, {hue: hues[namespace], ns: namespace, backgroundSat: dark[0], backgroundLight: dark[1], borderSat: borderDark[0], borderLight: borderDark[1]}));
}

function applyAllTypeTemplates(type){
    var namespace = typeToNamespace[type];
    console.log(template(rtTemplateLight, {hue: hues[namespace], ns: namespace, backgroundSat: light[0], backgroundLight: light[1], borderSat: borderLight[0], 'borderLight': borderLight[1]}));
    console.log(template(rtTemplateMedium, {hue: hues[namespace], ns: namespace, backgroundSat: medium[0], backgroundLight: medium[1], borderSat: borderMedium[0], borderLight: borderMedium[1]}));
    console.log(template(rtTemplateDark, {hue: hues[namespace], ns: namespace, backgroundSat: dark[0], backgroundLight: dark[1], borderSat: borderDark[0], borderLight: borderDark[1]}));
}

function mainHeader(){
    console.log('/* This file is generated by $/bin/generate_colours.js');
    console.log(' * If you value your soul or your short time on earth,');
    console.log(' * then please make mods in that file and regenerate it.');
    console.log(' *');
    console.log(' * Life is too short to write this crap by hand.');
    console.log(' */\n');
}

function outputNamespaceRules(){
    console.log('/* Block colours by namespace, with handling for dimming');
    console.log(' * while dragging, highlighting drop-targets, and'); console.log(' * highlighting selected blocks.');
    console.log(' */\n');
    namespaces.forEach(applyAllNamespaceTemplates);
    console.log('\n\n');
}

function outputTypeRules(){
    console.log('/* Expression block colours by return type, with handling');
    console.log(' * for dimming while dragging, highlighting drop-targets,');
    console.log(' * and highlighting selected blocks.');
    console.log(' */\n');
    Object.keys(typeToNamespace).forEach(applyAllTypeTemplates);
    console.log('\n');
}

outputNamespaceRules();
outputTypeRules();
