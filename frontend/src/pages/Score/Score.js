import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUser } from "../../api/authApi";
import { getModuleById, clearModuleContentCache, clearModuleQuizCache } from "../../api/moduleApi";
import styles from "./Score.module.css";

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [trailId, setTrailId] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [revising, setRevising] = useState(false);

  const {
    score,
    total,
    scorePercent,
    passed,
    xpEarned,
    readyToAdvance,
    mastery,
    moduleId,
    questionBreakdown = [],
  } = location.state || {};

  useEffect(() => {
    const syncUser = async () => {
      try {
        const freshUser = await getCurrentUser();
        refreshUser(freshUser.user || freshUser);
      } catch (err) {
        // fail silently — not critical to the page working
      }
    };
    const fetchTrail = async () => {
      if (!moduleId) return;
      try {
        const mod = await getModuleById(moduleId);
        if (mod?.trail) setTrailId(mod.trail);
      } catch (err) {
        // fail silently
      }
    };
    syncUser();
    fetchTrail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (score === undefined || score === null) {
    return (
      <div className={styles.errorPage}>
        <p>No score data found.</p>
        <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
      </div>
    );
  }

  const percentage = scorePercent ?? Math.round((score / total) * 100);

  const getResult = () => {
    if (percentage >= 80) return { emoji: "🏆", label: "Excellent!", color: "#16a34a" };
    if (percentage >= 60) return { emoji: "👍", label: "Good Job!", color: "#d97706" };
    return { emoji: "💪", label: "Keep Practicing!", color: "#dc2626" };
  };

  const result = getResult();
  const confettiArray = Array.from({ length: 45 });
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Floating Confetti Layer for Victors */}
        {passed && (
          <div className={styles.confettiContainer}>
            {confettiArray.map((_, i) => {
              const delay = (Math.random() * 5).toFixed(2);
              const left = (Math.random() * 100).toFixed(2);
              const scale = (Math.random() * 0.6 + 0.4).toFixed(2);
              const colors = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#f472b6"];
              const color = colors[Math.floor(Math.random() * colors.length)];
              return (
                <div
                  key={i}
                  className={styles.confetti}
                  style={{
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    transform: `scale(${scale})`,
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Victory/Defeat Banner */}
        <div className={passed ? styles.victoryBanner : styles.defeatBanner}>
          {passed ? "⚡ VICTORY: BOSS DEFEATED! ⚡" : "💀 DEFEAT: BOSS OUTLASTED YOU! 💀"}
        </div>

        {/* Result Emoji */}
        <div className={styles.resultEmoji}>{result.emoji}</div>
        <h2 className={styles.resultLabel} style={{ color: result.color }}>
          {result.label}
        </h2>

        {/* Score Circle */}
        <div className={styles.scoreCircle}>
          <span className={styles.scoreNumber}>{score}</span>
          <span className={styles.scoreTotal}>/ {total}</span>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>🪙 {xpEarned}</span>
            <span className={styles.statLabel}>XP Earned</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>📊 {percentage}%</span>
            <span className={styles.statLabel}>Score</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>✅ {score}</span>
            <span className={styles.statLabel}>Correct</span>
          </div>
        </div>

        {passed && (
          <p className={styles.moduleTitle}>
            {readyToAdvance
              ? "🎉 You're ready to move on to the next concept!"
              : "Module completed — keep going!"}
          </p>
        )}

        {/* DKT Mastery Panel */}
        {mastery && (
          <div className={styles.masteryPanel}>
            <p className={styles.masteryTitle}>🧠 DKT Mastery Update</p>
            {[
              { label: "Beginner",     value: mastery.beginner },
              { label: "Intermediate", value: mastery.intermediate },
              { label: "Advanced",     value: mastery.advanced },
            ].map(({ label, value }) => (
              <div key={label} className={styles.masteryRow}>
                <span className={styles.masteryLabel}>{label}</span>
                <div className={styles.masteryBarBg}>
                  <div
                    className={styles.masteryBarFill}
                    style={{ width: `${Math.round((value ?? 0) * 100)}%` }}
                  />
                </div>
                <span className={styles.masteryPct}>
                  {Math.round((value ?? 0) * 100)}%
                </span>
              </div>
            ))}
            <p className={styles.masteryHint}>
              {readyToAdvance
                ? "✅ DKT says you've mastered this concept — ready to advance!"
                : "⚠️ DKT recommends more practice before moving on."}
            </p>
          </div>
        )}

        {/* DKT-driven primary action */}
        <div className={styles.dktAction}>
          {readyToAdvance ? (
            <button
              className={styles.nextConceptBtn}
              onClick={() => trailId && navigate(`/trail/${trailId}`)}
              disabled={!trailId}
            >
              ⚔️ Next Concept
            </button>
          ) : (
            <button
              className={styles.reviseBtn}
              disabled={revising}
              onClick={async () => {
                setRevising(true);
                try {
                  await Promise.all([
                    clearModuleContentCache(moduleId),
                    clearModuleQuizCache(moduleId),
                  ]);
                } catch (_) {
                  // fail silently — caches may already be empty
                }
                navigate(`/module/${moduleId}`);
              }}
            >
              {revising ? "Preparing revision..." : "🧠 AI Revision Mode"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {passed && trailId && (
            <button
              className={styles.dashboardBtn}
              onClick={() => navigate(`/trail/${trailId}`)}
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              ⚔️ Next Module
            </button>
          )}
          <button
            className={styles.retryBtn}
            onClick={() => navigate(`/quiz/${moduleId}`)}
          >
            🔄 Retry Quiz
          </button>
          <button
            className={styles.dashboardBtn}
            onClick={() => navigate("/dashboard")}
          >
            🏠 Dashboard
          </button>
        </div>

        <button
          className={styles.trailBtn}
          onClick={() => {
            if (trailId) {
              navigate(`/trail/${trailId}`);
            } else {
              navigate(-2);
            }
          }}
        >
          ← Back to Trail
        </button>

        {/* Answer Key Toggle */}
        {questionBreakdown.length > 0 && (
          <div className={styles.answerKeySection}>
            <button
              className={styles.answerKeyToggle}
              onClick={() => setShowKey((prev) => !prev)}
            >
              {showKey ? "🔼 Hide Answer Key" : "🔑 View Answer Key"}
            </button>

            {showKey && (
              <div className={styles.answerKeyList}>
                {questionBreakdown.map((q, idx) => (
                  <div
                    key={idx}
                    className={`${styles.questionReview} ${
                      q.isCorrect ? styles.questionCorrect : styles.questionWrong
                    }`}
                  >
                    <p className={styles.questionReviewNum}>
                      {q.isCorrect ? "✅" : "❌"} Q{idx + 1}
                    </p>
                    <p className={styles.questionReviewText}>{q.question}</p>

                    <div className={styles.optionsReview}>
                      {q.options.map((opt, i) => {
                        const isCorrect = i === q.correctAnswer;
                        const isUserPick = i === q.userAnswer;
                        let optClass = styles.optReview;
                        if (isCorrect) optClass += ` ${styles.optCorrect}`;
                        else if (isUserPick && !isCorrect) optClass += ` ${styles.optWrong}`;
                        return (
                          <div key={i} className={optClass}>
                            <span className={styles.optLetter}>{optionLetters[i]}</span>
                            <span>{opt}</span>
                            {isCorrect && <span className={styles.optTag}>✓ Correct</span>}
                            {isUserPick && !isCorrect && <span className={styles.optTag}>✗ Your answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className={styles.explanation}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Score;