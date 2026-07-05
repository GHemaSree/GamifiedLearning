import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";

function Navbar() {
  const { user } = useAuth();

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🎓</span>
        <span className={styles.logoText}>TrailForge</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.notification}>🔔</button>
        <div className={styles.avatar}>{initial}</div>
      </div>
    </nav>
  );
}

export default Navbar;