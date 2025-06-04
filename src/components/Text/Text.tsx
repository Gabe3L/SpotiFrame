import styles from "./Text.module.css";

export function Text() {
  return (
    <div className={styles.textBox}>
      <span className={styles.title}>Loading...</span>
      <span className={styles.artist}>Loading...</span>
    </div>
  );
}
