import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getModuleById, getFullNotes, submitQuestAnswer, getQuestAttempts } from "../../api/moduleApi";
import { useAuth } from "../../context/AuthContext";
import styles from "./Notes.module.css";

function Notes() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();

  const [moduleInfo, setModuleInfo] = useState(null);
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quest state — keyed by questIndex
  const [answers, setAnswers] = useState({});           // { [idx]: string }
  const [submitting, setSubmitting] = useState({});     // { [idx]: bool }
  const [results, setResults] = useState({});           // { [idx]: { isCorrect, feedback, xpAwarded } }
  const [expandedQuest, setExpandedQuest] = useState(null);

  const fetchedNotesFor = useRef(null);

  useEffect(() => {
    if (!moduleId) return;
    if (fetchedNotesFor.current === moduleId) return;
    fetchedNotesFor.current = moduleId;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [moduleData, notesData, attemptsData] = await Promise.all([
          getModuleById(moduleId),
          getFullNotes(moduleId),
          getQuestAttempts(moduleId),
        ]);
        setModuleInfo(moduleData);
        setNotes(notesData);

        // Pre-populate results for already-attempted quests
        if (attemptsData && attemptsData.length > 0) {
          const preloaded = {};
          attemptsData.forEach((a) => {
            preloaded[a.questIndex] = {
              isCorrect:   a.isCorrect,
              feedback:    a.feedback,
              xpAwarded:   a.xpAwarded,
              alreadyDone: true,
            };
          });
          setResults(preloaded);
        }
      } catch (err) {
        console.error("Failed to load full notes:", err);
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Notes not found."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [moduleId]);

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async (index) => {
    const answer = answers[index]?.trim();
    if (!answer) return;

    setSubmitting((prev) => ({ ...prev, [index]: true }));
    try {
      const result = await submitQuestAnswer(moduleId, index, answer);
      setResults((prev) => ({ ...prev, [index]: result }));

      // Refresh auth user so XP/level updates in the header
      if (result.isCorrect && user) {
        refreshUser({ ...user, xp: result.totalXp, level: result.level });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to evaluate. Try again.";
      // If already attempted, treat it like a pre-loaded result
      if (err.response?.status === 409) {
        setResults((prev) => ({
          ...prev,
          [index]: { ...err.response.data, alreadyDone: true },
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          [index]: { isCorrect: false, feedback: msg, xpAwarded: 0, submitError: true },
        }));
      }
    } finally {
      setSubmitting((prev) => ({ ...prev, [index]: false }));
    }
  };

  const xpForDifficulty = (difficulty) => {
    if (difficulty === "advanced") return 40;
    if (difficulty === "intermediate") return 25;
    return 15;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Generating your full notes…</p>
        </div>
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

  const difficulty = moduleInfo.difficulty || "intermediate";
  const xpReward = xpForDifficulty(difficulty);

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
            <div className={styles.gamifiedHeader}>
              <h3 className={styles.gamifiedTitle}>🎮 Bonus Challenges</h3>
              <p className={styles.gamifiedSubtitle}>
                Answer these quests to earn XP. You get one shot — make it count!
              </p>
            </div>

            <div className={styles.gamifiedList}>
              {notes.gamifiedExamples.map((example, index) => {
                const result = results[index];
                const isSubmitted = !!result;
                const isOpen = expandedQuest === index;
                const isLoading = submitting[index];

                return (
                  <div
                    key={index}
                    className={`${styles.gamifiedCard} ${
                      isSubmitted
                        ? result.isCorrect
                          ? styles.cardCorrect
                          : styles.cardWrong
                        : ""
                    }`}
                  >
                    {/* Quest Header Row */}
                    <div className={styles.questHeader}>
                      <div className={styles.questLeft}>
                        <span className={styles.gamifiedBadge}>Quest {index + 1}</span>
                        {isSubmitted && (
                          <span className={result.isCorrect ? styles.correctBadge : styles.wrongBadge}>
                            {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                        )}
                      </div>
                      <div className={styles.questRight}>
                        <span className={styles.xpPill}>
                          ⭐ +{xpReward} XP
                        </span>
                        {!isSubmitted && (
                          <button
                            className={styles.toggleBtn}
                            onClick={() => setExpandedQuest(isOpen ? null : index)}
                          >
                            {isOpen ? "Collapse ▲" : "Answer ▼"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quest Text */}
                    <p className={styles.gamifiedText}>{example}</p>

                    {/* Answer Panel — open when not yet submitted */}
                    {!isSubmitted && isOpen && (
                      <div className={styles.answerPanel}>
                        <label className={styles.answerLabel}>Write your answer</label>
                        <textarea
                          className={styles.answerInput}
                          rows={3}
                          placeholder="Type your answer here..."
                          value={answers[index] || ""}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          disabled={isLoading}
                        />
                        <div className={styles.answerActions}>
                          <button
                            className={styles.skipBtn}
                            onClick={() => setExpandedQuest(null)}
                            disabled={isLoading}
                          >
                            ▷▷ Skip
                          </button>
                          <button
                            className={styles.submitBtn}
                            onClick={() => handleSubmit(index)}
                            disabled={isLoading || !answers[index]?.trim()}
                          >
                            {isLoading ? (
                              <span className={styles.btnSpinner} />
                            ) : (
                              "✦ Check Answer"
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Result Panel — shown after submission */}
                    {isSubmitted && (
                      <div className={`${styles.resultPanel} ${result.isCorrect ? styles.resultCorrect : styles.resultWrong}`}>
                        <div className={styles.resultIcon}>
                          {result.isCorrect ? "🏆" : "💡"}
                        </div>
                        <div className={styles.resultBody}>
                          <p className={styles.resultTitle}>
                            {result.isCorrect
                              ? `Great job! +${result.xpAwarded} XP earned`
                              : "Not quite — here's the correction:"}
                          </p>
                          <p className={styles.resultFeedback}>{result.feedback}</p>
                          {result.alreadyDone && (
                            <p className={styles.alreadyNote}>You already attempted this quest.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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