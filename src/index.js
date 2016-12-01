"use strict"

const inspect = require("./inspect")

const DISTANT_LOVER = "proto"
const AINT_NOTHIN_LIKE_THE_REAL_THING = "mutate"

function marvin(object, {log, objectName, mode = DISTANT_LOVER} = {}) {
  if (Object.isFrozen(object)) return object

  const proxy = mode === DISTANT_LOVER ? Object.create(object) : object

  proxy.__marvin = []
  proxy.__marvinInspect = inspect(proxy)

  for (const name in object) {
    if (typeof object[name] === "function" && Object.getOwnPropertyDescriptor(object, name).writable) {
      const originalFunction = object[name]

      proxy[name] = function(...args) {
        const returnValue = originalFunction.apply(this, args)

        const functionCall = {args, returnValue}
        proxy[name].__marvin.push(functionCall)

        const methodCall = {name, call: functionCall}
        proxy.__marvin.push(methodCall)

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
      proxy[name].__marvinInspect = inspect(proxy[name])
    }
  }

  return proxy
}

marvin.mutative = function(object, options) {
  return marvin(object, Object.assign({}, options, {mode: AINT_NOTHIN_LIKE_THE_REAL_THING}))
}

module.exports = marvin
