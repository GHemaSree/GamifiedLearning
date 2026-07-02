import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import styles from "./PageLayout.module.css";

function PageLayout({ children }) {
  return (
    <div className={styles.root}>
      <Navbar />
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

export default PageLayout;