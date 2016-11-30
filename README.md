# marvin-gaye

> Talk to me so you can see what's going on

![](https://upload.wikimedia.org/wikipedia/en/thumb/8/84/MarvinGayeWhat%27sGoingOnalbumcover.jpg/220px-MarvinGayeWhat%27sGoingOnalbumcover.jpg)

## Quick start

```
npm install marvin-gaye
```

```javascript
import whatsGoingOn from "marvin-gaye"

const myObject = {
  method1() {},
}

const instrumentedObject = whatsGoingOn(myObject, {
  objectName: "myObject",
  log(objectName, methodCall, allFunctionCalls, allMethodCalls) {
    console.debug(methodCall.name, "called on", objectName)
  }
})

instrumentedObject.method1() // method1 called on myObject
```


## What does it do?

### In English
A utility that records data about calls to methods on a given object, with the option to notify you every time a method call is made.

### In technical terms
Creates a proxy object from a source object that wraps each function on that object, recording data about each function call. You can supply a callback which will be called every time a function is called on that object, so you can, for example, log each call to the console.

## Why is it useful?

### Debugging
Sometimes you pick up some code and you just want to know what is going on with some object, how it is being used, etc.

You can do this by putting in `debugger` statements or `console.log` calls, but usually you end up going down this path:

#### Step 1 - add simple flags
```javascript
console.log("here")
```

#### Step 2 - log the order of calls
```javascript
console.log("called function X")

console.log("called function Y")

console.log("called function Z")
```

#### Step 3 - change your code to store return values to inspect in more detail
```javascript
console.log(`myFunction called with ${arg1}, ${arg2}`)

const returnValue = 5
console.log(`myFunction returned ${returnValue}`)

return returnValue
```

#### Step 4 - undo all the changes you did, remembering to leave any functional changes in place
```
¯\_(ツ)_/¯
```

Having consistent, unobtrusive call logging in place makes this a lot easier.

### Performance optimisation

Seeing that a particular function is being called more often than you might expect is a good way to spot performance problems that you might have been unaware of.

Also, if a particular function is called repeatedly with the same inputs and causing the same outputs, it might just be a lovely pure function that could benefit from memoization.

## API

### Types

#### Object `FunctionCall`
Details about a call to a particular function
```
{
  args: Array(Maybe(Any)), // the arguments that the function was called with
  returnValue: Maybe(Any), // the return value of the function
}
```

#### Object `MethodCall`
Details about a call to a method; a method being simply a function that was a property of an object when it was called.
```
{
  name: String,       // the name of the method
  call: FunctionCall, // the details of the function call, as above
}
```

#### Function `MarvinLogger`
A function receiving the following arguments, called every time a method is called on your object.

##### Arguments

###### `String` `objectName`
The name passed in `MarvinConfiguration`, so you can namespace/filter your logs

###### `MethodCall` `methodCall`
The method call you are being told about

###### `Array(FunctionCall)` `allFunctionCalls`
All calls made to this method so far

###### `Array(MethodCall)` `allMethodCalls`
All calls made to all methods on this object

#### Object `MarvinConfiguration`
```
{
  objectName: Maybe(String), // allows you to namespace your log implementation
  log: Maybe(MarvinLogger),  // notifies you of calls to methods on your object
}
```

### Creation

To create an instrumented object, call the function returned from the `marvin-gaye` module and pass in the object you would like to instrument.

```javascript
import whatsGoingOn from "marvin-gaye"

const myObject = {
  method1() {},
  method2() {},
}

const instrumentedObject = whatsGoingOn(myObject)
```

This object has a `__marvin` property added which is an `Array` of `MethodCall`s.

Each method on that object has a `__marvin` property added, which is an `Array` of `FunctionCall`s

You can dig into these and deduce stuff about how your object is used.

### Logging

It is often useful to be informed when a call is made to a method. By passing a `MarvinConfiguration` as the second argument to `marvin-gaye`, your `MarvinLogger` will be called every time a method is called on your source object.


```javascript
import whatsGoingOn from "marvin-gaye"

const person = {
  name: "Tom",
  getPoliteIntroduction() {
    return `Hello, I am ${this.name}`
  }

  getCasualIntroduction() {
    return `Yo, I'm ${this.name}`
  }
}

const tom = whatsGoingOn(person, {
  objectName: "Tom",
  log(objectName, methodCall, allFunctionCalls, allMethodCalls) {
    console.debug(
      "call number", allFunctionCalls.length,
      "of method", methodCall.name,
      "on object", objectName,
      "was called with args", methodCall.call.args,
      "and returned", methodCall.call.returnValue
    )

    console.debug(
      objectName,
      "has had methods called on it", allMethodCalls.length, "times"
    )
  }
})

tom.getPoliteIntroduction()
// call number 1 of method getPoliteIntroduction on object Tom was called with args [] and returned Hello I am Tom
// Tom has had methods called on it 1 times

tom.getCasualIntroduction(1, 2, 3)
// call number 1 of method getCasualIntroduction on object Tom was called with args [1, 2, 3] and returned Yo I'm Tom
// Tom has had methods called on it 2 times
```
