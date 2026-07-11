import PageLayout from "../../components/layout/PageLayout";
import styles from "./Progress.module.css";

const mockProgress = {
  totalXp: 1250,
  level: 3,
  streak: 7,
  totalModulesCompleted: 8,
  totalQuizzesTaken: 5,
  averageScore: 78,
  trails: [
    {
      id: 1,
      title: "Python Fundamentals",
      icon: "🐍",
      category: "Programming",
      modulesCompleted: 3,
      totalModules: 4,
      progress: 75,
      lastStudied: "2 days ago",
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      icon: "🧩",
      category: "Computer Science",
      modulesCompleted: 2,
      totalModules: 4,
      progress: 50,
      lastStudied: "5 days ago",
    },
    {
      id: 3,
      title: "React Development",
      icon: "⚛️",
      category: "Web Development",
      modulesCompleted: 1,
      totalModules: 4,
      progress: 25,
      lastStudied: "1 week ago",
    },
  ],
  recentActivity: [
    { id: 1, action: "Completed quiz", topic: "Introduction to Python", xp: 40, time: "2 hours ago" },
    { id: 2, action: "Studied module", topic: "Variables & Data Types", xp: 20, time: "2 days ago" },
    { id: 3, action: "Completed quiz", topic: "Arrays & Strings", xp: 30, time: "5 days ago" },
    { id: 4, action: "Started trail", topic: "React Development", xp: 10, time: "1 week ago" },
  ],
};

const levelThresholds = [0, 500, 1000, 2000, 3500, 5000];

function Progress() {
  const { totalXp, level, streak, totalModulesCompleted, totalQuizzesTaken, averageScore, trails, recentActivity } = mockProgress;

  const currentLevelXp = levelThresholds[level - 1];
  const nextLevelXp = levelThresholds[level];
  const levelProgress = Math.round(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

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
            <div
              className={styles.levelFill}
              style={{ width: `${levelProgress}%` }}
            />
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
            <span className={styles.quickStatValue}>{totalQuizzesTaken}</span>
            <span className={styles.quickStatLabel}>Quizzes Taken</span>
          </div>
          <div className={styles.quickStatCard}>
            <span className={styles.quickStatIcon}>📊</span>
            <span className={styles.quickStatValue}>{averageScore}%</span>
            <span className={styles.quickStatLabel}>Average Score</span>
          </div>
        </div>

        {/* Active Trails */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Active Trails</h3>
          <div className={styles.trailList}>
            {trails.map((trail) => (
              <div key={trail.id} className={styles.trailCard}>
                <div className={styles.trailIcon}>{trail.icon}</div>
                <div className={styles.trailInfo}>
                  <div className={styles.trailHeader}>
                    <p className={styles.trailTitle}>{trail.title}</p>
                    <span className={styles.trailPercent}>{trail.progress}%</span>
                  </div>
                  <p className={styles.trailCategory}>{trail.category}</p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${trail.progress}%` }}
                    />
                  </div>
                  <div className={styles.trailMeta}>
                    <span>{trail.modulesCompleted}/{trail.totalModules} modules</span>
                    <span>Last studied: {trail.lastStudied}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityInfo}>
                  <p className={styles.activityAction}>
                    {activity.action} — <span>{activity.topic}</span>
                  </p>
                  <p className={styles.activityTime}>{activity.time}</p>
                </div>
                <span className={styles.activityXp}>+{activity.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

export default Progress;