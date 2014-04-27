// This returns a Version 4 (random) UUID
// See: https://en.wikipedia.org/wiki/Universally_unique_identifier for more info

(function(runtime){
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

  runtime.uuid = uuid;
  runtime.isUuid = isUuid;

})(this);
