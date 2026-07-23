import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getModuleById, getModuleContent } from "../../api/moduleApi";
import styles from "./Module.module.css";

function Module() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchedContentFor = useRef(null);


  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const data = await getModuleById(moduleId);
        setModule(data);
      } catch (err) {
  console.error("Failed to load module:", err);
  setError(
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Module not found."
  );
} finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [moduleId]);

  useEffect(() => {
    if (!module) return;
    if (fetchedContentFor.current === moduleId) return;
    fetchedContentFor.current = moduleId;

    const fetchContent = async () => {
      try {
        setContentLoading(true);
        const data = await getModuleContent(moduleId);
        setContent(data);
      } catch (err) {
        console.error("Failed to load content:", err);
        setContent(null);
      } finally {
        setContentLoading(false);
      }
    };
    fetchContent();
  }, [module, moduleId]);

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

        {contentLoading ? (
          <div className={styles.card}>
            <p className={styles.cardText} style={{ textAlign: "center" }}>
              Generating personalised content…
            </p>
          </div>
        ) : content ? (
          <>
            {content.introduction && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>📖 Introduction</h3>
                <p className={styles.cardText}>{content.introduction}</p>
              </div>
            )}

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>🎯 Learning Objective</h3>
              <p className={styles.cardText}>{content.objective}</p>
            </div>

            {content.content && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>📚 Content</h3>
                <div className={styles.cardText} style={{ whiteSpace: "pre-wrap" }}>
                  {content.content}
                </div>
              </div>
            )}

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>💡 Key Concepts</h3>
              <ul className={styles.keyPoints}>
                {(content.keyPoints || []).map((point, index) => (
                  <li key={index} className={styles.keyPoint}>
                    <span className={styles.bullet}>→</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {content.examples && content.examples.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>🧪 Examples</h3>
                <ul className={styles.keyPoints}>
                  {content.examples.map((example, index) => (
                    <li key={index} className={styles.keyPoint}>
                      <span className={styles.bullet}>•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>📝 Summary</h3>
              <p className={styles.cardText}>{content.summary}</p>
            </div>
          </>
        ) : (
          <div className={styles.card}>
            <p className={styles.cardText} style={{ textAlign: "center" }}>
              Content could not be generated. Please try again later.
            </p>
          </div>
        )}

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