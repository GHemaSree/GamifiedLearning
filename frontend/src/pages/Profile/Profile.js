import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUser } from "../../api/authApi";
import PageLayout from "../../components/layout/PageLayout";
import { getMyTrails } from "../../api/trailApi";
import { getMyProgress } from "../../api/progressApi";
import { getMyBadges } from "../../api/achievementsApi";
import styles from "./Profile.module.css";

function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [trails, setTrails] = useState([]);
  const [quizStats, setQuizStats] = useState({ totalQuizzesTaken: 0, averageScore: 0 });
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trailsData, progressData, badgesData] = await Promise.all([
          getMyTrails(),
          getMyProgress(),
          getMyBadges(),
        ]);
        setTrails(trailsData);
        setQuizStats({
          totalQuizzesTaken: progressData.totalQuizzesTaken,
          averageScore: progressData.averageScore,
        });
        setBadges(badgesData);
      } catch (err) {
        // fail quietly
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      try {
        const freshUser = await getCurrentUser();
        refreshUser(freshUser.user || freshUser);
      } catch (err) {
        // fail silently
      }
    };
    syncUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const modulesCompleted = trails.reduce((sum, t) => sum + t.modulesCompleted, 0);
  const trailsCompleted = trails.filter((t) => t.status === "completed").length;

  const stats = {
    xp: user?.xp ?? 0,
    level: user?.level ?? 1,
    streak: user?.streak ?? 0,
    modulesCompleted,
    trailsCompleted,
  };

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
            <div className={styles.levelBadge}>⭐ Level {stats.level} Learner</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🪙</span>
            <span className={styles.statValue}>{stats.xp}</span>
            <span className={styles.statLabel}>Total XP</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🔥</span>
            <span className={styles.statValue}>{stats.streak}</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statValue}>{loading ? "—" : stats.modulesCompleted}</span>
            <span className={styles.statLabel}>Modules Done</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🧠</span>
            <span className={styles.statValue}>{loading ? "—" : quizStats.totalQuizzesTaken}</span>
            <span className={styles.statLabel}>Quizzes Taken</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📊</span>
            <span className={styles.statValue}>{loading ? "—" : `${quizStats.averageScore}%`}</span>
            <span className={styles.statLabel}>Avg Score</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🏁</span>
            <span className={styles.statValue}>{loading ? "—" : stats.trailsCompleted}</span>
            <span className={styles.statLabel}>Trails Done</span>
          </div>
        </div>

        {/* Badges — real data */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🏅 Badges</h3>
          <div className={styles.badgeGrid}>
            {badges.map((badge) => (
              <div
                key={badge.key}
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
