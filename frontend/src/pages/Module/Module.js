import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import styles from "./Module.module.css";

const mockModules = {
  101: {
    title: "Introduction to Python",
    trailTitle: "Python Fundamentals",
    duration: "30 mins",
    icon: "🐍",
    objective: "Understand what Python is, why it is used, and how to set up your environment.",
    keyPoints: [
      "Python is a high-level, interpreted programming language",
      "It is widely used in web development, data science, AI and automation",
      "Python uses indentation to define code blocks",
      "Variables do not need explicit type declarations",
      "Python has a large standard library and active community",
    ],
    summary: "Python is one of the most beginner-friendly languages. Its clean syntax and readability make it an ideal first language. In this module you got an overview of Python's history, use cases, and basic environment setup.",
  },
  102: {
    title: "Variables & Data Types",
    trailTitle: "Python Fundamentals",
    duration: "45 mins",
    icon: "🐍",
    objective: "Learn how to declare variables and work with Python's core data types.",
    keyPoints: [
      "Python supports int, float, string, bool and complex types",
      "Variables are dynamically typed — no need to declare type",
      "Strings can be defined with single or double quotes",
      "Type conversion is done using int(), str(), float() functions",
      "The type() function returns the data type of a variable",
    ],
    summary: "Understanding data types is fundamental to programming. Python's dynamic typing makes it flexible but requires careful handling to avoid type errors in larger programs.",
  },
  201: {
    title: "Arrays & Strings",
    trailTitle: "Data Structures & Algorithms",
    duration: "45 mins",
    icon: "🧩",
    objective: "Understand array operations and string manipulation techniques.",
    keyPoints: [
      "Arrays store elements of the same type in contiguous memory",
      "Python lists act as dynamic arrays",
      "String indexing starts at 0",
      "Slicing allows extracting substrings using [start:end]",
      "Common operations: append, insert, delete, search",
    ],
    summary: "Arrays and strings are the most fundamental data structures. Mastering their operations is essential for solving most algorithmic problems efficiently.",
  },
};

function Module() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const module = mockModules[moduleId];

  if (!module) {
    return (
      <PageLayout>
        <div>Module not found.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <p className={styles.trailTitle}>{module.trailTitle}</p>
        </div>

        {/* Module Title */}
        <div className={styles.titleRow}>
          <span className={styles.icon}>{module.icon}</span>
          <div>
            <h2 className={styles.title}>{module.title}</h2>
            <p className={styles.duration}>⏱ {module.duration}</p>
          </div>
        </div>

        {/* Objective */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🎯 Learning Objective</h3>
          <p className={styles.cardText}>{module.objective}</p>
        </div>

        {/* Key Points */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>💡 Key Concepts</h3>
          <ul className={styles.keyPoints}>
            {module.keyPoints.map((point, index) => (
              <li key={index} className={styles.keyPoint}>
                <span className={styles.bullet}>→</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📝 Summary</h3>
          <p className={styles.cardText}>{module.summary}</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={styles.notesBtn}
            onClick={() => navigate(`/notes/${moduleId}`)}
          >
            📖 View Full Notes
          </button>
          <button
  className={styles.quizBtn}
  onClick={() => navigate(`/quiz/${moduleId}`)}
>
  🧠 Start Quiz
</button>
        </div>

      </div>
    </PageLayout>
  );
}

export default Module;