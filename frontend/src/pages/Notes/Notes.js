import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getModuleById } from "../../api/moduleApi";
import styles from "./Notes.module.css";

function Notes() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const data = await getModuleById(moduleId);
        setNotes(data);
      } catch (err) {
        setError("Notes not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [moduleId]);

  if (loading) {
    return (
      <PageLayout>
        <div>Loading notes...</div>
      </PageLayout>
    );
  }

  if (error || !notes) {
    return (
      <PageLayout>
        <div>{error || "Notes not found."}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back to Module
          </button>
          <p className={styles.trailTitle}>{notes.trailTitle}</p>
        </div>

        {/* Title */}
        <div className={styles.titleRow}>
          <span className={styles.icon}>{notes.icon || "📘"}</span>
          <div>
            <h2 className={styles.title}>{notes.title}</h2>
            <p className={styles.subtitle}>Full Notes</p>
          </div>
        </div>

        {/* Sections */}
        <div className={styles.sections}>
          {(notes.sections || []).map((section, index) => (
            <div key={index} className={styles.section}>
              <h3 className={styles.sectionHeading}>
                <span className={styles.sectionNumber}>{index + 1}</span>
                {section.heading}
              </h3>
              <p className={styles.sectionContent}>{section.content}</p>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className={styles.actions}>
          <button
            className={styles.quizBtn}
            onClick={() => navigate(`/module/${moduleId}`)}
          >
            🧠 Ready to take the Quiz?
          </button>
        </div>

      </div>
    </PageLayout>
  );
}

export default Notes;