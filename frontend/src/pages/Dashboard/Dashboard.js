import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { getMyTrails } from "../../api/trailApi";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const { user } = useAuth();
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        const data = await getMyTrails();
        setTrails(data);
      } catch (err) {
        setError("Failed to load your trails.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrails();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <p>Loading dashboard...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
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
              <p className={styles.bannerGreeting}>
                {userName}
              </p>
              <p className={styles.rankTitle}>
                {rank}
              </p>
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
            <button
              className={styles.viewAll}
              onClick={() => navigate("/topics")}
            >
              + Launch Quest
            </button>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
            </div>
          ) : trails.length > 0 ? (
            <div className={styles.trailList}>
              {trails.map((trail) => (
                <div
                  key={trail._id}
                  className={styles.trailCard}
                  onClick={() => navigate(`/trail/${trail._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.trailIcon}>
                    {trail.topic?.icon || "📘"}
                  </div>
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
                  <span className={styles.trailPercent}>
                    {trail.progressPercent}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No quests started yet.</p>
              <button
                className={styles.startBtn}
                onClick={() => navigate("/topics")}
              >
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