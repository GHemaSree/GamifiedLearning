import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import styles from "./Topics.module.css";

const mockTopics = [
  { id: 1, title: "Python Fundamentals", icon: "🐍", category: "Programming", level: "Beginner", modules: 8 },
  { id: 2, title: "Data Structures & Algorithms", icon: "🧩", category: "Computer Science", level: "Intermediate", modules: 12 },
  { id: 3, title: "React Development", icon: "⚛️", category: "Web Development", level: "Intermediate", modules: 10 },
  { id: 4, title: "Machine Learning", icon: "🤖", category: "AI & ML", level: "Advanced", modules: 15 },
  { id: 5, title: "Database Design", icon: "🗄️", category: "Backend", level: "Beginner", modules: 7 },
  { id: 6, title: "System Design", icon: "🏗️", category: "Architecture", level: "Advanced", modules: 9 },
];

const levelColors = {
  Beginner: "#16a34a",
  Intermediate: "#d97706",
  Advanced: "#dc2626",
};

function Topics() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = mockTopics.filter((topic) =>
    topic.title.toLowerCase().includes(search.toLowerCase()) ||
    topic.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleTopicClick = (topicId) => {
    navigate(`/trail/${topicId}`);
  };

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
              key={topic.id}
              className={styles.card}
              onClick={() => handleTopicClick(topic.id)}
            >
              <div className={styles.icon}>{topic.icon}</div>
              <div className={styles.info}>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                <p className={styles.category}>{topic.category}</p>
                <div className={styles.meta}>
                  <span
                    className={styles.level}
                    style={{ color: levelColors[topic.level] }}
                  >
                    ● {topic.level}
                  </span>
                  <span className={styles.modules}>{topic.modules} modules</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={styles.empty}>
            <p>No topics found for "{search}"</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Topics;