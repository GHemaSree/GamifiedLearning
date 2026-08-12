import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { createTopic, updateTopic, getTopicById } from "../../api/topicsApi";
import styles from "./Admin.module.css";

function AdminForge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📘");
  const [level, setLevel] = useState("Beginner");
  const [order, setOrder] = useState(0);
  const [concepts, setConcepts] = useState([{ name: "", order: 1 }]);

  // Status states
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Secure Role Gate
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    if (isAdmin && editId) {
      loadTopicDetails(editId);
    } else {
      handleResetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, editId]);

  const loadTopicDetails = async (id) => {
    setFetchLoading(true);
    setError(null);
    try {
      const topic = await getTopicById(id);
      if (topic) {
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
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load topic details for editing.");
    } finally {
      setFetchLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleResetForm = () => {
    setTitle("");
    setDescription("");
    setIcon("📘");
    setLevel("Beginner");
    setOrder(0);
    setConcepts([{ name: "", order: 1 }]);
    setError(null);
    setSuccess(false);
  };

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
      if (editId) {
        await updateTopic(editId, payload);
        setSuccess(true);
        setTimeout(() => navigate("/admin/inventory"), 1000);
      } else {
        await createTopic(payload);
        setSuccess(true);
        handleResetForm();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to forge topic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {editId ? "⚙️ Modify Topic Forge" : "🛠️ Topic Forge Portal"}
            </h2>
            <p className={styles.subtitle}>
              {editId ? "Modify parameters for an existing topic" : "Create new campaign modules & expand the learning roadmap"}
            </p>
          </div>

          {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
          {success && (
            <div className={styles.successBanner}>
              {editId ? "✨ Topic updated successfully! Redirecting..." : "✨ New topic forged successfully!"}
            </div>
          )}

          {fetchLoading ? (
            <div className={styles.loader}>Fetching details...</div>
          ) : (
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
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Forging..." : editId ? "Update Topic ⚙️" : "Forge Topic ⚔️"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default AdminForge;
