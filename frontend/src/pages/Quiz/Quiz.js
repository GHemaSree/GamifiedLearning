import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { getModuleQuiz, getModuleById } from "../../api/moduleApi";
import { submitQuiz } from "../../api/quizApi";
import styles from "./Quiz.module.css";

function Quiz() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Need to import useAuth or wait, is useAuth imported? Let's check imports!

  const [quiz, setQuiz] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchQuizAndModule = async () => {
      try {
        setLoading(true);
        // Load the critical quiz data first
        const quizRes = await getModuleQuiz(moduleId);
        setQuiz(quizRes);

        // Load non-critical module meta details separately (fail silently if error)
        try {
          const moduleRes = await getModuleById(moduleId);
          setModuleData(moduleRes);
        } catch (moduleErr) {
          console.error("Failed to load module details:", moduleErr);
        }
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setError("Quiz not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndModule();
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

  const getBossName = () => {
    return moduleData?.title ? `${moduleData.title} Guardian 👾` : "Syntax Overlord 👾";
  };

  const getPlayerName = () => {
    return user?.name ? `${user.name.toUpperCase()} SHIELD` : "PLAYER SHIELD";
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

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

        {/* Boss Battle Arena Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.bossBadge}>⚡ BOSS BATTLE</span>
            <h2 className={styles.title}>{getBossName()}</h2>
          </div>
          <span className={styles.questionCount}>
            Turn {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Boss Arena HUD (HP bars) */}
        <div className={styles.bossArena}>
          <div className={styles.bossSection}>
            <div className={styles.bossHeader}>
              <span className={styles.bossLabel}>BOSS HP</span>
              <span className={styles.bossHpText}>{Math.round(100 - progress)}%</span>
            </div>
            <div className={styles.bossHpBar}>
              <div className={styles.bossHpFill} style={{ width: `${100 - progress}%` }} />
            </div>
          </div>

          <div className={styles.versusDivider}>VS</div>

          <div className={styles.playerSection}>
            <div className={styles.playerHeader}>
              <span className={styles.playerLabel}>{getPlayerName()}</span>
              <span className={styles.playerHpText}>{Math.round(progress)}%</span>
            </div>
            <div className={styles.playerHpBar}>
              <div className={styles.playerHpFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Battle Log Dialog */}
        <div className={styles.battleDialogue}>
          {selectedAnswers[currentIndex] !== undefined ? (
            <p className={styles.dialogueText}>⚔️ Striking with Choice {String.fromCharCode(65 + selectedAnswers[currentIndex])}! Ready your command...</p>
          ) : (
            <p className={styles.dialogueText}>💬 {getBossName().replace(" 👾", "")} challenges: "Answer this query or face runtime execution!"</p>
          )}
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
            ← Retreat
          </button>

          {isLast ? (
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? "Submitting..." : "Submit Strike ⚔️"}
            </button>
          ) : (
            <button
              className={styles.navBtn}
              onClick={handleNext}
              disabled={!isAnswered}
            >
              Strike & Advance →
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