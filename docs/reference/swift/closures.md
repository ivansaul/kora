---
title: The Ultimate Guide to Closures in Swift
image: https://i.imgur.com/4CH8pGL.png
tags:
  - swift
  - swiftui
  - closures
  - reference
  - guide
description: A complete guide to closures in Swift, covering core concepts, syntax, and advanced techniques in a simple and practical way.
comments: true
---

# Closures in Swift

Closures are self-contained blocks of functionality that can be stored in variables, passed as arguments, and returned from functions. They are the same concept known as *lambdas* or *blocks* in other languages. In Swift, functions are a special case of closures, so everything that applies to closures applies to functions as well.

Closures are central to Swift's standard library — `map`, `filter`, `reduce`, `sort`, and most asynchronous APIs all take closures as parameters. Understanding how they work, how they capture values, and how they interact with memory is essential for writing correct and efficient Swift code.

In this guide, we'll cover the syntax from first principles, how closures behave when passed into functions, the memory implications of capturing values, and how to handle errors inside closures.

---

## Closure Basics

The simplest closure is a block of code assigned to a variable. Its type is a *function type*, written as `(parameters) -> ReturnType`:

```swift
let sayHello = { print("Hello, World!") }
// The type of sayHello is "() -> Void"

sayHello() // Output: Hello, World!
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

Like regular functions, closures can accept parameters and return values. The parameter list and return type appear before the `in` keyword, which separates the signature from the body:

```swift
let add = { (x: Int, y: Int) -> Int in
    return x + y
}
// The type of add is "(Int, Int) -> Int"

let result = add(3, 5)
print(result) // Output: 8
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Capturing Values

One of the defining characteristics of closures is that they can *capture* values from the surrounding scope. The captured values are kept alive by the closure even after the original scope has ended:

```swift
func makeCounter() -> () -> Int {
    var count = 0
    let increment = {
        count += 1
        return count
    }
    return increment
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="makeCounter"></codapi-snippet>

```swift
let counter = makeCounter()
print(counter()) // Output: 1
print(counter()) // Output: 2
print(counter()) // Output: 3
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="makeCounter"></codapi-snippet>

Each call to `makeCounter()` creates an independent `count` variable. Two closures from separate calls capture separate instances:

```swift
let counterA = makeCounter()
let counterB = makeCounter()

print(counterA()) // Output: 1
print(counterA()) // Output: 2
print(counterB()) // Output: 1  — independent from counterA
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="makeCounter"></codapi-snippet>

---

## Syntax Variations

Swift offers several ways to write closures, ranging from fully explicit to extremely compact. The compiler can infer parameter types, return types, and even `return` itself, depending on context.

The following six declarations all define the same closure — one that takes an `Int` and returns `Int + 1`:

```swift
// Fully explicit
let addOne = { (x: Int) -> Int in return x + 1 }

// Return inferred from body
let addOne = { (x: Int) -> Int in x + 1 }

// Return type inferred
let addOne = { (x: Int) in x + 1 }

// Parameter name without type annotation (type inferred from context)
let addOne = { x in x + 1 }

// Shorthand argument name
let addOne: (Int) -> Int = { $0 + 1 }
```

Shorthand argument names (`$0`, `$1`, `$2`, …) refer to the first, second, and third parameters respectively. They are most readable in short closures:

```swift
let numbers = [5, 3, 8, 1, 9, 2]

let sorted   = numbers.sorted { $0 < $1 }
let doubled  = numbers.map    { $0 * 2 }
let evens    = numbers.filter { $0.isMultiple(of: 2) }

print(sorted)  // Output: [1, 2, 3, 5, 8, 9]
print(doubled) // Output: [10, 6, 16, 2, 18, 4]
print(evens)   // Output: [8, 2]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! tip "Operator Functions as Closures"
    When the closure body is simply an operator applied to both arguments, you can pass the operator directly. Swift operators are functions, so `sorted(by: <)` is equivalent to `sorted(by: { $0 < $1 })`:
    ```swift
    let sorted = numbers.sorted(by: <)
    ```

When the type of a closure can't be inferred from context — for example, when you assign it directly to a variable without a type annotation — you need to specify at least the parameter types:

```swift
// The closure's full type must be specified somewhere.
let multiply: (Int, Int) -> Int = { $0 * $1 }

// Or the parameter types must be explicit inside the closure.
let multiply = { (x: Int, y: Int) in x * y }
```

---

## Closures as Parameters

Functions can declare parameters whose type is a closure type. This is how most of Swift's higher-order functions work:

```swift
func apply(_ value: Int, transform: (Int) -> Int) -> Int {
    return transform(value)
}

print(apply(4, transform: { $0 * $0 })) // Output: 16
print(apply(10, transform: { $0 - 3 })) // Output: 7
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Trailing Closure Syntax

When a closure is the last argument of a function, it can be written *after* the closing parenthesis. This is called *trailing closure syntax*, and it makes the code feel more like a built-in language construct:

```swift
// Standard call
apply(4, transform: { $0 * $0 })

// Trailing closure
apply(4) { $0 * $0 }
```

If the closure is the *only* argument, the parentheses can be omitted entirely:

```swift
import Foundation

func measure(block: () -> Void) {
    let start = Date()
    block()
    print("Elapsed: \(Date().timeIntervalSince(start))s")
}

measure {
    // expensive work here
    _ = (1...100_000).map { $0 * $0 }
}
```

### Multiple Trailing Closures

When a function takes more than one closure parameter, Swift allows the first to use standard trailing syntax and the rest to use labeled trailing syntax:

```swift
func loadData(
    onSuccess: (String) -> Void,
    onFailure: (Error) -> Void
) {
    // Simulated result
    onSuccess("Response data")
}

loadData {
    print("Success: \($0)")
} onFailure: {
    print("Error: \($0)")
}

// Output →  Success: Response data
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Escaping Closures

By default, a closure passed as a function parameter is *non-escaping*: the compiler guarantees it will be called before the function returns and will not be stored anywhere. This allows the compiler to make certain optimizations and means `self` doesn't need to be referenced explicitly inside the closure.

When a closure needs to outlive the function call — for example, to be stored in a property or called asynchronously — it must be marked `@escaping`:

```swift
class TaskRunner {
    var completionHandlers: [() -> Void] = []

    // Without @escaping, this would not compile —
    // the closure is stored, so it must be allowed to escape.
    func addTask(_ handler: @escaping () -> Void) {
        completionHandlers.append(handler)
    }

    func runAll() {
        completionHandlers.forEach { $0() }
    }
}

let runner = TaskRunner()
runner.addTask { print("Task 1 done") }
runner.addTask { print("Task 2 done") }
runner.runAll()
// Output:
// Task 1 done
// Task 2 done
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

A common scenario for `@escaping` closures is a completion-based network request, where the callback is invoked after an async operation finishes:

```swift
func fetchUser(id: Int, completion: @escaping (Result<String, Error>) -> Void) {
    DispatchQueue.global().async {
        // Simulate network delay
        let name = "Alice" // Imagine this came from an API response
        DispatchQueue.main.async {
            completion(.success(name))
        }
    }
}

fetchUser(id: 42) { result in
    switch result {
    case .success(let name): print("Fetched user: \(name)")
    case .failure(let error): print("Error: \(error)")
    }
}
```

!!! note
    `@escaping` requires that any capture of `self` inside the closure be explicit. This is intentional — it forces you to acknowledge the memory management implications discussed in the next section.

---

## Capture Lists and Memory Management

When a closure captures a reference type (a class instance), it holds a **strong reference** by default. This means the captured object is kept alive as long as the closure itself is alive, which can sometimes prevent deallocation when you don't expect it.

```swift
class DataLoader {
    var data: String = "loaded data"
    deinit { print("DataLoader deallocated") }
}

var loader: DataLoader? = DataLoader()

let closure: () -> Void = {
    print(loader!.data) // Strong capture — loader stays alive
}

loader = nil  // Setting to nil does NOT deallocate,
              // because the closure still holds a strong reference.
closure()     // Output: loaded data
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

A *capture list* — written in square brackets before the parameter list — lets you specify how each value should be captured. The two alternatives to strong references are `weak` and `unowned`.

### Weak References

A `weak` capture does not prevent deallocation. The captured value becomes an `Optional` inside the closure, so you must unwrap it before use:

```swift
class DataLoader {
    var data: String = "loaded data"
    deinit { print("DataLoader deallocated") }
}

var loader: DataLoader? = DataLoader()

let closure: () -> Void = { [weak loader] in
    if let loader = loader {
        print(loader.data)
    } else {
        print("loader was deallocated")
    }
}

closure()    // Output: loaded data
loader = nil // Output: DataLoader deallocated
closure()    // Output: loader was deallocated
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Unowned References

An `unowned` capture also avoids retaining the object, but unlike `weak`, it does not make the reference optional — it assumes the object will always be alive when the closure is called. If it has been deallocated, accessing it will crash:

```swift
class Session {
    let token: String
    init(token: String) { self.token = token }
    deinit { print("Session ended") }
}

var session: Session? = Session(token: "abc123")

let closure: () -> Void = { [unowned session] in
    // session is not optional — crashes if session was deallocated
    print("Token: \(session!.token)")
}

closure()    // Output: Token: abc123
session = nil // Output: Session ended
// closure() would crash here — session has been deallocated
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! tip "weak vs. unowned"
    Use `weak` when the captured object may become `nil` during the closure's lifetime — it produces an `Optional` and is the safer choice. Use `unowned` only when you can guarantee the object will always outlive the closure, such as when a child refers back to its parent in a well-defined ownership hierarchy.

---

## Retain Cycles

A *retain cycle* occurs when two objects hold strong references to each other, preventing either from being deallocated. Closures stored on class instances are the most common source of this problem.

In the example below, `self` holds the closure via `onScoreChange`, and the closure holds `self` strongly through its capture. Neither can be released:

```swift
class Game {
    var score = 0
    var onScoreChange: (() -> Void)?

    func start() {
        // ⚠️ Retain cycle: self holds the closure, closure holds self.
        onScoreChange = {
            print("Score is now \(self.score)")
        }
    }
}
```

The solution is to capture `self` weakly. The idiomatic pattern uses a `guard let self` to re-bind it as a strong reference for the duration of the closure body:

```swift
class Game {
    var score = 0
    var onScoreChange: (() -> Void)?

    func start() {
        onScoreChange = { [weak self] in
            guard let self else { return }
            print("Score is now \(self.score)")
        }
    }

    func addPoints(_ points: Int) {
        score += points
        onScoreChange?()
    }

    deinit { print("Game deallocated") }
}

var game: Game? = Game()
game?.start()
game?.addPoints(10) // Output: Score is now 10
game?.addPoints(5)  // Output: Score is now 15
game = nil          // Output: Game deallocated — no retain cycle
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! warning
    The `[weak self]` pattern is especially important with `@escaping` closures stored as properties, because those closures can outlive the scope in which they were created. Forgetting `[weak self]` in these cases is one of the most common sources of memory leaks in Swift.

---

## `throws` and `rethrows`

Closures can be declared to throw errors, just like regular functions. When a function accepts a throwing closure, it must handle or propagate the error:

```swift
func evaluate(_ block: () throws -> Int) {
    do {
        let result = try block()
        print("Result: \(result)")
    } catch {
        print("Error: \(error)")
    }
}

enum MathError: Error { case divisionByZero }

evaluate { 10 / 2 }          // Output: Result: 5
evaluate { throw MathError.divisionByZero } // Output: Error: divisionByZero
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

A limitation of this approach is that even if you pass a non-throwing closure, the call site still requires `try` — because the function's signature includes `throws`. The `rethrows` keyword solves this: it marks a function as *only potentially throwing*, depending on whether the closure it receives actually throws:

```swift
func transform(_ value: Int, using block: (Int) throws -> Int) rethrows -> Int {
    try block(value)
}

enum MathError: Error { case divisionByZero }

// Block doesn't throw — no 'try' needed at the call site.
let doubled = transform(5) { $0 * 2 }
print(doubled) // Output: 10

// Block throws — 'try' is now required.
let result = try? transform(0) { value in
    guard value != 0 else { throw MathError.divisionByZero }
    return 100 / value
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

`rethrows` is used extensively in the standard library — `map`, `filter`, `forEach`, and `sort` all use it, which is why you don't need `try` when passing a non-throwing closure to them.

---

## Type Aliases for Closure Types

Closure types can become verbose, especially when the same signature appears in multiple places. A `typealias` gives a name to a closure type, making declarations cleaner and more consistent:

```swift
typealias CompletionHandler = (Result<String, Error>) -> Void
typealias Transform<T> = (T) -> T
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="CompletionHandler"></codapi-snippet>

The alias can then be used anywhere the full closure type would appear:

```swift
func fetchAvatar(for userID: Int, completion: CompletionHandler) {
    // ...
}

func applyTwice<T>(_ value: T, transform: Transform<T>) -> T {
    return transform(transform(value))
}

print(applyTwice(3) { $0 * 2 })   // Output: 12
print(applyTwice("hi") { $0 + "!" }) // Output: hi!!
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="CompletionHandler"></codapi-snippet>

Type aliases also make protocol conformances and property declarations easier to read when a type acts as a delegate or event handler:

```swift
typealias ButtonAction = () -> Void
typealias ValueChanged<T> = (T) -> Void

class Button {
    var onTap: ButtonAction?
    var onLongPress: ButtonAction?
}

class Slider {
    var onValueChanged: ValueChanged<Float>?
}
```
