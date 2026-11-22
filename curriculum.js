export const LESSONS = [
  {
    id: "first-steps",
    title: "Your first Python program",
    unit: "01",
    duration: "8 min",
    description: "Make Python say something, and learn how instructions run.",
    concept: "Python follows your instructions from top to bottom. print() displays a message so you can see what your program is doing.",
    example: 'print("Hello, world!")\nprint("I am learning Python.")',
    task: "Print the message Welcome to Python!",
    starter: "# Make Python print a welcome message\n",
    tests: 'assert "Welcome to Python!" in output, "Use print() to display the exact welcome message."',
    hints: [
      "The print() function displays a message.",
      'Put the message inside quotes: print("your message").'
    ]
  },
  {
    id: "variables",
    title: "Give your data a name",
    unit: "02",
    duration: "10 min",
    description: "Store information in variables and combine it into a message.",
    concept: "A variable is a name for a value. Use = to give a variable its value, then use that name wherever you need the value.",
    example: 'name = "Ada"\nprint("Hello, " + name)',
    task: 'Create a variable called language with the value "Python", then print it.',
    starter: "# Store a language in a variable\n\n# Print your variable\n",
    tests: 'assert "language" in namespace, "Create a variable named language."\nassert namespace["language"] == "Python", \'Set language to the text "Python".\'\nassert "Python" in output, "Print the language variable."',
    hints: [
      'Assign text with language = "Python".',
      "Use print(language) on the next line."
    ]
  },
  {
    id: "decisions",
    title: "Teach your code to decide",
    unit: "03",
    duration: "12 min",
    description: "Use if and else to choose what your program does.",
    concept: "An if statement runs its indented block only when a condition is true. else provides an alternative when it is false.",
    example: 'temperature = 22\nif temperature > 20:\n    print("Warm day")\nelse:\n    print("Cool day")',
    task: "Set score to 85. If score is at least 60, print Pass; otherwise print Try again.",
    starter: "score = 85\n\n# Add an if/else decision\n",
    tests: 'assert namespace.get("score") == 85, "Keep score set to 85."\nassert "Pass" in output, "Print Pass when the score is at least 60."',
    hints: [
      "Compare the score with 60 using >=.",
      'Start with if score >= 60: and indent print("Pass") underneath it.'
    ]
  },
  {
    id: "loops",
    title: "Repeat with loops",
    unit: "04",
    duration: "12 min",
    description: "Let a loop repeat an instruction instead of copying it.",
    concept: "A for loop goes through each item in a sequence. range(1, 4) produces 1, 2, and 3.",
    example: 'for number in range(1, 4):\n    print(number)',
    task: "Use a for loop to print the numbers 1, 2, and 3.",
    starter: "# Use range() to repeat three times\n",
    tests: 'assert output.strip().splitlines() == ["1", "2", "3"], "Print 1, 2, and 3 on separate lines using a loop."',
    hints: [
      "A for loop has the form: for number in range(...):",
      "Use range(1, 4), then indent print(number) below it."
    ]
  },
  {
    id: "lists",
    title: "Keep a list of things",
    unit: "05",
    duration: "12 min",
    description: "Collect related values in a list and pick the ones you need.",
    concept: "Lists store ordered values. Python starts counting list positions at zero, so fruits[0] is the first item.",
    example: 'fruits = ["apple", "pear", "plum"]\nprint(fruits[0])',
    task: 'Create a list called colors with "red", "green", and "blue". Print its second item.',
    starter: "# Create a list of three colors\n\n# Print the second color\n",
    tests: 'assert namespace.get("colors") == ["red", "green", "blue"], "Create the colors list in the requested order."\nassert "green" in output, "Print the second item with colors[1]."',
    hints: [
      'Use square brackets: colors = ["red", "green", "blue"].',
      "The second item is at index 1, so print(colors[1])."
    ]
  },
  {
    id: "functions",
    title: "Make your own function",
    unit: "06",
    duration: "14 min",
    description: "Package reusable instructions into a function.",
    concept: "A function groups instructions under a name. Parameters let you provide different values each time you call it.",
    example: 'def greet(name):\n    return "Hello, " + name\n\nprint(greet("Ada"))',
    task: "Write a double(number) function that returns the number multiplied by 2.",
    starter: "# Define double(number)\n\n\n# Try your function\nprint(double(4))\n",
    tests: 'assert callable(namespace.get("double")), "Define a function named double."\nassert namespace["double"](9) == 18, "double(number) should return number multiplied by 2."\nassert "8" in output, "Call double(4) and print the result."',
    hints: [
      "Start with def double(number):",
      "Inside the function, return number * 2."
    ]
  },
  {
    id: "project",
    title: "Project: a tiny quiz",
    unit: "07",
    duration: "20 min",
    description: "Bring variables, functions, and decisions together in a quiz.",
    concept: "Real programs combine small ideas. This project uses a function to check an answer and an if statement to give helpful feedback.",
    example: 'def describe_number(number):\n    if number % 2 == 0:\n        return "Even"\n    return "Odd"',
    task: 'Create check_answer(answer). It should return "Correct!" for "blue" and "Try again!" for anything else.',
    milestones: [
      "Define the check_answer(answer) function.",
      'Return "Correct!" when the answer is "blue".',
      'Return "Try again!" for any other answer.'
    ],
    starter: `# Define check_answer(answer)


# Test both paths
print(check_answer("blue"))
print(check_answer("green"))
`,
    tests: 'assert callable(namespace.get("check_answer")), "Define a function named check_answer."\nassert namespace["check_answer"]("blue") == "Correct!", \'The right answer should return "Correct!".\'\nassert namespace["check_answer"]("green") == "Try again!", \'Another answer should return "Try again!".\'',
    hints: [
      "Define a function that takes answer as its parameter.",
      'Use if answer == "blue": to handle the correct answer.',
      'Return "Try again!" after the if block for every other answer.'
    ]
  }
];

export const EXAM_QUESTIONS = [
  {
    question: 'Which line displays the word "Hi"?',
    options: ["show('Hi')", 'print("Hi")', 'write = "Hi"'],
    answer: 1,
    explanation: "print() displays values in the output."
  },
  {
    question: 'What value does color have after color = "blue"?',
    options: ["blue (text)", "0", "The name color"],
    answer: 0,
    explanation: 'The value on the right side of = is stored in the variable color.'
  },
  {
    question: "Which condition checks whether age is at least 13?",
    options: ["age > 13", "age == 13", "age >= 13"],
    answer: 2,
    explanation: ">= means greater than or equal to."
  },
  {
    question: "How many times does for n in range(3): run?",
    options: ["Two times", "Three times", "Four times"],
    answer: 1,
    explanation: "range(3) produces 0, 1, and 2: three values."
  },
  {
    question: "What is the index of the first item in a Python list?",
    options: ["0", "1", "-1"],
    answer: 0,
    explanation: "Python list indexes start at zero."
  },
  {
    question: "Which keyword sends a value back from a function?",
    options: ["print", "break", "return"],
    answer: 2,
    explanation: "return sends a result back to the code that called the function."
  }
];

export function isLessonUnlocked(index, completedLessons) {
  return index === 0 || completedLessons.includes(LESSONS[index - 1]?.id);
}

export function getRecommendedLesson(completedLessons) {
  return LESSONS.find((lesson) => !completedLessons.includes(lesson.id))?.id ?? "exam";
}

export function getProgress(completedLessons) {
  return Math.round((completedLessons.length / LESSONS.length) * 100);
}
