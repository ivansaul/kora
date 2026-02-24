---
title: abstract class vs interface class in Dart
image: https://i.imgur.com/KwMLDfo.png
description: Learn when to use abstract class, interface class, and abstract interface class in Dart.
tags:
  - dart
  - flutter
  - oop
comments: true
---

If you’ve been coding in Dart for a while, you’re likely used to using `abstract class` whenever you need to define a contract. For years, that was the only way. But since **Dart 3.0**, the language introduced **Class Modifiers**, giving us a dedicated `interface` keyword.

Here is the breakdown of why this matters and how to use it.

## The Problem with Implicit Interfaces

In Dart, every class implicitly defines an interface. This meant you could `implements` any class, even if the original author didn't intend for you to. This often led to fragile code where internal implementation details were accidentally exposed.

```dart
class HttpService {
  void get(String url) { /* internal logic */ }
}

// Nothing stops someone from doing this
// even if you never intended it
class FakeHttpService implements HttpService {
  @override
  void get(String url) { /* ... */ }
}
```

Dart 3 class modifiers let you express your intent explicitly.

## abstract class

Use this when you want to **share behavior** (logic) but prevent the class from being instantiated on its own.

- **Can be extended:** Yes (`extends`).
- **Can be implemented:** Yes (`implements`).
- **Can be instantiated:** No.
- **Best for:** Base classes where you provide some common code that subclasses will inherit.

```dart
abstract class Animal {
  String get name;

  void breathe() {
    print('$name is breathing'); // shared logic
  }

  void speak(); // subclasses must implement this
}

class Dog extends Animal {
  @override
  String get name => 'Dog';

  @override
  void speak() => print('Woof!');
}

Animal()  // [✘] cannot be instantiated
Dog()     // [✔]
```

## interface class

Use this when you want a class that **can be instantiated directly**, but you want to ****prevent external code from extending it**. Others can only use it as-is or reimplement it with `implements`.

- **Can be extended:** Only within the same library.
- **Can be implemented:** Yes (`implements`).
- **Can be instantiated:** Yes.
- **Best for:** Utility or configuration classes where you want to offer a default out-of-the-box instance, but protect your internal logic from being broken by subclassing.

```dart title="api_client.dart"
interface class ApiClient {
  String get baseUrl => 'https://api.example.com';

  void get(String path) {
    print('GET $baseUrl/$path');
  }
}
```

Outside the library:

```dart title="main.dart"
// [✔] You can use it directly
final client = ApiClient();
client.get('users');

// [✔] You can reimplement it
class MockApiClient implements ApiClient {
  @override
  String get baseUrl => 'https://mock.example.com';

  @override
  void get(String path) => print('MOCK GET $path');
}

// [✘] You cannot extend it from outside the library
class ExtendedApiClient extends ApiClient { // Compile error!
  @override
  void get(String path) => super.get('v2/$path');
}
```

!!! note
    The restriction on extends only applies outside the library where interface class is defined. Inside the same file or library, extends is still allowed.

## abstract interface class

If you want the exact behavior of a `Java` or `C#` Interface—meaning it **cannot be instantiated** AND **cannot be extended**, only implemented —you combine the modifiers:

- **Can be extended:** No.
- **Can be implemented:** Yes (`implements`).
- **Can be instantiated:** No.
- **Best for:** Pure contracts like Services and Repositories in Flutter apps.

```dart title="storage_service.dart"
abstract interface class StorageService {
  void save(String data);
  String load();
}
```

```dart title="local_storage.dart"
class LocalStorage implements StorageService {
  @override
  void save(String data) => print('Saving locally: $data');

  @override
  String load() => 'local data';
}


StorageService() // [✘] — cannot be instantiated
LocalStorage()   // [✔]

// [✘] — cannot be extended
class Foo extends StorageService {} 

// [✔] — can be implemented
class Foo implements StorageService {} 
```

!!! tip
    This is the pattern you want for **Services, Repositories, and any dependency you plan to inject or mock in tests**.

## Which one to pick?

| If you want to... | Use this modifier: |
| --- | --- |
| Share logic between subclasses, no direct instantiation | `abstract class` |
| Provide a ready-to-use class, but block external subclassing | `interface class` |
| Define a pure contract with zero implementation | `abstract interface class` |

!!! note
    In practice, `interface class` alone is the least common of the three. If you're thinking _"this is a Service or Repository"_, reach for `abstract interface class`. If you're thinking _"this is a base class with shared logic"_, reach for `abstract class`.
