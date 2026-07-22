import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getModuleQuiz } from "../../api/moduleApi";
import { submitQuiz } from "../../api/quizApi";
import styles from "./Quiz.module.css";

function Quiz() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await getModuleQuiz(moduleId);
        setQuiz(data);
      } catch (err) {
        setError("Quiz not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [moduleId]);

  if (loading) {
    return (
      <PageLayout>
        <div>Loading quiz...</div>
      </PageLayout>
    );
  }

  if (error || !quiz) {
    return (
      <PageLayout>
        <div>{error || "Quiz not found."}</div>
      </PageLayout>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // keyed by question INDEX, not an id string — matches the order the backend expects answers in
  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
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

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    // build an ordered array [answerForQ0, answerForQ1, ...] as the backend expects
    const answersArray = quiz.questions.map((_, i) => selectedAnswers[i]);

    try {
      const result = await submitQuiz(quiz.quizId, answersArray);
      navigate("/score", {
        state: {
          score: result.correctCount,
          total: result.totalQuestions,
          scorePercent: result.score,
          passed: result.passed,
          xpEarned: result.xpEarned,
          readyToAdvance: result.readyToAdvance,
          moduleId,
        },
      });
    } catch (err) {
      alert("Failed to submit quiz. Please try again.");
      setSubmitting(false);
    }
  };

  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const allAnswered = quiz.questions.every((_, i) => selectedAnswers[i] !== undefined);

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>🧠 Quiz</h2>
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
                  selectedAnswers[currentIndex] === index ? styles.selected : ""
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
              disabled={!allAnswered || submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz ✓"}
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
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${
                index === currentIndex ? styles.dotActive : ""
              } ${
                selectedAnswers[index] !== undefined ? styles.dotAnswered : ""
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