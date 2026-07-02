import PageLayout from "../../components/layout/PageLayout";
import styles from "./Dashboard.module.css";

const mockStats = {
  xp: 1250,
  streak: 7,
  name: "Hema",
};

const mockTrails = [
  { id: 1, title: "Python Fundamentals", category: "Programming", progress: 75, icon: "🐍" },
  { id: 2, title: "Data Structures & Algorithms", category: "Computer Science", progress: 40, icon: "🧩" },
  { id: 3, title: "React for Beginners", category: "Web Development", progress: 20, icon: "⚛️" },
];

const mockAchievements = [
  { id: 1, icon: "⭐", label: "First Step" },
  { id: 2, icon: "🔥", label: "7 Day Streak" },
  { id: 3, icon: "🎯", label: "Goal Crusher" },
];

function Dashboard() {
  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Welcome + Stats Banner */}
        <div className={styles.banner}>
          <div>
            <p className={styles.bannerGreeting}>Welcome back, {mockStats.name} 👋</p>
            <p className={styles.bannerSub}>Keep it up! You're on a roll 🔥</p>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>🪙 {mockStats.xp}</span>
              <span className={styles.statLabel}>Total XP</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>🔥 {mockStats.streak}</span>
              <span className={styles.statLabel}>Day Streak</span>
            </div>
          </div>
        </div>

        {/* Active Trails */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Active Trails</h3>
            <button className={styles.viewAll}>View All</button>
          </div>
          <div className={styles.trailList}>
            {mockTrails.map((trail) => (
              <div key={trail.id} className={styles.trailCard}>
                <div className={styles.trailIcon}>{trail.icon}</div>
                <div className={styles.trailInfo}>
                  <p className={styles.trailTitle}>{trail.title}</p>
                  <p className={styles.trailCategory}>{trail.category}</p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${trail.progress}%` }}
                    />
                  </div>
                </div>
                <span className={styles.trailPercent}>{trail.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Achievements</h3>
            <button className={styles.viewAll}>View All</button>
          </div>
          <div className={styles.achievementRow}>
            {mockAchievements.map((a) => (
              <div key={a.id} className={styles.achievementCard}>
                <span className={styles.achievementIcon}>{a.icon}</span>
                <span className={styles.achievementLabel}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

export default Dashboard;