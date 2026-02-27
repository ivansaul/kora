---
title: "Generics in Swift: Write Flexible and Reusable Code"
image: https://i.imgur.com/56yJvRh.png
tags:
  - swift
  - swiftui
  - generics
  - reference
  - guide
description: A complete guide to generics in Swift, covering core concepts, syntax, and advanced techniques in a simple and practical way.
comments: true
---

# Generics in Swift

Generics are one of Swift's most powerful features, and much of the standard library is built with them — `Array`, `Dictionary`, `Optional`, and `Result` are all generic types. They let you write flexible, reusable functions and types that can work with *any* type, subject to requirements you define — without sacrificing the compile-time type safety that makes Swift reliable.

In this guide, we'll go from the fundamentals of generic syntax, through constraints and protocol-based design, all the way to inheritance and associated types.

---

## The Basics

The core idea behind generics is simple: instead of writing the same logic multiple times for different types, you write it once using a *placeholder* type. That placeholder is resolved by the compiler when the code is actually used. The advantage over `Any` is that the compiler can still enforce strong type safety — `Any` opts out of that, generics do not.

A generic placeholder is defined within angle brackets `<>`, and by convention single-letter names like `T` are used for simple cases, while descriptive names (like `Element`, `Key`, `Value`) are preferred when the placeholder has a clear semantic role.

### Generic Functions

The simplest application of generics is a function that can operate on any type. Without generics, a function that swaps two values would need a separate version for every type it supports. With generics, it is written once:

```swift
func swapValues<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="swapValues"></codapi-snippet>

The placeholder `T` is declared inside angle brackets `<>` after the function name. Swift infers `T` from the arguments at the call site:

```swift
var x = 5
var y = 10
swapValues(&x, &y)
print(x, y) // Output: 10 5

var hello = "Hello"
var world = "World"
swapValues(&hello, &world)
print(hello, world) // Output: World Hello
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="swapValues"></codapi-snippet>

Because `T` must be the same type for both parameters, the compiler rejects mismatched calls before your code ever runs:

```swift
var number = 1
var word = "one"

swapValues(&number, &word)
// →  error: cannot convert value of type 'String'
// to expected argument type 'Int'
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="swapValues"></codapi-snippet>

Another common use case is a function that picks one of two values at random:

```swift
func pickRandom<T>(_ a: T, _ b: T) -> T {
    return Bool.random() ? a : b
}

let coin = pickRandom("heads", "tails") // String
let roll = pickRandom(1, 6)             // Int
```

!!! note "Placeholder Naming"
    By convention, single-letter names like `T` and `U` are used for simple, general-purpose placeholders. When the placeholder has a clear semantic role, a descriptive name is preferred. Swift's own `Array` uses `Element`, `Dictionary` uses `Key` and `Value`, and `Result` uses `Success` and `Failure`.

### Generic Types

The same mechanism applies to classes, structs, and enums. You declare the placeholder after the type name:

```swift
class Box<T> {
    var value: T
    
    init(value: T) {
        self.value = value
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Box"></codapi-snippet>


Swift can infer the type from the initializer, or you can be explicit:

```swift
let intBox    = Box(value: 42)              // Box<Int>, inferred
let stringBox = Box<String>(value: "Swift") // Box<String>, explicit
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Box"></codapi-snippet>

Once a generic type is instantiated, its placeholder is fixed for the lifetime of that instance. Accessing `box.value` will always return a `String` for this particular instance.


??? example "Example: Queue"
    A more practical example is a generic `Queue` — a first-in, first-out collection:

    ```swift
    struct Queue<Element> {
        private var elements: [Element] = []
    
        mutating func enqueue(_ value: Element) {
            elements.append(value)
        }
    
        mutating func dequeue() -> Element? {
            elements.isEmpty ? nil : elements.removeFirst()
        }
    
        var front: Element? {
            elements.first
        }
    
        var isEmpty: Bool {
            elements.isEmpty
        }
    }
    ```
    <codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Queue"></codapi-snippet>
    
    ```swift
    var taskQueue = Queue<String>()
    taskQueue.enqueue("Download file")
    taskQueue.enqueue("Parse response")
    taskQueue.enqueue("Update UI")
    
    print(taskQueue.front!)     // Output: Download file
    print(taskQueue.dequeue()!) // Output: Download file
    print(taskQueue.front!)     // Output: Parse response
    ```
    <codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Queue"></codapi-snippet>
  
    Once a generic type is instantiated with a particular type, that type is fixed for the entire lifetime of the instance. The `taskQueue` above will only ever hold `String` values — attempting to enqueue an `Int` is a compile-time error.

### Passing Generic Types

When you pass a generic type as a function argument, you must be explicit about the placeholder type you expect:

```swift
func unbox(_ box: Box<Int>) -> Int {
    return box.value
}
```

This function only accepts a `Box<Int>`. Passing a `Box<String>` will result in a compile-time error — by design.

### Multiple Type Parameters

A single generic type can carry more than one placeholder. Each parameter is separated by a comma inside the angle brackets:

```swift
class Pair<First, Second> {
    var first: First
    var second: Second

    init(first: First, second: Second) {
        self.first = first
        self.second = second
    }
}
```

Each placeholder is independent, so you can mix types freely:

```swift
struct Pair<First, Second> {
    let first: First
    let second: Second
}

let point    = Pair(first: 3.0, second: 4.0)     // Pair<Double, Double>
let labeled  = Pair(first: "score", second: 99)  // Pair<String, Int>
```

??? example "Example: Type-safe key-value store"
    A more practical use of multiple parameters is building a type-safe key-value store. The key type needs to be `Hashable` to be used in a dictionary lookup:

    ```swift
    struct KeyValueStore<Key: Hashable, Value> {
        private var storage: [Key: Value] = [:]
    
        mutating func set(_ value: Value, for key: Key) {
            storage[key] = value
        }
    
        func get(_ key: Key) -> Value? {
            storage[key]
        }
    
        mutating func remove(_ key: Key) {
            storage.removeValue(forKey: key)
        }
    }
    ```
    <codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="KeyValueStore"></codapi-snippet>
    
    ```swift
    var settings = KeyValueStore<String, Bool>()
    settings.set(true, for: "darkMode")
    settings.set(false, for: "notifications")
    
    print(settings.get("darkMode")!)        // Output: true
    print(settings.get("haptics") ?? false) // Output: false (key doesn't exist)
    ```
    <codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="KeyValueStore"></codapi-snippet>

---

## Type Constraints

Unconstrained generics can't do much beyond store and return values, because the compiler has no guarantee about what operations are available on the placeholder type. Type constraints let you require that a placeholder conforms to a protocol or inherits from a class, which unlocks the methods defined by that contract.

### Protocol Constraints

To constrain a generic placeholder, add the protocol requirement after a colon:

```swift
class Wrapper<T: Equatable> {
    var value: T

    init(value: T) {
        self.value = value
    }

    func isEqual(to other: T) -> Bool {
        return value == other
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Wrapper"></codapi-snippet>

Now `==` is available inside the class because the compiler knows `T` conforms to `Equatable`. Any type that doesn't conform will be rejected at the call site:

```swift
let intWrapper = Wrapper<Int>(value: 72)
print(intWrapper.isEqual(to: 72))    // true
print(intWrapper.isEqual(to: -274))  // false
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Wrapper"></codapi-snippet>

!!! note
    `[Int]` conforms to `Equatable` since Swift 4.1, as long as its `Element` type does.

### Multiple Constraints with `where`

When a placeholder needs to satisfy more than one constraint, or when you need to constrain based on an *associated type* of a placeholder rather than the placeholder itself, use a `where` clause placed after the argument list.

```swift
func printSorted<T>(values: [T]) where T: Comparable, T: CustomStringConvertible {
    for value in values.sorted() {
        print(value.description)
    }
}

printSorted(values: [3, 1, 4, 1, 5, 9]) // Output: 1 1 3 4 5 9
printSorted(values: ["banana", "apple", "cherry"]) // Output: apple banana cherry
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! warning "Outdated Syntax"
    You may find older code that puts the `where` clause *inside* the angle brackets:
    ```swift
    // Old syntax — valid but discouraged
    func doSomething<T where T: Comparable, T: Hashable>(first: T, second: T) { ... }
    ```
    The modern, idiomatic form places `where` after the parameter list, as shown above.

The `where` clause also lets you constrain based on a generic parameter's *associated type*. For example, a function that accepts any `Sequence` whose elements are `Numeric` and returns their sum:

```swift
func sum<S: Sequence>(_ sequence: S) -> S.Element where S.Element: Numeric {
    sequence.reduce(0, +)
}

print(sum([1, 2, 3, 4, 5]))  // Output: 15
print(sum([1.5, 2.5, 3.0]))  // Output: 7.0
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

The constraint `S.Element: Numeric` applies not to `S` (the sequence) but to its element type. This lets the function accept any `Sequence` — an `Array`, a `Set`, a `Range` — as long as what it contains is `Numeric`.

`where` clauses are equally valid on constrained extensions, which we'll see next.

---

## Constrained Extensions

Extensions can be written with conditions, making new methods available only when the generic placeholder satisfies certain requirements. This is how the standard library adds `sort()` only to arrays of `Comparable` elements, and `==` only to arrays of `Equatable` elements.

The following example extends `Queue` with a `contains(_:)` method, which is only meaningful when the elements can be compared for equality:

```swift
extension Queue where Element: Equatable {
    func contains(_ value: Element) -> Bool {
        return elements.contains(value)
    }
}

var numberQueue = Queue<Int>()
numberQueue.enqueue(1)
numberQueue.enqueue(2)
numberQueue.enqueue(3)

print(numberQueue.contains(2)) // Output: true
print(numberQueue.contains(9)) // Output: false
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="Queue"></codapi-snippet>

You can also extend types from the standard library. Here's an extension that adds a value-based remove to `Array`:

```swift
extension Array where Element: Equatable {
    /// Removes the first occurrence of the given element.
    mutating func remove(_ element: Element) {
        if let index = firstIndex(of: element) {
            remove(at: index)
        }
    }
}

var tags = ["swift", "ios", "xcode", "ios", "swiftui"]
tags.remove("ios")
print(tags) // Output: ["swift", "xcode", "ios", "swiftui"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

An extension that needs no constraint at all can still work generically — here one that splits any array into chunks of a given size:

```swift
extension Array {
    func chunked(into size: Int) -> [[Element]] {
        stride(from: 0, to: count, by: size).map {
            Array(self[$0 ..< Swift.min($0 + size, count)])
        }
    }
}

let numbers = [1, 2, 3, 4, 5, 6, 7]
print(numbers.chunked(into: 3))
// Output: [[1, 2, 3], [4, 5, 6], [7]]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Inheritance

Generic classes can be subclassed, and the subclass can work with the same placeholder, narrow its constraint, or specialize it to a concrete type.

```swift
class Repository<Model> {
    private(set) var items: [Model] = []

    func add(_ item: Model) {
        items.append(item)
    }

    func count() -> Int {
        items.count
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="Repository"></codapi-snippet>

A subclass can inherit the placeholder directly and add behavior:

```swift
class LoggedRepository<Model>: Repository<Model> {
    override func add(_ item: Model) {
        print("Adding item to repository")
        super.add(item)
    }
}
```

Or specialize the parent's placeholder to a concrete type, locking down what the subclass holds:

```swift
struct User {
    let name: String
}

class UserRepository: Repository<User> {
    func find(named name: String) -> User? {
        items.first { $0.name == name }
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="UserRepository" depends-on="Repository"></codapi-snippet>

```swift
let repo = UserRepository()
repo.add(User(name: "Alice"))
repo.add(User(name: "Bob"))

print(repo.count())                  // Output: 2
print(repo.find(named: "Alice")?.name ?? "Not found") // Output: Alice
print(repo.find(named: "Eve")?.name ?? "Not found")   // Output: Not found
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="UserRepository"></codapi-snippet>

---

## Associated Types

Protocols cannot use the `<T>` syntax directly, but they have an equivalent mechanism: `associatedtype`. It defines a placeholder that each conforming type resolves when it adopts the protocol.

Consider a protocol for objects that can be decoded from a dictionary. Without an associated type, the return value must be typed as `Any?`, forcing an unsafe cast at every call site:

```swift
// ⚠️ Return type is Any — type information is lost
protocol JSONDecodable {
    static func decode(from json: [String: Any]) -> Any?
}

// The caller must cast the result manually
let user = User.decode(from: json) as? User
```

With `associatedtype`, the return type can be expressed in terms of the conforming type itself:

```swift
protocol JSONDecodable {
    associatedtype DecodedType
    static func decode(from json: [String: Any]) -> DecodedType?
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="JSONDecodable"></codapi-snippet>

Each conforming type fills in the placeholder concretely:

```swift
struct User: JSONDecodable {
    let name: String
    let age: Int

    static func decode(from json: [String: Any]) -> User? {
        guard
            let name = json["name"] as? String,
            let age  = json["age"]  as? Int
        else { return nil }
        return User(name: name, age: age)
    }
}

struct Product: JSONDecodable {
    let id: Int
    let title: String

    static func decode(from json: [String: Any]) -> Product? {
        guard
            let id    = json["id"]    as? Int,
            let title = json["title"] as? String
        else { return nil }
        return Product(id: id, title: title)
    }
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="UserProduct" depends-on="JSONDecodable"></codapi-snippet>

```swift
let userJSON:    [String: Any] = ["name": "Alice", "age": 30]
let productJSON: [String: Any] = ["id": 1, "title": "Swift Book"]

let user    = User.decode(from: userJSON)       // User?    — no cast needed
let product = Product.decode(from: productJSON) // Product? — no cast needed

print(user?.name ?? "nil")     // Output: Alice
print(product?.title ?? "nil") // Output: Swift Book
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="UserProduct"></codapi-snippet>

### Using Associated Types as Constraints

Once a protocol has an associated type, you can constrain generic functions on that associated type using a `where` clause. For example, a function that decodes an array of items from a list of JSON dictionaries:

```swift
func decodeAll<T: JSONDecodable>(_ items: [[String: Any]]) -> [T] where T.DecodedType == T {
    items.compactMap { T.decode(from: $0) }
}

let usersJSON: [[String: Any]] = [
    ["name": "Alice", "age": 30],
    ["name": "Bob",   "age": 25],
    ["name": "Eve",   "age": 28],
]

let users: [User] = decodeAll(usersJSON)
print(users.map(\.name)) // Output: ["Alice", "Bob", "Eve"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="UserProduct"></codapi-snippet>

The constraint `T.DecodedType == T` ensures that `decode(from:)` returns the same type as the conforming type — not some other type — which is what allows us to collect the results in an `[T]` array directly.

---

## Opaque Return Types

Swift 5.1 introduced opaque return types with the `some` keyword. They are closely related to generics but work in the opposite direction: with a regular generic, the *caller* decides the type; with `some`, the *implementation* decides, and the caller only sees an abstract protocol-typed value.

This distinction is most visible in SwiftUI, where every `body` property is declared as `some View`:

```swift
struct ContentView: View {
    var body: some View {
        VStack {
            Text("Hello, World!")
            Text("Welcome to Swift")
        }
    }
}
```

The concrete return type of `body` is `VStack<TupleView<(Text, Text)>>`, but callers don't need to know that. They interact with it simply as *some* `View`. This hides implementation detail while preserving full type safety — unlike `any View` (a type-erased existential), `some View` allows the compiler to optimize and specialize the concrete type.

You can apply the same pattern to your own protocols. Using `JSONDecodable` from the section above:

```swift
func defaultModel() -> some JSONDecodable {
    return User(name: "Guest", age: 0)
}
```

The caller receives something that conforms to `JSONDecodable`, without the return type leaking `User` as a concrete type.

!!! tip "When to use `some` vs. explicit generics"
    Use explicit generics (`<T: Protocol>`) when the *caller* should decide what type to provide — for example, a function that accepts any collection. Use `some Protocol` when the *function or property* produces a value of a type it controls and wants to hide from callers.
