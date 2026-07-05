import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import styles from "./Trail.module.css";

const mockTrail = {
  1: {
    title: "Python Fundamentals",
    icon: "🐍",
    description: "Master the basics of Python programming from scratch.",
    totalModules: 4,
    completedModules: 1,
    modules: [
      { id: 101, title: "Introduction to Python", duration: "30 mins", status: "completed" },
      { id: 102, title: "Variables & Data Types", duration: "45 mins", status: "in-progress" },
      { id: 103, title: "Control Flow", duration: "60 mins", status: "locked" },
      { id: 104, title: "Functions", duration: "60 mins", status: "locked" },
    ],
  },
  2: {
    title: "Data Structures & Algorithms",
    icon: "🧩",
    description: "Learn essential data structures and algorithmic thinking.",
    totalModules: 4,
    completedModules: 0,
    modules: [
      { id: 201, title: "Arrays & Strings", duration: "45 mins", status: "in-progress" },
      { id: 202, title: "Linked Lists", duration: "60 mins", status: "locked" },
      { id: 203, title: "Stacks & Queues", duration: "60 mins", status: "locked" },
      { id: 204, title: "Trees & Graphs", duration: "90 mins", status: "locked" },
    ],
  },
};

const statusConfig = {
  completed: { icon: "✅", label: "Completed", color: "#16a34a" },
  "in-progress": { icon: "▶️", label: "In Progress", color: "#4f46e5" },
  locked: { icon: "🔒", label: "Locked", color: "#94a3b8" },
};

function Trail() {
  const { trailId } = useParams();
  const navigate = useNavigate();
  const trail = mockTrail[trailId];

  if (!trail) {
    return (
      <PageLayout>
        <div>Trail not found.</div>
      </PageLayout>
    );
  }

  const progress = Math.round((trail.completedModules / trail.totalModules) * 100);

  const handleModuleClick = (module) => {
    if (module.status !== "locked") {
      navigate(`/module/${module.id}`);
    }
  };

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* Trail Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.icon}>{trail.icon}</span>
            <div>
              <h2 className={styles.title}>{trail.title}</h2>
              <p className={styles.description}>{trail.description}</p>
            </div>
          </div>
          <div className={styles.progressBox}>
            <p className={styles.progressLabel}>{progress}% Complete</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={styles.progressSub}>
              {trail.completedModules} of {trail.totalModules} modules done
            </p>
          </div>
        </div>

        {/* Module List */}
        <div className={styles.moduleList}>
          <h3 className={styles.sectionTitle}>Modules</h3>
          {trail.modules.map((module, index) => {
            const config = statusConfig[module.status];
            return (
              <div
                key={module.id}
                className={`${styles.moduleCard} ${module.status === "locked" ? styles.locked : styles.clickable}`}
                onClick={() => handleModuleClick(module)}
              >
                <div className={styles.moduleNumber}>{index + 1}</div>
                <div className={styles.moduleInfo}>
                  <h4 className={styles.moduleTitle}>{module.title}</h4>
                  <p className={styles.moduleDuration}>⏱ {module.duration}</p>
                </div>
                <div className={styles.moduleStatus} style={{ color: config.color }}>
                  <span>{config.icon}</span>
                  <span className={styles.statusLabel}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </PageLayout>
  );
}

export default Trail;