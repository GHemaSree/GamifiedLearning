import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { createTopic, getTopics, updateTopic, deleteTopic } from "../../api/topicsApi";
import { getUsers } from "../../api/authApi";
import styles from "./Admin.module.css";

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // List states
  const [topicsList, setTopicsList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📘");
  const [level, setLevel] = useState("Beginner");
  const [order, setOrder] = useState(0);
  const [concepts, setConcepts] = useState([{ name: "", order: 1 }]);

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Secure Role Gate
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchTopics();
      fetchUsers();
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

  const handleAddConcept = () => {
    setConcepts((prev) => [...prev, { name: "", order: prev.length + 1 }]);
  };

  const handleConceptChange = (index, field, value) => {
    setConcepts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveConcept = (index) => {
    setConcepts((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((c, idx) => ({ ...c, order: idx + 1 }));
    });
  };

  const handleEditClick = (topic) => {
    setEditMode(true);
    setEditingId(topic._id);
    setTitle(topic.title);
    setDescription(topic.description || "");
    setIcon(topic.icon || "📘");
    setLevel(topic.level);
    setOrder(topic.order || 0);
    setConcepts(
      topic.concepts && topic.concepts.length > 0
        ? topic.concepts.map((c, idx) => ({ name: c.name, order: c.order ?? idx + 1 }))
        : [{ name: "", order: 1 }]
    );
    setError(null);
    setSuccess(false);
    
    // Scroll form into view smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setIcon("📘");
    setLevel("Beginner");
    setOrder(0);
    setConcepts([{ name: "", order: 1 }]);
    setError(null);
    setSuccess(false);
  };

  const handleDeleteClick = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic? All connected campaign configurations will lose reference.")) {
      return;
    }
    try {
      await deleteTopic(topicId);
      fetchTopics();
      if (editMode && editingId === topicId) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete topic.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (concepts.some((c) => !c.name.trim())) {
      setError("All concept rows must have a valid name.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      title,
      description,
      icon,
      level,
      order: Number(order),
      concepts: concepts.map((c) => ({
        name: c.name,
        order: Number(c.order),
      })),
    };

    try {
      if (editMode) {
        await updateTopic(editingId, payload);
        setSuccess(true);
        handleCancelEdit();
      } else {
        await createTopic(payload);
        setSuccess(true);
        setTitle("");
        setDescription("");
        setIcon("📘");
        setLevel("Beginner");
        setOrder(0);
        setConcepts([{ name: "", order: 1 }]);
      }
      fetchTopics();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to forge/update topic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className={styles.container}>
        {/* Form Card (Create / Edit) */}
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {editMode ? "⚙️ Modify Topic Forge" : "🛠️ Topic Forge Portal"}
            </h2>
            <p className={styles.subtitle}>
              {editMode ? "Modify parameters for an existing topic" : "Create new campaign modules & expand the learning roadmap"}
            </p>
          </div>

          {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
          {success && (
            <div className={styles.successBanner}>
              {editMode ? "✨ Topic updated successfully!" : "✨ New topic forged successfully!"}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Row 1: Title and Icon */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Topic Title</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Python File Operations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup} style={{ maxWidth: "120px" }}>
                <label className={styles.label}>Icon Emoji</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="📘"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 2: Description */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                placeholder="Briefly describe what this campaign is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Row 3: Level & Order */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Level Rank</label>
                <select
                  className={styles.select}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={loading}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Map Order Index</label>
                <input
                  type="number"
                  className={styles.input}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  disabled={loading}
                  min="0"
                />
              </div>
            </div>

            {/* Section: Concepts */}
            <div className={styles.conceptsSection}>
              <div className={styles.conceptsHeader}>
                <h3 className={styles.sectionTitle}>Campaign Concepts</h3>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={handleAddConcept}
                  disabled={loading}
                >
                  ➕ Add Concept
                </button>
              </div>

              <div className={styles.conceptsList}>
                {concepts.map((concept, idx) => (
                  <div key={idx} className={styles.conceptRow}>
                    <span className={styles.conceptNumber}>{idx + 1}</span>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Concept name (e.g. Reading Text Files)"
                      value={concept.name}
                      onChange={(e) => handleConceptChange(idx, "name", e.target.value)}
                      disabled={loading}
                    />
                    <input
                      type="number"
                      className={styles.input}
                      style={{ maxWidth: "80px" }}
                      placeholder="Order"
                      value={concept.order}
                      onChange={(e) => handleConceptChange(idx, "order", e.target.value)}
                      disabled={loading}
                      min="1"
                    />
                    {concepts.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemoveConcept(idx)}
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className={styles.actions}>
              {editMode ? (
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Forging..." : editMode ? "Update Topic ⚙️" : "Forge Topic ⚔️"}
              </button>
            </div>
          </form>
        </div>

        {/* Topics Inventory Card */}
        <div className={styles.card} style={{ marginTop: "var(--space-2xl)" }}>
          <div className={styles.header}>
            <h2 className={styles.title}>📦 Topics Inventory</h2>
            <p className={styles.subtitle}>List of all forged active learning campaigns</p>
          </div>

          {listLoading ? (
            <div className={styles.loader}>Querying database...</div>
          ) : topicsList.length === 0 ? (
            <div className={styles.emptyState}>No topics have been forged yet. Use the form above to expand.</div>
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
                      onClick={() => handleEditClick(topic)}
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

        {/* Learner Roster Card */}
        <div className={styles.card} style={{ marginTop: "var(--space-2xl)" }}>
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

export default Admin;
