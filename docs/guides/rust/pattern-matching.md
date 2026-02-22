---
title: Pattern Matching in Rust
tags:
  - rust
  - guide
image: https://i.imgur.com/TxwTyvQ.png
comments: true
---

**Pattern matching** is one of Rust's most powerful features. It lets you compare a value against a structure, safely extract pieces of data, and run different code depending on what you find — all in a clean, readable way.

Unlike a simple `if/else`, the Rust compiler guarantees that every possible case is covered. If you miss one, your code won't compile.

## Destructuring with `let`

Pattern matching starts with `let`. When you assign a value, you can destructure it immediately. Use `_` to ignore a single element, and `..` to ignore the rest.

### Tuples

```rust
let coordinates = (12, 34, 56);

// Extract just the first value, ignore the rest
let (x, ..) = coordinates;
// → x = 12

// Extract the middle one, ignore the others
let (_, y, _) = coordinates;
// → y = 34

// Extract the last value
let (.., z) = coordinates;
// → z = 56
```

### Structs

The same logic works perfectly with structs.

```rust
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

let point = Point { x: 10, y: 20 };

let Point { x, .. } = point;
// → x = 10
```

Only the `x` field is bound; the rest is ignored with `..`

## Pattern Binding with `@`

Sometimes we want **both** the whole value **and** its parts. The `@` operator does exactly that.

```rust
#[derive(Debug)]
struct Task {
    id: u32,
    completed: bool,
}

let task = Task { id: 42, completed: true };

// Bind the entire Task to `t` while still extracting the `id`
let t @ Task { id, .. } = task;
// → id = 42
// → t = Task { id: 42, completed: true }
```

You can even chain `@` to create multiple copies of the same value:

```rust
// Stores three copies of the value 42
let w @ t @ f = 42;

// → w = 42
// → t = 42
// → f = 42
```

## Handling Refutable Patterns

Regular `let` only works for **irrefutable** patterns (ones that can never fail). For things that might fail (`Option`, `Result`, etc.) we have better tools.

### `let else` 

```rust
fn main() {
    let Ok(id) = get_result() else {
        // early return if pattern does not match
        return;
    };

    // id is now available in the outer scope
    dbg!(id); // → id = 100
}

fn get_result() -> Result<u32, String> { 
    Ok(100)
}
```
<codapi-snippet engine="codapi" sandbox="rust" editor="basic"></codapi-snippet>

!!! tip
    `let Ok(x) = f();` without `else` will **not compile** if the error type is inhabited. It only works if the error is the never type `!` (Rust 1.82+), making the pattern irrefutable.

### `if let` - Branch on a single case

When you only care about one pattern and want to ignore everything else, `if let` is a concise alternative to a full `match`:

```rust
let active_task = Some(Task { id: 42, completed: true });

if let Some(task) = active_task {
    println!("Active task: {}", task.id);
}

// Output: Active task: 42
```

`if let` also accepts an `else` branch:

```rust
let queued: Option = None;

if let Some(task) = queued {
    println!("Task: {}", task.id);
} else {
    println!("No task in queue");
}

// Output: No task in queue
```

### Let chains (`if let … && let …`)

You can chain multiple `let` bindings in a single `if` condition using `&&`:

```rust
#[derive(Debug)]
enum Status {
    Todo,
    InProgress(u32), 
    Done { completed_at: String },
    Cancelled,
}

let maybe_id = Some(42);
let maybe_status = Some(Status::Done { completed_at: String::from("today") });

if let Some(id) = maybe_id && let Some(Status::Done { .. }) = maybe_status {
    println!("Task {} is done!", id); // Output: Task 42 is done!
}
```

!!! tip
    Let chains — multiple bindings in one condition are only allowed in Rust 2024 or later 

### `while let` - Loop while the pattern matches

`while let` keeps iterating as long as the pattern holds. This is the idiomatic way to consume a stack:

```rust
let mut queue = vec!["design", "implement", "review"];

while let Some(step) = queue.pop() {
    println!("Working on: {}", step);
}

// Output:
// Working on: review
// Working on: implement
// Working on: design
```

## Function Parameters Destructure

Patterns work directly in function parameter lists, not just in `let` and `match`:

```rust
fn print_x(Point { x, .. }: Point) {
    // → x is now available in the scope
}
```

Tuples work the same way:

```rust
fn sum_pair((a, b): (i32, i32)) -> i32 {
    a + b
}
```

## The `match` Expression

`match` is the centerpiece of pattern matching in Rust. It takes a value and a list of *arms*, each with a pattern and code to run if it matches. It is also an **expression** — it produces a value.

```rust
let status = Status::Done { completed_at: String::from("2026-02-21") };

match status {
    Status::Todo => println!("Task is still todo"),
    Status::InProgress(hours) => println!("In progress for {} hours", hours),
    Status::Done { completed_at } => println!("Completed at {}", completed_at),
    Status::Cancelled => println!("Task was cancelled"),
}
```

Since `match` is an expression, you can assign its result directly:

```rust
let label = status {
    Status::Todo          => "todo",
    Status::InProgress(_) => "active",
    Status::Done { .. }   => "done",
    Status::Cancelled     => "cancelled",
};
 
dbg!(label) // → label = "done"
```

!!! note
    `match` must be **exhaustive** — you must cover every possible case, or the code will not compile. The wildcard `_` is the standard way to catch everything that wasn't matched above.

## Matching Structs

Struct fields can be matched by exact value, bound to new names, or ignored with `..`:

```rust
let point = Point { x: 10, y: 20 };

match point {
    // Exact value match
    Point { x: 0, y: 1 } => println!("At the origin"),
    
    // Bind fields to new names
    Point { x: a, y: b } => println!("Point is at X:{}, Y:{}", a, b),
    
    // Shorthand — same name as field
    Point { x, y } => println!("Point is at {}, {}", x, y),
    
    // Ignore everything
    Point { .. } => println!("Some other point"),
}

// Output: Point is at X:10, Y:20
```

## Wildcards and Or-Patterns

`_` is the **true wildcard**. It matches anything but does not bind the value. A plain variable name matches anything and *does* bind it:

```rust
let instruction = 7;

match instruction {
    0 | 1 | 2 => println!("Low instruction"),        // or-pattern
    n @ 3..=9 => println!("Mid instruction: {}", n), // binds the value
    _         => println!("High instruction"),
}

// Output: Mid instruction: 7
```

Or-patterns work deeply inside nested structures too. All alternatives in the arm must bind the same set of variable names:

```rust
let event = Status::Cancelled;

match event {
    Status::Todo | Status::Cancelled          => println!("Inactive"),
    Status::InProgress(_) | Status::Done {..} => println!("Active or finished"),
}

// Output: Inactive
```

!!! tip "Pathological Or-Patterns"
    A leading `|` in a pattern is valid syntax and simply ignored: `let |x| x = 5;` is the same as `let x = 5;`. This is a pathological edge case — you won't need it in practice.

## Range Patterns

Use `..=` for an **inclusive** range. Use `..` for a half-open range. Ranges work with integers and `char`:

```rust
let score: u32 = 73;

let grade = match score {
    90..=100 => "A",
    80..=89  => "B",
    70..=79  => "C",
    60..=69  => "D",
    _        => "F",
};

dbg!(grade); // → grade = C
```

Combine ranges with `@` to both verify the range *and* capture the value:

```rust
let count = 5u32;

match count {
    0          => println!("No tasks"),
    n @ 1..=5  => println!("{} tasks — manageable", n),
    n @ 6..=20 => println!("{} tasks — busy!", n),
    n          => println!("{} tasks — overloaded", n),
}

// Output: 5 tasks — manageable
```

## Slice and Array Patterns

```rust
let numbers: [i32; 5] = [1, 2, 3, 4, 5];

match numbers {
    []          => println!("Empty"),
    [_]         => println!("One element"),
    [1, ..]     => println!("Starts with 1"),
    [1, .., 5]  => println!("Starts with 1 and ends with 5"),
}

// Output: Starts with 1
```

Capture the middle portion with `x @ ..`:

```rust
match numbers {
    [first, middle @ .., last] => {
        println!("First: {}", first);       // Output: First: 1
        println!("Middle: {:?}", middle);   // Output: Middle: [2, 3, 4]
        println!("Last: {}", last);         // Output: Last: 5
    }
}
```

!!! example
    A real-world use case — parsing command-line-style arguments:

    ```rust
    let args = ["cargo", "run", "--release"];
    
    match args {
        [_, "build", ..]       => println!("Building..."),
        [_, "run", rest @ ..]  => println!("Running with flags: {:?}", rest),
        [_, "test", ..]        => println!("Testing..."),
        _                      => println!("Unknown command"),
    }

    // Output: Running with flags: ["--release"]
    ```
## Pattern Guards

Add an `if` condition to a match arm to apply an extra check beyond the pattern itself. The arm only fires if both the pattern *and* the guard are true:

```rust
let task = Task { id: 42, completed: true, title: String::from("Write Rust guide") };

match task {
    Task { id, completed: true, .. } if id > 10 => {
        println!("High-priority completed task #{}", id);
    }

    Task { completed: true, .. } => {
        println!("Completed task");
    }

    Task { title, .. } => {
        println!("Pending: {}", title);
    }
}

// Output: High-priority completed task #42
```
Guards also work alongside or-patterns. The guard applies to the **entire arm**, not just one of the alternatives:

```rust
let x = 5;
let allowed = true;

match x {
    1 | 2 | 3 if allowed => println!("Low and allowed: {}", x),
    4 | 5 | 6 if allowed => println!("Mid and allowed: {}", x),
    _                    => println!("Not allowed or out of range"),
}

// Output: Mid and allowed: 5
```

## Nested Enum Matching

Pattern matching navigates nested structures of any depth. This is especially powerful when modeling complex domain state:

```rust
#[derive(Debug)]
enum Priority { 
    Low, 
    High
}

#[derive(Debug)]
enum Ticket {
    Open   { priority: Priority, assignee: String },
    Closed { resolved: bool },
    Draft
}
```

```rust
let ticket = Ticket::Open {
    priority: Priority::High,
    assignee: String::from("Alice"),
};

match ticket {
    Ticket::Open { priority: Priority::High, assignee } => {
        println!("Urgent! Assigned to: {}", assignee);
    }

    Ticket::Open { assignee, .. } => {
        println!("Open ticket for: {}", assignee);
    }

    Ticket::Closed { resolved: true }  => println!("Ticket resolved."),
    Ticket::Closed { resolved: false } => println!("Closed but unresolved."),
    Ticket::Draft                      => println!("Still a draft."),
}

// Output: Urgent! Assigned to: Alice
```

## Matching `Option` and `Result`

These two enums appear in virtually every Rust program. Matching them is the idiomatic way to handle absent values and errors.

### `Option<T>`

```rust
let value = Some(10);

match value {
    Some(x) => {
        // → x = 10
    }
    None => {
        // value is absent
    }
}
```

### `Result<T, E>`

```rust
let result: Result<u32, &str> = Ok(42);

match result {
    Ok(id) => {
        // → id = 42
    }
    Err(error) => {
        // → error = "..."
    }
}
```

## Bonus

### Patterns in `for` Loops

You can destructure every item directly in the loop header — super clean when iterating collections of structs or tuples.

```rust
let tasks = vec![
    Task { id: 43, title: String::from("Review PRs"), completed: false },
    Task { id: 44, title: String::from("Deploy app"), completed: true },
];

for Task { id, title, completed } in tasks {
    let status = if completed { "✅" } else { "⏳" };
    println!("{} Task #{}: {}", status, id, title);
}

// Output:
// ⏳ Task #43: Review PRs
// ✅ Task #44: Deploy app
```

### Patterns in Closures

Closures use the same pattern syntax inside `|…|`.

```rust
let points = vec![
    Point { x: 5, y: 12 },
    Point { x: 10, y: 24 }
];

let distances: Vec<i32> = points
    .into_iter()
    .map(|Point { x, y }| x * x + y * y)
    .filter(|&dist| dist > 100)
    .collect();

dbg!(distances);
// → distances = [169, 676]
```

## Challenges

??? example "Challenge 1"

    **Simple Score Grade Classifier**
    
    Write a function `get_grade(score: u32)` that takes a score between 0 and 100 and returns the corresponding letter grade according to these rules:
    
    ```console
    - 90–100 → "A"  
    - 80–89  → "B"  
    - 70–79  → "C"  
    - 60–69  → "D"  
    - 0–59   → "F"
    ```

    Requirements:
    
    - Use only one `match` expression
    - The match must be exhaustive
    - Use range patterns (`..=` or `..`)
    
    ```rust
    fn get_grade(score: u32) -> &'static str {
      // TODO: Write your code below
    }
    
    fn main() {
          assert_eq!(get_grade(95), "A");
          assert_eq!(get_grade(85), "B");
          assert_eq!(get_grade(75), "C");
          assert_eq!(get_grade(65), "D");
          assert_eq!(get_grade(55), "F");
    }
    ```
    <codapi-snippet engine="codapi" sandbox="rust" editor="basic"></codapi-snippet>

    ??? tip "Hint"
        You can almost copy the range example already shown in the guide.

    ??? tip "Solution"
        ```rust
        fn get_grade(score: u32) -> &'static str {
            match score {
                90..=100 => "A",
                80..=89  => "B",
                70..=79  => "C",
                60..=69  => "D",
                _        => "F",
            }
        }
        ```

??? example "Challenge 2"

    **Command-line Arg Parser**

    Implement a function `parse_command(args: &[&str]) -> String` that parses a slice of command-line-like arguments and returns a descriptive string.

    **Expected input → output examples:**

    ```bash
    ["cargo", "build"]                        → "Command: build (no flags)"
    ["cargo", "run", "--release"]             → "Command: run | Flags: [\"--release\"]"
    ["cargo", "test", "--", "--nocapture"]    → "Command: test | Flags: [\"--\", \"--nocapture\"]"
    ["cargo", "check"]                        → "Command: check (no flags)"
    ["cargo", "fmt", "--all"]                 → "Command: fmt | Flags: [\"--all\"]"
    anything else                             → "Unknown command"
    ```

    Requirements:
    
    - Use only one `match` expression on the slice `args`
    - Use slice patterns (`[head, ..]`, `[head, middle @ ..]`, etc.)
    - Capture remaining flags using `..` or `x @ ..`
    - Use or-patterns to group commands that behave similarly (optional but recommended)
    - The match must be exhaustive
    
    ```rust
    fn parse_command(args: &[&str]) -> String {
      // TODO: Write your code below
    }
    
    fn main() {
      assert_eq!(parse_command(&["cargo", "build"]), "Command: build (no flags)");
      assert_eq!(parse_command(&["cargo", "run", "--verbose"]), "Command: run | Flags: [\"--verbose\"]");
      assert_eq!(parse_command(&["cargo", "test", "--", "--nocapture"]), "Command: test | Flags: [\"--\", \"--nocapture\"]");
      assert_eq!(parse_command(&["cargo", "check"]), "Command: check (no flags)");
      assert_eq!(parse_command(&["cargo", "fmt", "--all"]), "Command: fmt | Flags: [\"--all\"]");
      assert_eq!(parse_command(&["cargo", "unknown"]), "Unknown command");
    }
    ```
    <codapi-snippet engine="codapi" sandbox="rust" editor="basic"></codapi-snippet>
    

    ??? tip "Hints"      
        - The first element is always `"cargo"`
        - The second element is the subcommand (`build`, `run`, `test`, etc.)
        - Everything after the subcommand is considered flags

    ??? tip "Solution"
        ```rust
        fn parse_command(args: &[&str]) -> String {
            match args {
                [_, "build", ..] | [_, "check", ..] => {
                    format!("Command: {} (no flags)", args[1])
                }
                [_, cmd @ ("run" | "test" | "fmt"), rest @ ..] => {
                    if rest.is_empty() {
                        format!("Command: {} (no flags)", cmd)
                    } else {
                        format!("Command: {} | Flags: {:?}", cmd, rest)
                    }
                }
                _ => "Unknown command".to_string(),
            }
        }
        ```

## Quick Reference Table

| Feature                    | Syntax Example                              | When to use                              |
|---------------------------|---------------------------------------------|------------------------------------------|
| Tuple destructuring       | `let (x, ..) = coords;`                     | Extract parts of tuples                  |
| Struct destructuring      | `let Point { x, .. } = point;`                  | Pull fields from structs                 |
| `@` binding               | `let t @ Task { id, .. } = task;`           | Keep whole value + parts                 |
| `let else`                | `let Ok(id) = res else { return; };`        | Early exit on failure                    |
| `if let` / `while let`    | `if let Some(v) = opt {}`                   | Single-case checks / loops               |
| Function param destruct   | `fn f(Point { x, .. }: Point)`              | Clean parameter unpacking                |
| `match` arms              | `match value { Pat => … }`                  | Full control flow                        |
| Or-patterns               | `0 | 1 | 2 => …`                            | Multiple options                         |
| Range patterns            | `x @ 3..=5 => …`                            | Numeric / char ranges                    |
| Slice patterns            | `[1, x @ .., 5] => …`                       | Arrays / slices                          |
| Guards                    | `Pat if condition => …`                     | Extra boolean check                      |
| Wildcard                  | `_ => …`                                    | Catch everything else                    |

## References

- [The Rust Reference - Patterns](https://doc.rust-lang.org/reference/patterns.html)
- [Rust Language Cheat Sheet](https://cheats.rs/#pattern-matching)
