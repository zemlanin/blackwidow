"use strict";

module.exports = {
  apply: function (f) { return Function.apply.bind(f, null); },
  fromKey: function (key, value) {
    var result = {};
    result[key] = value;
    return result;
  }
};
