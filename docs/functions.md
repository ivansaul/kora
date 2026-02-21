---
title: Functions
---

## Basic Use

Functions can be declared without parameters or a return value. The only required information is a name (`hello` in this case).

```swift
func hello() {
    print("Hello World")
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="hello"></codapi-snippet>

Call a function with no parameters by writing its name followed by an empty pair of parenthesis.

```swift
hello() //Output: "Hello World"
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="hello"></codapi-snippet>

## Functions with Parameters

Functions can take parameters so that their functionality can be modified. Parameters are given as a comma separated list with their types and names defined.

```swift
func magicNumber(number: Int) {
    print("\(number) Is the magic number")
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="magicNumber"></codapi-snippet>

> [!NOTE]
> The `\(number)` syntax is basic String Interpolation and is used to insert the integer into the String.

Functions with parameters are called by specifying the function by name and supplying an input value of the type used in the function declaration.

```swift
magicNumber(number: 5) //Output: "5 Is the magic number"

let example: Int = 10
magicNumber(number: example) //Output: "10 Is the magic number"
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="magicNumber"></codapi-snippet>

Any value of type `Int` could have been used.

```swift
func magicNumber(number1: Int, number2: Int) {
    print("\(number1 + number2) Is the magic number")
}
```

Use external parameter names to make function calls more readable.

```swift
func magicNumber(one number1: Int, two number2: Int) {
    print("\(number1 + number2) Is the magic number")
}

let ten: Int = 10
let five: Int = 5

magicNumber(one: ten, two: five) //Output: 15 Is the magic number
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>


Setting the default value in the function declaration allows you to call the function without giving any input values.

```swift
func magicNumber(one number1: Int = 5, two number2: Int = 10) {
    print("\(number1 + number2) Is the magic number")
}

magicNumber() //Output: 15 Is the magic number
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Subscripts

Classes, structures, and enumerations can define subscripts, which are shortcuts for accessing the member elements of a collection, list, or sequence.

### Example

```swift
struct DaysOfWeek {
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    subscript(index: Int) -> String {
        get {
            return days[index]
        }
        set {
            days[index] = newValue
        }
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="DaysOfWeek"></codapi-snippet>

### Usage

```swift
var week = DaysOfWeek()
//you access an element of an array at index by array[index].
debugPrint(week[1])
debugPrint(week[0])
week[0] = "Sunday"
debugPrint(week[0])
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="DaysOfWeek"></codapi-snippet>

## Subscripts Options

Subscripts can take any number of input parameters, and these input parameters can be of any type. Subscripts can also return any type. Subscripts can use variable parameters and variadic parameters, but cannot use in-out parameters or provide default parameter values.

### Example:

```swift
struct Food {
    enum MealTime {
        case Breakfast, Lunch, Dinner
    }
    var meals: [MealTime: String] = [:]
    subscript (type: MealTime) -> String? {
        get {
            return meals[type]
        }
        set {
            meals[type] = newValue
        }
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Food"></codapi-snippet>

### Usage

```swift
var diet = Food()
diet[.Breakfast] = "Scrambled Eggs"
diet[.Lunch] = "Rice"

debugPrint("I had \(diet[.Breakfast]) for breakfast")
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Food"></codapi-snippet>

## Methods

Instance methods are functions that belong to instances of a type in Swift (a class, struct, enumeration, or protocol). Type methods are called on a type itself.

### Instance Methods

Instance methods are defined with a `func` declaration inside the definition of the type, or in an extension.

```swift
class Counter {
    var count = 0
    func increment() {
        count += 1
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Counter"></codapi-snippet>

The `increment()` instance method is called on an instance of the `Counter` class:

```swift
let counter = Counter() // create an instance of Counter class
counter.increment() // call the instance method on this instance
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Counter"></codapi-snippet>

### Type Methods

Type methods are called on the type itself, not on an instance. They are declared using `static func` keyword.

```swift
struct Math {
    static func add(_ a: Int, _ b: Int) -> Int {
        a + b
    }
}

let sum = Math.add(2, 3)
print(sum)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

::: info static vs class
In classes, you can declare a type method using either:

- `static func` → cannot be overridden
- `class func` → can be overridden by subclasses

```swift
class Base {
  class func description() -> String {
      "Base"
  }
}

class Child: Base {
  override class func description() -> String {
      "Child"
  }
}
```

Use `class` only when you explicitly need subclass overriding behavior.
:::

## Variadic Parameters

Sometimes, it's not possible to list the number of parameters a function could need. Consider a sum function:

```swift
func sum(a: Int, b: Int) -> Int {
    a + b
}
```

This works fine for finding the sum of two numbers, but for finding the sum of three we'd have to write another function:

```swift
func sum(a: Int, b: Int, c: Int) -> Int {
   a + b + c
}
```

and one with four parameters would need another one, and so on. Swift makes it possible to define a function with a variable number of parameters using a sequence of three periods: `...`. For example,

```swift
func sum(_ numbers: Int...) -> Int {
    numbers.reduce(0, +)
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="sum"></codapi-snippet>

Notice how the `numbers` parameter, which is variadic, is coalesced into a single `Array` of type `[Int]`. This is true in general, variadic parameters of type `T...` are accessible as a `[T]`.

This function can now be called like so:

```swift
let a = sum(1, 2) // a == 3
let b = sum(3, 4, 5, 6, 7) // b == 25
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="sum"></codapi-snippet>

A variadic parameter in Swift doesn't have to come at the end of the parameter list, but there can only be one in each function signature.

Sometimes, it's convenient to put a minimum size on the number of parameters. For example, it doesn't really make sense to take the sum of no values. An easy way to enforce this is by putting some non-variadic required parameters and then adding the variadic parameter after. To make sure that `sum` can only be called with at least two parameters, we can write

```swift
func sum(_ n1: Int, _ n2: Int, _ numbers: Int...) -> Int {
    numbers.reduce(n1 + n2, +)
}

sum(1, 2) // ok
sum(3, 4, 5, 6, 7) // ok
sum(1) // not ok
sum() // not ok
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Passing and returning functions

The following function is returning another function as its result which can be later assigned to a variable and called:

```swift
func jediTrainer () -> ((String, Int) -> String) {
    func train(name: String, times: Int) -> (String) {
        "\(name) has been trained in the Force \(times) times"
    }
    return train
}

let train = jediTrainer()
train("obi Wan", 3)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Function types

Every function has its own function type, made up of the parameter types and the return type of the function itself. For example the following function:

```swift
func sum(x: Int, y: Int) -> Int {
   x + y
}
```

has a function type of:

```swift
(Int, Int) -> Int
```

Function types can thus be used as parameters types or as return types for nesting functions.

## Inout Parameters

Functions can modify the parameters passed to them if they are marked with the `inout` keyword. When passing an `inout` parameter to a function, the caller must add a `&` to the variable being passed.

```swift
func updateFruit(fruit: inout Int) {
    fruit -= 1
}

var apples = 30
print("There's \(apples) apples") // Prints "There's 30 apples"

updateFruit(fruit: &apples)

print("There's now \(apples) apples") // Prints "There's 29 apples".
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

This allows reference semantics to be applied to types which would normally have value semantics.

## Throwing Errors

If you want a function to be able to throw errors, you need to add the `throws` keyword after the parentheses that hold the arguments:

```swift
func errorThrow() throws -> String {
    // do something
}
```

When you want to throw an error, use the `throw` keyword:

```swift
func errorThrow() throws -> String {
    if true {
        return "True"
    } else {
        // Throwing an error
        throw Error.error
    }
}
```

If you want to call a function that can throw an error, you need to use the `try` keyword in a `do` block:

```swift
do {
    try errorThrow()
}
```

## Returning Values

Functions can return values by specifying the type after the list of parameters.

```swift
func findHypotenuse(a: Double, b: Double) -> Double {
    ((a * a) + (b * b)).squareRoot()
}

let c = findHypotenuse(a: 3, b: 4)
print(c) // Output: 5.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

Functions can also return multiple values using tuples.

```swift
func maths(_ number: Int) -> (times2: Int, times3: Int) {
    let two = number * 2
    let three = number * 3
    return (two, three)
}
let resultTuple = maths(5)
print(resultTuple) // Output: (10, 15)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Trailing Closure Syntax

When the last parameter of a function is a closure

```swift
func loadData(id: String, completion: (String) -> ()) {
    completion("This is the result data")
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="loadDat"></codapi-snippet>

the function can be invoked using the Trailing Closure Syntax

```swift
loadData(id: "123") { result in
    print(result)
}
```
