"use strict"

const DISTANT_LOVER = "proto"
const AINT_NOTHIN_LIKE_THE_REAL_THING = "mutate"

function marvin(object, {log, objectName, mode = DISTANT_LOVER} = {}) {
  if (Object.isFrozen(object)) return object
  const timer = typeof performance === "object" ? performance : Date

  const proxy = mode === DISTANT_LOVER ? Object.create(object) : object

  proxy.__marvin = []

  for (const name in object) {
    if (typeof object[name] === "function" && Object.getOwnPropertyDescriptor(object, name).writable) {
      const originalFunction = object[name]

      proxy[name] = function(...args) {
        const functionCall = {args}

        proxy[name].__marvin.push(functionCall)
        const methodCall = {name, call: functionCall}
        proxy.__marvin.push(methodCall)

        const startTime = timer.now()
        const returnValue = originalFunction.apply(this, args)
        const endTime = timer.now()

        functionCall.returnValue = returnValue
        functionCall.time = endTime - startTime

        log && log(
          objectName,
          methodCall,
          proxy[name].__marvin.slice(),
          proxy.__marvin.slice()
        )

        return returnValue
      }

      Object.defineProperty(proxy[name], "length", {value: originalFunction.length})
      Object.defineProperty(proxy[name], "name", {value: originalFunction.name})

      proxy[name].__marvin = []
    }
  }

  return proxy
}

marvin.mutative = function(object, options) {
  return marvin(object, Object.assign({}, options, {mode: AINT_NOTHIN_LIKE_THE_REAL_THING}))
}

module.exports = marvin
