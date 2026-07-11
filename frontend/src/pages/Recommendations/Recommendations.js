import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import styles from "./Recommendations.module.css";

const mockRecommendations = {
  weakConcepts: [
    { id: 1, concept: "Control Flow", topic: "Python Fundamentals", mastery: 35, icon: "🐍" },
    { id: 2, concept: "Linked Lists", topic: "Data Structures & Algorithms", mastery: 28, icon: "🧩" },
    { id: 3, concept: "useEffect Hook", topic: "React Development", mastery: 42, icon: "⚛️" },
  ],
  nextTopics: [
    { id: 3, title: "React Development", icon: "⚛️", category: "Web Development", level: "Intermediate", reason: "Strong foundation in JavaScript detected" },
    { id: 4, title: "Machine Learning Basics", icon: "🤖", category: "AI & ML", level: "Intermediate", reason: "Python mastery above 70%" },
    { id: 5, title: "System Design", icon: "🏗️", category: "Architecture", level: "Advanced", reason: "Good progress in CS fundamentals" },
  ],
  revisionModules: [
    { id: 102, title: "Variables & Data Types", trail: "Python Fundamentals", icon: "🐍", score: 60 },
    { id: 202, title: "Linked Lists", trail: "Data Structures & Algorithms", icon: "🧩", score: 45 },
  ],
};

function Recommendations() {
  const navigate = useNavigate();
  const { weakConcepts, nextTopics, revisionModules } = mockRecommendations;

  const getMasteryColor = (mastery) => {
    if (mastery >= 70) return "#16a34a";
    if (mastery >= 50) return "#d97706";
    return "#dc2626";
  };

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>✨ For You</h2>
          <p className={styles.subtitle}>
            Personalized recommendations based on your learning progress
          </p>
        </div>

        {/* Weak Concepts */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>⚠️ Concepts to Revise</h3>
            <span className={styles.sectionBadge}>Based on quiz performance</span>
          </div>
          <div className={styles.weakList}>
            {weakConcepts.map((item) => (
              <div key={item.id} className={styles.weakCard}>
                <div className={styles.weakIcon}>{item.icon}</div>
                <div className={styles.weakInfo}>
                  <p className={styles.weakConcept}>{item.concept}</p>
                  <p className={styles.weakTopic}>{item.topic}</p>
                  <div className={styles.masteryBar}>
                    <div
                      className={styles.masteryFill}
                      style={{
                        width: `${item.mastery}%`,
                        backgroundColor: getMasteryColor(item.mastery),
                      }}
                    />
                  </div>
                </div>
                <div className={styles.masteryScore}>
                  <span style={{ color: getMasteryColor(item.mastery) }}>
                    {item.mastery}%
                  </span>
                  <span className={styles.masteryLabel}>mastery</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revision Modules */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>🔄 Suggested Revision</h3>
            <span className={styles.sectionBadge}>Modules to revisit</span>
          </div>
          <div className={styles.revisionList}>
            {revisionModules.map((module) => (
              <div
                key={module.id}
                className={styles.revisionCard}
                onClick={() => navigate(`/module/${module.id}`)}
              >
                <div className={styles.revisionIcon}>{module.icon}</div>
                <div className={styles.revisionInfo}>
                  <p className={styles.revisionTitle}>{module.title}</p>
                  <p className={styles.revisionTrail}>{module.trail}</p>
                </div>
                <div className={styles.revisionScore}>
                  <span className={styles.scoreBadge}>Last: {module.score}%</span>
                  <span className={styles.revisionArrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Topics */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>🚀 Recommended Next Topics</h3>
            <span className={styles.sectionBadge}>AI powered suggestions</span>
          </div>
          <div className={styles.nextList}>
            {nextTopics.map((topic) => (
              <div
                key={topic.id}
                className={styles.nextCard}
                onClick={() => navigate(`/trail/${topic.id}`)}
              >
                <div className={styles.nextIcon}>{topic.icon}</div>
                <div className={styles.nextInfo}>
                  <p className={styles.nextTitle}>{topic.title}</p>
                  <p className={styles.nextCategory}>{topic.category}</p>
                  <p className={styles.nextReason}>💡 {topic.reason}</p>
                </div>
                <div className={styles.nextMeta}>
                  <span className={styles.levelBadge}>{topic.level}</span>
                  <span className={styles.nextArrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

export default Recommendations;