const KNOWLEDGE_CHECKS = {
  hello: ["Which function displays text in the output?", ["input()", "print()", "range()"], 1, "print() displays values in the output."],
  variables: ["What does name = 'Ada' do?", ["Assigns 'Ada' to name.", "Compares name with 'Ada'.", "Prints 'Ada'."], 0, "A single equals sign assigns the value on the right to the name on the left."],
  types: ["Which value has the type bool?", ['"True"', "True", "1.0"], 1, "True without quotation marks is a boolean value; 'True' is text."],
  math: ["What is 17 % 5?", ["3", "2", "3.4"], 1, "% returns the remainder after division."],
  input: ["What type of value does input() return?", ["Always an integer.", "A string of text.", "A boolean."], 1, "input() returns text. Convert it before numeric calculations."],
  strings: ["Which is an f-string?", ['f"Hello, {name}"', '"Hello, name"', "str(name)"], 0, "The f prefix lets Python evaluate expressions inside braces."],
  decisions: ["Which comparison means greater than or equal to?", [">", ">=", "=="], 1, ">= includes equality as well as greater values."],
  loops: ["How many numbers are in range(2, 6, 2)?", ["Two: 2 and 4.", "Three: 2, 4, and 6.", "Four."], 0, "The stop value is excluded, so range(2, 6, 2) produces 2 and 4."],
  collections: ["What is the first index in a Python list?", ["0", "1", "-1"], 0, "The first item is at index zero."],
  functions: ["What does return do inside a function?", ["Displays text only.", "Sends a value back to the caller.", "Repeats the function."], 1, "return gives the result back to the code that called the function."],
  files: ["Why use with open(...) to read a file?", ["It automatically manages closing the file.", "It makes every file public.", "It converts text to a number."], 0, "A with block manages cleanup when the block finishes."],
  errors: ["Which exception can int('hello') raise?", ["ValueError", "KeyError", "IndexError"], 0, "The text is not a valid integer, so int() raises ValueError."],
  modules: ["What does import math let you do?", ["Use names from the math module.", "Install any package.", "Create a new Python file."], 0, "import makes the module's available names usable in your program."],
  classes: ["What does self refer to in an instance method?", ["The current object.", "The parent folder.", "The class's source file."], 0, "self refers to the instance whose method is running."],
  generators: ["What does yield do in a generator?", ["Produces a value and pauses the function.", "Deletes an item.", "Raises an exception."], 0, "yield produces a value while preserving the generator's state."],
  context: ["What does a context manager help coordinate?", ["Setup and cleanup around a block.", "Only arithmetic.", "A new Python interpreter."], 0, "A context manager makes resource setup and cleanup predictable."],
  async: ["What is a common benefit of async I/O?", ["Waiting on I/O without blocking other work.", "Instantly making CPU-heavy work faster.", "Eliminating all errors."], 0, "Async is useful when tasks spend time waiting for I/O."],
  "web-http": ["What does an HTTP status code communicate?", ["A response outcome.", "The user's password.", "The program's CPU speed."], 0, "The status code summarizes the result of the request."],
  "web-json": ["Why validate data received by an API?", ["External data may be incomplete or invalid.", "JSON always contains a password.", "Validation changes the response status."], 0, "Treat external input as untrusted and check its shape and values."],
  "data-csv": ["What type are parsed CSV values usually read as?", ["Strings.", "Always integers.", "Booleans only."], 0, "Convert text values to the numeric type needed for calculations."],
  "data-quality": ["Why check data quality before interpreting an average?", ["Missing values or outliers can affect the result.", "An average is always incorrect.", "It turns a list into a dictionary."], 0, "The data's size, gaps, units, and range all affect an interpretation."],
  "automation-workflow": ["Why preview a file automation with a dry run?", ["To review proposed changes before modifying files.", "To delete files faster.", "To bypass input checks."], 0, "A dry run makes the planned changes visible before they happen."],
  "automation-csv": ["What does csv.writer help with?", ["Writing structured CSV rows.", "Creating a database.", "Running a web server."], 0, "csv.writer correctly formats delimited rows."],
  "algorithms-search": ["What does linear search return when a value is missing?", ["A documented not-found result.", "The last index every time.", "An unrelated value."], 0, "A search should handle a missing value explicitly; this example returns -1."],
  "algorithms-complexity": ["How does a single pass over n items usually grow?", ["Roughly in proportion to n.", "Exactly n squared.", "It does not depend on n."], 0, "A single loop visits each item once, so work grows with input size."],
  "tuples-sets": ["Which collection keeps only unique values?", ["A set.", "A list.", "A string."], 0, "A set stores unique hashable values."],
  comprehensions: ["What does a list comprehension produce?", ["A new list built from an iterable.", "A class definition.", "A file object."], 0, "A list comprehension creates a new list from an iterable and expression."],
  "types-testing": ["Do type hints automatically validate values at runtime?", ["Yes, in every Python program.", "No; they document expected types, and tests still matter.", "Only for strings."], 1, "Type hints are annotations; tests check actual behavior."],
  "standard-library": ["What is pathlib useful for?", ["Working with filesystem paths.", "Sending emails.", "Training a neural network."], 0, "pathlib provides objects and helpers for filesystem paths."],
  "ml-data": ["Why keep evaluation examples separate from training examples?", ["To test performance on data the model has not trained on.", "To hide errors.", "To speed up printing."], 0, "A separate evaluation split helps measure generalization."],
  "ml-evaluation": ["What can accuracy hide?", ["Which types of mistakes are made.", "The number of examples.", "The model's filename."], 0, "A single accuracy score can obscure false positives, false negatives, or uneven performance."],
  "game-state": ["Why separate a game-state update from drawing?", ["So the logic can be tested on its own.", "So the score cannot change.", "So the program needs more code."], 0, "Small, pure update functions are easier to test."],
  "game-loop": ["What are three common game-loop steps?", ["Read input, update state, display a result.", "Install a package, delete files, stop Python.", "Import, publish, archive."], 0, "Separating input, state updates, and display keeps a game loop understandable."],
  "tuples-sets": ["Which collection keeps only unique values?", ["A set.", "A list.", "A string."], 0, "A set stores unique hashable values."],
  comprehensions: ["What does a list comprehension produce?", ["A new list built from an iterable.", "A class definition.", "A file object."], 0, "A list comprehension creates a new list from an iterable and expression."],
  "types-testing": ["Do type hints automatically validate values at runtime?", ["Yes, in every Python program.", "No; they document expected types, and tests still matter.", "Only for strings."], 1, "Type hints are annotations; tests check actual behavior."],
  "standard-library": ["What is pathlib useful for?", ["Working with filesystem paths.", "Sending emails.", "Training a neural network."], 0, "pathlib provides objects and helpers for filesystem paths."],
  "ml-data": ["Why keep evaluation examples separate from training examples?", ["To test performance on data the model has not trained on.", "To hide errors.", "To speed up printing."], 0, "A separate evaluation split helps measure generalization."],
  "ml-evaluation": ["What can accuracy hide?", ["Which types of mistakes are made.", "The number of examples.", "The model's filename."], 0, "A single accuracy score can obscure false positives, false negatives, or uneven performance."],
  "game-state": ["Why separate a game-state update from drawing?", ["So the logic can be tested on its own.", "So the score cannot change.", "So the program needs more code."], 0, "Small, pure update functions are easier to test."],
  "game-loop": ["What are three common game-loop steps?", ["Read input, update state, display a result.", "Install a package, delete files, stop Python.", "Import, publish, archive."], 0, "Separating input, state updates, and display keeps a game loop understandable."]
};

export const PATHS = [
  {
    id: "foundations",
    title: "Python foundations",
    level: "Start here",
    accent: "blue",
    description: "Get comfortable reading, writing, and running your first programs.",
    lessons: [
      lesson("hello", "Your first Python program", "Display output with print(), read a program from top to bottom, and make a change of your own.", "Programs are instructions a computer follows. Python reads your code from top to bottom. print() displays a value so you can see what your program did.", "print('Hello, world!')\nprint('I am learning Python.')", "Hello, world!\nI am learning Python.", "Use print() to display Welcome to Python!", "# Your first Python instruction\n", 'assert "Welcome to Python!" in output, "Use print() to display the welcome message."', ["print() displays a value.", 'Put the words inside quotes: print("Hello!").'], "Change the program to introduce yourself."),
      lesson("variables", "Store information in variables", "Give a value a useful name, update it, and use it in another expression.", "A variable is a name that refers to a value. The = sign assigns the value on its right to the name on its left; it does not mean mathematical equality.", 'name = "Ada"\nyears_learning = 1\nprint(name)\nprint(years_learning)', "Ada\n1", 'Create a variable named language containing "Python", then print it.', "# Create a language variable\n\n# Display its value\n", 'assert namespace.get("language") == "Python", "Create language with the value Python."\nassert "Python" in output, "Display the value of language."', ['Use assignment: language = "Python".', "Call print(language) on the next line."], "Store two facts in separate variables and display a sentence using both."),
      lesson("types", "Numbers, text, and true-or-false values", "Recognize strings, integers, floats, and booleans, and check a value's type.", "A value's type describes what it represents and which operations make sense. Text is written in quotes; int is a whole number, float can have a decimal, and bool is True or False.", 'name = "Mina"  # str\nvisits = 3       # int\nprice = 4.5      # float\nis_ready = True  # bool\nprint(type(price).__name__)', "float", 'Create an integer called count with value 3 and print the type name.', "# Create count\n\n# Print its type name\n", 'assert namespace.get("count") == 3, "Set count to the integer 3."\nassert "int" in output, "Display the type name with type(count).__name__."', ["A whole number needs no quotes: count = 3.", "Use print(type(count).__name__) to display the type name."], "Create one value of each type and display each type's name."),
      lesson("math", "Calculate with Python", "Use arithmetic operators and follow operator precedence.", "Python can calculate with +, -, *, and /. Parentheses make the order of operations explicit. // divides into whole-number chunks, and % gives the remainder.", "apples = 17\nboxes = 5\nprint(apples // boxes)\nprint(apples % boxes)\nprint((2 + 3) * 4)", "3\n2\n20", "Divide 29 by 6 and print the whole-number result and remainder on separate lines.", "# Use // for whole-number division\n\n# Use % to find the remainder\n", 'assert output.strip().splitlines() == ["4", "5"], "29 divided by 6 has quotient 4 and remainder 5."', ["Use 29 // 6 for the quotient.", "Use 29 % 6 for the remainder."], "Calculate how many complete 6-person teams can be made from 29 people and how many people remain."),
      lesson("input", "Ask for input and convert it", "Read keyboard input and convert text to a number before calculating.", "input() displays a prompt and returns what the learner typed as text. Convert it with int() or float() before doing arithmetic.", 'name = input("Your name: ")\nage = int(input("Your age: "))\nprint(f"Hello, {name}.")\nprint(age + 1)', "Your name: Ada\nYour age: 12\nHello, Ada.\n13", "Ask for a number of minutes and print how many seconds that is.", "# Ask for minutes\nminutes = int(input(\"Minutes: \"))\n\n# Convert minutes to seconds\n", 'assert "Please enter a valid number" not in output\nassert output.strip().splitlines()[-1] == "120", "Two minutes should convert to 120 seconds."', ["input() returns text; convert it with int(...).", "Multiply the number of minutes by 60 and print the result."], "Ask for a temperature in Celsius and display its Fahrenheit equivalent."),
      lesson("strings", "Build useful messages with strings", "Join strings, use f-strings, and get information from text.", "A string is text. An f-string evaluates expressions inside braces, which makes it a clear way to combine words and values. String methods such as .strip() return transformed text.", 'name = "Ada"\nscore = 9\nmessage = f"{name} scored {score} points."\nprint(message)\nprint("  hello  ".strip())', "Ada scored 9 points.\nhello", 'Create an f-string called message that says "I am learning Python!" and print it.', 'name = "Python"\n# Build and print an f-string\n', 'assert "Python" in output, "Include the value of name in the printed message."', ["Put an f directly before the opening quote.", 'Use braces around a variable: f"Hello, {name}".'], "Ask for a name and print a friendly two-sentence introduction."),
      lesson("decisions", "Make decisions with if and else", "Compare values and choose which block of code should run.", "An if statement checks a condition. Python runs its indented block only when the condition is true. elif checks another condition; else handles the remaining case.", 'score = 82\nif score >= 60:\n    print("Pass")\nelse:\n    print("Try again")', "Pass", 'If score is 85 or higher, print Excellent. Otherwise, print Keep practising.', "score = 90\n# Add an if/else decision\n", 'assert "Excellent" in output, "A score of 90 meets the 85-point target."', ["The first line starts with if score >= 85:.", "Indent print('Excellent') beneath if, and print('Keep practising') beneath else."], "Extend the program to print Excellent, Good, or Keep practising for three score ranges."),
      lesson("loops", "Repeat work with loops", "Repeat an instruction using for, range(), and while.", "A for loop processes each value in an iterable. range(start, stop) includes start but stops before stop. A while loop repeats while its condition is true.", "for number in range(1, 4):\n    print(number)", "1\n2\n3", "Use a for loop to print the even numbers 2, 4, and 6.", "# Use range() to repeat an instruction\n", 'assert output.strip().splitlines() == ["2", "4", "6"], "Print 2, 4, and 6 with a for loop."', ["Use range(2, 7, 2) to step by two.", "Indent print(number) under your for loop."], "Calculate the sum of all integers from 1 through 100."),
      lesson("collections", "Organize information in lists and dictionaries", "Create collections, find items by index or key, and loop over their contents.", "A list keeps an ordered sequence and uses zero-based indexes. A dictionary maps keys to values, which is useful when each value has a meaningful name.", 'colors = ["red", "green", "blue"]\nstudent = {"name": "Sam", "score": 9}\nprint(colors[1])\nprint(student["name"])', "green\nSam", 'Create a list of three colors and print its second item.', "# Make a list called colors\n\n# Print its second item\n", 'assert "green" in output, "The second list item uses index 1."', ["Create a list with square brackets: colors = [...].", "The second item is colors[1]."], "Count how often each word appears in a short sentence using a dictionary."),
      lesson("functions", "Write reusable functions", "Define a function, pass it an argument, and return a result.", "A function gives a group of instructions a reusable name. Parameters receive values from callers; return sends a result back to the caller.", 'def double(number):\n    return number * 2\n\nprint(double(4))', "8", "Write double(number) to return a number multiplied by two.", "# Define double(number)\n\n\nprint(double(4))\n", 'assert callable(namespace.get("double")), "Define double(number)."\nassert namespace["double"](9) == 18, "Return number multiplied by 2."\nassert output.strip() == "8", "Print the result of double(4)."', ["Start with def double(number):.", "Indent return number * 2 inside the function."], "Write a function that accepts a list of scores and returns the highest score."),
      lesson("files", "Read and write files safely", "Use with to open a file and keep file operations inside a clear block.", "Files let a program keep information between runs. The with statement manages opening and closing a file. Read and write only files the student explicitly chooses.", 'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Keep learning!")\n\nwith open("notes.txt", encoding="utf-8") as file:\n    print(file.read())', "Keep learning!", "Write a short message to a file, then open and print it.", "# Open notes.txt with a with statement\n# Write a short message\n\n# Read and print the message\n", 'assert "Keep learning!" in output or len(output.strip()) > 0, "Read and print the text you saved."', ["Use with open('notes.txt', 'w', encoding='utf-8') as file: to write.", "Use a second with open(...) to read the file's contents."], "Save a small to-do list to a text file and load it again."),
      lesson("errors", "Understand errors and debug calmly", "Read tracebacks, catch a specific exception, and validate user input.", "An error message is a clue. A traceback points to the operation that failed. Use try/except for an expected failure and provide a useful explanation instead of hiding every error.", 'try:\n    quantity = int("a lot")\nexcept ValueError:\n    print("Please enter a whole number.")', "Please enter a whole number.", 'Handle the ValueError raised when converting "oops" to an integer and print a helpful message.', '# Convert the text "oops" inside try/except\n', 'assert "number" in output.lower() or "try" in output.lower(), "Explain what kind of input the user should provide."', ["The conversion raises ValueError.", "Put the conversion in try and an except ValueError: block below it."], "Keep asking a user for a number until they provide valid input."),
      lesson("modules", "Use modules and write tests", "Import standard-library features and verify your function with assertions.", "Modules organize reusable code. The Python standard library provides tools you can import without installing a package. Tests check behavior against examples.", "import math\n\ndef circle_area(radius):\n    return math.pi * radius ** 2\n\nassert circle_area(0) == 0\nprint(round(circle_area(1), 2))", "3.14", "Write a square(number) function and check it with two assertions.", "# Define square(number)\n\n\n# Add two assert checks\n", 'assert callable(namespace.get("square")), "Define square(number)."\nassert namespace["square"](4) == 16, "Check a positive number."\nassert namespace["square"](-3) == 9, "Check a negative number."\nprint("Tests passed")', ["Return number ** 2.", "Check both the result for 4 and the result for -3."], "Add a test for zero and a test for a decimal number."),
      lesson("classes", "Model real things with classes", "Create objects, initialize attributes, and use a dataclass for simple records.", "A class describes a kind of object; each object contains its own attributes. A dataclass can generate common methods for a record whose main purpose is to store related values.", 'from dataclasses import dataclass\n\n@dataclass\nclass Book:\n    title: str\n    pages: int\n\nbook = Book("Python Paths", 120)\nprint(f"{book.title}: {book.pages} pages")', "Python Paths: 120 pages", 'Create a simple class named Pet whose initializer stores a name, then print the name.', "# Define Pet with an __init__ method\n\n\npet = Pet(\"Pip\")\nprint(pet.name)\n", 'assert type(namespace.get("pet")).__name__ == "Pet", "Create an instance of Pet."\nassert namespace["pet"].name == "Pip", "Store the name on the object."\nassert output.strip() == "Pip", "Print the pet name."', ["Define class Pet:.", "Inside def __init__(self, name):, set self.name = name."], "Add a method that returns a friendly description of your pet."),
      lesson("generators", "Process sequences with iterators and generators", "Understand lazy iteration and yield values one at a time.", "An iterator provides values one at a time. A generator function uses yield to produce a sequence lazily, which can save memory when processing a large result.", 'def countdown(start):\n    while start > 0:\n        yield start\n        start -= 1\n\nprint(list(countdown(3)))', "[3, 2, 1]", "Create a generator called countdown that yields 3, 2, and 1.", "# Write a countdown generator\n\n\nprint(list(countdown(3)))\n", 'assert list(namespace["countdown"](3)) == [3, 2, 1], "Yield each whole number down to 1."', ["Define a function with def countdown(start):.", "Use yield start, then subtract one before the next loop."], "Build a generator that yields only even numbers from a sequence."),
      lesson("context", "Use context managers and decorators", "Manage a resource with with and recognize a decorator as a function wrapper.", "Context managers arrange setup and cleanup around a block. A decorator wraps a function to add behavior without changing the code at each call site.", 'from contextlib import contextmanager\n\n@contextmanager\ndef announce():\n    print("Start")\n    yield\n    print("Finish")\n\nwith announce():\n    print("Working")', "Start\nWorking\nFinish", "Write a context manager that prints Opening before a block and Closing afterwards.", "from contextlib import contextmanager\n\n# Define announce_block()\n\n\nwith announce_block():\n    print(\"Inside\")\n", 'assert output.strip().splitlines() == ["Opening", "Inside", "Closing"], "Run setup and cleanup around the block."', ["Use @contextmanager above a function.", "Print Opening, then yield, then print Closing."], "Write a decorator that counts how many times a function is called."),
      lesson("async", "Know when asynchronous Python helps", "Read async and await syntax and recognize an I/O-bound concurrency pattern.", "Asynchronous code lets a program wait for I/O without blocking unrelated tasks. It is useful for many network waits; it does not automatically make CPU-heavy work faster.", "import asyncio\n\nasync def main():\n    message = await asyncio.sleep(0, result=\"Ready\")\n    print(message)\n\nasyncio.run(main())", "Ready", "In the example, await pauses until the asynchronous operation returns a result.", "import asyncio\n\nasync def greet():\n    # Await an async result and print it\n    pass\n\nasyncio.run(greet())\n", 'assert "await" in source, "Use await inside an async function."\nassert "Hello" in output, "Print the awaited result."', ["Create the function with async def greet():.", 'Use await asyncio.sleep(0, result="Hello") to get a result.'], "Describe whether a slow image resize is CPU-bound or I/O-bound, and explain which concurrency tool might fit."),
    ]
  },
  {
    id: "quality",
    title: "Readable, typed, tested Python",
    level: "Core skills",
    accent: "purple",
    description: "Use type hints, small testable functions, and Python's standard library.",
    lessons: [
      lesson("tuples-sets", "Choose tuples and sets", "Use tuples for fixed records and sets for membership and unique values.", "A tuple is an ordered, immutable sequence. A set holds unique hashable items and is useful for quick membership checks. Choose a structure based on how the data will be used.", 'coordinates = (4, 7)\nvisited = {"north", "east"}\nprint(coordinates[0])\nprint("north" in visited)', "4\nTrue", "Convert the list [2, 2, 4, 4, 6] to a set and print it.", "values = [2, 2, 4, 4, 6]\n# Create and print unique values\n", 'assert namespace.get("unique") == {2, 4, 6}, "Use the set constructor to remove duplicates."\nassert "2" in output or "4" in output, "Display the unique values."', ["A set removes duplicate values.", "Assign unique = set(values), then print(unique)."], "Use a set to find which tags occur in both of two collections."),
      lesson("comprehensions", "Create collections with comprehensions", "Build a list or dictionary from an iterable with a readable comprehension.", "A comprehension combines a simple loop and value expression into a new collection. Keep it straightforward; use a regular loop when the logic becomes hard to read.", "squares = [number ** 2 for number in range(1, 5)]\nprint(squares)", "[1, 4, 9, 16]", "Create a list of the even numbers from 0 up to 8.", "numbers = range(10)\n# Build a list of even numbers\n", 'assert namespace.get("evens") == [0, 2, 4, 6, 8], "Keep only the even values."', ["Start with [number for number in numbers if ...].", "An even number has number % 2 == 0."], "Build a dictionary that maps each word in a sentence to its length."),
      lesson("types-testing", "Use type hints and test behavior", "Document function inputs and outputs and check behavior with assertions.", "Type hints communicate the kinds of values a function expects. They do not enforce types at runtime, so tests still matter. A test should check observable behavior, including boundary cases.", "def rectangle_area(width: float, height: float) -> float:\n    return width * height\n\nassert rectangle_area(3, 4) == 12\nprint(rectangle_area(3, 4))", "12", "Annotate a function that takes an integer and returns its square.", "def square(number):\n    return number ** 2\n\nprint(square(5))\n", 'assert callable(namespace.get("square")), "Define square(number)."\nassert namespace["square"](5) == 25, "Return the square of the input."\nassert "-> int" in source, "Add a return type hint."', ["Write the parameter annotation after a colon.", "Use -> int before the function's colon."], "Add tests for a negative value and a zero value."),
      lesson("standard-library", "Find the right standard-library tool", "Use pathlib and datetime to solve a small problem without installing a package.", "Python's standard library covers common tasks. pathlib works with filesystem paths, while datetime represents dates and times. Prefer a well-named existing tool over fragile string manipulation.", 'from pathlib import Path\nfrom datetime import date\n\nfilename = Path("notes.txt")\nprint(filename.suffix)\nprint(date(2025, 1, 1).year)', ".txt\n2025", 'Use pathlib.Path to find the suffix of "report.csv".', 'from pathlib import Path\n# Create a Path for report.csv\n\nprint(path.suffix)\n', 'assert output.strip() == ".csv", "Read the suffix with pathlib.Path."', ["Create path = Path('report.csv').", "Path objects provide a .suffix property."], "Represent a date and calculate how many days separate it from another date.")
    ]
  },
  {
    id: "projects",
    title: "Project workshop",
    level: "Make things",
    accent: "pink",
    description: "Build complete applications in small, testable milestones.",
    lessons: []
  },
  {
    id: "web",
    title: "Web APIs",
    level: "Specialization",
    accent: "purple",
    description: "Learn what HTTP APIs do and design an application boundary.",
    lessons: [
      lesson("web-http", "Understand requests and responses", "Identify the parts of an HTTP request, a response, and a JSON API.", "A client sends a request to a server. The response includes a status code and a body. An API lets programs exchange structured data; validate inputs before using them.", 'request = {"method": "GET", "path": "/lessons"}\nresponse = {"status": 200, "body": [{"title": "Python basics"}]}\nprint(response["status"])', "200", "Create a response dictionary with status 201 and print the status.", 'response = {"status": 201}\n# Print the response status\n', 'assert output.strip() == "201", "Read and print the status key."', ["The status is stored under the key 'status'.", 'Use print(response["status"]).'], "Describe one validation rule for a name submitted to an API."),
      lesson("web-json", "Validate structured data", "Parse JSON-shaped data, check required fields, and explain why validation matters.", "External data is untrusted, even when it is valid JSON. Check its shape, type, length, and allowed values before using it in an application.", "import json\n\npayload = json.loads('{\"name\": \"Ada\"}')\nif isinstance(payload.get(\"name\"), str) and payload[\"name\"].strip():\n    print(\"Name is valid\")", "Name is valid", "Check that a provided dictionary contains a non-empty text field called title.", 'payload = {"title": "Learn Python"}\n# Validate title\n', 'assert "valid" in output.lower(), "Check that title is a non-empty string."', ["Use payload.get('title') to look up a value safely.", "Check isinstance(title, str) and title.strip()."], "Add a maximum length and reject unexpected fields."),
    ]
  },
  {
    id: "data",
    title: "Data and analysis",
    level: "Specialization",
    accent: "teal",
    description: "Work with tabular data, ask useful questions, and explain results.",
    lessons: [
      lesson("data-csv", "Read tabular data with CSV", "Read rows, headers, and values from a comma-separated dataset.", "CSV stores table rows as text. The csv module handles common quoting and delimiter details. Convert text to numbers before doing calculations.", 'import csv\nfrom io import StringIO\n\nsource = StringIO("item,count\\\\napples,3\\\\npears,2\\\\n")\nfor row in csv.DictReader(source):\n    print(row["item"], int(row["count"]))', "apples 3\npears 2", 'Turn the text "7" into the integer 7 and print its value.', 'quantity = int("7")\nprint(quantity)\n', 'assert output.strip() == "7", "Convert text values to numbers before calculating."', ["CSV values begin as text.", "Use int() for a whole-number value or float() for a decimal."], "Calculate and report the total from a small CSV dataset."),
      lesson("data-quality", "Check and summarize a dataset", "Count records, find a simple average, and identify missing data.", "A summary is only useful when the data quality is understood. Check the sample size, missing values, units, and range before interpreting averages.", "scores = [8, 10, 6, 9]\naverage = sum(scores) / len(scores)\nprint(len(scores))\nprint(average)", "4\n8.25", "Calculate the average of the scores 5, 7, and 9.", "scores = [5, 7, 9]\n# Calculate the average\n", 'assert float(output.strip()) == 7, "Divide the total by the number of values."', ["Add the values with sum(scores).", "Divide by len(scores)."], "Explain how a single extreme value might change an average."),
    ]
  },
  {
    id: "automation",
    title: "Automation",
    level: "Specialization",
    accent: "orange",
    description: "Make repeatable, observable tools for everyday tasks.",
    lessons: [
      lesson("automation-workflow", "Design a reliable automation", "Break a repeated task into input, validation, action, and a visible result.", "A useful automation performs one clear task, handles expected failures, and reports what happened. Start with a dry run when actions could affect important files.", 'from pathlib import Path\n\nnames = ["report.txt", "notes.txt"]\nfor name in names:\n    print(f"Would process: {Path(name).name}")', "Would process: report.txt\nWould process: notes.txt", 'Print "Dry run complete" after simulating an action without changing files.', 'print("Dry run complete")\n', 'assert output.strip() == "Dry run complete", "Report when the dry run is finished."', ["Use print() to report a simulated operation.", "Do not delete or change real files while testing."], "Plan a file-organizer dry run with preview, validation, and recovery steps."),
      lesson("automation-csv", "Generate a small CSV report", "Write a CSV report with column headings and clear values.", "The csv module safely formats delimiter-separated values. Structured rows make a report easier for another program to process.", 'import csv\nfrom io import StringIO\n\nreport = StringIO()\nwriter = csv.writer(report)\nwriter.writerow(["task", "complete"])\nwriter.writerow(["Practice", True])\nprint(report.getvalue().strip())', "task,complete\nPractice,True", "Use csv.writer to make a header row with item and total.", 'import csv\nfrom io import StringIO\nreport = StringIO()\nwriter = csv.writer(report)\n# Write the column headings\n', 'assert "item,total" in output, "Write the requested CSV headings."', ["Use writer.writerow([...]) to add one row.", 'Put "item" and "total" into a list.'], "Add three data rows and explain how to verify the report."),
    ]
  },
  {
    id: "machine-learning",
    title: "Machine learning foundations",
    level: "Specialization",
    accent: "teal",
    description: "Learn what a model learns, how to evaluate it, and where bias can appear.",
    lessons: [
      lesson("ml-data", "Prepare and split data carefully", "Separate training examples from evaluation examples and avoid data leakage.", "A model learns patterns from examples. Keep evaluation data separate from training so it measures performance on examples the model has not already seen. A misleading data split can make results look better than they are.", 'examples = ["train-1", "train-2", "test-1"]\ntrain = examples[:2]\ntest = examples[2:]\nprint(len(train), len(test))', "2 1", "Create a training list with three items and an evaluation list with one separate item.", 'train = ["a", "b", "c"]\ntest = ["d"]\n# Report the sizes\n', 'assert "3 1" in output, "Keep training and evaluation examples separate."', ["Count each list with len().", "Print both counts to make the split visible."], "Explain why using test data to tune model settings can lead to over-optimistic results."),
      lesson("ml-evaluation", "Measure model errors fairly", "Distinguish accuracy from the kinds of errors a model makes.", "A single score does not tell the whole story. Compare predictions with known outcomes, examine false positives and false negatives, and consider which groups or situations are underrepresented.", "actual = [1, 1, 0, 1]\npredicted = [1, 0, 0, 1]\ncorrect = sum(left == right for left, right in zip(actual, predicted))\nprint(correct / len(actual))", "0.75", "Count correct predictions for the provided actual and predicted values.", 'actual = [1, 0, 1]\npredicted = [1, 1, 1]\n# Count the matching pairs\n', 'assert "2" in output, "Two predictions match their actual labels."', ["Use zip(actual, predicted) to pair the values.", "Count pairs whose values are equal."], "Describe one risk of using accuracy alone when positive cases are rare.")
    ]
  },
  {
    id: "games",
    title: "Game programming foundations",
    level: "Specialization",
    accent: "pink",
    description: "Model game state and update it with small, testable Python functions.",
    lessons: [
      lesson("game-state", "Model game state", "Represent player position and score with simple data and clear state transitions.", "A game state records the information that changes while playing. Keep the update rule separate from drawing or input so it can be reasoned about and tested independently.", 'player = {"x": 0, "score": 0}\nplayer["x"] += 1\nplayer["score"] += 10\nprint(player)', "{'x': 1, 'score': 10}", "Write a function that moves a position one step and returns the new position.", "def move(position):\n    # Return the position after one step\n    pass\n\nprint(move(3))\n", 'assert callable(namespace.get("move")), "Define move(position)."\nassert namespace["move"](3) == 4, "Move the position one step forward."\nassert "4" in output, "Display the updated position."', ["A function should accept position and return a new value.", "Return position + 1."], "Add a boundary so a player cannot move outside a board of width 10."),
      lesson("game-loop", "Structure a game loop", "Describe input, state update, and display as separate steps.", "A game loop repeatedly checks input, updates state, and displays the result until the game ends. Keeping each step small makes it easier to test without a graphics library.", 'def update_score(score, points):\n    return score + points\n\nscore = update_score(0, 10)\nprint(f"Score: {score}")', "Score: 10", "Write a function that adds collected points to a score.", "def add_points(score, points):\n    # Return the updated score\n    pass\n\nprint(add_points(5, 2))\n", 'assert callable(namespace.get("add_points")), "Define add_points(score, points)."\nassert namespace["add_points"](5, 2) == 7, "Add points to the current score."\nassert "7" in output, "Display the new score."', ["Accept the current score and points as parameters.", "Return score + points."], "Write a pure function that decides whether two rectangles overlap.")
    ]
  },
  {
    id: "algorithms",
    title: "Algorithms and problem solving",
    level: "Specialization",
    accent: "indigo",
    description: "Break a task into steps and reason about correctness and cost.",
    lessons: [
      lesson("algorithms-search", "Search a collection", "Write a simple linear search and explain when it stops.", "An algorithm is a procedure for solving a problem. Linear search examines items one at a time; its worst-case work grows with the size of the list.", 'def find_item(items, target):\n    for index, item in enumerate(items):\n        if item == target:\n            return index\n    return -1\n\nprint(find_item(["a", "b", "c"], "b"))', "1", 'Implement a linear search that returns the index of 9 in [4, 9, 2].', '# Define find_item(items, target)\n\n\nprint(find_item([4, 9, 2], 9))\n', 'assert callable(namespace.get("find_item")), "Define find_item."\nassert namespace["find_item"]([4, 9, 2], 9) == 1, "Return the matching index."\nassert namespace["find_item"]([4, 9], 5) == -1, "Return -1 when no item matches."', ["Loop over indexes and values using enumerate().", "Return the index when the value equals target."], "Add tests for an empty list and for repeated values."),
      lesson("algorithms-complexity", "Compare the cost of algorithms", "Describe input size and compare linear and nested-loop work.", "Complexity describes how resource use changes as input grows. A single pass usually scales roughly with n; comparing each item to every other item often scales roughly with n squared.", "items = [1, 2, 3]\nfor item in items:\n    print(item)", "1\n2\n3", "The example visits each item once, so the number of visits grows with the list.", "items = [2, 4, 6]\n# Visit each item once\n", 'assert output.strip().splitlines() == ["2", "4", "6"], "Process every value with one loop."', ["Use for item in items:.", "Indent the action inside the loop."], "Compare one loop over n items with two nested loops over n items each."),
    ]
  }
];

function lesson(id, title, objective, explanation, example, expected, task, starter, tests, hints, challenge) {
  const lines = example.split("\n");
  return {
    id,
    title,
    objective,
    explanation,
    why: "This is a building block for programs that are easier to read, test, and improve.",
    syntax: lines[0],
    example,
    walkthrough: lines.map((line, index) => ({
      code: `${index + 1}. ${line || "(blank line)"}`,
      explanation: explainCodeLine(line)
    })),
    expected,
    mistakes: ["Check spelling, matching quotes, and punctuation.", "Use consistent indentation inside code blocks.", "Read the final line of a traceback before changing code."],
    task,
    starter,
    tests,
    hints,
    challenge,
    summary: `You learned to ${objective.charAt(0).toLowerCase()}${objective.slice(1).replace(/[.!?]+$/, "")}.`,
    question: {
      prompt: KNOWLEDGE_CHECKS[id]?.[0] ?? `Which is a useful first step when working on: ${title.toLowerCase()}?`,
      options: KNOWLEDGE_CHECKS[id]?.[1] ?? ["Read the example and try a small change.", "Copy a solution without running it.", "Ignore the output and error messages."],
      answer: KNOWLEDGE_CHECKS[id]?.[2] ?? 0,
      explanation: KNOWLEDGE_CHECKS[id]?.[3] ?? "A small, observable change helps you connect code with its result."
    }
  };
}

function explainCodeLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return "A blank line separates steps to make code easier to read.";
  if (trimmed.startsWith("#")) return "A comment explains the code to readers and is not run as a Python instruction.";
  if (trimmed.startsWith("import ")) return "Import the standard-library module or feature used by the program.";
  if (trimmed.startsWith("def ")) return "Define a reusable function and name its input parameters.";
  if (trimmed.startsWith("class ")) return "Define a class that describes the objects the program can create.";
  if (trimmed.startsWith("if ") || trimmed.startsWith("elif ")) return "Check a condition; Python runs this indented block when it is true.";
  if (trimmed === "else:" || trimmed.startsWith("else:")) return "Provide the alternative block when the earlier condition was false.";
  if (trimmed.startsWith("for ") || trimmed.startsWith("while ")) return "Repeat the indented instructions for a sequence or while a condition holds.";
  if (trimmed.startsWith("with ")) return "Use a context manager to handle setup and cleanup for the block.";
  if (trimmed.startsWith("try:")) return "Begin a block where an expected exception can be handled.";
  if (trimmed.startsWith("except ")) return "Handle a particular exception and explain what the user can do.";
  if (trimmed.startsWith("return ")) return "Send a result back to the code that called this function.";
  if (trimmed.startsWith("yield ")) return "Produce one value from a generator and pause until the next value is requested.";
  if (trimmed.startsWith("print(")) return "Display this value so you can inspect the program's result.";
  if (trimmed.startsWith("input(")) return "Ask the user for text input and store the response if it is assigned.";
  if (trimmed.includes("=")) return "Assign or update a value so the program can use it in a later step.";
  if (trimmed.startsWith("raise ")) return "Report an invalid operation explicitly instead of returning a misleading result.";
  return "Run this instruction as part of the current step in the program.";
}

export const PROJECTS = [
  { id: "calculator", title: "Pocket calculator", level: "Beginner", time: "25 min", description: "Build a calculator that validates input and handles the four basic operations.", prerequisites: ["Variables", "Input", "Decisions"], milestones: ["Plan inputs and expected results", "Convert user values into numbers", "Choose an operation safely", "Handle invalid input and division by zero", "Test the calculator with several examples"], extension: "Add a repeat-until-quit loop and a history of results.", starter: 'def calculate(left, operator, right):\n    if operator == "+":\n        return left + right\n    if operator == "-":\n        return left - right\n    if operator == "*":\n        return left * right\n    if operator == "/" and right != 0:\n        return left / right\n    raise ValueError("Choose a valid operation and non-zero divisor.")\n\nprint(calculate(8, "/", 2))' },
  { id: "number-game", title: "Number guessing game", level: "Beginner", time: "30 min", description: "Make a friendly number game with hints and a limited number of attempts.", prerequisites: ["Decisions", "Loops", "Input"], milestones: ["Pick a target number", "Read and validate each guess", "Give higher or lower feedback", "Count attempts", "Handle a win and a loss"], extension: "Add difficulty levels and a replay option.", starter: 'target = 7\nattempts = 0\n\nwhile attempts < 3:\n    guess = int(input("Your guess: "))\n    attempts += 1\n    if guess == target:\n        print("You got it!")\n        break\n    if guess < target:\n        print("Try higher")\n    else:\n        print("Try lower")\nelse:\n    print("The number was", target)' },
  { id: "quiz", title: "A quiz built by you", level: "Beginner", time: "35 min", description: "Build a small quiz that scores answers and gives kind feedback.", prerequisites: ["Strings", "Collections", "Functions"], milestones: ["Represent questions and answers", "Ask each question", "Check and count answers", "Explain incorrect answers", "Show the final score"], extension: "Save a result as JSON and load it later.", starter: 'questions = [("What does print() do?", "display output"), ("What is the first list index?", "0")]\nscore = 0\n\nfor question, answer in questions:\n    response = input(question + " ").strip().lower()\n    if response == answer:\n        print("Correct!")\n        score += 1\n    else:\n        print("Not quite — keep practising.")\n\nprint(f"Score: {score}/{len(questions)}")' },
  { id: "todo", title: "A to-do list", level: "Core", time: "45 min", description: "Build a command-line task list with reusable functions and a file-backed save.", prerequisites: ["Lists", "Functions", "Files"], milestones: ["Model task data", "Add and list tasks", "Mark a task complete", "Save and reload JSON data", "Handle a missing or malformed file"], extension: "Add due dates and a CSV export.", starter: 'tasks = []\n\ndef add_task(title):\n    tasks.append({"title": title, "done": False})\n\ndef show_tasks():\n    for number, task in enumerate(tasks, start=1):\n        status = "✓" if task["done"] else " "\n        print(f"{number}. [{status}] {task[\'title\']}")\n\nadd_task("Practise Python")\nshow_tasks()' },
  { id: "file-organizer", title: "File organizer dry run", level: "Intermediate", time: "45 min", description: "Plan a safe file organizer that previews changes before applying them.", prerequisites: ["Paths", "Files", "Errors"], milestones: ["List candidate files", "Group files by type", "Print a dry-run preview", "Validate destinations", "Add a reversible move mode"], extension: "Write a change log and an undo plan.", starter: 'from pathlib import Path\n\nfiles = [Path("report.pdf"), Path("photo.png"), Path("notes.txt")]\nfor file in files:\n    folder = file.suffix.lstrip(".") or "other"\n    print(f"DRY RUN: {file} -> {folder}/{file.name}")' },
  { id: "api-client", title: "A resilient API client", level: "Advanced", time: "60 min", description: "Design a small API client with input validation, clear errors, and tests.", prerequisites: ["Modules", "Errors", "Testing", "HTTP"], milestones: ["Define the request and response model", "Validate request inputs", "Handle timeouts and error statuses", "Keep secrets out of source code", "Test behavior with a local fake response"], extension: "Add asynchronous requests with a bounded concurrency limit.", starter: 'def parse_profile(payload):\n    if not isinstance(payload, dict):\n        raise TypeError("Profile data must be an object.")\n    name = payload.get("name")\n    if not isinstance(name, str) or not name.strip():\n        raise ValueError("Profile name must be non-empty text.")\n    return {"name": name.strip()}\n\nprint(parse_profile({"name": "Ada"}))' }
];

export const QUESTIONS = PATHS.flatMap((path) => path.lessons.map((item) => ({
  id: `${item.id}-check`,
  lessonId: item.id,
  topic: path.title,
  ...item.question
})));

export const GLOSSARY = [
  ["argument", "A value supplied when a function is called."],
  ["boolean", "A truth value: True or False."],
  ["class", "A definition used to create objects with related data and behavior."],
  ["condition", "An expression evaluated as true or false to choose what code runs."],
  ["dictionary", "A mutable collection that maps keys to values."],
  ["exception", "An event that interrupts normal program flow and can be handled."],
  ["function", "A named, reusable block of code that can accept inputs and return a result."],
  ["immutable", "A value that cannot be changed after it is created."],
  ["iteration", "Repeating work for values in a sequence or until a condition changes."],
  ["list", "An ordered, mutable collection of values."],
  ["module", "A Python file or library that can be imported into another program."],
  ["parameter", "A variable named in a function definition that receives an argument."],
  ["string", "Text represented by a sequence of characters."],
  ["type hint", "An annotation that documents the expected type of a value."]
].map(([term, definition]) => ({ term, definition }));

export const REFERENCE = [
  ["print()", "Display values in the output stream.", "print('Hello!')"],
  ["input()", "Ask for text input. Convert it before doing numeric calculations.", "age = int(input('Age: '))"],
  ["len()", "Return the number of items in a collection.", "len(['a', 'b'])"],
  ["range()", "Generate an arithmetic sequence, often for a for loop.", "range(1, 5)"],
  ["sum()", "Add the numeric items in an iterable.", "sum([2, 3, 4])"],
  ["enumerate()", "Iterate over items alongside their indexes.", "enumerate(['a', 'b'])"],
  ["sorted()", "Return a new sorted list from an iterable.", "sorted([3, 1, 2])"],
  ["dict.get()", "Look up a key and optionally provide a default.", "settings.get('theme', 'light')"],
  ["try / except", "Handle an expected exception and explain the next step.", "try:\\n    count = int(text)\\nexcept ValueError:\\n    print('Enter a whole number')"],
  ["with open()", "Open a text file and ensure it is closed after the block.", "with open('notes.txt', encoding='utf-8') as file:\\n    text = file.read()"]
].map(([name, description, example]) => ({ name, description, example }));

export const ALL_LESSONS = PATHS.flatMap((path) => path.lessons.map((item, index) => ({
  ...item,
  pathId: path.id,
  pathTitle: path.title,
  level: {
    hello: "Beginner", variables: "Beginner", types: "Beginner", math: "Beginner",
    input: "Beginner", strings: "Beginner", decisions: "Beginner", loops: "Beginner",
    collections: "Core Python", functions: "Core Python", files: "Core Python", errors: "Core Python",
    modules: "Intermediate", classes: "Intermediate", generators: "Advanced Python",
    context: "Advanced Python", async: "Advanced Python"
  }[item.id] ?? path.level,
  accent: path.accent,
  sequence: index + 1
})));

export function getNextLesson(completed = []) {
  const foundations = PATHS.find((path) => path.id === "foundations");
  return foundations.lessons.find((item) => !completed.includes(item.id)) ?? null;
}

export function getLesson(id) {
  return ALL_LESSONS.find((item) => item.id === id) ?? null;
}
