import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import styles from "./Notes.module.css";

const mockNotes = {
  101: {
    title: "Introduction to Python",
    icon: "🐍",
    trailTitle: "Python Fundamentals",
    sections: [
      {
        heading: "What is Python?",
        content: "Python is a high-level, interpreted, general-purpose programming language. Created by Guido van Rossum and first released in 1991, Python's design philosophy emphasizes code readability and simplicity. Its syntax allows programmers to express concepts in fewer lines of code than languages like C++ or Java.",
      },
      {
        heading: "Why Learn Python?",
        content: "Python is one of the most popular programming languages in the world. It is used in web development, data science, artificial intelligence, machine learning, automation, scientific computing, and more. Its beginner-friendly syntax makes it the top choice for first-time programmers while remaining powerful enough for professional use.",
      },
      {
        heading: "Setting Up Python",
        content: "To get started with Python, download the latest version from python.org. During installation on Windows, make sure to check 'Add Python to PATH'. You can verify your installation by opening a terminal and running: python --version. For writing code, you can use any text editor or an IDE like VS Code or PyCharm.",
      },
      {
        heading: "Your First Python Program",
        content: "The traditional first program in any language prints 'Hello, World!' to the screen. In Python this is just one line: print('Hello, World!'). This simplicity is what makes Python special — what takes multiple lines in other languages often takes just one in Python.",
      },
    ],
  },
  102: {
    title: "Variables & Data Types",
    icon: "🐍",
    trailTitle: "Python Fundamentals",
    sections: [
      {
        heading: "What are Variables?",
        content: "A variable is a named container that stores a value in memory. In Python, you create a variable simply by assigning a value to a name using the = operator. Python is dynamically typed, meaning you do not need to declare the type of a variable before using it.",
      },
      {
        heading: "Core Data Types",
        content: "Python has several built-in data types. Integers (int) represent whole numbers like 5 or -10. Floats represent decimal numbers like 3.14. Strings (str) represent text enclosed in quotes. Booleans (bool) represent True or False values. Each type has its own set of operations and methods.",
      },
      {
        heading: "Type Conversion",
        content: "Sometimes you need to convert a value from one type to another. Python provides built-in functions for this: int() converts to integer, float() converts to float, str() converts to string, and bool() converts to boolean. For example, int('42') returns the integer 42.",
      },
    ],
  },
  201: {
    title: "Arrays & Strings",
    icon: "🧩",
    trailTitle: "Data Structures & Algorithms",
    sections: [
      {
        heading: "What are Arrays?",
        content: "An array is a collection of elements stored at contiguous memory locations. Arrays allow you to store multiple values of the same type under a single variable name. In Python, lists serve as dynamic arrays and can hold elements of different types.",
      },
      {
        heading: "String Basics",
        content: "A string is a sequence of characters. In Python, strings are immutable, meaning once created they cannot be changed. You can access individual characters using indexing (starting at 0) and extract substrings using slicing with the [start:end] syntax.",
      },
      {
        heading: "Common Operations",
        content: "Both arrays and strings support a range of common operations. For lists: append() adds an element, remove() deletes one, len() returns the length. For strings: upper() converts to uppercase, split() divides into a list, and the in operator checks if a substring exists.",
      },
    ],
  },
};

function Notes() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const notes = mockNotes[moduleId];

  if (!notes) {
    return (
      <PageLayout>
        <div>Notes not found.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back to Module
          </button>
          <p className={styles.trailTitle}>{notes.trailTitle}</p>
        </div>

        {/* Title */}
        <div className={styles.titleRow}>
          <span className={styles.icon}>{notes.icon}</span>
          <div>
            <h2 className={styles.title}>{notes.title}</h2>
            <p className={styles.subtitle}>Full Notes</p>
          </div>
        </div>

        {/* Sections */}
        <div className={styles.sections}>
          {notes.sections.map((section, index) => (
            <div key={index} className={styles.section}>
              <h3 className={styles.sectionHeading}>
                <span className={styles.sectionNumber}>{index + 1}</span>
                {section.heading}
              </h3>
              <p className={styles.sectionContent}>{section.content}</p>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className={styles.actions}>
          <button
            className={styles.quizBtn}
            onClick={() => navigate(`/module/${moduleId}`)}
          >
            🧠 Ready to take the Quiz?
          </button>
        </div>

      </div>
    </PageLayout>
  );
}

export default Notes;