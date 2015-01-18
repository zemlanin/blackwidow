module.exports = {
  apply: function (f) { return Function.apply.bind(f, null) },
}
