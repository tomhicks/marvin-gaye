/* eslint max-nested-callbacks: 0 */

const {expect} = require("chai")
const sinon = require("sinon")

const marvin = require("../")

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

      it("should skip unwritable properties", () => {
        const obj = Object.freeze({a() {}})
        expect(() => whatsGoingOn(obj)).to.not.throw()
      })
    })

    describe("when a logging function is passed", () => {
      let logSpy

      beforeEach(() => {
        logSpy = sinon.spy()
        const loggedObject = whatsGoingOn({
          jamie() {
            return 5
          },

          another() {},
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
          name: "jamie", call: {args: [1, 2, 3], returnValue: 5},
        })

        expect(logSpy.secondCall.args[1]).to.eql({
          name: "another", call: {args: [], returnValue: undefined},
        })

        expect(logSpy.thirdCall.args[1]).to.eql({
          name: "jamie", call: {args: [4, 5, 6], returnValue: 5},
        })
      })

      it("should include the list of calls to that method as the third parameter", () => {
        expect(logSpy.firstCall.args[2]).to.eql([
          {args: [1, 2, 3], returnValue: 5},
        ])

        expect(logSpy.thirdCall.args[2]).to.eql([
          {args: [1, 2, 3], returnValue: 5},
          {args: [4, 5, 6], returnValue: 5},
        ])
      })

      it("should include the list of calls to all methods as the fourth parameter", () => {
        expect(logSpy.firstCall.args[3]).to.eql([
          {name: "jamie", call: {args: [1, 2, 3], returnValue: 5}},
        ])

        expect(logSpy.secondCall.args[3]).to.eql([
          {name: "jamie", call: {args: [1, 2, 3], returnValue: 5}},
          {name: "another", call: {args: [], returnValue: undefined}},
        ])

        expect(logSpy.thirdCall.args[3]).to.eql([
          {name: "jamie", call: {args: [1, 2, 3], returnValue: 5}},
          {name: "another", call: {args: [], returnValue: undefined}},
          {name: "jamie", call: {args: [4, 5, 6], returnValue: 5}},
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
