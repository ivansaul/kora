---
title: A Deep Dive into Structs in Swift
tags:
  - swift
  - swiftui
  - ios
  - structs
  - reference
  - guide
description: A complete guide to structs in Swift, covering value semantics, properties, methods, initializers, and when to choose structs over classes.
image: https://i.imgur.com/Qip2JiB.png
comments: true
---

# Structs in Swift

Structs are one of the two primary ways to define custom types in Swift, the other being classes. They are first-class citizens in the language — they can have properties, methods, initializers, subscripts, and protocol conformances. The standard library itself is built almost entirely on structs: `Int`, `Double`, `Bool`, `String`, `Array`, `Dictionary`, and `Set` are all structs.

The key distinction between structs and classes is how they are copied and shared. Structs are *value types*: every assignment or function argument creates an independent copy. Classes are *reference types*: assignments share the same underlying instance. This difference has significant implications for how you reason about state and ownership in your code.

---

## Defining a Struct

A struct is declared with the `struct` keyword, followed by its name and a body containing its members:

```swift
struct Temperature {
    var celsius: Double
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Temperature"></codapi-snippet>

```swift
var temp = Temperature(celsius: 100)
print(temp.celsius) // Output: 100.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Temperature"></codapi-snippet>

Members are accessed with dot syntax. You can read and write properties the same way, as long as the instance is declared with `var`. Instances declared with `let` are fully immutable — every property is locked, regardless of whether it was declared as `var` or `let` inside the struct:

```swift
let freezing = Temperature(celsius: 0)
freezing.celsius = 100
// → error: cannot assign to property: 'freezing' is a 'let' constant
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Temperature"></codapi-snippet>


This is one of the important properties of value types: mutability is controlled entirely at the binding site (`var` vs `let`), not inside the type definition.

---

## Stored Properties

Stored properties are the most fundamental kind of property — they store a value directly as part of the struct's memory. They can be constants (`let`) or variables (`var`).

```swift
struct User {
    let id: UUID          // constant — cannot change after init
    var username: String  // variable — can be updated
    var email: String
    var isActive: Bool = true  // has a default value
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="User"></codapi-snippet>

`let` properties can only be set once, during initialization. Any attempt to modify them afterward is a compile-time error. `var` properties can be updated freely on mutable instances.

Properties can have default values, which removes them from the memberwise initializer if you choose to rely on the default:

```swift
var user = User(id: UUID(), username: "alice", email: "alice@example.com")
// isActive is already true by default

user.username = "alice_updated"  // ✔ var property on a var instance
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="User"></codapi-snippet>

### Lazy Stored Properties

A lazy stored property defers its initialization until the first time it is accessed. This is useful when the initial value requires significant computation or depends on information that isn't available until after initialization.

```swift
struct DataProcessor {
    let dataSource: String

    lazy var processedData: [String] = {
        // Expensive operation — only runs when first accessed
        print("Processing...")
        return dataSource.split(separator: ",").map { String($0) }
    }()
}

var processor = DataProcessor(dataSource: "swift,ios,xcode")
print("Processor created")  // Output: Processor created
print(processor.processedData) // Output: Processing... then ["swift", "ios", "xcode"]
print(processor.processedData) // Output: ["swift", "ios", "xcode"] — not recomputed
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! note
    Lazy properties must always be declared with `var`, because their value is set after initialization. Instances that use lazy properties must themselves be `var` — a `let` instance would prevent the lazy property from ever being set.

---

## Computed Properties

Computed properties don't store a value — they derive one on demand using a getter, and optionally accept assignments through a setter. They are declared with `var` and use `{ get }` / `{ set }` blocks:

```swift
struct Temperature {
    var celsius: Double

    var fahrenheit: Double {
        get { celsius * 9 / 5 + 32 }
        set { celsius = (newValue - 32) * 5 / 9 }
    }

    var kelvin: Double {
        get { celsius + 273.15 }
        set { celsius = newValue - 273.15 }
    }
}

var temp = Temperature(celsius: 0)
print(temp.fahrenheit) // Output: 32.0
print(temp.kelvin)     // Output: 273.15

temp.fahrenheit = 212
print(temp.celsius)    // Output: 100.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

When a computed property only has a getter, you can omit the `get` keyword and write the body directly:

```swift
struct Circle {
    var radius: Double

    var diameter: Double { radius * 2 }
    var circumference: Double { 2 * .pi * radius }
    var area: Double { .pi * radius * radius }
}

let c = Circle(radius: 5)
print(c.diameter)      // Output: 10.0
print(c.area) // Output: 78.5398
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Property Observers

Property observers run code before or after a stored property changes. `willSet` runs just before the new value is stored, and `didSet` runs immediately after:

```swift
struct StepCounter {
    var steps: Int = 0 {
        willSet { print("About to set steps to \(newValue)") }
        didSet  { print("Walked \(steps - oldValue) new steps") }
    }
}

var counter = StepCounter()
counter.steps = 500
// Output: About to set steps to 500
// Output: Walked 500 new steps

counter.steps = 1200
// Output: About to set steps to 1200
// Output: Walked 700 new steps
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Initializers

Every struct gets a *memberwise initializer* for free — one that accepts a parameter for each stored property that doesn't have a default value. This is the most common way to initialize a struct:

```swift
struct Point {
    var x: Double
    var y: Double
}

let origin = Point(x: 0, y: 0)
let center = Point(x: 3.5, y: 7.0)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Point"></codapi-snippet>

### Custom Initializers

You can define custom initializers alongside the memberwise one. The best practice is to put custom initializers in an *extension*, which preserves the compiler-generated memberwise initializer as well:

```swift
extension Point {
    // Initialize from polar coordinates
    init(angle: Double, radius: Double) {
        self.x = radius * cos(angle)
        self.y = radius * sin(angle)
    }

    // A known convenient point
    static var zero: Point { Point(x: 0, y: 0) }
}

let p1 = Point(x: 1, y: 2)                    // memberwise
let p2 = Point(angle: .pi / 4, radius: 1.414) // custom
let p3 = Point.zero                            // static
```

!!! tip "Custom Initializers and Memberwise Init"
    If you define a custom initializer *inside* the struct body, the compiler no longer generates the memberwise initializer. Putting custom initializers in an extension is the idiomatic way to keep both. This pattern also appears in Apple's own frameworks.

Custom initializers can be *failable* by returning `nil` when the input isn't valid. Failable initializers are declared as `init?`:

```swift
struct Email {
    let address: String

    init?(_ string: String) {
        guard string.contains("@"), string.contains(".") else { return nil }
        self.address = string
    }
}

let valid   = Email("alice@example.com") // Optional(Email)
let invalid = Email("not-an-email")      // nil
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Methods

Structs can define instance methods — functions that operate on a specific instance and have access to its properties via `self`. A method that reads from the instance but doesn't modify it requires no special annotation:

```swift
struct Rectangle {
    var width:  Double
    var height: Double

    func area() -> Double {
        width * height
    }

    func perimeter() -> Double {
        2 * (width + height)
    }
}

let rect = Rectangle(width: 10, height: 5)
print(rect.area())      // Output: 50.0
print(rect.perimeter()) // Output: 30.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Mutating Methods

Because structs are value types, a method that needs to modify the struct's own properties must be marked `mutating`. This signals to the compiler — and to the reader — that calling this method changes the instance. Mutating methods can only be called on `var` instances:

```swift
struct BankAccount {
    private(set) var balance: Double

    mutating func deposit(_ amount: Double) {
        guard amount > 0 else { return }
        balance += amount
    }

    mutating func withdraw(_ amount: Double) -> Bool {
        guard amount > 0, amount <= balance else { return false }
        balance -= amount
        return true
    }
}

var account = BankAccount(balance: 100)
account.deposit(50)
print(account.balance) // Output: 150.0

let success = account.withdraw(30)
print(success)         // Output: true
print(account.balance) // Output: 120.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

Mutating methods can even replace `self` entirely. This is how `toggle()` works on `Bool` — it's a mutating method that sets `self` to its opposite:

```swift
struct Direction {
    enum Compass { case north, south, east, west }
    var heading: Compass

    mutating func reverse() {
        switch heading {
        case .north: self = Direction(heading: .south)
        case .south: self = Direction(heading: .north)
        case .east:  self = Direction(heading: .west)
        case .west:  self = Direction(heading: .east)
        }
    }
}

var dir = Direction(heading: .north)
dir.reverse()
print(dir.heading) // Output: south
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Static Members

Static properties and methods belong to the type itself, not to any particular instance. They are declared with the `static` keyword and accessed using the type name:

```swift
struct MathConstants {
    static let pi: Double = 3.14159265358979
    static let e: Double = 2.71828182845905
    static let phi: Double = 1.61803398874989

    static func circleArea(radius: Double) -> Double {
        pi * radius * radius
    }
}

print(MathConstants.pi) // Output: 3.14159265358979
print(MathConstants.circleArea(radius: 5)) // Output: 78.53981633974475
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

A common pattern is using static members to define named, pre-built instances of a type — similar to how `CGPoint.zero` or `URL.empty` work in Apple's frameworks:

```swift
extension Color {
    static let brand    = Color(r: 99,  g: 102, b: 241)
    static let success  = Color(r: 34,  g: 197, b: 94)
    static let warning  = Color(r: 234, g: 179, b: 8)
    static let danger   = Color(r: 239, g: 68,  b: 68)
}

// Usage
let buttonColor = Color.brand
```

---

## Value Semantics

The most important property of structs is that they are *value types*. Every time you assign a struct to a new variable or pass it to a function, you get an independent copy. Changes to one copy do not affect the other:

```swift
struct Point {
    var x: Double
    var y: Double
}

var a = Point(x: 1, y: 2)
var b = a // b is a copy of a

b.x = 99
print(a.x) // Output: 1.0 — a is unchanged
print(b.x) // Output: 99.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

The same is true when you pass a struct into a function. The function receives its own copy and cannot affect the original unless you explicitly pass it with `inout`:

```swift
func moveRight(_ point: Point) -> Point {
    var moved = point
    moved.x += 10
    return moved
}

let point  = Point(x: 0, y: 0)
let shifted = moveRight(point)

print(point.x)  // Output: 0.0 — unchanged
print(shifted.x) // Output: 10.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Point"></codapi-snippet>

!!! note
    Swift implements value semantics efficiently through *copy-on-write* for large types like `Array` and `String`. The actual copy is deferred until you modify the new instance — if you never modify it, no copy is made at all.

---

## Protocol Conformance

Structs can conform to any number of protocols. Because structs don't support inheritance, protocols are the primary mechanism for sharing behavior across struct types.

Conforming to standard library protocols unlocks language-level features. Structs whose properties are all `Equatable` and `Hashable` can have their conformance synthesized automatically:

```swift
struct Coordinate: Equatable, Hashable, Codable {
    var latitude:  Double
    var longitude: Double
}

// Equatable
let london = Coordinate(latitude: 51.5074, longitude: -0.1278)
let paris  = Coordinate(latitude: 48.8566, longitude:  2.3522)
print(london == paris) // Output: false

// Hashable — can use as Dictionary key or Set element
var visited: Set<Coordinate> = [london, paris]
print(visited.count) // Output: 2

// Codable — can encode/decode automatically
let encoded = try! JSONEncoder().encode(london)
print(String(data: encoded, encoding: .utf8)!)
// Output: {"latitude":51.5074,"longitude":-0.1278}
```

Conforming to `CustomStringConvertible` controls how the struct appears when printed:

```swift
extension Coordinate: CustomStringConvertible {
    var description: String {
        String(format: "%.4f°, %.4f°", latitude, longitude)
    }
}

print(london) // Output: 51.5074°, -0.1278°
```

---

## Structs vs. Classes

Choosing between a struct and a class is one of the most common design decisions in Swift. Apple's own guidelines lean heavily toward structs — SwiftUI models, all standard library collections, and most value objects in frameworks are structs. Classes are reserved for specific situations.

Use a **struct** when:

- The type represents a value — a coordinate, a color, a measurement, a configuration.
- You want independent copies when assigning or passing the type around.
- The type doesn't need to be subclassed.
- You want automatic `Equatable`/`Hashable` synthesis.

Use a **class** when:

- You need reference identity — two variables should deliberately point to the same object.
- You need inheritance or need to be subclassed.
- You are working with Objective-C APIs that require class types.
- The type manages a resource with a specific lifecycle (a file handle, a network connection), where `deinit` matters.

A practical way to think about it: if you'd describe the type as "a thing" (an object that exists somewhere, can be shared, and has a lifecycle), reach for a class. If you'd describe it as "a value" (something that represents data, like a number or a date), reach for a struct.

```swift
// [✔] Struct — it's a value, copies are fine and expected
struct Message {
    let id: UUID
    var body: String
    var isRead: Bool
}

// [✔] Class — it's an object that manages a connection resource
class WebSocketConnection {
    let url: URL
    private var isOpen = false

    init(url: URL) { self.url = url }
    deinit { close() }

    func open()  { isOpen = true }
    func close() { isOpen = false }
}
```

!!! tip
    When in doubt, start with a struct. It's easier to change a struct to a class later if you discover you need reference semantics than the other way around. SwiftUI is designed around structs entirely — if you're building UI, the answer is almost always a struct.
