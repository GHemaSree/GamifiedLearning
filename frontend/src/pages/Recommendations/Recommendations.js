import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getRecommendations, refreshRecommendations } from "../../api/recommendationsApi";
import styles from "./Recommendations.module.css";

function Recommendations() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getRecommendations();
      setData(result);
    } catch (err) {
      setError("Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const result = await refreshRecommendations();
      setData(result);
    } catch (err) {
      setError("Failed to refresh recommendations.");
    } finally {
      setRefreshing(false);
    }
  };

  const getMasteryColor = (mastery) => {
    if (mastery >= 70) return "#16a34a";
    if (mastery >= 50) return "#d97706";
    return "#dc2626";
  };

  if (loading) return <PageLayout><div>Loading recommendations...</div></PageLayout>;
  if (error) return <PageLayout><div>{error}</div></PageLayout>;

  const conceptsToRevise = data?.conceptsToRevise || [];
  const suggestedRevision = data?.suggestedRevision || [];
  const nextTopics = data?.nextTopics || [];

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

        {/* Concepts to Revise */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>⚠️ Concepts to Revise</h3>
            <span className={styles.sectionBadge}>Based on quiz performance</span>
          </div>
          {conceptsToRevise.length === 0 && (
            <p>Nothing to revise right now — keep it up!</p>
          )}
          <div className={styles.weakList}>
            {conceptsToRevise.map((item, i) => (
              <div key={i} className={styles.weakCard}>
                <div className={styles.weakIcon}>{item.topicIcon || "📘"}</div>
                <div className={styles.weakInfo}>
                  <p className={styles.weakConcept}>{item.concept}</p>
                  <p className={styles.weakTopic}>{item.topicTitle}</p>
                  <div className={styles.masteryBar}>
                    <div
                      className={styles.masteryFill}
                      style={{
                        width: `${item.masteryPercent}%`,
                        backgroundColor: getMasteryColor(item.masteryPercent),
                      }}
                    />
                  </div>
                </div>
                <div className={styles.masteryScore}>
                  <span style={{ color: getMasteryColor(item.masteryPercent) }}>
                    {item.masteryPercent}%
                  </span>
                  <span className={styles.masteryLabel}>mastery</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Revision */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>🔄 Suggested Revision</h3>
            <span className={styles.sectionBadge}>Modules to revisit</span>
          </div>
          {suggestedRevision.length === 0 ? (
            <p>Take a few quizzes and we'll flag anything worth revisiting.</p>
          ) : (
            <div className={styles.revisionList}>
              {suggestedRevision.map((module, i) => (
                <div
                  key={i}
                  className={styles.revisionCard}
                  onClick={() => navigate(`/module/${module.moduleId}`)}
                >
                  <div className={styles.revisionIcon}>📘</div>
                  <div className={styles.revisionInfo}>
                    <p className={styles.revisionTitle}>{module.moduleTitle}</p>
                    <p className={styles.revisionTrail}>{module.trailTitle}</p>
                  </div>
                  <div className={styles.revisionScore}>
                    <span className={styles.scoreBadge}>Last: {module.lastScore}%</span>
                    <span className={styles.revisionArrow}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Next Topics — AI powered */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>🚀 Recommended Next Topics</h3>
            <span className={styles.sectionBadge}>AI powered suggestions</span>
          </div>
          {nextTopics.length === 0 ? (
            <p>Complete a topic and we'll suggest what to learn next.</p>
          ) : (
            <div className={styles.nextList}>
              {nextTopics.map((topic, i) => (
                <div
                  key={i}
                  className={styles.nextCard}
                  onClick={() => topic.topicId && navigate(`/topics`)}
                >
                  <div className={styles.nextIcon}>{topic.icon}</div>
                  <div className={styles.nextInfo}>
                    <p className={styles.nextTitle}>{topic.title}</p>
                    <p className={styles.nextCategory}>{topic.category}</p>
                    <p className={styles.nextReason}>{topic.reason}</p>
                  </div>
                  <div className={styles.nextMeta}>
                    <span className={styles.levelBadge}>{topic.level}</span>
                    {topic.confidence != null && (
                      <span className={styles.confidenceBadge}>
                        {topic.confidence}% 
                      </span>
                    )}
                    <span className={styles.nextArrow}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            className={styles.quizBtn}
            style={{ marginTop: "12px" }}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh Suggestions"}
          </button>
        </div>

      </div>
    </PageLayout>
  );
}

export default Recommendations;