import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { getTopics } from "../../api/topicsApi";
import { getTrailByTopic } from "../../api/trailApi";
import styles from "./Topics.module.css";

const levelColors = {
  Beginner: "#16a34a",
  Intermediate: "#d97706",
  Advanced: "#dc2626",
};

function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const data = await getTopics();
        setTopics(data);
      } catch (err) {
        setError("Failed to load topics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const filtered = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(search.toLowerCase()) ||
      (topic.description || "").toLowerCase().includes(search.toLowerCase())
  );

 const handleTopicClick = async (topicId) => {
  try {
    const existingTrail = await getTrailByTopic(topicId);
    navigate(`/trail/${existingTrail._id}`);
  } catch (err) {
    navigate(`/trail/preview-${topicId}`); // fake "trail id" that signals explore-only mode
  }
};

  if (loading) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <p>Loading topics...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <p>{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h2 className={styles.title}>Choose a Topic</h2>
          <p className={styles.subtitle}>Select a topic to generate your personalized learning trail</p>
        </div>

        <input
          type="text"
          placeholder="🔍 Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />

        <div className={styles.grid}>
          {filtered.map((topic) => (
            <div
              key={topic._id}
              className={styles.card}
              onClick={() => handleTopicClick(topic._id)}
            >
              <div className={styles.icon}>{topic.icon}</div>
              <div className={styles.info}>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                <p className={styles.category}>{topic.description}</p>
                <span style={{ color: levelColors[topic.level] }}>
                  {topic.level}
                </span>
                <span> · {topic.concepts?.length || 0} concepts</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <p>No topics found.</p>}
      </div>
    </PageLayout>
  );
}

export default Topics;