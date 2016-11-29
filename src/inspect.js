module.exports = function({__marvin}) {
  if (__marvin.constructor !== Array) {
    throw new RangeError("Not a scribed entity")
  }

  const calls = __marvin

  return {
    calls,

    lastCall() {
      const call = calls.slice(-1)
      return call[0]
    },

    tail(n) {
      return calls.slice(-Math.abs(n))
    },
  }
}
