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

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.banner}>
          <div>
            <div className={styles.bannerGreeting}>Welcome back, {user?.name} 👋</div>
            <div className={styles.bannerSub}>Keep it up! You're on a roll 🔥</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>🪙 {user?.xp ?? 0}</span>
              <span className={styles.statLabel}>Total XP</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>🔥 {user?.streak ?? 0}</span>
              <span className={styles.statLabel}>Day Streak</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Active Trails</h3>
          </div>

          <div className={styles.trailList}>
            {trails.length === 0 && <p>No trails yet — pick a topic to get started!</p>}
            {trails.map((trail) => (
              <div
                key={trail._id}
                className={styles.trailCard}
                onClick={() => navigate(`/trail/${trail._id}`)}
              >
                <div className={styles.trailIcon}>{trail.topic?.icon}</div>
                <div className={styles.trailInfo}>
                  <div className={styles.trailTitle}>{trail.title}</div>
                  <div className={styles.trailCategory}>{trail.topic?.title}</div>
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
        </div>

        {/* Achievements section intentionally omitted for now —
            Badge model doesn't exist in the backend yet (Week 3).
            Re-add this section once GET /achievements is real. */}
      </div>
    </PageLayout>
  );
}

export default Dashboard;