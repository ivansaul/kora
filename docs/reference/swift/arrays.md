---
title: A Deep Dive into Arrays in Swift
image: https://i.imgur.com/iTkEYoS.png
tags:
  - swift
  - swiftui
  - array
  - reference
  - guide
description: A complete guide to working with Arrays in Swift, from basic creation to advanced functional transformations.
comments: true
---

# Arrays in Swift

Array is an ordered, random-access collection type. Arrays are one of the most commonly used data types in an app. We use the Array type to hold elements of a single type, the array's `Element` type. An array can store any kind of elements—from integers to strings to classes. 

In this guide, we will explore how arrays work under the hood, how to manipulate them, and how to apply functional programming concepts to transform data effectively.

## Creation of Arrays

Before we can manipulate data, we must understand how to store it. Array is an ordered collection type in the Swift standard library. It provides `O(1)` random access and dynamic reallocation. Array is a generic type, so the type of values it contains are known at compile time.

As Array is a value type, its mutability is defined by whether it is annotated as a `var` (mutable) or `let` (immutable). The type `[Int]` (meaning: an array containing `Int`s) is syntactic sugar for `Array<Element>`.

### Empty Arrays

There are several ways to declare an empty array. The following three declarations are equivalent:

```swift
// A mutable array of Strings, initially empty.
var arrayOfStrings: [String] = []      // type annotation + array literal
var arrayOfStrings = [String]()        // invoking the [String] initializer
var arrayOfStrings = Array<String>()   // without syntactic sugar
```

### Array Literals

The most common way to create an array with initial data is by using an array literal, which is written with square brackets surrounding comma-separated elements:

```swift
let arrayOfInts = [2, 4, 7]
```

This creates an immutable array of type `[Int]` containing `2`, `4`, and `7`. The compiler can usually infer the type of an array based on the elements in the literal, but explicit type annotations can override the default:

```swift
// type annotation on the variable
let arrayOfInt8s: [UInt8] = [2, 4, 7]

// type annotation on the initializer expression
let arrayOfInt8s = [2, 4, 7] as [UInt8]

// explicit for one element, inferred for the others
let arrayOfInt8s = [2 as UInt8, 4, 7]
```

### Advanced Initialization

Sometimes you need to build arrays dynamically or pre-allocate them with specific values. For arrays with repeated values, you can use the `repeating` initializer:

```swift
let arrayOfStrings = Array(repeating: "Example", count: 3)
// → arrayOfStrings = ["Example", "Example", "Example"]
```

You can also create arrays from other sequences, such as the key-value pairs of a dictionary:

```swift
let dictionary = ["foo": 4, "bar": 6]
let arrayOfKeyValuePairs = Array(dictionary)
// → arrayOfKeyValuePairs = [("bar", 6), ("foo", 4)]
```

### Multi-dimensional Arrays

When your data structure requires a grid or matrix, a multidimensional array is created by nesting arrays. For example, a 2-dimensional array of `Int` is `[[Int]]`.

```swift
let array2x3 = [[1, 2, 3], [4, 5, 6]]
// → array2x3[0][1] = 2
// → array2x3[1][2] = 6
```

!!! tip "Nested Repeating Values"
    To create a multidimensional array of repeated values, use nested calls of the array initializer:
    ```swift
    var array3x4x5 = Array(repeating: Array(repeating: Array(repeating: 0, count: 5), count: 4), count: 3)
    ```

---

## Accessing Array Values

Once your array is populated, you need to retrieve its contents. The following examples will use this array to demonstrate accessing values:

```swift
                      0  1  2  3  4  ← index
var numbers: [Int] = [2, 3, 5, 7, 11]
         position →   1  2  3  4  5
```

### Subscripting and Safe Access

To access a value at a known index use the subscript syntax. Arrays use a zero based index which means the first element in the Array is at index 0.

```swift
let value0 = numbers[0] // → value0 = 2
let value2 = numbers[2] // → value2 = 5
```

Accessing an out-of-bounds index will crash your application. By adding the following extension to array, indices can be accessed without knowing if the index is inside bounds:

```swift
extension Array {
    subscript (safe index: Int) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

if let thirdValue = numbers[safe: 2] {
    print(thirdValue)
}
```

### Finding Elements and Extremes

Instead of directly accessing an index, you often need to search for specific elements. It is possible to return the index of a given value, returning `nil` if the value wasn't found:

```swift
numbers.firstIndex(of: 7) // → Optional(3)
```

There are methods for the `first`, `last`, `maximum` or `minimum value in an Array. These methods will return `nil` if the Array is empty.

```swift
numbers.first // Optional(2)
numbers.last  // Optional(11)
numbers.max() // Optional(11)
numbers.min() // Optional(2)
```

#### Minimum and Maximum Values with Custom Ordering

You may also use the `min()` and `max()` methods with a custom closure, defining whether one element should be ordered before another. This allows you to find the minimum or maximum element in an array where the elements aren't necessarily `Comparable`.

For example, with an array of vectors:

```swift
struct Vector2 {
    let dx: Double
    let dy: Double
    
    var magnitude: Double {
        return (dx * dx + dy * dy).squareRoot()
    }
}

let vectors = [
    Vector2(dx: 3, dy: 2),
    Vector2(dx: 1, dy: 1),
    Vector2(dx: 2, dy: 2),
]

let lowestMagnitude = vectors.min { $0.magnitude < $1.magnitude }
let highestMagnitude = vectors.max { $0.magnitude < $1.magnitude }
```

---

## Modifying Values in an Array

As state changes in your application, your arrays need to adapt. There are multiple ways to append values onto an array:

```swift
var numbers = [1, 2, 3, 4, 5]
numbers.append(6) 
// → numbers = [1, 2, 3, 4, 5, 6]

var sixOnwards = [6, 7, 8, 9, 10]
numbers += sixOnwards 
// → numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

```

And similarly, you can remove values from an array using position-based methods:

```swift
numbers.remove(at: 3) // → numbers = [1, 2, 3, 5, 6, 7, 8, 9, 10]
numbers.removeLast()  // → numbers = [1, 2, 3, 5, 6, 7, 8, 9]
numbers.removeFirst() // → numbers = [2, 3, 5, 6, 7, 8, 9]
numbers.removeAll()   // → numbers = []
```

### Removing Elements by Value

Generally, if we want to remove an element from an `Array`, we need to know its index to use the standard `remove(at:)` function. But what if you don't know the index and only have the value you want to delete?

Instead of manually searching for the index every time, Swift provides modern, idiomatic ways to handle this.

#### Removing All Occurrences

The most efficient way to remove elements that match a specific value or condition is using `removeAll(where:)`. This method is safe, fast, and handles multiple occurrences in a single pass.

```swift
var tags = ["swift", "ios", "code", "ios", "programming"]
tags.removeAll { $0 == "ios" }
// → tags = ["swift", "code", "programming"]
```

#### Removing only the First Occurrence

There are cases where you might only want to remove the **first** instance of a specific value while leaving the rest of the array intact. For this, you can extend `Array` (specifically for `Equatable` elements) to make your code more expressive:

```swift
extension Array where Element: Equatable {
    /// Removes the first occurrence of the specified element.
    mutating func removeFirst(_ element: Element) {
        if let index = firstIndex(of: element) {
            remove(at: index)
        }
    }
}

var list = ["A", "B", "C", "B"]
list.removeFirst("B")

print(list) // Output: ["A", "C", "B"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Sorting an Array

Sorting elements based on their values or custom properties is a fundamental operation. As `Array` conforms to `Sequence`, we can generate a new array of the sorted elements using a built-in sort method.

```swift
var array = [3, 2, 1]
let sorted = array.sorted() // → sorted = [1, 2, 3]
```

As `Array` conforms to `MutableCollection`, we can sort its elements in place.

```swift
array.sort() // → array = [1, 2, 3]
```

!!! note
    In order to use the default `sorted()` or `sort()` methods without closures, the elements must conform to the `Comparable` protocol.

### Sorting with a Custom Ordering

You may also sort an array using a closure to define whether one element should be ordered before another. This isn't restricted to arrays where the elements must be `Comparable`. For example, it doesn't make sense for a `Landmark` to be naturally `Comparable`, but you can still sort an array of landmarks by height or name.

```swift
struct Landmark {
    let name: String
    let metersTall: Int
}

var landmarks = [
    Landmark(name: "Empire State Building", metersTall: 443),
    Landmark(name: "Eiffel Tower", metersTall: 300),
    Landmark(name: "The Shard", metersTall: 310)
]

// sort landmarks by height (ascending)
landmarks.sort { $0.metersTall < $1.metersTall }

// create new array of landmarks sorted by name
let alphabeticalLandmarks = landmarks.sorted { $0.name < $1.name }

dump(landmarks)
print("--------------------")
dump(alphabeticalLandmarks)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Sorting an Array of Strings

Sorting strings properly can introduce edge cases. The most simple way is to use `sorted()`:

```swift
let words = ["Hello", "Bonjour", "Salute", "Ahola"]
let sortedWords = words.sorted()
print(sortedWords) // Output: ["Ahola", "Bonjour", "Hello", "Salute"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

But there will be unexpected results if the elements in the array are not consistent with their casing:

```swift
let words = ["Hello", "bonjour", "Salute", "ahola"]
let unexpected = words.sorted()
print(unexpected) // Output: ["Hello", "Salute", "ahola", "bonjour"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="words"></codapi-snippet>


To address this issue, either sort on a lowercase version of the elements, or import Foundation and use `NSString`'s comparison methods like `caseInsensitiveCompare`:

```swift
import Foundation

let sortedWords = words.sorted { $0.caseInsensitiveCompare($1) == .orderedAscending }
print(sortedWords) // Output: ["ahola", "bonjour", "Hello", "Salute"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="words"></codapi-snippet>

To properly sort Strings by the numeric value they contain, use `compare` with the `.numeric` option:

```swift
import Foundation

let files = ["File-42.txt", "File-01.txt", "File-5.txt", "File-007.txt", "File-10.txt"]
let sortedFiles = files.sorted { $0.compare($1, options: .numeric) == .orderedAscending }

print(sortedFiles)
// Output: ["File-01.txt", "File-5.txt", "File-007.txt", "File-10.txt", "File-42.txt"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Grouping and Comparing Arrays

Often, you'll need to correlate your array data with other structures. Suppose we have a `User` struct and an array of `users` values. We can group the `users` by the `city` property to produce a dictionary:

```swift
struct User {
    let name: String
    let city: String
}

let users = [
    User(name: "Alice", city: "Barcelona"),
    User(name: "Bob", city: "Madrid"),
    User(name: "Charlie", city: "Barcelona")
]

let usersByCity = Dictionary(grouping: users, by: { $0.city })

dump(usersByCity)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! tip "Grouping using a keyPath"
    If the property is directly accessible, you can use a key path instead of a closure:
    ```swift
    let usersByCity = Dictionary(grouping: users, by: \.city)
    ```

### Comparing 2 Arrays with `zip`

The `zip` function accepts 2 sequences and returns a `Zip2Sequence` where each element contains a value from the first sequence and one from the second sequence. This is useful when you want to perform some kind of comparison between the n-th element of each Array.

```swift
let list0 = [0, 2, 4]
let list1 = [0, 4, 8]

// Check whether each value in list1
// is the double of the related value in list0.
let list1HasDoubleOfList0 = !zip(list0, list1)
    .filter { $0 != (2 * $1) }
    .isEmpty

print(list1HasDoubleOfList0) // Output: true
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Transforming Arrays

Swift arrays excel in functional programming. We can use methods to transform arrays without writing cumbersome `for-in` loops.

### Mapping Elements

As `Array` conforms to `Sequence`, we can use `map(_:)` to transform an array of `A` into an array of `B` using a closure. For example, we could use it to transform an array of `Int`s into an array of `String`s like so:

```swift
let numbers = [1, 2, 3, 4, 5]
let words = numbers.map { String($0) }
print(words) // Output: ["1", "2", "3", "4", "5"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! note
    `map(_:)` will iterate through the array, applying the given closure to each element. The result of that closure will be used to populate a new array with the transformed elements.

### Selecting Elements with `filter`

The `filter(_:)` method creates a new array containing only the elements that satisfy a given condition (predicate), which you provide as a closure.

You can filter complex types, such as a collection of `Person` objects, to find those who meet a specific criteria:

```swift
struct Person { 
  let name: String
  let age: Int 
}

let people = [
    Person(name: "Alice", age: 22),
    Person(name: "Bob", age: 41)
]

let youngPeople = people.filter { $0.age < 30 }
print(youngPeople.map {$0.name}) // Output: ["Alice"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! tip "Lazy Filtering"
    If you are working with a very large collection and you don't need the resulting array immediately, consider using `.lazy`:
    
    ```swift
    let largeRange = 1...1_000_000
    let filtered = largeRange.lazy.filter { $0 % 2 == 0 }
    print(filtered.count) // Output: 500000
    ```
    <codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

### Combining Elements with `reduce`

The `reduce` function is used to combine all elements of an array into a single value. It takes an initial value and a closure that describes how to combine each element with an "accumulator."

```swift
let numbers = [2, 5, 7, 8, 10, 4]

let sum = numbers.reduce(0) { accumulator, element in
    return accumulator + element
}

print(sum) // Output: 36
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

!!! tip
    Since operators in Swift are also functions, you can make this even more concise. If you are simply adding numbers, you can pass the `+` operator directly:

    ```swift
    let sum = numbers.reduce(0, +)
    ```

!!! tip "Better Performance"
    When combining elements into a new collection (like a Dictionary or another Array), use `reduce(into:_:)`. This variant is more efficient because it modifies the accumulator in place instead of creating a new copy at every step.

    ```swift
    let letters = ["a", "b", "c", "a", "b", "a"]
    let counts = letters.reduce(into: [:]) { counts, letter in
        counts[letter, default: 0] += 1
    }

    print(counts) // Output: ["a": 3, "b": 2, "c": 1]
    ```
    <codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>
    

### Handling Optionals and Nested Arrays

Sometimes transformations yield optional values or nested arrays. Swift provides specific tools to safely unpack these arrays.

#### Filtering out `nil` with `compactMap`

If you want to extract values of a given type and create a new array in a safe way, discarding all `nil` elements, use `compactMap` (formerly known as a variant of `flatMap`).

```swift
let strings = ["1", "foo", "3", "4", "bar", "6"]
let numbersThatCanBeConverted = strings.compactMap { Int($0) }
print(numbersThatCanBeConverted) // Output: [1, 3, 4, 6]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

You can also use this ability to simply convert an array of optionals into an array of non-optionals:

```swift
let optionalNumbers: [Int?] = [nil, 1, nil, 2, nil, 3]
let numbers = optionalNumbers.compactMap { $0 }
print(numbers) // Output: [1, 2, 3]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

#### Flattening Sequences with `flatMap`

There is also a version of `flatMap(_:)` that expects the transformation closure to return a sequence. Each sequence from the transformation will be concatenated, resulting in an array containing the combined elements.

For example, taking an array of prime strings and combining their characters into a single array:

```swift
let primes = ["2", "3", "5", "7", "11"]
let allCharacters = primes.flatMap { $0 }
print(allCharacters) // Output: ["2", "3", "5", "7", "1", "1"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

As `flatMap(_:)` will concatenate the sequences returned from the transformation closure calls, it can be used to flatten a multidimensional array, such as a 2D array into a 1D array. This can simply be done by returning the given element `$0` (a nested array) in the closure:

```swift
let array2D = [[1, 3], [4], [6, 8, 10]]
let flattenedArray = array2D.flatMap { $0 }
print(flattenedArray) // Output: [1, 3, 4, 6, 8, 10]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

---

## Array Slices and Memory Management

One can extract a series of consecutive elements from an Array using a `Range`. Subscripting an array with a range returns an `ArraySlice`. This is a subsequence of the original array.

```swift
let words = ["Hey", "Hello", "Bonjour", "Welcome", "Hi", "Hola"]
let slice = words[2...4] 
// → slice = ["Bonjour", "Welcome", "Hi"]
```

While an `ArraySlice` conforms to the `Collection` protocol, it is meant for transient computations only.

!!! danger "Memory Leak Warning"
    An `ArraySlice` keeps a reference to the entire original array in memory. To avoid unnecessary memory usage, you should convert the slice back into an `Array` as soon as you finish working with it:
    ```swift
    let selectedWords = Array(words[2...4])
    ```

## Value Semantics

Finally, it is essential to understand how arrays behave in memory. Copying an array will copy all of the items inside the original array. Changing the new array will not change the original array.

```swift
var originalArray = ["Swift", "is", "great"]
var newArray = originalArray
newArray[2] = "awesome!"

// → originalArray = ["Swift", "is", "great"]
// → newArray = ["Swift", "is", "awesome!"]
```

Copied arrays will share the same space in memory as the original until they are changed. As a result of this there is a performance hit when the copied array is given its own space in memory as it is changed for the first time.
