import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";

const mockNotifications = [
  { id: 1, icon: "🏆", message: "You earned the 'First Step' badge!", time: "2 hours ago", unread: true },
  { id: 2, icon: "✨", message: "New recommendations available for you", time: "5 hours ago", unread: true },
  { id: 3, icon: "🧠", message: "Quiz result: Introduction to Python — 80%", time: "2 days ago", unread: false },
  { id: 4, icon: "🔥", message: "You're on a 7-day streak! Keep it up!", time: "3 days ago", unread: false },
];

const LEVEL_THRESHOLDS = [0, 500, 1000, 2000, 3500, 5000];

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Theme Toggle Button */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className={styles.notificationWrapper} ref={dropdownRef}>
          <button
            className={styles.notification}
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            🔔
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>


          {showNotifications && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h4 className={styles.dropdownTitle}>Notifications</h4>
                <span className={styles.unreadLabel}>{unreadCount} new</span>
              </div>
              <div className={styles.dropdownList}>
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${n.unread ? styles.unread : ""}`}
                  >
                    <span className={styles.notifIcon}>{n.icon}</span>
                    <div className={styles.notifInfo}>
                      <p className={styles.notifMessage}>{n.message}</p>
                      <p className={styles.notifTime}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={styles.avatar}
          onClick={() => navigate("/profile")}
          title="View Profile"
        >
          {initial}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;