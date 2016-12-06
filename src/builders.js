exports.functionCall = function() {
  const call = {
    args: [],
    returnValue: undefined,
    time: 1,
  }

  const builder = {
    build() {
      return call
    },

    withArgs(args) {
      call.args = args
      return builder
    },

    withArg(arg) {
      call.args = [arg]
      return builder
    },

    withReturnValue(value) {
      call.returnValue = value
      return builder
    },

    withTime(value) {
      call.time = value
      return builder
    },

    withRandomValues() {
      call.time = Math.random()
      call.returnValue = Math.random()
      call.args = randomArgs()

      return builder
    },
  }

  return builder
}

exports.methodCall = function() {
  const methodCall = {
    name: randomName(),
    call: undefined,
  }

  const builder = {
    build() {
      if (!methodCall.call) {
        methodCall.call = exports.functionCall().build()
      }

      return methodCall
    },

    withName(name) {
      methodCall.name = name
      return builder
    },

    withFunctionCall(call) {
      methodCall.call = call
      return builder
    },

    withRandomValues() {
      methodCall.name = randomName()
      methodCall.call = exports.functionCall().withRandomValues().build()

      return builder
    },
  }

  return builder
}

function randomName() {
  return "method" + Math.floor(Math.random() * 100000)
}

function randomArgs() {
  const length = Math.floor(Math.random() * 6)
  const args = []

  for (let i = 0; i < length; i++) {
    args.push(Math.random())
  }

  return args
}
