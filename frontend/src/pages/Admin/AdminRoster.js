import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { getUsers } from "../../api/authApi";
import styles from "./Admin.module.css";

function AdminRoster() {
  const { user } = useAuth();

  // List states
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Secure Role Gate
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getUsers();
      setUsersList(data || []);
    } catch (err) {
      console.error("Failed to load users list:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageLayout>
      <div className={styles.container}>
        {/* Learner Roster Card */}
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>👥 Learner Roster & Progress</h2>
            <p className={styles.subtitle}>Track active students, XP growth, and level rankings</p>
          </div>

          {usersLoading ? (
            <div className={styles.loader}>Querying users list...</div>
          ) : usersList.length === 0 ? (
            <div className={styles.emptyState}>No learners registered on this academy yet.</div>
          ) : (
            <div className={styles.rosterList}>
              {usersList.map((usr) => (
                <div key={usr._id} className={styles.rosterItem}>
                  <div className={styles.rosterAvatar}>
                    {usr.name ? usr.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className={styles.rosterInfo}>
                    <div className={styles.rosterTitleRow}>
                      <span className={styles.rosterName}>{usr.name}</span>
                      <span className={usr.role === "admin" ? styles.rosterAdminBadge : styles.rosterLearnerBadge}>
                        {usr.role}
                      </span>
                    </div>
                    <span className={styles.rosterEmail}>{usr.email}</span>
                  </div>
                  <div className={styles.rosterStats}>
                    <div className={styles.rosterStat} title="Level">
                      <span className={styles.rosterStatIcon}>⭐</span>
                      <span>Lvl {usr.level ?? 1}</span>
                    </div>
                    <div className={styles.rosterStat} title="XP Points">
                      <span className={styles.rosterStatIcon}>🪙</span>
                      <span>{usr.xp ?? 0} XP</span>
                    </div>
                    <div className={styles.rosterStat} title="Active Streak">
                      <span className={styles.rosterStatIcon}>🔥</span>
                      <span>{usr.streak ?? 0} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default AdminRoster;
