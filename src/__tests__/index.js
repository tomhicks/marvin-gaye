/* eslint max-nested-callbacks: 0 */

const {expect} = require("chai")
const sinon = require("sinon")

const marvin = require("../")

const curry = require("curry")

const modes = [
  {name: "delegation mode", fn: marvin},
  {name: "mutative mode", fn: marvin.mutative},
]

modes.map(({name: mode, fn: whatsGoingOn}) => {
  describe(`marvin (${mode})`, function() {
    describe("with default options", () => {
      describe("retaining function binding behaviour", () => {
        const tom = whatsGoingOn({
          name: "Tom",
          sayName() {
            return "Hello " + this.name
          },
        })

        it("should preserve the this of the method", () => {
          expect(tom.sayName()).to.equal("Hello Tom")
        })

        it("should not maintain a this if unbound", () => {
          const unbound = tom.sayName
          expect(unbound()).to.equal("Hello undefined")
        })

        it("should allow this binding", () => {
          const alan = {name: "Alan"}
          const sayHiAlan = tom.sayName.bind(alan)
          expect(sayHiAlan()).to.equal("Hello Alan")
        })
      })

      describe("retaining property access behaviour", () => {
        const simpleObject = whatsGoingOn({foo: "bar"})

        it("should retain normal property access behaviour", () => {
          expect(simpleObject.foo).to.equal("bar")
        })

        it("should allow normal property setting", () => {
          simpleObject.baz = "qux"
          expect(simpleObject.baz).to.equal("qux")
        })
      })

      it("should let function calls through", () => {
        const obj = {
          method() {
            return 5
          },
        }
        const loggedObject = whatsGoingOn(obj)
        sinon.spy(loggedObject, "method")

        const result = loggedObject.method(1, 2, 3)

        sinon.assert.calledWith(loggedObject.method, 1, 2, 3)
        expect(result).to.equal(5)
      })

      it("should work with curried functions", () => {
        const source = {
          curried(a, b) {
            return a + b
          },
        }

        const proxy = whatsGoingOn(source)
        const curriedAfterWrapping = curry(proxy.curried)

        expect(curriedAfterWrapping(1)(2)).to.equal(3)
      })

      it("should maintain the name", () => {
        const proxy = whatsGoingOn({
          myFunctionName(a, b) {
            return a + b
          },
        })

        expect(proxy.myFunctionName.name).to.equal("myFunctionName")
      })

      it("should skip unwritable properties", () => {
        const obj = Object.freeze({a() {}})
        expect(() => whatsGoingOn(obj)).to.not.throw()
      })
    })

    describe("when a logging function is passed", () => {
      let logSpy

      beforeEach(() => {
        logSpy = sinon.spy()
        const clock = sinon.useFakeTimers()
        const loggedObject = whatsGoingOn({
          jamie() {
            clock.tick(50)
            return 5
          },

          another() {
            clock.tick(50)
          },
        }, {log: logSpy})

        loggedObject.jamie(1, 2, 3)
        loggedObject.another()
        loggedObject.jamie(4, 5, 6)
      })

      it("should call the logging function for each method call", () => {
        sinon.assert.calledThrice(logSpy)
      })

      it("should call the logging function with name, arguments and returnValue", () => {
        expect(logSpy.firstCall.args[1]).to.eql({
          name: "jamie", call: {args: [1, 2, 3], returnValue: 5, time: 50},
        })

        expect(logSpy.secondCall.args[1]).to.eql({
          name: "another", call: {args: [], returnValue: undefined, time: 50},
        })

        expect(logSpy.thirdCall.args[1]).to.eql({
          name: "jamie", call: {args: [4, 5, 6], returnValue: 5, time: 50},
        })
      })

      it("should include the list of calls to that method as the third parameter", () => {
        expect(logSpy.firstCall.args[2]).to.eql([
          {args: [1, 2, 3], returnValue: 5, time: 50},
        ])

        expect(logSpy.thirdCall.args[2]).to.eql([
          {args: [1, 2, 3], returnValue: 5, time: 50},
          {args: [4, 5, 6], returnValue: 5, time: 50},
        ])
      })

      it("should include the list of calls to all methods as the fourth parameter", () => {
        expect(logSpy.firstCall.args[3]).to.eql([
          {name: "jamie", call: {args: [1, 2, 3], returnValue: 5, time: 50}},
        ])

        expect(logSpy.secondCall.args[3]).to.eql([
          {name: "jamie", call: {args: [1, 2, 3], returnValue: 5, time: 50}},
          {name: "another", call: {args: [], returnValue: undefined, time: 50}},
        ])

        expect(logSpy.thirdCall.args[3]).to.eql([
          {name: "jamie", call: {args: [1, 2, 3], returnValue: 5, time: 50}},
          {name: "another", call: {args: [], returnValue: undefined, time: 50}},
          {name: "jamie", call: {args: [4, 5, 6], returnValue: 5, time: 50}},
        ])
      })
    })

    describe("when a logging function and an object name is passed", () => {
      let logSpy

      beforeEach(() => {
        logSpy = sinon.spy()
        const loggedObject = whatsGoingOn({
          jamie() {
            return 5
          },
        }, {
          log: logSpy,
          objectName: "myObject",
        })

        loggedObject.jamie(1, 2, 3)
      })

      it("should include the object name with the log call", () => {
        expect(logSpy.firstCall.args[0]).to.eql("myObject")
      })
    })

    describe("when an object makes calls to itself", () => {
      const obj = {
        methodA() {
          return this.methodB() * 2
        },

        methodB() {
          return 5
        },
      }

      const loggedObject = whatsGoingOn(obj)
      const result = loggedObject.methodA()

      it("should record the function calls in call, not return order", () => {
        expect(result).to.equal(10)
        expect(loggedObject.__marvin[0]).to.have.property("name", "methodA")
        expect(loggedObject.__marvin[0]).to.have.property("call")
          .that.has.property("returnValue", 10)

        expect(loggedObject.__marvin[1]).to.have.property("name", "methodB")
        expect(loggedObject.__marvin[1]).to.have.property("call")
          .that.has.property("returnValue", 5)
      })
    })
  })
})

describe("specific mode characteristics", function() {
  it("normal mode should return the same object as passed in", () => {
    const source = {}
    const proxy = marvin(source)
    expect(proxy).not.to.equal(source)
  })

  it("mutative mode should return the same object as passed in", () => {
    const source = {}
    const proxy = marvin.mutative(source)
    expect(proxy).to.equal(source)
  })
})
