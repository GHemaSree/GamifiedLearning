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
      const trailData = await createTrail(topicId); // real trail created NOW, first commitment
      const moduleResult = await generateNextModule(trailData.trail._id);
      if (moduleResult.module) {
        navigate(`/module/${moduleResult.module._id}`);
      }
    } catch (err) {
      alert("Failed to start this topic. Please try again.");
      setGenerating(false);
    }
  };

  if (loading) return <PageLayout><p>Loading...</p></PageLayout>;
  if (error) return <PageLayout><p>{error}</p></PageLayout>;

  // ---- PREVIEW MODE: no trail exists, nothing generated, nothing written to DB ----
  if (isPreview) {
    const sortedConcepts = [...topic.concepts].sort((a, b) => a.order - b.order);

    return (
      <PageLayout>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.icon}>{topic.icon}</div>
              <div>
                <div className={styles.title}>{topic.title}</div>
                <div className={styles.description}>{topic.description}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>Modules</h3>
            <div className={styles.moduleList}>
              {sortedConcepts.map((concept, i) => (
                <div
                  key={i}
                  className={`${styles.moduleCard} ${i === 0 ? styles.clickable : styles.locked}`}
                  onClick={() => i === 0 && handleStartFirstConcept()}
                >
                  <div className={styles.moduleNumber}>{i + 1}</div>
                  <div className={styles.moduleInfo}>
                    <div className={styles.moduleTitle}>{concept.name}</div>
                  </div>
                  <div className={styles.moduleStatus}>
                    <span className={styles.statusLabel}>
                      {i === 0 ? (generating ? "▶️ Starting..." : "▶️ In Progress") : "🔒 Locked"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ---- REAL TRAIL MODE: trail exists, render as before ----
  const { trail, modules, concepts } = data;
  const sortedConcepts = [...concepts].sort((a, b) => a.order - b.order);

  let blocked = false;
  const mergedList = sortedConcepts.map((concept) => {
    const matchingModule = modules.find((m) => m.concept === concept.name);

    if (matchingModule) {
      const progressEntry = progress.find((p) => p.module?._id === matchingModule._id);
      const status = progressEntry?.completionStatus || "in_progress";
      if (status !== "completed") blocked = true;
      return { ...matchingModule, status };
    }

    if (!blocked && trail.status !== "completed") {
      blocked = true;
      return { concept: concept.name, status: "in_progress", pendingGeneration: true };
    }

    return { concept: concept.name, status: "locked" };
  });

  const completedCount = mergedList.filter((m) => m.status === "completed").length;
  const totalCount = sortedConcepts.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statusDisplay = (status) => {
    if (status === "completed") return { icon: "✅", label: "Completed" };
    if (status === "in_progress") return { icon: "▶️", label: "In Progress" };
    return { icon: "🔒", label: "Locked" };
  };

  const handleClick = async (item) => {
    if (item.status === "locked") return;

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

  return (
    <PageLayout>
      <div className={styles.page}>

        {trail.status === "completed" && (
          <div className={styles.completionBanner}>
            🎉 Trail Complete! You've mastered every concept in {trail.title}.
          </div>
        )}

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.icon}>{trail.topic?.icon || "📘"}</div>
            <div>
              <div className={styles.title}>{trail.title}</div>
              <div className={styles.description}>{trail.topic?.description}</div>
            </div>
          </div>

          <div className={styles.progressBox}>
            <div className={styles.progressLabel}>{progressPercent}% Complete</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>
            <div className={styles.progressSub}>
              {completedCount} of {totalCount} modules done
            </div>
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>Modules</h3>
          <div className={styles.moduleList}>
            {mergedList.map((item, i) => {
              const status = statusDisplay(item.status);
              const clickable = item.status !== "locked";
              return (
                <div
                  key={i}
                  className={`${styles.moduleCard} ${clickable ? styles.clickable : styles.locked}`}
                  onClick={() => handleClick(item)}
                >
                  <div className={styles.moduleNumber}>{i + 1}</div>
                  <div className={styles.moduleInfo}>
                    <div className={styles.moduleTitle}>
                      {item.pendingGeneration || item.status === "locked" ? item.concept : item.title}
                    </div>
                    {!item.pendingGeneration && item.status !== "locked" && (
                      <div className={styles.moduleDuration}>⏱ {item.duration} mins</div>
                    )}
                  </div>
                  <div className={styles.moduleStatus}>
                    <span className={styles.statusLabel}>{status.icon} {status.label}</span>
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