import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyTrails, getTrailByTopic } from "../../api/trailApi";
import { getMyProgress } from "../../api/progressApi";
import styles from "./Progress.module.css";

const levelThresholds = [0, 500, 1000, 2000, 3500, 5000];

const formatTimeAgo = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
};

function Progress() {
  const { user } = useAuth();
  const [trails, setTrails] = useState([]);
  const [quizStats, setQuizStats] = useState({ totalQuizzesTaken: 0, averageScore: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [mastery, setMastery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleReviewConcept = async (topicId) => {
    if (!topicId) return;
    try {
      const existingTrail = await getTrailByTopic(topicId);
      navigate(`/trail/${existingTrail._id}`);
    } catch (err) {
      navigate(`/trail/preview-${topicId}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trailsData, progressData] = await Promise.all([
          getMyTrails(),
          getMyProgress(),
        ]);
        setTrails(trailsData);
        setQuizStats({
          totalQuizzesTaken: progressData.totalQuizzesTaken,
          averageScore: progressData.averageScore,
        });
        setRecentActivity(progressData.recentActivity || []);
        setMastery(progressData.mastery || []);
      } catch (err) {
        setError("Failed to load progress.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLayout><div>Loading progress...</div></PageLayout>;
  if (error) return <PageLayout><div>{error}</div></PageLayout>;

  const totalModulesCompleted = trails.reduce((sum, t) => sum + t.modulesCompleted, 0);

  const totalXp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;

  const currentLevelXp = levelThresholds[level - 1] ?? 0;
  const nextLevelXp = levelThresholds[level] ?? currentLevelXp + 1000;
  const xpPercent = Math.round(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

  // Calculate average DKT mastery percentage
  const averageMastery = mastery.length > 0
    ? Math.round(
        (mastery.reduce(
          (sum, m) => sum + (m[m.currentDifficulty || "beginner"] || 0.5),
          0
        ) /
          mastery.length) *
          100
      )
    : 0;

  // Get Top 3 Strengths & Top 3 Focus Areas
  const sortedMastery = [...mastery].sort((a, b) => {
    const scoreA = a[a.currentDifficulty || "beginner"] || 0.5;
    const scoreB = b[b.currentDifficulty || "beginner"] || 0.5;
    return scoreB - scoreA;
  });

  const strengths = sortedMastery.slice(0, 3);
  const focusAreas = sortedMastery
    .slice()
    .reverse()
    .filter((m) => !strengths.map(s => s._id).includes(m._id))
    .slice(0, 3);

  // Dynamic Rank based on DKT index using standard Bronze/Silver/Gold/Diamond rank names
  let masteryRank = "Bronze Rank 🥉";
  if (averageMastery >= 85) masteryRank = "Diamond Rank 💎";
  else if (averageMastery >= 70) masteryRank = "Gold Rank 🥇";
  else if (averageMastery >= 50) masteryRank = "Silver Rank 🥈";

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Minimal Hero Level Header Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <h2 className={styles.bannerTitle}>Level {level} Learner</h2>
            <p className={styles.bannerSub}>XP: {totalXp} • {streak} Day Streak 🔥</p>
          </div>
        </div>

        {/* Unified Mastery index card */}
        <div className={styles.masterySection}>
          {mastery.length === 0 ? (
            <p className={styles.noDataText}>No mastery data calculated yet. Take a quiz to initiate DKT tracking!</p>
          ) : (
            <div className={styles.unifiedContainer}>
              
              {/* Upper Section: Gauge + Core Info */}
              <div className={styles.upperMasteryRow}>
                {/* Left Side: Circular progress gauge */}
                <div className={styles.gaugeContainer}>
                  <svg width="185" height="185" className={styles.gaugeSvg}>
                    <circle
                      cx="92.5"
                      cy="92.5"
                      r="75"
                      className={styles.gaugeBg}
                    />
                    <circle
                      cx="92.5"
                      cy="92.5"
                      r="75"
                      className={styles.gaugeFill}
                      strokeDasharray="471.2"
                      strokeDashoffset={471.2 - (471.2 * averageMastery) / 100}
                    />
                  </svg>
                  <div className={styles.gaugeTextContainer}>
                    <span className={styles.gaugeValue}>{averageMastery}%</span>
                    <span className={styles.gaugeLabel}>Mastery Index</span>
                    <span className={styles.gaugeRank}>{masteryRank}</span>
                  </div>
                </div>

                {/* Right Side: Actionable Insight Lists */}
                <div className={styles.breakdownContainer}>
                  
                  {/* Core Strengths */}
                  <div className={styles.breakdownBlock}>
                    <h4 className={styles.breakdownTitle}>💪 Core Strengths</h4>
                    <div className={styles.breakdownList}>
                      {strengths.map((m, idx) => {
                        const currentDiff = m.currentDifficulty || "beginner";
                        const score = m[currentDiff] || 0.5;
                        return (
                          <div 
                            key={idx} 
                            className={`${styles.breakdownItemStatic} ${styles[currentDiff]}`}
                          >
                            <span className={styles.breakdownIcon}>{m.topic?.icon || "🧠"}</span>
                            <div className={styles.breakdownMeta}>
                              <span className={styles.breakdownName}>{m.concept}</span>
                              <span className={`${styles.breakdownBadge} ${styles[currentDiff]}`}>
                                {Math.round(score * 100)}% ({currentDiff.toUpperCase()})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div className={styles.breakdownBlock}>
                    <h4 className={styles.breakdownTitle}>⚠️ Focus Areas</h4>
                    <div className={styles.breakdownList}>
                      {focusAreas.length === 0 ? (
                        <p className={styles.noFocusText}>All concepts at max level! 🎉</p>
                      ) : (
                        focusAreas.map((m, idx) => {
                          const currentDiff = m.currentDifficulty || "beginner";
                          const score = m[currentDiff] || 0.5;
                          return (
                            <div 
                              key={idx} 
                              className={`${styles.breakdownItem} ${styles[currentDiff]}`}
                              onClick={() => handleReviewConcept(m.topic?._id)}
                            >
                              <span className={styles.breakdownIcon}>{m.topic?.icon || "🧠"}</span>
                              <div className={styles.breakdownMeta}>
                                <span className={styles.breakdownName}>{m.concept}</span>
                                <span className={`${styles.breakdownBadge} ${styles[currentDiff]}`}>
                                  {Math.round(score * 100)}% ({currentDiff.toUpperCase()})
                                </span>
                              </div>
                              <span className={styles.breakdownAction}>Practice ⚔️</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Lower Section: Milestone Progress Track */}
              <div className={styles.roadmapContainer}>
                <div className={styles.roadmapLineOuter}>
                  <div className={styles.roadmapLineInner} style={{ width: `${averageMastery}%` }} />
                  
                  {/* Node 1: Bronze (25%) */}
                  <div className={`${styles.roadmapNode} ${averageMastery >= 25 ? styles.nodeCompleted : ""}`} style={{ left: "25%" }}>
                    <span className={styles.nodeIcon}>🥉</span>
                    <span className={styles.nodeLabel}>Bronze (25%)</span>
                  </div>

                  {/* Node 2: Silver (50%) */}
                  <div className={`${styles.roadmapNode} ${averageMastery >= 50 ? styles.nodeCompleted : ""}`} style={{ left: "50%" }}>
                    <span className={styles.nodeIcon}>🥈</span>
                    <span className={styles.nodeLabel}>Silver (50%)</span>
                  </div>

                  {/* Node 3: Gold (75%) */}
                  <div className={`${styles.roadmapNode} ${averageMastery >= 75 ? styles.nodeCompleted : ""}`} style={{ left: "75%" }}>
                    <span className={styles.nodeIcon}>🥇</span>
                    <span className={styles.nodeLabel}>Gold (75%)</span>
                  </div>

                  {/* Node 4: Diamond (95%) */}
                  <div className={`${styles.roadmapNode} ${averageMastery >= 95 ? styles.nodeCompleted : ""}`} style={{ left: "95%" }}>
                    <span className={styles.nodeIcon}>💎</span>
                    <span className={styles.nodeLabel}>Diamond (95%)</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p>No activity yet — complete a module or take a quiz to get started.</p>
          ) : (
            <div className={styles.activityList}>
              {recentActivity.map((activity, i) => (
                <div key={i} className={styles.activityCard}>
                  <div className={styles.activityIcon}>
                    {activity.type === "quiz_taken" ? "🧠" : "📘"}
                  </div>
                  <div className={styles.activityInfo}>
                    {activity.type === "quiz_taken" ? (
                      <>
                        <p className={styles.activityTitle}>
                          Took Quiz: {activity.moduleTitle}
                        </p>
                        <p className={styles.activityMeta}>
                          Score: {activity.score}% {activity.passed ? "· Passed" : "· Not Passed"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className={styles.activityTitle}>
                          Completed: {activity.moduleTitle}
                        </p>
                        <p className={styles.activityMeta}>{activity.trailTitle}</p>
                      </>
                    )}
                  </div>
                  <span className={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
}

export default Progress;