import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getTrailById, createTrail, generateNextModule } from "../../api/trailApi";
import { getTopicById } from "../../api/topicsApi";
import { getMyProgress } from "../../api/progressApi";
import styles from "./Trail.module.css";

function Trail() {
  const { trailId } = useParams();
  const navigate = useNavigate();
  const isPreview = trailId.startsWith("preview-");
  const topicId = isPreview ? trailId.replace("preview-", "") : null;

  const [data, setData] = useState(null);
  const [topic, setTopic] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const topicData = await getTopicById(topicId);
        setTopic(topicData);
      } catch (err) {
        setError("Topic not found.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRealTrail = async () => {
      try {
        setLoading(true);
        const [trailResult, progressResult] = await Promise.all([
          getTrailById(trailId),
          getMyProgress(),
        ]);
        setData(trailResult);
        setProgress(progressResult.progress);
      } catch (err) {
        setError("Trail not found.");
      } finally {
        setLoading(false);
      }
    };

    if (isPreview) {
      fetchPreview();
    } else {
      fetchRealTrail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailId]);

  const handleStartFirstConcept = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const trailData = await createTrail(topicId); // real trail created NOW
      const moduleResult = await generateNextModule(trailData.trail._id);
      if (moduleResult.module) {
        navigate(`/module/${moduleResult.module._id}`);
      }
    } catch (err) {
      alert("Failed to start this topic. Please try again.");
      setGenerating(false);
    }
  };

  const handleClick = async (item, index) => {
    if (item.status === "locked") return;

    if (isPreview && index === 0) {
      handleStartFirstConcept();
      return;
    }

    if (item.pendingGeneration) {
      if (generating) return;
      setGenerating(true);
      try {
        const result = await generateNextModule(trailId);
        if (result.module) {
          navigate(`/module/${result.module._id}`);
        }
      } catch (err) {
        alert("Failed to start this module. Please try again.");
        setGenerating(false);
      }
      return;
    }

    navigate(`/module/${item._id}`);
  };

  if (loading || (!isPreview && !data) || (isPreview && !topic)) {
    return (
      <PageLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Synthesizing Roadmap Quest...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </PageLayout>
    );
  }

  // Resolve references depending on preview mode
  const currentTopic = isPreview ? topic : data.trail.topic;
  const conceptsData = isPreview ? topic.concepts : data.concepts;
  const modulesData = isPreview ? [] : data.modules;

  const sortedConcepts = [...conceptsData].sort((a, b) => a.order - b.order);

  let blocked = false;
  const mergedList = sortedConcepts.map((concept, i) => {
    if (isPreview) {
      const status = i === 0 ? "in_progress" : "locked";
      return { concept: concept.name, status, pendingGeneration: i === 0 };
    }

    const matchingModule = modulesData.find((m) => m.concept === concept.name);
    if (matchingModule) {
      const progressEntry = progress.find((p) => p.module?._id === matchingModule._id);
      const status = progressEntry?.completionStatus || "in_progress";
      if (status !== "completed") blocked = true;
      return { ...matchingModule, status };
    }

    if (!blocked && data.trail.status !== "completed") {
      blocked = true;
      return { concept: concept.name, status: "in_progress", pendingGeneration: true };
    }

    return { concept: concept.name, status: "locked" };
  });

  const completedCount = isPreview ? 0 : mergedList.filter((m) => m.status === "completed").length;
  const totalCount = sortedConcepts.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statusDisplay = (status) => {
    if (status === "completed") return { icon: "✅", label: "Mastered" };
    if (status === "in_progress") return { icon: "⚔️", label: "Active" };
    return { icon: "🔒", label: "Locked" };
  };

  return (
    <PageLayout>
      <div className={styles.page}>
        {!isPreview && data.trail.status === "completed" && (
          <div className={styles.completionBanner}>
            🎉 Quest Complete! You have mastered the entire {data.trail.title} Campaign!
          </div>
        )}

        {/* Quest Info Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.icon}>{currentTopic.icon || "🗺️"}</div>
            <div>
              <div className={styles.title}>{isPreview ? currentTopic.title : data.trail.title}</div>
              <div className={styles.description}>{currentTopic.description}</div>
            </div>
          </div>

          <div className={styles.progressBox}>
            <div className={styles.progressLabel}>Campaign Cleared: {progressPercent}%</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>
            <div className={styles.progressSub}>
              {completedCount} of {totalCount} checkpoints completed
            </div>
          </div>
        </div>

        {/* Winding Roadmap Pathway */}
        <div className={styles.roadmapSection}>
          <h3 className={styles.sectionTitle}>Campaign Roadmap</h3>

          <div className={styles.roadmap}>
            {mergedList.map((item, i) => {
              const status = statusDisplay(item.status);
              const clickable = item.status !== "locked";

              // Position alignment: Left, Center, Right, Center (creates winding path)
              const posClass =
                i % 4 === 0 ? styles.posLeft :
                i % 4 === 1 || i % 4 === 3 ? styles.posCenter :
                styles.posRight;

              const nodeStatusClass =
                item.status === "completed" ? styles.nodeCompleted :
                item.status === "in_progress" ? styles.nodeInProgress :
                styles.nodeLocked;

              return (
                <div key={i} className={`${styles.nodeWrapper} ${posClass}`}>
                  {/* Decorative connection lines */}
                  {i < mergedList.length - 1 && (
                    <div
                      className={`${styles.connector} ${
                        i % 4 === 0 ? styles.connectorSlopeRight :
                        i % 4 === 1 ? styles.connectorSlopeRight :
                        i % 4 === 2 ? styles.connectorSlopeLeft :
                        styles.connectorSlopeLeft
                      }`}
                    />
                  )}

                  <div
                    className={`${styles.roadmapNode} ${nodeStatusClass} ${
                      clickable ? styles.clickable : ""
                    }`}
                    onClick={() => handleClick(item, i)}
                  >
                    <div className={styles.nodeCircle}>
                      {item.status === "completed" ? "✓" : i + 1}
                    </div>
                    <div className={styles.nodeContent}>
                      <h4 className={styles.nodeTitle}>
                        {item.pendingGeneration || item.status === "locked" ? item.concept : item.title}
                      </h4>
                      {!item.pendingGeneration && item.status !== "locked" && (
                        <span className={styles.nodeDuration}>⏱ {item.duration} mins</span>
                      )}
                      <div className={styles.nodeStatusBadge}>
                        {status.icon} {status.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Trail;