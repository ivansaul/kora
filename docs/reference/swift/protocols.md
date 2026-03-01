---
title: "Protocols in Swift: Write Flexible and Reusable Code"
image: https://i.imgur.com/LH7x12C.png
tags:
  - swift
  - swiftui
  - ios
  - protocols
  - reference
  - guide
description: A complete guide to protocols in Swift, covering definitions, conformance, associated types, protocol extensions, and common design patterns.
comments: true
---

# Protocols in Swift

A protocol defines a contract — a set of properties, methods, initializers, and subscripts that a conforming type agrees to provide. Any `class`, `struct`, or `enum` can conform to a protocol, and a single type can conform to as many protocols as it needs.

Protocols are the foundation of how Swift achieves polymorphism without inheritance. Rather than sharing behavior through a class hierarchy, Swift types share it through protocols — a design philosophy known as *protocol-oriented programming*. The standard library itself is built almost entirely on protocols: `Equatable`, `Hashable`, `Comparable`, `Sequence`, `Collection`, and many more.

In this guide, we'll cover how to define and conform to protocols, how to give them default behavior through extensions, how associated types make them generic, and how they power common design patterns like delegation.

---

## Defining a Protocol

A protocol is declared with the `protocol` keyword, followed by the list of requirements. Requirements can include properties, methods, initializers, and subscripts.

```swift
protocol Describable {
    var description: String { get }
    func describe()
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Describable"></codapi-snippet>

Property requirements always specify whether the property must be gettable (`{ get }`) or gettable *and* settable (`{ get set }`). A `{ get }` property can be satisfied by a constant, a computed property, or even a variable — anything that can be read. A `{ get set }` property must be a variable.

Method requirements declare the signature without a body:

```swift
protocol Vehicle {
    var speed:      Double { get }
    var fuelLevel:  Double { get set }
    var passengers: Int    { get set }

    mutating func accelerate(by amount: Double)
    mutating func brake(by amount: Double)
    mutating func addPassenger()
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Vehicle"></codapi-snippet>

For value types, methods that modify `self` must be marked `mutating` in the protocol. Class conformances can omit `mutating` since classes have reference semantics and are always mutable.

Protocols can also require initializers:

```swift
protocol Configurable {
    init(configuration: [String: Any])
}
```

Any class conforming to a protocol with an initializer requirement must mark that initializer as `required`, so subclasses are guaranteed to also provide it.

---

## Conforming to a Protocol

A type declares conformance by listing the protocol after its name, separated by a colon. For classes, the superclass comes first:

```swift
struct Bicycle: Vehicle {
    var speed:      Double = 0
    var fuelLevel:  Double = 1.0  // always full on a bike
    var passengers: Int    = 1

    mutating func accelerate(by amount: Double) { speed += amount }
    mutating func brake(by amount: Double)      { speed = max(0, speed - amount) }
    mutating func addPassenger()                { passengers += 1 }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Vehicle"></codapi-snippet>

The compiler verifies that every requirement is satisfied. Missing a single method or property is a compile-time error — there are no runtime surprises.

Existing types, including types from frameworks you don't own, can be made to conform through an extension:

```swift
extension String: Describable {
    var description: String { self }
    func describe() { print(self) }
}

"Hello, protocols!".describe() // Output: Hello, protocols!
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Describable"></codapi-snippet>

---

## Protocols as Types

A protocol can be used as a type — known as an *existential* — anywhere a concrete type would appear. This lets you write code that works with any conforming type without knowing the specific type at compile time:

```swift
func printDescription(of item: Describable) {
    print(item.description)
}
```

Existentials are useful for heterogeneous collections. You can store values of different concrete types in the same array, as long as they all conform to the same protocol:

```swift
protocol Shape {
    var area: Double { get }
    var name: String { get }
}

struct Circle: Shape {
    let radius: Double
    var area: Double { .pi * radius * radius }
    var name: String { "Circle" }
}

struct Rectangle: Shape {
    let width, height: Double
    var area: Double { width * height }
    var name: String { "Rectangle" }
}

struct Triangle: Shape {
    let base, height: Double
    var area: Double { 0.5 * base * height }
    var name: String { "Triangle" }
}
```

```swift
let shapes: [any Shape] = [
    Circle(radius: 5),
    Rectangle(width: 4, height: 6),
    Triangle(base: 3, height: 8)
]

for shape in shapes {
    print("\(shape.name): area = \(String(format: "%.2f", shape.area))")
}
// Output:
// Circle: area = 78.54
// Rectangle: area = 24.00
// Triangle: area = 12.00
```

!!! note "The `any` keyword"
    Since Swift 5.7, existential types are written with the `any` keyword (`any Shape`) to make their boxing overhead explicit and distinguish them from `some Shape` (an opaque type). Both compile without `any` for now, but the keyword will eventually be required.

### Protocol Composition

When a function or variable needs a type that satisfies *multiple* protocols at once, you combine them with `&`. This creates a temporary type that requires all listed conformances:

```swift
protocol Printable {
    func printSelf()
}

protocol Serializable {
    func serialize() -> Data
}

func export(_ item: Printable & Serializable) {
    item.printSelf()
    let data = item.serialize()
    print("Serialized \(data.count) bytes")
}
```

Protocol composition is also common in function parameters and stored properties when you need to express a precise set of capabilities without introducing a new protocol.

---

## Protocol Inheritance

Protocols can inherit from one or more other protocols, building a hierarchy of requirements. A type conforming to the child protocol must satisfy the requirements of all parent protocols as well.

```swift
protocol Named {
    var name: String { get }
}

protocol Aged {
    var age: Int { get }
}

protocol Person: Named, Aged {
    var occupation: String { get }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="PersonProtocol"></codapi-snippet>

A type conforming to `Person` must provide `name`, `age`, *and* `occupation`:

```swift
struct Employee: Person {
    let name:       String
    let age:        Int
    let occupation: String
}

let emp = Employee(name: "Alice", age: 32, occupation: "Engineer")
print("\(emp.name), \(emp.age), \(emp.occupation)")
// Output: Alice, 32, Engineer
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="PersonProtocol"></codapi-snippet>

Protocol inheritance is how the standard library structures its collection hierarchy: `Collection` inherits from `Sequence`, `BidirectionalCollection` inherits from `Collection`, and `RandomAccessCollection` inherits from `BidirectionalCollection`. Each layer adds stricter requirements and unlocks more capabilities.

---

## Default Implementations

A protocol extension can provide a default implementation for any of the protocol's requirements. Conforming types inherit the default automatically, but can override it by providing their own.

```swift
protocol Greetable {
    var name: String { get }
    func greet() -> String
}

extension Greetable {
    func greet() -> String {
        "Hello, I'm \(name)."
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Greetable"></codapi-snippet>

Types that conform to `Greetable` only need to provide `name` — they get `greet()` for free:

```swift
struct Robot: Greetable {
    let name: String
}

struct Person: Greetable {
    let name: String

    // Override the default
    func greet() -> String {
        "Hi! My name is \(name) and I'm a person, not a robot."
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="RobotPerson" depends-on="Greetable"></codapi-snippet>

```swift
print(Robot(name: "R2-D2").greet())
// Output: Hello, I'm R2-D2.

print(Person(name: "Alice").greet())
// Output: Hi! My name is Alice and I'm a person, not a robot.
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="RobotPerson"></codapi-snippet>

Protocol extensions can also add entirely *new* methods — ones not declared as requirements — to every conforming type at once. This is how the standard library builds dozens of methods on top of `Sequence` from a single required method (`makeIterator()`).

```swift
extension Greetable {
    func shout() -> String {
        greet().uppercased()
    }
}

print(Robot(name: "C-3PO").shout())
// Output: HELLO, I'M C-3PO.
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Greetable RobotPerson"></codapi-snippet>

### Constrained Default Implementations

You can also provide default implementations that only apply when the conforming type satisfies additional constraints. The `where Self:` syntax targets a specific conforming type or an additional protocol requirement:

```swift
protocol Scorable {
    var score: Int { get }
    func rank() -> String
}

extension Scorable {
    // Default for all conforming types
    func rank() -> String { "Unranked" }
}

extension Scorable where Self: Comparable {
    // Richer default available only when the type is also Comparable
    func isHigherThan(_ other: Self) -> Bool {
        self.score > other.score
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Associated Types

Protocols cannot use the `<T>` syntax of generic types, but they have an equivalent mechanism: `associatedtype`. It declares a named placeholder that each conforming type resolves concretely.

A protocol that describes a storage container might look like this:

```swift
protocol Container {
    associatedtype Item

    var count: Int { get }
    mutating func add(_ item: Item)
    func item(at index: Int) -> Item
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Container"></codapi-snippet>

The conforming type determines what `Item` is — either explicitly via `typealias`, or implicitly through the types it uses in the implementation:

```swift
struct Bag<Element>: Container {
    private var items: [Element] = []

    var count: Int { items.count }

    mutating func add(_ item: Element) {
        items.append(item)
    }

    func item(at index: Int) -> Element {
        items[index]
    }
    // Swift infers Item == Element from the method signatures above
}

var bag = Bag<String>()
bag.add("Swift")
bag.add("Protocols")
print(bag.item(at: 0)) // Output: Swift
print(bag.count)       // Output: 2
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Container"></codapi-snippet>

Because `Item` is a placeholder, a protocol with `associatedtype` requirements cannot be used directly as an existential type — the compiler doesn't know what `Item` is without a concrete conforming type. It must be used as a generic constraint instead:

```swift
// ✅ Valid — T is concrete at compile time
func printCount<T: Container>(of container: T) {
    print("Container has \(container.count) items")
}

// ⛔ Not valid — Item is unknown
// func printCount(of container: any Container) { ... }
```

!!! tip
    If you need to use a protocol with associated types as an existential, Swift 5.7 introduced the `any` keyword with limited support, and `some` can be used when the concrete type is known to the function. For full flexibility, generic constraints remain the idiomatic approach.

---

## AnyObject Protocols

Protocols can be restricted to class types only by inheriting from `AnyObject`. This is useful when you need reference semantics — for example, when you want to hold a `weak` reference to the conforming type.

```swift
protocol AnyObjectProtocol: AnyObject {
    func doWork()
}

// ⛔ Structs cannot conform to AnyObject protocols
// struct MyStruct: AnyObjectProtocol { ... }
// → error: Non-class type 'MyStruct' cannot conform to class protocol

class MyService: AnyObjectProtocol {
    func doWork() { print("Working...") }
}

// ✅ weak is valid because the protocol is class-only
weak var service: AnyObjectProtocol?
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

The most common reason to use `AnyObject` is precisely `weak` references, which leads directly to the delegate pattern.

---

## Standard Library Protocols

Swift's standard library provides several foundational protocols that unlock language-level features when you conform to them. The most commonly implemented are `Equatable`, `Hashable`, `Comparable`, and `CustomStringConvertible`.

### Equatable

Conforming to `Equatable` enables the `==` and `!=` operators. For structs and enums with all-`Equatable` stored properties, the compiler can synthesize the conformance automatically:

```swift
struct Point: Equatable {
    var x: Double
    var y: Double
    // == is synthesized automatically
}

let a = Point(x: 1, y: 2)
let b = Point(x: 1, y: 2)
let c = Point(x: 3, y: 4)

print(a == b) // Output: true
print(a == c) // Output: false
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

When you need custom equality logic — for example, when two objects with different IDs should still be considered equal — you implement `==` manually:

```swift
struct User: Equatable {
    let id: UUID
    var name: String
    var email: String

    // Two users are equal if they have the same ID, regardless of other fields
    static func == (lhs: User, rhs: User) -> Bool {
        lhs.id == rhs.id
    }
}
```

### Hashable

`Hashable` inherits from `Equatable` and is required to use a type as a `Dictionary` key or `Set` element. Like `Equatable`, the compiler can synthesize `Hashable` for structs and enums whose stored properties are all `Hashable`. When you need custom logic, implement `hash(into:)`:

```swift
struct GridCell: Hashable {
    let row: Int
    let col: Int

    func hash(into hasher: inout Hasher) {
        hasher.combine(row)
        hasher.combine(col)
    }

    static func == (lhs: GridCell, rhs: GridCell) -> Bool {
        lhs.row == rhs.row && lhs.col == rhs.col
    }
}

var visited: Set<GridCell> = []
visited.insert(GridCell(row: 0, col: 0))
visited.insert(GridCell(row: 1, col: 2))
visited.insert(GridCell(row: 0, col: 0)) // duplicate, ignored

print(visited.count) // Output: 2

var scores: [GridCell: Int] = [:]
scores[GridCell(row: 0, col: 0)] = 100
print(scores[GridCell(row: 0, col: 0)]!) // Output: 100
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Comparable

`Comparable` enables the `<`, `>`, `<=`, and `>=` operators, and unlocks `sorted()`, `min()`, `max()`, and binary search. You only need to implement `<` — the standard library derives the rest:

```swift
struct Version: Comparable {
    let major: Int
    let minor: Int
    let patch: Int

    static func < (lhs: Version, rhs: Version) -> Bool {
        if lhs.major != rhs.major { return lhs.major < rhs.major }
        if lhs.minor != rhs.minor { return lhs.minor < rhs.minor }
        return lhs.patch < rhs.patch
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Version"></codapi-snippet>

```swift
let versions: [Version] = [
    Version(major: 2, minor: 0, patch: 0),
    Version(major: 1, minor: 9, patch: 3),
    Version(major: 2, minor: 1, patch: 0),
    Version(major: 1, minor: 0, patch: 0),
]

print(versions.sorted().map { "\($0.major).\($0.minor).\($0.patch)" })
// Output: ["1.0.0", "1.9.3", "2.0.0", "2.1.0"]

print(versions.max()!)
// Output: Version(major: 2, minor: 1, patch: 0)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Version"></codapi-snippet>

### CustomStringConvertible

Conforming to `CustomStringConvertible` controls how a type appears when printed or interpolated into a string. You provide a `description` computed property:

```swift
extension Version: CustomStringConvertible {
    var description: String {
        "\(major).\(minor).\(patch)"
    }
}

let current = Version(major: 2, minor: 1, patch: 0)
print(current)                      // Output: 2.1.0
print("Running version \(current)") // Output: Running version 2.1.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Version"></codapi-snippet>

!!! tip "Synthesized Conformances"
    For `Equatable` and `Hashable`, the compiler can synthesize the entire conformance for `struct`s and `enum`s as long as all stored properties (or associated values) also conform. Just declaring `struct Point: Equatable, Hashable` with `Double` properties is enough — no implementation needed.

---

## The Delegate Pattern

The delegate pattern is one of the most common patterns in Cocoa and UIKit. An object — the *delegating* object — offloads some of its responsibilities to a second object — the *delegate* — by calling methods on it through a protocol.

A classic use case: a `DownloadTask` that notifies an interested party when something happens, without being coupled to any specific type:

```swift
protocol DownloadTaskDelegate: AnyObject {
    func taskDidStart(_ task: DownloadTask)
    func task(_ task: DownloadTask, didUpdateProgress progress: Double)
    func taskDidFinish(_ task: DownloadTask)
    func task(_ task: DownloadTask, didFailWith error: Error)
}
```

The delegating object holds a `weak` reference to the delegate. It must be `weak` to avoid a retain cycle between the two objects:

```swift
class DownloadTask {
    weak var delegate: DownloadTaskDelegate?
    private let url: URL

    init(url: URL) { self.url = url }

    func start() {
        delegate?.taskDidStart(self)

        // Simulate incremental progress
        for i in stride(from: 0.0, through: 1.0, by: 0.25) {
            delegate?.task(self, didUpdateProgress: i)
        }

        delegate?.taskDidFinish(self)
    }
}
```

Any class can become a delegate by conforming to the protocol. The idiomatic approach is to put each conformance in its own extension:

```swift
class DownloadViewController {
    private var task: DownloadTask?

    func beginDownload(url: URL) {
        task = DownloadTask(url: url)
        task?.delegate = self
        task?.start()
    }
}

extension DownloadViewController: DownloadTaskDelegate {
    func taskDidStart(_ task: DownloadTask) {
        print("Download started")
    }

    func task(_ task: DownloadTask, didUpdateProgress progress: Double) {
        print("Progress: \(Int(progress * 100))%")
    }

    func taskDidFinish(_ task: DownloadTask) {
        print("Download complete")
    }

    func task(_ task: DownloadTask, didFailWith error: Error) {
        print("Failed: \(error.localizedDescription)")
    }
}
```

!!! warning "Always use `weak` for delegate properties"
    Because `DownloadTask` is owned by `DownloadViewController`, and `DownloadViewController` is the delegate, a strong reference from `DownloadTask` back to `DownloadViewController` would create a retain cycle. The `weak var delegate` prevents this.

### Optional Delegate Methods

Swift protocols don't have optional requirements by default — either every requirement is implemented or the code won't compile. There are two clean ways to make a delegate method optional without resorting to `@objc`.

The first is to provide a default empty implementation in a protocol extension:

```swift
protocol AnimationDelegate: AnyObject {
    func animationDidStart()
    func animationDidFinish()
    func animationDidCancel()
}

extension AnimationDelegate {
    func animationDidStart()  {}  // optional — default does nothing
    func animationDidFinish() {}  // optional — default does nothing
    func animationDidCancel() {}  // optional — default does nothing
}
```

The second, for Objective-C interoperability, is to mark the protocol and individual methods with `@objc optional`:

```swift
@objc protocol UITableViewDelegate {
    @objc optional func tableView(_ tableView: UITableView,
                                  willDisplay cell: UITableViewCell,
                                  forRowAt indexPath: IndexPath)
}
```

The `@objc optional` approach is primarily for UIKit/AppKit compatibility. For pure Swift code, default implementations in protocol extensions are preferred.
