const {expect} = require("chai")
const sinon = require("sinon")

const marvin = require("../")

describe("marvin", function() {
  describe("with default options", () => {
    const scribe = marvin()

    describe("retaining function binding behaviour", () => {
      const scribed = scribe({
        name: "Tom",
        sayName() {
          return "Hello " + this.name
        },
      })

      it("should preserve the this of the method", () => {
        expect(scribed.sayName()).to.equal("Hello Tom")
      })

      it("should not maintain a this if unbound", () => {
        const unbound = scribed.sayName
        expect(unbound()).to.equal("Hello undefined")
      })

      it("should allow this binding", () => {
        const alan = {name: "Alan"}
        const sayHiAlan = scribed.sayName.bind(alan)
        expect(sayHiAlan()).to.equal("Hello Alan")
      })
    })

    describe("retaining property access behaviour", () => {
      const scribed = scribe({foo: "bar"})

      it("should retain normal property access behaviour", () => {
        expect(scribed.foo).to.equal("bar")
      })

      it("should allow normal property setting", () => {
        scribed.baz = "qux"
        expect(scribed.baz).to.equal("qux")
      })
    })

    it("should let function calls through", () => {
      const spiedMethod = sinon.stub().returns(5)
      const scribed = scribe({spiedMethod})

      const result = scribed.spiedMethod(1, 2, 3)

      sinon.assert.calledWith(spiedMethod, 1, 2, 3)
      expect(result).to.equal(5)
    })
  })
})
