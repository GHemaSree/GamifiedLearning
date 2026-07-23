import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getModuleById, getFullNotes } from "../../api/moduleApi";
import styles from "./Notes.module.css";

function Notes() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [moduleInfo, setModuleInfo] = useState(null);
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const [moduleData, notesData] = await Promise.all([
          getModuleById(moduleId),
          getFullNotes(moduleId),
        ]);
        setModuleInfo(moduleData);
        setNotes(notesData);
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

  if (error || !notes || !moduleInfo) {
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
          <p className={styles.trailTitle}>{moduleInfo.trailTitle}</p>
        </div>

        {/* Title */}
        <div className={styles.titleRow}>
          <span className={styles.icon}>{moduleInfo.icon || "📘"}</span>
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
{/* Bonus Challenges */}
        {notes.gamifiedExamples && notes.gamifiedExamples.length > 0 && (
          <div className={styles.gamifiedSection}>
            <h3 className={styles.gamifiedTitle}>🎮 Bonus Challenges</h3>
            <div className={styles.gamifiedList}>
              {notes.gamifiedExamples.map((example, index) => (
                <div key={index} className={styles.gamifiedCard}>
                  <span className={styles.gamifiedBadge}>Quest {index + 1}</span>
                  <p className={styles.gamifiedText}>{example}</p>
                </div>
              ))}
            </div>
          </div>
        )}


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