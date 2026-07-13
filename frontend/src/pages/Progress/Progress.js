import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { getMyTrails } from "../../api/trailApi";
import styles from "./Progress.module.css";

const levelThresholds = [0, 500, 1000, 2000, 3500, 5000];

const formatTimeAgo = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
};

function Progress() {
  const { user } = useAuth();
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        const data = await getMyTrails();
        setTrails(data);
      } catch (err) {
        setError("Failed to load progress.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrails();
  }, []);

  if (loading) return <PageLayout><div>Loading progress...</div></PageLayout>;
  if (error) return <PageLayout><div>{error}</div></PageLayout>;

  const totalXp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;

  const currentLevelXp = levelThresholds[level - 1] ?? 0;
  const nextLevelXp = levelThresholds[level] ?? currentLevelXp + 1000;
  const levelProgress = Math.round(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

  const totalModulesCompleted = trails.reduce((sum, t) => sum + t.modulesCompleted, 0);

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <h2 className={styles.bannerTitle}>My Progress</h2>
            <p className={styles.bannerSub}>Track your learning journey</p>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>🪙 {totalXp}</span>
              <span className={styles.statLabel}>Total XP</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>🔥 {streak}</span>
              <span className={styles.statLabel}>Day Streak</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>⭐ {level}</span>
              <span className={styles.statLabel}>Level</span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className={styles.levelCard}>
          <div className={styles.levelHeader}>
            <span className={styles.levelTitle}>Level {level}</span>
            <span className={styles.levelNext}>Next: Level {level + 1}</span>
          </div>
          <div className={styles.levelBar}>
            <div className={styles.levelFill} style={{ width: `${levelProgress}%` }} />
          </div>
          <p className={styles.levelSub}>
            {totalXp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP to next level
          </p>
        </div>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={styles.quickStatCard}>
            <span className={styles.quickStatIcon}>📚</span>
            <span className={styles.quickStatValue}>{totalModulesCompleted}</span>
            <span className={styles.quickStatLabel}>Modules Completed</span>
          </div>
          <div className={styles.quickStatCard}>
            <span className={styles.quickStatIcon}>🧠</span>
            <span className={styles.quickStatValue}>—</span>
            <span className={styles.quickStatLabel}>Quizzes Taken</span>
          </div>
          <div className={styles.quickStatCard}>
            <span className={styles.quickStatIcon}>📊</span>
            <span className={styles.quickStatValue}>—</span>
            <span className={styles.quickStatLabel}>Average Score</span>
          </div>
        </div>

        {/* Active Trails */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Active Trails</h3>
          <div className={styles.trailList}>
            {trails.length === 0 && <p>No trails yet.</p>}
            {trails.map((trail) => (
              <div key={trail._id} className={styles.trailCard}>
                <div className={styles.trailIcon}>{trail.topic?.icon}</div>
                <div className={styles.trailInfo}>
                  <div className={styles.trailHeader}>
                    <p className={styles.trailTitle}>{trail.title}</p>
                    <span className={styles.trailPercent}>{trail.progressPercent}%</span>
                  </div>
                  <p className={styles.trailCategory}>{trail.topic?.title}</p>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${trail.progressPercent}%` }} />
                  </div>
                  <div className={styles.trailMeta}>
                    <span>{trail.modulesCompleted}/{trail.modulesTotal} modules</span>
                    <span>Last studied: {formatTimeAgo(trail.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity — placeholder until Week 3 (needs QuizAttempt) */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <p>Activity tracking coming soon.</p>
        </div>

      </div>
    </PageLayout>
  );
}

export default Progress;