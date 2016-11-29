const {expect} = require("chai")
const whatsGoingOn = require("../")

const inspect = require("../inspect")

describe("Inspecting scribed objects", function() {
  const math = whatsGoingOn({
    add(a, b) {
      return a + b
    },

    multiply(a, b) {
      return a * b
    },
  })

  math.add(2, 3)
  math.multiply(4, 5)
  math.add(6, 7)

  describe("lastCall", () => {
    it("should return details of the last call to an object", () => {
      expect(inspect(math).lastCall()).to.eql({
        name: "add",
        call: {
          args: [6, 7],
          returnValue: 13,
        },
      })
    })

    it("should return details of the last call to a method", () => {
      expect(inspect(math.multiply).lastCall()).to.eql({
        args: [4, 5],
        returnValue: 20,
      })
    })

  })

  describe("tail", () => {
    it("should return the desired number of calls", () => {
      expect(inspect(math).tail(2)).to.have.length(2)
      expect(inspect(math).tail(1)[0]).to.equal(inspect(math).lastCall())
    })

    it("should return all the calls when there are fewer than the number requested", () => {
      expect(inspect(math).tail(20)).to.have.length(3)
      expect(inspect(math.add).tail(20)).to.have.length(2)
    })
  })

  describe("calls", () => {
    it("should return all the calls", () => {
      expect(inspect(math).calls).to.eql(inspect(math).tail(20))
    })
  })
})

describe("Using the inspection directly on the scribed object", () => {
  const english = whatsGoingOn({
    greet(a) {
      return "Hello " + a
    },

    concat(...args) {
      return args.join(" ")
    },
  })

  english.greet("Tom")
  english.concat(["how", "now", "brown", "cow"])
  english.greet("Steve")

  it("should have tail", () => {
    expect(english.__marvinInspect.tail(2)).to.eql(inspect(english).tail(2))
    expect(english.concat.__marvinInspect.tail(1)).to.eql(inspect(english.concat).tail(1))
  })

  it("should have lastCall", () => {
    expect(english.__marvinInspect.lastCall()).to.equal(inspect(english).lastCall())
    expect(english.greet.__marvinInspect.lastCall()).to.eql(inspect(english.greet).lastCall())
  })
})
