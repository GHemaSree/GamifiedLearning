import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Sidebar.module.css";

const navItems = [
  { path: "/dashboard", icon: "🏠", label: "Home Base" },
  { path: "/topics", icon: "🗺️", label: "World Map" },
  { path: "/progress", icon: "🏆", label: "Achievements" },
  { path: "/recommendations", icon: "✨", label: "Side Quests" },
  { path: "/profile", icon: "👤", label: "Character" },
];

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  let activeNavItems = [];
  if (user && user.role === "admin") {
    activeNavItems = [
      { path: "/dashboard", icon: "🏠", label: "Home Base" },
      { path: "/topics", icon: "🗺️", label: "World Map" },
      { path: "/admin/forge", icon: "⚔️", label: "Forge Topic" },
      { path: "/admin/inventory", icon: "📦", label: "Topics Inventory" },
      { path: "/admin/roster", icon: "👥", label: "Learner Roster" },
    ];
  } else {
    activeNavItems = [...navItems];
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {activeNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;