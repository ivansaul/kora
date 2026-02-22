---
title: Dictionaries
tags:
  - swift
  - reference
comments: true
---

## Declaring Dictionaries

Dictionaries are an unordered collection of keys and values. Values relate to unique keys and must be of the same type.

When initializing a Dictionary the full syntax is as follows:

```swift
var books: Dictionary<Int, String> = Dictionary<Int, String>()
```

Although a more concise way of initializing:

```swift
var books = [Int: String]()
// or
var books: [Int: String]
```

Declare a dictionary with keys and values by specifying them in a comma separated list.

The types can be inferred from the types of keys and values.

```swift
var books: [Int: String] = [1: "Book 1", 2: "Book 2"]
var otherBooks = [3: "Book 3", 4: "Book 4"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" id="books"></codapi-snippet>

```swift
print("books: \(books)") // Output: [2: "Book 2", 1: "Book 1"]
print("otherBooks: \(otherBooks)") // Output: [3: "Book 3", 4: "Book 4"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="books"></codapi-snippet>

## Accessing Values

A value in a Dictionary can be accessed using its key:

```swift
let bookName = books[1]
print(bookName) // Output: Optional(Book 1)
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="books"></codapi-snippet>

The values of a dictionary can be iterated through using the values property:

```swift
for book in books.values {
  print("Book Title: \(book)")
}

// Output:
// Book Title: Book 2
// Book Title: Book 1
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="books"></codapi-snippet>

Similarly, the keys of a dictionary can be iterated through using its keys property:

```swift
for bookNumber in books.keys {
  print("Book number: \(bookNumber)")
}

// Output:
// Book number: 1
// Book number: 2
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="books"></codapi-snippet>

To get all key and value pair corresponding to each other (you will not get in proper order since it is a Dictionary)

```swift
for (book, bookNumbers) in books {
  print("\(book) -> \(bookNumbers)")
}

// Output:
// 2 -> Book 2
// 1 -> Book 1
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic" depends-on="books"></codapi-snippet>

!!!note 
    Note that a Dictionary, unlike an Array, in inherently unordered-that is, there is no guarantee on the order during iteration.

If you want to access multiple levels of a Dictionary use a repeated subscript syntax.

```swift
// Create a multilevel dictionary.
var myDict: [String: [Int: String]] = [
    "Toys": [1: "Car", 2: "Truck"],
    "Interests": [1: "Science", 2: "Math"],
]

if let toys = myDict["Toys"], let truck = toys[2]{
    print(truck) // Output: Truck
}

// or with Optional chaining

if let truck = myDict["Toys"]?[2] {
    print(truck) // Output: Truck
}
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Change Value of Dictionary using Key

```swift
var user = ["name": "John", "surname": "Doe"]
// Set the element with key: 'name' to 'Jane'
user["name"] = "Jane"
print(user) // Output: ["name": "Jane", "surname": "Doe"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Get all keys in Dictionary

```swift
let user = ["name": "Kirit", "surname" : "Modi"]
let allKeys = Array(user.keys)
print(allKeys) // Output: ["name", "surname"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic"></codapi-snippet>

## Modifying Dictionaries

Add a key and value to a Dictionary

```swift
var books = [Int: String]()
// books -> [:]

books[5] = "Book 5"
// books -> [5: "Book 5"]

books.updateValue("Book 5.1", forKey: 5)
// books -> [5: "Book 5.1"]
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic", id="books-2"></codapi-snippet>

!!! note

    `updateValue` return the value that was replaced, or `nil` if a new key-value pair was added.
    
    ```swift
    let previousValue = books.updateValue("Book 5.2", forKey: 5)
    
    print(books) // Output: [5: "Book 5.2"]
    print(previousValue) // Output: Optional("Book 5.1")
    ```
    <codapi-snippet engine="codapi" sandbox="swift" editor="basic", depends-on="books-2"></codapi-snippet>

Remove value and their keys with similar syntax:

```swift
books[5] = nil
// books -> [:]

books [6] = "Deleting from Dictionaries"
// books -> [6: "Deleting from Dictionaries"]

let removedBook = books.removeValue(forKey: 6)
print(removedBook) // Output: Optional("Deleting from Dictionaries")
```
<codapi-snippet engine="codapi" sandbox="swift" editor="basic", depends-on="books-2"></codapi-snippet>

## Merge two dictionaries

```swift
var a = ["a": 1, "b": 2]
var b = ["b": 3, "c": 4]

a.merge(b) { old, new in
    new
}

print(a) // print: ["a": 1, "b": 3, "c": 4]
print(b) // print: ["b": 3, "c": 4]
```

!!! tip
    `merging(_:uniquingKeysWith:)` Creates a dictionary by merging the given dictionary into this dictionary, using a combining closure to determine the value for duplicate keys.
