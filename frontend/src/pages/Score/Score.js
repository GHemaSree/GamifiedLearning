import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUser } from "../../api/authApi";
import styles from "./Score.module.css";

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const {
    score,
    total,
    scorePercent,
    passed,
    xpEarned,
    readyToAdvance,
    moduleId,
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
    syncUser();
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

        {/* Actions */}
        <div className={styles.actions}>
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
          onClick={() => navigate(-2)}
        >
          ← Back to Trail
        </button>

      </div>
    </div>
  );
}

export default Score;