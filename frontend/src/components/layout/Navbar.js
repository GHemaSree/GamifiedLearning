import styles from "./Navbar.module.css";

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🎓</span>
        <span className={styles.logoText}>TrailForge</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.notification}>🔔</button>
        <div className={styles.avatar}>H</div>
      </div>
    </nav>
  );
}

export default Navbar;