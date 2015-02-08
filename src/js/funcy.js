"use strict";

function _createObj(k, v) {
  var result = {};
  result[k] = v;
  return result;
}

module.exports = {
  ply: function (f) { return Function.apply.bind(f, null); },
  fromKey: function (key, value) {
    if (arguments.length === 1) {
      return _createObj.bind(null, key);
    }

    return _createObj(key, value);
  }
};
