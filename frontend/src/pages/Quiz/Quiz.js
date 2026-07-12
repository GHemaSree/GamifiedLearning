import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import styles from "./Quiz.module.css";

const mockQuizzes = {
  101: {
    moduleTitle: "Introduction to Python",
    questions: [
      {
        id: "q1",
        question: "What type of language is Python?",
        options: [
          "Low-level compiled language",
          "High-level interpreted language",
          "Assembly language",
          "Machine language",
        ],
        correctAnswer: 1,
      },
      {
        id: "q2",
        question: "Who created Python?",
        options: [
          "James Gosling",
          "Bjarne Stroustrup",
          "Guido van Rossum",
          "Dennis Ritchie",
        ],
        correctAnswer: 2,
      },
      {
        id: "q3",
        question: "What does Python use to define code blocks?",
        options: [
          "Curly braces {}",
          "Square brackets []",
          "Indentation",
          "Parentheses ()",
        ],
        correctAnswer: 2,
      },
      {
        id: "q4",
        question: "Which of these is a valid Python file extension?",
        options: [".java", ".py", ".cpp", ".js"],
        correctAnswer: 1,
      },
      {
        id: "q5",
        question: "What function is used to print output in Python?",
        options: ["echo()", "console.log()", "printf()", "print()"],
        correctAnswer: 3,
      },
    ],
  },
  102: {
    moduleTitle: "Variables & Data Types",
    questions: [
      {
        id: "q1",
        question: "Which of these is NOT a Python data type?",
        options: ["int", "float", "char", "bool"],
        correctAnswer: 2,
      },
      {
        id: "q2",
        question: "What function returns the data type of a variable?",
        options: ["datatype()", "typeof()", "type()", "gettype()"],
        correctAnswer: 2,
      },
      {
        id: "q3",
        question: "How do you convert a string '42' to an integer in Python?",
        options: ["str(42)", "int('42')", "float('42')", "convert('42')"],
        correctAnswer: 1,
      },
    ],
  },
};

function Quiz() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const quiz = mockQuizzes[moduleId];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted] = useState(false);

  if (!quiz) {
    return (
      <PageLayout>
        <div>Quiz not found.</div>
      </PageLayout>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleOptionSelect = (optionIndex) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const xpEarned = correct * 10;
    navigate("/score", {
      state: {
        score: correct,
        total: totalQuestions,
        xpEarned,
        moduleTitle: quiz.moduleTitle,
        moduleId,
      },
    });
  };

  const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;
  const allAnswered = quiz.questions.every(
    (q) => selectedAnswers[q.id] !== undefined
  );

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>🧠 Quiz</h2>
            <p className={styles.moduleTitle}>{quiz.moduleTitle}</p>
          </div>
          <span className={styles.questionCount}>
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className={styles.questionCard}>
          <p className={styles.questionText}>{currentQuestion.question}</p>
          <div className={styles.options}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`${styles.option} ${
                  selectedAnswers[currentQuestion.id] === index
                    ? styles.selected
                    : ""
                }`}
                onClick={() => handleOptionSelect(index)}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            className={styles.navBtn}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          {isLast ? (
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!allAnswered}
            >
              Submit Quiz ✓
            </button>
          ) : (
            <button
              className={styles.navBtn}
              onClick={handleNext}
              disabled={!isAnswered}
            >
              Next →
            </button>
          )}
        </div>

        {/* Question Dots */}
        <div className={styles.dots}>
          {quiz.questions.map((q, index) => (
            <button
              key={index}
              className={`${styles.dot} ${
                index === currentIndex ? styles.dotActive : ""
              } ${
                selectedAnswers[q.id] !== undefined ? styles.dotAnswered : ""
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

      </div>
    </PageLayout>
  );
}

export default Quiz;