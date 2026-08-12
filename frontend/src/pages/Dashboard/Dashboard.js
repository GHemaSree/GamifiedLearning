import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { getMyTrails } from "../../api/trailApi";
import { getTopics } from "../../api/topicsApi";
import { getUsers } from "../../api/authApi";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Learner states
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin stats states
  const [topicsCount, setTopicsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [adminLoading, setAdminLoading] = useState(false);

  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    if (!user) return;

    if (isAdmin) {
      const fetchAdminStats = async () => {
        setAdminLoading(true);
        try {
          const [topicsData, usersData] = await Promise.all([
            getTopics(),
            getUsers(),
          ]);
          setTopicsCount(topicsData ? topicsData.length : 0);
          setUsersCount(usersData ? usersData.length : 0);
        } catch (err) {
          console.error("Failed to load admin dashboard stats:", err);
        } finally {
          setAdminLoading(false);
        }
      };
      fetchAdminStats();
    } else {
      const fetchTrails = async () => {
        try {
          setLoading(true);
          const data = await getMyTrails();
          setTrails(data || []);
        } catch (err) {
          setError("Failed to load your trails.");
        } finally {
          setLoading(false);
        }
      };
      fetchTrails();
    }
  }, [user, isAdmin]);

  if (!isAdmin && loading) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <p>Loading dashboard...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin && error) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <p>{error}</p>
        </div>
      </PageLayout>
    );
  }

  const getRankTitle = (lvl) => {
    if (lvl >= 10) return "Grandmaster 🏆";
    if (lvl >= 5) return "Code Knight ⚔️";
    return "Apprentice Squire 🛡️";
  };

  const userName = user?.name || "Learner";
  const userLevel = user?.level || 1;
  const rank = getRankTitle(userLevel);
  const totalTrails = trails.length;
  const totalModulesCompleted = trails.reduce((acc, t) => acc + (t.modulesCompleted || 0), 0);

  // RENDER ADMIN DASHBOARD
  if (isAdmin) {
    return (
      <PageLayout>
        <div className={styles.page}>
          {/* Admin Header Banner */}
          <div className={styles.banner} style={{ borderBottomColor: "var(--color-primary-light)" }}>
            <div className={styles.playerInfo}>
              <div className={styles.avatarGlow} style={{ boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)" }}>
                <span className={styles.avatarLetter}>A</span>
              </div>
              <div>
                <p className={styles.bannerGreeting}>{userName}</p>
                <p className={styles.rankTitle} style={{ color: "var(--color-primary-light)" }}>
                  Academy Administrator 🛡️
                </p>
                <p className={styles.bannerSub}>
                  Review system learning paths and track student active completion rates.
                </p>
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>📦 {adminLoading ? "..." : topicsCount}</span>
                <span className={styles.statLabel}>Active Topics</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statValue}>👥 {adminLoading ? "..." : usersCount}</span>
                <span className={styles.statLabel}>Academy Students</span>
              </div>
            </div>
          </div>

          {/* Admin Workspace / Dashboard Boards */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Instructor Hub</h3>
            </div>

            <div className={styles.achievementRow}>
              <div
                className={styles.achievementCard}
                onClick={() => navigate("/admin/forge")}
                style={{ cursor: "pointer", flex: 1, minWidth: "220px" }}
              >
                <span className={styles.achievementIcon}>🛠️</span>
                <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: "4px" }}>
                  Forge Portal
                </strong>
                <span className={styles.achievementLabel} style={{ fontSize: "12px" }}>
                  Create, edit, and delete campaign learning paths and modules.
                </span>
              </div>

              <div
                className={styles.achievementCard}
                onClick={() => navigate("/admin/roster")}
                style={{ cursor: "pointer", flex: 1, minWidth: "220px" }}
              >
                <span className={styles.achievementIcon}>👥</span>
                <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: "4px" }}>
                  Learner Roster
                </strong>
                <span className={styles.achievementLabel} style={{ fontSize: "12px" }}>
                  Monitor student level rankings, XP progress, and active login streaks.
                </span>
              </div>

              <div
                className={styles.achievementCard}
                onClick={() => navigate("/topics")}
                style={{ cursor: "pointer", flex: 1, minWidth: "220px" }}
              >
                <span className={styles.achievementIcon}>🗺️</span>
                <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: "4px" }}>
                  World Map Preview
                </strong>
                <span className={styles.achievementLabel} style={{ fontSize: "12px" }}>
                  Preview topics as they appear to active learners on the world roadmap.
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // RENDER LEARNER DASHBOARD
  return (
    <PageLayout>
      <div className={styles.page}>
        {/* Player Profile Lobby Banner */}
        <div className={styles.banner}>
          <div className={styles.playerInfo}>
            <div className={styles.avatarGlow}>
              <span className={styles.avatarLetter}>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className={styles.bannerGreeting}>{userName}</p>
              <p className={styles.rankTitle}>{rank}</p>
              <p className={styles.bannerSub}>
                {totalTrails > 0
                  ? `Active Quests: ${totalTrails} · Keep conquering! 🚀`
                  : "Start your adventure by choosing a topic! 🗺️"}
              </p>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>🔮 {totalModulesCompleted}</span>
              <span className={styles.statLabel}>Modules Conquered</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>🗺️ {totalTrails}</span>
              <span className={styles.statLabel}>Active Quests</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Active Quests</h3>
            <button className={styles.viewAll} onClick={() => navigate("/topics")}>
              + Launch Quest
            </button>
          </div>

          {trails.length > 0 ? (
            <div className={styles.trailList}>
              {trails.map((trail) => (
                <div
                  key={trail._id}
                  className={styles.trailCard}
                  onClick={() => navigate(`/trail/${trail._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.trailIcon}>{trail.topic?.icon || "📘"}</div>
                  <div className={styles.trailInfo}>
                    <p className={styles.trailTitle}>{trail.title}</p>
                    <p className={styles.trailCategory}>
                      {trail.modulesCompleted} / {trail.modulesTotal} nodes cleared
                    </p>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${trail.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <span className={styles.trailPercent}>{trail.progressPercent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No quests started yet.</p>
              <button className={styles.startBtn} onClick={() => navigate("/topics")}>
                🗺️ Explore World Map
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Adventure Board</h3>
          </div>
          <div className={styles.achievementRow}>
            <div
              className={styles.achievementCard}
              onClick={() => navigate("/topics")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.achievementIcon}>🗺️</span>
              <span className={styles.achievementLabel}>World Map</span>
            </div>
            <div
              className={styles.achievementCard}
              onClick={() => navigate("/progress")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.achievementIcon}>🏆</span>
              <span className={styles.achievementLabel}>Achievements</span>
            </div>
            <div
              className={styles.achievementCard}
              onClick={() => navigate("/recommendations")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.achievementIcon}>✨</span>
              <span className={styles.achievementLabel}>Side Quests</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Dashboard;