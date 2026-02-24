---
title: Enums in Swift
description: A comprehensive guide to Swift enums, covering basic cases, associated values, pattern matching, raw values, indirect recursion, custom initializers, nested enums, and protocol conformance.
tags: 
  - swift
  - enums
  - reference
  - cheatsheet
image: https://i.imgur.com/UNbbLF5.png
comments: true
---

## Basic enumerations

An enum provides a set of related values:

```swift
enum Direction {
    case up
    case down
    case left
    case right
}
```

or

```swift
enum Direction {
    case up, down, left, right
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="direction"></codapi-snippet>

Enum values can be used by their fully-qualified name, but you can omit the type name when it can be inferred:

```swift
let dir = Direction.up
let dir: Direction = Direction.up
let dir: Direction = .up
```

```swift
func move(dir: Direction) {
  // do something
}

move(Direction.up)
move(.up)
```

```swift
class MyClass {
    var dir: Direction?
}

let obj = MyClass()
obj.dir = Direction.up
obj.dir = .up
```

The most fundamental way of comparing/extracting enum values is with a switch statement:

```swift
let dir: Direction = .up

switch dir {
case .up:
    print("Up")
case .down:
    print("Down")
case .left:
    print("Left")
case .right:
    print("Right")
}

// Output: Up
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="direction"></codapi-snippet>

Simple enums are automatically `Hashable`, `Equatable` and have string conversions:

```swift
let dir: Direction = .up

if dir == .down { 
  // perform some action
}

let dirs: Set<Direction> = [.right, .left]

print(Direction.up) // Output: up
debugPrint(Direction.up) // Output: Direction.up
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="direction"></codapi-snippet>

## Enums with associated values

Enum cases can contain one or more payloads (associated values):

```swift
// The "move" case has an associated distance
enum Action {
    case jump
    case kick
    case move(distance: Float)
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="action-enum"></codapi-snippet>

The payload must be provided when instantiating the enum value:

```swift
performAction(.jump)
performAction(.kick)
performAction(.move(distance: 3.3))
performAction(.move(distance: 0.5))

func performAction(_ action: Action) {
    print(action)
}
```

The `switch` statement can extract the associated value:

```swift
let action: Action = .move(distance: 5.0)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="action" depends-on="action-enum"></codapi-snippet>

```swift
switch action {
case .jump:
    break
case .kick:
    break
case .move(let distance):
    print("Moving: \(distance)")
}

// Output: Moving: 5.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="action-enum action"></codapi-snippet>

A single case extraction can be done using `if case`:

```swift
if case .move(let distance) = action {
    print("Moving: \(distance)")
}

// Output: Moving: 5.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="action"></codapi-snippet>

The `guard case` syntax can be used for later use extraction:

```swift
guard case .move(let distance) = action else {
    print("Action is not move")
    return
}
```

Enums with associated values are not `Equatable` by default. Implementation of the `==` operator must be done manually:

```swift
extension Action: Equatable {}

func == (lhs: Action, rhs: Action) -> Bool {
    switch lhs {
    case .jump:
        if case .jump = rhs { return true }

    case .kick:
        if case .kick = rhs { return true }

    case .move(let lhsDistance):
        if case .move (let rhsDistance) = rhs {
            return lhsDistance == rhsDistance
        }
    }
    return false
}
```

## Indirect payloads

Normally, enums can't be recursive (because they would require infinite storage):

```swift
enum Tree<T> {
    case leaf(T)
    case branch(Tree<T>, Tree<T>)
}
// → error: recursive enum 'Tree<T>' is not marked 'indirect'
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

The `indirect` keyword makes the enum store its payload with a layer of indirection, rather than storing it inline. You can use this keyword on a single case:

```swift
enum Tree<T> {
    case leaf(T)
    indirect case branch(Tree<T>, Tree<T>)
}

let tree = Tree.branch(.leaf(1), .branch(.leaf(2), .leaf(3)))
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

`indirect` also works on the whole enum, making any case indirect when necessary:

```swift
indirect enum Tree<T> {
    case leaf(T)
    case branch(Tree<T>, Tree<T>)
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Raw Values

Enums without payloads can have raw values of any literal type:

```swift
enum Rotation: Int {
    case up = 0
    case left = 90
    case upsideDown = 180
    case right = 270
}

let rotation = Rotation.up
print(rotation.rawValue) // Output: 0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="rotation"></codapi-snippet>

Enums without any specific type do not expose the `rawValue` property:

```swift
enum Rotation {
    case up
    case right
    case down
    case left
}

let rotation = Rotation.up
print(rotation.rawValue)
// → error: value of type 'Rotation' has no member 'rawValue'
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

Integer raw values are assumed to start at 0 and increase monotonically:

```swift
enum MetasyntacticVariable: Int {
    case foo // → rawValue = 0
    case bar // → rawValue = 1
    case baz = 7
    case quux // → rawValue = 8
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="metasyntactic"></codapi-snippet>

String raw values can be synthesized automatically:

```swift
enum MarsMoon: String {
    case phobos // → rawValue = "phobos"
    case deimos // → rawValue = "deimos"
}
```

A raw-valued enum automatically conforms to `RawRepresentable`. You can get an enum value's corresponding raw value with `.rawValue`:

```swift
func rotate(rotation: Rotation) {
    let degrees = rotation.rawValue
}
```

You can also create an enum from a raw value using `init?(rawValue:)`:

```swift
enum Rotation: Int {
    case up = 0
    case left = 90
    case upsideDown = 180
    case right = 270
}

let rotation = Rotation(rawValue: 0)
print(rotation) // Output: Optional(Rotation.Up)

let otherRotation = Rotation(rawValue: 45)
// → otherRotation = nil (there is no Rotation with rawValue 45)
print(otherRotation) // Output: nil
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Initializers

Enums can have custom init methods that can be more useful than the default `init?(rawValue:)`. Enums can also store values as well. This can be useful for storing the values they where initialized with and retrieving that value later.

```swift
enum CompassDirection {
    case north(Int)
    case south(Int)
    case east(Int)
    case west(Int)
}

extension CompassDirection {
    init?(degrees: Int) {
        switch degrees {
        case 0...45:
            self = .north(degrees)
        case 46...135:
            self = .east(degrees)
        case 136...225:
            self = .south(degrees)
        case 226...315:
            self = .west(degrees)
        case 316...360:
            self = .north(degrees)
        default:
            return nil
        }
    }

    var value: Int {
        switch self {
        case .north(let degrees):
            return degrees
        case .south(let degrees):
            return degrees
        case .east(let degrees):
            return degrees
        case .west(let degrees):
            return degrees
        }
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="compass"></codapi-snippet>

Using that initializer we can do this:

```swift
var direction = CompassDirection(degrees: 90) 
// → direction = Optional(CompassDirection.east)

print(direction?.value) // Output: Optional(90)

direction = CompassDirection(degrees: 500)
// → direction = nil

print(direction?.value) // Output: nil
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="compass"></codapi-snippet>

## Nested Enumerations

You can nest enumerations one inside an other, this allows you to structure hierarchical enums to be more organized and clear.

```swift
enum Orchestra {
    enum Strings {
        case violin
        case viola
        case cello
        case doubleBase
    }

    enum Keyboards {
        case piano
        case celesta
        case harp
    }

    enum Woodwinds {
        case flute
        case oboe
        case clarinet
        case bassoon
        case contrabassoon
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Orchestra"></codapi-snippet>

And you can use it like that:

```swift
let instrument1 = Orchestra.Strings.viola
let instrument2 = Orchestra.Keyboards.piano
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Orchestra"></codapi-snippet>

## Bonus

Enums in Swift are much more powerful than some of their counterparts in other languages, such as C. They share many features with classes and structs, such as defining initialisers, computed properties, instance methods, protocol conformance and extensions.

```swift
protocol ChangesDirection {
    mutating func changeDirection()
}

enum Direction {

    // enumeration cases
    case up, down, left, right

    // initialise the enum instance with a case
    // that's in the opposite direction to another
    init(oppositeTo otherDirection: Direction) {
        self = otherDirection.opposite
    }

    // computed property that returns the opposite direction
    var opposite: Direction {
        switch self {
        case .up:
            return .down
        case .down:
            return .up
        case .left:
            return .right
        case .right:
            return .left
        }
    }
}

// extension to Direction that adds conformance
// to the ChangesDirection protocol
extension Direction: ChangesDirection {
    mutating func changeDirection() {
        self = .left
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="direction-2"></codapi-snippet>

```swift
var dir = Direction(oppositeTo: .down) 
// → dir = Direction.up

dir.changeDirection()
// → dir = Direction.left

let opposite = dir.opposite 
// → dir = Direction.right

debugPrint(dir) // Output: Direction.left
debugPrint(opposite) // Output: Direction.right
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="direction-2"></codapi-snippet>
