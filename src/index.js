const inspect = require("./inspect")

function marvin(/* options */) {
  return function(object) {
    const proxy = Object.create(object)

    proxy.__marvin = []
    proxy.__marvinInspect = inspect(proxy)

    for (const name in object) {
      if (typeof object[name] === "function") {
        proxy[name] = function(...args) {
          const returnValue = object[name].apply(this, args)

          const call = {args, returnValue}
          proxy[name].__marvin.push(call)
          proxy.__marvin.push({name, call})

          return returnValue
        }

        proxy[name].__marvin = []
        proxy[name].__marvinInspect = inspect(proxy[name])
      }
    }

    return proxy
  }
}

module.exports = marvin
