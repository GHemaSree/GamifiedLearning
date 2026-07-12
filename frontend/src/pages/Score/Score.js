import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Score.module.css";

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, xpEarned, moduleTitle, moduleId } = location.state || {};

  if (!score && score !== 0) {
    return (
      <div className={styles.errorPage}>
        <p>No score data found.</p>
        <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
      </div>
    );
  }

  const percentage = Math.round((score / total) * 100);

  const getResult = () => {
    if (percentage >= 80) return { emoji: "🏆", label: "Excellent!", color: "#16a34a" };
    if (percentage >= 60) return { emoji: "👍", label: "Good Job!", color: "#d97706" };
    return { emoji: "💪", label: "Keep Practicing!", color: "#dc2626" };
  };

  const result = getResult();

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Result Emoji */}
        <div className={styles.resultEmoji}>{result.emoji}</div>
        <h2 className={styles.resultLabel} style={{ color: result.color }}>
          {result.label}
        </h2>
        <p className={styles.moduleTitle}>{moduleTitle}</p>

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