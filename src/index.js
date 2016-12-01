"use strict"

const inspect = require("./inspect")

function marvin(object, {log, objectName} = {}) {
  const proxy = Object.create(object)

  proxy.__marvin = []
  proxy.__marvinInspect = inspect(proxy)

  for (const name in object) {
    if (typeof object[name] === "function" && Object.getOwnPropertyDescriptor(object, name).writable) {
      proxy[name] = function(...args) {
        const returnValue = object[name].apply(this, args)

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

      proxy[name].__marvin = []
      proxy[name].__marvinInspect = inspect(proxy[name])
    }
  }

  return proxy
}

module.exports = marvin
