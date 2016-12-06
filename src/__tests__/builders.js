/* eslint max-nested-callbacks: 0 */

const {expect} = require("chai")
const {functionCall, methodCall} = require("../builders")

function assertFunctionCallShape(call) {
  expect(call).to.have.keys(["args", "returnValue", "time"])
  expect(call).to.have.property("args").that.is.an("array")
  expect(call).to.have.property("returnValue")
  expect(call).to.have.property("time").that.is.a("number")
}

function assertMethodCallShape(methodCall) {
  expect(methodCall).to.have.keys(["name", "call"])
  expect(methodCall).to.have.property("name").that.is.a("string")
  expect(methodCall).to.have.property("call").that.is.an("object")

  assertFunctionCallShape(methodCall.call)
}

describe("Building Marvin entities", function() {
  describe("functionCall", () => {
    it("should produce a valid call when no values are provided", () => {
      assertFunctionCallShape(functionCall().build())
    })

    it("should allow the args to be set", () => {
      const call = functionCall().withArgs([1, 2, 3]).build()

      expect(call).to.have.property("args").that.eqls([1, 2, 3])
      assertFunctionCallShape(call)
    })

    it("should allow a single arg to be set", () => {
      const call = functionCall().withArg(1).build()

      expect(call).to.have.property("args").that.eqls([1])
      assertFunctionCallShape(call)
    })

    it("should allow the return value to be set", () => {
      const call = functionCall().withReturnValue(1).build()

      expect(call).to.have.property("returnValue").that.eqls(1)
      assertFunctionCallShape(call)
    })

    it("should allow the time to execute to be set", () => {
      const call = functionCall().withTime(10).build()

      expect(call).to.have.property("time").that.eqls(10)
      assertFunctionCallShape(call)
    })

    it("should allow the values to be randomised", () => {
      const call = functionCall().withRandomValues().build()
      assertFunctionCallShape(call)
    })
  })

  describe("methodCall", () => {
    it("should produce a valid MethodCall with no arguments", () => {
      assertMethodCallShape(methodCall().build())
    })

    it("should allow the name to be set", () => {
      expect(methodCall().withName("myMethodName").build())
        .to.have.property("name").that.equals("myMethodName")
    })

    it("should allow the call to be set", () => {
      const fnCall = functionCall().build()
      const call = methodCall().withFunctionCall(fnCall).build()

      expect(call).to.have.property("call").that.equals(fnCall)
      assertMethodCallShape(call)
    })

    it("should allow the values to be randomised", () => {
      const call = methodCall().withRandomValues().build()
      assertMethodCallShape(call)
    })
  })
})
