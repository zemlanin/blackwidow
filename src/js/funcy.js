"use strict";

var _ = require('lodash');

module.exports = {
  apply: function (f) { return Function.apply.bind(f, null); },
  ta: _.partialRight.bind(null, _.at),
};
