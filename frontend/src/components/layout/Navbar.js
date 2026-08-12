import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";

const LEVEL_THRESHOLDS = [0, 500, 1000, 2000, 3500, 5000];

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level] ?? currentLevelXp + 1000;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
  );

  return (
    <nav className={styles.navbar}>
      <div
        className={styles.logo}
        onClick={() => navigate("/dashboard")}
        style={{ cursor: "pointer" }}
      >
        <span className={styles.logoIcon}>🎓</span>
        <span className={styles.logoText}>TrailForge</span>
      </div>

      <div className={styles.actions}>
        {/* Level and Streak HUD */}
        {user?.role !== "admin" && (
          <div className={styles.hud}>
            <div className={styles.hudItem} title="Active Streak">
              <span className={styles.streakFlame}>🔥</span>
              <span className={styles.hudValue}>{streak}</span>
            </div>
            <div className={styles.hudItem} title="Current Level">
              <span className={styles.levelShield}>⭐</span>
              <span className={styles.hudValue}>Lvl {level}</span>
            </div>
            <div
              className={styles.xpWrapper}
              title={`${xp - currentLevelXp} / ${nextLevelXp - currentLevelXp} XP to Level ${level + 1}`}
            >
              <div className={styles.xpBar}>
                <div className={styles.xpFill} style={{ width: `${progressPercent}%` }} />
              </div>
              <span className={styles.xpText}>{xp} XP</span>
            </div>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div
          className={styles.avatar}
          onClick={() => {
            if (user?.role !== "admin") {
              navigate("/profile");
            }
          }}
          title={user?.role === "admin" ? "Admin Session" : "View Profile"}
        >
          {initial}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;