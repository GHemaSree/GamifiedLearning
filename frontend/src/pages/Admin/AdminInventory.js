import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { getTopics, deleteTopic } from "../../api/topicsApi";
import styles from "./Admin.module.css";

function AdminInventory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // List state
  const [topicsList, setTopicsList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Secure Role Gate
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTopics = async () => {
    setListLoading(true);
    try {
      const data = await getTopics();
      setTopicsList(data || []);
    } catch (err) {
      console.error("Failed to load topics list:", err);
    } finally {
      setListLoading(false);
    }
  };

  const handleEditClick = (topicId) => {
    navigate(`/admin/forge?edit=${topicId}`);
  };

  const handleDeleteClick = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic? All connected campaign configurations will lose reference.")) {
      return;
    }
    try {
      await deleteTopic(topicId);
      fetchTopics();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete topic.");
    }
  };

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageLayout>
      <div className={styles.container}>
        {/* Topics Inventory Card */}
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>📦 Topics Inventory</h2>
            <p className={styles.subtitle}>List of all forged active learning campaigns</p>
          </div>

          {listLoading ? (
            <div className={styles.loader}>Querying database...</div>
          ) : topicsList.length === 0 ? (
            <div className={styles.emptyState}>No topics have been forged yet. Use the Forge Portal to create one.</div>
          ) : (
            <div className={styles.inventoryList}>
              {topicsList.map((topic) => (
                <div key={topic._id} className={styles.inventoryItem}>
                  <div className={styles.inventoryIcon}>{topic.icon || "📘"}</div>
                  <div className={styles.inventoryInfo}>
                    <div className={styles.inventoryTitleRow}>
                      <span className={styles.inventoryName}>{topic.title}</span>
                      <span className={`${styles.badge} ${styles[topic.level.toLowerCase()]}`}>
                        {topic.level}
                      </span>
                      <span className={styles.orderLabel}>Order: {topic.order}</span>
                    </div>
                    {topic.description && (
                      <p className={styles.inventoryDesc}>{topic.description}</p>
                    )}
                    <div className={styles.inventoryConcepts}>
                      <strong>Concepts:</strong>{" "}
                      {topic.concepts && topic.concepts.length > 0
                        ? topic.concepts.map((c) => c.name).join(" • ")
                        : "None"}
                    </div>
                  </div>
                  <div className={styles.inventoryActions}>
                    <button
                      className={styles.actionEditBtn}
                      onClick={() => handleEditClick(topic._id)}
                      title="Edit Topic"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.actionDeleteBtn}
                      onClick={() => handleDeleteClick(topic._id)}
                      title="Delete Topic"
                    >
                      🗑️
                    </button>
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

export default AdminInventory;
