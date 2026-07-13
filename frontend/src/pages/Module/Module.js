import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getModuleById } from "../../api/moduleApi";
import styles from "./Module.module.css";

function Module() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const data = await getModuleById(moduleId);
        setModule(data);
      } catch (err) {
        setError("Module not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [moduleId]);

  if (loading) {
    return (
      <PageLayout>
        <div>Loading module...</div>
      </PageLayout>
    );
  }

  if (error || !module) {
    return (
      <PageLayout>
        <div>{error || "Module not found."}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <p className={styles.trailTitle}>{module.trailTitle}</p>
        </div>

        {/* Module Title */}
        <div className={styles.titleRow}>
          <span className={styles.icon}>{module.icon || "📘"}</span>
          <div>
            <h2 className={styles.title}>{module.title}</h2>
            <p className={styles.duration}>⏱ {module.duration} mins</p>
          </div>
        </div>

        {/* Objective */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🎯 Learning Objective</h3>
          <p className={styles.cardText}>{module.objective}</p>
        </div>

        {/* Key Points */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>💡 Key Concepts</h3>
          <ul className={styles.keyPoints}>
            {module.keyPoints.map((point, index) => (
              <li key={index} className={styles.keyPoint}>
                <span className={styles.bullet}>→</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📝 Summary</h3>
          <p className={styles.cardText}>{module.summary}</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={styles.notesBtn}
            onClick={() => navigate(`/notes/${moduleId}`)}
          >
            📖 View Full Notes
          </button>
          <button
            className={styles.quizBtn}
            onClick={() => navigate(`/quiz/${moduleId}`)}
          >
            🧠 Start Quiz
          </button>
        </div>

      </div>
    </PageLayout>
  );
}

export default Module;