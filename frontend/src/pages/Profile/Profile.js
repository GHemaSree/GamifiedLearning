import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLayout from "../../components/layout/PageLayout";
import styles from "./Profile.module.css";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const mockStats = {
    xp: 1250,
    level: 3,
    streak: 7,
    badges: 5,
    trailsCompleted: 1,
    modulesCompleted: 8,
    quizzesTaken: 5,
    averageScore: 78,
  };

  const mockBadges = [
    { id: 1, icon: "⭐", label: "First Step", description: "Completed your first module", earned: true },
    { id: 2, icon: "🔥", label: "7 Day Streak", description: "Maintained a 7-day streak", earned: true },
    { id: 3, icon: "🎯", label: "Goal Crusher", description: "Scored 100% on a quiz", earned: true },
    { id: 4, icon: "🏆", label: "Trail Blazer", description: "Completed your first trail", earned: true },
    { id: 5, icon: "🧠", label: "Knowledge Seeker", description: "Took 5 quizzes", earned: true },
    { id: 6, icon: "🚀", label: "Speed Learner", description: "Complete 3 modules in one day", earned: false },
  ];

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Profile Header */}
        <div className={styles.profileCard}>
          <div className={styles.avatarCircle}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{user?.name || "Learner"}</h2>
            <p className={styles.profileEmail}>{user?.email || ""}</p>
            <div className={styles.levelBadge}>⭐ Level {mockStats.level} Learner</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🪙</span>
            <span className={styles.statValue}>{mockStats.xp}</span>
            <span className={styles.statLabel}>Total XP</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🔥</span>
            <span className={styles.statValue}>{mockStats.streak}</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statValue}>{mockStats.modulesCompleted}</span>
            <span className={styles.statLabel}>Modules Done</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🧠</span>
            <span className={styles.statValue}>{mockStats.quizzesTaken}</span>
            <span className={styles.statLabel}>Quizzes Taken</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📊</span>
            <span className={styles.statValue}>{mockStats.averageScore}%</span>
            <span className={styles.statLabel}>Avg Score</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🏁</span>
            <span className={styles.statValue}>{mockStats.trailsCompleted}</span>
            <span className={styles.statLabel}>Trails Done</span>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🏅 Badges</h3>
          <div className={styles.badgeGrid}>
            {mockBadges.map((badge) => (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${!badge.earned ? styles.badgeLocked : ""}`}
              >
                <span className={styles.badgeIcon}>{badge.icon}</span>
                <p className={styles.badgeLabel}>{badge.label}</p>
                <p className={styles.badgeDesc}>{badge.description}</p>
                {!badge.earned && (
                  <span className={styles.lockedTag}>🔒 Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Account Settings */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⚙️ Account</h3>
          <div className={styles.accountCard}>
            <div className={styles.accountItem}>
              <span className={styles.accountLabel}>Name</span>
              <span className={styles.accountValue}>{user?.name || "—"}</span>
            </div>
            <div className={styles.accountDivider} />
            <div className={styles.accountItem}>
              <span className={styles.accountLabel}>Email</span>
              <span className={styles.accountValue}>{user?.email || "—"}</span>
            </div>
            <div className={styles.accountDivider} />
            <div className={styles.accountItem}>
              <span className={styles.accountLabel}>Role</span>
              <span className={styles.accountValue}>{user?.role || "learner"}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>

      </div>
    </PageLayout>
  );
}

export default Profile;